var fs = require('fs');
var pfxPath = '';
var hspfx = fs.readFileSync(pfxPath);

//ssl license
var options = {
    secureOptions: require('constants').SSL_OP_NO_TLSv1,
    pfx: hspfx,
    passphrase: '',
};

var ssl = {};
ssl.options = options;

module.exports = ssl;