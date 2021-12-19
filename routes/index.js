var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.get('/test', function(req, res) {
  res.render('test.ejs');
});

router.get('/game/:ruleset', function(req, res) {
  if(req.params.ruleset) {
    res.render('game.ejs', {
      ruleset: req.params.ruleset,
      color: req.session.color
    });
  } else {
    res.redirect('/');
  }

});

router.post('/choosecolor', function(req, res) {
  if(req.body.color) {
    req.session.color = req.body.color;
    res.send(req.session.color);
  } else {
    res.send(null);
  }
})

module.exports = router;
