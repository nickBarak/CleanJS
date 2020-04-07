// class Private {
//     constructor(init, setOn) {

//         if (typeof(setOn) === 'undefined') setOn = false;
//         this.value = (typeof(init === 'object') && !Array.isArray(init)) ? {is: {}} : {is: ''};

//         if (typeof(init) === 'object') {
//             if (init === null) {
//                 this.value.is = null;
//             } else if (Array.isArray(init)) {
//                 this.value.is = init;
//             } else {
//                 for (let entry in init) this.value.is[entry] = init[entry];
//             }
//         } else this.value.is = init;

//         if (setOn == false) {
//             const freezeObj = obj => {
//                 let subObjs = [];
//                 for (let entry in obj) {
//                     if (typeof(obj[entry]) === 'object') {
//                         subObjs.push(entry);
//                     }
//                 }
//                 if (subObjs.length) subObjs.forEach(subObj => { Object.freeze(obj[subObj]); freezeObj(obj[subObj]) });
//                 Object.freeze(obj);
//                 return obj;
//             };
//             if (typeof(this.value.is) === 'object') freezeObj(this.value.is);
//         };

//         const setObject = (target, property, assignment) => {
//             const proxiesObject = {};
//             for (let entry in assignment) {
//                 const proxify = obj => {
//                     return new Proxy({value: {is: Object.keys(obj).reduce((targ, key) => {
//                         targ[key] = (typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) ? proxify(obj[key]) : obj[key];
//                         return targ
//                     }, {})}}, handler);
//                 };
//                 proxiesObject[entry] = (typeof(assignment[entry]) !== 'object' || Array.isArray(assignment[entry])) ? assignment[entry] : proxify(assignment[entry]);
//             };
//             return property === 'value' ? Reflect.set(target.value, 'is', proxiesObject) : Reflect.set(target.value.is, property, new Proxy({value: {is: proxiesObject}}, handler));
//         };

//         const handler = {
//             get: (target, property, self) => {
//                 console.log(target.value.is);
//                 if (typeof(target.value.is) !== 'object' || Array.isArray(target.value.is)) { return property === 'value' ? Reflect.get(target.value, 'is') : Reflect.get(target.value.is, property)
//                 } else {
//                     return property === 'value' ? Reflect.get(target.value, 'is') : Reflect.get(target.value.is, property);
//                 }
//             },
//             set: (target, property, assignment) => {
//                 if (eval(setOn)) {
//                     if (property === 'value') { 
//                         if (typeof(assignment) === 'object' && !Array.isArray(assignment)) {
//                             setObject(target, property, assignment);
//                         } else return Reflect.set(target.value, 'is', assignment)
//                     } else {
//                         if (typeof(target.value.is) !== 'object' || Array.isArray(target.value.is)) target.value.is = {};
//                         (typeof(assignment) === 'object' && !Array.isArray(assignment)) ? setObject(target, property, assignment) : Reflect.set(target.value.is, property, assignment);
//                     }
//                 } else throw new Error('Private variables will not mutate outside of pre-defined set conditions')
//             }
//         }
//         return new Proxy(this, handler)
//     };
// };

// // const p = new Private(23, true);
// // console.log(p.value)

// p.w = {
//     a: {
//         c: {
//             b: 'hello'
//         },
//         d: {
//             e: {
//                 f: 8888
//             }
//         }
//     },
//     g: {
//         h: [2,'asdf'],
//         i: {
//             j: 'k'
//         }
//     }
// }

// console.log(p)



// class Private {
//     constructor(init, setOn) {

//         if (typeof(setOn) === 'undefined') setOn = false;
//         this.value = (typeof(init === 'object') && !Array.isArray(init)) ? {} : '';

//         if (typeof(init) === 'object') {
//             if (init === null) {
//                 this.value = null;
//             } else if (Array.isArray(init)) {
//                 this.value = init;
//             } else {
//                 for (let entry in init) this.value[entry] = init[entry];
//             }
//         } else this.value = init;

//         const freezeObj = obj => {
//             let subObjs = [];
//             for (let entry in obj) {
//                 if (typeof(obj[entry]) === 'object') {
//                     subObjs.push(entry);
//                 }
//             }
//             if (subObjs.length) subObjs.forEach(subObj => { Object.freeze(obj[subObj]); freezeObj(obj[subObj]) });
//             Object.freeze(obj);
//             return obj;
//         };

//         if (setOn == false && typeof(this.value) === 'object') freezeObj(this.value);

