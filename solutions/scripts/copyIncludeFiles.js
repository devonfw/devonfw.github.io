const fs = require('fs');
const path = require('path');
const fsEx = require('fs-extra');

function copyIncludeFiles(solutionsDir, outputDir) {
    let dirContent = fs.readdirSync(solutionsDir);

    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexAsciiDocFile = path.join("./", item, "index.asciidoc");
            if (fs.existsSync(indexAsciiDocFile)) {
                readFromFilename(indexAsciiDocFile, `${outputDir}/${dirItem}`);
            }
        }
    })
}

function readFromFilename(file, outputDir) {
    let regexMatch = null;
    let fileContent = fs.readFileSync(file, { encoding: "utf-8" });
    let includeFileRegex = /include::.*\/([^\/\\]+)\/([^\/\\]+\.asciidoc).*$/isg;

    while ((regexMatch = includeFileRegex.exec(fileContent)) !== null) {
        let snippetDir = path.join(__dirname, '../includes/', regexMatch[1]);
        let includeFile = snippetDir + '/' + regexMatch[2];

        readFromFilename(includeFile, outputDir);
        fsEx.copySync(snippetDir, outputDir);
        fs.unlinkSync(outputDir + '/' + regexMatch[2]);
    }
}

if (process.argv.length > 3) {
    copyIncludeFiles(process.argv[2], process.argv[3]);
}
