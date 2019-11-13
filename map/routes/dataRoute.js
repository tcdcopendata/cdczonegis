var api = require('../api/api.js');
var geojson = require('../api/data/geojson');

var express = require('express');
var router = express.Router();

// 登革熱 Info Window
router.post('/dengue/info/case/summary', api.sys.sysLogApi, api.data.dengue.info.infoCase.summary);
router.post('/dengue/info/case/geo', api.sys.sysLogApi, api.data.dengue.info.infoCase.geo);
router.post('/dengue/info/case/hospital', api.sys.sysLogApi, api.data.dengue.info.infoCase.hospital);
router.post('/dengue/info/case/area', api.sys.sysLogApi, api.data.dengue.info.infoCase.area);
router.post('/dengue/info/cluster/point/case', api.sys.sysLogApi, api.data.dengue.info.infoCluster.pointCase);
router.post('/dengue/info/cluster/point/area', api.sys.sysLogApi, api.data.dengue.info.infoCluster.pointArea);
router.post('/dengue/info/prevent/area', api.sys.sysLogApi, api.data.dengue.info.infoPrevent.area);
router.post('/dengue/info/medical/area', api.sys.sysLogApi, api.data.dengue.info.infoCase.area);
// 登革熱 儀表板
router.post('/dengue/tab/summary/compare', api.sys.sysLogApi, api.data.dengue.tab.tabSummary.compare);
router.post('/dengue/tab/summary/summer', api.sys.sysLogApi, api.data.dengue.tab.tabSummary.summer);
router.post('/dengue/tab/summary/trend', api.sys.sysLogApi, api.data.dengue.tab.tabSummary.trend);
router.post('/dengue/tab/summary/hidden', api.sys.sysLogApi, api.data.dengue.tab.tabSummary.hidden);
router.post('/dengue/tab/summary/determine', api.sys.sysLogApi, api.data.dengue.tab.tabSummary.determine);
router.post('/dengue/tab/case/query', api.sys.sysLogApi, api.data.dengue.tab.tabCase.query);
router.post('/dengue/tab/cluster/query', api.sys.sysLogApi, api.data.dengue.tab.tabCluster.query);
router.post('/dengue/tab/pest/query', api.sys.sysLogApi, api.data.dengue.tab.tabPest.query);
router.post('/dengue/tab/medical/query', api.sys.sysLogApi, api.data.dengue.tab.tabMedical.query);
router.post('/dengue/tab/prevent/query', api.sys.sysLogApi, api.data.dengue.tab.tabPrevent.query);
// 登革熱 圖例圖層
router.post('/dengue/map/case/points', api.sys.sysLogApi, api.data.dengue.map.mapCase.points);
router.post('/dengue/map/cluster/points', api.sys.sysLogApi, api.data.dengue.map.mapCluster.points);
router.post('/dengue/map/cluster/polygons', api.sys.sysLogApi, api.data.dengue.map.mapCluster.polygons);
router.post('/dengue/map/pest/points/bucket', api.sys.sysLogApi, api.data.dengue.map.mapPest.pointsBucket);
router.post('/dengue/map/pest/points/vegetable', api.sys.sysLogApi, api.data.dengue.map.mapPest.pointsVegetable);
router.post('/dengue/map/prevent/polygons', api.sys.sysLogApi, api.data.dengue.map.mapPrevent.polygons);
router.post('/dengue/map/risk/spatial', api.sys.sysLogApi, geojson.getRiskSpatial);
router.post('/dengue/map/risk/mst', api.sys.sysLogApi, geojson.getRiskMST);
router.post('/dengue/map/medical/points', api.sys.sysLogApi, api.data.dengue.map.mapMedical.points);

// 麻疹 Info Window
router.post('/measles/info/case/summary', api.sys.sysLogApi, api.data.measles.info.infoCase.summary);
router.post('/measles/info/case/geo', api.sys.sysLogApi, api.data.measles.info.infoCase.geo);
router.post('/measles/info/case/hospital', api.sys.sysLogApi, api.data.measles.info.infoCase.hospital);
router.post('/measles/info/case/contact', api.sys.sysLogApi, api.data.measles.info.infoCase.contact);
router.post('/measles/info/case/cluster', api.sys.sysLogApi, api.data.measles.info.infoCase.cluster);
// 麻疹 儀表板
router.post('/measles/tab/summary/compare', api.sys.sysLogApi, api.data.measles.tab.tabSummary.compare);
router.post('/measles/tab/summary/counting', api.sys.sysLogApi, api.data.measles.tab.tabSummary.counting);
router.post('/measles/tab/summary/mmr', api.sys.sysLogApi, api.data.measles.tab.tabSummary.mmr);
router.post('/measles/tab/summary/cluster', api.sys.sysLogApi, api.data.measles.tab.tabSummary.cluster);
router.post('/measles/tab/summary/age', api.sys.sysLogApi, api.data.measles.tab.tabSummary.age);
router.post('/measles/tab/case/query', api.sys.sysLogApi, api.data.measles.tab.tabCase.query);
router.post('/measles/tab/cluster/query', api.sys.sysLogApi, api.data.measles.tab.tabCluster.query);
router.post('/measles/tab/contact/query', api.sys.sysLogApi, api.data.measles.tab.tabContact.query);
// 麻疹 圖例圖層
router.post('/measles/map/case/points', api.sys.sysLogApi, api.data.measles.map.mapCase.points);
router.post('/measles/map/cluster/points', api.sys.sysLogApi, api.data.measles.map.mapCluster.points);
router.post('/measles/map/cluster/pointsContact', api.sys.sysLogApi, api.data.measles.map.mapCluster.pointsContact);
router.post('/measles/map/contact/points', api.sys.sysLogApi, api.data.measles.map.mapContact.points);

// 界線圖台
router.all('/geojson/boundary/city', geojson.getCity);
router.all('/geojson/boundary/dist', geojson.getDist);
router.all('/geojson/boundary/village', geojson.getVillage);

module.exports = router;