const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')


function moveBodyContents(file, fileWithHeader, dir, dirOut) {
	let $ = cheerio.load(fs.readFileSync(path.join(__dirname, `${dir}${file}`)))
	let $header = cheerio.load(fs.readFileSync(path.join(__dirname, fileWithHeader)))
	let fileToWriteIn = `${dirOut}${file}`

	console.log(`--> processing file ${file}`)
	let alreadyModified = $('div#modified-by-merge-search-results').length > 0;
	
	if(alreadyModified) {
		console.log(`... file ${file} already modified!\n`)
	} else {
		$header('div#content').html($('body').children(':not(script[type="module"])'))
		$header('body').append('<div id="modified-by-merge-search-results"></div>')
		$header('script[type="module"]').replaceWith($('body').children('script[type="module"]'))

		fs.writeFileSync(fileToWriteIn, $header.html(), {encoding: 'utf-8'});
		console.log(`... file ${fileToWriteIn} processed!\n`)
	}
}

if (process.argv.length > 5) {
  file = 'search-results.html'; // argv2
  fileWithHeader = './master/master.html'; // argv3
  dir = './'; // argv4
  dirOut = './docs-processed/' // argv5
  
  moveBodyContents(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
}