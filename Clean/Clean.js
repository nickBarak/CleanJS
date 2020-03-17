// // // // // CLIENT SIDE // // // // //





// Core Classes

export class Part {
    constructor(path, ...args) {
        this.html = fs.readFileSync(`texts/${path}.html`, 'utf8');
        this.part = document.querySelector(path.match(/\/(.*)\.html/)); //reverse string or use lookbehind

        while (this.part.firstChild) this.part.removeChild(this.part.lastChild);
        this.part.innerHTML = this.html;
    }
};

// export class Store {
//     constructor (concern, init={}, traps={}, push=null) {
//         // if (concern) {console.log(true)} else console.log(false);
//         // if (!now) {console.log(true)} else console.log(false);
//         if (now) now.legacy
//         if (now && !Object.keys(now.legacy).includes(concern)) {console.log(true)} else console.log(false);
//         this._concern = concern;
//         // } else throw new Error('Stores must be initialized with a concern');
//         if (concern === 'app') {
//             this.legacy = {test: ''};
//             this._dynasty = { app: {} }
//         } else now.legacy = now._dynasty = concern;
//         this._diff = {};
//         this._init = init;
//         this.state = {};

//         if (Object.entries(init).length) {
//             for (let entry in init) { this.state[entry] = init[entry] }
//         };

//         const handler = {
//             get: (target, property, self) => {
//                 if (property === 'check') Reflect.get(target, property, self)
//                 if (['_concern', '_diff', '_init', 'state', 'legacy', '_dynasty'].includes(property)) console.log(target[property]);
//                 if (property === 'target') console.log(target);
//                 if (property in this._diff) { delete this._diff[property] }
//                 return ['_concern', '_diff', '_init', 'state', '__clear__', 'check'].includes(property) ? target[property] : Reflect.get(target.state, property, self)
//             },
//             set: (target, property, value, self) => {
//                 if ('concern,diff,init,state'.match(property.replace(/_/g, '').toLowerCase())) {
//                     throw new Error('State items may not resemble top-level properties')
//                 } else {
//                     if (property === '_dynasty') { target._dynasty[/*document.querySelector('part').getAttribute('parent')*/'app'][value] = {}; true }
//                     if (property === 'legacy') { this.legacy[value] = {}; true }
//                     if (property === 'legacyExtension') { this.legacy[value[0]] = value[1]; true }
//                     if (property === 'onClear') { now.legacyExtension = [this._concern, value]; true
//                     } else this._diff[property] = this.state[property] = value; return true;
//                 }
//                 return true;
//             }
//         };

//         const handlerInsert = (trap, plus) => {
//             let value = handler[trap];
//             value = `${value}`.split('return');
//             value.splice(1, 0, 'return');
//             value.splice(1, 0, plus);
//             value.unshift('(');
//             value.push(')');
//             handler[trap] = eval(value.join(''));
//         }
        
//         if (Object.entries(traps).length) {
//             for (let trap in traps) { 
//                 if (trap === 'set' || trap === 'get') {
//                     handlerInsert(trap, `${traps[trap]}`);
//                 } else handler[trap] = eval(traps[trap]);
//             }
//             if (push) {
//                 for (trap in handler) {
//                     handlerInsert(trap, `\nif (this._diff.length) {
//                         for (let property in this._diff) { push[property] = this._diff[property] }
//                     }\n`);
//                 }
//             }
//         }

//         return new Proxy(this, handler)
//     };

//     check(what) { what ? this[what] : this.target };

//     __clear__() {
//         for (let property in this.state) { delete this.state[property] }
//         if (Object.entries(now.legacy[this._concern]).length) {
//             for (let property in now.legacy[this._concern]) { this[property] = now.legacy[this._concern][property] }
//         }
//     };
    
//     __fullclear__() {
//         for (let property in this.state) { delete this.state[property] }
//         if (Object.entries(this._init).length) {
//             for (let property in this._init) { this[property] = this._init[property] }
//         }
//     }
// };

// export const now = new Store('app');

