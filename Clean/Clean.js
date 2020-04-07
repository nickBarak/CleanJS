
// // // // // CLIENT SIDE // // // // //




export class Part {
    constructor (id, domain, parent, contentGen, script, init={}) {
        this.id = id;
        this.state = init;
        this.parent = parent;
        this.meta = {domain, contentGen, script, init, diff: {}, fragment: new DocumentFragment(), renderFlag: 0};
        this.links = {};
        this.status = {visible: true, live: true, active: true, shown: true};
        this.dynasty = {[id]: {}};

        const handler = {
            get: (target, property, self) => {
                if (property === 'check target') console.log(this.id + ': ', target);
                if (property in this.meta.diff) delete this.meta.diff[property];
                return ['id', 'domain', 'state', 'legacy', 'dynasty', 'clear', 'toggle', 'link', 'links', 'render', 'check', 'live', 'parts', 'parent', 'kill', 'revive', 'status', 'meta', 'show', 'hide', 'activate', 'deactivate', 'blink'].includes(property)
                    ? target[property]
                    : ['diff', 'init', 'fragment', 'contentGen', 'script'].includes(property)
                        ? Reflect.get(target.meta, property, self)
                        : Reflect.get(target.state, property, self);
            },
            set: (target, property, value, self) => {
                if (['id', 'state', 'legacy', 'clear', 'toggle', 'link', 'links', 'render', 'check', 'parent', 'kill', 'revive', 'meta', 'diff', 'init', 'fragment', 'contenGen', 'script', 'store'].includes(property.replace(/_/g, '').toLowerCase())) {
                    console.log('State items may not resemble core part properties', `(${property})`)
                } else {
                    if (property === 'status') {
                        switch (value) {
                            case 'live': this[property].live = true; break;
                            case 'dead': this[property].live = false; break;
                            case 'active': this[property].active = true; break;
                            case 'inactive': this[property].active = false; break;
                            case 'shown': this[property].shown = true; break;
                            case 'hidden': this[property].shown = false; break;
                            default: console.log('Invalid condition');
                        }
                    }
                    if (property === 'dynasty') value[0] === 'add' ? edit(this[property], this.id, value[1], domain.parts[value[1]].dynasty[value[1]]) : hunt(value[1], this.dynasty);
                    if (this.state[property] !== value) {
                        this.state[property] = this.meta.diff[property] = value;
                        // this.render()
                    };
                }
            return true;
            }
        }

        let proxy = new Proxy(this, handler);
        if (domain) domain.parts = proxy;
        return proxy;
    };

    check(what) { what
        ? console.log(`${this.id} - ${what}: `, typeof(this[what]) === 'string'
                ? `"${this[what]}"`
                : this[what], `(${typeof(this[what])})`)
        : this['check target']; };
    link(observer, selector, route, attempt=0) {
        observer = splitRoute(observer, true);
        route = splitRoute(route, true);
        if (!this.links[observer]) this.links[observer] = {};
        if (!this.links[observer][route]) this.links[observer][route] = [];
        let newObservables = selector === 'store'
            ? ['[store]']
            : elt(selector)
                ? elt(selector, null, true).map(match => `[parts][${pluralize(match.id.split(' ')[0])}][${match.id}]`)
                : undefined;
        if (!newObservables) throw new Error(`No element found by selector "${selector}"`);
        newObservables.forEach(observable => this.links[observer][route].push(observable))
        let routes = [];
        for (let link in this.links[observer]) {
            for (let base in this.links[observer][link]) {
                routes.push(`${this.links[observer][link][base]}${route}`);
            }
        };
        let routeValue,
            i = 0;
        while (!routeValue && i < routes.length) {
            routeValue = parseRoute(routes[i], this.meta.domain);
            i++;
        };
        console.log(routes)
        
        if (!routeValue) {
            if (attempt < 10) {
                Promise.resolve().then(_=> {
                this.link(observer, selector, route, attempt+1);
                });
            } else throw new Error(`No value found for route "${route}" with selector "${selector}"`);
        } else {
            let splitObserver = splitRoute(observer);
            splitObserver.length === 1
                ? this[splitObserver[0]] = routeValue
                : edit(this.state, splitObserver[splitObserver.length - 2], splitObserver[splitObserver.length - 1, routeValue]);
            this.meta.domain.links = [this, observer, [...routes]];
        };
    };

