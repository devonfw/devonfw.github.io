import { SearchEngine, Result } from "./search-engine";

let maxRecommendations = 10;
let maxResults = 10;

let model: {
  prefixRecommendations: string[],
  recommendations: string[],
  results: Result[],
  currentQuery: string,
  tokens: string[],
  currentRecommendationIndex: number,
  isForCurrentToken: boolean
} = {
  prefixRecommendations: [],
  recommendations: [],
  results: [],
  currentQuery: "",
  tokens: [],
  currentRecommendationIndex: -1,
  isForCurrentToken: false
};

let engine = new SearchEngine();

$(window).on('load', () => {
  $.get("/website/components/header/search-engine/meta.json?d=" + new Date(), (metadata, status) => {
    console.log(status, metadata);
    if (status == "success") {
      let load = true;
      if (window.localStorage) {
        if (window.localStorage.meta) {
          let meta = JSON.parse(window.localStorage.meta);
          if (meta.date == metadata.date) {
            load = false;
          }
          else {
            window.localStorage.clear();
          }
        }
        window.localStorage.meta = JSON.stringify(metadata);
      }
      if (load || !window.localStorage.tfidf) {
        $.get("/website/components/header/search-engine/tfidf.json?d=" + new Date(), (data, status) => {
          console.log(status, data);
          if (status == "success") {
            setTimeout(() => {
              engine.setTfidf(data);
              window.localStorage.tfidf = JSON.stringify(data);
              console.log("done");
            }, 50);
          }
        });
      }
      else {
        setTimeout(() => {
          engine.setTfidf(window.localStorage.tfidf);
          console.log("done");
        }, 50);
      }
    }
  });
  registerSearchEvents();

  engine.setRecommendationCallback(
    (tokens, recommendations, isForCurrentToken) => {
      model.tokens = tokens;
      model.prefixRecommendations = [];
      model.recommendations = [];
      model.currentRecommendationIndex = -1;
      model.isForCurrentToken = isForCurrentToken;

      for (let i = 0; i < recommendations.length; i++) {
        if (isForCurrentToken && recommendations[i].startsWith(model.tokens[model.tokens.length - 1])) {
          model.prefixRecommendations.push(recommendations[i]);
        }
      }
      for (let i = 0; i < recommendations.length; i++) {
        if (!model.prefixRecommendations.includes(recommendations[i])) {
          model.recommendations.push(recommendations[i]);
        }
      }

      render();
    }
  );
  engine.setResultCallback((results) => {
    model.results = results;
    render();
  });
});

function render() {
  console.log("model", model);
  ensureDivs();
  if (model.results.length > 0 || model.recommendations.length > 0 || model.prefixRecommendations.length > 0) {
    renderRecommendations();
    renderResults();
  } else {
    renderNoResults();
  }
  showResultPanel();
}

function renderRecommendations() {
  $('#recommendations').html('');
  let addedRecommendationsCount = 0;
  for (let i = 0; i < model.prefixRecommendations.length; i++) {
    let postfix = model.prefixRecommendations[i].substring(model.tokens[model.tokens.length - 1].length);
    if (addedRecommendationsCount < maxRecommendations) {
      let highlightClass = (addedRecommendationsCount == model.currentRecommendationIndex) ? "highlight" : "";
      let div = $(`<div class="recommendation ${highlightClass}">${model.currentQuery}<span class="highlightText">${postfix}</span></div>`);
      let id = addedRecommendationsCount;
      div.on("click", () => {
        clickRecommendation(id);
      });
      $('#recommendations').append(div);
      addedRecommendationsCount++;
    }
  }
  let prefix = "";
  let highlightTextClass = ""
  if (!model.isForCurrentToken) {
    prefix = model.currentQuery + " ";
    highlightTextClass = "highlightText";
  }
  for (let i = 0; i < model.recommendations.length; i++) {
    if (addedRecommendationsCount < maxRecommendations) {
      let highlightClass = (addedRecommendationsCount == model.currentRecommendationIndex) ? "highlight" : "";
      let div = $(`<div class="recommendation ${highlightClass}">${prefix}<span class="${highlightTextClass}">${model.recommendations[i]}</span></div>`);
      let id = addedRecommendationsCount;
      div.on("click", () => {
        clickRecommendation(id);
      });
      $('#recommendations').append(div);
      addedRecommendationsCount++;
    }
  }
}

function clickRecommendation(id: number){
  let searchField = <HTMLInputElement>document.getElementById("search-field");
  if (searchField) {
    takeOverRecommendationToSearchField(id);
    model.currentQuery = searchField.value;
    setTimeout(triggerSearch, 1);
  }
}

