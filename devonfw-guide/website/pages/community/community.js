(function(window) {
  // Function definitions
  function loadCommunity(
    communityDestSelector = '#explore-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const COMMUNITY_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(communityDestSelector).load(COMMUNITY_SELECTOR, function() {
      handler();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="community.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.CommunityModule = {
    loadCommunity: loadCommunity,
  };
})(window);