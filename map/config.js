'use strict';
let config = {};

var developDBSetCDCzone = '';
var developDBSetCDCtrace = '';

//正式環境

config.pgService = {};
config.pgService.cdczone = developDBSetCDCzone;
config.pgService.cdctrace = developDBSetCDCtrace;

config.db = {};
config.db.cdczone = '';
config.db.cdctrace = '';

// 舊的，會慢慢移掉
config.postgres = developDBSetCDCzone;
config.db.cdczonegis = '';

module.exports = config;