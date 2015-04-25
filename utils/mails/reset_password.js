module.exports = function (app, user) {

  var body = {
    text: "Hi " + user.username + ",\n\nYou have successfully reset your password for Confy account."
    + "\n\nThanks!\n\n- The Confy team",
    subject: "Confy account reset password was successful"
  };

  return body;
};
