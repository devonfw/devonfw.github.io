import { ConfigModule } from "../../config/devonfw-site-conf.js";

const headerModule = (function(window) {

  function searchResultTemplate(title, link) {
    let template = `
      <div class="px-3 mt-3">
        <div class="sr-title">
          ${title}
        </div>
        <div class="sr-content cursor-pointer">
          <a href="${link}">${link}</a>
        </div>
      </div>
      <div class="mt-2 mb-2 w-100 bg-dark hr-2"></div>`;
    return template;
  }

  function seeMoreTemplate(path, query, nRes) {
    let template = `
      <a
        class="more-results d-block cursor-pointer"
        href="${path}?search=${query}"
      >
        <u class="text-dark w-100 d-block text-center mb-3">see all results(${nRes})</u>
      </a>`;

    return template;
  }

  function searchOnClick(clickFunction) {
    let searchField = document.getElementById("search-field");
    let timer = null;
    searchField.onkeypress = function(e) {
      if (timer) {
        console.log("clearing");
        clearTimeout(timer);
      }

      timer = setTimeout(clickFunction, 1000);
    };
  }

  function query(searchData) {
    let query = document.getElementById("search-field").value;
    let queryRes = query ? searchData.index.search(query) : [];

    const findById = (id, objects) => {
      const obj = objects.find(obj => "" + obj.id == "" + id);
      return obj.title;
    };

    let results = "";
    for (let i = 0; i < Math.min(queryRes.length, 5); i++) {
      let res = queryRes[i];
      let title = findById(res.ref, searchData.documents);
      results += searchResultTemplate(title, res.ref.replace('..', ''));
    }

    if (queryRes.length > 5) {
      let path = ConfigModule.pagesLocation.searchResultsPage.path;
      results += seeMoreTemplate(path, query, queryRes.length);
    }

    if (query) {
      $("#search-results-box").html(results);
      $("#search-results-box").removeClass("hidden");
    }
    $(".sr-content").each(function() {
      $(this).click(function() {
        location.href =
          ConfigModule.pagesLocation.docsPage.path +
          "?q=" +
          $(this)
            .text()
            .trim()
            .replace(
              ConfigModule.indexJson.path,
              ConfigModule.devonfwGuide.path
            )
            .replace(/\.asciidoc$/, ".html");
      });
    });
  }

  return {
    searchOnClick: searchOnClick,
    queryFunction: query
  };
})(window);

export const HeaderModule = headerModule;
