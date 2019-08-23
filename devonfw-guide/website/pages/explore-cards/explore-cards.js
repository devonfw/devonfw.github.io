(function(window, undefined) {
  // Function definitions
  function loadExploreCards(
    cardDestSelector = '#explore-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const EXPLORE_CARDS_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(cardDestSelector).load(EXPLORE_CARDS_SELECTOR, function() {
      handler();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="explore-cards.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.ExploreModule = {
    loadExploreCards: loadExploreCards,
  };
})(window);
