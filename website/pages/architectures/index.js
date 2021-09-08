var pageSize = 10;

function getParameters() {
    const searchParams = new URLSearchParams(document.location.hash.length > 0 ? document.location.hash.substring(1) : "");
    var params = {};
    params.toString = () => searchParams.toString();
    params.set = (k, v) => searchParams.append(k, v);
    params.delete = (k, v) => {
        var allValues = searchParams.getAll(k);
        var newAllValues = allValues.filter(av => av != v);
        if (newAllValues.length != allValues.length) {
            searchParams.delete(k);
            newAllValues.forEach(av => searchParams.set(k, av));
            return true;
        }
        return false;
    }
    params.get = (k) => searchParams.getAll(k);
    params.keys = (k) => searchParams.keys(k);
    return params;
}

function search() {
    var parameters = getParameters();
    var solutions = solutionsJson;
    let curentPage = 1;
    let queryRes = queryIndex();

    for (const filterName of parameters.keys()) {
        var filterValues = parameters.get(filterName);
        if (filterName == 'page') {
            curentPage = filterValues[0];
            parameters.delete('page', curentPage);
            continue;
        }
        if (filterName == 'search') {
            continue;
        }
        for (var i in filterValues) {
            var filterValue = filterValues[i];
            var filterSolutions = tagsJson[filterName][filterValue];
            let newSolutions = {};
            for (var solutionKey in solutions) {
                if (filterSolutions.includes(solutionKey)) {
                    newSolutions[solutionKey] = solutions[solutionKey];
                }
            }
            solutions = newSolutions;
        }
    }

    let newSolutions = {};
    let query = document.getElementById('search-field-solutions').value.trim();

    if (query.length > 0) {
        if (queryRes.length > 0) {
            for (var r in queryRes) {
                var result = queryRes[r];
                console.log('queryRes, result', queryRes, result);
                if (result in solutions) {
                    newSolutions[result] = solutions[result];
                }
            }
            solutions = newSolutions;
        }
        else {
            solutions = {};
        }
    }
    renderSolutions(solutions, curentPage);
    disableFilters(solutions);
    highlightSelected();
}

function renderSolutions(solutions, current) {
    var filterpanelbody = $("#resultspanel");
    filterpanelbody.empty();

    let currentPage = current;
    let countSolutions = 0;
    let dataSize = Object.keys(solutions).length;
    let totalPage = Math.ceil(dataSize / pageSize);
    let startData = (currentPage - 1) * pageSize + 1;
    let endData = (currentPage * pageSize > dataSize ? dataSize : currentPage * pageSize);

    for (const solutionKey in solutions) {
        if (Object.hasOwnProperty.call(solutions, solutionKey)) {
            countSolutions++;
            if (countSolutions >= startData && countSolutions <= endData) {
                const solution = solutions[solutionKey];
                var solutionDiv = $('<div id="solution_' + solutionKey + '" class="solution"></div>');
                var solutionHeadlineDiv = $('<div id="solution_' + solutionKey + '_headline" class="solutionheadline"></div>');
                var solutionHeadlineLink = $('<a id="solution_' + solutionKey + '_headline_link" class="solutionheadlinelink" href="' + solution.path + '"></a>');
                solutionHeadlineLink.text(solution.headline);
                solutionHeadlineLink.attr('target', '_blank')
                solutionHeadlineDiv.append(solutionHeadlineLink);
                solutionDiv.append(solutionHeadlineDiv);
                var solutionBodyDiv = $('<div id="solution_body_' + solutionKey + '" class="solutionbody"></div>');
                if (solution.image != "") {
                    var solutionImage = $('<img id="solution_' + solutionKey + '_image" class="solutionimage" src="' + solution.image + '"></img>');
                    solutionBodyDiv.append(solutionImage);
                }
                var solutionSnippetDiv = $('<div id="solution_' + solutionKey + '_snippet" class="solutionsnippet"></div>');
                solutionSnippetDiv.text(solution.snippet);
                solutionBodyDiv.append(solutionSnippetDiv);
                solutionDiv.append(solutionBodyDiv);
                filterpanelbody.append(solutionDiv);
            }
        }
    }

    createBtns(totalPage, currentPage);
}

