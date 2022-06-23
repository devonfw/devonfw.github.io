let onlineTutorials = [];
let onlineFilter = [];
let allFilter = [];
const tagTypes = ['difficulty', 'technology', 'asset'];

function renderTutorial(tutorial){
	var tutorialCard = $('<div id="tutorial_' + tutorial['name'] + '" class="card col-12 col-sm-6"></div>');
	var descDiv = $('<div class="card_desc"></div>');
	var title = $('<div class="title">' + tutorial['title'] + '</div>');
	var desc  = tutorial['description'].split('#')[0].split('For more information')[0].split('More information')[0];
	desc = desc.replace(/(\[|\])/g,'').replace(/\(.*?\)/, '');
	var description = $('<div class="card_description">' + desc + '</div>');
	var paths = $(
	`
	<div class = "card-paths">
		<a href="${tutorial['paths']['eclipse']}"><img src="./wiki-images/eclipse.png" class="card-img zoom" title="Click here to read the Eclipse tutorial"></img></a>
		<a href="${tutorial['paths']['vscode']}"><img src="./wiki-images/vscode.png" class="card-img zoom" title="Click here to read the VSCode tutorial"></img></a>
		<a href="${tutorial['paths']['killercoda']}"><img src="./wiki-images/killercodaLogo.png" class="card-img zoom" title="Click here to try the interactive tutorial on Killercoda [still in Beta]"></img></a>
	</div>`
	);
	$("#tutorials").append(tutorialCard);
	descDiv.append(title, description);
	tutorialCard.append(descDiv,paths);
	
}

function getTutorials(){
	var tutorials = []
	for(let tutorial of tutorialsJson){
		tutorials.push(tutorial['name']);
	}
	return tutorials;
}

function getTags(){
	var tags = {}
	for(let type of tagTypes){
		tags[type] = [];
		for(const [key, value] of Object.entries(tagsJson[type])){
			tags[type].push(key);
		}
	}
	return tags;
}

function renderTutorials(tutorialsJson){
	for(let tutorial of tutorialsJson){
		renderTutorial(tutorial);
	}
	
}


function sortObjectByKeys(o) {
    return Object.keys(o).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}).reduce((r, k) => (r[k] = o[k], r), {});
}

function renderFilterItem(tagsJson, type, tutorials){
	for(const [key, value] of Object.entries(sortObjectByKeys(tagsJson[type]))){
		filterItem = `
		<li>
			<div id = "filteritem_${type}_${key}" class="filter_item form-check filter-div">
				<input class="form-check-input" type="checkbox" onclick="filterOnClick()" name="filter-item" value="" id="${type}_${key}">
				<label class="form-check-label filter_item" for="${key}">
					${capitalizeFirstLetter(key)}
				</label>
			</div>
		</li>
		`;
		$(`#filter_type_${type}`).append(filterItem);
	}
}

