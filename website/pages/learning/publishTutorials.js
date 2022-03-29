const path = require('path');
const fs = require('fs-extra');
const child_process = require("child_process");

const COMPILER = path.join(process.argv[2], 'compiler');
const PLAYBOOKS = path.join(COMPILER, 'playbooks');
const TUTORIALS = path.join(COMPILER, 'repo');
const WIKITUTORIALS = path.join(COMPILER, 'build', 'output','wiki', 'wiki_eclipse');

const TEMP = path.join(process.argv[2], 'temp');
const TUTORIALTYPE = ['wiki_eclipse', 'wiki_vscode'];

function publish(){
    try{
        const SPECIFIED_TUTORIALS = getTutorials(PLAYBOOKS); 

        //create directories to save temp courses and Tutorials 
        createFolder(TEMP); 

        generateNewTutorials(TEMP);
		const GENERATED_TUTORIALS = getTutorials(WIKITUTORIALS);
        
		createScenario();
		
		copyTutorialAssets(GENERATED_TUTORIALS, PLAYBOOKS, TUTORIALTYPE, TEMP);
        
        //Delete unused and newly generated tutorials 
        fs.removeSync(path.join(TUTORIALS, 'tutorials', '.'), { recursive: true });
		console.log("Removed published tutorials to replace them");
		
		//Copy TEMP folder to tutorials
		fs.copySync(TEMP, path.join(TUTORIALS, 'tutorials', "/."));
		console.log("Copy TEMP Folder to wiki-tutorials");
		
		//Delete TEMP folder
		fs.removeSync(path.join(TEMP), { recursive: true });
		console.log("Delete TEMP Folder")
    }

    catch(e) {
        console.error(e);
        return -1;
    }

}

function generateNewTutorials(){
    let cp = child_process.spawnSync(`bash buildRun.sh -e wiki_eclipse -e wiki_vscode`, { shell: true, cwd: COMPILER, encoding: 'utf-8' });
    if(!fs.existsSync(path.join(COMPILER, 'build', 'output','wiki'))) {
        console.log("ERROR[generateNewTutorials]: ", cp);
        return "";
    }
}

function createScenario(){
	for(let type of TUTORIALTYPE){
		const genTutorialsDir = path.join(COMPILER, 'build', 'output', 'wiki', type);
		fs.copySync(path.join(genTutorialsDir), path.join(TEMP, type));
	}
	console.log('Copy Tutorial to temporory directory.' );
}


function getTutorials(dirname){
    let folders = fs.readdirSync(dirname, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
    let tutorials = new Array();
    folders.forEach(folder => {
        if(!folder.name.includes('git')){
            tutorials.push(folder.name);
        }
    });
    return tutorials;
}

function copyTutorialAssets(tutorials, playbooksFolder, tutorialTypes, tempFolder){
	for (let tutorial of tutorials){
		let tutorialFolder = path.join(playbooksFolder, tutorial);
		let assetFolders = fs.readdirSync(tutorialFolder, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
		for (let asset of assetFolders){
			for (let type of tutorialTypes){
				console.log(path.join(tutorialFolder, asset.name), '->', path.join(tempFolder, type, tutorial));
				createFolder(path.join(tempFolder, type, tutorial, asset.name));
				fs.copySync(path.join(tutorialFolder, asset.name), path.join(tempFolder, type, tutorial, asset.name));
			}
		}
	}
}

function createFolder(dirname){
    if (fs.existsSync(dirname)){
        fs.removeSync(dirname); 
    }
    fs.mkdir(dirname);
    console.log(dirname, "was created.");
}


publish();