    toggle(etarget, scope, state, state1, state2, event='click') { 
        elt(etarget, false, scope).addEventListener(event, _=> this[state] = (this[state] === state1) ? state2 : state1)
    };

    render() {
        if (this.id !== 'app') {
            if (elt('#'+this.id)) {
                let currentPart = elt('#'+this.id),
                    clone = currentPart.cloneNode('deep');
                this.meta.fragment.appendChild(clone);
                console.log('DIFF', this.meta.diff)
                for (let diff in this.meta.diff) {
                    if (diff in this.links) {
                        this.links[diff].forEach(route => this.meta.fragment.getElementById(this.id).querySelector(link[0])[link[1]] = this.meta.diff[diff]);
                    }
                }
                currentPart.replaceWith(this.meta.fragment);
            } else {
                let newElt = make(this.id.indexOf(' ') + 1 ? this.id.split(' ')[0] : this.id);
                newElt.setAttribute('id', this.id);
                newElt.innerHTML = this.meta.contentGen(this.id, this.meta.init);
                this.meta.fragment.appendChild(newElt);
                const renderAfterAncestors = _=> {
                    if (!elt('#'+this.id))
                        this.parent === 'app'
                            ? document.body.appendChild(this.meta.fragment)
                            : elt('#'+this.parent)
                                ? elt('#'+this.parent).appendChild(this.meta.fragment)
                                : Promise.resolve().then(_=> renderAfterAncestors());
                }
                renderAfterAncestors();
            }
            this.meta.script();
        }
    };

    kill() { this.status = 'live' };

    revive() { this.status = 'dead' };

    activate () { this.status = 'active' };

    deactivate() { this.status = 'inactive' };

    show() { this.status = 'shown' };
    
    hide() { this.status = 'hidden' };

    save() {  };

    load() {
        for (let property in this.state) { delete this.state[property] }
        if (Object.entries(domain.legacy[this.id]).length) {
            for (let property in this.domain.legacy[this.id]) { this[property] = domain.legacy[this.id][property] }
        }
    };

    pull() {  };

    clear() {
        for (let property in this.state) { delete this.state[property] }
        if (Object.entries(this.meta.init).length) {
            for (let property in this.meta.init) { this[property] = this.meta.init[property] }
        }
    };

    blink(observerRoute, value) {
        let splitObserver = splitRoute(observerRoute);
        parseRoute(observerRoute, this.state)
            ? splitObserver.length === 1
                ? this[splitObserver[0]] = value
                : edit(this.state, splitObserver[splitObserver.length - 2], observerRoute.length - 1, value)
            : {};
    };
};

export class Nexus {
    constructor(id) {
        this.id = id;
        this.parts = {};
        this.dynasty = { app: {} };
        this.live = [];
        this.store = {};
        this.links = {};

        const handler = {
            get: (target, property, self) => {
                if (property === 'check target') console.log(this.id + ': ', target);
                return ['check', 'store', 'dynasty', 'live', 'parts' , 'links', 'id'].includes(property) ? target[property] : Reflect.get(target.store, property, self);
            },
            set: (target, property, value, self) => {
                if (['id', 'dynasty', 'check', 'store'].includes(property.replace(/_/g, '').toLowerCase())) {
                    console.log('Store items may not resemble core part properties', `(${property})`)
                } else {
                    if (property === 'parts') {
                        let partClass = pluralize(value.id.split(' ')[0]);
                        if (!this.parts[partClass] && value instanceof Part) this.parts[partClass] = {};
                        value instanceof Part ? this.parts[partClass][value.id] = value : console.log('Parts must be instances of the Part class');
                    } /*********************************/
                    else if (property === 'live') {
                        if (value[0] === 'add') {
                            this.live.push(value[1]);
                            if (this.parts[value[1]]) {
                                edit(this.dynasty, this.parts[value[1]].parent, value[1], {});
                                edit(this.parts[value[1]].status, 'live', null, true);
                                if (this.parts[value[1]].parent !== 'app') {
                                    this.parts[this.parts[value[1]].parent].dynasty = value;
                                }
                                this.parts[value[1]].render();/******** */
                            } else {
                                Promise.resolve().then(_=> {
                                    edit(this.dynasty, this.parts[value[1]].parent, value[1], {});
                                    edit(this.parts[value[1]].status, 'live', null, true);
                                    if (this.parts[value[1]].parent !== 'app') {
                                        this.parts[this.parts[value[1]].parent].dynasty = value;
                                    }
                                });
                            }
                        } else {
                            if (this.live.includes(value[1])) {
                            this.live = this.live.filter(part => part !== value[1]);
                            hunt(value[1], this.dynasty, true);
                            // hunt(value[1], this.parts[value[2]].dynasty);
                            if (elt('#'+value[1])) elt('#'+value[1]).parentNode.removeChild(elt('#'+value[1]));
                            edit(this.parts[value[1]].status, 'live', null, false);
                            }
                        }
                    }
                    else if (property === 'links') {
                        value[0] instanceof Part
                            ? value[2].forEach(route => {
                                if (!this.links[route]) this.links[route] = [];
                                this.links[route].push([value[0].id, value[1]]);
                                })
                            : console.log('Linked object must of an instance of the Part class')
                    } 
                    else {
                        if (this.store[property] !== value) {
                            this.store[property] = value;
                            let route = `${trail(property, this.store) ? '[store]' + trail(property, this.store) : '[store]'}[${property}]`,
                                links = this.links[route];
                            links
                                ? links.length 
                                    ? links.forEach(link => {
                                        this.parts[pluralize(link[0].split(' ')[0])][link[0]].blink(link[1], value)})
                                    : {}
                                : {}; 
                        }
                    }
                return true;
                }
            }
        }
        return new Proxy(this, handler);
    };

