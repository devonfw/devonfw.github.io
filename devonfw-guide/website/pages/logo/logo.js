(function(window) {
  // Function definitions
  function loadLogoPage(logoDestSelector = '#logo-page', handler = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const LOGO_SELECTOR = `${HTML_FILE} #content .sect1`;

    console.info('loading logo page...');
    $(logoDestSelector).load(LOGO_SELECTOR, function() {
      handler();
      console.info('Logo page loaded succesfully!');
    });
    
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="logo.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.LogoModule = {
    loadLogoPage: loadLogoPage,
  };
})(window);
