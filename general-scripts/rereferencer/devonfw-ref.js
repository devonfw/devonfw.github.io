

class devonfwReference {
    constructor() {
        this.protocol = '';
        this.domain = '';
        this.location = '';
        this.file = '';
        this.id = '';
    }

    setProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    setDomain(domain) {
        this.domain = domain;
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
        const loc = this.location.join('/');
        const filePath = [this.domain, loc, this.file].join('/');

        let str = this.protocol ? this.protocol + '://' : '';
        str += filePath;
        str += this.id ? '#' + this.id : '';

        return str;
    }
}

module.exports = devonfwReference;