import { OBJECTS_COLUMN_DEFINITIONS } from "../constants";
import { BigInt, Bit, Char, Int, SmallInt, TinyInt, Varchar } from '../dataTypes';

/**
 * @typedef {import("../constants").ColumnType} ColumnType
 */

/**
 * @class PageRecord
 * @param {String} data
 * @param {Number} recordStart
 * @param {Number} recordType - 1 = data record | 2 = index record
 * @param {String} [objectName] - name of the object represented on this page. Default: objects
 */
function PageRecord(data, recordStart, recordType, objectName = 'objects') {

  this.recordType = recordType;
  this.objectName = objectName;
  this.recordStart = recordStart;
  this.record = parseRecord(this.recordType);

  function parseRecord(recordType) {
    switch (recordType) {
      case 1:
        return new DataRecord(data, recordStart, objectName);
    }
  }
}

export default PageRecord;

/**
 * @class DataRecord
 * @param {String} data 
 * @param {Number} recordStart 
 * @param {String} objectName
 */
function DataRecord(data, recordStart, objectName) {

  this.objectName = objectName
  this.nullBitmapOffset = parseNullBitmapOffset();
  this.nullBitmapSize = parseNullBitmapSize(this.nullBitmapOffset);
  this.fixedLengthColumnDefinitions = getFixedLengthColumnDefinitions(this.objectName);
  this.variableLengthColumnDefinitions = getVariableLengthColumnDefinitions(this.objectName);
  this.nullBitmap = parseNullBitmap(this.nullBitmapOffset, this.nullBitmapSize);
  this.columns = parseColumns(this.nullBitmapOffset, this.nullBitmapSize, this.nullBitmap, this.fixedLengthColumnDefinitions, this.variableLengthColumnDefinitions);

  this.updateColumn = (columnIndex, newValue) => {
    this.columns[columnIndex].update(newValue);
  }

  /**
   * gets the column definitions from the buffer pool, unless it's the system table `objects`
   * @method getFixedLengthColumnDefinitions
   * @param {String} objectName
   * @returns {Array<ColumnType>} An array of `ColumnType`s
   */
  function getFixedLengthColumnDefinitions(objectName) {
    if (objectName === 'objects') {
      return OBJECTS_COLUMN_DEFINITIONS.filter(col => {
        return col.isVariable === false;
      })
      .sort((a, b) => a.order - b.order);
    } else {
      return [];
    }
  }

  /**
   * gets the column definitions from the buffer pool, unless it's the system table `objects`
   * @method getVariableLengthColumnDefinitions
   * @param {String} objectName
   * @returns {Array<ColumnType>}
   */
  function getVariableLengthColumnDefinitions(objectName) {
    if (objectName === 'objects') {
      return OBJECTS_COLUMN_DEFINITIONS.filter(col => {
        return col.isVariable === true;
      })
      .sort((a, b) => a.order - b.order);
    } else {
      return [];
    }
  }

  function parseNullBitmapOffset() {
    return Number(data.substring(recordStart, recordStart + 4));
  }

  function parseNullBitmapSize(nullBitmapOffset) {
    return Number(data.substring(recordStart + nullBitmapOffset, recordStart + nullBitmapOffset + 2));
  }

  function parseNullBitmap(nullBitmapOffset, nullBitmapSize) {
    const nullBitmapText = data.substring(recordStart + nullBitmapOffset + 2, recordStart + nullBitmapOffset + nullBitmapSize);

    const nullFlags = [];

    let index = 1;
    for (let char of nullBitmapText) {
      const flag = {
        isNull: Number(char) === 1,
        order: index
      }
      nullFlags.push(flag);
      index++;
    }

    return nullFlags;
  }

  function parseColumns(nullBitmapOffset, nullBitmapSize, nullBitmap, fixedLengthColumnDefinitions, variableLengthColumnDefinitions) {
    const fixedLengthStart = recordStart + 4;
    const variableLengthOffsetStart = recordStart + nullBitmapOffset + nullBitmapSize;
    const variableLengthOffsetColumnCount = Number(data.substring(variableLengthOffsetStart, variableLengthOffsetStart + 2));
    console.log('variableArrCount: ' + variableLengthOffsetColumnCount);
    const variableLengthStart = variableLengthOffsetStart + 2 + (variableLengthOffsetColumnCount * 4);
    const variableLengthOffsetArr = getVariableLengthOffsetArray(data.substring(variableLengthOffsetStart + 2, variableLengthOffsetStart + 2 + (variableLengthOffsetColumnCount * 4)));

    let colInd = 0;
    let colStart = fixedLengthStart;

    // get fixed length column values
    for (let colDef of fixedLengthColumnDefinitions) {
      colInd++;
      const isNull = nullBitmap.find(col => col.order === colInd).isNull;
      
      if (isNull) {
        colDef.colValue = null;
      } else {
        switch (colDef.dataType) {
          case 0:
            colDef.colValue = new TinyInt(data.substring(colStart, colStart + 1));
            colStart += 1;
            break;
          case 1:
            colDef.colValue = new SmallInt(data.substring(colStart, colStart + 2));
            colStart += 2;
            break;
          case 2:
            colDef.colValue = new Int(data.substring(colStart, colStart + 4));
            colStart += 4;
            break;
          case 3:
            colDef.colValue = new BigInt(data.substring(colStart, colStart + 8));
            colStart += 8;
            break;
          case 4:
            colDef.colValue = new Bit(data.substring(colStart, colStart + 1));
            colStart += 1;
            break;
          case 5:
            colDef.colValue = new Char(data.substring(colStart, colStart + colDef.maxLength));
            colStart += colDef.maxLength;
            break;
          default:
            throw new Error(`Unhandled data type: ${colDef.dataType}`);
        }
      }
    }

    colStart = variableLengthStart;
    let offsetArrInd = 0;

    // get variable length column values
    for (let colDef of variableLengthColumnDefinitions) {
      colInd++;
      const isNull = nullBitmap.find(col => col.order === colInd).isNull;

      if (isNull) {
        colDef.colValue = null;
      } else {
        // only one varying data type right now
        offsetArrInd++;
        const length = Number(data.substring(colStart, colStart + 4));
        console.log(length);
        const value = data.substring(colStart + 4, colStart + 4 + length);
        colDef.colValue = new Varchar(value, colDef.maxLength);
        colStart = colStart + 4 + length;
      }
    }

    return [...fixedLengthColumnDefinitions, ...variableLengthColumnDefinitions];
  }

  function getVariableLengthOffsetArray(arr) {
    const varArr = arr.match(/.{1,4}/g) || [];

    return varArr.map((offset, index) => {
      return {
        offset: offset,
        order: index
      }
    });
  }
}