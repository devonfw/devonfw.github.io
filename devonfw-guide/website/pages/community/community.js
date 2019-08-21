function loadCommunity(communityHtml, communityDestSelector = '#community-page', handler = () => {}) {
    $(communityDestSelector).load(communityHtml, function() {
      let cards = $(communityDestSelector + ' [id$="_community"]').siblings('.sectionbody').children('.sect2');
      $(this).html(cards);
      handler();
    });
  }
  