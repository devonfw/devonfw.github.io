import { ConfigModule } from '../config/devonfw-site-conf.js';

const utilsModule = (function(window) {
    // Function definitions
    function editSrc(searchValue, replaceValue) {
        let searchVal = searchValue || ConfigModule.editSrc.searchValue;
        let replaceVal = replaceValue || ConfigModule.editSrc.imgFolderPath;

        $('img').each(function() {
            $(this).attr(
                'src',
                $(this)
                .attr('src')
                .replace(searchVal, replaceVal),
            );
        });
    }

    function getParametersFromUrl(param = 'q') {
        let url_string = window.location.href;
        let url = new URL(url_string);
        let queryParam = url.searchParams.get(param);

        return queryParam;
    }

    function loadIndex(searchData) {
        const info = ConfigModule.searchInfo;

        $.getJSON(info.docsPath, function(docsJson) {
            searchData.documents = docsJson;

            $.getJSON(info.indexPath, function(idxJson) {
                searchData.index = lunr.Index.load(idxJson);
            });
        });
    }

    function getFileNameBySrc(filepath) {
        let pathLength = filepath.split('/').length
        let fileName = filepath.split('/')[pathLength - 1];
        return fileName
    }

    function getLinkPathByHref(href) {
        return href.split('#')[1];
    }

    function getHtmlFileName(fileName) {
        let thisFile = $('script[src$="' + fileName + '"]')[0];
        let thisFilename = thisFile.attributes.src.value;
        let htmlFilemame = thisFilename.replace(/\.js$/g, '.html');
        return htmlFilemame;
    }

    // List of functions accessibly by other scripts
    return {
        editSrc: editSrc,
        getParametersFromUrl: getParametersFromUrl,
        loadIndex: loadIndex,
        getFileNameBySrc: getFileNameBySrc,
        getLinkPathByHref: getLinkPathByHref,
        getHtmlFileName: getHtmlFileName,
    };
})(window);

export const UtilsModule = utilsModule;