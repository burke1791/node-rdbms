import { EMPTY_SPACE_CHAR, PAGE_SIZE } from '../utilities/constants';
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
  this.slotArray = ''

  this.serializeRow = (personId, age, name) => {
    let nullBitmapOffset = 62;
    let nullBitmap = '05';

    if (personId == 'null') {
      personId = null;
      nullBitmap += '1';
      nullBitmapOffset -= 4;
    } else {
      nullBitmap += '0';
    }

    if (age == 'null') {
      age = null;
      nullBitmap += '1';
      nullBitmapOffset -= 4;
    } else {
      nullBitmap += '0';
    }

    if (name.trim() == 'null') {
      name = null;
      nullBitmap += '1';
      nullBitmapOffset -= 50;
    } else {
      nullBitmap += '0';
    }

    let recordText = '';

    recordText += padNumber(nullBitmapOffset, 4);
    recordText += personId == null ? '' : padNumber(personId, 4);
    recordText += age == null ? '' : padNumber(age, 4);
    recordText += name == null ? '' : padStringTrailing(name, 50);
    recordText += nullBitmap;

    return recordText;
  }

  this.deserializeRow = (recordIndex) => {
    const nullBitmapOffset = this.data.substring(recordIndex, recordIndex + 4);
    console.log(nullBitmapOffset);
    const nullBitmap = this.data.substring(recordIndex + Number(nullBitmapOffset), recordIndex + Number(nullBitmapOffset) + 5);
    console.log(nullBitmap);
    const nullBitmapColumns = nullBitmap.substring(2).split('');

    const columns = [];
    let colIndex = recordIndex + 4;

    for (let i = 0; i < nullBitmapColumns.length; i++) {
      if (nullBitmapColumns[i] == '1') return null;

      if (i == 2) {
        const col = this.data.substring(colIndex, colIndex + 50);
        console.log(col);
        columns.push(col);
        colIndex += 50;
      } else {
        const col = this.data.substring(colIndex, colIndex + 4);
        console.log(col);
        columns.push(Number(col));
        colIndex += 4;
      }
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

    this.data = this.fillInEmptySpace(allRecordData);
  }

  this.newRecord = (personId, age, name) => {
    const rowData = this.serializeRow(personId, age, name);

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