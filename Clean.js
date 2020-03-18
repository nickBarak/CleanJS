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
    let src = polish(fs.readFileSync(sourcefile, encoding)),
        getMatches = content => {
            return content
                ? content.match(/<[A-Z].*>/) != null
                    ? content.match(/<[A-Z].*>/g).map(match => match.split('>')[0] + '>')
                    : null
                : null
        },
        innerBootstrapHTML = match => {
        let newContent = extract(/[A-Z]\w*/.exec(match)+'.html', targetdir, encoding);
            src = (((/(<[A-Z]\w* +id=.*) .*=/.exec(match) != null) && newContent != null) && match)
                ? src.replace(match, `${/(<[A-Z]\w* +id=.*) .*=/.exec(match)[1].replace(/ +/g, ' ')}>${newContent.split(/[\r\n]+<script/)[0]}<\/${match.match(/[A-Z]\w*/)}>`)
                : src;
            if (getMatches(newContent) != null) getMatches(newContent).forEach(match => innerBootstrapHTML(match))
    };
    if (getMatches(src)) getMatches(src).forEach(match => innerBootstrapHTML(match))
    return src
};

const compile = (dirname, targetlocalpath, destination, encoding='utf8') => {
    let fullpath = path.join(dirname, targetlocalpath)
        imports = [],
        scripts = [];
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
                    .replace(/<script.*>/, '@#$%')
                    .replace(/<\/script>/, '};')
                    .replace(/\r\n/, '')
                    .replace(/[\r\n]*\}\)\(\);$/, '\r};')]
                    .filter(script => typeof(script) !== 'undefined' && script.match(/\w/))
                    .forEach(script => {
                        if (script.match(/import.*/)) {
                            script
                                .match(/import.*/g)
                                .forEach(item => imports.push(item));
                            scripts
                                .push(`const ${filename} = ${params ? `(${params}) ` : '_'}=> {\n${script
                                    .split(imports[imports.length-1])[1]
                                    .replace(/.*\r\n/, '')}`);
                        } else scripts.push(`const ${filename} = (${params}) => {\n${script.split('@#$%')[1]}`);
                    });
            }
        })
    imports = imports.join('\n');
    scripts = scripts.join('\n\n');
    fs.writeFileSync(path.join(dirname, 'index.html'), bootstrapHTML(path.join(dirname, 'model.html'), fullpath), 'utf8');
    fs.writeFileSync(destination, [imports, scripts].join('\n\n'), {encoding});
};

const polish = (code, encoding='utf8') => {
    let cleanCode = code.match(/\.(js|ts|html)$/)
        ? fs.readFileSync(code, encoding)
        : code;
    if (cleanCode) cleanCode = cleanCode
        .replace(/(?<=<!--)[\s\S]*?(?=-->)/g, '')
        .replace(/<!---->/g, '')
        .replace(/\/\*[\s\S]*\*\//g, '')
        .replace(/ *?\/\/.*\r\n/g, '')
        .replace(/[\r\n]+/g, '\r\n');
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