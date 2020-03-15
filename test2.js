import Clean, { freeze } from './Clean/Clean.js';

// const h1 = document.querySelector('h1');

// const someInstance = new Store('Some Name');
// someInstance._concern = 'Some Other Name';
// h1.innerHTML = someInstance._concern;
// console.log(someInstance)
// cln.revive('asdfladsf')

const obj = {
    a: 'hello',
    b: [1,2,3],
    c: {d: {f: 'g'}}
};

Clean.freeze(obj, false);
Clean.thaw(obj)
// obj.yo = 'ayo';
// console.log(obj)
// Clean.thaw(obj)
// Clean.thaw(obj)
// obj.a='no';
// Clean.freeze(obj);
// Clean.thaw(obj);
// obj.a='yes';
console.log(obj);