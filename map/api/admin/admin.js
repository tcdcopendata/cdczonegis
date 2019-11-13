var check = require('./check');
var listUser = require('./listUser');
var setUser = require('./setUser');
var setTile = require('./setTile');
var admin = { check, listUser,setUser,setTile };

module.exports = admin;