var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Creating them using non-member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Creating them using member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {}, {user:'vanstee', pass:'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });
    });

    describe('Creating them with missing params', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(3, [], ret);
    });

    describe('Creating them with existing name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {
        name: 'Main', description: 'Main'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'already_exists']], ret);
    });

    describe('Creating them with too short name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {
        name: 'P', description: 'Short Name'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with too lengthy name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {
        name: 'Project Management', description: 'Lengthy Name'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with invalid name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects', {
        name: '$@*', description: 'Main'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with heroku user', function () {
      var ret = {};

      before(macro.post('/orgs/app123/projects', {
        name: 'Main', description: 'Main'
      }, {user:'app123', pass:'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });

    describe('Creating them', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects', {
        name: 'Main App', description: 'Main web application',
        random: '1e3', org: 'confyio'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(201, ret);

      it('should return project', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/projects/main-app');
        assert.equal(ret.body.name, 'Main App');
        assert.equal(ret.body.description, 'Main web application');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'project');
      });

      it('should not save other keys', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should have access for default team', function () {
        assert.deepEqual(ret.body.teams, ['owners']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body.users);
      });

      describe('should create project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app', ret));

        it('should have users from "owners" team', function () {
          assert.deepEqual(ret.body.users, {jsmith: 1});
        });

        it('should have access for default team', function () {
          assert.deepEqual(ret.body.teams, {owners:true});
        });
      });

      describe('should create project environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app/envs/production', ret));

        it('should have token', function () {
          assert.isDefined(ret.body.token);
        });
      });
    });
  });
};
