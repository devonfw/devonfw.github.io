const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')

function normalize(path) {
  return path
    .replace("\\/", "/")
    .replace("//", "/")
    .replace("\\", "/");
}

function getFilesFromDir(dirname, extension) {
  let dirContent = fs.readdirSync(path.join(__dirname, dirname));
  let fileStats;
  let item;
  let result = [];

  dirContent.forEach(function(dirItem) {
    item = `${dirname}/${dirItem}`;
    fileStats = fs.lstatSync(item);

    if (fileStats.isFile() && path.extname(item) === extension) {
      result = result.concat([normalize(item)]);
    }
  });

  return result;
}

/*
let $ = cheerio.load(
					`<div id="has-content-header">
						<div id="header">hello</div>
						<div id="content">world</div>
					</div>`)
					
let $header = cheerio.load(
					`<div id="has-styled-header">
						<div>this is my styled header</div>
						<div id="content">replace me</div>
					</div>`)*/

function mergeHeader(fileWithHeader, dir, dirOut) {
	files = getFilesFromDir(dir, '.html');

	for(let i = 0; i < files.length; i++) {
		let $ = cheerio.load(fs.readFileSync(files[i]))
		let $header = cheerio.load(fs.readFileSync(path.join(__dirname, fileWithHeader)))
		let fileToWriteIn = `${dirOut}${files[i].replace(dir, '')}`

		console.log(`--> processing file ${i}/${files.length - 1}: ${files[i]}`)
		$header('div#content').replaceWith([$('div#header'), $('div#content')])
		$header('head').append($('head > style'));
		$header('body').addClass('toc2 toc-left');
		
		
		
		fs.writeFileSync(fileToWriteIn, $header.html(), {encoding: 'utf-8'});
		console.log(`... file ${fileToWriteIn} processed!\n`)
	}
}

if (process.argv.length > 4) {
  dir = './docs/'; // argv2
  fileWithHeader = './master/master.html'; // argv3
  dirOut = './docs-processed/' // argv4
  
  mergeHeader(process.argv[2], process.argv[3], process.argv[4]);
}