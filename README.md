# KeyValueStore [![Build Status](https://travis-ci.org/object-layer/key-value-store.svg?branch=master)](https://travis-ci.org/object-layer/key-value-store)

Transactional key-value store on top of any database.

### Why?

I needed a key-value store supporting ACID transactions. Since currently there are not many solutions out there, I created a layer above SQL databases like MySQL. My hope is that in the near future I will be able to replace the SQL database with something doing just what I want.

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
npm install --save key-value-store
```

## Usage

### Simple operations

```javascript
import KeyValueStore from 'key-value-store';

let store = new KeyValueStore('mysql://test@localhost/test');

async function simple() {
  let key = ['users', 'abcde12345'];

  // Create
  await store.put(key, { firstName: 'Manu', age: 42 });

  // Read
  let user = await store.get(key);

  // Update
  await store.put(key, { firstName: 'Manu', age: 43 });

  // Delete
  await store.delete(key);
}
```

### Range queries

```javascript
import KeyValueStore from 'key-value-store';

let store = new KeyValueStore('mysql://test@localhost/test');

async function query() {
  return await store.find({
    prefix: 'users',
    startAfter: 'abcde12345',
    limit: 30
  });
}
```

### Transactions

```javascript
import KeyValueStore from 'key-value-store';

let store = new KeyValueStore('mysql://test@localhost/test');

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

Keys and values can be any kind of data.

If a key is an array it is automatically serialized in a way that sort element-wise. Thanks to that, keys can easily represent "path" (e.g.: ['users', 'abcde12345']).

Values are serialized with `JSON.stringify`. If you need to customize the serialization of your objects, you can implement a `toJSON()` method on them.

### Promise based API

Every asynchronous operation returns a promise. It is a good idea to handle them with the great ES7 async/await feature. Since ES7 is not really there yet, you should compile your code with something like [Babel](https://babeljs.io/).

## API

### `new KeyValueStore(url)`

Create a store for the specified URL.

```javascript
import KeyValueStore from 'key-value-store';

let store = new KeyValueStore('mysql://test@localhost/test');
```

### `store.get(key, [options])`

Get an item from the store.

```javascript
let user = await store.get(['users', 'abcde12345']);
```

#### `options`

- `errorIfMissing` _(default: `true`)_: if `true`, an error is thrown if the specified `key` is missing from the store. If `false`, the method returns `undefined` when the `key` is missing.

### `store.put(key, value, [options])`

Put an item in the store.

```javascript
await store.put(['users', 'abcde12345'], { firstName: 'Manu', age: 42 });
```

#### `options`

- `createIfMissing` _(default: `true`)_: if `false`, an error is thrown if the specified `key` is missing from the store. This way you can ensure an "update" semantic.
- `errorIfExists` _(default: `false`)_: if `true`, an error is thrown if the specified `key` is already present in the store. This way you can ensure a "create" semantic.

### `store.delete(key, [options])`

Delete an item from the store.

```javascript
await store.delete(['users', 'abcde12345']);
```

#### `options`

- `errorIfMissing` _(default: `true`)_: if `true`, an error is thrown if the specified `key` is missing from the store. If `false`, the method returns `false` when the `key` is missing.

### `store.getMany(keys, [options])`

Get several items from the store. Return an array of objects composed of two properties: `key` and `value`. The order of the specified `keys` is preserved in the result.

```javascript
let users = await store.getMany([
  ['users', 'abcde12345'],
  ['users', 'abcde67890'],
  // ...
]);
```

#### `options`

- `errorIfMissing` _(default: `true`)_: if `true`, an error is thrown if one of the specified `keys` is missing from the store.
- `returnValues` _(default: `true`)_: if `false`, only keys found in the store are returned (no `value` property).

### `store.putMany(items, [options])`

Not implemented yet.

### `store.deleteMany(keys, [options])`

Not implemented yet.

### `store.find([options])`

Fetch items matching the specified criteria. Return an array of objects composed of two properties: `key` and `value`. The returned items are ordered by key.

```javascript
// Fetch all users
let users = await store.find({ prefix: 'users' });

// Fetch 30 users after the 'abcde12345' key
let users = await store.find({
  prefix: 'users',
  startAfter: 'abcde12345',
  limit: 30
});
```

#### `options`

- `prefix`: fetch items with keys starting with the specified value.
- `start`, `startAfter`: fetch items with keys greater than (or equal to if you use the `start` option) the specified value.
- `end`, `endBefore`: fetch items with keys less than (or equal to if you use the `end` option) the specified value.
- `reverse` _(default: `false`)_: if `true`, reverse the order of returned items.
- `limit` _(default: `50000`)_: limit the number of fetched items to the specified value.
- `returnValues` _(default: `true`)_: if `false`, only keys found in the store are returned (no `value` property).

### `store.count([options])`

Count items matching the specified criteria.

```javascript
let users = await store.count({
  prefix: 'users',
  startAfter: 'abcde12345'
});
```

#### `options`

- `prefix`: count items with keys starting with the specified value.
- `start`, `startAfter`: count items with keys greater than (or equal to if you use the `start` option) the specified value.
- `end`, `endBefore`: count items with keys less than (or equal to if you use the `end` option) the specified value.

### `store.findAndDelete([options])`

Delete items matching the specified criteria. Return the number of deleted items.

```javascript
let deletedItemsCount = await store.findAndDelete({
  prefix: 'users',
  startAfter: 'abcde12345'
});
```

#### `options`

- `prefix`: delete items with keys starting with the specified value.
- `start`, `startAfter`: delete items with keys greater than (or equal to if you use the `start` option) the specified value.
- `end`, `endBefore`: delete items with keys less than (or equal to if you use the `end` option) the specified value.

### `store.transaction(fun)`

Run the specified function inside a transaction. The function receives a transaction handler as first argument. This handler should be used as a replacement of the store for every operation made during the execution of the transaction. If any error occurs, the transaction is aborted and the store is automatically rolled back.

```javascript
// Increment a counter
await store.transaction(async function(transaction) {
  let value = await transaction.get('counter');
  value++;
  await transaction.put('counter', value);
});
```

### `store.close()`

Close all connections to the store.

## License

MIT
