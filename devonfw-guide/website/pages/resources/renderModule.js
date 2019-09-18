import { ConfigModule } from '../../config/devonfw-site-conf.js';

const section1 = function(s1Model) {
    console.log(s1Model)
    let template = `
        <div class="px-3 py-3 p-sm-5 bg-ligthgray">
            <div class="mx-1 mx-md-5">
                <h3 class="font-weight-bold">${s1Model.title1}</h3>
                <h4 class="font-weight-bold">${s1Model.title2}</h4>
                <p>${s1Model.text1}</p>
                <a
                class="btn btn-primary bg-custom-blue px-4 border-0"
                href="${s1Model.button.href}">${s1Model.button.text}
                </a>
            </div>
        </div>`;
    
    return template;
}

const section2 = function(s2Model) {
    let nTexts = s2Model.text1.length;
    let half = parseInt(nTexts/2)
    if(nTexts % 2 !== 0) {
        half += 1;
    };
    let texts = s2Model.text1.map(el => `<p class="mb-4">${el}</p>`)
    
    let template = 
        `<div>
            <h5 class="font-weight-bold">${s2Model.title1}</h5>
            <div class="row">
                <div class="col-12 col-md-6">
                    ${texts.slice(0, half).join('')}
                </div>
                <div class="col-12 col-md-6">
                    ${texts.slice(half, nTexts).join('')}
                </div>
            </div>
        </div>`;

    return template;
}

const section3 = function(s3Model) {
    let template = `
        <div>
            <h4 class="font-weight-bold text-center">${s3Model.title1}</h4>
            ${s3Model.videoEl.get(0).outerHTML}
        </div>`;
    return template;
}

const section4 = function(s4Model) {
    let cards = '';

    s4Model.cards.forEach(elem => {
        cards += `
            <div class="col-12 col-md-6 col-lg-4 py-3">
                <a class="custom-link-card" href="${elem.link.href}" target="_blank">
                    <div class="card h-100 custom-card">
                        <div class="row no-gutters m-auto">
                            <div class="col-md-4 d-flex justify-content-center align-items-center">
                                <img src="${elem.image}" class="card-img custom-card-img">
                            </div>
                            <div class="col-md-8 m-auto">
                                <div class="card-body">
                                    <h5 class="card-title font-weight-bold mb-0 size-17">${elem.title}</h5>
                                    <p class="card-text my-1 size-16">${elem.description}</p>
                                    <p class="card-text custom-blue link-decoration size-17">${elem.link.text}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
                `
    });

    let template = `
        <div>
            <h3 class="font-weight-bold">${s4Model.title1}</h3>
            <div class="row">${cards}</div>
        </div>`;
    
    return template;
}

const section5 = function(s5Model) {
    let template = `
        <div>
            <h3 class="font-weight-bold">${s5Model.title1}</h3>
            <p>${s5Model.text1}</p>
        </div>`;
    
    return template;
}

const section6 = function(s6Model) {
    const subsections = s6Model.subsection1.map(sub => {
        let links = sub.links.map(l => `<a href="${l.href}">${l.text}</a>`);
        let subsection = `
            <div>
                <h5 class="font-weight-bold">${sub.title2}</h5>
                <p>${sub.text2}</p>
                <div>
                    ${links.join('')}
                </div>
            </div>`;

        return subsection;
    });

    const template = `
        <div>
            <h3 class="font-weight-bold">${s6Model.title1}</h3>
            <p>${s6Model.text1}</p>
            ${subsections.join('')}
        </div>`;
    
    return template;
}

const section7 = function(s7Model) {
    let links = s7Model.links.map(
        l => `<a class="d-block" href="${l.href}">${l.text}</a>`);
    let template = `
        <div>
            <h3 class="font-weight-bold">${s7Model.title1}</h3>
            <p>${s7Model.text1}</p>
            ${links.join('')}
        </div>`;

    return template;
}

const section8 = function(s8Model) {
    let template = `
        <div class="overflow-x-auto">
            <h3 class="font-weight-bold">${s8Model.title1}</h3>
            <p>${s8Model.text1}</p>
            ${s8Model.tableEl.get(0).outerHTML}
        </div>`;

    return template;
}

const section9 = function(s9Model) {
    return section8(s9Model);
}

const render = function(destSelector, template) {
    $(destSelector).html(template);
}

export const renderModule = {
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    section8,
    section9,
    render,
}

