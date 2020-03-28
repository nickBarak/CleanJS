import { Store, Private, pId, family, list, ul, ol, select, elt, on, toggle, html, sift, show, hide, kill, revive, transition, ajax, ajaxGet, table, meld, hunt, edit, freeze, thaw } from './Clean.js'


const homeContent = data => `<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ddd" fill-opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>
<h1 id="title">${data.greeting} to ${data.title}</h1>
${ChangeStateButton('Home').outerHTML}
<div id="lowerSvg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 319"><path fill="#7a7aa3" fill-opacity="1" d="M0,160L48,138.7C96,117,192,75,288,58.7C384,43,480,53,576,85.3C672,117,768,171,864,197.3C960,224,1056,224,1152,192C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>`;

const changeStateButtonContent = data => `<button id="changeStateBtn"></button>
${Footer('ChangeStateButton').outerHTML}
`;

const footerContent = data => `<div id="footerDiv">and your <strong>${data.footerValue}</strong> last</div>`;


const now = new Store('app');

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

            newElt.setAttribute('pId', partName);

            return newElt;

        };

const Home = (place='top', data={}, traps={}) => {

                            const instance = (_=> {

                                const script = _=> {

                                        store.link('titleText', ['#title', 'textContent']);
    store.toggle('#title', 'titleText', 'Enjoy your stay', 'Welcome to CleanJS');
    // on('click', elt('#title'), _=> now._activeParts = ['remove', 'Footer']);
    // on('click', elt('#title'), _=> now._activeParts = ['add', 'Footer']);


                                },

                                    stateInit = meld(true, { title: 'CleanJS', greeting: 'Welcome' }, data),

                                    trapsInit = meld(true, {}, traps),

                                    part = newInstance('Home'),

                                    store = new Store(part.getAttribute('pId'), now, place, script, stateInit, trapsInit),

                                    fragment = new DocumentFragment();

                                fragment.appendChild(part);
                                fragment.querySelector(`[pId='${part.getAttribute("pId")}']`).innerHTML = homeContent(stateInit);

                                if (place) { place === 'top'

                                    ? document.body.appendChild(part)

                                    : pId(place)

                                        ? pId(place).appendChild(part)

                                        : {};

                                };

                                script();

                                return part;

                            })();

                            return instance;

                        };

const ChangeStateButton = (place='top', data={}, traps={}) => {

                            const instance = (_=> {

                                const script = _=> {

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

                                    part = newInstance('ChangeStateButton'),

                                    store = new Store(part.getAttribute('pId'), now, place, script, stateInit, trapsInit),

                                    fragment = new DocumentFragment();

                                fragment.appendChild(part);
                                fragment.querySelector(`[pId='${part.getAttribute("pId")}']`).innerHTML = changeStateButtonContent(stateInit);

                                if (place) { place === 'top'

                                    ? document.body.appendChild(part)

                                    : pId(place)

                                        ? pId(place).appendChild(part)

                                        : {};

                                };

                                script();

                                return part;

                            })();

                            return instance;

                        };

const Footer = (place='top', data={}, traps={}) => {

                            const instance = (_=> {

                                const script = _=> {

                                        // console.log(homeStore);
    let a = 'b';


                                },

                                    stateInit = meld(true, {
        footerValue: 'WORKING'
    }, data),

                                    trapsInit = meld(true, {

    }, traps),

                                    part = newInstance('Footer'),

                                    store = new Store(part.getAttribute('pId'), now, place, script, stateInit, trapsInit),

                                    fragment = new DocumentFragment();

                                fragment.appendChild(part);
                                fragment.querySelector(`[pId='${part.getAttribute("pId")}']`).innerHTML = footerContent(stateInit);

                                if (place) { place === 'top'

                                    ? document.body.appendChild(part)

                                    : pId(place)

                                        ? pId(place).appendChild(part)

                                        : {};

                                };

                                script();

                                return part;

                            })();

                            return instance;

                        };


Home('top', {title: `pgood mate`, greeting: 'Go away'});
Footer('top', {randomKey: 'randomVal', footerValue: 'SHA-BOO-YA'}, {onetrap: _=> console.log("henlo")});

now.check()