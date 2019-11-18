
const File = require('./common-file')
const cheerio = require('cheerio');

class HTMLFile extends File {
    constructor(file) {
        super(file)
    }

    findDevonfwRef(link) {
        const $ = cheerio.load(this.content);
        const h = (n) => `h${n}[id="${link}"]`;
        const hSelector = [h(1), h(2), h(3), h(4), h(5), h(6)].join(',');

        let links = $(hSelector);

        if (links.length > 0) {
            console.log(`found anchor "${link}" in file "${this.base}"`)
        }
        return links.length > 0;
    }

    updateReferences(oldRef, newRef) {
        const $ = cheerio.load(this.content);
        let updated = false;

        $(`a[href="${oldRef}"]`).each(function(){
            $(this).attr('href', newRef);
            updated = true;
        });

        this.content = $.html();
        this._updateFileContent();

        return updated;
    }
}

module.exports = HTMLFile;