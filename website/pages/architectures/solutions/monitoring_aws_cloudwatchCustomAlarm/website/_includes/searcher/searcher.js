function getSearchBar() {
  const searchBar = `
    <li>
      <div class="search-bar">
        <input id="search-field" type="text" placeholder="Search by keyword(s)..."/>
        <button onclick="query()">Search</button>
        <div class="search-bar-results hidden" id="search-results">
        </div>
      </div>
    </li>`;

  return searchBar;
}
