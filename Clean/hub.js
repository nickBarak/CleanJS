import fs from 'fs';
import { elt, family } from './Clean';

const parts = [
    {
        Header: {
            index: 0,
            parent: 'body',
            params: 'null',
            content: fs.readFileSync(`texts/common/Header.html`, 'utf8')
        }
    },
    {
        Home: {
            index: 1,
            parent: 'body',
            params: 'null',
            content: fs.readFileSync(`texts/Home.html`, 'utf8')
        }
    },
    {
        ChangeStateButton: {
            index: 2,
            parent: 'body',
            params: 'null',
            content: fs.readFileSync(`texts/buttons/ChangeStateButton.html`, 'utf8')
        }
    },
    {
        Footer: {
            index: 9999,
            parent: 'body',
            params: 'null',
            content: fs.readFileSync(`texts/common/Footer.html`, 'utf8')
        }
    }
];

parts.forEach(part => document.body.innerHTML += `<${Object.keys(part)[0]}>${Object.values(part)[0].content.replace(/<script>(\n?[\r?]*.*)*<\/script>/g, '')}</${Object.keys(part)[0]}>`);

let scripts = parts.map(part => { if (Object.values(part)[0].content
    .match(/<script>/)) return Object.values(part)[0].content
    .match(/<script>(\n?[\r?]*.*)*<\/script>/g, '')
        .map(script => script
            .replace(/<script>/g, '')
            .replace(/<\/script>/g, ''))
                .map(script => document.createTextNode(script))[0] })
                    .filter(script => typeof(script) !== 'undefined');

scripts.forEach(script => family(document.body, document.createElement('script'), script));