    check(what) { what
        ? console.log(`${this.id} - ${what}: `, typeof(this[what]) === 'string'
                ? `"${this[what]}"`
                : this[what], `(${typeof(this[what])})`)
        : this['check target'];
    };

    update(observable, value) { 
        hunt(observable, this.links).forEach(observer => {
        this.parts[observer[0].split(' ')[0]][observer[0]].blink(observer[1], value)
        })
    };
}


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

// Create a new element, optionally passing innerHTML and children values
export const make = (tag, innerHTML, children) => {
    let elt = document.createElement(tag);
    if (innerHTML) elt.innerHTML = innerHTML;
    if (children) children.forEach(child => elt.appendChild(child));
    return elt;
};

// Create a custom HTML element with a list of custom inner elements from an array of contents, with optional 'class' and 'id' attributes
export const list = (outerTag, innerTag, contents, className=false, id=false) => {
    let list = make(outerTag);
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
export const elt = (name, scope=document, array=false) => {
    if (scope === null) scope = document
    let res,
        all = name.endsWith('*') ? 1 : 0,
        name1 = all ? name.slice(1, name.length-1) : name.slice(1);
    if (scope === document) {
        if (!name1.match(/[\.\[\#>]/) && !name1.match(/ [A-Za-z]/)) {
            switch (name[0]) {
                case '#': res = scope.getElementById(name1); break;
                case '.': res = scope.getElementsByClassName(name1); break;
                case '@': res = scope.getElementsByName(name1); break;
                default: res = scope.getElementsByTagName(name[0]+name1);
            }
        } else res = scope.querySelectorAll(name[0]+name1);
    } else res = document.getElementById(scope)
        ? document.getElementById(scope).querySelectorAll(name[0]+name1)
        : null;
    return res
        ? res.nodeType
            ? array ? [res] : res
            : all ? array ? [...res] : res : array ? [res[0]] : res[0]
        : null;
};


export const css = element => /* return element selector */{};

// Add an event listener to an element. Optionally set the fourth parameter to 'false' to allow page refreshing.
export const on = (event, element, callback, preventDefault=true) => element.addEventListener(event, evt => { 
    callback();
    if (preventDefault) evt.preventDefault();
});

// Listen to events triggered by nested elements identified by a selector
export const bubble = (event, selector, callback, preventDefault=true, observer=document) => {
    on(event, observer, evt => {
        if (evt.target.closest(selector)) {
            callback();
        }
    }, preventDefault)
};

export const onClick = (element, callback, preventDefault=true) => on('click', element, callback, preventDefault);

export const onSubmit = (element, callback, preventDefault=true) => on('submit', element, callback, preventDefault);

export const onChange = (element, callback, preventDefault=true) => on('change', element, callback, preventDefault);

export const onHover = (element, onmouseover, onmouseout, preventDefault=true) => {
    on('mouseover', element, onmouseover, preventDefault);
    on('mouseout', element, onmouseout, preventDefault);
};

// Add an event listener to an element that switches between two states. Defaults to handle click events.
export const toggle = (target, state, state1, state2, event='click') => on(event, target, _=> state = (state === state1) ? state2 : state1);

// Briefly adjust the innerHTML of any elements identified by a selector
export const html = (selector, innerHTML) => {
    let elts = elt(selector);
    elts.length > 1
        ? elts.forEach(elt => elt.innerHTML = innerHTML)
        : elts.innerHTML = innerHTML;
};


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


// Part0 Activation

// Set the opacity of passed elements to 1
export const show = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 1);

// Set the opacity of passed elements to 0
export const hide = (...elts) => sift(elts).forEach(elt => elt.style.opacity = 0);

// Set the display of passed elements to none
export const kill = (...elts) => sift(elts).forEach(elt => elt.style.display = 'none');

// Set the display of passed elements to the first passed parameter
export const revive = (display, ...elts) => sift(elts).forEach(elt => elt.style.display = display);

// Either hide or kill an element and show or revive another, respectively
export const shift = (mode, from, to, display) => { 
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
    let table = make('table');
    let columns = make('tr');
    for (let column in data[0]) {
        let th = make('th', column);
        columns.appendChild(th);
    }
    for (let item in data) {
        let row = make('tr');
        for (let prop in item) {
            let td = make('td', data[item][prop]);
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
export const hunt = (prey, object, kill=false) => {
    if (prey in object) { delete object[prey] }
    else {
        for (let subObject in object) {
            if (prey in object[subObject]) { 
                return kill
                    ? delete object[subObject][prey]
                    : object[subObject][prey]
            }
            else hunt(prey, object[subObject]);
        }
    }
};

// Edit a property that is nested within a deep object by adding a property or changing its value
export const edit = (object, key, newkey, value) => {
    if (key in object) { 
        if (newkey) { object[key][newkey] = value }
        else object[key] = value
    } else {
        for (let subObject in object) {
            if (key in object[subObject]) { 
                if (newkey) { object[subObject][key][newkey] = value }
                else object[subObject][key] = value
            }
            else edit(object[subObject], key, newkey, value)
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
};

export const splitRoute = (route, recombine=false) => {
    route = route
        .replace(/^\./, '')
        .replace(/[\]\"\']/g, '')
        .replace(/[\.\[]/g, '$*@#')
        .split('$*@#')
    if (route.indexOf('') + 1) route.splice(route.indexOf(''), 1);
    return recombine
        ? route.length > 1
            ? `[${route[0]}][${route.slice(1).join('][')}]`
            : `[${route[0]}]`
        : route;
};

export const trail = (key, object, ...marks) => {
    if (key in object) return null;
    else {
        for (let subObject in object) {
            if (key in object[subObject]) {
                marks.push(subObject);
                return `${marks[0] ? `[${marks[0]}]` : ''}[${marks.join('][')}]`;
            }
            else {
                marks.push(subObject);
                trail(key, object[subObject], marks);
            }
        }
    }
}

// Return a nested value from an object with a route in the form of a string. Supports both dot and bracket notation
export const parseRoute = (route, object) => {
    splitRoute(route).forEach(prop => object = (object && object[prop]) ? object[prop] : undefined)
    return object
};

export const pluralize = string => 
    ['s', 'x', 'z'].includes(string[string.length - 1])
        ? string + 'es'
        : string.endsWith('h')
            ? ['c', 's'].includes(string[string.length - 2])
                ? string + 'es'
                : string + 's'
            : string + 's';

// Animation

//slideup / slidedown, slideleft, slideright
//requestAnimationFrame();

export default {
    Part,
    Nexus,
    // now,
    // Eye,
    Private,
    family,
    make,
    list,
    ul,
    ol,
    select,
    elt,
    on,
    bubble,
    onClick,
    onSubmit,
    onHover,
    onChange,
    toggle,
    html,
    sift,
    show,
    hide,
    kill,
    revive,
    shift,
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
    thaw,
    trail,
    splitRoute,
    parseRoute,
    pluralize
};