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
	let tutorialList = [];
	let tutorialJson = {};
	let def = fs.readFileSync(path.join(tempFolder, 'parser.def'), 'utf8');
    let parser = pegjs.generate(def);
	for (let tutorial of tutorials){
		try {
			let tempTutorial = fs.readFileSync(path.join(tempFolder, `${tutorial}.asciidoc`), 'utf8');
			let parseResult = parser.parse(tempTutorial);
			let tutorialSnippet = {}
			for (let type of types){
				tutorialSnippet[type] = fs.readFileSync(path.join(tutorialsFolder, type, tutorial, 'index.asciidoc'), 'utf8');
			}
			let title = parseResult[0][2]
			let subtitle = parseResult[1]? parseResult[1][3]: "";
			let description = parseResult[3][2].descriptionlines;
			let paths = tutorialPaths(tutorial);
			
			
			tutorialJson = {
				name: tutorial,
				title: title,
				subtitle: subtitle,
				description: description,
				paths: paths,
				snippets: tutorialSnippet
			}
			tutorialList.push(tutorialJson);
		}
		catch(error){
			continue;
		}
	}
	return tutorialList;
}

function tutorialPaths(tutorial){
	paths = {}
	paths["eclipse"] = `https://devonfw.com/website/pages/learning/tutorials/wiki_eclipse/${tutorial}/`;
	paths["vscode"] = `https://devonfw.com/website/pages/learning/tutorials/wiki_vscode/${tutorial}/`;
	paths["katacoda"] = `https://katacoda.com/devonfw/scenarios/${tutorial}/`;
	return paths;
	
}

function downloadTutorials(tempFolder, tutorials){
	// Tutorials Asciidocs
	for (let tutorial of tutorials){
		downloadFile(`https://raw.githubusercontent.com/devonfw-tutorials/tutorials/main/${tutorial}/index.asciidoc`, path.join(tempFolder, `${tutorial}.asciidoc`));
	}
	
	// Parser Definition
	downloadFile("https://raw.githubusercontent.com/devonfw-tutorials/tutorial-compiler/main/engine/parser.def", path.join(tempFolder, 'parser.def'));
}

function createTutorialFile(output, tutorials){
	let content = JSON.stringify(tutorials, null, 4)
	fs.writeFile(output, content, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	 
		console.log("Tutorials file has been saved.");
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
	tutorialList = parseTutorials(tutorials, tutorialsFolder, tempFolder, types);
	createTutorialFile(output, tutorialList);
	cleanUp(tempFolder);

}


main();