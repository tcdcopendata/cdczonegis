/*
 * Leaflet Plugin -- FileLayer
 *
 * MIT License
 * Copyright (c) 2012 Makina Corpus
 * https://github.com/makinacorpus/Leaflet.FileLayer
 * https://github.com/mapbox/togeojson
 */
var FileLoader = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        layerOptions: {}
    },

    initialize: function(map, options) {
        this._map = map;
        L.Util.setOptions(this, options);

        this._parsers = {
            "geojson": this._loadGeoJSON,
            "gpx": this._convertToGeoJSON,
            "kml": this._convertToGeoJSON,
            "kmz": this._convertToGeoJSON
        };
    },

    load: function(file /* File */ ) {
        var fileFullName = file.name.replace(".json", ".geojson");
        // Check file extension
        var ext = fileFullName.split(".").pop().toLowerCase(),
            parser = this._parsers[ext],
            name = G.toolbox.remove(fileFullName, [".geojson", ".gpx", ".kml", ".kmz"]);
        if (!parser) {
            window.alert("Unsupported file type " + file.type + "(" + ext + ")");
            return;
        }
        // Read selected file using HTML5 File API
        if (ext == "kmz") {
            var formdata = new FormData();
            formdata.append("kmz", file);
            $.ajax({
                url: "/map/utils/unzipKmz",
                type: "post",
                data: formdata,
                processData: false,
                contentType: false
            }).done(function(results) {
                for (var result in results) {
                    var name = result + ".kml";
                    dataLoading(this, name, results[result], "kml", name);
                }
            }.bind(this));
        } else {
            var reader = new FileReader();
            reader.onload = L.Util.bind(function(e) {
                dataLoading(this, fileFullName, e.target.result, ext, name);
            }, this);
            reader.readAsText(file);
        }

        function dataLoading(loader, ffname, fcontent, fext, fname) {
            loader.fire("data:loading", {
                filename: ffname,
                format: fext
            });

            var layer = parser.call(loader, fcontent, fext, fname);
            // G.map.removeLayer(layer);

            if (fext === 'kml') {
                var bulbArea = G.io.input.bulbArea,
                    bulbRow;
                if (bulbArea.children.length == 0 || bulbArea.children[bulbArea.children.length - 1].children.length == 3) {
                    bulbRow = document.createElement("div");
                    bulbRow.className = "bulb-row";
                    bulbArea.appendChild(bulbRow);
                } else {
                    bulbRow = bulbArea.children[bulbArea.children.length - 1];
                }

                var index = G.fileLayers.length;
                var clickEvent = function() {
                    G.io.bulb(index, this);
                };
                var group = G.bulb(name, clickEvent);
                group.classList.add("active");
                bulbRow.appendChild(group);
                G.fileLayers.push(layer);

                loader.fire("data:loaded", {
                    layer: layer,
                    filename: ffname,
                    format: fext
                });
            } else {
				G.map.removeLayer(layer);
                G.modal.io.title.textContent = ffname + '--設定';
                $("#map-modal-io").modal('show');
                G.io.addLayerOptions = {
                    geojson: layer.toGeoJSON(),
                    type: 'input',
                    name: ffname,
                    options: {
                        set: function(feature, layer) {
                            var popupContent = [];
                            for (var name in feature.properties) {
                                var tempString = name + "：" + feature.properties[name];
                                popupContent.push(tempString);
                            }
                            layer.bindPopup(popupContent.join("<br>"));
                        },

                        style: function(feature, latlng) {
                            var geometryType = feature.geometry.type;
                            var styles;

                            if (geometryType === 'Point' || geometryType === 'MultiPoint') {
                                var defaultStyles = (feature.properties && feature.properties.styles) ? feature.properties.styles : "default";
                                point = (defaultStyles == "default") ? L.circleMarker(latlng, G.io.addLayerStyle.point) : L.marker(latlng, {
                                    icon: L.divIcon(defaultStyles)
                                });
                                styles = point;
                            } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
                                var defaultStyles = G.io.addLayerStyle.polyline;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                    }
                                }
                                styles = defaultStyles;
                            } else {
                                var defaultStyles = G.io.addLayerStyle.polygon;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                        if (em == "fillColor" && feature.properties.styles[em] && feature.properties.styles[em].pCode) {
                                            var pCode = feature.properties.styles[em].pCode;
                                            defaultStyles[em] = G.pattern.list[pCode];
                                        }
                                    }
                                }
                                styles = defaultStyles;
                            }
                            return styles;
                        }
                    }
                };
            }
        }
    },
	loadurl: function(result, ext, name /* geojson */ ) {
		var parser = this._parsers[ext];		
		dataLoading(this, name, result, ext, name);      

        function dataLoading(loader, ffname, fcontent, fext, fname) {
            loader.fire("data:loading", {
                filename: ffname,
                format: fext
            });

            var layer = parser.call(loader, fcontent, fext, fname);
            // G.map.removeLayer(layer);

            if (fext === 'kml') {
                var bulbArea = G.io.input.bulbArea,
                    bulbRow;
                if (bulbArea.children.length == 0 || bulbArea.children[bulbArea.children.length - 1].children.length == 3) {
                    bulbRow = document.createElement("div");
                    bulbRow.className = "bulb-row";
                    bulbArea.appendChild(bulbRow);
                } else {
                    bulbRow = bulbArea.children[bulbArea.children.length - 1];
                }

                var index = G.fileLayers.length;
                var clickEvent = function() {
                    G.io.bulb(index, this);
                };
                var group = G.bulb(name, clickEvent);
                group.classList.add("active");
                bulbRow.appendChild(group);
                G.fileLayers.push(layer);

                loader.fire("data:loaded", {
                    layer: layer,
                    filename: ffname,
                    format: fext
                });
            } else {
				G.map.removeLayer(layer);
                G.modal.io.title.textContent = ffname + '--設定';
                $("#map-modal-io").modal('show');
                G.io.addLayerOptions = {
                    geojson: layer.toGeoJSON(),
                    type: 'input',
                    name: ffname,
                    options: {
                        set: function(feature, layer) {
                            var popupContent = [];
                            for (var name in feature.properties) {
                                var tempString = name + "：" + feature.properties[name];
                                popupContent.push(tempString);
                            }
                            layer.bindPopup(popupContent.join("<br>"));
                        },

                        style: function(feature, latlng) {
                            var geometryType = feature.geometry.type;
                            var styles;

                            if (geometryType === 'Point' || geometryType === 'MultiPoint') {
                                var defaultStyles = (feature.properties && feature.properties.styles) ? feature.properties.styles : "default";
                                point = (defaultStyles == "default") ? L.circleMarker(latlng, G.io.addLayerStyle.point) : L.marker(latlng, {
                                    icon: L.divIcon(defaultStyles)
                                });
                                styles = point;
                            } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
                                var defaultStyles = G.io.addLayerStyle.polyline;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                    }
                                }
                                styles = defaultStyles;
                            } else {
                                var defaultStyles = G.io.addLayerStyle.polygon;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                        if (em == "fillColor" && feature.properties.styles[em] && feature.properties.styles[em].pCode) {
                                            var pCode = feature.properties.styles[em].pCode;
                                            defaultStyles[em] = G.pattern.list[pCode];
                                        }
                                    }
                                }
                                styles = defaultStyles;
                            }
                            return styles;
                        }
                    }
                };
            }
        }
    },
	_setStyle:function(data,ffname){
		G.modal.io.title.textContent = ffname + '--設定';
                $("#map-modal-io").modal('show');
                G.io.addLayerOptions = {
                    geojson: data,
                    type: 'input',
                    name: ffname,
                    options: {
                        set: function(feature, layer) {
                            var popupContent = [];
                            for (var name in feature.properties) {
                                var tempString = name + "：" + feature.properties[name];
                                popupContent.push(tempString);
                            }
                            layer.bindPopup(popupContent.join("<br>"));
                        },

                        style: function(feature, latlng) {
                            var geometryType = feature.geometry.type;
                            var styles;

                            if (geometryType === 'Point' || geometryType === 'MultiPoint') {
                                var defaultStyles = (feature.properties && feature.properties.styles) ? feature.properties.styles : "default";
                                point = (defaultStyles == "default") ? L.circleMarker(latlng, G.io.addLayerStyle.point) : L.marker(latlng, {
                                    icon: L.divIcon(defaultStyles)
                                });
                                styles = point;
                            } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
                                var defaultStyles = G.io.addLayerStyle.polyline;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                    }
                                }
                                styles = defaultStyles;
                            } else {
                                var defaultStyles = G.io.addLayerStyle.polygon;
                                if (feature.properties.styles) {
                                    for (var em in feature.properties.styles) {
                                        defaultStyles[em] = feature.properties.styles[em];
                                        if (em == "fillColor" && feature.properties.styles[em] && feature.properties.styles[em].pCode) {
                                            var pCode = feature.properties.styles[em].pCode;
                                            defaultStyles[em] = G.pattern.list[pCode];
                                        }
                                    }
                                }
                                styles = defaultStyles;
                            }
                            return styles;
                        }
                    }
                };
	},

    _loadGeoJSON: function(content, format, name) {
        if (typeof content == 'string') {
            content = JSON.parse(content);
        }

        var rColor = G.color.random();
        var layer = L.geoJson(content, {
            onEachFeature: function(feature, layer) {
                var popupContent = [];

                if (format == "geojson") {
                    for (var name in feature.properties) {
                        if (name != "styles") {
                            var tempString = name + "：" + feature.properties[name];
                            popupContent.push(tempString);
                        }
                    }
                } else {
                    for (var name in feature.properties) {
                        var tempString = name + "：" + feature.properties[name];
                        popupContent.push(tempString);
                    }
                }

                layer.bindPopup(popupContent.join("<br>"));
            },
            style: function(feature, layer) {
                var defaultStyles;

                if (format == "geojson") {
                    defaultStyles = {
                        color: rColor,
                        weight: 2,
                        opacity: 1,
                        fillColor: rColor,
                        fillOpacity: 0.4,
                        dashArray: 0,
                        clickable: true
                    };
                    var styles = feature.properties.styles;
                    if (styles) {
                        for (var em in styles) {
                            defaultStyles[em] = styles[em];
                            if (em == "fillColor" && styles[em] && styles[em].pCode) {
                                var pCode = styles[em].pCode;
                                defaultStyles[em] = G.pattern.list[pCode];
                            }
                        }
                    }
                } else if (format == "kml") {
                    defaultStyles = {
                        color: "#FF9800",
                        weight: 2,
                        opacity: 1,
                        fillColor: "#FF9800",
                        fillOpacity: 0.4,
                        dashArray: 0,
                        clickable: true
                    };
                    if (feature.styles.styleHash) {
                        var styleHash = feature.styles.styleHash;
                        if (styleHash.IconStyle) {
                            if (styleHash.IconStyle.color) {
                                var bgColor = styleHash.IconStyle.color;
                                var alpha = parseInt(bgColor.slice(0, 2), 16) / 255,
                                    blue = bgColor.slice(2, 4),
                                    green = bgColor.slice(4, 6),
                                    red = bgColor.slice(6, 8);
                                defaultStyles.color = "#" + red + green + blue;
                                defaultStyles.fillColor = "#" + red + green + blue;
                                defaultStyles.fillOpacity = alpha;
								defaultStyles.backgroundColor = "#" + red + green + blue;
                            }
                        }
						if (styleHash.LineStyle) {
                            if (styleHash.LineStyle.color) {
                                var bgColor = styleHash.LineStyle.color;
                                var alpha = parseInt(bgColor.slice(0, 2), 16) / 255,
                                    blue = bgColor.slice(2, 4),
                                    green = bgColor.slice(4, 6),
                                    red = bgColor.slice(6, 8);
                                defaultStyles.color = "#" + red + green + blue;
                                defaultStyles.opacity = alpha;
                            }
                            if (styleHash.LineStyle.width) {
                                defaultStyles.weight = styleHash.LineStyle.width;
                            }
                        }
                        if (styleHash.PolyStyle) {
                            if (styleHash.PolyStyle.color) {
                                var bgColor = styleHash.PolyStyle.color;
                                var alpha = parseInt(bgColor.slice(0, 2), 16) / 255,
                                    blue = bgColor.slice(2, 4),
                                    green = bgColor.slice(4, 6),
                                    red = bgColor.slice(6, 8);
                                defaultStyles.fillColor = "#" + red + green + blue;
                                defaultStyles.fillOpacity = alpha;
                            }
                        }
                    }
                } else if (format == "gpx") {
                    defaultStyles = {
                        color: "#E91E63",
                        weight: 2,
                        opacity: 1,
                        fillColor: "#E91E63",
                        fillOpacity: 0.4,
                        dashArray: 0,
                        clickable: true
                    };
                }
                return defaultStyles;
            },
            pointToLayer: function(feature, latlng) {
                var point;
                if (format == "geojson") {
                    var styles = (feature.properties && feature.properties.styles) ? feature.properties.styles : "default";
                    point = (styles == "default") ? L.circleMarker(latlng, {
                        radius: 3
                    }) : L.marker(latlng, {
                        icon: L.divIcon(styles)
                    });
                } else if (format == "kml") {
                    if (feature.styles && feature.styles.styleHash && feature.styles.styleHash.IconStyle) {
                        var iconUrl = feature.styles.styleHash.IconStyle.Icon,
                            iconAnchor = feature.styles.styleHash.IconStyle.hotSpot,
                            iconSize = feature.styles.styleHash.IconStyle.size,
                            scale = (feature.styles.styleHash.IconStyle.scale) ? feature.styles.styleHash.IconStyle.scale: 1.0,
                            x = (iconAnchor) ? iconAnchor.x * scale : 0,
                            y = (iconAnchor) ? iconAnchor.y * scale : 0,
                            size = (iconSize) ? [iconSize[0] * scale, iconSize[1] * scale]: [36, 36];

                        point = new L.Marker(latlng, {
                            icon: L.icon({
                                iconSize: size,
                                iconAnchor: [x, Number(y) + size[1]],
                                iconUrl: iconUrl
                            })
                        });
                    } else {
                        point = L.marker(latlng);
                    }
                } else if (format == "gpx") {
                    point = L.marker(latlng);
                }
                return point;
            }
        }).addTo(this._map);

        return layer;
    },

    _convertToGeoJSON: function(content, format, name) {
        // Format is either "gpx" or "kml"
        if (typeof content == "string") {
            //xsi:schemaLocation parser error
            content = content.replace("xsi:schemaLocation", "xsischemaLocation");
            content = (new window.DOMParser()).parseFromString(content, "text/xml");
        }
        var geojson = this._toGeoJSON[format](content, {
            stylemaps: true,
            styles: true
        });
        return this._loadGeoJSON(geojson, format, name);
    },

    _toGeoJSON: (function() {
        'use strict';

        var removeSpace = (/\s*/g),
            trimSpace = (/^\s*|\s*$/g),
            splitSpace = (/\s+/);
        // generate a short, numeric hash of a string
        function okhash(x) {
            if (!x || !x.length) return 0;
            for (var i = 0, h = 0; i < x.length; i++) {
                h = ((h << 5) - h) + x.charCodeAt(i) | 0;
            }
            return h;
        }
        // all Y children of X
        function get(x, y) {
            return x.getElementsByTagName(y);
        }

        function attr(x, y) {
            return x.getAttribute(y);
        }

        function attrf(x, y) {
            return parseFloat(attr(x, y));
        }
        // one Y child of X, if any, otherwise null
        function get1(x, y) {
            var n = get(x, y);
            return n.length ? n[0] : null;
        }
        // cast array x into numbers
        function numarray(x) {
            for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
            return o;
        }

        function clean(x) {
            var o = {};
            for (var i in x)
                if (x[i]) o[i] = x[i];
            return o;
        }
        // get the content of a text node, if any
        function nodeVal(x) {
            return x && x.firstChild && x.firstChild.nodeValue;
        }
        // get one coordinate from a coordinate array, if any
        function coord1(v) {
            return numarray(v.replace(removeSpace, '').split(','));
        }
        // get all coordinates from a coordinate array as [[],[]]
        function coord(v) {
            var coords = v.replace(trimSpace, '').split(splitSpace),
                o = [];
            for (var i = 0; i < coords.length; i++) {
                o.push(coord1(coords[i]));
            }
            return o;
        }

        // create a new feature collection parent object
        function fc() {
            return {
                type: "FeatureCollection",
                features: []
            };
        }

        var t = {
            kml: function(doc, o) {
                o = o || {};

                var gj = fc(),
                    // styleindex keeps track of hashed styles in order to match features
                    stylemapIndex = {},
                    styleIndex = {},
                    // atomic geospatial types supported by KML - MultiGeometry is
                    // handled separately
                    geotypes = ["Polygon", "LineString", "Point"],
                    // all root placemarks in the file
                    placemarks = get(doc, "Placemark"),
                    stylemaps = get(doc, "StyleMap"),
                    styles = get(doc, "Style");

                var imgSize = {};

                if (o.stylemaps)
                    for (var i = 0, imax = stylemaps.length; i < imax; i++) {
                        var pair = stylemaps[i].children,
                            stylemap = {};
                        stylemapIndex["#" + stylemaps[i].id] = stylemap;
                        for (var j = 0, jmax = pair.length; j < jmax; j++) {
                            var nodeName = pair[j].nodeName + j,
                                element = pair[j].children;
                            stylemap[nodeName] = {};
                            for (var k = 0, kmax = element.length; k < kmax; k++) {
                                var _nodeName = element[k].nodeName,
                                    _nodeValue = nodeVal(element[k]);
                                stylemap[nodeName][_nodeName] = _nodeValue;
                            }
                        }
                    }
                if (o.styles)
                    for (var i = 0; i < styles.length; i++) {
                        //styleIndex["#" + styles[i].id] = okhash(styles[i].innerHTML).toString(16);
                        var type = styles[i].children,
                            style = {};
                        styleIndex["#" + styles[i].id] = style;
                        for (var j = 0, jmax = type.length; j < jmax; j++) {
                            var nodeName = type[j].nodeName,
                                element = type[j].children;
                            style[nodeName] = {};
                            for (var k = 0, kmax = element.length; k < kmax; k++) {
                                var _nodeName = element[k].nodeName,
                                    _nodeValue;
                                switch (_nodeName) {
                                    case "Icon":
                                        _nodeValue = nodeVal(element[k].children[0]);
                                        break;
                                    case "hotSpot":
                                        _nodeValue = {
                                            x: attr(element[k], "x"),
                                            y: attr(element[k], "y")
                                        };
                                        break;
                                    default:
                                        _nodeValue = nodeVal(element[k]);
                                        break;
                                }
                                style[nodeName][_nodeName] = _nodeValue;
                            }

                            if (style[nodeName].Icon) {
                                var iconAnchor = style[nodeName].hotSpot,
                                    x = (iconAnchor) ? iconAnchor.x : 0,
                                    y = (iconAnchor) ? iconAnchor.y : 0,
                                    size;

								style[nodeName].hotSpot = {x: x, y: y};
								
                                var iconUrl = style[nodeName].Icon;
                                // 針對氣象局颱風路徑KMZ內的圖片
                                if (iconUrl == "typhoon-position.png"  || iconUrl == "typhoon.png"){
                                    iconUrl = "http://www.geologycloud.tw/map/images/" +  iconUrl;
                                    style[nodeName].Icon = iconUrl;
									x = 20;
                                    y = -18.5;
                                }

                                var iconUrlDecode = decodeURIComponent(iconUrl);
								
								if (!imgSize[iconUrlDecode]) {
                                    $.ajax({
                                        url: "/map/utils/imgSize?url=" + encodeURIComponent(iconUrlDecode),
                                        async: false,
                                        dataType: "json"
                                    }).done(function(img) {
                                        var width = Number(img.width),
                                            height = Number(img.height);
                                        // if (width >= 36 || height >= 36) {
                                        //     if (width > height) {
                                        //         size = [36, 36 * height / width];
                                        //         x = 36 * x / width;
                                        //         y = 36 * y / width;
                                        //     } else {
                                        //         size = [36 * width / height, 36];
                                        //         x = 36 * x / height;
                                        //         y = 36 * y / height;
                                        //     }
                                        // } else {
                                        //     size = [width, height]
                                        // }
                                        size = [width, height];

                                        imgSize[iconUrlDecode] = {};
                                        style[nodeName].size = size;
                                        imgSize[iconUrlDecode].size = size;
                                        style[nodeName].hotSpot.x = x;
                                        imgSize[iconUrlDecode].x = x;
                                        style[nodeName].hotSpot.y = y;
                                        imgSize[iconUrlDecode].y = y;
                                    });
                                } else {
                                    style[nodeName].size = imgSize[iconUrlDecode].size;
                                    style[nodeName].hotSpot.x = imgSize[iconUrlDecode].x;
                                    style[nodeName].hotSpot.y = imgSize[iconUrlDecode].y;
                                }
                            }
                        }
                    }
                for (var j = 0; j < placemarks.length; j++) {
                    gj.features = gj.features.concat(getPlacemark(placemarks[j]));
                }

                function getGeometry(root) {
                    var geomNode, geomNodes, i, j, k, geoms = [];
                    if (get1(root, "MultiGeometry")) return getGeometry(get1(root, "MultiGeometry"));
                    for (i = 0; i < geotypes.length; i++) {
                        geomNodes = get(root, geotypes[i]);
                        if (geomNodes) {
                            for (j = 0; j < geomNodes.length; j++) {
                                geomNode = geomNodes[j];
                                if (geotypes[i] == "Point") {
                                    geoms.push({
                                        type: "Point",
                                        coordinates: coord1(nodeVal(get1(geomNode, "coordinates")))
                                    });
                                } else if (geotypes[i] == "LineString") {
                                    geoms.push({
                                        type: "LineString",
                                        coordinates: coord(nodeVal(get1(geomNode, "coordinates")))
                                    });
                                } else if (geotypes[i] == "Polygon") {
                                    var rings = get(geomNode, "LinearRing"),
                                        coords = [];
                                    for (k = 0; k < rings.length; k++) {
                                        coords.push(coord(nodeVal(get1(rings[k], "coordinates"))));
                                    }
                                    geoms.push({
                                        type: "Polygon",
                                        coordinates: coords
                                    });
                                }
                            }
                        }
                    }
                    return geoms;
                }

                function getPlacemark(root) {
                    var geoms = getGeometry(root),
                        i, properties = {},
                        styles = {},
                        name = nodeVal(get1(root, "name")),
                        //styleUrl = nodeVal(get1(root, "styleUrl")),
                        styleUrl = nodeVal(get1(root, "styleUrl")),
                        description = nodeVal(get1(root, "description")),
                        extendedData = get1(root, "ExtendedData");

                    if (!geoms.length) return false;
                    if (name) properties.name = name;
                    //style
                    if (styleUrl) {
                        //styleUrl
                        if (styleIndex[styleUrl]) {
                            styles.styleUrl = styleUrl;
                            styles.styleHash = styleIndex[styleUrl];
                        } else if (styleIndex["#" + styleUrl]){ // 沒有#的style id
                            styles.styleUrl = styleUrl;
                            styles.styleHash = styleIndex["#" + styleUrl];
                        } else if (stylemapIndex[styleUrl]) {
                            var indexId;
                            styles.styleUrl = styleUrl;
                            for (var key in stylemapIndex[styleUrl]) {
                                if (stylemapIndex[styleUrl][key]["key"] === "normal")
                                    indexId = stylemapIndex[styleUrl][key]["styleUrl"];
                            }
                            styles.styleHash = styleIndex[indexId];
                        }
                    }


                    if (description) properties.description = description;
                    if (extendedData) {
                        var data = get(extendedData, "Data"),
                            simpleData = get(extendedData, "SimpleData");

                        for (i = 0; i < data.length; i++) {
                            properties[data[i].getAttribute("name")] = nodeVal(get1(data[i], "value"));
                        }
                        for (i = 0; i < simpleData.length; i++) {
                            properties[simpleData[i].getAttribute("name")] = nodeVal(simpleData[i]);
                        }
                    }
                    return [{
                        type: "Feature",
                        geometry: (geoms.length === 1) ? geoms[0] : {
                            type: "GeometryCollection",
                            geometries: geoms
                        },
                        properties: properties,
                        styles: styles
                    }];
                }
                return gj;
            },
            gpx: function(doc, o) {
                var i,
                    tracks = get(doc, "trk"),
                    routes = get(doc, "rte"),
                    waypoints = get(doc, "wpt"),
                    // a feature collection
                    gj = fc();
                for (i = 0; i < tracks.length; i++) {
                    gj.features.push(getLinestring(tracks[i], "trkpt"));
                }
                for (i = 0; i < routes.length; i++) {
                    gj.features.push(getLinestring(routes[i], "rtept"));
                }
                for (i = 0; i < waypoints.length; i++) {
                    gj.features.push(getPoint(waypoints[i]));
                }

                function getLinestring(node, pointname) {
                    var j, pts = get(node, pointname),
                        line = [];
                    for (j = 0; j < pts.length; j++) {
                        line.push([attrf(pts[j], "lon"), attrf(pts[j], "lat")]);
                    }
                    return {
                        type: "Feature",
                        properties: getProperties(node),
                        geometry: {
                            type: "LineString",
                            coordinates: line
                        }
                    };
                }

                function getPoint(node) {
                    var prop = getProperties(node);
                    prop["ele"] = nodeVal(get1(node, "ele"));
                    prop["sym"] = nodeVal(get1(node, "sym"));
                    return {
                        type: "Feature",
                        properties: prop,
                        geometry: {
                            type: "Point",
                            coordinates: [attrf(node, "lon"), attrf(node, "lat")]
                        }
                    };
                }

                function getProperties(node) {
                    var meta = ["name", "desc", "author", "copyright", "link",
                            "time", "keywords"
                        ],
                        prop = {},
                        k;
                    for (k = 0; k < meta.length; k++) {
                        prop[meta[k]] = nodeVal(get1(node, meta[k]));
                    }
                    return clean(prop);
                }
                return gj;
            }
        };
        return t;
    }())
});

