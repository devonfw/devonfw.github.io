const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const cheerio = require('cheerio');

let visitedExploreDocs = [];
let id = 0;

function getLunrDoc(docsDirname, exploreDirname, katacodaDirname, extension) {
  let docs = getDocumentsFromDocs(docsDirname, extension);
  docs = docs.concat(getDocumentsFromExplore(exploreDirname, extension));
  docs = docs.concat(getDocumentsFromKatacoda(katacodaDirname, extension));

  generateIndexJson(docs);
}

function getDocumentsFromDocs(dirname, extension) {
  let files = getFilesFromDir(dirname, extension);

  let docs = [];
  let processing = {
    preprocessing: [getContent],
    postprocessing: [removeHtml, removeTooMuchSpaces],
  };
  files.forEach((file) => docs = docs.concat(readFromFilename(file, processing)));

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

function getDocumentsFromKatacoda(dirname, extension) {
  let docs = [];

  let dirContent = fs.readdirSync(path.join(__dirname, dirname));

  dirContent.forEach(function (dirItem) {
    item = path.join(dirname, dirItem);
    fileStats = fs.lstatSync(item);

    if (fileStats.isDirectory()) {
      if(fs.existsSync(`${item}/index.json`)){
        console.log(`${item}`);
        let indexJson = fs.readFileSync(`${item}/index.json`, 'utf-8');
        let index = JSON.parse(indexJson);
        
        let introFilename = item + '/' + index['details']['intro']['text'];
        let intro = '';

        if(fs.existsSync(introFilename)){
          intro = fs.readFileSync(introFilename, 'utf-8');
        }

        let doc = {
          id: id++,
          path: 'https://www.katacoda.com/devonfw/scenarios/' + dirItem,
          type: 'tutorial',
          title: index.title,
          body: index.title + '\r\n' + intro,
        };
        docs.push(doc);
      }
    }
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
      id: id++,
      path: path.join(dirname, 'explore.html').replace(/\\/g, '/') + hash,
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

function getType(file){
  let isTutorial = !!file.match(/\/[^\/]*?(tutorial|how[-_]?to)-/i);
  let isReleaseNote = !!file.match(/\/[^\/]*?(release[-_]?notes)-/i);
  if(isTutorial){
    return 'tutorial';
  } 
  if(isReleaseNote){
    return 'releasenote';
  }
  return 'docs'
}

function readFromFilename(
  file,
  processing = { preprocessing: [], postprocessing: [] },
) {
  let type = getType(file);
  let chapterRegex = /<h[1-4].+?id="(?<id>[^"].+?)".*?>((([0-9]+\.\s?)+\s)?(?<title>[^<]+))<\/h[1-4]>(?<content>.+?)(?=((<h[1-4].+?id="([^"].+?)".*?>)|$))/isg;

  let docs = [];
  let fileContent = fs.readFileSync(file, 'utf-8');

  const preprocessing = processing.preprocessing;
  if (preprocessing) {
    for (let i = 0; i < preprocessing.length; i++) {
      fileContent = preprocessing[i](fileContent);
    }
  }
  let doc = {};
  console.log(file + ' type: ' + type);
  while ((regexMatch = chapterRegex.exec(fileContent)) !== null) {
    console.log(regexMatch.groups.title + ' -> #' + regexMatch.groups.id)
    let doc = {
      id: id++,
      path: file + '#' + regexMatch.groups.id,
      type: type,
      title: regexMatch.groups.title,
      body: regexMatch[0],
    };
    const postprocessing = processing.postprocessing;
    if (postprocessing) {
      for (let i = 0; i < postprocessing.length; i++) {
        doc.title = postprocessing[i](doc.title);
        doc.body = postprocessing[i](doc.body);
      }
    }
    docs.push(doc);
  }

  return docs;
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

if (process.argv.length > 5) {
  getLunrDoc(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
}
