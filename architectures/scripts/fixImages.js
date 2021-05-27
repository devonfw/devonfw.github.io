const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function main(solutionsDir) {
    let dirContent = fs.readdirSync(solutionsDir);
    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexHtmlPath = path.join("./", item, "index.html");
            if (fs.existsSync(indexHtmlPath)) {
                var indexHtml = cheerio.load(fs.readFileSync(indexHtmlPath));
                indexHtml("#content img").each(function () {
                    var src = indexHtml(this).attr("src");
                    var normalizedSrc = src.replace(/^[./\\]+/, "");
                    console.log(normalizedSrc);
                    if (fs.existsSync(path.join("./", item, normalizedSrc))) {
                        indexHtml(this).attr("src", normalizedSrc);
                        fs.writeFileSync(indexHtmlPath, indexHtml.html());
                    }
                    else if(src.includes("/generated-docs/")){
                        var basename = path.basename(src);
                        if (fs.existsSync(path.join("./", item, basename))) {
                            indexHtml(this).attr("src", basename);
                            fs.writeFileSync(indexHtmlPath, indexHtml.html());
                        }
                    }
                });
            }
        }
    });
}

if (process.argv.length > 2) {

    main(process.argv[2]);
}