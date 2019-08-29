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
