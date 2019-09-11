// See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// for the list of other DOM interfaces.
class DirTree extends HTMLDivElement {

  get mobile() {
    return this.hasAttribute('mobile');
  }

  constructor(mobile=false) {
    super();
    this.createComp(mobile);
  }


  createComp(mobile) {
    this.innerHTML = `
        <div class="dir-component">
            <div class="dir-tree ${mobile? "mobile" : ""}">
                <div class="dir-column">
                <ul class="bullet-folder-closed column-1"></ul>
                </div>
            </div>
            <div class="dir-tree-detail">
                <h2 class="details-first-title"></h2>
                <h2 class="details-title"></h2>
                <p class="details-content"></p>
            </div>
        </div>
      `;

    getDirs(
      {
        dir: './dir-content',
        file: 'entry-point.html',
      },
      0,
    );

    function getDirs(path, lvl) {
      let aux = $("<div id='aux'></div>");

      aux.load(`${path.dir}/${path.file} #content`, function() {
        aux.find('.links-to-files a').each(function(index, el) {
          let href = $(el).attr('href');
          let aux2 = $("<div id='aux2'></div>");

          aux2.load(
            `${path.dir}/${href} #content`,
            getDirInfo(aux2, el, lvl, path.file),
          );
        });
      });
    }

    function getDirInfo(aux2, el, lvl, parentFile) {
      return () => {
        let dir = aux2.find('.directory');
        let links = aux2.find('.links-to-files');
        let title = dir.find('h2').text();
        let text = getText(dir);
        let listItem = getLiDir(title, el, lvl + 1, parentFile);

        if (!links.length) {
          listItem = getLiFile(title, text);
        }

        $('.column-' + (lvl + 1)).append(listItem);
      };
    }

    function getText(dir) {
      return dir
        .find('p')
        .map((_, el) => $(el).text() + '<br/>')
        .get()
        .join('');
    }

    function getDetails(title, content) {
      $('.dir-component .details-title').html(title);
      $('.dir-component .details-content').html(content);
      $('.dir-component .details-first-title').html('More info ->');
    }

    function getLiDir(text, el, lvlDest, parentFile) {
      function clickHandler() {
        $(this)
          .addClass('bullet-folder-open')
          .siblings()
          .removeClass('bullet-folder-open');

        let nCols = $('.dir-tree.mobile .dir-column').length;

        if (nCols - 1 == lvlDest) {
          createNewColumn();
          slideCols(lvlDest);
          clearDir(lvlDest + 1);
          getDirs(
            {
              dir: './dir-content',
              file: parentFile,
            },
            lvlDest,
          );
        } else {
          clearDir(lvlDest + 1);
          createNewColumn();
          slideCols(lvlDest + 1);
          getDirs(
            {
              dir: './dir-content',
              file: $(el).attr('href'),
            },
            lvlDest,
          );
        }
      }

      let listItem = $(`<li>${text}</li>`).click(clickHandler);
      return listItem;
    }

    function getLiFile(title, content) {
      function clickHandler() {
        getDetails(title, content);
      }

      let listItem = $(`<li class="bullet-file">${title}</li>`).click(
        clickHandler,
      );
      return listItem;
    }

    function createNewColumn() {
      let howManyCols = $('.dir-tree .dir-column').length;
      $('.dir-tree').append(
        `
            <div class="dir-column">
              <ul class="bullet-folder-closed column-${howManyCols + 1}"></ul>
            </div>
          `,
      );
    }

    function clearDir(fromLvl = 1) {
      let howManyCols = $('[class*="column-"]').length;
      for (let i = fromLvl; i <= howManyCols; i++) {
        $(`.column-${i}`)
          .parent()
          .remove();
      }

      $('.dir-component .details-title').empty();
      $('.dir-component .details-content').empty();
      $('.dir-component .details-first-title').empty();
    }

    function slideCols(pivot) {
      let isMobile = $('.dir-tree').hasClass('mobile');
      let hiddenBefore = 3;
      let maxVisible = 3;

      if (isMobile) {
        hiddenBefore = 2;
        maxVisible = 1;
      }

      $('.dir-column').each((index, elem) => {
        if (index < pivot - hiddenBefore || index > pivot) {
          $(elem).addClass('hidden');
        } else {
          $(elem).removeClass('hidden');
          let folder = $(elem).find('.bullet-folder-open');
          let text = folder.text();
          let splitted = text.split('/');
          let isDotted = splitted.length >= 2 && splitted[0] === '..';

          if (
            index == pivot - hiddenBefore &&
            index + hiddenBefore > maxVisible
          ) {
            if (!isDotted) {
              text = '../' + text;
            }

            folder
              .text(text)
              .siblings()
              .addClass('hidden');
          } else {
            if (isDotted) {
              folder
                .text(splitted[1])
                .siblings()
                .removeClass('hidden');
            }
          }
        }
      });
    }
  }
}

customElements.define('dir-tree', DirTree, { extends: 'div' });
