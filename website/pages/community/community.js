import { UtilsModule } from '../../shared/utils.js';

const communityModule = (function(window) {
  // Function definitions
  function loadCommunity(
    communityDestSelector = '#community-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const COMMUNITY_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(communityDestSelector).load(COMMUNITY_SELECTOR, function() {
      UtilsModule.editSrc();
      handler();
    });
  }

  function getHtmlFileName() {
    return 'community.html';
  }

  // List of functions accessibly by other scripts
  return {
    loadCommunity: loadCommunity,
  };
})(window);

export const CommunityModule = communityModule;