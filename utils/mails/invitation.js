module.exports = function (app, obj) {

  var body = {
    text: "Hi " + obj.email + ",\n\nYou have been invited to join the " + obj.team.name + " team of " + obj.org.name + " organization at Confy by " + obj.user.fullname + ".\n\nPlease click the following link to register an account for accepting the invitation.\n\n" + app.get('weburl') + "/#register\n\nThanks!\n\n- The Confy team",
    subject: "Invited to Confy by " + obj.user.fullname
  };

  return body;
};