function takeOverRecommendationToSearchField(id: number) {
  let searchField = <HTMLInputElement>document.getElementById("search-field");
  if (searchField) {
    model.currentRecommendationIndex = id;
    if (model.currentRecommendationIndex >= 0) {
      if (model.currentRecommendationIndex < model.prefixRecommendations.length) {
        let postfix = model.prefixRecommendations[model.currentRecommendationIndex].substring(model.tokens[model.tokens.length - 1].length);
        searchField.value = model.currentQuery + postfix;
      }
      else if (model.currentRecommendationIndex < model.prefixRecommendations.length + model.recommendations.length) {
        if(model.isForCurrentToken){
          searchField.value = model.currentQuery.substring(0, model.currentQuery.length - model.tokens[model.tokens.length - 1].length) + model.recommendations[model.currentRecommendationIndex - model.prefixRecommendations.length];
        }
        else{
          searchField.value = model.currentQuery +  ' ' + model.recommendations[model.currentRecommendationIndex - model.prefixRecommendations.length];
        }
      }
      else {
        searchField.value = model.currentQuery;
      }
    }
    renderRecommendations();
  }
}

function renderResults() {
  $('#results').html('');
  let addedResultsCount = 0;
  for (let i = 0; i < model.results.length; i++) {
    if (addedResultsCount < 10) {
      if (window.localStorage && window.localStorage["result_" + model.results[i].documentKey]) {
        let data = JSON.parse(window.localStorage["result_" + model.results[i].documentKey]);
        $('#results').append(`<div class="result" id="result_${model.results[i].documentKey}">${searchResultHtml(data)}</div>`);
      }
      else {
        $('#results').append(
          `<div class="result" id="result_${model.results[i].documentKey}">
            ${createResultDummy()}
          </div>`);
        $.get(`/website/components/header/search-engine/results/${model.results[i].documentKey}.json?d=${new Date()}`, (data, status) => {
          console.log(status, data);
          if (status == "success") {
            $(`#result_${model.results[i].documentKey}`).html(searchResultHtml(data));
            if (window.localStorage) {
              try {
                window.localStorage["result_" + model.results[i].documentKey] = JSON.stringify(data);
              }
              catch (e) { }
            }
          }
        });
      }
    }
    addedResultsCount++;
  }
}

function searchResultHtml(data: any) {
  if (data.type == "doc") {
    let breadcrumbs = data.breadcrumbs.join(" > ");
    for (let i = 0; i < model.tokens.length; i++) {
      let regex = new RegExp('\\b' + model.tokens[i] + '\\b', 'igm');
      breadcrumbs = breadcrumbs.replace(regex, '<span class="highlightText">$&</span>');
    }

    return `<a href="/website/pages/docs/${data.filename}#${data.anchor}">${data.title}</a>
            <span class="breadcrumbs">${breadcrumbs}</span>
            <div class="snippet">${getSnippet(data.text)}</div>`;
  }
  else if (data.type == "solution") {
    return `<a href="/website/pages/architectures/solutions/${data.filename.replace(/[\/\\]index\.asciidoc$/, '')}">${data.title}</a>
            <span class="breadcrumbs">Solution</span>
            <div class="snippet">${getSnippet(data.text)}</div>`
  }
  return "";
}

function getSnippet(text: string) {
  let possibleResults: { result: string, count: number }[] = [];

  for (let i = 0; i < model.tokens.length; i++) {
    let regex = new RegExp('\\b.{0,50}\\b' + model.tokens[i] + '\\b.{0,50}\\b', 'igm');
    let regexMatch = null;
    while ((regexMatch = regex.exec(text)) !== null) {
      possibleResults.push({ result: regexMatch[0], count: 0 });
    }
  }

  for (let i = 0; i < possibleResults.length; i++) {
    for (let j = 0; j < model.tokens.length; j++) {
      let regex = new RegExp('\\b' + model.tokens[j] + '\\b', 'igm');
      if (regex.test(possibleResults[i].result)) {
        possibleResults[i].result = possibleResults[i].result.replace(regex, '<span class="highlightText">$&</span>');
        possibleResults[i].count++;
      }
    }
  }
  possibleResults.sort((a, b) => {
    let result = b.count - a.count;
    if (result == 0) {
      result = b.result.length - a.result.length;
    }
    return result;
  });
  if (possibleResults.length > 0) {
    return possibleResults[0].result;
  }
  return text.substr(0, 100);
}

