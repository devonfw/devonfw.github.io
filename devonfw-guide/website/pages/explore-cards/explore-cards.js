function loadExploreCards(cardsHtmlUl, cardDestSelector = '#explore-page', handler = () => {}) {
  $(cardDestSelector).load(cardsHtmlUl, function() {
    let cards = $(cardDestSelector + ' [id$="_explore-cards"]').siblings('.sectionbody').children('.sect2');
    cards.find('.sect3 .ulist').addClass('website-explore-card');
    $(this).html(cards);
    handler();
  });
}