export class Private {
    constructor(init, setOn) {

        if (typeof(setOn) === 'undefined') setOn = false;
        this.value = (typeof(init === 'object')) ? {} : '';

        if (typeof(init) === 'object') {
            if (init === null) {
                this.value = null;
            } else if (Array.isArray(init)) {
                this.value = init;
            } else {
                for (let entry in init) this.value[entry] = init[entry];
            }
        } else this.value = init;

        if (setOn == false) {
            if (typeof(this.value) === 'object') freeze(this.value, true);
        };

        const setObject = (target, property, assignment) => {
            const proxiesObject = {};
            for (let entry in assignment) {
                const proxify = obj => {
                    return new Proxy({value: Object.keys(obj).reduce((targ, key) => {
                        targ[key] = (((typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) && obj[key] != null)) ? proxify(obj[key]) : obj[key];
                        return targ
                    }, {})}, handler);
                };
                proxiesObject[entry] = (((typeof(assignment[entry]) !== 'object' || Array.isArray(assignment[entry])) || assignment[entry] === null)) ? assignment[entry] : proxify(assignment[entry]);
            };
            return property === 'value' ? Reflect.set(target, 'value', proxiesObject) : Reflect.set(target.value, property, new Proxy({value: proxiesObject}, handler));
        };

        const handler = {
            get: (target, property, self) => {
                if (((typeof(target.value) !== 'object' || Array.isArray(target.value)) || target.value === null)) { return property === 'value' ? Reflect.get(target, 'value') : Reflect.get(target.value, property)
                } else {
                    return property === 'value' ? Reflect.get(target, 'value') : Reflect.get(target.value, property);
                }
            },
            set: (target, property, assignment) => {
                if (eval(setOn)) {
                    if (property === 'value') { 
                        if (((typeof(assignment) === 'object' && !Array.isArray(assignment)) && assignment != null)) {
                            setObject(target, property, assignment);
                        } else return Reflect.set(target, 'value', assignment)
                    } else {
                        if (((typeof(target.value) !== 'object' || Array.isArray(target.value)) || target.value === null)) target.value = {};
                        (((typeof(assignment) === 'object' && !Array.isArray(assignment)) && assignment != null)) ? setObject(target, property, assignment) : Reflect.set(target.value, property, assignment);
                    }
                } else throw new Error('Private variables will not mutate outside of pre-defined set conditions')
            }
        }
        return new Proxy(this, handler)
    };
};

// DOM Manipulation

export const family = (...members) => members.forEach((elt, i, elts) => { if (i > 0) elts[i-1].appendChild(elt) });
export const list = (outerTag, innerTag, contents, className=false, id=false) => {
    let list = elt(outerTag, 'new');
    if (className) list.className = className;
    if (id) list.id = id;
    contents.forEach(item => list.appendChild(`<${innerTag}>${item}</${innertag}>`));
    return list;
};
export const ul = (contents, className=false, id=false) => list('ul', 'li', contents, className, id);
export const ol = (contents, className=false, id=false) => list('ol', 'li', contents, className, id);
export const select = (contents, className=false, id=false) => list('select', 'option', contents, className, id);

export const elt = (name, by) => {
    switch (by) {
        default: return document.querySelector(name);
        case 'all': return document.querySelectorAll(name);
        case 'new': return document.createElement(name);
        case 'id': return document.getElementById(name);
        case 'class': return document.getElementsByClassName(name)[0];
        case 'classes': return document.getElementsByClassName(name);
        case 'tag': return document.getElementsByTagName(name)[0];
        case 'tags': return document.getElementsByTagName(name);
        case 'name': return document.getElementsByName(name)[0];
        case 'names': return document.getElementsByName(name);
    }
}

export const on = (event, elt, cb, preventDefault=true) => elt.addEventListener(event, evt => { 
    if (preventDefault) evt.preventDefault();
    cb();
})

export const html = (el, inner) => elt(el).innerHTML = inner;


// Function Composition

export const sift = (...i) => {
    let res = i.map(j => !Array.isArray(j)
        ? j
        : j.map(k => !Array.isArray(k)
            ? k
            : k.map(l => !Array.isArray(l)
                ? l
                : sift(l)))); return !Array.isArray(res[0])
                    ? res
                    : !Array.isArray(res[0][0])
                        ? res[0]
                        : res[0][0]
}

//currying


// Part Activation

export const show = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 1);
export const hide = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 0);
export const kill = (...elts) => sift(elts).forEach(elt => elt.style.display = 'none');
export const revive = (display, ...elts) => sift(elts).forEach(elt => elt.style.display = display);
export const transition = (mode, from, to, display) => { 
    if (mode === 'hide') { hide(from); show(to) }
    else if (mode === 'kill') { kill(from), revive(display, to) }
};

