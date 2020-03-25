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
// let file = '@#$%\r\n' +
//     "    import * as nothing from './Clean.js';\r\n" +
//     "    // import {sayHi, a} from '../scripts/Modules.js';\r\n" +
//     "    // console.log('hi')\r\n" +
//     "    // console.log('test', a)\r\n" +
//     '    // sayHi()\r\n' +
//     "    const homeStore = new Store('home');\r\n" +
//     "    var u0= 'sojdk,'\r\n" +
//     '    console.log(now);\r\n' +
//     '})();';
let match = `<div id=somethng init="{some: "thing", out: [2"'3, 'there']}" someKey="lalLA lks" traps="" links='["osd", "aow23l"]' skssks='skskSKSKsksk '     ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ddd" fill-//opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>
<!-- <h1>Welcome to CleanJS</h1>
<ChangeStateButton  id="23234m" data= 'oho234' >adsf</ChangeStateButton> -->
// <div id="lowerSvg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 319"><path fill="#7a7aa3" fill-opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>`;

// res = file.match(/<[A-Z].*>/g).map(match => match.split('>')[0] + '>');
// res = /(<[A-Z]\w* *id=.*) .*=/.exec(res)[1].replace(/ +/g, ' ');
// console.log(/([A-Z]\w*)/g.exec(res))

// let home = (undefined) => console.log('hi');

const fs = require('fs');
const path = require('path');

// let pathname = `c:\Users\nicho\Code\CleanJS\texts\common\Header.html`;
// console.log(pathname.match('Header.html').length > 0 == true);

// html = html.match(/(?<=<!--)[\s\S]*?(?=-->)/g);

// html.forEach(match=> console.log(match + '||||||||||||||'));

// const polish = (code, encoding='utf8') => {
//     let cleanCode = code.match(/\.(js|html|ts)$/)
//         ? fs.readFileSync(code, encoding)
//         : code;
//     if (cleanCode) cleanCode = cleanCode
//         .replace(/(?<=<!--)[\s\S]*?(?=-->)/g, '')
//         .replace(/<!---->/g, '')
//         .replace(/\/\*[\s\S]*\*\//g, '')
//         .replace(/ *?\/\/.*\r\n/g, '')
//         .replace(/[\r\n]+/g, '\r\n');
//     // if (code.match(/\.[(js)(ts)(html)]$/)) fs.writeFileSync(code, cleanCode, encoding);
//     return cleanCode;
// };

// polish('something/something.ts');

// let id = /id=.*/,
//     traps= /traps=.*/,
//     links= /links=.*/,
//     init= /init=.*/;
// let match = `<Header id=Header init="{asd: 'asdfsadf'}" data="{. sdfl}" traps="asdf" ><a href="">asdf</a></Header>`;
// let nonQuotes = [],
//     rx = /([\S\s]*?)(["'`])[\s\S]*?\2/g,
//     matche;
// while (matche = rx.exec(file)) nonQuotes.push(matche[1]);
// let cleanNonQuotes = nonQuotes.map(nonQuote => nonQuote
//     .replace(/(?<=<!--)[\s\S]*?(?=-->)/g, '')
//     .replace(/<!---->/g, '')
//     .replace(/\/\*[\s\S]*\*\//g, '')
//     .replace(/ *?\/\/.*\r\n/g, '')
//     .replace(/[\r\n]+/g, '\r\n'))

// nonQuotes.forEach((nonQuote, i) => file = file.replace(nonQuote, cleanNonQuotes[i]))

// // console.log(nonQuotes, cleanNonQuotes, file)
// let initializers = [];

// let id = /(?:id ?= ?)(?:['" ])(.*?)(?:['"])(?:\w.*=)?/.exec(match)[1],
//     init = /(?:init ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match)[2],
//     traps = /(?:traps ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match)[2],
//     links = /(?:links ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match)[2];
// initializers.push({id, init, traps, links})
// let trimmedMatch = match,
//     configs = initializers[initializers.length-1];
// for (config in configs) trimmedMatch = trimmedMatch.replace(config+'="'+configs[config]+'"', '').replace(config+"='"+configs[config]+"'", '');
// console.log(trimmedMatch);

// let rx = /([^\s=]+)=(?:"([^"\\]*(?:\\.[^"\\]*)*)"|(\S+))/g

// let res = rx.exec(match)[1]
// let res2 = rx.exec(match)[1]
// let res3 = rx.exec(match)[1]

// console.log(match.match(rx))


// const newInstance = part => {
//     const partName = `${part + partCounts[part] ? ' '+partCounts[part] : ''}`;
//     partCounts[part]++;
//     let newElt = document.createElement(part);
//     newElt.setAttribute('part', partName);
//     return newElt;
// };

// newElt.innerHTML = /* `<part part="Part 1">bootstrapped ${shtuff}`</part> */;

let ary = ['asd{\r\nlfkjsaldfj'];

ary[0] = ary[0].split('{\r\n')[0]+`{\r\nHome: 0,\r\n`+ary[0].split('{\r\n')[1];

console.log(ary)