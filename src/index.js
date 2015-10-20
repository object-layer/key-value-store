'use strict';

export class StoreLayer {
  constructor(url) {
    if (!url) throw new Error('URL is missing');
    let pos = url.indexOf(':');
    if (pos === -1) throw new Error('Invalid URL');
    let protocol = url.substr(0, pos);
    switch (protocol) {
      case 'mysql':
      case 'websql':
      case 'sqlite':
        // TODO: Use ES6 module loader API
        let AnySQLStoreLayer = require('store-layer-anysql').default;
        return new AnySQLStoreLayer(url);
      default:
        throw new Error('Unknown database');
    }
  }
}

export default StoreLayer;
