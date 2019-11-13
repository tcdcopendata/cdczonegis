var myLayers = {
    functionButton: [
        'DengueGraph',
        'zone_export',
        'zone_bookmark',
        'zone_tile',
        'zone_list',
        'zone_animation',
        'zone_user',
        'zone_disease',
        'zone_information',
        // 'zone_logout',
        // 'zone_legend',
        // 'zone_import',
        'zone_draw',
        'zone_import',
    ],
    functionButtonAutoOpen: [
        'DengueGraph',
    ],
    tabButton: [
        'DengueSummary',
        'DengueCase',
        'DengueCluster',
        'DenguePest',
        // 'DenguePrevent',
        // 'DengueMedical',
        // 'DengueWeather',
        // 'DengueRisk'
    ],
    geo: [
        'DengueCase',
        'DengueCluster',
        'DenguePest',
        // 'DenguePrevent',
        'BoundaryCity',
        'BoundaryDist',
        'BoundaryVillage',
        // 'BucketRecord',
        // 'Rainfall',
        // 'Rainfall_IDW',
    ],
    display: ['DengueCase'],
    extra: [ //可拉式圖示列
        // 'History',
        // 'Earthquake',
        // 'Rain',
        // 'Dropbox'
    ],
    tile: [
        'google',
        'osm',
        'nlsc',
        // 'NLSC2', 'NLSC5', 
        'NLSC8', 'NLSC7', 'NLSC6',
        'Flooding300', 'Flooding450', 'Flooding600'
    ],
    tabStartTime: new Date(new Date().getFullYear(), 0, 1),
    tabEndTime: new Date(new Date().getFullYear(), 11, 31)
    // tabStartTime: new Date(2018, 0, 1),
    // tabEndTime: new Date(2018, 11, 31)
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

var stats_mmmmaaaapppp = {
    map: {
        zoom_level: 8,
        lng: 123,
        lat: 24
    },
    activeGraph: 'DengueCase',
    // 依功能切換圖層，再把所有圖層pin的圖層全部打開（判斷點線面？）
    graphs: {
        'DengueCase': {
            // allLayers:[],
            activeLayer: [],
            pinnedLayer: []
        },
        'DengueCluster': {
            // allLayers:[],
            activeLayer: [],
            pinnedLayer: []
        }
    },
    activeTab: 'DengueCase',
    tabs: {
        'DengueCase': {
            queryOption: {

            }
        },
        'DengueCluster': {
            queryOption: {

            }
        },
        'DenguePest': {
            queryOption: {

            }
        },
        'DenguePrevent': {
            queryOption: {

            }
        }
    }
}