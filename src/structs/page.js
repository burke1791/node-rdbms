import { EMPTY_SPACE_CHAR, PAGE_SIZE } from '../constants';
import DbHeader from './dbHeader';
import PageHeader from './pageHeader';
import PageRecord from './pageRecord';
import SlotArray from './slotArray';

/**
 * @class Page
 * @param {String} data
 * @param {String} objectName
 * @param {Boolean} [isFirstPageInFile]
 */
function Page(data, objectName, isFirstPageInFile) {

  this.objectName = objectName;
  this.hasChanges = false;
  this.dbHeader = !!isFirstPageInFile ? new DbHeader(data.substring(0, 6)) : null;
  this.pageHeader = !!isFirstPageInFile ? new PageHeader(data.substring(6, 39)) : new PageHeader(data.substring(0, 33));
  this.slotArray = new SlotArray(data.substring(getSlotArrayIndex(this.pageHeader), PAGE_SIZE));
  this.pageRecords = parsePageRecords(this.objectName, this.pageHeader, this.slotArray);

  this.newRecord = () => {
    
  }

  /**
   * @method
   * @param {Array<import('../bufferPool/bufferPool').QueryPredicate>} predicate 
   * @param {Array<import('../bufferPool/bufferPool').ColumnUpdateType>} newValues 
   * @returns {Number}
   */
  this.changeRecord = (predicate, newValues) => {
    for (let record of this.pageRecords) {
      let match = true;
      for (let colPred of predicate) {
        if (!record.record.columns[colPred.columnIndex].isMatch(colPred.value)) match = false;
      }

      if (match) {
        for (let newVal of newValues) {
          record.record.updateColumn(newVal.columnIndex, newVal.newValue);
          this.hasChanges = true;
        }
      }
    }
  }

  function getSlotArrayIndex(pageHeader) {
    const slotArraySize = pageHeader.recordCount * 4;

    return PAGE_SIZE - slotArraySize
  }

  /**
   * @method parsePageRecords
   * @returns {Array<PageRecord>}
   */
  function parsePageRecords(objectName, pageHeader, slotArray) {
    slotArray.sortRecords();

    return slotArray.recordPointers.map(pointer => {
      return new PageRecord(data, pointer.recordStart, pageHeader.pageType, objectName);
    });
  }

  this.getPageText = () => {
    let text = '';

    if (this.dbHeader != null) {
      text += this.dbHeader.getDbHeaderText();
    }

    text += this.pageHeader.getPageHeaderText();

    const slotArraySize = this.slotArray.recordPointers.length * 4;

    const recordSpaceStart = text.length;
    const recordSpaceEnd = PAGE_SIZE - slotArraySize - 1;

    // initialize the record space with EMPTY_SPACE_CHARs
    text += nullInitRecordSpace(recordSpaceStart, recordSpaceEnd);

    // append the slot array
    text += this.slotArray.getSlotArrayText();

    // fill in page records

  }

  function nullInitRecordSpace (start, end) {
    let nullSpace = '';

    for (i = start; i <= end; i++) {
      nullSpace += EMPTY_SPACE_CHAR;
    }
  }
}

export default Page;