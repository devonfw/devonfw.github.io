const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { resolve } = require("path");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const natural = require("natural");
const { exit } = require("process");
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

let resultCounter = 0;

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
}

async function createTfidf(docsDirname, solutionDirname, outputPath) {
  if (!fs.existsSync(path.join(__dirname, outputPath, "results"))) {
    fs.mkdirSync(path.join(__dirname, outputPath, "results"));
  }

  await addHtmlFiles(docsDirname, outputPath, "doc");
  await addAsciidocFiles(solutionDirname, outputPath, "solution");
  let stopwords = fs.readFileSync(path.join(__dirname, "stopwords.txt"), {
    encoding: "utf-8",
  });
  let stopwordsList = stopwords.split("\r\n");

  for (let i = 0; i < tfidf.documents.length; i++) {
    for (let term in tfidf.documents[i]) {
      if (stopwordsList.includes(term)) {
        tfidf.documents[i][term] = undefined;
      }
    }
  }
  fs.writeFileSync(
    path.join(__dirname, outputPath, "tfidf.json"),
    JSON.stringify(tfidf)
  );
  fs.writeFileSync(
    path.join(__dirname, outputPath, "meta.json"),
    JSON.stringify({ date: new Date() })
  );
}

let headlineRegex = /^=+ (.+?)$/gm;
let maturityLevelRegex = /^\/\/\s*Maturity level\s*=\s*Complete\s*$/gm;

async function addAsciidocFiles(dirname, outputPath, type) {
  let resolvedDirname = resolve(dirname);
  var results = await getFiles(dirname);
  for (var i = 0; i < results.length; i++) {
    if (results[i].endsWith(".asciidoc")) {
      let fileText = fs.readFileSync(results[i], "utf-8");

      if (!maturityLevelRegex.test(fileText)) {
        continue;
      }
      headlineRegex.lastIndex = 0;
      let matches = headlineRegex.exec(fileText);
      if (!matches) {
        continue;
      }
      let headline = matches[1];
      let title = "";

      for (let i = 0; i < 20; i++) {
        title += headline + " ";
      }
      let resultObj = {
        type: type,
        filename: results[i].substring(resolvedDirname.length + 1),
        title: headline,
        breadcrumbs: [],
        text: fileText,
      };
      fs.writeFileSync(
        path.join(__dirname, outputPath, "results", resultCounter + ".json"),
        JSON.stringify(resultObj)
      );
      tfidf.addDocument(title + resultObj.text, resultCounter);
      resultCounter++;
    }
  }
}

let chapterRegex =
  /<h[1-4].+?id="(?<id>[^"].+?)".*?>((([0-9]+\.\s?)+\s)?(?<title>[^<]+))<\/h[1-4]>(?<content>.+?)(?=((<h[1-4].+?id="([^"].+?)".*?>)|$))/gis;

async function addHtmlFiles(dirname, outputPath, type) {
  let resolvedDirname = resolve(dirname);
  var results = await getFiles(dirname);
  for (var i = 0; i < results.length; i++) {
    if (results[i].endsWith(".html")) {
      addHtmlFile(
        results[i],
        type,
        results[i].substring(resolvedDirname.length + 1),
        outputPath
      );
    }
  }
}

async function addHtmlFile(file, type, filename, outputPath) {
  let fileText = fs.readFileSync(file, "utf-8");
  let fileContent = getContent(fileText);
  fileContent = clearPre(fileContent);
  fileContent = clearNavFooter(fileContent);
  let $ = cheerio.load(fileText);
  let breadcrumbs = $(".toc-current").parents("li").find(">a");
  let breadcrumbsArray = [];
  for (let i = 0; i < breadcrumbs.length; i++) {
    breadcrumbsArray.push(breadcrumbs.eq(i).text());
  }

  while ((regexMatch = chapterRegex.exec(fileContent)) !== null) {
    console.log(regexMatch.groups.title + " -> #" + regexMatch.groups.id);

    let context = "";
    for (let i = 0; i < 20; i++) {
      context +=
        regexMatch.groups.title + " " + breadcrumbsArray.join(" ") + " ";
    }
    let resultObj = {
      type: type,
      filename: filename,
      anchor: regexMatch.groups.id,
      title: regexMatch.groups.title,
      breadcrumbs: breadcrumbsArray,
      text: removeHtml(regexMatch[0]),
    };
    fs.writeFileSync(
      path.join(__dirname, outputPath, "results", resultCounter + ".json"),
      JSON.stringify(resultObj)
    );
    tfidf.addDocument(context + resultObj.text, resultCounter);
    resultCounter++;
  }
}

function clearPre(fileContent) {
  let $ = cheerio.load(fileContent);
  $("pre").text("");
  return $.html() || "";
}

function clearNavFooter(fileContent) {
  let $ = cheerio.load(fileContent);
  $(".nav-footer").text("");
  return $.html() || "";
}

function getContent(htmlStr) {
  let $ = cheerio.load(htmlStr);
  let content = $("div#content");
  return content.html() || "";
}

function removeHtml(htmlStr) {
  return htmlStr.replace(/(<([^>]+)>)/gi, "");
}

if (process.argv.length > 4) {
  createTfidf(process.argv[2], process.argv[3], process.argv[4]).catch((e) => {
    console.error(e);
    process.exit(-1);
  });
}
