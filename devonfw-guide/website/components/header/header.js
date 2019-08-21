function loadNavbar(
    navbarHtmlUl,
    navbarDestSelector = '#website-navbar',
  ) {
    $(navbarDestSelector).load(navbarHtmlUl, function() {
      $(this).html(
        $(navbarDestSelector + ' [id$="_header"]')
          .siblings()
          .find('.sect2 .sect3 h4')
          .addClass('navbar-link'),
      );

      $('.navbar-link').click(function() {
        const regex = /(.*)_(.*)/g;
        let m = regex.exec($(this).attr('id'));
        let page = m[m.length - 1];
        $('[id$="-page"]').addClass('hidden');
        $('#' + page + '-page').removeClass('hidden');
      });
    });
  }