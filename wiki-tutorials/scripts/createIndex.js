const fs = require('fs');
const path = require('path');
const pegjs = require("pegjs");
const child_process = require("child_process");
const rimraf = require("rimraf");
const re = require("rimraf");
const lunr = require('lunr');

let id = 0;

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
	let docs = [];
	let tutorialJson = {};
	let def = fs.readFileSync(path.join(tempFolder, 'parser.def'), 'utf8');
    let parser = pegjs.generate(def);
	for (let tutorial of tutorials){
		try{
			let tempTutorial = fs.readFileSync(path.join(tempFolder, `${tutorial}.asciidoc`), 'utf8');
			let parseResult = parser.parse(tempTutorial);
			for (let type of types){
				let title = parseResult[0][2]
				let paths = tutorialPaths(tutorial);
				let tutorialSnippet = fs.readFileSync(path.join(tutorialsFolder, type, tutorial, 'index.asciidoc'), 'utf8');
				tutorialSnippet = tutorialSnippet.replace(/\n/g, " ")
				let doc = {
					dirname: tutorial,
					id: id++,
					path: paths[type],
					type: 'tutorial',
					title: title,
					body: tutorialSnippet,
				};
				
				docs.push(doc);
			};
		}
		catch (error) {
			continue;
		}
	}
	return docs;
}

function tutorialPaths(tutorial){
	paths = {}
	paths["wiki_eclipse"] = `website/pages/learning/tutorials/wiki_eclipse/${tutorial}/`;
	paths["wiki_vscode"] = `website/pages/learning/tutorials/wiki_vscode/${tutorial}/`;
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

function createTutorialFile(outputDocs, outputIndex, docs){
	let idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('body');
        this.metadataWhitelist = ['position'];

        docs.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    let idxJson = JSON.stringify(idx, null, 4);

    fs.writeFileSync(outputDocs, JSON.stringify(docs, null, 4));
    fs.writeFileSync(outputIndex, idxJson);
    console.log('Docs and Index were saved!');
} 


function cleanUp(tempFolder){
	rimraf.sync(tempFolder);
}

function main() {
	let tutorialsFolder = path.join(__dirname, '..', 'tutorials');
	let tempFolder = path.join(__dirname, 'temp');
	let typeFolder = getDirectories(tutorialsFolder);
	let outputDocs = path.join('.', process.argv[2]);
	let outputIndex = path.join('.', process.argv[3]);
	let types = typeFolder.map( type => {return path.basename(type)});
	let tutorials = getDirectories(typeFolder[0]).map( type => {return path.basename(type)});
	
	downloadTutorials(tempFolder, tutorials);
	docs = parseTutorials(tutorials, tutorialsFolder, tempFolder, types);
	createTutorialFile(outputDocs, outputIndex, docs);
	cleanUp(tempFolder);

}


main();