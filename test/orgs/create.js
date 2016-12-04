var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Orgs', function () {
    
    describe('Creating them with missing params', function () {
      var ret = {};

      before(macro.post('/orgs', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(4, [], ret);
    });
    
    describe('Creating them with existing name', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'pksunkara', email: 'pk@sunkara.com'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'already_exists']], ret);
    });
    
    describe('Creating them with too short name', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'O', email: 'minlength@confytest.io'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });
    
    describe('Creating them with too lengthy name', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'Organization Management', email: 'maxlength@confytest.io'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });
    
    describe('Creating them with invalid name', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: '$@*', email: 'pk@sunkara.com'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });
    
    describe('Creating them with invalid email', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'John Smith', email: 'johnsmith@invalidemail'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'invalid']], ret);
    });
    
    describe('Creating them with heroku user', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'HerokuOrg', email: 'johnsmith@gmail.com',
      }, {user:'app123', pass:'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });
    
    describe('Creating them', function () {
      var ret = {};

      before(macro.post('/orgs', {
        name: 'Fire Size', email: 'johnsmith@gmail.com',
        random: '123xyz', owner: 'stuff'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(201, ret);

      it('should return org', function () {
        assert.equal(ret.body._id, 'orgs/fire-size');
        assert.equal(ret.body.name, 'Fire Size');
        assert.equal(ret.body.email, 'johnsmith@gmail.com');
        assert.equal(ret.body.owner, 'jsmith');
        assert.equal(ret.body.type, 'org');
        assert.equal(ret.body.plan, 'none');
      });

      it('should not save other keys', function () {
        assert.isUndefined(ret.body.random);
      });
      
      describe('should create org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should have user as owner', function () {
          assert.equal(ret.body.owner, 'jsmith');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {jsmith: 1});
        });

        it('should have default plan empty', function () {
          assert.equal(ret.body.plan, 'none');
        });
      });
      
      describe('should create default team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/teams/owners', ret));

        it('should be default for org', function () {
          assert.equal(ret.body.name, 'Owners');
          assert.equal(ret.body.type, 'team');
          assert.equal(ret.body.description, 'Has access to all projects');
          assert.equal(ret.body.org, 'fire-size');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {jsmith: true});
        });
      });
    });
  });
};
