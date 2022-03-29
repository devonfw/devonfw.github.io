const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function fixImageSrc(){
		if (!fileStats.isFile()) {
            var indexHtmlPath = path.join("./", item, "index.html");
			console.log(indexHtmlPath);
            if (fs.existsSync(indexHtmlPath)) {
                var indexHtml = cheerio.load(fs.readFileSync(indexHtmlPath));
                indexHtml("#content img").each(function () {
                    var src = indexHtml(this).attr("src");
                    var normalizedSrc = src.replace(/^[./\\]+/, "");
					if(src.includes("/generated-docs/")){
                        var imagesrcSplitted = src.split("/generated-docs/");
						var imagesrc = imagesrcSplitted[imagesrcSplitted.length - 1];
                        if (fs.existsSync(path.join("./", item, imagesrc))) {
							console.log("img src ", path.join("./", item, imagesrc));
                            indexHtml(this).attr("src", imagesrc);
                            fs.writeFileSync(indexHtmlPath, indexHtml.html());
                        }
                    }
                });
            }
        }
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function main(solutionsDir) {
	console.log('fix Images');
    let dirContent = fs.readdirSync(solutionsDir);
    dirContent.forEach(function (dirItem) {
        item = `${solutionsDir}/${dirItem}`;
        fileStats = fs.lstatSync(item);
        fixImageSrc(item, fileStats);
    });
	
	let subDir = getDirectories(solutionsDir); 
	subDir.forEach(function (dirItem) {
		dirContent = fs.readdirSync(dirItem);
		dirContent.forEach(function (subdirItem) {
        item = `${dirItem}/${subdirItem}`;
        fileStats = fs.lstatSync(item);
        fixImageSrc(item, fileStats);
		});
    });
	
	
}

if (process.argv.length > 2) {

    main(process.argv[2]);
}