function loadNavbar(navbarDestSelector, afterLoad = () => {}) {
  const HTML_FILE = getHtmlFileName();
  const NAVBAR_SELECTOR = `${HTML_FILE} #content .sect1 .sectionbody ul`;
  $(navbarDestSelector).load(NAVBAR_SELECTOR, afterLoad);
}

function getHtmlFileName() {
  let thisFile = $('script[src$="/header.js"]')[0];
  let thisFilename = thisFile.attributes.src.value;
  let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
  return htmlFilemame;
}
