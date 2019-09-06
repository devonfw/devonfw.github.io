(function(window) {
    // Function definitions
    function loadFirstSection(sectionDest = '.first-section-container', handler) {
        const HTML_FILE = getHtmlFileName();
        const LOGO_SELECTOR = `${HTML_FILE} .logo-page.first-section.source`;
        console.log('loading first section...')
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
        pathLength = filepath.split('/').length
        fileName = filepath.split('/')[pathLength - 1];
        return fileName
    }

    // List of functions accessibly by other scripts
    window.LogoModule = {
        loadLogoPage: loadLogoPage,
        loadFirstSection: loadFirstSection
    };
})(window);