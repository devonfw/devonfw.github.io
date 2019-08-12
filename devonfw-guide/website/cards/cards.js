function loadCards(cardsHtmlUl, cardDestSelector = '#logo-page') {
        $(cardDestSelector).load(cardsHtmlUl, function() {
          let outmap = $.map(
            $(cardDestSelector + ' [id$="_cards"]')
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

              return mainDiv.addClass('website-card');
            },
          );

          $(this).html(outmap);
          editSrc();
        });
      }

      function editSrc() {
        $('img').each(function() {
          $(this).attr(
            'src',
            $(this)
              .attr('src')
              .replace(
                'C:/Proyectos/devon-docgen-projects/devonfw-guide-fork-faster/devonfw-guide/target/website/',
                '../',
              ),
          );
        });
      }