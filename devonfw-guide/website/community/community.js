function loadCommunity(communityHtml, communityDestSelector = '#community-page') {
    $(communityDestSelector).load(communityHtml, function() {
      let cards = $(communityDestSelector + ' [id$="_community"]').siblings('.sectionbody').children('.sect2');
      $(this).html(cards);
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
  