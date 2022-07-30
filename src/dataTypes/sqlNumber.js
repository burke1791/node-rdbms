import { padNumber } from '../utilities/helper';

/**
 * @class SqlNumber
 */
function SqlNumber(charSize, minVal, maxVal, value) {
  this.charSize = charSize;
  this.minVal = minVal;
  this.maxVal = maxVal;
  this.value = Number(value).toFixed(0);

  this.isMatch = (valueToCheck) => {
    return this.value === Number(valueToCheck);
  }

  this.update = (newValue) => {
    let valueToCheck = Number(newValue).toFixed(0);
    this.validateValue(valueToCheck);
    this.value = valueToCheck;
  }

  this.validateValue = (valueToCheck) => {
    if (isNaN(valueToCheck)) throw new Error('Value is not a number');
    if (valueToCheck < this.minVal || valueToCheck > this.maxVal) {
      throw new Error(`${this.value} exceeds the bounds of this Number data type`);
    }
  }

  this.getText = () => {
    return padNumber(this.value, this.charSize);
  }

  this.validateValue(this.value);
}

export default SqlNumber;