(function(window, undefined) {
  // Function definitions
  function loadDocs(docsDestSelector = '#docs-page', handler = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const DOCS_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(docsDestSelector).load(DOCS_SELECTOR, function() {
      handler();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="docs.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.DocsModule = {
    loadDocs: loadDocs,
  };
})(window);
