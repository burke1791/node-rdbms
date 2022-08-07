import { EMPTY_SPACE_CHAR, PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { padNumber } from '../utilities/helper';
import { deserializeRecord, getFixedColumnValueIndexes, getFixedLengthColumnValue, getFixedLengthNullValue, getHeaderValue, getVariableColumnLength, getVariableLengthColumnOffset, getVariableLengthColumnValue, getVariableLengthNullValue } from './deserializer';
import { validateInsertValues, updatePageHeader, serializeRecord, fillInEmptyPageSpace } from './serializer';

/**
 * @class
 */
function Page() {

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

  /**
   * @method
   * @param {Array<SimplePredicate>} [predicate]
   * @param {Array<ColumnDefinition>} columnDefinitions
   * @returns {Array<Array<ResultCell>>}
   */
  this.select = (predicate = [], columnDefinitions) => {
    const records = [];

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      let recordIndex = Number(slotArr[i]);
      records.push(deserializeRecord(recordIndex, this.data, columnDefinitions));
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

  this.hasAvailableSpace = (record) => {
    const requiredSpace = record.length + 4; // length of the data plus a new slot array entry
    const slotArrayStart = PAGE_SIZE - (Number(getHeaderValue('recordCount', this.header) * 4));
    const firstFreeData = Number(getHeaderValue('firstFreeData', this.header));

    const availableSpace = slotArrayStart - firstFreeData;

    return availableSpace >= requiredSpace;
  }
}

export default Page;