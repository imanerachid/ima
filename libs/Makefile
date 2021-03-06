###################################################
#                CesiumJS
###################################################

# This has just to be done if the submodule
# has never been checked out before
cesium/.git:
	git submodule init && git submodule update

cesium/node_modules: cesium/.git
	cd cesium/; \
	npm install;

cesium/Build/Cesium/Cesium.js: cesium/node_modules
	cd cesium/; \
	npm run combineRelease; \
	npm run minifyRelease; \

.PHONY: build-cesium
build-cesium: cesium/Build/Cesium/Cesium.js

.PHONY: clean-cesium
clean-cesium:
	@echo "Cleaning Cesium..."
	rm -rf cesium/node_modules/ && \
	rm -rf cesium/Build/ 

###################################################
#                OpenLayers
###################################################

# This has just to be done if the submodule
# has never been checked out before
openlayers/.git:
	git submodule init && git submodule update

openlayers/node_modules: openlayers/.git
	cd openlayers/; \
	npm install;

openlayers/build/legacy/ol.js: openlayers/node_modules
	cd openlayers/; \
	npm run build-legacy;

openlayers/build/legacy/ol-debug.js: openlayers/node_modules
	cd openlayers/; \
	webpack-cli --mode=development --config config/webpack-config-legacy-build.js --output-filename ol-debug.js

.PHONY: build-openlayers
build-openlayers: openlayers/build/legacy/ol.js \
                  openlayers/build/legacy/ol-debug.js
	# cleanup after build, otherwise repo is modified
	rm -f openlayers/package-lock.json

.PHONY: clean-openlayers
clean-openlayers:
	@echo "Cleaning openlayers..."
	rm -rf openlayers/node_modules; \
	rm -rf openlayers/build;

###################################################
#                 OL-Cesium
###################################################

.PHONY: copy-olcesium-plugins
copy-olcesium-plugins:
	cp -r olcesium-plugin/Ga* ol-cesium/src/olcs/; \
	cp olcesium-plugin/index.library.js ol-cesium/src/; \

# This has just to be done if the submodule
# has never been checked out before
ol-cesium/.git:
	git submodule init && git submodule update

# Steps to build olcesium.js and olcesium-debug.js
ol-cesium/node_modules/: ol-cesium/.git
	cd ol-cesium && npm install

ol-cesium/dist/olcesium.js: ol-cesium/node_modules/ \
                            copy-olcesium-plugins
	cd ol-cesium && npm run build-library

ol-cesium/dist/olcesium-debug.js: ol-cesium/node_modules/ \
                                  copy-olcesium-plugins
	cd ol-cesium && npm run build-library-debug

.PHONY: build-ol-cesium
build-ol-cesium: ol-cesium/dist/olcesium.js \
                 ol-cesium/dist/olcesium-debug.js
	# cleanup after build, otherwise repo is modified
	cd ol-cesium; \
	rm src/olcs/Ga*; \
	git reset --hard;

.PHONY: clean-ol-cesium
clean-ol-cesium:
	@echo "Cleaning ol-cesium..."
	rm -rf ol-cesium/node_modules/ && \
	rm -rf ol-cesium/dist/ 


###################################################
#                 Globals
###################################################

# Build all libraries
.PHONY: all
all: build-openlayers \
     build-cesium \
     build-ol-cesium

.PHONY: clean
clean: clean-openlayers \
       clean-cesium \
       clean-ol-cesium
	@echo "Cleanup finished!"

