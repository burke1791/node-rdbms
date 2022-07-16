import { Char } from '../dataTypes/charTypes';
import { Int } from '../dataTypes/numbers';
import { PAGE_SIZE } from '../utilities/constants';
import Record from './record';

/**
 * @class
 * @param {Number} recordSize 
 */
function Page(recordSize) {

  this.pageSize = PAGE_SIZE;
  this.recordSize = recordSize;
  this.recordCount = 0;
  this.data = '';
  this.nextRecordId = 0;

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

  this.addRecordToPage = (recordId, recordData) => {
    const currentRecordIndex = recordId * this.recordSize;
    const nextRecordIndex = (recordId + 1) * this.recordSize;

    this.data = this.data.substring(0, currentRecordIndex) + recordData + this.data.substring(nextRecordIndex);
  }

  this.newRecord = (personId, age, name) => {
    if (personId == 'null') personId = null;
    if (age == 'null') age = null;
    if (name.trim() == 'null') name = null;

    const record = new Record(personId, age, name);
    record.serializeRecord();

    this.addRecordToPage(this.nextRecordId, record.data);
    this.nextRecordId++;
    this.recordCount++;
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