import { PAGE_SIZE } from '../utilities/constants';
import { padNumber, padStringTrailing } from '../utilities/helper';

/**
 * @class
 * @param {Number} recordSize 
 */
function Page() {

  this.pageSize = PAGE_SIZE;
  this.recordCount = 0;
  this.firstFreeData = 0;
  this.data = '';

  this.deserializeRow = (recordId) => {
    const recordIndex = recordId * this.recordSize;
    const recordData = this.data.substring(recordIndex, recordIndex + this.recordSize);

    const id = Number(recordData.substring(4, 8));
    const age = Number(recordData.substring(8, 12));
    const name = recordData.substring(12, 62);

    const record = new Record(id, age, name);

    const result = record.deserializeRecord();

    return result;
  }

  this.serializeRow = (personId, age, name) => {
    let nullBitmapOffset = 62;
    let nullBitmap = '05';

    if (personId == 'null') {
      personId = null;
      nullBitmap += '1';
      nullBitmapOffset -= 4;
    }

    if (age == 'null') {
      age = null;
      nullBitmap += '1';
      nullBitmapOffset -= 4;
    }

    if (name.trim() == 'null') {
      name = null;
      nullBitmap += '1';
      nullBitmapOffset -= 50;
    }

    let recordText = '';

    recordText += padNumber(nullBitmapOffset, 4);
    recordText += personId == null ? '' : padNumber(personId, 4);
    recordText += age == null ? '' : padNumber(age, 4);
    recordText += name == null ? '' : padStringTrailing(name, 50);
    recordText += nullBitmap;

    this.data = this.data.substring(0, this.firstFreeData) + recordText
  }

  this.addRecordToPage = (recordId, recordData) => {
    const currentRecordIndex = recordId * this.recordSize;
    const nextRecordIndex = (recordId + 1) * this.recordSize;

    this.data = this.data.substring(0, currentRecordIndex) + recordData + this.data.substring(nextRecordIndex);
  }

  this.newRecord = (personId, age, name) => {
    this.recordData = this.serializeRow(personId, age, name);

    this.addRecordToPage(this.nextRecordId, record.data);
    this.nextRecordId++;
  }

  this.selectAll = () => {
    let records = [];
    for (let i = 0; i < this.recordCount; i++) {
      records.push(this.deserializeRow(i));
    }

    return records;
  }
}

export default Page;