import { padNumber } from "../structs/utilities";

/**
 * @class SqlNumber
 */
function SqlNumber(charSize, minVal, maxVal, value) {
  this.charSize = charSize;
  this.minVal = minVal;
  this.maxVal = maxVal;
  this.value = Number(value).toFixed(0);

  validateValue(this.value);

  this.isMatch = (valueToCheck) => {
    return this.value === Number(valueToCheck);
  }

  this.update = (newValue) => {
    let valueToCheck = Number(newValue).toFixed(0);
    validateValue(valueToCheck);
    this.value = valueToCheck;
  }

  function validateValue(valueToCheck) {
    if (valueToCheck < this.minVal || valueToCheck > this.maxVal) {
      throw new Error(`${this.value} exceeds the bounds of this Number data type`);
    }
  }

  this.getText = () => {
    return padNumber(this.value, this.charSize);
  }
}

export default SqlNumber;