// import Clean, { freeze } from './Clean/Clean.js';
// const h1 = document.querySelector('h1');

// const someInstance = new Store('Some Name');
// someInstance._concern = 'Some Other Name';
// h1.innerHTML = someInstance._concern;
// console.log(someInstance)
// // cln.revive('asdfladsf')

// const obj = {
//     a: 'hello',
//     b: [1,2,3],
//     c: {d: {f: 'g'}}
// };

// Clean.freeze(obj, false);
// Clean.thaw(obj)
// // obj.yo = 'ayo';
// // console.log(obj)
// // Clean.thaw(obj)
// // Clean.thaw(obj)
// // obj.a='no';
// // Clean.freeze(obj);
// // Clean.thaw(obj);
// // obj.a='yes';
// console.log(obj);

// let str = 'asdfjsadofisdaf';

// console.log(str.split('<script>')[0])
// import { sayBye } from './Clean/Clean.js';
// import test from './test.js';


// (_=>{
//     test.sayHi();
// })();

// (_=>{
//     sayBye();
// })();
// let str = 'some/path/to/file.html';
// console.log(/(?<=\/)(\w*)\./.exec(str));

// let things = ['thing1', 'thing2', 'thing3'];
// things.join('\n');
// console.log(things.join('\n'))
let file = '@#$%\r\n' +
    "    import * as nothing from './Clean.js';\r\n" +
    "    // import {sayHi, a} from '../scripts/Modules.js';\r\n" +
    "    // console.log('hi')\r\n" +
    "    // console.log('test', a)\r\n" +
    '    // sayHi()\r\n' +
    "    const homeStore = new Store('home');\r\n" +
    "    var u0= 'sojdk,'\r\n" +
    '    console.log(now);\r\n' +
    '})();';

let res = file.replace(/ *?\/\/.*\r\n/g, '').replace(/[\r\n]+/g, '\r\n');
console.log(res);