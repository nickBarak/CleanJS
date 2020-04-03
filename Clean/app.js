import { Part, Private, family, make, list, ul, ol, select, elt, on, bubble, onClick, onSubmit, onHover, onChange, toggle, html, sift, show, hide, kill, revive, transition, ajax, ajaxGet, table, meld, hunt, edit, freeze, thaw } from './Clean.js'


const homeContent = (place, data) => `<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ddd" fill-opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>
<h1 id="title">${data.greeting} to ${data.title}</h1>
${ChangeStateButton(place).outerHTML}
<div id="lowerSvg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 319"><path fill="#7a7aa3" fill-opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>`;

const changeStateButtonContent = (place, data) => `<button id="stateBtn">asdf</button>
${Footer(place).outerHTML}
`;

const footerContent = (place, data) => `<div id="footerDiv">and your <strong>${data.footerValue}</strong> last</div>`;


const now = new Part('app');

const partCounts = {
Header: 0,
Footer: 0,
ChangeStateButton: 0,
Home: 0
}

const newInstance = part => {
    const partName = `${part}${partCounts[part] ? ' '+partCounts[part] : ''}`;
    partCounts[part]++;
    let newElt = document.createElement(part);
    newElt.setAttribute('id', partName);
    return newElt;
};

const Home = (place='app', data={}, traps={}) => {
    const instance = (_=> {
        const script = _=> {
            const node = elt('#'+pId);
                node.appendChild(make('div', 'shabooya'));
    let title = elt('#title', pId),
        footer = elt('Footer', pId);

    onClick(title, _=> {
        !now.parts[pId].status.active ? part.activate() : part.deactivate();
        part.check('status')
    });
},
            stateInit = meld(true, { title: 'CleanJS', greeting: 'Welcome' }, data),
            trapsInit = meld(true, {}, traps),
            partElt = newInstance('Home'),
            pId = partElt.id,
            part = new Part(pId, now, place, homeContent, script, stateInit, trapsInit),
            fragment = new DocumentFragment();
        fragment.appendChild(partElt);
        fragment.getElementById(pId).innerHTML = homeContent(pId, stateInit);
        if (place) { place === 'app'
            ? document.body.appendChild(partElt)
            : elt('#'+place)
                ? elt('#'+place).appendChild(partElt)
                : {};
        };
        script();
        return partElt;
    })();
    return instance;
};

const ChangeStateButton = (place='app', data={}, traps={}) => {
    const instance = (_=> {
        const script = _=> {
            const node = elt('#'+pId);
                // const changeStateBtn = document.querySelector('[piece=changeStateBtn]');
    // const stateBtnStore = new Store(
    //     'stateBtn', 
    //     { text: 'Success!' },
    //     { set: 'if (prop === \'text\') changeStateBtn.innerHTML = value;' }
    // );
    // changeStateBtn.addEventListener('click', _=> stateBtnStore.text = stateBtnStore.text === 'Try changing state!' ? 'Success!' : 'Try changing state!');
    // changeStateBtn.click();
    // stateBtnStore.onClear = {someKey: 'someVal'};
    // now.check()
    // let apps = { dynasty: { app: {} } } 
    // console.log(now)
    // now.check('target')


    // let btn = elt('#changeStateButton');
    // store.toggle(btn, 'text', 'State 1', 'State 2');
    // store.link('text', [btn, 'textContent']);
},
            stateInit = meld(true, {}, data),
            trapsInit = meld(true, {}, traps),
            partElt = newInstance('ChangeStateButton'),
            pId = partElt.id,
            part = new Part(pId, now, place, changeStateButtonContent, script, stateInit, trapsInit),
            fragment = new DocumentFragment();
        fragment.appendChild(partElt);
        fragment.getElementById(pId).innerHTML = changeStateButtonContent(pId, stateInit);
        if (place) { place === 'app'
            ? document.body.appendChild(partElt)
            : elt('#'+place)
                ? elt('#'+place).appendChild(partElt)
                : {};
        };
        script();
        return partElt;
    })();
    return instance;
};

const Footer = (place='app', data={}, traps={}) => {
    const instance = (_=> {
        const script = _=> {
            const node = elt('#'+pId);
                // console.log(homeStore);
    let a = 'b';
},
            stateInit = meld(true, {
        someFirstKey: 97983244,
        footerValue: 'Some other thing'
    }, data),
            trapsInit = meld(true, {}, traps),
            partElt = newInstance('Footer'),
            pId = partElt.id,
            part = new Part(pId, now, place, footerContent, script, stateInit, trapsInit),
            fragment = new DocumentFragment();
        fragment.appendChild(partElt);
        fragment.getElementById(pId).innerHTML = footerContent(pId, stateInit);
        if (place) { place === 'app'
            ? document.body.appendChild(partElt)
            : elt('#'+place)
                ? elt('#'+place).appendChild(partElt)
                : {};
        };
        script();
        return partElt;
    })();
    return instance;
};


Home('app', {title: `pgood mate`, greeting: 'Go away'});
Footer('app', {randomKey: 'randomVal', footerValue: 'SHA-BOO-YA'}, {onetrap: _=> console.log("henlo")});
Home('app', {title: 9097, greeting: 'soksdf'});

now.check()