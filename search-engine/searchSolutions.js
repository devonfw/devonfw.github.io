const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const cheerio = require('cheerio');

let id = 0;

function getLunrDoc(solutionDirname, extension) {
    let docs = getDocumentsFromSolution(solutionDirname, extension);
    generateIndexJson(docs);
}

function getDocumentsFromSolution(dirname, extension) {
    let files = getFilesFromSolution(dirname, extension);
    let solutionDirname = getSolutionDirname(dirname);

    let docs = [];
    let processing = {
        preprocessing: [getContent],
        postprocessing: [removeHtml, removeTooMuchSpaces],
    };

    files.forEach((file) => docs = docs.concat(readFromSolution(file, processing, solutionDirname)));

    return docs;
}

function normalize(path) {
    return path
        .replace('\\/', '/')
        .replace('//', '/')
        .replace('\\', '/');
}

function removeTooMuchSpaces(str) {
    let withoutRN = str.replace(/\r\n\s*\r\n/g, '\n').replace(/( )+/g, ' ');
    let noMultipleN = withoutRN.replace(/\n\s*\n*/g, '\n');
    return noMultipleN;
}

function removeHtml(htmlStr) {
    return htmlStr.replace(/(<([^>]+)>)/gi, '');
}

function getContent(htmlStr) {
    let $ = cheerio.load(htmlStr);
    let content = $('div#content');
    return content.html() || '';
}

function getSolutionTitle(htmlStr) {
    let $ = cheerio.load(htmlStr);
    let title = $('h1').first().text();

    if (title.length == 0) {
        title = $('h2').first().text();
    }
    return title;
}

function getSolutionDirname(dirname) {
    let dirContent = fs.readdirSync(path.join(__dirname, dirname));
    let fileStats;
    let item;
    let solutionDirname = [];

    dirContent.forEach(function (dirItem) {
        item = `${dirname}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            solutionDirname = solutionDirname.concat(dirItem);
        }
    });

    return solutionDirname;
}

function getFilesFromSolution(dirname, extension) {
    let dirContent = fs.readdirSync(path.join(__dirname, dirname));
    let fileStats;
    let item;
    let result = [];

    dirContent.forEach(function (dirItem) {
        item = `${dirname}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (fileStats.isDirectory()) {
            if (fs.existsSync(`${item}/index.html`)) {
                result = result.concat([normalize(`${item}/index.html`)]);
            }
            result = result.concat(getFilesFromSolution(item, extension));
        }
    });

    return result;
}

function readFromSolution(
    file,
    processing = { preprocessing: [], postprocessing: [] },
    solutionDirname
) {
    let fileContent = fs.readFileSync(file, 'utf-8');
    const preprocessing = processing.preprocessing;
    if (preprocessing) {
        for (let i = 0; i < preprocessing.length; i++) {
            fileContent = preprocessing[i](fileContent);
        }
    }
    let doc = {
        dirname: solutionDirname[id],
        id: id++,
        path: file,
        type: 'solution',
        title: getSolutionTitle(fileContent),
        body: fileContent,
    };
    const postprocessing = processing.postprocessing;
    if (postprocessing) {
        for (let i = 0; i < postprocessing.length; i++) {
            doc.title = postprocessing[i](doc.title);
            doc.body = postprocessing[i](doc.body);
        }
    }

    return doc;
}

function generateIndexJson(documents) {
    let idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('body');
        this.metadataWhitelist = ['position'];

        documents.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    let idxJson = JSON.stringify(idx);

    fs.writeFileSync('./docs-json_solutions.json', JSON.stringify(documents));
    fs.writeFileSync('./index_solutions.json', idxJson);
    console.log('The file was saved!');

    return idxJson;
}

if (process.argv.length > 3) {
    getLunrDoc(process.argv[2], process.argv[3]);
}
