(function(window) {
  // Function definitions
  function loadExplorePage(
    exploreDestSelector = '#explore-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const EXPLORE_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(exploreDestSelector).load(EXPLORE_SELECTOR, function() {
      handler();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="explore.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.ExploreModule = {
    loadExplorePage: loadExplorePage,
  };
})(window);
