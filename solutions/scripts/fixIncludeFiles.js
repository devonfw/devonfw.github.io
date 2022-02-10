const fs = require('fs');
const path = require('path');

function fixIncludeFiles(solutionsDir, includeDir) {
    let dirContent = fs.readdirSync(solutionsDir);

    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexAsciiDocFile = path.join("./", item, "index.asciidoc");
            if (fs.existsSync(indexAsciiDocFile)) {
                readFromFilename(indexAsciiDocFile, includeDir);
            }
        }
    })
}

function readFromFilename(file, includeDir) {
    let regexMatch = null;
    let fileContent = fs.readFileSync(file, { encoding: "utf-8" });
    let includeFileRegex = /include::((.*?\/([^\/\\[]+))\/([^\/\\[]+\.asciidoc))/isg;

    while ((regexMatch = includeFileRegex.exec(fileContent)) !== null) {
        console.log(regexMatch);
        fileContent = fileContent.replace("include::" + regexMatch[1], "include::" + includeDir + "/" + regexMatch[3] + "/" + regexMatch[4]); 
    }
    console.log(fileContent);
    fs.writeFileSync(file, fileContent, {encoding: 'utf-8'});
}

if (process.argv.length > 3) {
    fixIncludeFiles(process.argv[2], process.argv[3]);
}
