import { TfIdf, PorterStemmer, WordTokenizer, LevenshteinDistance } from 'natural';

//let natural = require("natural");
//let TfIdf = natural.TfIdf;
// let PorterStemmer = natural.PorterStemmer;
// let WordTokenizer = natural.WordTokenizer;
// let LevenshteinDistance = natural.LevenshteinDistance;

class Term {
    public term: string = "";
    public count = 0;
}

export class Result {
    public documentKey: string = "";
    public measure: number = 0;
}

interface TfidfDocument {
    [key: string]: number | string
}
interface TfidfData {
    documents: TfidfDocument[]
}

export class SearchEngine {
    private recommendationCallback: (tokens: string[], recommendations: string[], isForCurrentToken:boolean) => void = (
        tokens, recommendations
    ) => { };
    private resultCallback: (results: Result[]) => void = (results) => { };
    private tfidf: any;
    private tokenizer: any = null;
    private documents: TfidfDocument[] = [];
    private stemmedWords = new Map<string, string[]>();

    constructor() {
        this.tokenizer = new WordTokenizer();
    }

    public setTfidf(json: TfidfData | string) {
        let data: TfidfData;
        if (typeof json === 'string') {
            data = <TfidfData>JSON.parse(json);
        }
        else {
            data = json;
        }
        this.documents = data.documents;
        for (let i = 0; i < this.documents.length; i++) {
            for (let key in this.documents[i]) {
                if (key != "__key") {
                    let stemmed = PorterStemmer.stem(key);
                    if (!this.stemmedWords.has(stemmed)) {
                        this.stemmedWords.set(stemmed, []);
                    }
                    let mapEntry = this.stemmedWords.get(stemmed) || [];
                    mapEntry.push(key);
                    this.stemmedWords.set(stemmed, mapEntry);
                }
            }

        }

        this.tfidf = new TfIdf(data);
    }

    public setRecommendationCallback(fkt: (tokens: string[], recommendations: string[], isForCurrentToken:boolean) => void) {
        this.recommendationCallback = fkt;
    }

    public setResultCallback(fkt: (results: Result[]) => void) {
        this.resultCallback = fkt;
    }

    public setQuery(query: string | null) {
        let results: Result[] = [];
        let recommendations: string[] = [];
        let tokens: string[] = [];
        let isForCurrentToken = false;
        if (this.tfidf) {
            if (query) {
                tokens = this.tokenizer.tokenize(query.toLowerCase());

                if (tokens.length > 0) {
                    let stemmedTokens = [];
                    for (let i = 0; i < tokens.length; i++) {
                        stemmedTokens.push(PorterStemmer.stem(tokens[i]));
                    }

                    let lastStemmedToken = stemmedTokens[stemmedTokens.length - 1];

                    let notFoundStemmedTokens = [];
                    for (let i = 0; i < stemmedTokens.length; i++) {
                        if (!this.stemmedWords.has(stemmedTokens[i])) {
                            notFoundStemmedTokens.push(stemmedTokens[i]);
                        }
                    }

                    if (notFoundStemmedTokens.length > 0
                        && notFoundStemmedTokens[notFoundStemmedTokens.length - 1] == lastStemmedToken) {
                        recommendations = this.recommentForIncompleteLastToken(tokens, lastStemmedToken, recommendations);
                        isForCurrentToken = true;
                    }
                }
                let possibleResults: { result: Result, terms: any }[] = [];
                this.tfidf.tfidfs(query, (i: number, measure: number) => {
                    if (measure != 0) {
                        let result = {
                            documentKey: <string>this.documents[i]["__key"],
                            measure: measure
                        }
                        let terms = this.tfidf.listTerms(i);
                        possibleResults.push({ terms: terms, result: result });
                    }
                });
                if(possibleResults.length == 0){
                    recommendations = this.recommentForIncompleteLastToken(tokens, query, recommendations);
                    isForCurrentToken = true;
                }
                else{
                    possibleResults.sort((a, b) => b.result.measure - a.result.measure);
                    results = possibleResults.map(value => value.result);
                    if (recommendations.length == 0) {
                        let possibleRecommendations: Term[] = [];
                        possibleResults.forEach(value => {
                            let terms = value.terms;
                            for (let i = 0; i < terms.length; i++) {
                                possibleRecommendations.push({ term: terms[i].term, count: terms[i].tfidf });
                            }
                        });
                        possibleRecommendations.sort((a, b) => b.count - a.count);
                        for (let i = 0; i < possibleRecommendations.length; i++) {
                            if (recommendations.length < 100
                                && !tokens.includes(possibleRecommendations[i].term)
                                && !recommendations.includes(possibleRecommendations[i].term)) {
                                recommendations.push(possibleRecommendations[i].term);
                            }
                        }
                        isForCurrentToken = false;
                    }
                }

            }
        }

        this.recommendationCallback(tokens, recommendations, isForCurrentToken);
        this.resultCallback(results);
    }

    private recommentForIncompleteLastToken(tokens: string[], lastStemmedToken: any, recommendations: string[]) {
        let possibleRecommendations: string[][] = [];
        this.stemmedWords.forEach((originalWords, stemmedWord) => {
            let distance = LevenshteinDistance(lastStemmedToken, stemmedWord);
            if (distance < 5) {
                if (possibleRecommendations.length <= distance
                    || possibleRecommendations[distance] == undefined) {
                    possibleRecommendations[distance] = [];
                }
                for (let i = 0; i < Math.min(originalWords.length, 100); i++) {
                    if (!possibleRecommendations[distance].includes(originalWords[i])
                        && !tokens.includes(originalWords[i])) {
                        possibleRecommendations[distance].push(originalWords[i]);
                    }
                }
            }
        });

        for (let i = 0; i < possibleRecommendations.length; i++) {
            if (possibleRecommendations[i]) {
                let documentCounts: Term[] = [];
                for (let j = 0; j < possibleRecommendations[i].length; j++) {
                    let term = new Term();
                    term.term = possibleRecommendations[i][j];
                    this.tfidf.tfidfs(possibleRecommendations[i][j], (i: number, measure: number) => {
                        if (measure != 0) {
                            term.count++;
                        }
                    });
                    documentCounts.push(term);
                }

                documentCounts.sort((a, b) => b.count - a.count);
                for (let j = 0; j < documentCounts.length; j++) {
                    recommendations.push(documentCounts[j].term);
                }
            }
        }

        return recommendations;
    }
}