function renderFilter(tagsJson, tutorials){
	for(let type of tagTypes){
		var filterType = $('<div class="filterpanel"><div class="title filter_title">' + capitalizeFirstLetter(type) + '</div><ul id="filter_type_' + type + '" class="filter_type"></ul><div>');
		$("#filter").append(filterType);
		renderFilterItem(tagsJson, type, tutorials);
	}
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function filter(){
	var checkedBoxes = document.querySelectorAll('input[name=filter-item]:checked')
	var selectedTutorials = onlineTutorials
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const words = urlParams.get('search')
	if (checkedBoxes.length > 0) {
		for (let check of checkedBoxes){
			let type = check.id.split('_')[0];
			let tag = check.id.split('_')[1];
			selectedTutorials = selectedTutorials.filter(value => tagsJson[type][tag].includes(value));
		}
		filterTutorials(selectedTutorials);
		onlineTutorials = selectedTutorials;
	}
	else {
		onlineTutorials = getTutorials()
		for (let tutorial of onlineTutorials){
			document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
		}
	}
}

function filterTutorials(selectedTutorials){
	for (let tutorial of onlineTutorials){
			if(selectedTutorials.includes(tutorial)){
				document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
			}
			else{
				document.getElementById(`tutorial_${tutorial}`).style["display"] = "None";
			}
		}
}

function filterOnClick(){
	search();
	filter();
	filterTags();
	hideFilter();
}

function searchOnPress(){
	const searchParams = new URLSearchParams(document.location.hash.length > 0 ? document.location.hash.substring(1) : "");
	let words = document.getElementById("search-field-tutorial").value;
	searchParams.append("search",words);
	window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${searchParams}`));
	filter();
	search();
	filterTags();
	hideFilter();
}

function search(){
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const words = urlParams.get('search') ? urlParams.get('search') : []; 
	const checkedBoxes = document.querySelectorAll('input[name=filter-item]:checked')
	let queryRes = words ? searchData.index.search(words) : [];
	let selectedTutorials = []
	const findById = (id, objects) => {
		const obj = objects.find((obj) => '' + obj.id == '' + id);
		return obj;
    };
	for (let i = 0; i < queryRes.length; i++) {
		let res = queryRes[i];
		let obj = findById(res.ref, searchData.documents);
		selectedTutorials.push(obj.dirname);
	}
	if(words.length > 0) {
		filterTutorials(selectedTutorials);
		onlineTutorials = selectedTutorials;
	}else{
		onlineTutorials = getTutorials();
		for (let tutorial of onlineTutorials){
			document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
		}
	}
}

function filterTags(){
	let selectedFilter = {}
	tagTypes.forEach(type => {
		selectedFilter[type] = []
	})
	for (let tutorial of onlineTutorials){
		for (let type of tagTypes) {
			for(const [key, value] of Object.entries(tagsJson[type])){
				if(value.includes(tutorial)){
					selectedFilter[type].push(key);
				}
			}
			selectedFilter[type] = [...new Set(selectedFilter[type])];
		}
	} 
	onlineFilter = selectedFilter;
}

function hideFilter(){
	for (let type of tagTypes) {
		for(let tag of allFilter[type]){
				if(onlineFilter[type].includes(tag)){
					document.getElementById(`filteritem_${type}_${tag}`).style["display"] = "list-item";
				}
				else {
					document.getElementById(`filteritem_${type}_${tag}`).style["display"] = "None";
				}
		}
	}
}


async function main() {
	
	indexJson = await $.ajax({
        url: "index.json?r=" + Math.random() * 10000
    });

    docsJson = await $.ajax({
        url: "docs.json?r=" + Math.random() * 10000
    });

    tutorialsJson = await $.ajax({
        url: "tutorials.json?r=" + Math.random() * 10000
    });

    tagsJson = await $.ajax({
        url: "tags.json?r=" + Math.random() * 10000
    });
	
	searchData = { index: lunr.Index.load(indexJson), documents: docsJson };
	onlineTutorials = getTutorials();	
	onlineFilter = allFilter = getTags();
	
	var container = $('<div id="tutorial_container" class="tutorial_container col-12 row"></div>');
    var tutorialsDiv = $('<div id="tutorials" class="tutorials col-12 col-md-9 row"></div>');
	var filterPanelDiv = $('<div id="filter" class="filter col-12 col-md-3 "></div>');
	var seachFieldDiv = '<div class="search-div col-12"><input onkeyup="searchOnPress()" id="search-field-tutorial" type="search" class="form-control search-bar mr-sm-2" placeholder="Search by keyword(s)..." aria-label="Search" style="height: auto;"/>';
	$("head").append('<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">');
	$("#content").append(seachFieldDiv, container);
	container.append(filterPanelDiv, tutorialsDiv);
	renderTutorials(tutorialsJson);
	renderFilter(tagsJson, onlineTutorials);

	
}

main();
