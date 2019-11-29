const path = require('path')
const fs = require('fs')

class File {
    constructor(file) {
        const fileObj = path.parse(file);
        
        this.content = fs.readFileSync(file, 'utf-8');
        this.file = file;
        this.root = fileObj.root;
        this.dir = fileObj.dir;
        this.base = fileObj.base;
        this.ext = fileObj.ext;
        this.name = fileObj.name;
    }

    _updateFileContent() {
        fs.writeFileSync(this.file, this.content)
    }
}

module.exports = File;
