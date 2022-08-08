import { padStringTrailing } from '../utilities/helper';

/**
 * @class SqlString
 */
function SqlString(maxLength, isVariable, value) {
  this.maxLength = maxLength;
  this.isVariable = isVariable;
  this.value = (value == null || value == undefined) ? null : String(value);

  this.isMatch = (valueToCheck) => {
    return this.value === String(valueToCheck);
  }

  this.update = (newValue) => {
    let valueToCheck = String(newValue);
    this.validateValue(valueToCheck);
    this.value = valueToCheck;
  }

  this.validateValue = (valueToCheck) => {
    if (valueToCheck == null || valueToCheck == undefined) return true;

    if (valueToCheck.length > this.maxLength) {
      throw new Error('SqlString overflow error');
    }
  }

  this.getText = () => {
    if (this.value == null || this.value == undefined) return null;
    if (!this.isVariable) return padStringTrailing(this.value, this.maxLength);

    return this.value;
  }

  this.validateValue(this.value);
}

export default SqlString;