L.Control.FileLayerLoad = L.Control.extend({
    options: {
        position: "topright",
        fitBounds: true,
        layerOptions: {}
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
        this.loader = null;
    },

    onAdd: function(map) {
        this.loader = new FileLoader(map, {
            layerOptions: this.options.layerOptions
        });

        this.loader.on('data:loaded', function(e) {
            // Fit bounds after loading
            if (this.options.fitBounds) {
                window.setTimeout(function() {
                    var bounds = e.layer.getBounds(),
                        southWest = bounds._southWest,
                        northEast = bounds._northEast;
                    if (southWest.distanceTo(northEast) === 0) {
                        map.setView(southWest, 14);
                    } else {
                        map.fitBounds(e.layer.getBounds()).zoomOut();
                    }
                }, 500);
            }
        }, this);

        // Initialize Drag-and-drop
        this._initDragAndDrop(map);

        // Initialize map control
        return this._initContainer();
    },

    _initDragAndDrop: function(map) {
        var fileLoader = this.loader,
            dropbox = map._container;

        var callbacks = {
            dragenter: function() {
                map.scrollWheelZoom.disable();
            },
            dragleave: function() {
                map.scrollWheelZoom.enable();
            },
            dragover: function(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            drop: function(e) {
                e.stopPropagation();
                e.preventDefault();
				var getDataString={};

                //for local file drag
                var files = Array.prototype.slice.apply(e.dataTransfer.files),
                    i = files.length;
                if (files.length > 0) {
                    setTimeout(function() {
                        fileLoader.load(files.shift());
                        if (files.length > 0) {
                            setTimeout(arguments.callee, 25);
                        }
                    }, 25);
                }
                
                else if (e.dataTransfer.types[0] === "text/plain") {							
					var urlData = e.dataTransfer.getData("URL");
					if (urlData) {//for url drag//字串進來是網址
						getDataString.type = "url";
						getDataString.string = urlData ;
						//var tmpA = urlData.toString().match(/.*\/(.+?)\./); 
						getDataString.filename = urlData.substring(urlData.lastIndexOf('/') + 1);
						getDataString.filetype = urlData.substring(urlData.lastIndexOf('.') + 1);
						if(getDataString.filetype == "geojson" ||getDataString.filetype == "json"){
							$.ajax({
								url: "/proxy?" + getDataString.string,
								async: true,
								dataType: "text"
							}).done(function(result) {
								 setTimeout(function() {
									 fileLoader.loadurl(result, "geojson", getDataString.filename);									
								}, 25);
							});
						}
					}
					else{//for dom drag			
						var data = e.dataTransfer.getData("text").split(","),
							target = $("#" + data[0]);
						switch (data[1]) {
							case "extraData":
								G.extradata.dragLayerOpen(e);
								break;
							case "extraFolder":
								G.extradata.dragFolderOpen(e);
								break;
						}
					}
                }
				
                map.scrollWheelZoom.enable();
            }
        };
        for (var name in callbacks)
            dropbox.addEventListener(name, callbacks[name], false);
    },

    _initContainer: function() {
        // Create an invisible file input 
        var fileInput = L.DomUtil.create("input");
        fileInput.type = "file";
        fileInput.accept = ".gpx,.kml,.kmz,.json,.geojson";
        fileInput.style.display = "none";
        // Load on file change
        var fileLoader = this.loader;
        fileInput.addEventListener("change", function(e) {
            fileLoader.load(this.files[0]);
        }, false);

        var zoomName = "leaflet-control-filelayer",
            container = L.DomUtil.create("div", zoomName);

        if (this.options.inputFile) {
            var link = L.DomUtil.get(this.options.inputFile),
                stop = L.DomEvent.stopPropagation;
            L.DomEvent
                .on(link, "click", stop)
                .on(link, "mousedown", stop)
                .on(link, "dblclick", stop)
                .on(link, "click", L.DomEvent.preventDefault)
                .on(link, "click", function(e) {
                    fileInput.click();
                    e.preventDefault();
                });
        }
        return container;
    }
});

L.Control.fileLayerLoad = function(options) {
    return new L.Control.FileLayerLoad(options);
};