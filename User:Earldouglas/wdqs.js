'use strict';

(function ($, mw) {

  var id = function (x) {
    return x;
  };

  var future = function(f) {
    return {
      apply: function (k) {
        if (k === undefined) {
          return f(id);
        } else {
          return f(k);
        }
      },
      map: function (g) {
        return future (function (k) {
          return f(function (x) {
            return k(g(x));
          });
        });
      },
      flatMap: function (g) {
        return future (function (k) {
          return f(function (x) {
            return g(x).apply(k);
          });
        });
      }
    };
  };

  mw.wdqsQuery = function (query) {
    return future(function (k) {
      $.ajax({
        url: '//wdqs-beta.wmflabs.org/bigdata/namespace/wdq/sparql',
        data: { query: query },
        dataType: 'json',
        success: function (x) { return k(x.results.bindings); }
      });
    });
  };

  mw.wdqsGetIncomingLinks = function (uri) {
    return mw.wdqsQuery(
      'SELECT ?s ?sl ?p ?pl WHERE {' +
      '  ?s ?p ' + uri + ' .' +
      '  ?s <http://www.w3.org/2000/01/rdf-schema#label> ?sl .' +
      '  FILTER ( LANG(?sl) = "en" )' +
      '  ?s <http://wikiba.se/ontology#directClaim> ?p .' +
      '  ?s rdfs:label ?pl .' +
      '  FILTER ( LANG(?pl) = "en" )' +
      '} LIMIT 20'
    );
  };

  mw.wdqsGetIncomingLinksById = function (qid) {
    return mw.wdqsGetIncomingLinks('<http://www.wikidata.org/entity/' + qid + '>');
  };

  mw.wdqsGetOutgoingLinks = function (uri) {
    return mw.wdqsQuery(
      'SELECT ?p ?pl ?o ?ol WHERE {' +
      '  ' + uri + ' ?p ?o .' +
      '  ?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .' +
      '  FILTER ( LANG(?ol) = "en" )' +
      '  ?s <http://wikiba.se/ontology#directClaim> ?p .' +
      '  ?s rdfs:label ?pl .' +
      '  FILTER ( LANG(?pl) = "en" )' +
      '} LIMIT 20'
    );
  };

  mw.wdqsGetOutgoingLinksById = function (qid) {
    return mw.wdqsGetOutgoingLinks('<http://www.wikidata.org/entity/' + qid + '>');
  };

  mw.wdqsGetLabel = function (uri) {
    return mw.wdqsQuery(
      'SELECT ?sl WHERE {' +
      '  ' + uri + ' <http://www.w3.org/2000/01/rdf-schema#label> ?sl .' +
      '  FILTER ( LANG(?sl) = "en" )' +
      '} LIMIT 1'
    );
  };

  mw.wdqsGetLabelById = function (qid) {
    return mw.wdqsGetLabel('<http://www.wikidata.org/entity/' + qid + '>').map(
      function (bindings) {
        if (bindings.length === 1 &&
            bindings[0].sl &&
            bindings[0].sl.value) {
          return bindings[0].sl.value;
        } else {
          return '(unlabeled)';
        }
      }
    );
  };

})(jQuery, mediaWiki);

