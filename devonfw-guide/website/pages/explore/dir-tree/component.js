// See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// for the list of other DOM interfaces.
class DirTree extends HTMLDivElement {
  get mobile() {
    return this.hasAttribute('mobile');
  }

  constructor(mobile = false) {
    super();
    this.createComp(mobile);
  }

  createComp(mobile) {
    this.innerHTML = baseTemplate(mobile);

    getDirs(
      {
        dir: './dir-content',
        file: 'entry-point.html',
      },
      0,
    );

    function baseTemplate(mobile) {
      let template = `
        <div class="dir-component">
            <div class="dir-tree font-weight-bold row ${
              mobile ? 'mobile' : ''
            }">
                <div class="dir-column col px-0">
                <ul class="list-unstyled pl-0 cb-folder-closed column-1"></ul>
                </div>
            </div>
            <div class="mt-5 pt-5 row dir-tree-detail">
            </div>
        </div>
      `;

      return template;
    }

    function dirTemplate(text) {
      let dir = `
        <li class="py-2 px-4 d-flex align-items-center">
          <div class="mr-3 mt-1 custom-bullet"></div><span class="dir-item-text">${text}</span>
        </li>
      `;

      return dir;
    }

    function fileTemplate(title) {
      let file = `
        <li class="py-2 px-4 d-flex align-items-center bullet-file">
          <div class="custom-bullet cb-file mr-3 mt-1"></div><span class="dir-item-text">${title}</span>
        </li>
      `;

      return file;
    }

    function columnTemplate(colNum) {
      let column = `
        <div class="dir-column col px-0">
          <ul class="list-unstyled pl-0 cb-folder-closed column-${colNum}"></ul>
        </div>
      `;

      return column;
    }

    function detailsTemplate(fileInfo) {
      let details = `
        <div class="col-12 col-sm-8">
          <h4 class="font-weight-bold details-first-title">
            More info <div class="custom-bullet forward-arrow ml-3 mt-1"></div>
          </h4>
          <h4 class="font-weight-bold mt-3 details-title">${fileInfo.title}</h4>
          <p class="mt-4 details-content">${fileInfo.text}</p>
        </div>
        <div class="col-12 col-sm-4 details-references">
          <h4>Links</h4>
          <p class="details-links custom-col">
          </p>
          <h4 class="mt-4">Videos</h4>
          <p class="details-videos custom-col">
          </p>
        </div>
      `;

      return details;
    }

    function getDirs(path, lvl) {
      let aux = $("<div id='aux'></div>");

      aux.load(`${path.dir}/${path.file} #content`, function() {
        aux.find('.links-to-files a').each(function(_, el) {
          let href = $(el).attr('href');
          let aux2 = $("<div id='aux2'></div>");

          aux2.load(
            `${path.dir}/${href} #content`,
            showDirInfo(aux2, el, lvl, path.file),
          );
        });
      });
    }

    function showFileDetails(path) {
      let aux = $("<div id='aux'></div>");

      aux.load(`${path.dir}/${path.file} #content`, function() {
        const dir = aux.find('.directory');
        const title = dir.find('h2').text();
        const text = getText(dir);
        const commonLinks = aux.find('.common-links a');
        const videosLinks = aux.find('.videos-links a');

        const fileInfo = { title, text };
        const details = detailsTemplate(fileInfo);
        $('.dir-component .dir-tree-detail').html(details);
        $('.dir-component .details-links').html(commonLinks);
        $('.dir-component .details-videos').html(videosLinks);
      });
    }

    function showDirInfo(aux2, el, lvl, parentFile) {
      return () => {
        const dir = aux2.find('.directory');
        const links = aux2.find('.links-to-files');
        const title = dir.find('h2').text();
        const text = getText(dir);
        let listItem = getLiDir(title, el, lvl + 1, parentFile);

        if (!links.length) {
          const fileInfo = { title, text };
          listItem = getLiFile(fileInfo, el, lvl + 1);
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

    function getLiDir(text, el, lvlDest, parentFile) {
      function clickHandler() {
        $(this)
          .addClass('folder-open bg-ligthgray')
          .siblings()
          .removeClass('folder-open bg-ligthgray');
        const nCols = $('.dir-tree.mobile .dir-column').length;

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

      const dir = $(dirTemplate(text)).click(clickHandler);
      return dir;
    }

    function getLiFile(fileInfo, el, lvlDest) {
      function clickHandler() {
        clearDir(lvlDest + 1);
        // const details = detailsTemplate(fileInfo);
        showFileDetails({ dir: './dir-content', file: $(el).attr('href') });

        $(this).addClass('bg-ligthgray');
        $(this)
          .siblings()
          .removeClass('bg-ligthgray');
      }

      const file = $(fileTemplate(fileInfo.title)).click(clickHandler);
      return file;
    }

    function createNewColumn() {
      let howManyCols = $('.dir-tree .dir-column').length;
      $('.dir-tree').append(columnTemplate(howManyCols + 1));
    }

    function clearDir(fromLvl = 1) {
      const howManyCols = $('[class*="column-"]').length;
      for (let i = fromLvl; i <= howManyCols; i++) {
        $(`.column-${i}`)
          .parent()
          .remove();
      }

      $('dir-component .dir-tree-detail').empty();
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
          $(elem).addClass('d-none');
        } else {
          $(elem).removeClass('d-none');
          let folder = $(elem).find('.folder-open');
          let folderImg = $(elem).find('.custom-bullet');
          let folderText = folder.find('.dir-item-text');
          let text = folderText.text();
          let splitted = text.split('/');
          let isDotted = splitted.length >= 2 && splitted[0] === '..';

          if (
            index == pivot - hiddenBefore &&
            index + hiddenBefore > maxVisible
          ) {
            if (!isDotted) {
              text = '../' + text;
              folderText.text(text);
              folderImg.addClass('back-arrow');
              folder
                .siblings()
                .addClass('d-none')
                .removeClass('d-flex');
            }
          } else {
            if (isDotted) {
              folderText.text(splitted[1]);
              folderImg.removeClass('back-arrow');
              folder
                .siblings()
                .removeClass('d-none')
                .addClass('d-flex');
            }
          }
        }
      });
    }
  }
}

customElements.define('dir-tree', DirTree, { extends: 'div' });
