var assert = require('chai').assert
  , request = require('request')
  , nano = require('nano')(process.env.CLOUDANT_URL || 'http://localhost:5984')
  , redis = require('redis').createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'});

process.env.CLOUDANT_DBNAME = 'confy-test';
process.env.NODE_ENV = 'test';

var seed = require('./seed')
  , app = require('../app')
  , macro = require('./macro');

app.listen(app.get('port'));

describe('Database Connection', function () {
  it('should be successful', function (done) {
    nano.db.list(done);
  });
});

describe('Database Creation', function () {
  it('should be successful', function (done) {
    var callback = this.callback;

    nano.db.get('confy-test', function (err) {
      if (err && err.reason == 'Database does not exist.') {
        return nano.db.create('confy-test', done);
      }

      nano.db.destroy('confy-test', function (err) {
        if (!err) {
          nano.db.create('confy-test', done);
        }
      })
    });
  });
});

describe('Database', function () {
  it('should be seeded', function (done) {
    nano.db.use('confy-test').bulk(seed, done);
  });
});

describe('Redis', function () {
  it('should be seeded', function (done) {
    redis.flushall(function () {
      redis.mset([
        'confy_43fb9585328895005ca74bb33a1c46db5b835f2d', '{"_id":"users/pksunkara","username":"pksunkara","fullname":"Pavan Kumar Sunkara","email":"pavan.sss1991@gmail.com","type":"user","verified":true}',
        'confy_fad47f775369e976bcee4cdd1a6b263c3b7d1ade', '{"_id":"users/mdeiters","username":"mdeiters","fullname":"Matt Deiters","email":"mdeiters@gmail.com","type":"user","verified":true}'
      ], done);
    });
  });

  describe('and counting its keys', macro.redis(2, 'two'));
});

describe('API Server', function () {
  it('should be running', function () {
    assert.isNotNull(app);
  });

  describe('for non-existent url', function () {
    var ret = {};

    before(macro.get('/info', null, ret));

    macro.status(404, ret);

    it('should return not found', function () {
      assert.deepEqual(ret.body, {'message':'Not found'});
    });
  });
});

describe('OPTIONS method', function () {
  var res;

  before(function (done) {
    request({
      url: 'http://localhost:5000/',
      method: 'OPTIONS'
    }, function (err, response, body) {
      if (err) return done(err);

      res = response;
      done();
    });
  });

  it('should return 200', function () {
    assert.equal(res.statusCode, 200);
  });

  it('should have CORS headers', function () {
    assert.deepEqual(res.headers['access-control-allow-origin'], 'http://localhost:8000');
    assert.deepEqual(res.headers['access-control-allow-methods'], 'OPTIONS,GET,POST,PATCH,PUT,DELETE');
    assert.deepEqual(res.headers['access-control-allow-headers'], 'Content-Type, Authorization');
  });
});

require('./users/create')(macro);
require('./users/login')(macro);
require('./users/logout')(macro);
require('./users/verify')(macro);
require('./users/update')(macro);
require('./users/verify')(macro);
require('./users/retrieve')(macro);
require('./orgs/create')(macro);
require('./orgs/retrieve')(macro);
require('./orgs/update')(macro);
require('./orgs/list')(macro);
require('./teams/create')(macro);
require('./teams/retrieve')(macro);
require('./teams/update')(macro);
require('./teams/list')(macro);
require('./projects/create')(macro);
require('./projects/retrieve')(macro);
require('./projects/update')(macro);
require('./projects/list')(macro);
require('./projects/access/add')(macro);
require('./projects/access/list')(macro);
require('./projects/access/remove')(macro);
require('./envs/create')(macro);
require('./envs/retrieve')(macro);
require('./envs/update')(macro);
require('./envs/list')(macro);
require('./envs/config/retrieve')(macro);
require('./envs/config/update')(macro);
require('./envs/versions')(macro);
require('./envs/reset')(macro);
require('./teams/projects')(macro);
require('./teams/members/add')(macro);
require('./teams/members/list')(macro);
require('./teams/members/remove')(macro);
require('./teams/members/invite')(macro);
require('./envs/delete')(macro);
require('./projects/delete')(macro);
require('./teams/delete')(macro);
require('./orgs/delete')(macro);
require('./heroku/provision')(macro);
require('./heroku/deprovision')(macro);
require('./heroku/retrieve')(macro);
require('./heroku/update')(macro);

describe('Redis Flushing', function () {
  it('should be successful', function (done) {
    redis.flushall(done);
  });

  describe('and counting its keys', macro.redis(0, 'zero'));
});

describe('Database Destruction', function () {

  it('should be successful', function (done) {
    nano.db.destroy('confy-test', done);
  });

  describe('Getting it again', function () {

    it('should return error', function (done) {
      nano.db.get('confy-test', function (err) {
        assert.equal(err.reason, 'Database does not exist.');
        done();
      });
    });
  });
});
