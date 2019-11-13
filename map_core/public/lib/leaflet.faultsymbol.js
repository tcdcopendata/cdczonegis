L.FaultSymbol = L.FaultSymbol || {};
L.FaultSymbol.GeneralPixelSize = 20;

L.FaultSymbol.RotationMatrix = function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    //return [nx, ny];
    return new L.Point(nx, ny);
}

// =========== B201,B202
L.FaultSymbol.b201b202b203b204b208b206b207b208 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: true,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.color = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolyline(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;

        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;
        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x + pixelSize / 2), (tipPoint.y - pixelSize / 5)
												   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x - pixelSize / 2)
												   , (tipPoint.y - pixelSize / 5)
												   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x - pixelSize / 2 + pixelSize / 5)
												   , (tipPoint.y - pixelSize / 5 - pixelSize / 5)
												   , direction);
        return [map.unproject(point1), map.unproject(point2), map.unproject(point3)];
    }
});

L.FaultSymbol.B201 = function (options) {
    return new L.FaultSymbol.b201b202b203b204b208b206b207b208(options);
};

L.FaultSymbol.B202 = function (options) {
    return new L.FaultSymbol.b201b202b203b204b208b206b207b208(options);
};

// =========== B211,B212
L.FaultSymbol.b211b212b213b214b215b216b217b218 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: true,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;
        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.color = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolyline(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;
        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x + pixelSize / 2 - pixelSize / 5), (tipPoint.y - pixelSize / 5 - pixelSize / 5)
												   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x + pixelSize / 2)
												   , (tipPoint.y - pixelSize / 5)
												   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                                       , (tipPoint.x - pixelSize / 2)
												   , (tipPoint.y - pixelSize / 5)
												   , direction);
        return [map.unproject(point1), map.unproject(point2), map.unproject(point3)];
    }
});

L.FaultSymbol.B211 = function (options) {
    return new L.FaultSymbol.b211b212b213b214b215b216b217b218(options);
};

L.FaultSymbol.B212 = function (options) {
    return new L.FaultSymbol.b211b212b213b214b215b216b217b218(options);
};

// =========== B301... etc
L.FaultSymbol.b301b302b303b304b305b306b307b308 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;
        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;

        var rotatedPoint = [];
        for (var i = -1; i < 2; i++) { //-1 to 1
            var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x + pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y)
													   , direction);
            var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x + pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y + pixelSize * 3 / 10)
													   , direction);
            var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x - pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y + pixelSize * 3 / 10)
													   , direction);
            var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x - pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y)
													   , direction);
            rotatedPoint.push([map.unproject(point1)
				               , map.unproject(point2)
							   , map.unproject(point3)
							   , map.unproject(point4)]);
        }


        return rotatedPoint;
    }
});

L.FaultSymbol.B301 = function (options) {
    return new L.FaultSymbol.b301b302b303b304b305b306b307b308(options);
};

// =========== B401B402B411B402
L.FaultSymbol.b401b402b411b412 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;
        defaultoption.polygon = options.polygon; // polygon need no stroke, but polyline need
        defaultoption.pathOptions.stroke = !options.polygon; // polygon need no stroke, but polyline need

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;

            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
            defaultoption.pathOptions.color = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },

    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;
        if (opts.polygon) {
            path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        } else {
            path = new L.MultiPolyline(this._buildPath(dirPoint, map), opts.pathOptions);
        }
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;

        var rotatedPoint = [];
        for (var i = -1; i < 2; i++) { //-1 to 1
            var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x + pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y)
													   , direction);
            var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x) + i * pixelSize * 7 / 20
													   , (tipPoint.y + pixelSize * 7 / 20)
													   , direction);
            var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
													   , (tipPoint.x - pixelSize * 3 / 20) + i * pixelSize * 7 / 20
													   , (tipPoint.y)
													   , direction);

            rotatedPoint.push([map.unproject(point1)
				               , map.unproject(point2)
							   , map.unproject(point3)]);
        }


        return rotatedPoint;
    }
});

L.FaultSymbol.B401 = function (options) {
    options.polygon = true;
    return new L.FaultSymbol.b401b402b411b412(options);
};
L.FaultSymbol.B402 = function (options) {
    options.polygon = false;
    return new L.FaultSymbol.b401b402b411b412(options);
};
L.FaultSymbol.B411 = function (options) {
    options.polygon = true;
    return new L.FaultSymbol.b401b402b411b412(options);
};
L.FaultSymbol.B412 = function (options) {
    options.polygon = false;
    return new L.FaultSymbol.b401b402b411b412(options);
};


// =========== B901B902
L.FaultSymbol.b901b902 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: true,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolyline(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;

        var rotatedPoint = [];
        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
												   , (tipPoint.x)
												   , (tipPoint.y)
												   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
												   , (tipPoint.x)
												   , (tipPoint.y + pixelSize * 4 / 10)
												   , direction);

        rotatedPoint.push([map.unproject(point1)
						   , map.unproject(point2)]);


        return rotatedPoint;
    }
});

