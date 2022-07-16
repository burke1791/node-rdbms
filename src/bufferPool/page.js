import { Char } from '../dataTypes/charTypes';
import { Int } from '../dataTypes/numbers';
import { PAGE_SIZE } from '../utilities/constants';

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
    const record = this.data.substring(recordIndex, recordIndex + this.recordSize);

    const id = new Int(record.substring(0, 4));
    const age = new Int(record.substring(4, 8));
    const name = new Char(record.substring(8, 57));

    const result = `( ${id.value}, ${age.value}, ${name.value} )`;

    return result;
  }

  this.serializeRow = (recordId, personId, age, name) => {
    const idCol = new Int(personId);
    const ageCol = new Int(age);
    const nameCol = new Char(name, 50);
    const record = `${idCol.getText()}${ageCol.getText()}${nameCol.getText()}`;

    const currentRecordIndex = recordId * this.recordSize;
    const nextRecordIndex = (recordId + 1) * this.recordSize;

    this.data = this.data.substring(0, currentRecordIndex) + record + this.data.substring(nextRecordIndex);
  }

  this.newRecord = (personId, age, name) => {
    this.serializeRow(this.nextRecordId, personId, age, name);
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