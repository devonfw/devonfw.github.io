const { map, add } = require('cheerio/lib/api/traversing');
const fs = require('fs');
const path = require('path');

var tags = {};
var frequence = new Map();
var tagsWithoutDup = [];

function main(solutionsDir, outputFile) {

    let predefindPath = path.join(solutionsDir, "predefinedTags.asciidoc");
    console.log(predefindPath);
    parseFile(predefindPath);

    let dirContent = fs.readdirSync(solutionsDir);
    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexAsciiDocPath = path.join("./", item, "index.asciidoc");
            parseFile(indexAsciiDocPath, dirItem);
        }
    });
    for (tag in tags) {
        selectTag(tags, tag, 0, frequence);
    }
    for (t in tags) {
        for (tag in (tags[t])) {
            selectTag(tags[t], tag, 0, frequence);
        }
    }

    console.log(tags);
    fs.writeFileSync(path.join("./", outputFile), JSON.stringify(tags));
}

function parseFile(indexAsciiDocPath, dirItem) {
    if (fs.existsSync(indexAsciiDocPath)) {
        var indexAsciiDoc = fs.readFileSync(indexAsciiDocPath, { encoding: "utf-8" });
        var lines = indexAsciiDoc.split("\n");
        for (var i in lines) {
            var line = lines[i];
            if (line.startsWith("//")) {
                var parts = line.replace("//", "").split("=", 2);
                var duplicatePos = compareTags(tagsWithoutDup, parts[0]);
                parts[0] = addFrequence(duplicatePos, parts[0], frequence, tagsWithoutDup);
                if (parts.length == 2) {
                    var tagValues = parts[1].split(";");
                    tagValues.forEach(tagValue => {
                        duplicatePos = compareTags(tagsWithoutDup, tagValue);
                        tagValue = addFrequence(duplicatePos, tagValue.trim(), frequence, tagsWithoutDup);
                        if (!tags[parts[0]]) {
                            tags[parts[0]] = {};
                        }
                        if (!tags[parts[0]][tagValue.trim()]) {
                            tags[parts[0]][tagValue.trim()] = [];
                        }
                        if(dirItem){
                            tags[parts[0]][tagValue.trim()].push(dirItem);
                        }
                    });
                }
            }
            else {
                break;
            }
        }
    }
    else {
        console.log(indexAsciiDocPath + " does not exist.");
    }
}

function compareTags(arr, tag) {
    return arr.indexOf(tag.toLowerCase().replace(/\s+/g, ""));
}

function addFrequence(duplicatePos, tag, frequenceArr, compareArr) {
    if (duplicatePos > -1) {
        if (!frequenceArr.has(tag)) {
            frequenceArr.set(tag, 1)
            tag = tag.toLowerCase().replace(/\s+/g, "");
        }
        else {
            frequenceArr.set(tag, frequenceArr.get(tag) + 1);
            tag = tag.toLowerCase().replace(/\s+/g, "");
        }
    }
    else {
        frequenceArr.set(tag, 1);
        compareArr.push(tag.toLowerCase().replace(/\s+/g, ""));
        tag = tag.toLowerCase().replace(/\s+/g, "");
    }

    return tag;
}

function selectTag(tags, tag, maxFrequence, frequenceArr) {
    var finalTag;

    for (k of frequenceArr.keys()) {
        if (k.toLowerCase().replace(/\s+/g, "") == tag) {
            if (maxFrequence < frequenceArr.get(k)) {
                maxFrequence = frequenceArr.get(k);
                finalTag = k;
            }
        }
    }
    tags[finalTag] = tags[tag];
    if (finalTag != tag)
        delete tags[tag];

}

if (process.argv.length > 3) {

    main(process.argv[2], process.argv[3]);
}