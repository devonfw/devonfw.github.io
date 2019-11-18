const devonfwReference = require('./devonfw-ref')

const PROTOCOL = 'https';
const WIKI_TOKEN = 'wiki';
const DEFAULT_ANCHOR = '';
const WORDS_SEPARATOR = '-';
const DOMAIN = 'devonfw.com';
const DEFAULT_PREFIX = 'master';
const ANCHOR = (str) => `_${str}`;
const ORIGINAL_FILE_EXT = '.asciidoc';
const CLEAN_REGEX = /[?¿!¡':()&/“”`\"\[\]#]/g;
const LOCATION_IN_DOMAIN = ['website', 'pages', 'docs'];
const STACKS = (stack) => {
    if (stack == 'devonfw-testing') return 'mrchecker';
    if (stack == 'tools-cobigen') return 'cobigen';
    return stack;
}

class Mapper {

    constructor() {
        if (!Mapper.instance) {
            Mapper.instance = this;
        }

        return Mapper.instance;
    }

    devonfwFromGit(gitReference) {
        const devonfwRef = new devonfwReference();
        devonfwRef
            .setDomain(DOMAIN)
            .setLocation(LOCATION_IN_DOMAIN)
            .setProtocol(PROTOCOL);

        const prefix = gitReference.wiki == WIKI_TOKEN ? DEFAULT_PREFIX : gitReference.wiki
        const sufix = STACKS(gitReference.stack)
        const devonfwSubId = gitReference.id ? ANCHOR(gitReference.id) : DEFAULT_ANCHOR;

        let devonfwId;
        let devonfwIdNormalized = DEFAULT_ANCHOR
        if (gitReference.file) {
            devonfwId = gitReference.file + ORIGINAL_FILE_EXT + devonfwSubId;
            devonfwIdNormalized = devonfwId.trim().toLowerCase().replace(CLEAN_REGEX).replace(' ', WORDS_SEPARATOR);
        }
        devonfwRef
            .setFile(prefix + WORDS_SEPARATOR + sufix + ORIGINAL_FILE_EXT)
            .setId(devonfwIdNormalized);

        return devonfwRef;
    }
}

const instance = new Mapper();
Object.freeze(instance);

// export default instance;
module.exports = instance;