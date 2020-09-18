import { ConfigModule } from '../../config/devonfw-site-conf.js';

const headerModule = (function (window) {

  let typeTitleMap = {
    tutorial: "Tutorial",
    explore: "Explore",
    docs: "Documentation"
  }

  function searchResultGroupsTemplate(results) {
    let result = '';
    console.log(results);
    for (let type in typeTitleMap) {
      if (results[type]) {
        let resultHtml = results[type].join('');
        let title = typeTitleMap[type];
        let groupTemplate = `
        <div>
          <div>${title}</div>
          <div>${resultHtml}</div>
        </div>
      `;
        result += groupTemplate;
      }
    }
    for (let type in results) {
      if (!typeTitleMap[type]) {
        let resultHtml = results[type].join('');
        let title = type;
        let groupTemplate = `
        <div>
          <div>${title}</div>
          <div>${resultHtml}</div>
        </div>
      `;
        result += groupTemplate;
      }
    }
    return result;
  }

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

  function onClickOutside(showId, hideId) {
    document.getElementById(showId).addEventListener('click', function (event) {
      $(`#${showId}`).addClass('hidden');
      $(`#${hideId}`).addClass('hidden');
      event.stopPropagation();
    });
  }

  function searchOnClick(clickFunction) {
    let searchField = document.getElementById('search-field');
    let timer = null;
    searchField.onkeypress = function (e) {
      if (timer) {
        clearTimeout(timer);
      }

      if (event.key == 'Enter') {
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

    $('#search-field').change(function () {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(clickFunction, 1000);
    });
  }

  function query(searchData) {
    let query = document.getElementById('search-field').value;
    let queryRes = query ? searchData.index.search(query) : [];

    const findById = (id, objects) => {
      const obj = objects.find((obj) => '' + obj.id == '' + id);
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
      if (results[obj.type].length < ConfigModule.searchInfo.maxNumberOfResults) {
        displayedResultsCount++;
        results[obj.type].push(searchResultTemplate(title, res.ref.replace('..', '')));
      } else {
        showSeeMore = true;
      }
    }
    while (displayedResultsCount > ConfigModule.searchInfo.maxNumberOfResults) {
      let largestType = '';
      let largestSize = 0;
      for (let type in results) {
        if (results[type].length > largestSize) {
          largestSize = results[type].length;
          largestType = type;
        }
      }
      results[largestType] = results[largestType].slice(0, largestSize - 1);
      displayedResultsCount--;
    }

    let resultHtml = searchResultGroupsTemplate(results);

    if (showSeeMore) {
      let path = ConfigModule.pagesLocation.searchResultsPage.path;
      resultHtml += seeMoreTemplate(path, query, queryRes.length);
    }

    if (query) {
      $('#search-results-box').html(resultHtml);
      $('#search-results-box').removeClass('hidden');
      $('#click-outside').removeClass('hidden');
      onClickOutside('click-outside', 'search-results-box');
    }
  }

  return {
    searchOnClick: searchOnClick,
    queryFunction: query,
  };
})(window);

export const HeaderModule = headerModule;
