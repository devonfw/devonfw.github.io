(function(window, undefined) {
  // Function definitions
  function loadResources(
    resourcesDestSelector = '#resources-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const RESOURCES_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(resourcesDestSelector).load(RESOURCES_SELECTOR, function() {
      handler();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="resources.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.ResourcesModule = {
    loadResources: loadResources,
  };
})(window);