//         const setObject = (target, property, assignment) => {
//             const proxiesObject = {};
//             for (let entry in assignment) {
//                 const proxify = obj => {
//                     return new Proxy({value: Object.keys(obj).reduce((targ, key) => {
//                         targ[key] = (typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) ? proxify(obj[key]) : obj[key];
//                         return targ
//                     }, {})}, handler);
//                 };
//                 proxiesObject[entry] = (typeof(assignment[entry]) !== 'object' || Array.isArray(assignment[entry])) ? assignment[entry] : proxify(assignment[entry]);
//             };
//             return property === 'value' ? Reflect.set(target, 'value', proxiesObject) : Reflect.set(target.value, property, new Proxy({value: proxiesObject}, handler));
//         };

//         const handler = {
//             get: (target, property, self) => {
//                 if (typeof(target.value) !== 'object' || Array.isArray(target.value)) { return property === 'value' ? Reflect.get(target, 'value') : Reflect.get(target.value, property)
//                 } else {
//                     return property === 'value' ? Reflect.get(target, 'value') : Reflect.get(target.value, property);
//                 }
//             },
//             set: (target, property, assignment) => {
//                 if (eval(setOn)) {
//                     if (property === 'value') { 
//                         if (typeof(assignment) === 'object' && !Array.isArray(assignment)) {
//                             setObject(target, property, assignment);
//                         } else return Reflect.set(target, 'value', assignment);
//                     } else {
//                         if (typeof(target.value) !== 'object' || Array.isArray(target.value)) target.value = {};
//                         (typeof(assignment) === 'object' && !Array.isArray(assignment)) ? setObject(target, property, assignment) : Reflect.set(target.value, property, assignment);
//                     }
//                 } else throw new Error('Private variables will not mutate outside of pre-defined set conditions');
//             }
//         }
//         if (((typeof(init) === 'object' && !Array.isArray(init)) && init != null)) setObject(this, 'value', init);
//         return new Proxy(this, handler);
//     };
// };

// // const ary = [1,2,3];
// const obj = new Private({someProp: {someOtherProp: 'somVal'}});
// // obj.value = {a: {b: {c: 'adsf'}}, fds: 'asdf'};
// // obj.a.b = {a: [ary]};
// // obj.a.b[1] = 'newval';
// console.log(obj.value);


// export const sayHi = _=> console.log('Hello from test.js');

// export default { sayHi };


// app.js
// import Clean, { elt } from './Clean/Clean.js';
// import { link } from 'fs';

// const now = new Store('app');

// const partContent = `...`;

// const Part = (init, traps) => {
//     let part = document.createElement('Part'),
//     concern = `Part${document.querySelectorAll('Part').length ? ' '+document.querySelectorAll('part').length+1 : ''}`,
//     store = new Store(concern, init, traps);
//     part.innerHTML = bootstrap(partContent, init);
//     // scripts
    
//     // MAKE CLOSURE 
    
//     return part;
// };

// const render = initializers => {
//     let fragment = new DocumentFragment();
//     document.replaceChild(Part(init, traps), document.querySelector('[part=Part 2]'));
    //     initializers.forEach(initializer => fragment.appendChild(initializer()));
    //     const compareDOMs = (fragmentNodes, DOMNodes) => {
        //         fragmentNodes.reduce((acc, cur, i) => {
            //             if (!cur.isEqualNode(acc[i])) {
                //                 compareDOMs(cur.childNodes, acc[i].childNodes) 
                //             }
                //         }, DOMNodes)
                //     };
                //     compareDOMs(fragment.querySelectorAll('*'), document.querySelectorAll('*'))
            // }


// const render = initializers => {
//     let fragment = new DocumentFragment(),
//         part = document.querySelector('[part="Part 2"]'),
//         newPart = part.cloneNode('deep');
//     newPart.childNodes[0].textContent = 'no no no';
//     fragment.appendChild(newPart);
//     part.replaceWith(fragment);


    // document.replaceChild(Part(init, traps), document.querySelector('[part=Part 2]'));
    // initializers.forEach(initializer => fragment.appendChild(initializer()));
    // const compareDOMs = (fragmentNodes, DOMNodes) => {
    //     fragmentNodes.reduce((acc, cur, i) => {
    //         if (!cur.isEqualNode(acc[i])) {
    //             compareDOMs(cur.childNodes, acc[i].childNodes) 
    //         }
    //     }, DOMNodes)
    // };
    // compareDOMs(fragment.querySelectorAll('*'), document.querySelectorAll('*'))
// };
// // render();

// let rax = /((?!some).*)/g;
// let str = 'some aphrasedsaf';
// console.log(rax.exec(str)[1]);

let route = `routex.to['a good'][place].where["I"].go`;

route = route.replace(/[\]\"\']/g, '').replace(/[\.\[]/g, '$*@#').split('$*@#');

let obs = {routex: {to: {["a good"]: {place: {where: {I: {go: 'hi'}}}}}}};


route.forEach(str => {
    obs = obs[str] ? obs[str] : obs;
})

console.log(obs)