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

export const pId = partname => elt(`[pId='${partname}']`);

export class Store {
    constructor (concern, domain, parent, script, init={}, traps={}, push=null) {
        // if (concern) {console.log(true)} else console.log(false);
        // if (!now) {console.log(true)} else console.log(false);
        // if (now) now.legacy
        // if (now && !Object.keys(now.legacy).includes(concern)) {console.log(true)} else console.log(false);
        this._concern = concern;
        // if (typeof(now) !== 'undefined') 
        // } else throw new Error('Stores must be initialized with a concern');
        if (typeof(domain) === 'undefined') {
            this.legacy = {test: ''};
            this._dynasty = { app: {} };
            this._activeParts = [];
        } else {
            domain._activeParts = ['add', concern, parent];
        }
        this._diff = {};
        this._init = init;
        this.state = {};
        this.links = {};
        this._script = script;
        this._fragment = new DocumentFragment();

        if (Object.entries(init).length) {
            for (let entry in init) { this.state[entry] = init[entry] }
        };

        const handler = {
            get: (target, property, self) => {
                if (property === 'check target') console.log(target);
                if (property in this._diff) { delete this._diff[property] }
                return ['_concern', '_diff', '_init', 'state', 'legacy', '_dynasty', '__clear__', 'toggle', 'link', 'links', '_fragment', 'render', 'check', '_activeParts'].includes(property) ? target[property] : Reflect.get(target.state, property, self)
            },
            set: (target, property, value, self) => {
                if ('concern,diff,init,state'.match(property.replace(/_/g, '').toLowerCase())) {
                    console.log('State items may not resemble top-level properties')
                } else {
                    // if (property === '_dynasty') { target._dynasty['app'][value] = {}; true }
                    if (property === 'legacy') { this.legacy[value] = {}; true }
                    if (property === 'legacyExtension') { this.legacy[value[0]] = value[1]; true }
                    if (property === 'onClear') { domain.legacyExtension = [this._concern, value]; }
                    if (property === '_activeParts') {
                        if (this._concern === 'app') {
                            if (value[0] === 'add') {
                                this._activeParts.push(value[1]);
                                value[2] === 'top' ? edit('app', this._dynasty, {}, value[1]) : edit(value[2], this._dynasty, {}, value[1]);
                            } else {
                                this._activeParts = this._activeParts.filter(part => part !== value[1]);
                                hunt(value[1], this._dynasty);
                            }
                        }
                    } else this._diff[property] = this.state[property] = value;
                    this.render();
                }
                return true;
            }
        };

        const handlerInsert = (trap, plus) => {
            let value = handler[trap];
            value = `${value}`.split('return');
            value.splice(1, 0, 'return');
            value.splice(1, 0, plus);
            value.unshift('(');
            value.push(')');
            handler[trap] = eval(value.join(''));
        }
        
        if (Object.entries(traps).length) {
            for (let trap in traps) { 
                if (trap === 'set' || trap === 'get') {
                    handlerInsert(trap, `${traps[trap]}`);
                } else handler[trap] = eval(traps[trap]);
            }
            if (push) {
                for (trap in handler) {
                    handlerInsert(trap, `\nif (this._diff.length) {
                        for (let property in this._diff) { push[property] = this._diff[property] }
                    }\n`);
                }
            }
        }

        return new Proxy(this, handler)
    };

    check(what) { what ? console.log(this[what]) : this['check target']; };

    link(state, ...observers) { 
        if (!this.links[state]) this.links[state] = [];
        observers.forEach(observer => this.links[state].push([`[pId='${this._concern}'] ${observer[0]}`, observer[1]]))
    };

    toggle(etarget, state, state1, state2, event='click') { 
        document.querySelector(`[pId='${this._concern}'] ${etarget}`).addEventListener(event, _=> this[state] = (this[state] === state1) ? state2 : state1)
    };

    render() {
        if (this._concern !== 'app') {
            let part = pId(this._concern),
                clone = part.cloneNode('deep');
            this._fragment.appendChild(clone);
            for (let diff in this._diff) {
                if (diff in this.links) {
                    this.links[diff].forEach(link => this._fragment.querySelector(link[0])[link[1]] = this._diff[diff]);
                }
            }
            part.replaceWith(this._fragment);
            this._script();
        }
    };

    __clear__() {
        for (let property in this.state) { delete this.state[property] }
        if (Object.entries(domain.legacy[this._concern]).length) {
            for (let property in now.legacy[this._concern]) { this[property] = domain.legacy[this._concern][property] }
        }
    };
    
