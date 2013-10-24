(function() {
  goog.provide('ga_contextpopup_directive');
  goog.require('ga_permalink');
  goog.require('ga_urlutils_service');

  var module = angular.module('ga_contextpopup_directive', [
    'ga_permalink',
    'ga_urlutils_service'
  ]);

  module.directive('gaContextPopup',
      function($http, $q, $timeout, gaPermalink,
              gaUrlUtils, gaBrowserSniffer) {
          return {
            restrict: 'A',
            replace: true,
            templateUrl: 'components/contextpopup/partials/contextpopup.html',
            scope: {
              map: '=gaContextPopupMap',
              options: '=gaContextPopupOptions'
            },
            link: function(scope, element, attrs) {
              var heightUrl = gaUrlUtils.append(scope.options.heightUrl,
                  'callback=JSON_CALLBACK');
              var qrcodeUrl = scope.options.qrcodeUrl;
              // Specifying 'callback' instead of 'cb' leads to error (#754)
              var lv03tolv95Url = gaUrlUtils.append(scope.options.lv03tolv95Url,
                  'cb=JSON_CALLBACK');

              // The popup content is updated (a) on contextmenu events,
              // and (b) when the permalink is updated.

              var map = scope.map;
              var view = map.getView();

              var coord21781;
              var popoverShown = false;

              var overlay = new ol.Overlay({
                element: element[0],
                stopEvent: true
              });
              map.addOverlay(overlay);

              scope.showQR = !gaBrowserSniffer.mobile;

              var formatCoordinates = function(coord, prec) {
                return ol.coordinate.toStringXY(coord, prec).
                   replace(/\B(?=(\d{3})+(?!\d))/g, "'");
              };

              var handler = function(event) {
                event.preventDefault();

                var pixel = event.getPixel();
                coord21781 = event.getCoordinate();
                var coord4326 = ol.proj.transform(coord21781,
                    'EPSG:21781', 'EPSG:4326');
                var coord2056 = coord21781;
                //Simple reframe
                coord2056[0] = coord21781[0] + 2000000;
                coord2056[1] = coord21781[1] + 1000000;

                // recenter on phones
                if (gaBrowserSniffer.phone) {
                  var pan = ol.animation.pan({
                    duration: 200,
                    source: view.getCenter()
                  });
                  map.beforeRender(pan);
                  view.setCenter(coord21781);
                }

                scope.coord21781 = formatCoordinates(coord21781, 1);
                scope.coord4326 = formatCoordinates(coord4326, 5);
                scope.coord2056 = formatCoordinates(coord2056, 2) + ' *';
                scope.altitude = '-';

                // A digest cycle is necessary for $http requests to be
                // actually sent out. Angular-1.2.0rc2 changed the $evalSync
                // function of the $rootScope service for exactly this. See
                // Angular commit 6b91aa0a18098100e5f50ea911ee135b50680d67.
                // We use a conservative approach and call $apply ourselves
                // here, but we instead could also let $evalSync trigger a
                // digest cycle for us.
                scope.$apply(function() {

                  $http.jsonp(heightUrl, {
                    params: {
                      easting: coord21781[0],
                      northing: coord21781[1],
                      elevation_model: 'COMB'
                    }
                  }).success(function(response) {
                    scope.altitude = parseFloat(response.height);
                    console.log(scope.altitude);
                  });

                  $http.jsonp(lv03tolv95Url, {
                    params: {
                      easting: coord21781[0],
                      northing: coord21781[1]
                    }
                  }).success(function(response) {
                    console.log(response);
                    coord2056 = response.coordinates;
                    scope.coord2056 = formatCoordinates(coord2056, 2);
                    console.log(scope.coord2056);
                  });

                  updatePopupLinks();

                  view.once('change:center', function() {
                    hidePopover();
                  });

                  overlay.setPosition(coord21781);
                  console.log('show it');
                  showPopover();
   
                });

             };

              // Listen to contextmenu events from the map.
              map.on('contextmenu', handler);

              // On touch devices, display the context popup after a
              // long press (300ms)
              var startPixel, holdPromise;
              map.on('touchstart', function(event) {
                $timeout.cancel(holdPromise);
                startPixel = event.getPixel();
                holdPromise = $timeout(function() {
                  handler(event);
                }, 300, false);
              });
              map.on('touchend', function(event) {
                $timeout.cancel(holdPromise);
                startPixel = undefined;
              });
              map.on('touchmove', function(event) {
                if (startPixel) {
                  var pixel = event.getPixel();
                  var deltaX = Math.abs(startPixel[0] - pixel[0]);
                  var deltaY = Math.abs(startPixel[1] - pixel[1]);
                  if (deltaX + deltaY > 6) {
                    $timeout.cancel(holdPromise);
                    startPixel = undefined;
                  }
                }
              });

              // Listen to permalink change events from the scope.
              scope.$on('gaPermalinkChange', function(event) {
                if (angular.isDefined(coord21781) && popoverShown) {
                  updatePopupLinks();
                }
              });

              scope.hidePopover = function() {
                hidePopover();
              };

              function showPopover() {
                element.css('display', 'block');
                popoverShown = true;
              }

              function hidePopover() {
                element.css('display', 'none');
                popoverShown = false;
              }

              function updatePopupLinks() {
                var p = {
                  X: Math.round(coord21781[1], 1),
                  Y: Math.round(coord21781[0], 1)
                };

                var contextPermalink = gaPermalink.getHref(p);
                scope.contextPermalink = contextPermalink;

                scope.crosshairPermalink = gaPermalink.getHref(
                    angular.extend({crosshair: 'bowl'}, p));

                if (!gaBrowserSniffer.mobile) {
                  scope.qrcodeUrl = qrcodeUrl +
                    '?url=' +
                    escape(contextPermalink);
                }
              }

              element.on('contextmenu', 'a', function(e) {
                e.stopPropagation();
              });
            }
          };
        });

})();
