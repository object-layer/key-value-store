'use strict';

export class KeyValueStore {
  constructor(url) {
    if (!url) throw new Error('URL is missing');
    let pos = url.indexOf(':');
    if (pos === -1) throw new Error('Invalid URL');
    let protocol = url.substr(0, pos);
    switch (protocol) {
      case 'mysql':
      case 'websql':
      case 'cordova-sqlite':
        // TODO: Use ES6 module loader API
        let AnySQLKeyValueStore = require('key-value-store-anysql').default;
        return new AnySQLKeyValueStore(url);
      default:
        throw new Error('Unknown database');
    }
  }
}

export default KeyValueStore;
