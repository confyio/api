var request = require('request')
  , assert = require('assert')
  , nano = require('nano')('http://localhost:5984').db.use('confy-test');

module.exports = {
  get: function (path, auth, callback) {
    request({
      url: 'http://localhost:3000' + path,
      method: 'GET',
      auth: auth,
      json: true
    }, callback);
  },
  post: function (path, body, auth, callback) {
    request({
      url: 'http://localhost:3000' + path,
      method: 'POST',
      body: body,
      auth: auth,
      json: true
    }, callback);
  },
  patch: function (path, body, auth, callback) {
    request({
      url: 'http://localhost:3000' + path,
      method: 'PATCH',
      body: body,
      auth: auth,
      json: true
    }, callback);
  },
  delete: function (path, body, auth, callback) {
    request({
      url: 'http://localhost:3000' + path,
      method: 'DELETE',
      body: body,
      auth: auth,
      json: true
    }, callback);
  },
  db: function (doc, callback) {
    nano.get(doc, callback);
  },
  doc: function (doc, extra) {
    extra = extra || {};

    var ret = {
      topic: function () {
        nano.get(doc, this.callback)
      },
      'should exist': function (err, body) {
        assert.isNull(err);
        assert.equal(body._id, doc);
      }
    };

    Object.keys(extra).forEach(function (key) {
      ret[key] = extra[key];
    });

    return ret;
  },
  status: function (code) {
    return function (err, res) {
      assert.isNull(err);
      assert.equal(res.statusCode, code);
    }
  },
  validation: function (number) {
    return function (err, res, body) {
      assert.equal(body.message, 'Validation failed');
      assert.lengthOf(body.errors, number);
    }
  }
}
