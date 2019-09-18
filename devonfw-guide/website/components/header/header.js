import { ConfigModule } from '../../config/devonfw-site-conf.js';

const headerModule = (function(window) {
  // Function definitions
  function loadNavbar(navbarDestSelector, afterLoad = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const NAVBAR_SELECTOR = `${HTML_FILE} .website-navbar`;

    $(navbarDestSelector).load(NAVBAR_SELECTOR, () => {
      $(navbarDestSelector).html(navbarTemplate(navbarModel()));
      afterLoad();
    });
  }

  function getHtmlFileName() {
    const componentPath = ConfigModule.componentsLocation.header.path;
    return componentPath;
  }

  function appendEnd(navbarDestSelector, element) {
    const navbarDest = `${navbarDestSelector} > ul:first-child`;
    $(navbarDest).append(element);
  }

  function navbarModel() {
    let model = {
      brand: { text: '', img: ''},
      links: [{text: '',href: ''}],
    };

    let links = [];
    $('.website-navbar li').each(function(index, el) {
      let a = $(el).find('a');

      if (index === 0) {
        model.brand.href = a.attr('href');
        model.brand.img = $(el)
          .find('img')
          .attr('src');

        console.log(model.brand.img);
      } else {
        let link = {
          text: a.text(),
          href: a.attr('href'),
        };

        links.push(link);
      }
    });
    model.links = links;

    return model;
  }

  function navbarTemplate(navbarModel) {
    function linksTemplate(links) {
      let l = '';

      for (let i = 0; i < links.length; i++) {
        l += `
          <li class="nav-item">
            <a class="nav-link text-white" href="${links[i].href}">${links[i].text}</a>
          </li>`;
      }

      return l;
    }
    const template = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-custom-blue">
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand text-white mr-auto ml-3 ml-lg-0" href="${
          navbarModel.brand.href
        }">
          <img src="${navbarModel.brand.img}" width="130" height="30" alt="">
        </a>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ml-auto">
            ${linksTemplate(navbarModel.links)}
          </ul>
        </div>
        <form class="form-inline my-2 my-lg-0">
            <div class="search-bar">
              <input
                id="search-field"
                type="search"
                class="form-control mr-sm-2"
                placeholder="Search by keyword(s)..."
                aria-label="Search"/>
              <div class="sb-res-pos px-4">
                <div class="col rounded px-0 border bg-white hidden search-bar-results" id="search-results-box">
                </div>
              </div>
            </div>
          </form>
      </nav>`;

    return template;
  }

  function searchResultTemplate(title, link) {
    let template = `
      <div class="px-3 mt-3">
        <div class="sr-title">
          ${title}
        </div>
        <div class="sr-content cursor-pointer">
          ${link}
        </div>
      </div>
      <div class="mt-2 mb-2 w-100 bg-dark hr-2"></div>`
    return template;
  }

  function seeMoreTemplate(path, query, nRes) {
    let template = `
      <a
        class="more-results d-block cursor-pointer"
        href="${path}?search=${query}"
      >
        <u class="text-dark w-100 d-block text-center mb-3">see all results(${nRes})</u>
      </a>`
    
      return template
  }

  function searchOnClick(clickFunction) {
    let searchField = document.getElementById('search-field');
    let timer = null;
    searchField.onkeypress = function(e) {
      if (timer) {
        console.log('clearing');
        clearTimeout(timer);
      }

      timer = setTimeout(clickFunction, 1000);
    };
  }

  function query(searchData) {
    let query = document.getElementById('search-field').value;
    let queryRes = query ? searchData.index.search(query) : [];

    const findById = (id, objects) => {
      const obj = objects.find((obj) => '' + obj.id == '' + id);
      return obj.title;
    };

    let results = '';
    for (let i = 0; i < Math.min(queryRes.length, 5); i++) {
      let res = queryRes[i];
      let title = findById(res.ref, searchData.documents);
      results += searchResultTemplate(title, res.ref);
    }

    if (queryRes.length > 5) {
      let path = ConfigModule.pagesLocation.searchResultsPage.path;
      results += seeMoreTemplate(path, query, queryRes.length);
    }

    if (query) {
      $('#search-results-box').html(results);
      $('#search-results-box').removeClass('hidden');
    }
    $('.sr-content').each(function() {
      $(this).click(function() {
        location.href =
          ConfigModule.pagesLocation.docsPage.path +
          '?q=' +
          $(this)
            .text()
            .trim()
            .replace(
              ConfigModule.indexJson.path,
              ConfigModule.devonfwGuide.path,
            )
            .replace(/\.asciidoc$/, '.html');
      });
    });
  }

  // List of functions accessibly by other scripts
  return {
    loadNavbar: loadNavbar,
    appendEnd: appendEnd,
    searchOnClick: searchOnClick,
    queryFunction: query,
  };
})(window);

export const HeaderModule = headerModule;
