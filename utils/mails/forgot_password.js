module.exports = function (app, user) {

  var body = {
    text: "Hi " + user.username + ",\n\nYou have requested a new password for your Confy account.\n\nClick on the following link to reset it within one hour.\n" + app.get('weburl') + "/#forgot/" + user.username + "/" + user.reset_token + "\n\nThanks!\n\n- The Confy team",
    subject: "Reset your Confy account password"
  };

  return body;
};
