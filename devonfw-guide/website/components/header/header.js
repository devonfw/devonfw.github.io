const HeaderModule = {
  loadNavbar: function(navbarDestSelector, afterLoad = () => {}) {
    const HTML_FILE = this.getHtmlFileName();
    const NAVBAR_SELECTOR = `${HTML_FILE} #content .sect1 .sectionbody ul`;
    console.log(HTML_FILE);
    $(navbarDestSelector).load(NAVBAR_SELECTOR, afterLoad);
  },

  getHtmlFileName: function() {
    console.log('FILENAME');
    let thisFile = $('script[src$="/header.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    console.log('FILENAME');
    console.log(htmlFilemame);
    return htmlFilemame;
  },
};
