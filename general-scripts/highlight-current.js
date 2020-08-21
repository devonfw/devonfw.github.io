const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path')


function highlight(websideDir) {

    let pagesDir = path.join(websideDir, 'pages');
    let dirs = fs.readdirSync(pagesDir);

    for (let dirIndex in dirs) {
        let dir = dirs[dirIndex];
        let files = fs.readdirSync(path.join(pagesDir, dir));
        for (let fileIndex in files) {
            let file = files[fileIndex];
            if (file.endsWith(".html")) {
                let filePath = path.join(pagesDir, dir, file);
                console.log("Highlighting " + filePath);
                if (fs.existsSync(filePath)) {
                    let $ = cheerio.load(fs.readFileSync(filePath))
                    $('#website-navbar a').each(function (index, element) {
                        if (element.attribs['href'].indexOf('/website/pages/' + dir + '/') === 0) {
                            $(element).addClass('active');
                        }
                    });
                    fs.writeFileSync(filePath, $.html(), { encoding: 'utf-8' });
                }
            }
        }
    }
}

if (process.argv.length > 2) {
    highlight(process.argv[2]);
}