import { Bit, Char, Int, SmallInt, TinyInt, BigInt, Varchar } from '../dataTypes';
import { EMPTY_SPACE_CHAR, PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { padNumber } from '../utilities/helper';
import { getFixedColumnValueIndexes, getFixedLengthColumnValue, getFixedLengthNullValue, getVariableColumnLength, getVariableLengthColumnOffset, getVariableLengthColumnValue, getVariableLengthNullValue } from './deserializer';
import { getNullBitmapAndNullBitmapOffset, validateInsertValues, getVariableOffsetArray, updatePageHeader } from './serializer';

/**
 * @class
 * @param {Object} tableDefinition
 */
function Page(tableDefinition) {

  this.tableName = tableDefinition.name;
  this.columnDefinitions = tableDefinition.columns;
  this.pageSize = PAGE_SIZE;
  this.recordCount = 0;
  this.firstFreeData = 33;
  this.header = '';
  this.data = '';
  this.slotArray = ''

  this.serializeRow = (values) => {
    validateInsertValues(values, this.columnDefinitions);

    const [nullBitmap, nullBitmapOffset] = getNullBitmapAndNullBitmapOffset(values, this.columnDefinitions);

    const variableOffsetArray = getVariableOffsetArray(values, this.columnDefinitions);

    let recordText = '';

    recordText += padNumber(nullBitmapOffset, 4);
    
    const fixedLengthDefinitions = this.columnDefinitions.filter(def => {
      return !def.isVariable;
    });
  
    fixedLengthDefinitions.sort((a, b) => a.order - b.order);

    for (let fdef of fixedLengthDefinitions) {
      const val = values.find(value => value.name.toLowerCase() === fdef.name.toLowerCase());

      let colVal;

      if (val != undefined && val.value != null && val.value != undefined) {
        switch (fdef.dataType) {
          case 0:
            colVal = new TinyInt(val.value);
            break;
          case 1:
            colVal = new SmallInt(val.value);
            break;
          case 2:
            colVal = new Int(val.value);
            break;
          case 3:
            colVal = new BigInt(val.value);
            break;
          case 4:
            colVal = new Bit(val.value);
            break;
          case 5:
            colVal = new Char(val.value);
            break;
          default:
            throw new Error(`Unhandled data type: ${col.dataType} in function getNullBitmapAndNullBitmapOffset`);
        }

        recordText += colVal.getText();
      }
    }

    recordText += nullBitmap;
    recordText += variableOffsetArray;
  
    const variableLengthDefinitions = this.columnDefinitions.filter(def => {
      return def.isVariable;
    });
  
    variableLengthDefinitions.sort((a, b) => a.order - b.order);

    for (let vdef of variableLengthDefinitions) {
      const val = values.find(value => value.name.toLowerCase() === vdef.name.toLowerCase());

      let colVal;

      if (val != undefined && val.value != null && val.value != undefined) {
        colVal = new Varchar(val.value);
        recordText += colVal.getText();
      }
    }

    return recordText;
  }

  this.deserializeRow = (recordIndex) => {
    const fixedLengthDefinitions = this.columnDefinitions.filter(def => {
      return !def.isVariable;
    });
    fixedLengthDefinitions.sort((a, b) => a.order - b.order);

    const variableLengthDefinitions = this.columnDefinitions.filter(def => {
      return def.isVariable;
    });
    variableLengthDefinitions.sort((a, b) => a.order - b.order);

    const numFixed = fixedLengthDefinitions.length;
    const numVariable = variableLengthDefinitions.length;

    const nullBitmapOffset = this.data.substring(recordIndex, recordIndex + 4);
    const nullBitmapStart = recordIndex + Number(nullBitmapOffset);
    const nullBitmapSize = Number(this.data.substring(nullBitmapStart, nullBitmapStart + 2));
    const nullBitmapEnd = nullBitmapStart + nullBitmapSize;
    const nullBitmap = this.data.substring(nullBitmapStart, nullBitmapEnd);
    const nullBitmapColumns = nullBitmap.substring(2).split('');

    const varOffsetEnd = nullBitmapEnd + 2 + (4 * numVariable);

    const varOffsetArray = this.data.substring(nullBitmapEnd, varOffsetEnd);
    const varOffsetColumns = varOffsetArray.substring(2).match(/[\s\S]{1,4}/g);

    const columns = [];
    let colNum = 1;

    for (let i = 0; i < nullBitmapColumns.length; i++) {
      if (nullBitmapColumns[i] == '1' && colNum > numFixed) {
        const val = getVariableLengthNullValue(colNum - numFixed, variableLengthDefinitions);
        columns.push(val);
      } else if (nullBitmapColumns[i] == '1') {
        const val = getFixedLengthNullValue(colNum, fixedLengthDefinitions);
        columns.push(val);
      } else if (colNum > numFixed) {
        // variable length columns
        const offset = getVariableLengthColumnOffset(colNum - numFixed, varOffsetColumns);
        const colLength = getVariableColumnLength(colNum - numFixed, 
        varOffsetColumns);
        const colStart = varOffsetEnd + offset - colLength;
        const col = this.data.substring(colStart, colStart + colLength);
        const val = getVariableLengthColumnValue(colNum - numFixed, variableLengthDefinitions, col);
        columns.push(val);
      } else {
        // fixed length columns
        const [colStart, colEnd] = getFixedColumnValueIndexes(colNum, fixedLengthDefinitions);
        const col = this.data.substring(colStart + recordIndex, colEnd + recordIndex);
        const val = getFixedLengthColumnValue(colNum, fixedLengthDefinitions, col);
        columns.push(val);
      }

      colNum++;
    }

    columns.sort((a, b) => a.order - b.order);

    return columns;
  }

  this.fillInEmptySpace = (recordData) => {
    let length = recordData.length + this.slotArray.length + PAGE_HEADER_SIZE;

    if (length > PAGE_SIZE) throw new Error('Page cannot exceed ' + PAGE_SIZE + ' chars');

    let text = recordData;

    while (length < PAGE_SIZE) {
      text = text + EMPTY_SPACE_CHAR;
      length = text.length + this.slotArray.length + PAGE_HEADER_SIZE;
    }

    return text;
  }

  this.addRecordToPage = (newRecordIndex, recordData) => {
    const allRecordData = this.data.substring(33, newRecordIndex) + recordData;
    this.firstFreeData = allRecordData.length + PAGE_HEADER_SIZE;
    this.recordCount++;

    const headerChanges = [
      { name: 'recordCount', value: this.recordCount },
      { name: 'firstFreeData', value: this.firstFreeData }
    ];

    this.header = updatePageHeader(1, headerChanges, this.header);
    this.slotArray = padNumber(newRecordIndex, 4) + this.slotArray;

    this.data = this.header + this.fillInEmptySpace(allRecordData) + this.slotArray;
  }

  this.newRecord = (values) => {
    const rowData = this.serializeRow(values);

    this.addRecordToPage(this.firstFreeData, rowData);
  }

  this.selectAll = () => {
    const records = [];
    console.log(this.data);
    console.log(this.data.length);

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      let recordIndex = Number(slotArr[i]);
      records.push(this.deserializeRow(recordIndex));
    }

    return records;
  }
}

export default Page;