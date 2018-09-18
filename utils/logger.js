var morgan = require('morgan');

module.exports = function (app) {
  morgan.token('url', function (req, res) {
    var url = req.originalUrl || req.url;

    if (url.indexOf('?') !== -1) {
     url = url.slice(0, url.indexOf('?'));
    }

    return url;
  });

  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
  } else if (app.get('env') === 'production') {
    app.use(morgan('tiny'));
  }
};
