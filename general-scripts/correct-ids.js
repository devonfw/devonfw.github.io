const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')


function main(asciidocDir) {
    usedIds = [];
    duplicateIds = [];
    let p = path.join(process.cwd(), asciidocDir);
    checkIds(p);
    correctDuplicates(p);
}

function checkIds(dirPath) {
    let dirs = fs.readdirSync(dirPath);

    for (let dirIndex in dirs) {
        let dir = dirs[dirIndex];
        let p = path.join(dirPath, dir);
        if (fs.lstatSync(p).isDirectory()) {
            checkIds(p);
        }
        else {
            if (path.extname(p) == ".asciidoc") {
                let fileContent = fs.readFileSync(p, { encoding: "utf8" });
                let matches = [...fileContent.matchAll(/^\[\[([^\]]+)\]\]\s*$/gm)];
                for (var matchIndex in matches) {
                    let id = matches[matchIndex][1];
                    if (usedIds.includes(id)) {
                        duplicateIds.push(id);
                    }
                    else {
                        usedIds.push(id);
                    }
                }
            }
        }
    }
}

function correctDuplicates(dirPath) {
    let dirs = fs.readdirSync(dirPath);

    for (let dirIndex in dirs) {
        let dir = dirs[dirIndex];
        let p = path.join(dirPath, dir);
        if (fs.lstatSync(p).isDirectory()) {
            correctDuplicates(p);
        }
        else {
            if (path.extname(p) == ".asciidoc") {
                correctDuplicate(p);
            }
        }
    }
}

function correctDuplicate(p) {
    let fileContent = fs.readFileSync(p, { encoding: "utf8" });
    let matches = [...fileContent.matchAll(/^\[\[([^\]]+)\]\]\s*$/gm)];
    let correctedIds = [];
    let newIds = [];
    for (var matchIndex in matches) {
        let id = matches[matchIndex][1];
        if (duplicateIds.includes(id)) {
            let splitPath = p.split(path.sep);
            let prefix = "";
            for (let i = 0; i < splitPath.length - 1; i++) {
                let completePrefix = splitPath.slice(i).join("_");
                if (id.startsWith(completePrefix + "_") && !usedIds.includes(splitPath[i] + "_" + id)) {
                    break;
                }
                prefix = splitPath[i];
            }
            let newId = prefix + "_" + id;
            if (correctedIds.includes(id)) {
                newId += "_" + (correctedIds.length + 1);
            }
            fileContent = fileContent.replace("[[" + id + "]]", "[[" + newId + "]]");
            correctedIds.push(id);
            newIds.push(newId);
        }
    }
    usedIds = usedIds.concat(newIds);
    fs.writeFileSync(p, fileContent);
}

if (process.argv.length > 2) {
    main(process.argv[2]);
}