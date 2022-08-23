import { EMPTY_SPACE_CHAR, PAGE_HEADER_SIZE, PAGE_SIZE } from '../utilities/constants';
import { padNumber } from '../utilities/helper';
import { deserializeRecord, getHeaderValue } from './deserializer';
import { updatePageHeader, fillInEmptyPageSpace, serializeRecord } from './serializer';

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
   * @param {Array<ColumnDefinition>} columnDefinitions
   * @returns {Array<Array<ResultCell>>}
   */
  this.readPage = (columnDefinitions) => {
    const records = [];

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      let recordIndex = Number(slotArr[i]);
      records.push(deserializeRecord(recordIndex, this.data, columnDefinitions));
    }

    return records;
  }

  this.hasAvailableSpace = (record) => {
    const requiredSpace = record.length + 4; // length of the data plus a new slot array entry
    const slotArrayStart = PAGE_SIZE - (Number(getHeaderValue('recordCount', this.header) * 4));
    const firstFreeData = Number(getHeaderValue('firstFreeData', this.header));

    const availableSpace = slotArrayStart - firstFreeData;

    return availableSpace >= requiredSpace;
  }

  /**
   * @method
   * @param {Number} slotArrIndex 
   * @param {Number} newValue 
   */
  this.updateSlotArray = (slotArrIndex, newValue) => {
    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];

    slotArr[slotArrIndex] = padNumber(newValue, 4);
    this.slotArray = slotArr.join('');

    const before = this.data.substring(0, PAGE_SIZE - this.slotArray.length);
    this.data = `${before}${this.slotArray}`;
    console.log(this.data.length);
  }

  /**
   * @method
   * 1. Loops through each record on this page and looks for a match in `updatedRecords` based on the primary key
   * 2. If a match is found, evaluate the length of the new record vs. the old:
   *  2a. If the same OR the new record is shorter, update in place
   *  2b. If the new record is longer, check if there is available space at the end of the page (`firstFreeData`)
   *    2b-a. If available space, place it there and update the slot array
   *    2b-b. If not, we will need to perform a page split
   * @param {Array<UpdatedRecordType>} updatedRecords 
   * @param {Array<ColumnDefinition>} columnDefinitions 
   * @returns {Number}
   */
   this.updateRecords = (updatedRecords, columnDefinitions) => {
    let updateCount = 0;

    const slotArr = this.slotArray.match(/[\s\S]{1,4}/g) || [];
    for (let i = slotArr.length - 1; i >= 0; i--) {
      const recordIndex = Number(slotArr[i]);
      const record = deserializeRecord(recordIndex, this.data, columnDefinitions);
      const existingSerializedRecord = serializeRecord(record, columnDefinitions);

      for (let upd of updatedRecords) {
        const pk = record.find(col => col.name == upd.primaryKeyName);

        if (pk.value == upd.primaryKeyValue) {
          updateCount++;
          if (upd.serializedRecord.length <= existingSerializedRecord.length) {
            // update in place
            const before = this.data.substring(0, recordIndex);
            const after = this.data.substring(recordIndex + upd.serializedRecord.length);
            this.data = `${before}${upd.serializedRecord}${after}`;
          } else {
            console.log('cannot update in place');
            if (!this.hasAvailableSpace(upd.serializedRecord)) throw new Error('Not enough space on the page to perform update');

            const newRecordIndex = this.firstFreeData;
            const allRecordData = this.data.substring(PAGE_HEADER_SIZE, newRecordIndex) + upd.serializedRecord;

            this.firstFreeData = allRecordData.length + PAGE_HEADER_SIZE;

            const headerChanges = [
              { name: 'firstFreeData', value: this.firstFreeData }
            ];
            this.header = updatePageHeader(1, headerChanges, this.header);
            this.updateSlotArray(i, newRecordIndex);
            
            const before = this.data.substring(0, newRecordIndex);
            const after = this.data.substring(newRecordIndex + upd.serializedRecord.length);
            this.data = `${before}${upd.serializedRecord}${after}`;
          }
        }
      }
    }

    return updateCount;
  }
}

export default Page;