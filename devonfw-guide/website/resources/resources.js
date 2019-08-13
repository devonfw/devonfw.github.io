function loadResources(resourcesHtml, resourcesDestSelector = '#resources-page') {
    $(resourcesDestSelector).load(resourcesHtml, function() {
      let cards = $(resourcesDestSelector + ' [id$="_resources"]').siblings('.sectionbody').children('.sect2');
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
  