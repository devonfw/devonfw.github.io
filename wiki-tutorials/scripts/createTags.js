const fs = require('fs');
const path = require('path');
const pegjs = require("pegjs");
const child_process = require("child_process");
const rimraf = require("rimraf");

function downloadFile(url, file) {
	if (!fs.existsSync(path.dirname(file))){
		fs.mkdirSync(path.dirname(file));
	}
    let cp = child_process.spawnSync(`curl -o ${file} ${url}`, { shell: true, encoding: 'utf-8' });
    return path.join(file);
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function parseTutorials(tutorials, tutorialsFolder, tempFolder, types){
	let tagJson = {};
	let def = fs.readFileSync(path.join(tempFolder, 'parser.def'), 'utf8');
    let parser = pegjs.generate(def);
	for (let tutorial of tutorials){
		try {
			let tempTutorial = fs.readFileSync(path.join(tempFolder, `${tutorial}.asciidoc`), 'utf8');
			let parseResult = parser.parse(tempTutorial);
			let data = getTags(parseResult);
			for (const [key, value] of Object.entries(data)){
				if (!(key in tagJson)){
					tagJson[key] = {}
				}
				for (let tag of value){
					if (!(tag in tagJson[key])){
						tagJson[key][tag] = [tutorial]
					}
					else {
						tagJson[key][tag].push(tutorial)
					}
				}
			}
		}
		catch (error) {
			continue;
		}
	}
	return tagJson;
}

function downloadTutorials(tempFolder, tutorials){
	// Tutorials Asciidocs
	for (let tutorial of tutorials){
		if (!fs.existsSync(path.join(tempFolder, `${tutorial}.asciidoc`))) {
			downloadFile(`https://raw.githubusercontent.com/devonfw-tutorials/tutorials/main/${tutorial}/index.asciidoc`, path.join(tempFolder, `${tutorial}.asciidoc`));
		}
	}
	
	// Parser Definition
	if (!fs.existsSync(path.join(tempFolder, 'parser.def'))) {
		downloadFile("https://raw.githubusercontent.com/devonfw-tutorials/tutorial-compiler/main/engine/parser.def", path.join(tempFolder, 'parser.def'));
	}
}

function getTags(parseResult){
	let tagDict = {};
	try{
		let results = parseResult[2] ? parseResult[2][4].taglines.split(/\r?\n/) : Array();
		for (let result of results){
			if(result){
				result = result.split("=")
				let type = result[0];
				let tags = result[1].includes(";") ? result[1].split(";") : Array(result[1]);
				tagDict[type] = tags;
			}
		}
	}catch (error) {
		throw error;
	}        
	return tagDict;
}

function createTagFile(output, tags){
	let content = JSON.stringify(tags, null, 4)
	fs.writeFile(output, content, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	 
		console.log("Tags file has been saved.");
	});
} 

function cleanUp(tempFolder){
	rimraf.sync(tempFolder);
}

function main() {
	
	let tutorialsFolder = path.join(__dirname, '..', 'tutorials');
	let tempFolder = path.join(__dirname, 'temp');
	let typeFolder = getDirectories(tutorialsFolder);
	let output = path.join('.', process.argv[2]);
	let types = typeFolder.map( type => {return path.basename(type)});
	let tutorials = getDirectories(typeFolder[0]).map( type => {return path.basename(type)});
	
	downloadTutorials(tempFolder, tutorials);
	tagJson = parseTutorials(tutorials, tutorialsFolder, tempFolder, types);
	createTagFile(output, tagJson);
	cleanUp(tempFolder);

}


main();