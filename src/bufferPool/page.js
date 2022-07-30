import { Bit, Char, Int, SmallInt, TinyInt, BigInt, Varchar } from '../dataTypes';
import { EMPTY_SPACE_CHAR, PAGE_SIZE } from '../utilities/constants';
import { padNumber } from '../utilities/helper';
import { getVariableColumnLength, getVariableLengthColumnOffset } from './deserializer';
import { getNullBitmapAndNullBitmapOffset, validateInsertValues } from './serializer';

/**
 * @class
 * @param {Object} tableDefinition
 */
function Page(tableDefinition) {

  this.tableName = tableDefinition.name;
  this.columnDefinitions = tableDefinition.columns;
  this.pageSize = PAGE_SIZE;
  this.recordCount = 0;
  this.firstFreeData = 0;
  this.data = '';
  this.slotArray = ''

  this.serializeRow = (values) => {
    validateInsertValues(values, this.columnDefinitions);

    const [nullBitmap, nullBitmapOffset] = getNullBitmapAndNullBitmapOffset(values, this.columnDefinitions);

    const variableOffsetArray = getVariableOffsetArray(values, this.columnDefinitions);

    let recordText = '';

    recordText += padNumber(nullBitmapOffset, 4);
    
    const fixedLengthDefinitions = definitions.filter(def => {
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
  
    const variableLengthDefinitions = definitions.filter(def => {
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
    const numFixed = 2;

    const nullBitmapOffset = this.data.substring(recordIndex, recordIndex + 4);

    const nullBitmapStart = recordIndex + Number(nullBitmapOffset);
    const nullBitmapEnd = nullBitmapStart + 6;

    const nullBitmap = this.data.substring(nullBitmapStart, nullBitmapEnd);
    const nullBitmapColumns = nullBitmap.substring(2).split('');

    const varOffsetEnd = nullBitmapEnd + 10;

    const varOffsetArray = this.data.substring(nullBitmapEnd, varOffsetEnd);
    const varOffsetColumns = varOffsetArray.substring(2).match(/[\s\S]{1,4}/g);

    const columns = [];
    let colIndex = recordIndex + 4;
    let colNum = 1;

    for (let i = 0; i < nullBitmapColumns.length; i++) {
      if (nullBitmapColumns[i] == '1') {
        columns.push('NULL');
      } else if (colNum > numFixed) {
        // variable length columns
        const offset = getVariableLengthColumnOffset(colNum - numFixed, varOffsetColumns);
        const colLength = getVariableColumnLength(colNum - numFixed, 
        varOffsetColumns);
        const colStart = varOffsetEnd + offset - colLength;
        const col = this.data.substring(colStart, colStart + colLength);
        columns.push(col);
      } else {
        // fixed length columns
        const col = this.data.substring(colIndex, colIndex + 4);
        columns.push(Number(col));
        colIndex += 4;
      }

      colNum++;
    }

    let result = '( ';

    columns.forEach(value => {
      result = result + value + ' ';
    });

    result = result + ')'

    return result;
  }

  this.fillInEmptySpace = (recordData) => {
    let length = recordData.length + this.slotArray.length;

    if (length > PAGE_SIZE) throw new Error('Page cannot exceed ' + PAGE_SIZE + ' chars');

    let text = recordData;

    while (length < PAGE_SIZE) {
      text = text + EMPTY_SPACE_CHAR;
      length = text.length + this.slotArray.length;
    }

    return text;
  }

  this.addRecordToPage = (newRecordIndex, recordData) => {
    const allRecordData = this.data.substring(0, newRecordIndex) + recordData;
    this.firstFreeData = allRecordData.length;
    this.recordCount++;

    this.slotArray = padNumber(newRecordIndex, 4) + this.slotArray;

    this.data = this.fillInEmptySpace(allRecordData) + this.slotArray;
  }

  this.newRecord = (values) => {
    const rowData = this.serializeRow(values);

    this.addRecordToPage(this.firstFreeData, rowData);
  }

  this.selectAll = () => {
    const records = [];

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      let recordIndex = Number(slotArr[i]);
      records.push(this.deserializeRow(recordIndex));
    }

    return records;
  }
}

export default Page;