module.exports = function (app) {
  app.errors = {};

  // Catch 404
  app.use(function (req, res, next) {
    app.errors.notfound(res);
  });

  // Development error handler will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err
      });
    });
  }

  // Production error handler no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    if (err) app.sentry.captureError(err);

    res.status(err.status || 500);
    res.json({
      message: err.message,
    });
  });

  // Validation error
  app.errors.validation = function (res, errs) {
    res.status(422);
    res.json({ message: 'Validation failed', errors: errs });
  };

  // Unverified error
  app.errors.unverified = function (res) {
    res.status(401);
    res.json({ message: 'Unverified email' });
  };

  // Authentication error
  app.errors.auth = function (res) {
    res.status(401);
    res.json({ message: 'Bad credentials' });
  };

  // Not found error
  app.errors.notfound = function (res) {
    res.status(404);
    res.json({ message: 'Not found' });
  };

  // Forbidden error
  app.errors.forbidden = function (res) {
    res.status(403);
    res.json({ message: 'Forbidden action' });
  };

  // Capture error to sentry directly from callbacks
  app.errors.capture = function (callback) {
    if (callback && typeof callback !== 'function') {
      callback = null;
    }

    return function (err, data) {
      if (err) app.sentry.captureError(err);
      if (callback) callback(err, data);
    };
  };
};
