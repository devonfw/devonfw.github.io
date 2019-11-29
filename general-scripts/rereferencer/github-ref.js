class GitReference {
    constructor() {
        this.protocol = '';
        this.domain = '';
        this.organization = '';
        this.stack = '';
        this.wiki = '';
        this.file = '';
        this.id = '';
        this.location = [];
    }

    setProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    setDomain(domain) {
        this.domain = domain;
        return this;
    }

    setOrg(organization) {
        this.organization = organization;
        return this;
    }

    setStack(stack) {
        this.stack = stack;
        return this;
    }

    setWiki(wiki) {
        this.wiki = wiki;
        return this;
    }

    setLocation(location) {
        this.location = location;
        return this;
    }

    setFile(file) {
        this.file = file;
        return this;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    toString() {
        let path = [
            this.domain,
            this.organization,
            this.stack,
            this.wiki]

        if (this.location.length > 0) {
            path.push(this.location.join('/'));
        }
        if (this.file) {
            path.push(this.file);
        }
        path = path.join('/');

        let prot = this.protocol ? this.protocol + '://' : '';
        let id = this.id ? '#' + this.id : '';

        return `${prot}${path}${id}`;
    }
}

module.exports = GitReference;