const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const cheerio = require('cheerio');

let visitedExploreDocs = [];

function getLunrDoc(docsDirname, exploreDirname, extension) {
  let docs = getDocumentsFromDocs(docsDirname, extension);
  docs = docs.concat(getDocumentsFromExplore(exploreDirname, extension));

  generateIndexJson(docs);
}

function getDocumentsFromDocs(dirname, extension) {
  let files = getFilesFromDir(dirname, extension);

  let docs = [];
  let processing = {
    preprocessing: [getContent],
    postprocessing: [removeHtml, removeTooMuchSpaces],
  };
  files.forEach((file) => docs.push(readFromFilename(file, processing)));

  return docs;
}

function getDocumentsFromExplore(dirname, extension) {
  let docs = [];
  let htmlStr = fs.readFileSync(path.join(dirname, 'dir-content', 'entry-point' + extension), 'utf-8');
  let $ = cheerio.load(htmlStr);
  $('div#content div.links-to-files > div.sectionbody > div.paragraph a').each(function (_, link) {
    docs = docs.concat(getDocumentsFromExploreFile(dirname, link.attribs['href'], '#'));
  });
  return docs;
}

function getDocumentsFromExploreFile(dirname, file, parenthash) {
  visitedExploreDocs.push(file);
  let docs = [];
  let filePath = path.join(dirname, 'dir-content', file);
  if (fs.existsSync(filePath)) {
    let htmlStr = fs.readFileSync(filePath, 'utf-8');
    let $ = cheerio.load(htmlStr);
    let hash = parenthash + '/' + file.substr(0, file.lastIndexOf('.'));
    let doc = {
      id: path.join(dirname, 'explore.html').replace(/\\/g,'/') + hash,
      type: 'explore',
      title: $('div#content div.directory h2').text(),
      body: $('div#content div.directory p').text(),
    };
    docs.push(doc);
    $('div#content div.links-to-files > div.sectionbody > div.paragraph a').each(function (_, link) {
      if (visitedExploreDocs.indexOf(link.attribs['href']) === -1) {
        docs = docs.concat(getDocumentsFromExploreFile(dirname, link.attribs['href'], hash));
      }
    });

  }
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

function getFilesFromDir(dirname, extension) {
  let dirContent = fs.readdirSync(path.join(__dirname, dirname));
  let fileStats;
  let item;
  let result = [];

  dirContent.forEach(function (dirItem) {
    item = `${dirname}/${dirItem}`;
    fileStats = fs.lstatSync(item);

    if (fileStats.isDirectory()) {
      result = result.concat(getFilesFromDir(item, extension));
    }

    if (fileStats.isFile() && path.extname(item) === extension) {
      result = result.concat([normalize(item)]);
    }
  });

  return result;
}

function readFromFilename(
  file,
  processing = { preprocessing: [], postprocessing: [] },
) {
  let doc = {
    id: file,
    type: 'docs',
    title: 'not found',
    body: fs.readFileSync(file, 'utf-8'),
  };

  const preprocessing = processing.preprocessing;
  if (preprocessing) {
    for (let i = 0; i < preprocessing.length; i++) {
      doc.body = preprocessing[i](doc.body);
    }
  }

  let lines = doc.body.split('\n');
  let titleLevel = 10;

  lines.forEach(function (line) {
    let matchRes = line.match(/<h([0-9]).*>(.*|\n*)<\/h([0-9])>/);
    if (matchRes && matchRes.length > 2 && matchRes[1] < titleLevel) {
      console.log(matchRes);
      titleLevel = matchRes[1];
      doc.title = matchRes[2];
    }
  });

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

  fs.writeFileSync('./docs-json.json', JSON.stringify(documents));
  fs.writeFileSync('./index.json', idxJson);
  console.log('The file was saved!');

  return idxJson;
}

if (process.argv.length > 4) {
  getLunrDoc(process.argv[2], process.argv[3], process.argv[4]);
}
