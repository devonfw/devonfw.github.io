export const landingPageModel = {
    sections: {
        first: {
            title1: '',
            title2: '',
            bgImage: '',
            firstButtonText: '',
            secondButtonText: ''
        },
        second: {
            title1: '',
            title2: '',
            text1: '',
            text2: ''
        },
        third: {
            logoIcons: []
        },
        fourth: {
            title1: '',
            cards: []
        },
        fifth: {
            slides: []
        },
        sixth: {
            infoBlocks: []
        },
        seventh: {
            links: []
        }
    }
}

export const Link = function() {
    this.href = '';
    this.text = '';
}

export const Card = function() {
    this.image = '';
    this.title = '';
    this.description = '';
    this.link = new Link();
}

export const Slide = function() {
    this.text1 = '';
    this.text2 = '';
    this.text3 = '';
    this.text4 = '';
}

export const InfoBlock = function() {
    this.title = '';
    this.links = [];
}