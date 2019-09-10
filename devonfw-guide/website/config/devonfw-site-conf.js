(function(window) {
  // configurations
  const BASE_PATH = '/';

  const searchInfo = {
    docsPath: `${BASE_PATH}website/docs-json.json`,
    indexPath: `${BASE_PATH}website/index.json`,
  };

  /* path:
    Path used to generate the index.json and docs-json.json,
    if you used something like 'node ../converter.js ./ .html' then in
    use './' as value. In general, path value must be the second argument.
  */
  const indexJson = {
    path: './',
  };

  const devonfwGuide = {
    path: `${BASE_PATH}`,
  };

  const pagesLocation = {
    docsPage: {
      path: `${BASE_PATH}website/pages/docs/page-docs.html`,
      initialPage: `${BASE_PATH}devonfw-guide/devon4ng.wiki/architecture.html`,
    },

    searchResultsPage: {
      path: `${BASE_PATH}website/pages/search-results/search-results.html`,
    },
  };

  const editSrc = {
    searchValue:
      'C:/Proyectos/devonfw-official-website-projects/devonfw-official-website/devonfw-guide/target/generated-docs/',
    replaceValue: '../../',
    imgFolderPath: `${BASE_PATH}`,
  };

  // List of configurations accessibly by other scripts
  window.ConfigModule = {
    searchInfo: searchInfo,
    editSrc: editSrc,
    devonfwGuide: devonfwGuide,
    pagesLocation: pagesLocation,
    indexJson: indexJson,
  };
})(window);
