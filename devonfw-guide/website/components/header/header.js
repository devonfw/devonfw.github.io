(function(window) {
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
          <button id="query-btn">Search</button>
          <div class="search-bar-results hidden" id="search-results">
          </div>
        </div>
      </li>`;

    return searchBar;
  }

  function searchOnClick(clickFunction) {
    let queryBtn = document.getElementById('query-btn');
    queryBtn.addEventListener('click', clickFunction);
  }

  function query(searchData) {
    let query = document.getElementById('search-field').value;
    let queryRes = searchData.index.search(query);

    const findById = (id, objects) => {
      const obj = objects.find((obj) => '' + obj.id == '' + id);
      return obj.title;
    };

    let results = '';
    for (let i = 0; i < queryRes.length; i++) {
      let res = queryRes[i];
      if (i > 5) break;
      results += `
              <div>
                <div class="sr-title">
                  ${findById(res.ref, searchData.documents)}
                </div>
                <div class="sr-content">
                  ${res.ref}
                </div>
              </div>`;
    }

    if (queryRes.length > 5) {
      results += `
      <a
      class="more-results"
      href="/website/pages/search-results/search-results.html?search=${query}"
      >
        Show all the results(${queryRes.length})
      </a>
    `;
    }

    $('#search-results').html(results);
    $('#search-results').removeClass('hidden');
    $('.sr-content').each(function() {
      $(this).click(function() {
        location.href =
          '/website/pages/docs/page-docs.html' +
          '?q=' +
          $(this)
            .text()
            .trim()
            .replace('./devonfw-guide/', '../../../')
            .replace(/\.asciidoc$/, '.html');
      });
    });
  }

  // List of functions accessibly by other scripts
  window.HeaderModule = {
    loadNavbar: loadNavbar,
    appendEnd: appendEnd,
    searchOnClick: searchOnClick,
    queryFunction: query,
  };
})(window);
