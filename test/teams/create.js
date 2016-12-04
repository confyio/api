var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Creating them using non-member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/teams', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Creating them using member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/teams', {}, {user:'vanstee', pass:'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });
    });

    describe('Creating them with missing params', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(3, [], ret);
    });

    describe('Creating them with existing name', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {
        name: 'Owners', description: 'Developers'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'already_exists']], ret);
    });

    describe('Creating them with too short name', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {
        name: 'T', description: 'Short Name'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with too lengthy name', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {
        name: 'Teams Management', description: 'Lengthy Name'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with invalid name', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {
        name: '$@*', description: 'Developers'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with heroku user', function () {
      var ret = {};

      before(macro.post('/orgs/app123/teams', {
        name: 'Engineering', description: 'Developers'
      }, {user:'app123', pass:'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });

    describe('Creating them', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams', {
        name: 'Dev Gods', description: 'Developers',
        random: '1e3', org: 'confyio'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(201, ret);

      it('should return team', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/teams/dev-gods');
        assert.equal(ret.body.name, 'Dev Gods');
        assert.equal(ret.body.description, 'Developers');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'team');
      });

      it('should not save other keys', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should return users as array', function () {
        assert.lengthOf(ret.body.users, 1);
      });

      it('should have org owner as default user', function () {
        assert.equal(ret.body.users[0], 'jsmith');
      });

      describe('should create team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/teams/dev-gods', ret));

        it('should have owner in list of users', function () {
          assert.deepEqual(ret.body.users, {jsmith: true});
        });
      });

      describe('should update org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should update owner count in users', function () {
          assert.equal(ret.body.users['jsmith'], 2);
        });
      });
    });
  });
};
