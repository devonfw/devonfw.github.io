(function(window, undefined) {
  // Function definitions
  function editSrc(searchValue, replaceValue) {
    let searchVal =
      searchValue ||
      'C:/Proyectos/devon-docgen-projects/devonfw-guide-fork-faster/devonfw-guide/target/generated-docs/';
    let replaceVal = replaceValue || '../';

    $('img').each(function() {
      $(this).attr(
        'src',
        $(this)
          .attr('src')
          .replace(searchVal, replaceVal),
      );
    });
  }

  function getParametersFromUrl() {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let c = url.searchParams.get('q');
    console.log(c);
  }

  // List of functions accessibly by other scripts
  window.UtilsModule = {
    editSrc: editSrc,
    getParametersFromUrl: getParametersFromUrl,
  };
})(window);
