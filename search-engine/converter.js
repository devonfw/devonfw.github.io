const fs = require("fs");
const path = require("path");
const lunr = require("lunr");

function getLunrDoc(dirname, extension) {
  console.log(getFilesFromDir(dirname, ".."));
  console.log(getFilesFromDir(dirname, "../target/"));
  console.log(getFilesFromDir(dirname, "../target/generated-docs/"));

  let files = getFilesFromDir(dirname, extension);

  let docs = [];
  files.forEach(file =>
    docs.push(readFromFilename(file, [removeHtml, removeTooMuchSpaces]))
  );

  generateIndexJson(docs);
}

function normalize(path) {
  return path
    .replace("\\/", "/")
    .replace("//", "/")
    .replace("\\", "/");
}

function removeTooMuchSpaces(str) {
  return str.replace(/\r\n\s*\r\n/g, "\n").replace(/( )+/g, " ");
}

function removeHtml(htmlStr) {
  return htmlStr.replace(/(<([^>]+)>)/gi, "");
}

function getFilesFromDir(dirname, extension) {
  let dirContent = fs.readdirSync(path.join(__dirname, dirname));
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

function readFromFilename(file, pipeline = []) {
  let doc = { id: file, title: "not found", body: "" };

  doc.body = fs.readFileSync(file, "utf-8");

  let lines = doc.body.split("\n");
  let titleLevel = 10;

  lines.forEach(function(line) {
    let matchRes = line.match(/<h([0-9]).*>(.*|\n*)<\/h([0-9])>/);
    if (matchRes && matchRes.length > 2 && matchRes[1] < titleLevel) {
      console.log(matchRes);
      titleLevel = matchRes[1];
      doc.title = matchRes[2];
    }
  });

  if (pipeline) {
    for (let i = 0; i < pipeline.length; i++) {
      doc.title = pipeline[i](doc.title);
      doc.body = pipeline[i](doc.body);
    }
  }

  return doc;
}

function generateIndexJson(documents) {
  let idx = lunr(function() {
    this.ref("id");
    this.field("title");
    this.field("body");
    this.metadataWhitelist = ["position"];

    documents.forEach(function(doc) {
      this.add(doc);
    }, this);
  });

  let idxJson = JSON.stringify(idx);

  fs.writeFileSync("./docs-json.json", JSON.stringify(documents));
  fs.writeFileSync("./index.json", idxJson);
  console.log("The file was saved!");

  return idxJson;
}

if (process.argv.length > 3) {
  getLunrDoc(process.argv[2], process.argv[3]);
}
