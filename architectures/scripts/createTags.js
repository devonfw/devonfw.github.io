const fs = require('fs');
const path = require('path');

function main(solutionsDir, outputFile) {
    var tags = {};
    
    let dirContent = fs.readdirSync(solutionsDir);
    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexAsciiDocPath = path.join("./", item, "index.asciidoc");
            var indexAsciiDoc = fs.readFileSync(indexAsciiDocPath, {encoding: "utf-8"});
            var lines = indexAsciiDoc.split("\n");
            for(var i in lines){
                var line = lines[i];
                if(line.startsWith("//")){
                    var parts = line.replace("//","").split("=", 2);
                    if(parts.length == 2){
                        var tagValues = parts[1].split(";");
                        tagValues.forEach(tagValue => {
                            if(!tags[parts[0]]){
                                tags[parts[0]] = {};
                            }
                            if(!tags[parts[0]][tagValue.trim()]){
                                tags[parts[0]][tagValue.trim()] = [];
                            }
                            tags[parts[0]][tagValue.trim()].push(dirItem);
                        });
                    }
                }
                else{
                    break;
                }
            }
        }
    });
    console.log(tags);
    fs.writeFileSync(path.join("./", outputFile), JSON.stringify(tags));
}

if (process.argv.length > 3) {

    main(process.argv[2], process.argv[3]);
}