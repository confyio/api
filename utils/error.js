module.exports = function (app) {
  app.errors = {};

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
      if (!app.get('onpremise')) {
        if (err) app.sentry.captureError(err);
      }

      if (callback) callback(err, data);
    };
  };
};
