const fs = require('fs');
const path = require('path');
const lunr = require('lunr');

function getLunrDoc(dirname, extension) {
  let files = getFilesFromDir(dirname, extension);

  let docs = [];
  files.forEach((file) => docs.push(readFromFilename(file)));

  let idxJson = generateIndexJson(docs);
  query(idxJson);
}

function normalize(path) {
  return path
    .replace('\\/', '/')
    .replace('//', '/')
    .replace('\\', '/');
}

function getFilesFromDir(dirname, extension) {
  let dirContent = fs.readdirSync(dirname);
  let fileStats;
  let item;
  let result = [];

  dirContent.forEach(function(dirItem) {
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

function readFromFilename(file) {
  let doc = { id: file, title: 'not found', body: '' };

  doc.body = fs.readFileSync(file, 'utf-8');
  let lines = doc.body.split('\n');
  let titleLevel = 10;

  lines.forEach(function(line) {
    let matchRes = line.match(/^=+ (.*)/);
    let lineLevel = occurrences(matchRes ? matchRes[0] : '', '=');

    if (lineLevel == 0) {
      matchRes = line.match(/^#+ (.*)/);
      lineLevel = occurrences(matchRes ? matchRes[0] : '', '#');
    }

    let isTitle = lineLevel > 0;

    if (isTitle && titleLevel > lineLevel) {
      doc.title = matchRes[1];
    }
  });
  return doc;
}

function generateIndexJson(documents) {
  let idx = lunr(function() {
    this.ref('id');
    this.field('title');
    this.field('body');
    this.metadataWhitelist = ['position'];

    documents.forEach(function(doc) {
      this.add(doc);
    }, this);
  });

  let idxJson = JSON.stringify(idx);

  fs.writeFileSync('./docs-json.json', JSON.stringify(documents));
  fs.writeFileSync('./index.json', idxJson);
  console.log('The file was saved!');

  return idxJson;
}

function query(idxJson) {
  let idx = lunr.Index.load(JSON.parse(idxJson));

  let query = 'installed packet manager start';
  let queryRes = idx.search(query);
  console.log('QUERY RESULT: ');
}

function occurrences(string, subString) {
  string += '';
  subString += '';
  if (subString.length <= 0) return string.length + 1;

  let n = 0,
    pos = 0,
    step = subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n;
}

if (process.argv.length > 3) {
  getLunrDoc(process.argv[2], process.argv[3]);
}
