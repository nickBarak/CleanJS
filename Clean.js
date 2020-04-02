const fs = require('fs');
const path = require('path');
const { Client } = require('pg');


// FileSystem

const walk = (targetdir, filetype, encoding='utf8', localpath=null) => {
    let retrieved = [],
        innerWalk = (currentPath, dir, filetype, encoding) => {
            let newPath = dir
                    ? path.join(currentPath, dir)
                    : currentPath,
                dirContents = fs.readdirSync(newPath, encoding) || [],
                files = dirContents.filter(item => item.match(`.${filetype}`)) || [],
                folders = dirContents.filter(item => !item.match(/\./)) || [];
            files.forEach(file => retrieved.push(path.join(newPath, file)));
            folders.forEach(folder => innerWalk(newPath, folder, filetype, encoding));
        };
    innerWalk(targetdir, '', filetype, encoding)
    return localpath === null
        ? retrieved
        : localpath
            ? retrieved.map(file => path.join(localpath, file.replace(targetdir, '')).replace(/\\/g, '/'))
            : retrieved.map(file => file.replace(targetdir, '').replace(/\\/g, '/').replace('/', ''));
};

const locate = (filename, targetdir, encoding='utf8', localpath=null) => {
    return walk(targetdir, filename.split('.')[1], encoding, localpath)
        .find(file => {
            if (file.match('\/' + filename)) { return file.match('\/' + filename).length > 0 }
            else if (file.match('\\' + filename)) { return file.match('\\' + filename).length > 0 }
            else return false
        })
};

const extract = (filename, targetdir, encoding='utf8') => locate(filename, targetdir, encoding)
        ? fs.readFileSync(locate(filename, targetdir, encoding), encoding)
        : console.log(`No corresponding ${filename} file found for ${'<'+filename.split('.')[0]+'/>'} element.`);

