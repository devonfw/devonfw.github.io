const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const fsEx = require('fs-extra');

function main(repositoryDir) {
    let dirContent = fs.readdirSync(repositoryDir);
    
    dirContent.forEach(function (dirItem){
        item = `${repositoryDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if(fileStats.isDirectory()){
            if(path.extname(item) == '.wiki'){
                let prefix = path.basename(item,'.wiki') + '_';
                let solutionsFolder = `${item}/solutions`;

                    if(fs.existsSync(solutionsFolder)){
                        let destPath = path.join(__dirname, '../solutions'); 
                        let solutions = fs.readdirSync(solutionsFolder);
                        solutions.forEach(function (solution){
                            let oldPathName = `${solutionsFolder}/${solution}`;
                            let newPathName = path.join(oldPathName, '../'+prefix+path.basename(solution));
                            if(path.basename(solution).search(prefix) != -1){
                                return;
                            }
                            fs.renameSync(oldPathName,newPathName);
                        });
                        fsEx.copySync(solutionsFolder,destPath);
                    }
            }
        }
    });
}

if (process.argv.length > 2) {

    main(process.argv[2]);
}