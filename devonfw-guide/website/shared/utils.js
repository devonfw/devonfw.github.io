(function(window) {
  // Function definitions
  function editSrc(searchValue, replaceValue) {
    let searchVal =
      searchValue ||
      'C:/Proyectos/devonfw-official-website-projects/devonfw-official-website/devonfw-guide/target/generated-docs/';
    let replaceVal = replaceValue || '../';

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
    $.getJSON('/website/docs-json.json', function(docsJson) {
      searchData.documents = docsJson;

      return ((docs) => {
        $.getJSON('/website/index.json', function(idxJson) {
          searchData.index = lunr.Index.load(idxJson);
        });
      })(searchData.documents);
    });
  }

  // List of functions accessibly by other scripts
  window.UtilsModule = {
    editSrc: editSrc,
    getParametersFromUrl: getParametersFromUrl,
    loadIndex: loadIndex,
  };
})(window);