L.FaultSymbol.B901 = function (options) {
    return new L.FaultSymbol.b901b902(options);
};

// C101C102C111===============
L.FaultSymbol.c101c102c111 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                               , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y)
										   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize * 6 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20)
										   , (tipPoint.y + pixelSize * 4 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x)
										   , (tipPoint.y + pixelSize / 2)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20)
								           , (tipPoint.y + pixelSize * 4 / 20)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize * 6 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    }
});

L.FaultSymbol.C101 = function (options) {
    return new L.FaultSymbol.c101c102c111(options);
};

L.FaultSymbol.C102 = function (options) {
    return new L.FaultSymbol.c101c102c111(options);
};

// C121==============
L.FaultSymbol.c121 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction, pixelSize * 3 / 20));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction, -pixelSize * 3 / 20));
        rotatedPoint.push(this._buildCircle(tipPoint, map, direction, pixelSize * 3 / 20));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction, xOffset) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                               , (tipPoint.x + pixelSize * 1 / 30 + xOffset)
										   , (tipPoint.y)
										   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30 + xOffset)
										   , (tipPoint.y + pixelSize * 5 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20 + xOffset)
										   , (tipPoint.y + pixelSize * 3 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + xOffset)
										   , (tipPoint.y + pixelSize * 9 / 20)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20 + xOffset)
								           , (tipPoint.y + pixelSize * 3 / 20)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30 + xOffset)
								           , (tipPoint.y + pixelSize * 5 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30 + xOffset)
								           , (tipPoint.y)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    },
    _buildCircle: function (tipPoint, map, direction, radius) {
        var pixelSize = this.options.pixelSize;
        var d2r = Math.PI / 180;
        var circlePoints = [];
        for (var i = 0; i < 11; i++) {
            var degree = 18 * i * d2r; // 0~180
            var point = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x + (radius + pixelSize * 1 / 30) * Math.cos(degree))
								           , (tipPoint.y - (radius + pixelSize * 1 / 30) * Math.sin(degree))
								           , direction);
            circlePoints.push(map.unproject(point));
        }
        for (var i = 0; i < 11; i++) {
            var degree = 18 * i * d2r; // 0~180
            var point = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - (radius - pixelSize * 1 / 30) * Math.cos(degree))
								           , (tipPoint.y - (radius - pixelSize * 1 / 30) * Math.sin(degree))
								           , direction);
            circlePoints.push(map.unproject(point));
        } return circlePoints;
    }
});

L.FaultSymbol.C121 = function (options) {
    return new L.FaultSymbol.c121(options);
};

// C141C142===============
L.FaultSymbol.c141c142 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
			                               , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y)
										   , direction);
        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize * 5 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20)
										   , (tipPoint.y + pixelSize * 5 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x)
										   , (tipPoint.y + pixelSize / 2)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20)
								           , (tipPoint.y + pixelSize * 5 / 20)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize * 5 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    }
});

L.FaultSymbol.C141 = function (options) {
    return new L.FaultSymbol.c141c142(options);
};

L.FaultSymbol.C142 = function (options) {
    return new L.FaultSymbol.c141c142(options);
};

// C301C302C311===============
L.FaultSymbol.c301c302c311 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
                                                   , (tipPoint.x)
                                                   , (tipPoint.y)
                                                   , direction);

        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20)
										   , (tipPoint.y + pixelSize * 6 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize * 4 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize / 2)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize / 2)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize * 4 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20)
								           , (tipPoint.y + pixelSize * 6 / 20)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    }
});

L.FaultSymbol.C301 = function (options) {
    return new L.FaultSymbol.c301c302c311(options);
};

L.FaultSymbol.C302 = function (options) {
    return new L.FaultSymbol.c301c302c311(options);
};

// C321
L.FaultSymbol.c321 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction, pixelSize * 3 / 20));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction, -pixelSize * 3 / 20));
        rotatedPoint.push(this._buildCircle(tipPoint, map, direction, pixelSize * 3 / 20));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction, xOffset) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
                                                   , (tipPoint.x + xOffset)
                                                   , (tipPoint.y)
                                                   , direction);

        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20 + xOffset)
										   , (tipPoint.y + pixelSize * 6 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30 + xOffset)
										   , (tipPoint.y + pixelSize * 4 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30 + xOffset)
										   , (tipPoint.y + pixelSize / 2)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30 + xOffset)
								           , (tipPoint.y + pixelSize / 2)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30 + xOffset)
								           , (tipPoint.y + pixelSize * 4 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20 + xOffset)
								           , (tipPoint.y + pixelSize * 6 / 20)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    },
    _buildCircle: function (tipPoint, map, direction, radius) {
        var pixelSize = this.options.pixelSize;
        var d2r = Math.PI / 180;
        var circlePoints = [];
        for (var i = 0; i < 11; i++) {
            var degree = 18 * i * d2r; // 0~180
            var point = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x + (radius + pixelSize * 1 / 30) * Math.cos(degree))
								           , (tipPoint.y - (radius + pixelSize * 1 / 30) * Math.sin(degree))
								           , direction);
            circlePoints.push(map.unproject(point));
        }
        for (var i = 0; i < 11; i++) {
            var degree = 18 * i * d2r; // 0~180
            var point = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - (radius - pixelSize * 1 / 30) * Math.cos(degree))
								           , (tipPoint.y - (radius - pixelSize * 1 / 30) * Math.sin(degree))
								           , direction);
            circlePoints.push(map.unproject(point));
        } return circlePoints;
    }
});

