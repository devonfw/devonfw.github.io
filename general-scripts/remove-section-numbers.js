const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')


function main(asciidocDir) {
    let p = path.join(process.cwd(), asciidocDir);
    removeNumbers(p);
}

function removeNumbers(dirPath) {
    let dirs = fs.readdirSync(dirPath);

    for (let dirIndex in dirs) {
        let dir = dirs[dirIndex];
        let p = path.join(dirPath, dir);
        if (fs.lstatSync(p).isDirectory()) {
            removeNumbers(p);
        }
        else {
            if (path.extname(p) == ".asciidoc") {
                let fileContent = fs.readFileSync(p, { encoding: "utf8" });
                if (fileContent.includes(":sectnums:") || fileContent.includes(":partnums:")) {
                    fileContent = fileContent.replace(":sectnums:", "").replace(":partnums:", "");
                    fs.writeFileSync(p, fileContent);
                }
            }
        }
    }
}

if (process.argv.length > 2) {
    main(process.argv[2]);
}