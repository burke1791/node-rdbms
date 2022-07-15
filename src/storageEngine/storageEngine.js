import DiskWriter from './diskWriter';
import DiskReader from './diskReader';

/**
 * Creates a Storage Engine instance
 * @class
 */
function StorageEngine() {

  this.diskWriter = new DiskWriter();
  this.diskReader = new DiskReader();
}

export default StorageEngine;