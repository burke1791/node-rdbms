import { EMPTY_SPACE_CHAR, PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { padNumber } from '../utilities/helper';
import { getFixedColumnValueIndexes, getFixedLengthColumnValue, getFixedLengthNullValue, getHeaderValue, getVariableColumnLength, getVariableLengthColumnOffset, getVariableLengthColumnValue, getVariableLengthNullValue } from './deserializer';
import { validateInsertValues, updatePageHeader, serializeRecord, fillInEmptyPageSpace } from './serializer';

/**
 * @class
 * @param {Object} tableDefinition
 */
function Page(tableDefinition) {

  this.tableName = tableDefinition.name;
  this.columnDefinitions = tableDefinition.columns;
  this.pageSize = PAGE_SIZE;
  this.recordCount = 0;
  this.firstFreeData = PAGE_HEADER_SIZE;
  this.header = '';
  this.data = '';
  this.slotArray = '';

  this.initPageFromDisk = (data) => {
    this.data = data;
    this.header = this.data.substring(0, PAGE_HEADER_SIZE);
    this.recordCount = Number(getHeaderValue('recordCount', this.header));
    this.firstFreeData = Number(getHeaderValue('firstFreeData', this.header));

    if (this.recordCount > 0) {
      const slotArrStart = PAGE_SIZE - (this.recordCount * 4);
      this.slotArray = this.data.substring(slotArrStart, PAGE_SIZE);
    }
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

  this.addRecordToPage = (recordData) => {
    const newRecordIndex = this.firstFreeData;
    const allRecordData = this.data.substring(PAGE_HEADER_SIZE, newRecordIndex) + recordData;

    const newPageSize = PAGE_HEADER_SIZE + allRecordData.length + (this.recordCount + 1) * 4;

    if (newPageSize > PAGE_SIZE) throw new Error('Page must be split');

    this.firstFreeData = allRecordData.length + PAGE_HEADER_SIZE;
    this.recordCount++;

    const headerChanges = [
      { name: 'recordCount', value: this.recordCount },
      { name: 'firstFreeData', value: this.firstFreeData }
    ];

    this.header = updatePageHeader(1, headerChanges, this.header);
    this.slotArray = padNumber(newRecordIndex, 4) + this.slotArray;

    this.data = fillInEmptyPageSpace(this.header, allRecordData, this.slotArray);
  }

  this.newRecord = (data) => {
    const serializedRecord = serializeRecord(data, this.columnDefinitions);
    
    if (!validateInsertValues(data, this.columnDefinitions)) throw new Error('Invalid insert values');

    this.addRecordToPage(serializedRecord);
  }

  /**
   * @method
   * @param {Array<SimplePredicate>} [predicate]
   * @returns {Array<Array<ResultCell>>}
   */
  this.select = (predicate = []) => {
    const records = [];

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      let recordIndex = Number(slotArr[i]);
      records.push(this.deserializeRow(recordIndex));
    }

    let resultset;

    if (predicate.length > 0) {
      resultset = records.filter(record => {
        for (let col of record) {
          const pred = predicate.find(p => p.colName.toLowerCase() == col.name.toLowerCase());

          if (pred != undefined) {
            if (pred.colValue != col.value) return false;
          }
        }
        
        return true;
      });
    } else {
      resultset = records;
    }

    return resultset;
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

  this.hasAvailableSpace = (record) => {
    const serializedRecord = serializeRecord(record, this.columnDefinitions);
    const requiredSpace = serializedRecord.length + 4; // length of the data plus a new slot array entry
    const slotArrayStart = PAGE_SIZE - (Number(getHeaderValue('recordCount', this.header) * 4));
    const firstFreeData = Number(getHeaderValue('firstFreeData', this.header));

    const availableSpace = slotArrayStart - firstFreeData;

    return availableSpace >= requiredSpace;
  }
}

export default Page;