import { ConfigModule } from "../config/devonfw-site-conf.js";

const utilsModule = (function(window) {
  // Function definitions

  function getParametersFromUrl(param = "q") {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let queryParam = url.searchParams.get(param);

    return queryParam;
  }

  function loadIndex(searchData) {
    const info = ConfigModule.searchInfo;

    $.getJSON(info.docsPath, function(docsJson) {
      searchData.documents = docsJson;

      $.getJSON(info.indexPath, function(idxJson) {
        searchData.index = lunr.Index.load(idxJson);
      });
    });
  }

  function getFileNameBySrc(filepath) {
    let pathLength = filepath.split("/").length;
    let fileName = filepath.split("/")[pathLength - 1];
    return fileName;
  }

  function getLinkPathByHref(href) {
    return href.split("#")[1];
  }

  function getHtmlFileName(fileName) {
    let thisFile = $('script[src$="' + fileName + '"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, ".html");
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  return {
    getParametersFromUrl: getParametersFromUrl,
    loadIndex: loadIndex,
    getFileNameBySrc: getFileNameBySrc,
    getLinkPathByHref: getLinkPathByHref,
    getHtmlFileName: getHtmlFileName
  };
})(window);


//create a copy button for listingblock

var numberOfSnippet = document.getElementsByClassName("listingblock").length;
var listingblock;
var divContent = [];
var pre=[];

for (let i =0; i<numberOfSnippet;i++){
        
        var button = document.createElement("button");
        button.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAYAAACMo1E1AAAAAXNSR0IArs4c6QAAAbdJREFUWEft2CuIVVEUBuBvfOCrCaJJ7FNmkgaxqcWigs1BTOIUi4/kIwkiaBDUJFoEccBiMJlkUIMIU4w2DSaRwQcoS/bAVu/d3rvPPWn2hlvO2utf//7PWuvsu6Z0X2twDPOYxg+8xU087QI/1cUZa3EPx4fg3MFp/KyJ05XcBVz9T+ATuD9JckF6L2awuQB8DluT/SseYSOOJFXD9B63Cxif8Tr9/tg2SLktWMDBMU97CneTz2VcGtP/IeZSzv52HUTuBs6MCRzbQ+kXye8oHldgnMe1Fb9B5OI17KwAjpOfxPqk/P4KjFfYXSKXV9YtXMyCvMO2QtBviNayrrBnCfsye1R0tKJYH7FjVHLXcTYD+oDtFYrkLtEDo9BW1oOsFTVyJXFXp3LxmdrUMec+pWqeeM515DXQfWIF0cjV9rmmXFNuxBxo1TqiUP9sa8o15fKb8N+XzVp1Sn4t52pVbco15Vq19vG/tTavVkefW04ztjhtDFae9yFXhnkojWvjUQyRdpVuwovY0zOhYfBPcLhELkZXz4bM7vrk/D2Nv96UyIXtAK5gFhv6ZIQvaeQa8+WXeaxfGhynKM2lswAAAAAASUVORK5CYII="/>';
        button.classList.add("copy-code-button");
        
        button.setAttribute("id","copy-code-button-" + i );
        listingblock = document.getElementsByClassName("listingblock")[i];
        divContent[i] = listingblock.querySelector(".content");
        divContent[i].appendChild(button);
        pre[i] = divContent[i].querySelector("pre").innerText;
        
        document.getElementById("copy-code-button-" + i ).addEventListener("click" ,function(){
            var textarea = document.createElement("textarea");
            textarea.value = pre[i];
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            
            divContent[i].classList.add("active");
            window.getSelection().removeAllRanges();
           setTimeout(function(){
                divContent[i].classList.remove("active");
           },1000);
            document.body.removeChild(textarea);
          });
}

export const UtilsModule = utilsModule;