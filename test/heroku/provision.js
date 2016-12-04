var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Heroku', function () {

    describe('Provisioning them without auth', function () {
      var ret = {};

      before(macro.post('/heroku/resources', {
        heroku_id: 'app456@heroku.com',
      }, {user:'app123', pass:'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });

    describe('Provisioning them with proper auth', function () {
      var ret = {};

      before(macro.post('/heroku/resources', {
        heroku_id: 'app456@heroku.com',
      }, {user:'confy', pass:'thisisasampleherokuaddonpassword'}, ret));

      macro.status(200, ret);

      it('should return response', function () {
        assert.equal(ret.body.id, 'app456');
        assert.equal(ret.body.config.CONFY_URL.substr(0, 14), 'http://app456:');
        assert.equal(ret.body.config.CONFY_URL.substr(34), '@localhost:5000/heroku/config');
      });

      describe('should create user doc and it', function () {
        var ret = {};

        before(macro.doc('users/app456', ret));

        it('should be verified', function () {
          assert.isTrue(ret.body.verified);
        });

        it('should be a heroku user', function () {
          assert.isTrue(ret.body.heroku);
        });
      });

      describe('should create default org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/app456', ret));

        it('should be default for user', function () {
          assert.equal(ret.body.name, 'app456');
          assert.equal(ret.body.type, 'org');
        });

        it('should have user as owner', function () {
          assert.equal(ret.body.owner, 'app456');
        });

        it('should have user email as billing email', function () {
          assert.equal(ret.body.email, 'app456@heroku.com');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {app456: 1});
        });

        it('should be on heroku plan', function () {
          assert.equal(ret.body.plan, 'heroku');
        });
      });

      describe('should create default team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/app456/teams/owners', ret));

        it('should be default for org', function () {
          assert.equal(ret.body.name, 'Owners');
          assert.equal(ret.body.type, 'team');
          assert.equal(ret.body.description, 'Has access to all projects');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {app456: true});
        });
      });

      describe('should create project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/app456/projects/app', ret));

        it('should have users from "owners" team', function () {
          assert.deepEqual(ret.body.users, {app456: 1});
        });

        it('should have access for default team', function () {
          assert.deepEqual(ret.body.teams, {owners: true});
        });
      });

      describe('should create env doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/app456/projects/app/envs/production', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });
  });
};
