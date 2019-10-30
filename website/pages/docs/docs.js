import { UtilsModule } from "../../shared/utils.js";

const docsModule = (function(window) {
  // Function definitions

  function clickSidebar() {
    $("ul.sectlevel0 > li").click(function(event) {
      let link = $(this).children("a");
      let page = `${link.attr("href")} #content`;
      const pageDest = "#wiki-content";

      console.log("after prevent");
      event.preventDefault();
      loadDocs(pageDest, page, () => {
        UtilsModule.editSrc();
      });

      $("ul.sectlevel0 a").removeClass("active");
      link.addClass("active");

      return false;
    });

    $("ul.sectlevel1 > li").click(function(event) {
      let link = $(this).find("a");
      let page = `${link.attr("href")} #content`;
      const pageDest = "#wiki-content";

      event.preventDefault();
      loadDocs(pageDest, page, () => {
        UtilsModule.editSrc();
      });
      $("ul.sectlevel0 a").removeClass("active");
      link.addClass("active");

      return false;
    });
  }



  // List of functions accessibly by other scripts
  return {
    clickSidebar: clickSidebar,
  };
})(window);

export const DocsModule = docsModule;
