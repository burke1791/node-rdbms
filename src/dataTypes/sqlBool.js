
/**
 * @class SqlBool
 */
function SqlBool(value) {
  this.value = !!value;

  this.isMatch = (valueToCheck) => {
    return this.value === !!valueToCheck;
  }

  this.update = (newValue) => {
    this.value = !!newValue;
  }

  this.getText = () => {
    return this.value ? '1' : '0'
  }
}

export default SqlBool;