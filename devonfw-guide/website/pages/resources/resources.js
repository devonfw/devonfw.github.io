function loadResources(
  resourcesHtml,
  resourcesDestSelector = '#resources-page',
  handler = () => {},
) {
  $(resourcesDestSelector).load(resourcesHtml, function() {
    let cards = $(resourcesDestSelector + ' [id$="_resources"]')
      .siblings('.sectionbody')
      .children('.sect2');
    $(this).html(cards);
    handler();
  });
}
