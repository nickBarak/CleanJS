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
        let tagname = /[A-Z]\w*/.exec(match),
            newContent = polish(extract(tagname+'.html', targetdir, encoding).split(/[\r\n]+<script/)[0]);
        if (/id\=/.exec(match)) {
            let id = /(?:id ?= ?)(?:['" ]?)(.*?)(?:['"])(?:\w.*=)?/.exec(match),
                init = /(?:init ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match),
                traps = /(?:traps ?= ?)("|')(.*?)\1(?=( *>| \w.*=))/.exec(match);
            initializers.push({id: id ? id[1] : id, init: init ? init[2] : init, traps: traps ? traps[2] : traps})
            let trimmedMatch = match,
                configs = initializers[initializers.length-1];
            for (config in configs) {
                if (config !== 'id') trimmedMatch = trimmedMatch.replace(config+'="'+configs[config]+'"', '').replace(config+"='"+configs[config]+"'", '')
            }
            src = src.replace(match, `${trimmedMatch.split('><')[0]}>${newContent}<${trimmedMatch.split('><')[1]}`)
            if (getMatches(newContent)) getMatches(newContent).forEach(match => innerBootstrapHTML(match))
        } else throw new Error(`Missing 'id' attribute for <${tagname}/> in ${locate(tagname+'.html', targetdir, encoding)}`)
        if (getMatches(newContent) != null) getMatches(newContent).forEach(match => innerBootstrapHTML(match))
    };
    if (getMatches(src)) getMatches(src).forEach(match => innerBootstrapHTML(match))
    return polish(src)
};

const compile = (dirname, targetlocalpath, destination, encoding='utf8') => {
    let fullpath = path.join(dirname, targetlocalpath)
        imports = ["import { Private, family, list, ul, ol, select, elt, on, toggle, html, sift, show, hide, kill, revive, transition, active, shown, live, ajax, ajaxGet, table, meld, freeze, thaw } from './Clean.js'"],
        scripts = [`const partCounts = {\r\n}`, `const newInstance = part => {\r\n
            const partName = \`\${part}\${partCounts[part] ? ' '+partCounts[part] : ''}\`;\r\n
            partCounts[part]++;\r\n
            let newElt = document.createElement(part);\r\n
            newElt.setAttribute('part', partName);\r\n
            return newElt;\r\n
        };`],
        texts = [];
    walk(fullpath, 'html', encoding)
        .forEach(file => {
            let filename = /(?<=\/?\\?)(\w*)\./.exec(file)[1],
                content = fs.readFileSync(file, encoding),
                params = content.match(/<script params="\w?\(?/)
                    ? /<script params="\(?(.*)\)?">/.exec(content)[1]
                    : null;
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
                        scripts.push(`const ${filename} = (place, init={}, traps={}) => {\r\n
                            const instance = (_=> {\r\n
                                const part = newInstance('${filename}');\r\n
                                part.innerHTML = ${filename.toLowerCase()}Content(init);\r\n
                                const script = _=> {\r\n
                                    ${script.split(/<script.*>/)[1]}\r\n
                                },\r\n
                                store = new Store(part.getAttribute('part'), script, init, traps);\r\n
                                place.appendChild(part);\r\n
                                script();\r\n
                                return part;\r\n
                            })();\r\n
                            return instance;\r\n
                        };`);
                    });
            };
            texts.push(`const ${filename.toLowerCase()}Content = data => \`${bootstrapHTML(locate(filename+'.html', fullpath), fullpath).split('\r\n\r\n<script')[0]}\`;`);
            scripts[0] = scripts[0].split('{\r\n')[0]+`{\r\n${filename}: 0${scripts[0].split('{\r\n')[1] === '}' ? '\r\n' : ',\r\n'}`+scripts[0].split('{\r\n')[1];
        });
    imports = imports.join('\n');
    texts = texts.join('\n\n');
    scripts = scripts.join('\n\n');
    fs.writeFileSync(path.join(dirname, 'index.html'), bootstrapHTML(path.join(dirname, 'model.html'), fullpath), 'utf8');
    fs.writeFileSync(destination, [imports, texts, scripts, `Home(document.body, {footerValue: 'footer'});\r\nFooter(document.body);`].join('\n\n'), {encoding});
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