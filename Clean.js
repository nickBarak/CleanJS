const fs = require('fs');
const path = require('path');

// FileSystem

const walk = (fullpath, filetype, encoding='utf8', localpath=null) => {
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
    innerWalk(fullpath, '', filetype, encoding)
    return localpath === null
        ? retrieved
        : localpath
            ? retrieved.map(file => path.join(localpath, file.replace(fullpath, '')).replace(/\\/g, '/'))
            : retrieved.map(file => file.replace(fullpath, '').replace(/\\/g, '/').replace('/', ''));
};

const compile = (fullpath, destination, encoding='utf8') => {
    let imports = [`import { html } from './Clean.js';`];
    let scripts = [];
    let elements = [];
    walk(fullpath, 'html', encoding)
        .forEach(file => {
            let content = fs.readFileSync(file, encoding);
            if (content.match(/<script/)) {
                content
                    .match(/<script.*>[\s\S]*<\/script>/g)
                    .map(script => script
                    .replace(/<script>/g, '@#$%')
                    .replace(/<\/script>/g, '})();')
                    .replace(/\/\*[\s\S]*\*\//gm, '')
                    .replace(/ *?\/\/.*\r\n/g, '')
                    .replace(/[\r\n]+/g, '\r\n')
                    .replace(/\r\n/, '')
                    .replace(/[\r\n]*\}\)\(\);$/, '\r})();'))
                    .filter(script => typeof(script) !== 'undefined' && script.match(/\w/))
                    .forEach(script => {
                        if (script.match(/import.*/)) {
                            script.match(/import.*/g).forEach(item => imports.push(item));
                        scripts.push(`(_=> { // ${/(?<=\/?\\?)(\w*)\./.exec(file)[1]}\n${script.split(imports[imports.length-1])[1].replace(/.*\r\n/, '')}`);
                        } else scripts.push(`(_=> { // ${/(?<=\/?\\?)(\w*)\./.exec(file)[1]}\n${script.split('@#$%')[1]}`);
                    });
            } if (content.match(/\w/)) elements.push(`html('${/(?<=\/?\\?)(\w*)\./.exec(file)[1]}', \`${content.split('<script>')[0].replace(/[\r\n]*$/, '')}\`);`);
        })
        imports = imports.join('\n');
        scripts = scripts.join('\n\n');
        elements = elements.join('\n\n');
        fs.writeFileSync(destination, [imports, elements, scripts].join('\n\n'), {encoding});
};


// Request Handling

const allow = (res, clientURL) => {
    res.setHeader('Access-Control-Allow-Origin', clientURL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
}


// Database Connection

let db;

const { Client } = require('pg');
const pg = connectionString => {
    if (!db) {
        db = new Client({ connectionString: connectionString || process.env.DATABASE });
        db.connect()
            .then(_=> console.log('Connected to PostgreSQL'))
            .catch(e => console.log(e));
    }
    return db;
}

module.exports = {
    walk,
    compile,
    allow,
    pg
};