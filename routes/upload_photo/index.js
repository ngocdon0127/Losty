var formidable = require('formidable'),
  util = require('util'),
  fs = require('fs-extra'),
  mime = require('mime');

var form = new formidable.IncomingForm();

module.exports = function(req, res) {

  // PARSE FORM-DATA
  try {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      console.log(files);
      if (err) {
        res.json({
          error_code: 201,
          msg: err.toString()
        }); //  Input is invalid
        res.status(200).end();
      }
    });

    form.on('error', function(err) {
      console.log(err);
      res.json({
        error_code: 201,
        msg: err.toString()
      }); //  Input is invalid
      res.status(200).end();

    });

    form.on('end', function(fields, files) {

      console.log('This.openedFiles : ', this.openedFiles);
      if (!this.openedFiles[0]) {
        res.json({
          error_code: 201,
          msg: 'File is incorrect'
        }); //  Input is invalid
        res.status(200).end();
      } else {
        var temp_path = this.openedFiles[0].path;
        var extension = mime.extension(this.openedFiles[0].type).toLowerCase();
        res.json({
          error_code: 0,
          image_link: temp_path,
          extension: extension
        });
        res.status(200).end();
      }
    })
  } catch (err) {
    res.json({
      error_code: 201,
      msg: err.toString()
    }); //  Input is invalid
    res.status(200).end();
  } finally {}
}