import { landingPageModel, Link, Card, Slide, InfoBlock } from './model.js';
import { renderModule } from './components.js';

(function(window) {
    // Function definitions

    function loadModel() {
        const HTML_FILE = getHtmlFileName();
        const asciiHtmlOutcome = `${HTML_FILE} #content`;
        $('.sourceDataContainer').load(asciiHtmlOutcome, () => {
            // Loading first section data
            let sh1 = landingPageModel.sections.first;
            sh1.title1 = $('#content .source.first-section .title1>h3').text();
            sh1.title2 = $('#content .source.first-section .title2>h4').text();
            sh1.bgImage = getFileNameBySrc($('#content .source.first-section .bg-image img')[0].src)
            sh1.firstButtonText = $('#content .source.first-section .start>p>b').text();
            sh1.secondButtonText = $('#content .source.first-section .download>p>b').text();
            // Loading second section data
            let sh2 = landingPageModel.sections.second;
            sh2.title1 = $('#content .source.second-section .title1>p').text();
            sh2.title2 = $('#content .source.second-section .title2>p').text();
            sh2.text1 = $('#content .source.second-section .text1>h3').text();
            sh2.text2 = $('#content .source.second-section .text2>h3').text();
            // Loading third section data
            let sh3 = landingPageModel.sections.third;
            $('#content .source.third-section .imageIcon').each((index, element) => {
                let imgSrc = $(element).find('img')[0] != undefined ? $(element).find('img')[0].src : '';
                sh3.logoIcons.push(getFileNameBySrc(imgSrc));
            });
            // Loading fourth section data
            let sh4 = landingPageModel.sections.fourth;
            sh4.title1 = $('#content .source.fourth-section .title1>p').text();
            $('#content .source.fourth-section .card').each((index, element) => {
                let card = new Card();
                card.image = $(element).find('li img')[0] != undefined ? getFileNameBySrc($(element).find('li img')[0].src) : '';
                card.title = $($($(element).find('li')[1]).find('p')[0]).text();
                card.description = $($($(element).find('li')[2]).find('p')[0]).text();
                card.link.href = $(element).find('li a')[0] != undefined ? getLinkPathByHref($(element).find('li a')[0].href) : '';
                card.link.text = $(element).find('li a')[0] != undefined ? $($(element).find('li a')[0]).text() : '';
                sh4.cards.push(card);
            });
            // Loading fifth section data
            let sh5 = landingPageModel.sections.fifth;
            $('#content .source.fifth-section .ulist').each((index, element) => {
                let slide = new Slide();
                slide.text1 = $($(element).find('li > p')[0]).text();
                slide.text2 = $($(element).find('li > p')[1]).text();
                slide.text3 = $($(element).find('li > p')[2]).text();
                slide.text4 = $($(element).find('li > p')[3]).text();
                sh5.slides.push(slide);
            });
            // Loading sixth section data
            let sh6 = landingPageModel.sections.sixth;
            $('#content .source.sixth-section .infoBlock').each((index, element) => {
                let infoBlock = new InfoBlock();
                infoBlock.title = $($(element).find('.title')[0]).text();
                $(element).find('.ulist > ul > li > p > a').each((i, linkElement) => {
                    let link = new Link();
                    link.text = $(linkElement).text();
                    link.href = getLinkPathByHref(linkElement.href);
                    infoBlock.links.push(link);
                });
                sh6.infoBlocks.push(infoBlock);
            });
            // Loading seventh section data
            let sh7 = landingPageModel.sections.seventh;
            $('#content .source.seventh-section .footer a').each((index, element) => {
                let link = new Link();
                link.text = $(element).text();
                link.href = getLinkPathByHref(element.href);
                sh7.links.push(link);
            });
            // Rendering
            renderModule.firstSection(landingPageModel.sections.first);
            renderModule.secondSection(landingPageModel.sections.second);
            renderModule.thirdSection(landingPageModel.sections.third);
            renderModule.fourthSection(landingPageModel.sections.fourth);
            renderModule.fifthSection(landingPageModel.sections.fifth);
            renderModule.sixthSection(landingPageModel.sections.sixth);
            renderModule.seventhSection(landingPageModel.sections.seventh);

            // Clean DOM
            $(".sourceDataContainer.d-none").remove();
        });
    }

    function loadFirstSection(sectionDest = '.first-section-container', handler) {
        const HTML_FILE = getHtmlFileName();
        const LOGO_SELECTOR = `${HTML_FILE} #content`;
        $('.sourceDataContainer').load(LOGO_SELECTOR,
            () => {
                handler()
                    // Load bg image
                bgImageFileName = getFileNameBySrc($('.source .devon-bg-image img')[0].src)
                $('#logo-page .bg-image').css('background-image', 'url("../../images/' + bgImageFileName + '")')
                console.info('First section loaded succesfully!')
            })
    }

    function loadLogoPage(logoDestSelector = '#logo-page', handler = () => {}) {
        const HTML_FILE = getHtmlFileName();
        const LOGO_SELECTOR = `${HTML_FILE} #content .sect1`;
        console.info('loading logo page...');
        $(logoDestSelector).load(LOGO_SELECTOR, function() {
            handler();
            console.info('Logo page loaded succesfully!');
            loadFirstSection();
        });

    }

    function getHtmlFileName() {
        let thisFile = $('script[src$="logo.js"]')[0];
        let thisFilename = thisFile.attributes.src.value;
        let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
        return htmlFilemame;
    }

    function getFileNameBySrc(filepath) {
        let pathLength = filepath.split('/').length
        let fileName = filepath.split('/')[pathLength - 1];
        return fileName
    }

    function getLinkPathByHref(href) {
        return href.split('#')[1];
    }

    function renderPage() {

    }

    // List of functions accessibly by other scripts
    window.LogoModule = {
        loadLogoPage: loadLogoPage,
        loadFirstSection: loadFirstSection,
        loadModel: loadModel
    };
})(window);