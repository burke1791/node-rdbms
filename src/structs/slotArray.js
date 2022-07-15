import { padNumber } from "./utilities";

/**
 * @class SlotArray
 * @param {String} data
 */
function SlotArray(data) {

  this.recordPointers = parseSlotArray(data);

  function parseSlotArray(data) {
    const arr = data.match(/.{1,4}/g) || [];
    const length = arr.length;

    if (length == 0) return [];

    return arr.map((slot, index) => {
      return {
        recordStart: Number(slot),
        order: length - index
      }
    });
  }

  this.sortRecords = function() {
    if (this.recordPointers.length > 1) {
      this.recordPointers.sort((a, b) => b.order - a.order);
    }
  }

  this.getSlotArrayText = () => {
    this.sortRecords();

    let slotArrayText = '';

    for (let slot of this.recordPointers) {
      slotArrayText += padNumber(slot.recordStart, 4);
    }

    return slotArrayText;
  }
}

export default SlotArray;