function renderLoadingResults() {
  ensureDivs();
  if($('#recommendations .ssc-head-line').length != 7){
    $('#recommendations').html(
    createRecommendationDummy() +
    createRecommendationDummy() +
    createRecommendationDummy() +
    createRecommendationDummy() +
    createRecommendationDummy() +
    createRecommendationDummy() +
    createRecommendationDummy() 
    );
  }
  if($('#results .ssc-head-line').length != 9){
    $('#results').html(
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy() +
      createResultDummy()
    );
  }
}

function createRecommendationDummy(){
  return `<div class="ssc-head-line w-${getRandomInt(2,8)}0 mbs"></div>`
}

function createResultDummy(){
  return `
    <div class="flex align-center">
      <div class="ssc-head-line w-${getRandomInt(3,8)}0 mrs mbs"></div>
      <div class="ssc-line w-${getRandomInt(2,8)}0"></div>
    </div>
    <div class="ssc-line w-${getRandomInt(3,8)}0 mb"></div>`
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderNoResults() {
  $('#recommendations').html(`No results`);
  $('#results').html(``);
}

function ensureDivs() {
  if ($('#recommendations').length == 0) {
    $("#search-results-box").html('<div id="recommendations" class="ssc ssc-wrapper"></div><div id="results" class="ssc ssc-wrapper"></div>');
  }
}

function showResultPanel() {
  $("#search-results-box").removeClass("hidden");
  $("#click-outside").removeClass("hidden");
  registerOnClickOutside();
}

function hideResultPanel() {
  $("#search-results-box").addClass("hidden");
  $("#click-outside").addClass("hidden");
}

function triggerSearch() {
  engine.setQuery(model.currentQuery);
  (<any>window).dataLayer = (<any>window).dataLayer || [];
  (<any>window).dataLayer.push({
    'event' : 'search',
    'searchTerm' : model.currentQuery
  });
}

function registerSearchEvents() {
  let searchField = <HTMLInputElement>document.getElementById("search-field");
  if (searchField) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    searchField.onkeydown = (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
      }
    };
    searchField.onkeyup = (e) => {
      if (e.key == "Enter" || e.key == "ArrowRight") {
        renderLoadingResults();
        model.currentQuery = searchField.value;
        e.preventDefault();
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(triggerSearch, 1);
      }
      else if (e.key == "Backspace") {
        renderLoadingResults();
        //model.currentQuery = model.currentQuery.slice(0, Math.max(1, searchField.selectionStart || 1) - 1) + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
        model.currentQuery = searchField.value;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(triggerSearch, 1000);
      }
      else if (e.key == "Clear" || e.key == "Esc" || e.key == "Escape") {
        renderLoadingResults();
        model.currentQuery = "";
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(triggerSearch, 1);
      }
      else if (e.key == "ArrowUp" || e.key == "Up") {
        e.preventDefault();
        takeOverRecommendationToSearchField(Math.max(-1, model.currentRecommendationIndex - 1));
      }
      else if (e.key == "ArrowDown" || e.key == "Down") {
        e.preventDefault();
        takeOverRecommendationToSearchField(Math.min(maxRecommendations - 1, model.currentRecommendationIndex + 1, model.prefixRecommendations.length + model.recommendations.length));
      }
      /*else if (e.key == "ArrowRight") {
        let postfix = model.recommendations[model.currentRecommendationIndex].substring(model.tokens[model.tokens.length - 1].length);
        model.currentQuery = model.currentQuery + postfix;
        renderInlineRecommendation();
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(triggerSearch, 1);
      }*/
      else {
        renderLoadingResults();
        showResultPanel();
        //model.currentQuery = model.currentQuery.slice(0, searchField.selectionStart || 0) + e.key + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
        model.currentQuery = searchField.value;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(triggerSearch, 1000);
      }
    };

    /*searchField.addEventListener("selectionchange", () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(triggerSearch, 500);
    });*/

    searchField.onpaste = (e) => {
      if (timer) {
        clearTimeout(timer);
      }
      //model.currentQuery = model.currentQuery.slice(0, searchField.selectionStart || 0) + e.clipboardData?.getData("text") || "" + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
      model.currentQuery = searchField.value;
      timer = setTimeout(triggerSearch, 100);
    };

    /*$("#search-field").change(function () {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(triggerSearch, 1000);
    });*/
  }
}

function registerOnClickOutside() {
  let element = document.getElementById("click-outside");
  if (element) {
    element.addEventListener("click", function (event) {
      hideResultPanel();
      event.stopPropagation();
    });
  }
}