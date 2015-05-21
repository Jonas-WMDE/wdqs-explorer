'use strict';

(function ($, mw) {

  var initGraph = function (parentElem, rootId) {

    var container = document.createElement('div');
    container.style.height = '36em';
    bodyContent.insertBefore(container, bodyContent.firstChild);

    var nodesMap = {};
    var edges = [];

    var network = new mw.vis.Network(container, { nodes: [], edges: []}, {});
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

    var redraw = function() {
      var nodes = [];
      for (var id in nodesMap) {
        if (nodesMap.hasOwnProperty(id)) {
          nodes.push({ id: id, label: nodesMap[id] });
        }
      }
      network.setData({ nodes: nodes, edges: edges });
    };

    var addLink = function(fromId, linkLabel, toId, toLabel) {
      nodesMap[toId] = toLabel;
      edges.push({ from: fromId, to: toId, label: linkLabel });
      redraw();
    };

    mw.wdqsGetLabelById(rootId).apply(
      function (label) {
        nodesMap[rootId] = label;
        redraw();
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

