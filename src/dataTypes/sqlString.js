import { padStringTrailing } from '../utilities/helper';

/**
 * @class SqlString
 */
function SqlString(maxLength, isVariable, value) {
  this.maxLength = maxLength;
  this.isVariable = isVariable;
  this.value = String(value);

  this.isMatch = (valueToCheck) => {
    return this.value === String(valueToCheck);
  }

  this.update = (newValue) => {
    let valueToCheck = String(newValue);
    this.validateValue(valueToCheck);
    this.value = valueToCheck;
  }

  this.validateValue = (valueToCheck) => {
    if (valueToCheck.length > this.maxLength) {
      console.log(valueToCheck);
      console.log(this.maxLength);
      throw new Error('SqlString overflow error');
    }
  }

  this.getText = () => {
    if (!this.isVariable) return padStringTrailing(this.value, this.maxLength);

    // variable SqlStrings have a four-char overhead preceeding the actual string itself that indicates how long the string is
    return `${this.value.length}${this.value}`;
  }

  this.validateValue(this.value);
}

export default SqlString;