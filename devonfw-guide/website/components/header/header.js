(function(window, undefined) {
  // Function definitions
  function loadNavbar(navbarDestSelector, afterLoad = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const NAVBAR_SELECTOR = `${HTML_FILE} #content .sect1 .sectionbody ul`;
    console.log(HTML_FILE);
    $(navbarDestSelector).load(NAVBAR_SELECTOR, afterLoad);
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="/header.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  function appendEnd(navbarDestSelector, element) {
    console.log('FILENAME');
    const navbarDest = `${navbarDestSelector} > ul:first-child`;
    $(navbarDest).append(element);
  }

  // List of functions accessibly by other scripts
  window.HeaderModule = {
    loadNavbar: loadNavbar,
    appendEnd: appendEnd,
  };
})(window);
