const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const sharp = require("sharp");

function main(solutionsDir, outputFile, snippetLength) {
    var solutions = {};

    let dirContent = fs.readdirSync(solutionsDir);
    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);

        if (!fileStats.isFile()) {
            var indexHtmlPath = path.join("./", item, "index.html");
            if (fs.existsSync(indexHtmlPath)) {
                var indexHtml = cheerio.load(fs.readFileSync(indexHtmlPath));
                var headline = indexHtml("h1").first().text() || indexHtml("h2").first().text() || indexHtml("h3").first().text() || indexHtml("title").first().text() || "";
                var imagePath = indexHtml('.previewImage img').first().attr("src") || indexHtml("#content img").first().attr("src") || "";
                var snippet = indexHtml("#content .paragraph").first().text() || "";
                if (snippet.length > snippetLength) {
                    snippet = snippet.slice(0, snippetLength - 1) + " ...";
                }
                
                console.log("Before: " + imagePath);

                if (imagePath != "") {
                    sharp(`./solutions/${dirItem}/${imagePath}`)
                        .resize({ width: 600 })
                        .toFile(`./target/generated-docs/solutions/${dirItem}/_previewImage.png`);
                    imagePath = `./solutions/${dirItem}/_previewImage.png`;
                }

                console.log("After:" + imagePath);
                
                solutions[dirItem] = {
                    headline: headline,
                    path: `solutions/${dirItem}`,
                    image: imagePath,
                    snippet: snippet
                }
            }
        }
    });
    console.log(solutions);
    fs.writeFileSync(path.join("./", outputFile), JSON.stringify(solutions));
}

if (process.argv.length > 3) {

    main(process.argv[2], process.argv[3], process.argv[4]);
}