function createBtns(totalPage, current) {
    $('#pagination').empty();
    let pageSpan;
    let currentPage = parseInt(current);
    if (currentPage > 1) {
        pageSpan = $("<span class='pageBtn' id='prepage' href=\"#\" data-page = " + (currentPage - 1) + "><  Precious</span>")
        pageSpan.click(() => {
            clickBtn(currentPage - 1);
        });
        $("#pagination").append(pageSpan);
    }
    for (let pageIndex = 1; pageIndex < totalPage + 1; pageIndex++) {
        pageSpan = $("<a class='pageBtn' id='page" + pageIndex + "' data-page = " + (pageIndex) + "><span>" + pageIndex + "</span></a>");
        pageSpan.click(() => {
            clickBtn(pageIndex);
        });
        $("#pagination").append(pageSpan);
    }
    if (currentPage < totalPage) {
        pageSpan = $("<span class='pageBtn' id='nextpage' href=\"#\"  data-page = " + (currentPage + 1) + ">Next  ></span>");
        pageSpan.click(() => {
            clickBtn(currentPage + 1);
        });
        $("#pagination").append(pageSpan);
    }
}

function clickBtn(current) {
    let parameters = getParameters();
    let pageArr = parameters.get('page');
    for (var p in pageArr) {
        parameters.delete('page', pageArr[p]);
    }
    parameters.set('page', current);
    document.location.hash = "#" + parameters.toString()
    search();
    $('#page' + (current)).css({ background: '#007bff', color: '#fff' });
}

function highlightSelected() {
    $(".checkbox").text("check_box_outline_blank");
    var parameters = getParameters();
    for (const filterName of parameters.keys()) {
        var filterValues = parameters.get(filterName);
        for (var i in filterValues) {
            var filterValue = filterValues[i];
            $("#tag_" + filterName.replace(/[^a-zA-Z0-9]/g, "_") + '_' + filterValue.replace(/[^a-zA-Z0-9]/g, "_") + "_checkbox").text('check_box');
            $("#tag_" + filterName.replace(/[^a-zA-Z0-9]/g, "_") + '_' + filterValue.replace(/[^a-zA-Z0-9]/g, "_")).removeClass('disabled');
        }
    }
}

function disableFilters(solutions) {
    $(".disabled").removeClass("disabled");
    for (const filter in tagsJson) {
        if (Object.hasOwnProperty.call(tagsJson, filter)) {
            const tag = orderTag(tagsJson[filter]);
            var activeValues = [];
            for (const solutionKey in solutions) {
                if (Object.hasOwnProperty.call(solutions, solutionKey)) {
                    const solution = solutions[solutionKey];
                    if (solution["tags"][filter]) {
                        activeValues = activeValues.concat(solution["tags"][filter]);
                    }
                }
            }
            for (const tagValue in tag) {
                if (Object.hasOwnProperty.call(tag, tagValue)) {
                    console.log(filter + ":" + tagValue);
                    if (!activeValues.includes(tagValue)) {
                        $('#tag_' + filter.replace(/[^a-zA-Z0-9]/g, "_") + '_' + tagValue.replace(/[^a-zA-Z0-9]/g, "_")).addClass("disabled");
                    }
                }
            }
        }
    }
}

function orderTag(tag) {
    var tags = {};
    keys = Object.keys(tag);
    var i, len = keys.length;
    keys.sort(function (s1, s2) {
        var l = s1.toLowerCase(), m = s2.toLowerCase();
        return l === m ? 0 : l > m ? 1 : -1;
    });
    for (i = 0; i < len; i++) {
        k = keys[i];
        tags[k] = tag[k];
    }
    return tags;
}

function searchOnClick() {
    let searchField = document.getElementById('search-field-solutions');
    let timer = null;
    searchField.onkeypress = function (e) {
        if (timer) {
            clearTimeout(timer);
        }
        if (e.key == 'Enter') {
            e.preventDefault();
        }
        timer = setTimeout(search, 500);
    };

    searchField.onpaste = function (e) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(search, 100);
    };

    $('#search-field-solutions').change(function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(search, 500);
    });
}

