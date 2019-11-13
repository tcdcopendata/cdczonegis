var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session || !req.session.username) {
        res.redirect('/login');
    }
  res.render('dashboard', { title: 'Express' });
});

module.exports = router;
