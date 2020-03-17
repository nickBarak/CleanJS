// import * as V from './Variables.js';
// import * as F from './Functions.js';
// import 'idempotent-babel-polyfill';
// import { someVar } from './Variables.js';
export * from './Variables.js';

export const sayHi = _=> console.log('Modules');

export const a = 'hoookay';

export default {
    sayHi,
    a
}