'use strict';

(function ($, mw) {

  var initGraph = function (parentElem, rootId) {

    var container = document.createElement('div');
    container.style.height = '36em';
    bodyContent.insertBefore(container, bodyContent.firstChild);

    var nodes = new mw.vis.DataSet();
    var edges = new mw.vis.DataSet();

    var network = new mw.vis.Network(container, { nodes: nodes, edges: edges}, {});
    network.on('doubleClick', function (properties) {
      if (properties.nodes.length === 1) {
        var fromId = properties.nodes[0];
        mw.wdqsGetOutgoingLinksById(fromId).apply(
          function (bindings) {
            for (var i = 0; i < bindings.length; i++) {
              var binding = bindings[i];
              var linkLabel = binding.pl.value;
              var toId = binding.o.value.substr('http://www.wikidata.org/entity/'.length);
              var toLabel = binding.ol.value;
              addLink(fromId, linkLabel, toId, toLabel);
            }
          }
        );
        mw.wdqsGetIncomingLinksById(fromId).apply(
          function (bindings) {
            for (var i = 0; i < bindings.length; i++) {
              var binding = bindings[i];
              var linkLabel = binding.pl.value;
              var toId = binding.s.value.substr('http://www.wikidata.org/entity/'.length);
              var toLabel = binding.sl.value;
              addLink(fromId, linkLabel, toId, toLabel);
            }
          }
        );
      }
    });

    var addLink = function(fromId, linkLabel, toId, toLabel) {
      if (!nodes.get(toId)) {
        nodes.add([ { id: toId, label: toLabel } ]);
      }
      edges.add([ { from: fromId, to: toId, label: linkLabel } ]);
    };

    mw.wdqsGetLabelById(rootId).apply(
      function (label) {
        nodes.add([ { id: rootId, label: label } ]);
      }
    );

  };

  var bodyContent = document.getElementById('bodyContent');

  var exploreBtn = document.createElement('button');
  exploreBtn.innerHTML = 'explore';
  exploreBtn.onclick = function() {
    bodyContent.removeChild(exploreBtn);
    var rootId = mw.config.get('wgWikibaseItemId');
    initGraph(bodyContent, rootId);
  };

  bodyContent.insertBefore(exploreBtn, bodyContent.firstChild);

})(jQuery, mediaWiki);