    __fullclear__() {
        for (let property in this.state) { delete this.state[property] }
        if (Object.entries(this._init).length) {
            for (let property in this._init) { this[property] = this._init[property] }
        }
    }
};



// export class Store {
//     constructor (concern, script, init={}, traps={}, push=null) {
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
        // this.links = {};
        // this._script = script;
        //     this._fragment = new DocumentFragment();

//         if (Object.entries(init).length) {
//             for (let entry in init) { this.state[entry] = init[entry] }
//         };

//         const handler = {
//             get: (target, property, self) => {
//                 if (property === 'check') Reflect.get(target, property, self)
//                 if (['CHECK _concern', 'CHECK _diff', 'CHECK _init', 'CHECK state', 'CHECK legacy', 'CHECK _dynasty', 'CHECK links'].includes(property)) console.log(target[property.split('CHECK ')[1]]);
//  if (property === 'CHECK target') console.log(target);
//                 if (property in this._diff) { delete this._diff[property] }
//                 return ['_concern', '_diff', '_init', 'state', '__clear__', 'check', 'link', 'links', 'toggle', 'render', '_fragment'].includes(property) ? target[property] : Reflect.get(target.state, property, self)
//             },
        //     set: (target, property, value, self) => {
        //         if ('concern,diff,init,state'.match(property.replace(/_/g, '').toLowerCase())) {
        //             throw new Error('State items may not resemble top-level properties')
        //         } else {
        //             if (property === '_dynasty') { target._dynasty[/*document.querySelector('part').getAttribute('parent')*/'app'][value] = {}; true }
        //             if (property === 'legacy') { this.legacy[value] = {}; true }
        //             if (property === 'legacyExtension') { this.legacy[value[0]] = value[1]; true }
        //             if (property === 'onClear') { now.legacyExtension = [this._concern, value]; true
        //             } else this._diff[property] = this.state[property] = value; return true;
        // if (this.links[property]) this.links[property].forEach(link => link[0][link[1]] = this.state[property]);
        //         }
        //         return true;
        //     }
        // };

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

// check(what) { what ? this['CHECK '+what] : this['CHECK target'] };

//         link(state, ...observers) { 
//             if (!this.links[state]) this.links[state] = [];
//             observers.forEach(observer => this.links[state].push([`[part='${this._concern}'] ${observer[0]}`, observer[1]]))
//         };

//         toggle(etarget, state, state1, state2, event='click') { 
//             document.querySelector(`[part='${this._concern}'] ${etarget}`).addEventListener(event, _=> this[state] = (this[state] === state1) ? state2 : state1)
//         };

//         render() {
//             if (this._concern !== 'app') {
//                 let part = document.querySelector(`[part='${this._concern}']`),
//                     clone = part.cloneNode('deep');
//                 this._fragment.appendChild(clone);
//                 for (let diff in this._diff) {
//                     if (diff in this.links) {
//                         this.links[diff].forEach(link => this._fragment.querySelector(link[0])[link[1]] = this._diff[diff]);
//                     }
//                 }
//                 part.replaceWith(this._fragment);
//                 this._script();
//             }
//             return true;
//         };

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

// Create a private variable with specified set conditions to establish mutability. Pass false as the second parameter for absolute immutability. The value of the variable must be accessed with [YOUR_VAR_NAME].value, with 'value' being literal. Variables of type [Object] will be private on a deep level and values can be set/accessed by [YOUR_VAR_NAME].[YOUR_PROPERTY] or [YOUR_VAR_NAME].[YOUR_PROPERTY_1].[YOUR_PROPERTY_2], etc.
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

// Create a hierarchy of elements in the order that they are passed, with the first being top-level
export const family = (...members) => members.forEach((elt, i, elts) => { if (i > 0) elts[i-1].appendChild(elt) });

// Create a custom HTML element with a list of custom inner elements from an array of contents, with optional 'class' and 'id' attributes
export const list = (outerTag, innerTag, contents, className=false, id=false) => {
    let list = elt(outerTag, 'new');
    if (className) list.className = className;
    if (id) list.id = id;
    contents.forEach(item => list.appendChild(`<${innerTag}>${item}</${innertag}>`));
    return list;
};

// Create a valid HTML ul element from an array of contents, with optional 'class' and 'id' attributes
export const ul = (contents, className=false, id=false) => list('ul', 'li', contents, className, id);

