var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Heroku', function () {

    describe('Retrieving config with non-heroku user', function () {
      var ret = {};

      before(macro.get('/heroku/config', {user:'jsmith', pass:'secret'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });

    describe('Retrieving config with heroku user', function () {
      var ret = {};

      before(macro.get('/heroku/config', {user:'app123', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return config', function () {
        assert.deepEqual(ret.body, {'port': 8000});
      });
    });
  });
};
