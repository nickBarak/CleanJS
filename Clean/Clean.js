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

export class Store {
    constructor (concern, init={}, traps={}, push=null) {
        if (concern) { this._concern = concern 
        } else throw new Error('Stores must be initialized with a concern');
        this._diff = {};
        this._init = init;
        this.state = {};

        if (Object.entries(init).length) {
            for (let entry in init) { this.state[entry] = init[entry] }
        };
        const handler = {
            get: (target, prop, self) => {
                if (prop in this._diff) { delete this._diff[prop] }
                return ['_concern', '_diff', '_init', 'state', '__clear__'].includes(prop) ? target[prop] : Reflect.get(target.state, prop, self)
            },
            set: (target, prop, value, self) => {
                if ('concern,diff,init,state'.match(prop.replace(/_/g, '').toLowerCase())) {
                    console.log('State items may not resemble top-level properties')
                } else this._diff[prop] = this.state[prop] = value;
                return true;
            }
        };
        
        if (Object.entries(traps).length) {
            for (let trap in traps) { 
                if (trap === 'set' || trap === 'get') {
                    let val = handler[trap];
                    val = `${val}`.split('return');
                    val.splice(1, 0, 'return');
                    val.splice(1, 0, `${traps[trap]}`);
                    val.unshift('(');
                    val.push(')');
                    handler[trap] = eval(val.join(''));
                } else handler[trap] = eval(traps[trap]);
            }
            if (push) {
                for (trap in handler) {
                    let val = handler[trap];
                    val = `${val}`.split('return');
                    val.splice(1, 0, 'return');
                    val.splice(1, 0, `\nif (this._diff.length) {
                        for (let prop in this._diff) { push[prop] = this._diff[prop] }
                    }\n`);
                    val.unshift('(');
                    val.push(')')
                    handler[trap] = eval(val.join(''));
                }
            }
        }

        return new Proxy(this, handler)
    };

    __clear__() {
        for (let prop in this.state) { delete this.state[prop] }
        if (Object.entries(this._init).length) {
                for (let prop in this._init) { this[prop] = this._init[prop] }
        }
    };
};

export const now = new Store('app');


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
        default: document.querySelector(name); break;
        case 'all': document.querySelectorAll(name); break;
        case 'new': document.createElement(name); break;
        case 'id': document.getElementById(name); break;
        case 'class': document.getElementsByClassName(name)[0]; break;
        case 'classes': document.getElementsByClassName(name); break;
        case 'tag': document.getElementsByTagName(name)[0]; break;
        case 'tags': document.getElementsByTagName(name); break;
        case 'name': document.getElementsByName(name)[0]; break;
        case 'names': document.getElementsByName(name);
    }
}

export const on = (event, elt, cb, preventDefault=true) => elt.addEventListener(event, evt => { 
    if (preventDefault) evt.preventDefault();
    cb();
})


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
    xhr.setRequestHeader('Content-Type', switchType(reqType));
    xhr.setRequestHeader('Accept', switchType(resType));
    xhr.send(body);
    xhr.onload = _=> cb;
}
export const ajaxGet = (path, cb) => ajax('GET', path, 'json', 'json', '', cb);

const switchType = type => {
    switch (type) {
        //aplication
        case 'json': type = 'application/json'; break;
        case 'www': type = 'application/x-www-urlencoded'; break;
        case 'js': type = 'application/javascript'; break;
        case 'ogg': type = 'application/ogg'; break;
        case 'pdf': type = 'application/pdf'; break;
        case 'flash': type = 'application/x-shockwave-flash'; break;
        case 'zip': type = 'application/zip'; break;
        // text
        case 'css': type = 'text/css'; break;
        case 'csv': 'text/csv'; break;
        case 'html': type = 'text/html'; break;
        case 'plain': type = 'text/plain'; break;
        // image
        case 'gif': type = 'image/gif'; break;
        case 'jpeg': type = 'image/jpeg'; break;
        case 'png': type = 'image/png'; break;
        case 'tiff': type = 'image/tiff'; break;
        case 'icon': type = 'image/x-icon'; break;
        // audio
        case 'wav': type = 'audio/x-wav'; break; 
        // video
        case 'quicktime': type = 'video/quicktime'; break;    
        case 'msvideo': type = 'video/x-msvideo'; break;    
        case 'flv': type = 'video/x-flv'; break;   
        case 'webm': type = 'video/webm'; break; 
        // multipart
        case 'mixed': type = 'multipart/mixed'; break;    
        case 'alt': type = 'multipart/alternative'; break;   
        case 'related': type = 'multipart/related'; break;  
        case 'form': type = 'multipart/form-data'; break;
        
        default: type = type;
    }
    return type;
};


// Data Handling

//hydrate data (join tables)

let table = (data) => {
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


// Animation

//slideup / slidedown, slideleft, slideright
//requestAnimationFrame();