// Create a valid HTML ol element from an array of contents, with optional 'class' and 'id' attributes
export const ol = (contents, className=false, id=false) => list('ol', 'li', contents, className, id);

// Create a valid HTML select element from an array of contents, with optional 'class' and 'id' attributes
export const select = (contents, className=false, id=false) => list('select', 'option', contents, className, id);

// Identify DOM elements by a variety of methods, defaulting with querySelector. Optionally create a new element by passing 'new' as the second parameter.
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

// Add an event listener to an element. Optionally set the fourth parameter to 'false' to allow page refreshing.
export const on = (event, elt, cb, preventDefault=true) => elt.addEventListener(event, evt => { 
    if (preventDefault) evt.preventDefault();
    cb();
})

// Add an event listener to an element that switches between two states. Defaults to handle click events.
export const toggle = (target, state, state1, state2, event='click') => on(event, target, _=> state = (state === state1) ? state2 : state1);

// Briefly adjust the innerHTML of an element
export const html = (el, inner) => elt(el).innerHTML = inner;


// Function Composition

// Resolve a nested array of any depth into a single level
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

// Set the opacity of passed elements to 1
export const show = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 1);

// Set the opacity of passed elements to 0
export const hide = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 0);

// Set the display of passed elements to none
export const kill = (...elts) => sift(elts).forEach(elt => elt.style.display = 'none');

// Set the display of passed elements to the first passed parameter
export const revive = (display, ...elts) => sift(elts).forEach(elt => elt.style.display = display);

// Either hide or kill an element and show or revive another, respectively
export const transition = (mode, from, to, display) => { 
    if (mode === 'hide') { hide(from); show(to) }
    else if (mode === 'kill') { kill(from), revive(display, to) }
};

// // 
// export const active = (css) => {
//     let active = [];
//     let inactive = [];
//     for (let part in V.P) (V.P[part].style[css] > 0 || V.P[part].style[css] != 'none') ? active.push({ part: V.P[part] }) : inactive.push({ part: V.P[part] });
//     return live ? active : inactive;
// };

// // Identify all shown elements if true is passed and all hidden elements if false is passed
// export const shown = (shown=true) => active('opacity', shown);

// // Identify all live elements if true is passed and all dead elements if false is passed
// export const live = (live=true) => active('display', live);


// Ajax

// Perform a custom AJAX request
export const ajax = (method, path, reqType, resType, body, cb) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, path);
    xhr.setRequestHeader('Content-Type', switchHeader(reqType));
    xhr.setRequestHeader('Accept', switchHeader(resType));
    xhr.send(body);
    xhr.onload = _=> cb;
};

// Perform an AJAX GET request
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

// Create a valid HTML table element from pre-structured data
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

// Merge objects with optional overwriting
export const meld = (overwrite, ...objs) => {
    const combination = {};
    for (let obj in objs) {
        for (let key in objs[obj]) {
            if (!overwrite && key in combination) {
                throw new Error(`Duplicate key: ${key}`);
            } else combination[key] = objs[obj][key];
        }
    }
    return combination;
};

// Find and remove a property from a deep object
export const hunt = (prey, object) => {
    if (prey in object) { delete object[prey] }
    else {
        for (let subObject in object) {
            if (prey in object[subObject]) { delete object[subObject][prey] }
            else hunt(prey, object[subObject]);
        }
    }
};

// Edit a property that is nested within a deep object by adding a property or changing its value
export const edit = (interest, object, value, key=null) => {
    if (interest in object) { 
        if (key) { object[interest][key] = value }
        else object[interest] = value
    } else {
        for (let subObject in object) {
            if (interest in object[subObject]) { 
                if (key) { object[subObject][interest][key] = value }
                else object[subObject][interest] = value
            }
            else edit(interest, object[subObject], value, key)
        }
    }
};

// Perform a deep freeze to make an object immutable. The effect can be reversed with 'thaw()' but the object will remain non-extensible.
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

// Restore mutability to an object that has been passed to 'freeze()' but not extensibility
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
    Store,
    // now,
    Private,
    pId,
    family,
    list,
    ul,
    ol,
    select,
    elt,
    on,
    toggle,
    html,
    sift,
    show,
    hide,
    kill,
    revive,
    transition,
    // active,
    // shown,
    // live,
    ajax,
    ajaxGet,
    table,
    meld,
    hunt,
    edit,
    freeze,
    thaw
};