L.FaultSymbol.C321 = function (options) {
    return new L.FaultSymbol.c321(options);
};

// C341C342===============
L.FaultSymbol.c341c342 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: false,
            weight: 1,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolygon(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction));
        rotatedPoint.push(this._buildPoint(tipPoint, map, direction + 180));

        return rotatedPoint;
    },
    _buildPoint: function (tipPoint, map, direction) {
        var pixelSize = this.options.pixelSize;

        var point1 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
                                           , (tipPoint.x)
                                           , (tipPoint.y)
                                           , direction);

        var point2 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 3 / 20)
										   , (tipPoint.y + pixelSize * 5 / 20)
										   , direction);
        var point3 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize * 5 / 20)
										   , direction);
        var point4 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
										   , (tipPoint.x + pixelSize * 1 / 30)
										   , (tipPoint.y + pixelSize / 2)
										   , direction);
        var point5 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize / 2)
								           , direction);
        var point6 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 1 / 30)
								           , (tipPoint.y + pixelSize * 5 / 20)
								           , direction);
        var point7 = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - pixelSize * 3 / 20)
								           , (tipPoint.y + pixelSize * 5 / 20)
								           , direction);
        return [map.unproject(point1), map.unproject(point2)
	                      , map.unproject(point3), map.unproject(point4)
	                      , map.unproject(point5), map.unproject(point6)
	                      , map.unproject(point7)];
    }
});

L.FaultSymbol.C341 = function (options) {
    return new L.FaultSymbol.c341c342(options);
};

L.FaultSymbol.C342 = function (options) {
    return new L.FaultSymbol.c341c342(options);
};

// E101E102=======
L.FaultSymbol.e101e102 = L.Class.extend({
    isZoomDependant: true,
    options: {
        pixelSize: L.FaultSymbol.GeneralPixelSize,
        pathOptions: {
            stroke: true,
            weight: 2,
            clickable: false,
            fillOpacity: 1,
            color: '#0000ff'
        }
    },
    initialize: function (options) {
        var defaultoption = this.options;
        defaultoption.pixelSize = typeof options.pixelSize === "number" ? options.pixelSize : defaultoption.pixelSize;

        if (options.pathOptions) {
            defaultoption.pathOptions.weight = typeof options.pathOptions.weight === "number" ? options.pathOptions.weight : defaultoption.pathOptions.weight;
            defaultoption.pathOptions.clickable = typeof options.pathOptions.clickable === "boolean" ? options.pathOptions.clickable : defaultoption.pathOptions.clickable;
            defaultoption.pathOptions.fillOpacity = typeof options.pathOptions.fillOpacity === "number" ? options.pathOptions.fillOpacity : defaultoption.pathOptions.fillOpacity;
            defaultoption.pathOptions.fillColor = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
            defaultoption.pathOptions.color = typeof options.pathOptions.color === "string" ? options.pathOptions.color : defaultoption.pathOptions.color;
        }
        L.Util.setOptions(this, defaultoption);
    },
    buildSymbol: function (dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;

        path = new L.MultiPolyline(this._buildPath(dirPoint, map), opts.pathOptions);
        return path;
    },
    _buildPath: function (dirPoint, map) {
        var tipPoint = map.project(dirPoint.latLng);
        var direction = dirPoint.heading + 90;
        var pixelSize = this.options.pixelSize;
        var rotatedPoint = [];
        rotatedPoint.push(this._buildCircle(tipPoint, map, direction, pixelSize * 5 / 20));
        return rotatedPoint;
    },
    _buildCircle: function (tipPoint, map, direction, radius) {
        var pixelSize = this.options.pixelSize;
        var d2r = Math.PI / 180;
        var circlePoints = [];

        for (var i = 0; i < 23; i++) {
            var degree = (70 + 10 * i) * d2r; // 70~290
            var point = L.FaultSymbol.RotationMatrix(tipPoint.x, tipPoint.y
								           , (tipPoint.x - (radius + pixelSize * 1 / 20) * Math.cos(degree))
								           , (tipPoint.y + (radius + pixelSize * 1 / 20) * Math.sin(degree))
								           , direction);
            circlePoints.push(map.unproject(point));
        }


        return circlePoints;
    }
});

L.FaultSymbol.E101 = function (options) {
    return new L.FaultSymbol.e101e102(options);
};

L.FaultSymbol.E102 = function (options) {
    return new L.FaultSymbol.e101e102(options);
};