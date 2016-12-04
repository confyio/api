var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Orgs', function () {
    
    describe('Updating org with owner', function () {
      var ret = {};

      before(macro.patch('/orgs/fire-size', {
        email: 'admin@firesize.io',
        random: '1i3je738ujf',
        owner: 'hacked'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the org', function () {
        assert.equal(ret.body._id, 'orgs/fire-size');
        assert.equal(ret.body.name, 'Fire Size');
        assert.equal(ret.body.email, 'admin@firesize.io');
        assert.equal(ret.body.owner, 'jsmith');
        assert.equal(ret.body.type, 'org');
        assert.equal(ret.body.plan, 'none');
      });

      it('should not update random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should not return users list', function () {
        assert.isUndefined(ret.body.users);
      });
      
      describe('should update org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should have updated email', function () {
          assert.equal(ret.body.email, 'admin@firesize.io');
        });
      });
    });
    
    describe('Updating org with member', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio', {
        email: 'no-reply@confy.io',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });
      
      describe('should not update org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should have old email', function () {
          assert.equal(ret.body.email, 'admin@confy.io');
        });
      });
    });
    
    describe('Updating org with invalid email', function () {
      var ret = {};

      before(macro.patch('/orgs/fire-size', {
        email: 'invalid@email',
        random: '1i3je738ujf',
        owner: 'hacked'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'invalid']], ret);
      
      describe('should not update org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should have old email', function () {
          assert.equal(ret.body.email, 'admin@confy.io');
        });
      });
    });
  });
};
