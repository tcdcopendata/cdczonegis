var myLayers = {
    functionButton: [
        'measlesGraph',
        'zone_export',
        'zone_tile',
        // 'zone_list',
        'zone_user',
        'zone_disease',
        // 'zone_logout',
        'zone_draw',
        // 'zone_import',
    ],
    functionButtonAutoOpen: [
        'measlesGraph',
    ],
    tabButton: [
        'measlesSummary',
        'measlesCase',
        'measlesCluster',
        'measlesContact',
    ],
    geo: [
        'MeaslesCase',
        'MeaslesCluster',
        'MeaslesContact',
    ],
    display: ['MeaslesCase'],
    extra: [

    ],
    tile: [
        'google',
        'osm',
        'nlsc',
        'NLSC8', 'NLSC7', 'NLSC6',
        'Flooding300', 'Flooding450', 'Flooding600'
    ],
    // tabStartTime: new Date(new Date().getFullYear(), 0, 1),
    // tabEndTime: new Date(new Date().getFullYear(), 11, 31)
    tabStartTime: new Date(2018, 0, 1),
    tabEndTime: new Date(2018, 11, 31)
};

var mymap = new G.Map("map", {
    center: [23.643290, 120.822847],
    zoom: 8,
    minZoom: 3,
    maxZoom: 22,
    zoomControl: false,
    worldCopyJump: true,

    layerOptions: myLayers
});