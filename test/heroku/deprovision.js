var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Heroku', function () {

    describe('Deprovisioning them without auth', function () {
      var ret = {};

      before(macro.delete('/heroku/resources/app456', {}, {user:'app123', pass:'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });

    describe('Deprovisioning them with proper auth', function () {
      var ret = {};

      before(macro.delete('/heroku/resources/app456', {}, {
        user:'confy', pass:'thisisasampleherokuaddonpassword'
      }, ret));

      macro.status(200, ret);

      it('should delete user doc', macro.nodoc('users/app456', 'deleted'));
      it('should delete org doc', macro.nodoc('orgs/app456', 'deleted'));
      it('should delete project doc', macro.nodoc('orgs/app456/projects/app', 'deleted'));
      it('should delete team doc', macro.nodoc('orgs/app456/teams/owners', 'deleted'));
      it('should delete environment doc', macro.nodoc('orgs/app456/projects/app/envs/production', 'deleted'));
    });
  });
};
