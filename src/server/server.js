import { BufferPool } from '../bufferPool';
import sqliteParser from 'sqlite-parser';
import { executeQuery } from '../queryProcessor';

/**
 * @typedef StorageEngine
 * @property {Function} diskWriter function call to write pages to disk
 * @property {Function} diskReader function call to read pages to disk
 */

/**
 * @typedef DbServerConfig
 * @property {import("../bufferPool/bufferPool").BufferPoolConfig} bufferPool
 */

/**
 * @class
 * @param {DbServerConfig} config
 */
function DbServer(config) {

  this.buffer = new BufferPool(config.bufferPool);

  this.executeSQL = (sql) => {
    // parser

    // analyzer

    // queryProcessor
  }
}

export default DbServer;