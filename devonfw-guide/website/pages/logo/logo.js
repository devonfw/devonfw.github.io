function loadLogo(
  logoHtmlUl,
  logoDestSelector = '#logo-page',
  handler = () => {},
) {
  console.info('loading logo page...');
  $(logoDestSelector).load(logoHtmlUl, function() {
    let outmap = $.map(
      $(logoDestSelector + ' [id$="_logo"]')
        .siblings()
        .find('.sect3'),
      function(val, i) {
        let mainDiv = $('<div></div>');
        let image = $('<div class="image"></div>').append(
          $(val).children('.imageblock'),
        );
        mainDiv.append(image);

        let content = $('<div class="content"></div>').append(
          $(val).children(':not(.imageblock)'),
        );
        mainDiv.append(content);

        return mainDiv.addClass('website-logo');
      },
    );

    $(this).html(outmap);
    handler();

    console.info('Logo page loaded succesfully!');
  });
}

(function(window) {
  // Function definitions
  function loadLogoPage(logoDestSelector = '#logo-page', handler = () => {}) {
    const HTML_FILE = getHtmlFileName();
    const LOGO_SELECTOR = `${HTML_FILE} #content .sect1`;

    console.info('loading logo page...');
    $(logoDestSelector).load(LOGO_SELECTOR, function() {
      handler();
      console.info('Logo page loaded succesfully!');
    });
    
  }

  function getHtmlFileName() {
    let thisFile = $('script[src$="logo.js"]')[0];
    let thisFilename = thisFile.attributes.src.value;
    let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
    return htmlFilemame;
  }

  // List of functions accessibly by other scripts
  window.LogoModule = {
    loadLogoPage: loadLogoPage,
  };
})(window);
