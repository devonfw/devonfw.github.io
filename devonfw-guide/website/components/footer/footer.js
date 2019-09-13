(function(window) {

    // Function definitions

    function loadFooter(selector) {
        const HTML_FILE = getHtmlFileName();
        const asciiHtmlOutcome = `${HTML_FILE} #content`;
        $('body').append('<div class="footerTemporal d-none">')

        $('.footerTemporal').load(asciiHtmlOutcome, (data) => {
            // Loading first section data
            let sh1 = footerModel.sections.first
            $('#content .source.footer-first-section .infoBlock').each((index, element) => {
                let infoBlock = new InfoBlock();
                infoBlock.title = $($(element).find('.title')[0]).text();
                $(element).find('.ulist > ul > li > p > a').each((i, linkElement) => {
                    let link = new Link();
                    link.text = $(linkElement).text();
                    link.href = getLinkPathByHref(linkElement.href);
                    infoBlock.links.push(link);
                });
                sh1.infoBlocks.push(infoBlock);
            });

            // Loading second section data
            let sh2 = footerModel.sections.second
            $('#content .source.footer-second-section .footer a').each((index, element) => {
                let link = new Link();
                link.text = $(element).text();
                link.href = getLinkPathByHref(element.href);
                sh2.links.push(link);
            });

            // Rendering
            renderFirstFooterSection(footerModel.sections.first, selector);
            renderSecondFooterSection(footerModel.sections.second, selector);

            // Clean DOM
            $(".footerTemporal.d-none").remove();
        });
    }

    function getHtmlFileName() {
        let thisFile = $('script[src$="footer.js"]')[0];
        let thisFilename = thisFile.attributes.src.value;
        let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
        return htmlFilemame;
    }

    function getLinkPathByHref(href) {
        return href.split('#')[1];
    }

    const Link = function() {
        this.href = '';
        this.text = '';
    }

    const InfoBlock = function() {
        this.title = '';
        this.links = [];
    }

    const footerModel = {
        sections: {
            first: {
                infoBlocks: []
            },
            second: {
                links: []
            }
        }
    }

    function renderFirstFooterSection(model, selector) {
        let infoBlocks = '';

        model.infoBlocks.forEach(elem => {
            let links = '';
            elem.links.forEach(link => {
                links += `<li><a class="custom-grey" href="${link.href}" target="_blank">${link.text}</a></li>`
            })
            infoBlocks += `                
                            <div class="col-12 col-md-6 col-lg-3">
                                <div class="col-9 offset-3">
                                    <h5>${elem.title}</h5>
                                    <ul class="list-unstyled">
                                        ${links}
                                    </ul>
                                </div>
                            </div>
                        `
        });

        let content = ` 
                        <div class="container-fluid py-5 reset-bg-color">           
                            <div class="row">
                                ${infoBlocks}
                            </div>
                        </div>
                    `
        $(selector).append(content);
    }

    function renderSecondFooterSection(model, selector) {
        let links = '';

        model.links.forEach(link => {
            links += `<a class="custom-grey mr-3" href="${link.text}" target="_blank">${link.text}</a>`
        });

        let content = ` <div class="border"></div>
                        <div class="container-fluid py-5 reset-bg-color"> 
                            <div class="row">
                                <div class="col-12">
                                    <div class="col-11 offset-1">
                                    ${links}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
        $(selector).append(content);
    }

    // List of functions accessibly by other scripts
    window.FooterModule = {
        loadFooter: loadFooter
    };
})(window);