export const active = (css) => {
    let active = [];
    let inactive = [];
    for (let part in V.P) (V.P[part].style[css] > 0 || V.P[part].style[css] != 'none') ? active.push({ part: V.P[part] }) : inactive.push({ part: V.P[part] });
    return live ? active : inactive;
};
export const shown = (shown=true) => active('opacity', shown);
export const live = (live=true) => active('display', live);


// Ajax

export const ajax = (method, path, reqType, resType, body, cb) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, path);
    xhr.setRequestHeader('Content-Type', switchHeader(reqType));
    xhr.setRequestHeader('Accept', switchHeader(resType));
    xhr.send(body);
    xhr.onload = _=> cb;
}
export const ajaxGet = (path, cb) => ajax('GET', path, 'json', 'json', '', cb);

const switchHeader = type => {
    switch (type) {
        //aplication
        case 'json': return 'application/json';
        case 'www': return 'application/x-www-urlencoded';
        case 'js': return 'application/javascript';
        case 'ogg': return 'application/ogg';
        case 'pdf': return 'application/pdf';
        case 'flash': return 'application/x-shockwave-flash';
        case 'zip': return 'application/zip';
        // text
        case 'css': return 'text/css';
        case 'csv': 'text/csv';
        case 'html': return 'text/html';
        case 'plain': return 'text/plain';
        // image
        case 'gif': return 'image/gif';
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'tiff': return 'image/tiff';
        case 'icon': return 'image/x-icon';
        // audio
        case 'wav': return 'audio/x-wav'; 
        // video
        case 'quicktime': return 'video/quicktime';    
        case 'msvideo': return 'video/x-msvideo';    
        case 'flv': return 'video/x-flv';   
        case 'webm': return 'video/webm'; 
        // multipart
        case 'mixed': return 'multipart/mixed';    
        case 'alt': return 'multipart/alternative';   
        case 'related': return 'multipart/related';  
        case 'form': return 'multipart/form-data';
        
        default: return type;
    }
};


// Data Handling

//hydrate data (join tables)

export const table = (data) => {
    let table = elt('table', 'new');
    let columns = elt('tr', 'new');
    for (let column in data[0]) {
        let th = elt('th', 'new');
        th.innerHTML = column;
        columns.appendChild(th);
    }
    for (let item in data) {
        let row = elt('tr', 'new');
        for (let prop in item) {
            let td = elt('td', 'new');
            td.innerHTML = data[item][prop];
            row.appendChild(td);
        }
        table.appendChild(row);
    }
}

export const combine = (...objs) => {
    const combination = {};
    for (let obj in objs) {
        for (let key in obj) {
            if (key in combination) {
                throw new Error(`Duplicate key: ${key}`);
            } else combination[key] = obj[key];
        }
    }
    return combination;
};

export const freeze = (obj, permanent=true) => {
    Object.keys(obj).forEach(key => {
        if (((typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) && obj[key] != null)) {
            if (permanent) { Object.freeze(obj[key])
            } else {
                freeze(obj[key], false); Object.defineProperty(obj, key, {configurable: true, enumerable: true, writable: false});
            }
            Object.preventExtensions(obj[key]);
        } else Object.defineProperty(obj, key, {configurable: true, enumerable: true, writable: false});
    });
    if (permanent) Object.freeze(obj);
    Object.preventExtensions(obj);
    return obj;
};

export const thaw = obj => {
    Object.keys(obj).forEach(key => {
        Object.defineProperty(obj, key, {writable: true});
        if (((typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) && obj[key] != null)) thaw(obj[key])
    });
    console.log('Object has been thawed but remains non-extensible');
    return obj;
}


// Animation

//slideup / slidedown, slideleft, slideright
//requestAnimationFrame();

export default {
    Part,
    // Store,
    // now,
    Private,
    family,
    list,
    ul,
    ol,
    select,
    elt,
    on,
    html,
    sift,
    show,
    hide,
    kill,
    revive,
    transition,
    active,
    shown,
    live,
    ajax,
    ajaxGet,
    table,
    combine,
    freeze,
    thaw
};