// Get the configuration for the website
function configModule() {
  const BASE_PATH = '/devonfw-official-website/';

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
    path: '../devonfw-guide/',
  };

  const devonfwGuide = {
    path: `${BASE_PATH}devonfw-guide/`,
    masterDir: {
      'master-devon4ng': 'devon4ng.wiki',
      'master-cicdgen': 'cicdgen.wiki',
      'master-devon4net': 'devon4net.wiki',
      'master-devon4j': 'devon4j.wiki',
      'master-devonfw-shop-floor': 'devonfw-shop-floor.wiki',
      'master-devonfw-testing': 'devonfw-testing.wiki',
      'master-my-thai-star': 'my-thai-star.wiki',
      'master-tools-cobigen': 'tools-cobigen.wiki',
      'master-general-start': 'general',
      'master-general-end': 'general',
    },
  };

  const website = {
    path: `${BASE_PATH}website/`,
  };

  const pagesLocation = {
    docsPage: {
      path: `${website.path}pages/docs/page-docs.html`,
      initialPage: `${devonfwGuide.path}devon4ng.wiki/architecture.html`,
      sidebar: `${BASE_PATH}master.html`,
    },

    searchResultsPage: {
      path: `${website.path}pages/search-results/search-results.html`,
    },
  };

  const componentsLocation = {
    header: {
      path: `${website.path}components/header/header.html`,
    },
    footer: {
      path: `${website.path}components/footer/footer.html`,
    },
  };

  const editSrc = {
    searchValue:
      '/home/travis/build/devonfw/devonfw-official-website/target/generated-docs/',
    //'C:/Proyectos/devonfw-official-website-projects/devonfw-official-website/devonfw-guide/target/generated-docs/',
    replaceValue: '../../',
    imgFolderPath: `${BASE_PATH}`,
  };

  // List of configurations accessibly by other scripts
  return {
    searchInfo: searchInfo,
    editSrc: editSrc,
    devonfwGuide: devonfwGuide,
    pagesLocation: pagesLocation,
    indexJson: indexJson,
    componentsLocation: componentsLocation,
  };
}

export const ConfigModule = configModule();
