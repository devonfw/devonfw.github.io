function loadExploreCards(cardsHtmlUl, cardDestSelector = '#explore-page') {
  $(cardDestSelector).load(cardsHtmlUl, function() {
    let cards = $(cardDestSelector + ' [id$="_explore-cards"]').siblings('.sectionbody').children('.sect2');
    cards.find('.sect3 .ulist').addClass('website-explore-card');
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
