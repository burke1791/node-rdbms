import { Char } from "../dataTypes/charTypes";
import { Int } from "../dataTypes/numbers";

/**
 * @class
 * @param {Array<Any>} columns
 */
function Record(personId, age, name) {

  this.personId = new Int(personId);
  this.age = new Int(age);
  this.name = new Char(name, 50);
  this.data = '';

  this.nullBitmapOffset = () => {
    // the fixed-length columns take up 58 chars
    return '0058';
  }

  this.nullBitmap = () => {
    // there are three columns, so the bitmap size is 5
    const bitmapSize = '05';

    return '05000';
  }

  this.serializeRecord = () => {
    this.data = this.nullBitmapOffset() + this.personId.getText() + this.age.getText() + this.name.getText() + this.nullBitmap();
  }

  this.deserializeRecord = () => {
    const nullBitmapColumns = this.nullBitmap().substring(2).split('');

    let id = this.personId.value;
    let age = this.age.value;
    let name = this.name.value;

    if (nullBitmapColumns[0] == '1') id = 'NULL';
    if (nullBitmapColumns[1] == '1') age = 'NULL';
    if (nullBitmapColumns[2] == '1') name = 'NULL';

    return `( ${id}  ${age}  ${name} )`;
  }
}

export default Record;