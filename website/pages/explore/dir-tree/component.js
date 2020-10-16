// See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// for the list of other DOM interfaces.
class DirTree extends HTMLDivElement {
  get mobile() {
    return this.hasAttribute('mobile');
  }

  constructor(mobile = false) {
    super();
    this.createComp(mobile, window.location.hash.split('/').slice(1));
  }

  createComp(mobile, initialHash) {
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
                <div class="dir-column col-12 col-4 px-0">
                <ul class="list-unstyled ml-0 cb-folder-closed column-1"></ul>
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
        <div class="dir-column col-12 col-sm-4 px-0">
          <ul class="list-unstyled ml-0 cb-folder-closed column-${colNum}"></ul>
        </div>
      `;

      return column;
    }

    function detailsTemplate(fileInfo) {
      let details = `
        <div class="col-12 col-sm-8">
          <div class="d-flex align-items-center td-hover-none">
            <a href="${fileInfo.url}"  class="d-flex td-hover-none">
              <h4 class="font-weight-bold mb-0 details-title">${fileInfo.title}</h4>
            </a>
            <a href="${fileInfo.editUrl}" class="d-flex td-hover-none edit-link" target="_blank" title="This will open the corresponding asciidoc file in the github editor and create a PullRequest for your changes when you save them. The changes will be reviewed before they are published on the website.">&#x270E</a>
          </div>
          <p class="mt-4 pt-1 details-content">${fileInfo.text}</p>
        </div>
        <div class="col-12 col-sm-4 details-references">
          <div id="details-links">
            <h4>Links</h4>
            <p class="details-links custom-col">
            </p>
          </div>
          <div id="details-links-devon4j">
            <h4>Links devon4j</h4>
            <p class="details-links-devon4j custom-col">
            </p>
          </div>
          <div id="details-links-devon4net">
            <h4>Links devon4net</h4>
            <p class="details-links-devon4net custom-col">
            </p>
          </div>
          <div id="details-links-devon4ng">
            <h4>Links devon4ng</h4>
            <p class="details-links-devon4ng custom-col">
            </p>
          </div>
          <div id="details-links-devon4node">
            <h4>Links devon4node</h4>
            <p class="details-links-devon4node custom-col">
            </p>
          </div>
          <div id="details-links-katacoda">
            <h4>Katacoda Tutorials</h4>
            <p class="details-links-katacoda custom-col">
            </p>
          </div>
          <div id="details-videos">
            <h4 class="mt-4">Videos</h4>
            <p class="details-videos custom-col">
            </p>
          </div>
        </div>
      `;

      return details;
    }

    function getDirs(path, lvl) {
      let aux = $("<div id='aux'></div>");

      aux.load(`${path.dir}/${path.file} #content`, function () {
        aux.find('.links-to-files > .sectionbody > .paragraph a').each(function (_, el) {
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

      aux.load(`${path.dir}/${path.file} #content`, function () {
        const dir = aux.find('.directory');
        const title = dir.find('h2').text();
        const text = getText(dir);
        const url = `${path.dir}/${path.file}`;
        let asciidocFilename = path.file.replace(".html", ".asciidoc");
        const editUrl = `https://github.com/devonfw/devonfw.github.io/edit/develop/website/pages/explore/dir-content/${asciidocFilename}`;
        const commonLinks = addTarget(aux.find('.common-links a'));
        const devon4jLinks = addTarget(aux.find('.devon4j-links a'));
        const devon4netLinks = addTarget(aux.find('.devon4net-links a'));
        const devon4ngLinks = addTarget(aux.find('.devon4ng-links a'));
        const devon4nodeLinks = addTarget(aux.find('.devon4node-links a'));
        const katacodaLinks = addTarget(aux.find('.katacoda-links-small a'));
        const videosLinks = aux.find('.videos-links a');

        if (text != "" ||
          commonLinks.length != 0 ||
          devon4jLinks.length != 0 ||
          devon4netLinks.length != 0 ||
          devon4ngLinks.length != 0 ||
          devon4nodeLinks.length != 0 ||
          katacodaLinks.length != 0 ||
          videosLinks.length != 0) {
          const fileInfo = { title, text, url, editUrl };
          const details = detailsTemplate(fileInfo);
          $('.dir-component .dir-tree-detail').html(details);
          setHtmlOrHide('details-links', commonLinks);
          setHtmlOrHide('details-links-devon4j', devon4jLinks);
          setHtmlOrHide('details-links-devon4net', devon4netLinks);
          setHtmlOrHide('details-links-devon4ng', devon4ngLinks);
          setHtmlOrHide('details-links-devon4node', devon4nodeLinks);
          setHtmlOrHide('details-links-katacoda', katacodaLinks);
          setHtmlOrHide('details-videos', videosLinks);
        }
        else {
          $('.dir-component .dir-tree-detail').html('');
        }
      });
    }

    function setHtmlOrHide(name, value) {
      if (value.length > 0) {
        $('.dir-component .' + name).html(value);
      }
      else {
        $('.dir-component #' + name).hide();
      }
    }

    function addTarget(links) {
      return links.each((_, e) => e.target = '_blank');
    }

    function showDirInfo(aux2, el, lvl, parentFile) {
      return () => {
        const dir = aux2.find('.directory');
        const links = aux2.find('.links-to-files > .sectionbody > .paragraph a');
        const title = dir.find('h2').text();
        const text = getText(dir);
        let listItem = getLiDir(title, el, lvl + 1, parentFile);

        if (!links.length) {
          const fileInfo = { title, text };
          listItem = getLiFile(fileInfo, el, lvl + 1);
        }
        let name = $(el).attr('href').substr(0, $(el).attr('href').lastIndexOf('.'));
        let hash = window.location.hash.split('/');
        $('.column-' + (lvl + 1)).append(listItem);
        if (name === initialHash[0]) {
          initialHash.shift();
          listItem.click();
        }

      };
    }

    function getText(dir) {
      return dir
        .find('.sectionbody > .paragraph p')
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

        let name = '';
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
          name = parentFile.substr(0, parentFile.lastIndexOf('.'));
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
          name = $(el).attr('href').substr(0, $(el).attr('href').lastIndexOf('.'));
        }
        let hash = window.location.hash.split('/');
        hash[lvlDest] = name;
        window.location.hash = hash.slice(0, lvlDest + 1).join('/');

        showFileDetails({
          dir: './dir-content',
          file: $(el).attr('href'),
        });
      }

      const dir = $(dirTemplate(text)).click(clickHandler);
      return dir;
    }

    function getLiFile(fileInfo, el, lvlDest) {
      function clickHandler() {
        clearDir(lvlDest + 1);
        let hash = window.location.hash.split('/');
        let name = $(el).attr('href').substr(0, $(el).attr('href').lastIndexOf('.'));
        hash[lvlDest] = name;
        window.location.hash = hash.slice(0, lvlDest + 1).join('/');
        showFileDetails({ dir: './dir-content', file: $(el).attr('href') });

        $(this).addClass('bg-ligthgray');
        $(this)
          .siblings()
          .removeClass('bg-ligthgray')
          .removeClass('folder-open bg-ligthgray');
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
