import { UtilsModule } from '../../shared/utils.js';

const resourcesModule = (function(window) {
  // Function definitions
  function loadResources(
    resourcesDestSelector = '#resources-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const RESOURCES_SELECTOR = `${HTML_FILE} #content .sect1`;

    $(resourcesDestSelector).load(RESOURCES_SELECTOR, function() {
      UtilsModule.editSrc();
      handler();
    });
  }

  function getHtmlFileName() {
    return 'resources.html';
  }

  // List of functions accessibly by other scripts
  return {
    loadResources: loadResources,
  };
})(window);

export const ResourcesModule = resourcesModule;
