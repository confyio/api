var path = require('path')
  , fs = require('fs')
  , mailgun = require('mailgun-js');

module.exports = function (app) {

  var mail = new mailgun({
    apiKey: app.get('mailgun-key'),
    domain: app.get('mailgun-domain')
  });

  app.mail = {};

  var files = fs.readdirSync(path.join(__dirname, 'mails'));

  files.forEach(function (file) {
    file = path.basename(file, '.js');

    app.mail[file] = function (email, obj, callback) {
      var body = require('./mails/' + file)(app, obj);

      body.from = 'Confy <support@confy.io>';
      body.to = email;

      if (app.get('env') !== 'test') {
        mail.messages().send(body, callback);
      } else return callback(null, {});
    };
  });

  app.mail.dummy = function (email, obj, callback) {
    return callback(null, {});
  };

  app.mail.list = function (list, user, callback) {
    mail.lists(list + '@' + app.get('mailgun-domain')).members().create({
      subscribed: true,
      address: user.email,
      name: user.fullname,
      upsert: 'yes'
    }, callback);
  };

};
