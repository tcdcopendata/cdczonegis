// https://github.com/bbecquet/Leaflet.PolylineDecorator
// utilty for polylinedecorator
L.LineUtil.PolylineDecorator = {
    computeAngle: function (a, b) {
        return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI) + 90;
    },

    getPointPathPixelLength: function (pts) {
        var nbPts = pts.length;
        if (nbPts < 2) {
            return 0;
        }
        var dist = 0,
            prevPt = pts[0],
            pt;
        for (var i = 1; i < nbPts; i++) {
            dist += prevPt.distanceTo(pt = pts[i]);
            prevPt = pt;
        }
        return dist;
    },

    getPixelLength: function (pl, map) {
        var ll = (pl instanceof L.Polyline) ? pl.getLatLngs() : pl,
            nbPts = ll.length;
        if (nbPts < 2) {
            return 0;
        }
        var dist = 0,
            prevPt = map.project(ll[0]), pt;
        for (var i = 1; i < nbPts; i++) {
            dist += prevPt.distanceTo(pt = map.project(ll[i]));
            prevPt = pt;
        }
        return dist;
    },

    /**
    * path: array of L.LatLng
    * offsetRatio: the ratio of the total pixel length where the pattern will start
    * repeatRatio: the ratio of the total pixel length between two points of the pattern 
    * map: the map, to access the current projection state
    */
    projectPatternOnPath: function (path, offsetRatio, repeatRatio, map) {
        var pathAsPoints = [], i;
        for (i = 0, l = path.length; i < l; i++) {
            pathAsPoints[i] = map.project(path[i]);
        }
        // project the pattern as pixel points
        var pattern = this.projectPatternOnPointPath(pathAsPoints, offsetRatio, repeatRatio);
        // and convert it to latlngs;
        for (i = 0, l = pattern.length; i < l; i++) {
            pattern[i].latLng = map.unproject(pattern[i].pt);
        }
        return pattern;
    },

    projectPatternOnPointPath: function (pts, offsetRatio, repeatRatio) {
        var positions = [];
        // 1. compute the absolute interval length in pixels
        var repeatIntervalLength = this.getPointPathPixelLength(pts) * repeatRatio;
        // 2. find the starting point by using the offsetRatio
        var previous = this.interpolateOnPointPath(pts, offsetRatio);
        positions.push(previous);
        if (repeatRatio > 0) {
            // 3. consider only the rest of the path, starting at the previous point
            var remainingPath = pts;
            remainingPath = remainingPath.slice(previous.predecessor);
            remainingPath[0] = previous.pt;
            var remainingLength = this.getPointPathPixelLength(remainingPath);
            // 4. project as a ratio of the remaining length,
            // and repeat while there is room for another point of the pattern
            while (repeatIntervalLength <= remainingLength) {
                previous = this.interpolateOnPointPath(remainingPath, repeatIntervalLength / remainingLength);
                positions.push(previous);
                remainingPath = remainingPath.slice(previous.predecessor);
                remainingPath[0] = previous.pt;
                remainingLength = this.getPointPathPixelLength(remainingPath);
            }
        }
        return positions;
    },

    /**
    * pts: array of L.Point
    * ratio: the ratio of the total length where the point should be computed
    * Returns null if ll has less than 2 LatLng, or an object with the following properties:
    *    latLng: the LatLng of the interpolated point
    *    predecessor: the index of the previous vertex on the path
    *    heading: the heading of the path at this point, in degrees
    */
    interpolateOnPointPath: function (pts, ratio) {
        var nbVertices = pts.length;

        if (nbVertices < 2) {
            return null;
        }
        // easy limit cases: ratio negative/zero => first vertex
        if (ratio <= 0) {
            return {
                pt: pts[0],
                predecessor: 0,
                heading: this.computeAngle(pts[0], pts[1])
            };
        }
        // ratio >=1 => last vertex
        if (ratio >= 1) {
            return {
                pt: pts[nbVertices - 1],
                predecessor: nbVertices - 1,
                heading: this.computeAngle(pts[nbVertices - 2], pts[nbVertices - 1])
            };
        }
        // 1-segment-only path => direct linear interpolation
        if (nbVertices == 2) {
            return {
                pt: this.interpolateBetweenPoints(pts[0], pts[1], ratio),
                predecessor: 0,
                heading: this.computeAngle(pts[0], pts[1])
            };
        }

        var pathLength = this.getPointPathPixelLength(pts);
        var a = pts[0], b = a,
            ratioA = 0, ratioB = 0,
            distB = 0;
        // follow the path segments until we find the one
        // on which the point must lie => [ab] 
        var i = 1;
        for (; i < nbVertices && ratioB < ratio; i++) {
            a = b;
            ratioA = ratioB;
            b = pts[i];
            distB += a.distanceTo(b);
            ratioB = distB / pathLength;
        }

        // compute the ratio relative to the segment [ab]
        var segmentRatio = (ratio - ratioA) / (ratioB - ratioA);

        return {
            pt: this.interpolateBetweenPoints(a, b, segmentRatio),
            predecessor: i - 2,
            heading: this.computeAngle(a, b)
        };
    },

    /**
    * Finds the point which lies on the segment defined by points A and B,
    * at the given ratio of the distance from A to B, by linear interpolation. 
    */
    interpolateBetweenPoints: function (ptA, ptB, ratio) {
        if (ptB.x != ptA.x) {
            return new L.Point(
                (ptA.x * (1 - ratio)) + (ratio * ptB.x),
                (ptA.y * (1 - ratio)) + (ratio * ptB.y)
            );
        }
        // special case where points lie on the same vertical axis
        return new L.Point(ptA.x, ptA.y + (ptB.y - ptA.y) * ratio);
    }
};

