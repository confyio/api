module.exports = function (app, user) {

  var body = {
    text: "Hi " + user.username + ",\n\nYou have requested a new password for your Confy account."
    + "\n\nClick on the following link to reset it within one hour.\n"
    + app.get('weburl') + "/#forgot/" + user.email + "/" + user.reset_token
    + "\n\nThanks!\n\n- The Confy team",
    subject: "Confy account reset password"
  };

  return body;
};
