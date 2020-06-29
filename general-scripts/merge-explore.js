const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')


function moveBodyContents(file, fileWithHeader, dir, dirOut, fileOut) {
	let $ = cheerio.load(fs.readFileSync(path.join(__dirname, `${dir}${file}`)))
	let $header = cheerio.load(fs.readFileSync(path.join(__dirname, fileWithHeader)))
	let fileToWriteIn = `${dirOut}${fileOut}`

	console.log(`--> processing file ${file}`)
	let alreadyModified = $('div#modified-by-merge-explore').length > 0;
	
	if(alreadyModified) {
		console.log(`... file ${file} already modified!\n`)
	} else {
		
		// Get JS
		let scriptCode = $('body').children('script[type="module"]');

		// Add content
		$header('div#content').append($('body').children(':not(script[type="module"])'))
		
		// add modification flag
		$header('body').append('<div id="modified-by-merge-explore"></div>')
		
		// add JS
		$header('script[type="module"]').first().after(scriptCode)
		
		// get <head> content
		$header('head').append($('head'))

		fs.writeFileSync(fileToWriteIn, $header.html(), {encoding: 'utf-8'});
		console.log(`... file ${fileToWriteIn} processed!\n`)
	}
}

if (process.argv.length > 6) {
  moveBodyContents(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
}