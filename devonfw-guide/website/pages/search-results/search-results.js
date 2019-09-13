function removeFromIndex(occurrencesMap, start, end) {
  for (let key in occurrencesMap) {
    let occs = occurrencesMap[key].body.position;
    let filtered = occs.filter((occ) => occ[0] < start || occ[0] > end);
    occurrencesMap[key].body.position = filtered;
  }

  return occurrencesMap;
}

function getLongestSnippet(textSnippetsMap) {
  let snippetHtml = { nWords: 0, text: '' };
  let maxLen = -1;

  for (let snippet in textSnippetsMap) {
    let nWordsInSnippet = textSnippetsMap[snippet].length;
    if (nWordsInSnippet > maxLen) {
      maxLen = nWordsInSnippet;
      snippetHtml.nWords = textSnippetsMap[snippet];
      snippetHtml.text = snippet.trim();
    }
  }

  return snippetHtml;
}

function getSnippets(occMap, range, text) {
  let occurrencesMap = JSON.parse(JSON.stringify(occMap));
  let occurrencesKeys = Object.keys(occurrencesMap);
  let snippetStore = {};

  // for each word in the search query
  for (let i = 0; i < occurrencesKeys.length; i++) {
    let key = occurrencesKeys[i];
    let ocurrences = occurrencesMap[key].body.position;

    // for each ocurrence of a word
    for (let j = 0; j < ocurrences.length; j++) {
      let ocurrence = ocurrences[j][0];
      let start = ocurrence - range;
      let end = ocurrence + range;
      let txtWindow = text.substring(start, end);

      let searchUntil = occurrencesKeys.length;

      let regexpWords = [];

      // Decrement the words searched
      while (searchUntil > i) {
        // Search how many words from the query are in the window
        regexpWords = occurrencesKeys.slice(i, searchUntil);
        let wordsRe = new RegExp(
          '.*' + regexpWords.join('(.|\\n)*') + '.*',
          'igm',
        );

        // Save if the snippet contains the words
        // in ocurrencesKeys[i] ... ocurrencesKeys[searchUntil]
        let containsTheWords = txtWindow.match(wordsRe) ? true : false;
        if (containsTheWords) {
          for (let w = 0; w < regexpWords.length; w++) {
            txtWindow = txtWindow.replace(
              new RegExp(regexpWords[w], 'ig'),
              `<span class="font-weight-bold font-italic">$&</span>`,
            );
          }
          snippetStore[txtWindow] = regexpWords;
        }
        searchUntil--;

        // If all the words are contained
        if (containsTheWords && regexpWords.length == occurrencesKeys.length) {
          break;
        }
      }

      // Remove found ocurrences from the index. "Normalize".
      removeFromIndex(occurrencesMap, start, end);
    }
  }

  return snippetStore;
}

export const SearchModule = { getSnippets, getLongestSnippet };
