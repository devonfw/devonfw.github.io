import { ConfigModule } from '../../config/devonfw-site-conf.js';
import { UtilsModule } from '../../shared/utils.js';

const docsModule = (function(window) {
  // Function definitions
  function loadDocs(docsDestSelector, pageToLoad, handler = () => {}) {
    $(docsDestSelector).load(pageToLoad, function() {
      UtilsModule.editSrc();
      handler();
    });
  }

  function clickSidebar() {
    $('ul.sectlevel0 > li').click(function(event) {
      let clickedItem = $(this);
      let link = $(this).children('a');
      let page = `${link.attr('href')} #content`;
      const pageDest = '#wiki-content';

      console.log('after prevent');
      event.preventDefault();
      loadDocs(pageDest, page, () => {
        toSecondSidebar(clickedItem.find('.sectlevel1:first-child > li'));
        editSrc();
      });

      $('ul.sectlevel0 a').removeClass('active');
      link.addClass('active');

      return false;
    });

    $('ul.sectlevel1 > li').click(function(event) {
      let clickedItem = $(this);
      let link = $(this).find('a');
      let page = `${link.attr('href')} #content`;
      const pageDest = '#wiki-content';

      event.preventDefault();
      loadDocs(pageDest, page, () => {
        toSecondSidebar(clickedItem);
        editSrc();
      });
      $('ul.sectlevel0 a').removeClass('active');
      link.addClass('active');

      return false;
    });
  }

  function toSecondSidebar(
    originElement,
    destSelector = '#second-sidebar-content',
  ) {
    $(originElement)
      .children('ul')
      .each(function() {
        $(this).removeClass('display');
        $(destSelector).html(
          $(this)
            .addClass('display')
            .clone(),
        );
      });
  }

  function sidebarEditHref() {
    $('#sidebar .sectlevel0 > li').each(function() {
      let level0href;

      // Get folder name
      $(this)
        .children('a')
        .each(function() {
          level0href = $(this)
            .attr('href')
            .replace(/#master-([a-zA-Z0-9-]+)\.asciidoc$/, '$1.wiki');
        });

      let firstPage = '';
      // Replace sectlevel1 URL
      $(this)
        .find('.sectlevel1 li')
        .children('a')
        .each(function(index) {
          $(this).attr(
            'href',
            $(this)
              .attr('href')
              .replace(
                /#([a-zA-Z0-9-]+)\.asciidoc$/,
                `${ConfigModule.devonfwGuide.path}${level0href}/$1.html`,
              ),
          );

          if (index == 0) {
            firstPage = $(this).attr('href');
          }
        });

      // Replace seclevel0 URL
      $(this)
        .children('a')
        .each(function() {
          $(this).attr('href', `${firstPage}`);
        });
    });
  }

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

  // List of functions accessibly by other scripts
  return {
    loadDocs: loadDocs,
    clickSidebar: clickSidebar,
    sidebarEditHref,
  };
})(window);

export const DocsModule = docsModule;
