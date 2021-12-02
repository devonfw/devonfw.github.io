import { ConfigModule } from "../../config/devonfw-site-conf.js";

const headerModule = (function (window) {
  window.openExploreLink = function (link) {
    document.location.href = link;
    document.location.reload();
  };

  let typeTitleMap = {
    tutorial: "Tutorials",
    docs: "Documentation",
    solution: "Solutions",
    explore: "Explore",
    releasenote: "Release Notes",
  };

  function createSearchResultGroupsTemplate(title, resultHtml) {
    return `
    <div>
      <div class="srg-title px-3 mt-3">${title}</div>
      <div class="srg-content px-3">${resultHtml}</div>
    </div>
  `;
  }

  function searchResultGroupsTemplate(results) {
    let result = "";
    for (let type in typeTitleMap) {
      if (results[type]) {
        let resultHtml = results[type].join("");
        let title = typeTitleMap[type];
        let groupTemplate = createSearchResultGroupsTemplate(title, resultHtml);
        result += groupTemplate;
      }
    }
    for (let type in results) {
      if (!typeTitleMap[type]) {
        let resultHtml = results[type].join("");
        let title = type;
        let groupTemplate = createSearchResultGroupsTemplate(title, resultHtml);
        result += groupTemplate;
      }
    }
    return result;
  }

  function searchResultTemplate(title, link, linktext, type) {
    let eventHandler = "";
    if (type == "explore") {
      eventHandler = `onclick="openExploreLink('${link}')"`;
    }
    let template = `
      <div class="px-3 mt-1">
        <div class="sr-title">
          ${title}
        </div>
        <div class="sr-content cursor-pointer">
          <a href="${link}" ${eventHandler}>${linktext}</a>
        </div>
      </div>`;
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

  function onClickOutside(showId, hideId) {
    document.getElementById(showId).addEventListener("click", function (event) {
      $(`#${showId}`).addClass("hidden");
      $(`#${hideId}`).addClass("hidden");
      event.stopPropagation();
    });
  }

  function searchOnClick(clickFunction) {
    let searchField = document.getElementById("search-field");
    let timer = null;
    searchField.onkeypress = function (e) {
      if (timer) {
        clearTimeout(timer);
      }

      if (event.key == "Enter") {
        e.preventDefault();
      }

      timer = setTimeout(clickFunction, 1000);
    };

    searchField.onpaste = function (e) {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(clickFunction, 1000);
    };

    $("#search-field").change(function () {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(clickFunction, 1000);
    });
  }

  function linktext(type, href) {
    if (
      type == "docs" ||
      type == "tutorial" ||
      type == "releasenote" ||
      type == "solution"
    ) {
      return href.split("#")[0];
    }
    if (type == "explore") {
      return href.split("#")[1] || href;
    }
    return href;
  }

  function query(searchData) {
    let query = document.getElementById("search-field").value;
    if (query) {
      query =
        query
          .split(" ")
          .filter(function (i) {
            return i;
          })
          .join("~1 ") + "~1";
    }
    let queryRes = query ? searchData.index.search(query) : [];

    const findById = (id, objects) => {
      const obj = objects.find((obj) => "" + obj.id == "" + id);
      return obj;
    };

    let results = {};
    let showSeeMore = false;
    let displayedResultsCount = 0;
    for (let i = 0; i < queryRes.length; i++) {
      let res = queryRes[i];
      let obj = findById(res.ref, searchData.documents);
      let title = obj.title;
      if (!results[obj.type]) {
        results[obj.type] = [];
      }
      if (
        results[obj.type].length < ConfigModule.searchInfo.maxNumberOfResults
      ) {
        displayedResultsCount++;
        results[obj.type].push(
          searchResultTemplate(
            title,
            obj.path.replace("..", ""),
            linktext(obj.type, obj.path.replace("..", "")),
            obj.type
          )
        );
      } else {
        showSeeMore = true;
      }
    }
    while (displayedResultsCount > ConfigModule.searchInfo.maxNumberOfResults) {
      let largestType = "";
      let largestSize = 0;
      for (let type in results) {
        if (results[type].length > largestSize) {
          largestSize = results[type].length;
          largestType = type;
        }
      }
      results[largestType] = results[largestType].slice(0, largestSize - 1);
      displayedResultsCount--;
      showSeeMore = true;
    }

    let resultHtml = searchResultGroupsTemplate(results);
    if (resultHtml == "") {
      resultHtml =
        '<div><div class="srg-title px-3 mt-3">No results</div><div class="srg-content px-3"><div class="px-3 mt-1"><div class="sr-title"></div></div></div></div>';
    }

    if (showSeeMore) {
      let path = ConfigModule.pagesLocation.searchResultsPage.path;
      resultHtml += seeMoreTemplate(path, query, queryRes.length);
    }

    if (query) {
      $("#search-results-box").html(resultHtml);
      $("#search-results-box").removeClass("hidden");
      $("#click-outside").removeClass("hidden");
      onClickOutside("click-outside", "search-results-box");
    }
  }

  return {
    searchOnClick: searchOnClick,
    queryFunction: query,
  };
})(window);

export const HeaderModule = headerModule;
