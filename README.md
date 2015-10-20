# StoreLayer [![Build Status](https://travis-ci.org/object-layer/store-layer.svg?branch=master)](https://travis-ci.org/object-layer/store-layer)

Future proof API abstracting any transactional key-value store.

### Why?

I needed a key-value store supporting ACID transactions. Since currently there are not many solutions, I created a layer above SQL databases like MySQL. My hope is that in the near future I will be able to replace the SQL database with something doing just what I want.

### Features

- Simple API.
- If a key is an array it is serialized in a way that sort element-wise.
- Easy transactions with automatic begin/commit/rollback.
- Asynchronous functions return promises, feel free to handle them with ES7 async/await feature.

### Supported databases

- Every databases supported by [AnySQL](https://www.npmjs.com/package/anysql).
- More to come...

## Installation

```
npm install --save store-layer
```

## Usage

### Simple operations

```javascript
import StoreLayer from 'store-layer';

let store = new StoreLayer('mysql://test@localhost/test');

async function simple() {
  let key = ['users', 'abcde12345'];

  // Create
  await store.put(key, { firstName: 'Manu', age: 42 });

  // Read
  let user = await store.get(key);

  // Update
  await store.put(key, { firstName: 'Manu', age: 43 });

  // Delete
  await store.del(key);
}
```

### Range queries

```javascript
import StoreLayer from 'store-layer';

let store = new StoreLayer('mysql://test@localhost/test');

async function query() {
  return await store.getRange({
    prefix: 'users',
    startAfter: 'abcde12345',
    limit: 30
  });
}
```

### Transactions

```javascript
import StoreLayer from 'store-layer';

let store = new StoreLayer('mysql://test@localhost/test');

async function criticalOperation() {
  await store.transaction(async function(transaction) {
    let key = ['users', 'abcde12345'];
    let user = await transaction.get(key);
    user.age++;
    await transaction.put(key, user);
    // ...
    // if no error has been thrown, the transaction is automatically committed
  });
}
```

## Basic concepts

### Keys and values

Keys and values can be any kind of data. If a key is an array it is automatically serialized in a way that sort element-wise. Values are serialized with `JSON.stringify`.

### Promise based API

Every asynchronous operations return a promise. It is a good idea to handle them with the great ES7 async/await feature. Since ES7 is not everywhere yet, you should compile your code with something like [Babel](https://babeljs.io/).

## API

### `new StoreLayer(url)`

Create a store for the specified URL.

```javascript
import StoreLayer from 'store-layer';

let store = new StoreLayer('mysql://test@localhost/test');
```

### `store.get(key, [options])`

Get something from the store.

```javascript
let user = await store.get(['users', 'abcde12345']);
```

#### `options`

- `errorIfMissing` _(default: `true`)_: if `true`, an error is thrown if the specified `key` is missing from the store. If `false`, the method returns `undefined` when the `key` is missing.

### `store.put(key, value, [options])`

Put something in the store.

```javascript
await store.put(['users', 'abcde12345'], { firstName: 'Manu', age: 42 });
```

#### `options`

- `createIfMissing` _(default: `true`)_: if `false`, an error is thrown if the specified `key` is missing from the store. This way you can ensure an "update" semantic.
- `errorIfExists` _(default: `false`)_: if `true`, an error is thrown if the specified `key` is already present in the store. This way you can ensure a "create" semantic.

### `store.del(key, [options])`

Delete something from the store.

```javascript
await store.del(['users', 'abcde12345']);
```

#### `options`

- `errorIfMissing` _(default: `true`)_: if `true`, an error is thrown if the specified `key` is missing from the store. If `false`, the method returns `false` when the `key` is missing.

## License

MIT