const bootstrapHTML = (sourcefile, targetdir, encoding='utf8') => {
    let initializers = [],
        src = polish(fs.readFileSync(sourcefile, encoding)),
        getMatches = content => content.match(/<[A-Z].*>/) != null
                    ? content.match(/<([A-Z]\w*).*><\/\1>/g)
                    : null,
        innerBootstrapHTML = match => {
        let parent = /[A-Z]\w*/.exec(match),
            newContent = polish(extract(parent+'.html', targetdir, encoding).split(/[\r\n]+<script/)[0]);
            if (getMatches(newContent)) getMatches(newContent).forEach(newMatch => {
                let data = /(?:data ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(newMatch),
                    traps = /(?:traps ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(newMatch),
                    initializer = `${/[A-Z]\w*/.exec(newMatch)}(place${data ? ', '+data[2] : ''}${traps ? ', '+traps[2] : ''})`;
                initializers.push(initializer);
                src = src.replace(newMatch, '\${'+initializer+'.outerHTML}');
                innerBootstrapHTML(newMatch);
            });
            
            // let trimmedMatch = match,
            //     configs = initializers[initializers.length-1];
            // for (config in configs) {
            //     if (config !== 'id') trimmedMatch = trimmedMatch.replace(config+'="'+configs[config]+'"', '').replace(config+"='"+configs[config]+"'", '')
            // }
    };
    if (getMatches(src)) getMatches(src).forEach(match => {
        let data = /(?:data ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match),
            traps = /(?:traps ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match),
            initializer;
        if (/([A-Z][\w]*?)\.htm/.exec(sourcefile)) {
            initializer = `${/[A-Z]\w*/.exec(match)}(place${data ? ', '+data[2] : ''}${traps ? ', '+traps[2] : ''})`;
            innerBootstrapHTML(match);
        } else {
            initializer = `${/[A-Z]\w*/.exec(match)}('app'${data ? ', '+data[2] : ''}${traps ? ', '+traps[2] : ''})`;
        }
        initializers.push(initializer);
        src = src.replace(match, '\${'+initializer+'.outerHTML}');
    })
    return [polish(src), initializers]
};

const compile = (dirname, targetlocalpath, destination, encoding='utf8') => {
    let fullpath = path.join(dirname, targetlocalpath)
        imports = ["import { Part, Private, family, list, ul, ol, select, elt, on, bubble, onClick, onSubmit, onHover, onChange, toggle, html, sift, show, hide, kill, revive, transition, ajax, ajaxGet, table, meld, hunt, edit, freeze, thaw } from './Clean.js'"],
        scripts = ["const now = new Part('app');", `const partCounts = {\r\n}`, 
`const newInstance = part => {
    const partName = \`\${part}\${partCounts[part] ? ' '+partCounts[part] : ''}\`;
    partCounts[part]++;
    let newElt = document.createElement(part);
    newElt.setAttribute('id', partName);
    return newElt;
};`],
        texts = [],
        initialRender = bootstrapHTML(path.join(dirname, 'model.html'), fullpath)[1].map(initializer => initializer.replace(/\((null)/, '(document.body')+';');
    walk(fullpath, 'html', encoding)
        .forEach(file => {
            let filename = /(?<=\/?\\?)(\w*)\./.exec(file)[1],
                content = fs.readFileSync(file, encoding),
                storeDefaults = content.match(/<store[\s\S]*<\/store>/) ? content.match(/<store[\s\S]*<\/store>/)[0] : null;
            if (content.match(/<script/)) {
                [polish(content)
                    .match(/<script.*>[\s\S]*<\/script>/)[0]
                    .replace(/<\/script>/, '')
                    .replace(/\r\n/, '')]
                    .filter(script => typeof(script) !== 'undefined' && script.match(/\w/))
                    .forEach(script => {
                        if (script.match(/import.*/)) {
                            script
                                .match(/import.*/g)
                                .forEach(item => imports.push(item));
                            script.replace(/import.*/g, '');
                        }
                        scripts.push(
`const ${filename} = (place='app', data={}, traps={}) => {
    const instance = (_=> {
        const script = _=> {
            ${script.split(/<script.*>/)[1]}},
            stateInit = meld(true, ${storeDefaults ? /state: ([\s\S]*?})/.exec(storeDefaults)[1].match(/\w/) ? /state: ([\s\S]*?})/.exec(storeDefaults)[1] : '{}' : '{}'}, data),
            trapsInit = meld(true, ${storeDefaults ? /traps: ([\s\S]*?})/.exec(storeDefaults)[1].match(/\w/) ? /traps: ([\s\S]*?})/.exec(storeDefaults)[1] : '{}' : '{}'}, traps),
            partElt = newInstance('${filename}'),
            pId = partElt.id,
            part = new Part(pId, now, place, ${filename[0].toLowerCase()+filename.slice(1)}Content, script, stateInit, trapsInit),
            fragment = new DocumentFragment();
        fragment.appendChild(partElt);
        fragment.getElementById(pId).innerHTML = ${filename[0].toLowerCase()+filename.slice(1)}Content(pId, stateInit);
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
};`);
                    });
            };
            texts.push(`const ${filename[0].toLowerCase()+filename.slice(1)}Content = (place, data) => \`${bootstrapHTML(locate(filename+'.html', fullpath), fullpath)[0].split('\r\n\r\n<script')[0].replace(/( |>(?<=<.*?))(?=data\..*?(?: |<\/.*?>))/g, '$1\${').replace(/(\s|<)(?<=\${data\.[^\s<]*?(\s|<))/g, '}$1')}\`;`);
            scripts[1] = scripts[1].split('{\r\n')[0]+`{\r\n${filename}: 0${scripts[1].split('{\r\n')[1] === '}' ? '\r\n' : ',\r\n'}`+scripts[1].split('{\r\n')[1];
        });
    let usedParts = scripts.map(script => /const ([\w\d]*)/.exec(script)[1]);
    imports = imports.join('\n');
    initialRender = initialRender.filter(part => usedParts.includes(part.split('(')[0])).join('\n');
    texts = texts.filter(text => text.split('=> ')[1].length>3).join('\n\n');
    scripts = scripts.join('\n\n');
    // fs.writeFileSync(path.join(dirname, 'index.html'), bootstrapHTML(path.join(dirname, 'model.html'), fullpath), 'utf8');
    fs.writeFileSync(destination, [imports, texts, scripts, initialRender].join('\n\n\n'), {encoding});
};

const polish = (code, encoding='utf8') => {
    let cleanCode = code.match(/\.(js|ts|html)$/)
        ? fs.readFileSync(code, encoding)
        : code;
    if (cleanCode) cleanCode = cleanCode
        .replace(/(?<=<!--)[\s\S]*?(?=-->)/g, '')
        .replace(/<!---->/g, '')
        .replace(/\/\*[\s\S]*\*\//g, '')
        // .replace(/ *?\/\/.*\r\n/g, '')
        // .replace(/ +/g, ' ')
        // .replace(/[\r\n]+(?<=\r\n\r\n)/g, '\r\n\r\n');
    if (code.match(/\.(js|ts|html)$/)) fs.writeFileSync(code, cleanCode, encoding);
    return cleanCode;
};


// Request Handling

const allow = (res, clientURL) => {
    res.setHeader('Access-Control-Allow-Origin', clientURL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
};


// Database Connection

let db;

const pg = connectionString => {
    if (!db) {
        db = new Client({ connectionString: connectionString || process.env.DATABASE });
        db.connect()
            .then(_=> console.log('Connected to PostgreSQL'))
            .catch(e => console.log(e));
    }
    return db;
};

module.exports = {
    walk,
    locate,
    extract,
    bootstrapHTML,
    compile,
    polish,
    allow,
    pg
};