function queryIndex() {
    let results = [];
    let parameters = getParameters();
    let searchArr = parameters.get('search');

    let query = document.getElementById('search-field-solutions').value;
    let queryRes = query ? searchData.index.search(query) : [];

    const findById = (id, objects) => {
        const obj = objects.find((obj) => '' + obj.id == '' + id);
        return obj;
    };

    for (let i = 0; i < queryRes.length; i++) {
        let res = queryRes[i];
        let obj = findById(res.ref, searchData.documents);
        results = results.concat(obj['dirname']);
    }
    if (searchArr) {
        for (var p in searchArr) {
            parameters.delete('search', searchArr[p]);
        }
    }
    if (queryRes.length > 0) {
        parameters.set('search', query);
    }
    document.location.hash = "#" + parameters.toString()

    return results;
}

async function main() {
    indexJson = await $.ajax({
        url: "index.json?r=" + Math.random() * 10000
    });

    docsJson = await $.ajax({
        url: "docs-json.json?r=" + Math.random() * 10000
    });

    solutionsJson = await $.ajax({
        url: "solutions.json?r=" + Math.random() * 10000
    });

    tagsJson = await $.ajax({
        url: "tags.json?r=" + (Math.random() * 10000)
    });

    searchData = { index: lunr.Index.load(indexJson), documents: docsJson };

    for (const filter in tagsJson) {
        if (Object.hasOwnProperty.call(tagsJson, filter)) {
            const tag = orderTag(tagsJson[filter]);
            for (const tagValue in tag) {
                if (Object.hasOwnProperty.call(tag, tagValue)) {
                    var solutionIds = tag[tagValue];
                    solutionIds.forEach(solutionId => {
                        var solution = solutionsJson[solutionId];
                        if (solution) {
                            if (!solution["tags"]) {
                                solution["tags"] = {};
                            }
                            if (!solution["tags"][filter]) {
                                solution["tags"][filter] = [];
                            }
                            solution["tags"][filter].push(tagValue);
                        }
                    });

                }
            }
        }
    }
    console.log(solutionsJson);

    $("head").append('<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">');
    var paginationDiv = $('<div id="pagination" class = "pagination"></div>');
    $("#content").append(paginationDiv);
    var seachFieldDiv = '<div class="search-bar"><input id="search-field-solutions" type="search" class="form-control mr-sm-2" placeholder="Search by keyword(s)..." aria-label="Search" style="height: auto;"/>';
    $('#content').append(seachFieldDiv);
    var parameters = getParameters();

    var filterspanel = $('<div id="filterspanel" class="filterspanel"></div>');
    for (const filter in tagsJson) {
        if (Object.hasOwnProperty.call(tagsJson, filter)) {
            const tag = orderTag(tagsJson[filter]);
            console.log(tag);
            var filterpanel = $('<div id="filterpanel_' + filter + '" class="filterpanel"></div>');
            var filterpanelhead = $('<div id="filterpanel_' + filter + '_head" class="filterpanelhead"></div>');
            filterpanelhead.text(filter);
            filterpanel.append(filterpanelhead);
            var filterpanelbody = $('<div id="filterpanel_' + filter + '_body" class="filterpanelbody"></div>');
            filterpanel.append(filterpanelbody);
            for (const tagValue in tag) {
                if (Object.hasOwnProperty.call(tag, tagValue)) {
                    var tagDiv = $('<div class="tag" id="tag_' + filter.replace(/[^a-zA-Z0-9]/g, "_") + '_' + tagValue.replace(/[^a-zA-Z0-9]/g, "_") + '"></div>');
                    tagDiv.text(tagValue);
                    tagDiv.prepend($('<span id="tag_' + filter.replace(/[^a-zA-Z0-9]/g, "_") + '_' + tagValue.replace(/[^a-zA-Z0-9]/g, "_") + '_checkbox" class="checkbox material-icons-sharp">check_box_outline_blank</span>'))
                    tagDiv.click((e) => {
                        if (!$(e.currentTarget).hasClass("disabled")) {
                            if (!parameters.delete(filter, tagValue)) {
                                parameters.set(filter, tagValue);
                            }
                            document.location.hash = "#" + parameters.toString()
                            search();
                        }
                    });
                    filterpanelbody.append(tagDiv);
                }
            }
            filterspanel.append(filterpanel);
        }
    }
    $("#content").append(filterspanel);
    var resultspanel = $('<div id="resultspanel" class="resultspanel"></div>');
    $("#content").append(resultspanel);
    for (const filterName of parameters.keys()) {
        if (filterName == 'search') {
            document.getElementById('search-field-solutions').value = parameters.get('search')[0];
        }
    }
    search();
    searchOnClick();
}

main();