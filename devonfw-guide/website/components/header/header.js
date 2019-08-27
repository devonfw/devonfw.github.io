(function(window, undefined) {
  // Function definitions
  function loadNavbar(navbarDestSelector, afterLoad = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const NAVBAR_SELECTOR = `${HTML_FILE} #content .sect1 .sectionbody ul`;

    $(navbarDestSelector).load(NAVBAR_SELECTOR, () => {
      const searchBar = getSearchBar();
      HeaderModule.appendEnd(navbarDestSelector, searchBar);

      afterLoad();
    });
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="header.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  function appendEnd(navbarDestSelector, element) {
    const navbarDest = `${navbarDestSelector} > ul:first-child`;
    $(navbarDest).append(element);
  }

  function getSearchBar() {
    const searchBar = `
      <li>
        <div class="search-bar">
          <input id="search-field" type="text" placeholder="Search by keyword(s)..."/>
          <button onclick="query()">Search</button>
          <div class="search-bar-results hidden" id="search-results">
          </div>
        </div>
      </li>`;
  
    return searchBar;
  }

  // List of functions accessibly by other scripts
  window.HeaderModule = {
    loadNavbar: loadNavbar,
    appendEnd: appendEnd,
  };
})(window);
