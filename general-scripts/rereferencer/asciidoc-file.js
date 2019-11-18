
const File = require('./common-file')
const GitReference = require('./github-ref')

const DEFAULT_ANCHOR = '';
const DEFAULT_LOCATION = [];
const DEFAULT_PROTOCOL = 'https';

class AsciidocFile extends File {
    constructor(file) {
        super(file);
    }

    findGitReferences(regex, checks = {}) {
        const refs = new Set();
        let m;

        while ((m = regex.exec(this.content)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.length > 6) {
                const gitRef = new GitReference();
                gitRef
                    .setProtocol(m[1] ? m[1] : DEFAULT_PROTOCOL)
                    .setDomain(m[2])
                    .setOrg(m[3])
                    .setStack(m[4])
                    .setWiki(m[5])
                    .setLocation(m[7] ? m[7].split('/') : DEFAULT_LOCATION)
                    .setFile(m[9])
                    .setId(m[11] ? m[11] : DEFAULT_ANCHOR);

                const checksOk = checkObjectFields(gitRef, checks);

                if (checksOk) {
                    refs.add(gitRef);
                }
            }
        }
        return Array.from(refs);
    }
}

function checkObjectFields(obj, fields) {
    const keys = Object.keys(fields);
    let checksOk = true;
    for (const key of keys) {
        checksOk =
            checksOk && !!fields[key] && !!obj[key] && fields[key] == obj[key];
    }

    return checksOk;
}

module.exports = AsciidocFile;