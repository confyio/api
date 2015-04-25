module.exports = function (app) {
  app.utils = {};

  // Remove nulls from an array
  app.utils.compact = function (oldArr) {
    var newArr = [];

    oldArr.forEach(function (element) {
      if (element) {
        newArr.push(element);
      }
    });

    return newArr;
  };

  // Merge two hashes
  app.utils.merge = function (oldBody, newBody) {
    Object.keys(newBody).forEach(function (key) {
      oldBody[key] = newBody[key];
    });
  };

  // Forbid certain keys
  app.utils.forbid = function (req, fields) {
    fields.forEach(function (field) {
      if(req.body[field]) delete req.body[field];
    });
  };

  // Only accept certain keys
  app.utils.permit = function (req, fields) {
    req.oldBody = req.body;
    req.body = {};

    fields.forEach(function (field) {
      if (req.oldBody[field]) {
        req.body[field] = req.oldBody[field];
      }
    });
  };

  // Creating errors when certain keys are not present
  app.utils.need = function (req, fields) {
    var errs = [];

    fields.forEach(function (field) {
      if (req.body[field] === undefined || req.body[field] === '') {
        errs.push({ field: field, code: 'missing' });
      }
    });

    return errs;
  };

  // Shielding keys from sending them
  app.utils.shield = function (body, fields) {
    fields.forEach(function (field) {
      if (body[field]) delete body[field];
    });
  };

  // Idify a name
  app.utils.idify = function (name) {
    return name.toLowerCase().replace(/\ /g, '-');
  };

  // Get slug from the id
  app.utils.slug = function (object) {
    return object._id.split('/').slice(-1)[0];
  };
};