// polyline decorator
L.PolylineDecorator = L.LayerGroup.extend({
    options: {
        patterns: [],
        maxScale: null,
        minScale: null
    },

    initialize: function(paths, options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
        this._map = null;
        this._initPaths(paths);
        this._initPatterns();
    },

    /**
    * Deals with all the different cases. p can be one of these types:
    * array of LatLng, array of 2-number arrays, Polyline, Polygon,
    * array of one of the previous. 
    */
    _initPaths: function(p) {
        this._paths = [];
        var isPolygon = false;
        if(p instanceof L.Polyline) {
            this._initPath(p.getLatLngs(), (p instanceof L.Polygon));
        } else if(L.Util.isArray(p) && p.length > 0) {
            if(p[0] instanceof L.Polyline) {
                for(var i=0; i<p.length; i++) {
                    this._initPath(p[i].getLatLngs(), (p[i] instanceof L.Polygon));
                }
            } else {
                this._initPath(p);
            }
        }
    },

    _isCoordArray: function(ll) {
        return(L.Util.isArray(ll) && ll.length > 0 && (
            ll[0] instanceof L.LatLng || 
            (L.Util.isArray(ll[0]) && ll[0].length == 2 && typeof ll[0][0] === 'number')
        ));
    },

    _initPath: function(path, isPolygon) {
        var LonLat;
        // It may still be an array of array of coordinates
        // (ex: polygon with rings)
        if(this._isCoordArray(path)) {
            LonLat = [path];
        } else {
            LonLat = path;
        }
        var latLngs = this._swapLatLngs(LonLat);

        for(var i=0; i<latLngs.length; i++) {
            // As of Leaflet >= v0.6, last polygon vertex (=first) isn't repeated.
            // Our algorithm needs it, so we add it back explicitly.
            if(isPolygon) {
                latLngs[i].push(latLngs[i][0]);
            }
            this._paths.push(latLngs[i]);
        }
    },

    _swapLatLngs: function (pathArray) {
        var resultArray = [];
        for (var i = 0 ; i < pathArray.length; i++) {
            resultArray.push([]);
            for (var j = 0; j < pathArray[i].length; j++) {
                resultArray[i].push([pathArray[i][j][1], pathArray[i][j][0]]);
            }
        }
        return resultArray;
    },

    _initPatterns: function() {
        this._isZoomDependant = false;
        this._patterns = [];
        var pattern;
        // parse pattern definitions and precompute some values
        for(var i=0;i<this.options.patterns.length;i++) {
            pattern = this._parsePatternDef(this.options.patterns[i]);
            this._patterns.push(pattern);
            // determines if we have to recompute the pattern on each zoom change
            this._isZoomDependant = this._isZoomDependant ||
                pattern.isOffsetInPixels ||
                pattern.isRepeatInPixels ||
                pattern.symbolFactory.isZoomDependant;
        }
    },

    /**
    * Changes the patterns used by this decorator 
    * and redraws the new one.
    */
    setPatterns: function(patterns) {
        this.options.patterns = patterns;
        this._initPatterns();
        this._softRedraw();
    },

    /**
    * Changes the patterns used by this decorator 
    * and redraws the new one.
    */
    setPaths: function(paths) {
        this._initPaths(paths);
        this.redraw();
    },

    /**
    * Parse the pattern definition
    */
    _parsePatternDef: function(patternDef, latLngs) {
        var pattern = {
            cache: [],
            symbolFactory: patternDef.symbol,
            isOffsetInPixels: false,
            isRepeatInPixels: false
        };
        
        // Parse offset and repeat values, managing the two cases:
        // absolute (in pixels) or relative (in percentage of the polyline length)
        if(typeof patternDef.offset === 'string' && patternDef.offset.indexOf('%') != -1) {
            pattern.offset = parseFloat(patternDef.offset) / 100;
        } else {
            pattern.offset = parseFloat(patternDef.offset);
            pattern.isOffsetInPixels = (pattern.offset > 0);
        }
        
        
        if(typeof patternDef.repeat === 'string' && patternDef.repeat.indexOf('%') != -1) {
            pattern.repeat = parseFloat(patternDef.repeat) / 100;
        } else {
            pattern.repeat = parseFloat(patternDef.repeat);
            pattern.isRepeatInPixels = (pattern.repeat > 0);
        }
        
        // TODO: 0 => not pixel dependant => 0%
        
        return(pattern);
    },

    onAdd: function (map) {
        this._map = map;
        this._draw();
        // listen to zoom changes to redraw pixel-spaced patterns
        if(this._isZoomDependant) {
            this._map.on('zoomend', this._softRedraw, this);
        }
    },

    onRemove: function (map) {
        // remove optional map zoom listener
        this._map.off('zoomend', this._softRedraw, this);
        this._map = null;
        L.LayerGroup.prototype.onRemove.call(this, map);
    },

    /**
    * Returns an array of ILayers object
    */
    _buildSymbols: function(latLngs, symbolFactory, directionPoints) {
        var symbols = [];
        for(var i=0, l=directionPoints.length; i<l; i++) {
            symbols.push(symbolFactory.buildSymbol(directionPoints[i], latLngs, this._map, i, l));
        }
        return symbols;
    },

    _getCache: function(pattern, zoom, pathIndex) {
        var zoomCache = pattern.cache[zoom];
        if(typeof zoomCache === 'undefined') {
            pattern.cache[zoom] = [];
            return null;
        }
        return zoomCache[pathIndex];
    },

    /**
    * Select pairs of LatLng and heading angle,
    * that define positions and directions of the symbols
    * on the path 
    */
    _getDirectionPoints: function(pathIndex, pattern) {
        var zoom = this._map.getZoom();
        var dirPoints = this._getCache(pattern, zoom, pathIndex);
        if(dirPoints) {
            return dirPoints;
        }

        var offset, repeat, pathPixelLength = null, latLngs = this._paths[pathIndex];
        if(pattern.isOffsetInPixels) {
            pathPixelLength =  L.LineUtil.PolylineDecorator.getPixelLength(latLngs, this._map);
            offset = pattern.offset/pathPixelLength;
        } else {
            offset = pattern.offset;
        }
        if(pattern.isRepeatInPixels) {
            pathPixelLength = (pathPixelLength !== null) ? pathPixelLength : L.LineUtil.PolylineDecorator.getPixelLength(latLngs, this._map);
            repeat = pattern.repeat/pathPixelLength; 
        } else {
            repeat = pattern.repeat;
        }
        dirPoints = L.LineUtil.PolylineDecorator.projectPatternOnPath(latLngs, offset, repeat, this._map);
        // save in cache to avoid recomputing this
        pattern.cache[zoom][pathIndex] = dirPoints;
        
        return dirPoints;
    },

    /**
    * Public redraw, invalidating the cache.
    */
    redraw: function() {
        this._redraw(true);
    },
    
    /**
    * "Soft" redraw, called internally for example on zoom changes,
    * keeping the cache. 
    */
    _softRedraw: function() {
        this._redraw(false);
    },
    
    _redraw: function(clearCache) {
        if(this._map === null)
            return;
        this.clearLayers();

        if(clearCache) {
            for(var i=0; i<this._patterns.length; i++) {
                this._patterns[i].cache = [];
            }
        }
        this._draw();
    },
    
    /**
    * Draw a single pattern
    */
    _drawPattern: function(pattern) {
        var directionPoints, symbols;
        for(var i=0; i < this._paths.length; i++) {
            directionPoints = this._getDirectionPoints(i, pattern);
            symbols = this._buildSymbols(this._paths[i], pattern.symbolFactory, directionPoints);
            for(var j=0; j < symbols.length; j++) {
                this.addLayer(symbols[j]);
            }
        }
    },

    /**
    * Draw all patterns
    */
    _draw: function () {
        var zoom = this._map.getZoom();
        if (this.options.maxScale && zoom > this.options.maxScale) return;
        if (this.options.minScale && zoom < this.options.minScale) return;

        for(var i=0; i<this._patterns.length; i++) {
            this._drawPattern(this._patterns[i]);
        }
    }
});
/*
 * Allows compact syntax to be used
 */
L.polylineDecorator = function (paths, options) {
    return new L.PolylineDecorator(paths, options);
};
