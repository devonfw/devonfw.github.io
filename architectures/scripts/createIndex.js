const fs = require('fs');
const path = require('path');

function main(solutionsDir, outputFile) {
    //TODO
    fs.writeFileSync(path.join("./", outputFile), JSON.stringify({}));
}

if (process.argv.length > 3) {

    main(process.argv[2], process.argv[3]);
}