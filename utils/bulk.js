var bcrypt = require('bcrypt');

var cryptPass = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

module.exports = function (app) {
  app.bulk = {};

  app.bulk.env = function (env, project) {
    env.type = 'env';
    env.org = project.org;
    env.project = app.utils.slug(project);
    env.config = {};
    env.versions = [{ config: {}, time: Date.now() }];
    env._id = project._id + '/envs/' + app.utils.idify(env.name);

    return { docs: [env] };
  }

  app.bulk.project = function (project, org) {
    project.type = 'project';
    project.org = app.utils.slug(org);
    project.teams = {'owners': true};
    project._id = org._id + '/projects/' + app.utils.idify(project.name);

    var env = {
      name: 'Production', description: 'Production environment'
    };

    var tmp = app.bulk.env(env, project);
    tmp.docs.unshift(project);

    return tmp;
  };

  app.bulk.org = function (org, user) {
    org.plan = 'none';
    org.type = 'org';
    org.owner = user.username;

    if (!org._id) {
      org._id = 'orgs/' + app.utils.idify(org.name);
    }

    org.users = {};
    org.users[user.username] = 1;

    var team = {
      _id: org._id + '/teams/owners', name: 'Owners', description: 'Has access to all projects',
      type: 'team', org: app.utils.slug(org), users: {}
    };

    team.users[user.username] = true;

    return { docs: [org, team] };
  };

  app.bulk.user = function (user) {
    user.password = cryptPass(user.password);
    user.type = 'user';
    user._id = 'users/' + user.username;

    var org = {
      _id: 'orgs/' + user.username, name: user.fullname, email: user.email
    };

    var tmp = app.bulk.org(org, user);
    tmp.docs.unshift(user);

    return tmp;
  };

  app.bulk.heroku = function (user) {
    var project = {
      name: 'App', description: 'Heroku application', users: {}
    };

    project.users[user.username] = true;

    var tmp = app.bulk.user(user);

    tmp.docs[1].plan = 'heroku';
    tmp.docs = tmp.docs.concat(app.bulk.project(project, tmp.docs[1]).docs);

    return tmp;
  };
};
