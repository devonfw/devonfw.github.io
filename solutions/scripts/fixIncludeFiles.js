const fs = require('fs');
const path = require('path');

function fixIncludeFiles(solutionsDir) {
    let dirContent = fs.readdirSync(solutionsDir);

    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexAsciiDocFile = path.join("./", item, "index.asciidoc");
            if (fs.existsSync(indexAsciiDocFile)) {
                readFromFilename(indexAsciiDocFile);
            }
        }
    })
}

function readFromFilename(file) {
    let regexMatch = null;
    let fileContent = fs.readFileSync(file, { encoding: "utf-8" });
    let includeFileRegex = /include::((.*?\/([^\/\\[]+))\/([^\/\\[]+\.asciidoc))/isg;

    while ((regexMatch = includeFileRegex.exec(fileContent)) !== null) {
        fileContent = fileContent.replace("include::" + regexMatch[1], "include::../" + regexMatch[1]); 
    }
    fs.writeFileSync(file, fileContent, {encoding: 'utf-8'});
}

if (process.argv.length > 2) {
    fixIncludeFiles(process.argv[2]);
}
