var assert = require('assert')
  , request = require('request')
  , nano = require('nano')('http://localhost:5984')
  , redis = require('redis').createClient()
  , vows = require('vows');

process.env.CLOUDANT_DBNAME = 'confy-test';
process.env.NODE_ENV = 'test';

var seed = require('./seed')
  , app = require('../app')
  , macro = require('./macro');

vows.describe('confy').addBatch({
  'Database': {
    topic: function () {
      nano.db.list(this.callback)
    },
    'should be connected': function (err, body) {
      assert.isNull(err);
    }
  }
}).addBatch({
  'Database': {
    topic: function () {
      var callback = this.callback;

      nano.db.get('confy-test', function (err) {
        if (err && err.reason == 'no_db_file') {
          return nano.db.create('confy-test', callback)
        }

        nano.db.destroy('confy-test', function (err) {
          if (!err) nano.db.create('confy-test', callback);
        })
      });
    },
    'should be created': function (err, body) {
      assert.isNull(err);
    }
  }
}).addBatch({
  'Database': {
    topic: function () {
      nano.db.use('confy-test').bulk(seed, this.callback);
    },
    'should be seeded': function (err, body) {
      assert.isNull(err);
    }
  }
}).addBatch({
  'Redis': {
    topic: function () {
      var self = this;

      redis.flushall(function () {
        redis.mset([
          'confy_43fb9585328895005ca74bb33a1c46db5b835f2d', '{"_id":"users/pksunkara","username":"pksunkara","fullname":"Pavan Kumar Sunkara","email":"pavan.sss1991@gmail.com","type":"user","verified":true}',
          'confy_fad47f775369e976bcee4cdd1a6b263c3b7d1ade', '{"_id":"users/mdeiters","username":"mdeiters","fullname":"Matt Deiters","email":"mdeiters@gmail.com","type":"user","verified":true}'
        ], self.callback);
      });
    },
    'should be seeded': function (err, body) {
      assert.isNull(err);
    },
    'counting its keys': macro.redis(2, 'two')
  }
}).addBatch({
  'API Server': {
    topic: function () {
      return app;
    },
    'should be running': function (server) {
      assert.isNotNull(server);
    },
    'for non-existent url': {
      topic: function () {
        macro.get('/info', null, this.callback);
      },
      'should return 404': macro.status(404),
      'should return not found': function (err, res, body) {
        assert.deepEqual(body, {'message':'Not found'});
      }
    }
  }
}).addBatch({
  'OPTIONS method': {
    topic: function () {
      request({
        url: 'http://localhost:5000/',
        method: 'OPTIONS'
      }, this.callback);
    },
    'should return 200': macro.status(200),
    'should have CORS headers': function (err, res, body) {
      assert.deepEqual(res.headers['access-control-allow-origin'], 'http://localhost:8000');
      assert.deepEqual(res.headers['access-control-allow-methods'], 'OPTIONS,GET,POST,PATCH,PUT,DELETE');
      assert.deepEqual(res.headers['access-control-allow-headers'], 'Content-Type, Authorization');
    }
  }
}).addBatch(require('./users/create')(macro))
.addBatch(require('./users/login')(macro))
.addBatch(require('./users/logout')(macro))
.addBatch(require('./users/verify')(macro))
.addBatch(require('./users/update')(macro))
.addBatch(require('./users/verify')(macro))
.addBatch(require('./users/retrieve')(macro))
.addBatch(require('./orgs/create')(macro))
.addBatch(require('./orgs/retrieve')(macro))
.addBatch(require('./orgs/update')(macro))
.addBatch(require('./orgs/list')(macro))
.addBatch(require('./teams/create')(macro))
.addBatch(require('./teams/retrieve')(macro))
.addBatch(require('./teams/update')(macro))
.addBatch(require('./teams/list')(macro))
.addBatch(require('./projects/create')(macro))
.addBatch(require('./projects/retrieve')(macro))
.addBatch(require('./projects/update')(macro))
.addBatch(require('./projects/list')(macro))
.addBatch(require('./projects/access/add')(macro))
.addBatch(require('./projects/access/list')(macro))
.addBatch(require('./projects/access/remove')(macro))
.addBatch(require('./envs/create')(macro))
.addBatch(require('./envs/retrieve')(macro))
.addBatch(require('./envs/update')(macro))
.addBatch(require('./envs/list')(macro))
.addBatch(require('./envs/config/retrieve')(macro))
.addBatch(require('./envs/config/update')(macro))
.addBatch(require('./envs/versions')(macro))
.addBatch(require('./teams/projects')(macro))
.addBatch(require('./teams/members/add')(macro))
.addBatch(require('./teams/members/list')(macro))
.addBatch(require('./teams/members/remove')(macro))
.addBatch(require('./envs/delete')(macro))
.addBatch(require('./projects/delete')(macro))
.addBatch(require('./teams/delete')(macro))
.addBatch(require('./orgs/delete')(macro))
.addBatch(require('./heroku/provision')(macro))
.addBatch(require('./heroku/deprovision')(macro))
.addBatch(require('./heroku/retrieve')(macro))
.addBatch(require('./heroku/update')(macro))
.addBatch({
  'Redis': {
    topic: function () {
      redis.flushall(this.callback);
    },
    'should be flushed': function (err, body) {
      assert.isNull(err);
    },
    'counting its keys': macro.redis(0, 'zero')
  }
}).addBatch({
  'Database': {
    topic: function () {
      var callback = this.callback;
      nano.db.destroy('confy-test', function (err, body) {
        nano.db.get('confy-test', callback);
      })
    },
    'should be destroyed': function (err, body) {
      assert.equal(err.reason, 'no_db_file');
    }
  }
}).export(module);
