import { UtilsModule } from '../../shared/utils.js';

const exploreModule = (function(window) {
  // Function definitions
  function loadExplorePage(
    exploreDestSelector = '#explore-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const EXPLORE_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(exploreDestSelector).load(EXPLORE_SELECTOR, function() {
      UtilsModule.editSrc();
      handler();
    });
  }

  function getHtmlFileName() {
    return 'explore.html';
  }

  // List of functions accessibly by other scripts
  return {
    loadExplorePage: loadExplorePage,
  };
})(window);

export const ExploreModule = exploreModule;