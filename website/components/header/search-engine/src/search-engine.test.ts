
import { SearchEngine } from "./search-engine";
import { TfIdf } from 'natural';
import { expect } from 'chai';
// let natural = require("natural");
// let TfIdf = natural.TfIdf;

describe("SearchEngine", () => {
  describe("setQuery", () => {
    it("does not break when data is not initialized", () => {
      let engine = new SearchEngine();
      engine.setQuery("query");
    });

    it("does not break when query is empty", () => {
      let engine = new SearchEngine();
      engine.setQuery("");
    });

    it("does not break when query is null", () => {
      let engine = new SearchEngine();
      engine.setQuery(null);
    });

    it("calls callbacks with empty data when data is not initialized", () => {
      let engine = new SearchEngine();
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        () => (recommendationCallbackCalled = true)
      );
      engine.setResultCallback(() => (resultCallbackCalled = true));
      engine.setQuery("query");
      expect(recommendationCallbackCalled).to.be.true//;.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });

    it("calls callbacks with empty data when query is empty", () => {
      let engine = new SearchEngine();
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        () => (recommendationCallbackCalled = true)
      );
      engine.setResultCallback(() => (resultCallbackCalled = true));
      engine.setQuery("");
      expect(recommendationCallbackCalled).to.be.true//.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });

    it("calls callbacks with empty data when query is null", () => {
      let engine = new SearchEngine();
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        () => (recommendationCallbackCalled = true)
      );
      engine.setResultCallback(() => (resultCallbackCalled = true));
      engine.setQuery(null);
      expect(recommendationCallbackCalled).to.be.true//.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });

    it("calls callbacks with data when tfidf is initialized", () => {
      const tfidf = new TfIdf();
      tfidf.addDocument("this document is about node.", "Doc one");
      tfidf.addDocument("this document is about ruby.", "Doc two");
      tfidf.addDocument("this document is about ruby and node.", "Doc three");
      tfidf.addDocument("this document is about node. it has node examples", "Doc four");

      let engine = new SearchEngine();
      engine.setTfidf(JSON.stringify(tfidf));
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        (tokens: string[], recommendations: string[]) => {
          console.log(recommendations);
          recommendationCallbackCalled = recommendations.length > 0
        }
      );
      engine.setResultCallback((results) => {
        console.log(results);
        resultCallbackCalled = results.length > 0;
      });
      engine.setQuery("node");
      expect(recommendationCallbackCalled).to.be.true//.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });

    it("calls callbacks with data when tfidf is initialized with incomplete query", () => {
      const tfidf = new TfIdf();
      tfidf.addDocument("this document is about node.", "Doc one incomplete");
      tfidf.addDocument("this document is about ruby.", "Doc two incomplete");
      tfidf.addDocument("this document is about ruby and node.", "Doc three incomplete");
      tfidf.addDocument("this document is about node. it has node examples", "Doc four incomplete");

      let engine = new SearchEngine();
      engine.setTfidf(JSON.stringify(tfidf));
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        (tokens: string[], recommendations: string[]) => {
          console.log(recommendations);
          recommendationCallbackCalled = recommendations.length > 0
        }
      );
      engine.setResultCallback((results) => {
        console.log(results);
        resultCallbackCalled = results.length == 0;
      });
      engine.setQuery("no");
      expect(recommendationCallbackCalled).to.be.true//.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });

    it("calls callbacks with data when tfidf is initialized with complete and incomplete query", () => {
      const tfidf = new TfIdf();
      tfidf.addDocument("this document is about node.", "Doc one incomplete");
      tfidf.addDocument("this document is about ruby.", "Doc two incomplete");
      tfidf.addDocument("this document is about ruby and node.", "Doc three incomplete");
      tfidf.addDocument("this document is about node. it has node examples", "Doc four incomplete");

      let engine = new SearchEngine();
      engine.setTfidf(JSON.stringify(tfidf));
      let recommendationCallbackCalled = false;
      let resultCallbackCalled = false;
      engine.setRecommendationCallback(
        (tokens: string[], recommendations: string[]) => {
          console.log(recommendations);
          recommendationCallbackCalled = recommendations.length > 0
        }
      );
      engine.setResultCallback((results) => {
        console.log(results);
        resultCallbackCalled = results.length > 0;
      });
      engine.setQuery("ruby no");
      expect(recommendationCallbackCalled).to.be.true//.toBeTrue();
      expect(resultCallbackCalled).to.be.true//.toBeTrue();
    });
  });
});
