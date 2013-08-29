(function() {
  goog.provide('ga_catalogitem_directive');

  goog.require('ga_layer_metadata_popup_service');
  goog.require('ga_map_service');

  // Utility function that look up a layer by its id from the map.
  function getMapLayer(map, id) {
    var layer;
    map.getLayers().forEach(function(l) {
      if (l.get('id') == id) {
        layer = l;
      }
    });
    return layer;
  }

  var module = angular.module('ga_catalogitem_directive', [
    'ga_layer_metadata_popup_service',
    'ga_map_service'
  ]);

  /**
   * See examples on how it can be used
   */
  module.directive('gaCatalogitem',
      ['$compile', 'gaLayers', 'gaLayerMetadataPopup',
      function($compile, gaLayers, gaLayerMetadataPopup) {

        return {
          restrict: 'A',
          replace: true,
          templateUrl: 'components/catalogtree/partials/catalogitem.html',
          scope: {
            item: '=gaCatalogitemItem',
            map: '=gaCatalogitemMap'
          },
          compile: function(tEl, tAttr) {
            var contents = tEl.contents().remove();
            var compiledContent;
            return function(scope, iEl, iAttr) {
              var layer;
              if (!compiledContent) {
                compiledContent = $compile(contents);
              }
              scope.getLegend = getLegend;
              scope.toggle = toggle;
              scope.toggleLayer = toggleLayer;
              scope.addPreviewLayer = addPreviewLayer;
              scope.removePreviewLayer = removePreviewLayer;
              scope.inPreviewMode = inPreviewMode;

              // Load any selected layer if not already on the map
              if (scope.item.children === undefined &&
                  scope.item.selectedOpen) {
                // Do this call here because we don't want it for nodes
                layer = getMapLayer(scope.map, scope.item.idBod);
                if (!angular.isDefined(layer) &&
                    angular.isDefined(gaLayers.getLayer(scope.item.idBod))) {
                  layer = gaLayers.getOlLayerById(scope.item.idBod);
                  if (angular.isDefined(layer)) {
                    scope.map.addLayer(layer);
                  }
                }
              }

              compiledContent(scope, function(clone, scope) {
                iEl.append(clone);
              });
            };
          }
        };

        function addPreviewLayer() {
          // "this" is the scope
          var item = this.item;
          var map = this.map;
          var layer = getMapLayer(map, item.idBod);
          if (!angular.isDefined(layer)) {
            // FIXME: we are super cautious here and display error messages
            // when either the layer identified by item.idBod doesn't exist
            // in the gaLayers service, or gaLayers cannot construct an ol
            // layer object for that layer.
            var error = true;
            if (angular.isDefined(gaLayers.getLayer(item.idBod))) {
              layer = gaLayers.getOlLayerById(item.idBod);
              if (angular.isDefined(layer)) {
                error = false;
                layer.preview = true;
                map.addLayer(layer);
              }
            }
            item.errorLoading = error;
          }
        }

        function removePreviewLayer() {
          // "this" is the scope
          var item = this.item;
          var map = this.map;
          var layer = getMapLayer(map, item.idBod);
          if (angular.isDefined(layer) && layer.preview) {
            layer.preview = false;
            map.removeLayer(layer);
          }
        }

        function inPreviewMode() {
          // "this" is the scope
          var item = this.item;
          var map = this.map;
          var layer = getMapLayer(map, item.idBod);
          return angular.isDefined(layer) && layer.preview;
        }

        function toggleLayer() {
          // "this" is the scope
          var item = this.item;
          var map = this.map;
          var layer = getMapLayer(map, item.idBod);
          if (!angular.isDefined(layer)) {
            // FIXME: we are super cautious here and display error messages
            // when either the layer identified by item.idBod doesn't exist
            // in the gaLayers service, or gaLayers cannot construct an ol
            // layer object for that layer.
            var error = true;
            if (angular.isDefined(gaLayers.getLayer(item.idBod))) {
              layer = gaLayers.getOlLayerById(item.idBod);
              if (angular.isDefined(layer)) {
                error = false;
                map.addLayer(layer);
              }
            }
            if (error) {
              alert('Layer not supported by gaLayers (' + item.idBod + ').');
              item.errorLoading = true;
            }
          } else {
            if (!layer.preview) {
              map.removeLayer(layer);
            } else {
              layer.preview = false;
            }
          }
        }

        function toggle(ev) {
          this.item.selectedOpen = !this.item.selectedOpen;
          ev.preventDefault();
        }

        function getLegend(ev, bodid) {
          gaLayerMetadataPopup(bodid);
          ev.stopPropagation();
        }
      }]
  );
})();
