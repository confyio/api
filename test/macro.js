var request = require('request')
  , assert = require('chai').assert
  , nano = require('nano')(process.env.CLOUDANT_URL || 'http://localhost:5984')
  , redis = require('redis').createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'});

nano = nano.db.use('confy-test');

module.exports = {
  get: function (path, auth, ret) {
    return function (done) {
      request({
        url: 'http://localhost:5000' + path,
        method: 'GET',
        auth: auth,
        json: true
      }, function (err, res, body) {
        if (err) return done(err);

        ret.res = res;
        ret.body = body;
        done();
      });
    };
  },
  post: function (path, body, auth, ret, lambda) {
    return function (done) {
      request({
        url: 'http://localhost:5000' + path,
        method: 'POST',
        body: body,
        auth: auth,
        json: true
      }, function (err, res, body) {
        if (err) return done(err);

        ret.res = res;
        ret.body = body;

        if (lambda) lambda();

        done();
      });
    };
  },
  patch: function (path, body, auth, ret, lambda) {
    return function (done) {
      request({
        url: 'http://localhost:5000' + path,
        method: 'PATCH',
        body: body,
        auth: auth,
        json: true
      }, function (err, res, body) {
        if (err) return done(err);

        ret.res = res;
        ret.body = body;

        if (lambda) lambda();

        done();
      });
    };
  },
  put: function (path, body, auth, ret) {
    return function (done) {
      request({
        url: 'http://localhost:5000' + path,
        method: 'PUT',
        body: body,
        auth: auth,
        json: true
      }, function (err, res, body) {
        if (err) return done(err);

        ret.res = res;
        ret.body = body;
        done();
      });
    };  },
  delete: function (path, body, auth, ret) {
    return function (done) {
      request({
        url: 'http://localhost:5000' + path,
        method: 'DELETE',
        body: body,
        auth: auth,
        json: true
      }, function (err, res, body) {
        if (err) return done(err);

        ret.res = res;
        ret.body = body;
        done();
      });
    };
  },
  doc: function (doc, ret, lambda) {
    return function (done) {
      nano.get(doc, function (err, body) {
        if (err) return done(err);

        assert.equal(body._id, doc);
        ret.body = body;

        if (lambda) lambda();

        done();
      });
    };
  },
  nodoc: function (doc, reason) {
    return function (done) {
      nano.get(doc, function (err, body) {
        assert.isNotNull(err);
        assert.equal(err.reason, reason);
        assert.isUndefined(body);

        done();
      });
    };
  },
  status: function (code, ret) {
    it('should return ' + code, function () {
      assert.equal(ret.res.statusCode, code);
    });
  },
  validation: function (number, errors, ret) {
    it('should return validation errors', function () {
      assert.equal(ret.body.message, 'Validation failed');
      assert.lengthOf(ret.body.errors, number);

      errors.forEach(function (item, index) {
        assert.deepEqual(ret.body.errors[index], { field: item[0], code: item[1] });
      });
    });
  },
  redis: function (count, text) {
    return function () {
      it('should result in ' + text + ' keys', function (done) {

        redis.keys('*', function (err, body) {
          if (err) return done(err);

          assert.equal(body.length, count);
          done();
        });
      });
    };
  },
  redisget: function (key, ret) {
    return function (done) {
      redis.get(key, function (err, body) {
        if (err) return done(err);

        ret.body = body;
        done();
      });
    };
  }
};
