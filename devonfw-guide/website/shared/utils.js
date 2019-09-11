import { ConfigModule } from '../config/devonfw-site-conf.js';

const utilsModule = (function(window) {
  // Function definitions
  function editSrc(searchValue, replaceValue) {
    let searchVal = searchValue || ConfigModule.editSrc.searchValue;
    let replaceVal = replaceValue || ConfigModule.editSrc.imgFolderPath;

    $('img').each(function() {
      $(this).attr(
        'src',
        $(this)
          .attr('src')
          .replace(searchVal, replaceVal),
      );
    });
  }

  function getParametersFromUrl(param = 'q') {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let queryParam = url.searchParams.get(param);

    return queryParam;
  }

  function loadIndex(searchData) {
    const info = ConfigModule.searchInfo;

    $.getJSON(info.docsPath, function(docsJson) {
      searchData.documents = docsJson;

      $.getJSON(info.indexPath, function(idxJson) {
        searchData.index = lunr.Index.load(idxJson);
      });
    });
  }

  // List of functions accessibly by other scripts
  return {
    editSrc: editSrc,
    getParametersFromUrl: getParametersFromUrl,
    loadIndex: loadIndex,
  };
})(window);

export const UtilsModule = utilsModule;
