var   Category          = require('./../../models/categores');

module.exports = function(req, res) {
    Category.find({}, function(err, categores){
        res.json({err : null, categores : categores});
        res.status(200).end();
    })
}