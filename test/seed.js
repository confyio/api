module.exports = {
  "docs": [
    {
      "_id": "_design/envs",
      "language": "javascript",
      "views": {
        "project": {
          "map": "function(doc) {\n\tif (doc.type == 'env') {\n\t\temit(doc.org + '/' + doc.project, doc);\n\t}\n}"
        },
        "org": {
          "map": "function(doc) {\n\tif (doc.type == 'env') {\n\t\temit(doc.org, doc);\n\t}\n}"
        },
        "name": {
          "map": "function(doc) {\n\tif (doc.type == 'env') {\n\t\temit(doc.org + '/' + doc.project + '/' + doc.name.toLowerCase().replace(/\\ /g, '-'), doc);\n\t}\n}"
        },
        "token": {
          "map": "function(doc) {\n\tif (doc.type == 'env') {\n\t\temit(doc.org + '/' + doc.token, doc);\n\t}\n}"
        }
      }
    },
    {
      "_id": "_design/orgs",
      "language": "javascript",
      "views": {
        "name": {
          "map": "function(doc) {\n\tif (doc.type == 'org') {\n\t\temit(doc._id.split('/').slice(-1)[0], doc);\n\t}\n}"
        },
        "user": {
          "map": "function(doc) {\n\tif (doc.type == 'org') {\n\t\tObject.keys(doc.users).forEach(function (user) {\n\t\t\temit(user, doc);\n\t\t});\n\t}\n}"
        }
      }
    },
    {
      "_id": "_design/projects",
      "language": "javascript",
      "views": {
        "name": {
          "map": "function(doc) {\n\tif (doc.type == 'project') {\n\t\temit(doc.org + '/' + doc.name.toLowerCase().replace(/\\ /g, '-'), doc);\n\t}\n}"
        },
        "user": {
          "map": "function(doc) {\n\tif (doc.type == 'project') {\n\t\tObject.keys(doc.users).forEach(function (user) {\n\t\t\temit(doc.org + '/' + user, doc);\n\t\t});\n\t}\n}"
        },
        "org": {
          "map": "function (doc) {\n\tif (doc.type == 'project') {\n\t\temit(doc.org, doc);\n\t}\n}"
        },
        "team": {
          "map": "function(doc) {\n\tif (doc.type == 'project') {\n\t\tObject.keys(doc.teams).forEach(function (team) {\n\t\t\temit(doc.org + '/' + team, doc);\n\t\t});\n\t}\n}"
        }
      }
    },
    {
      "_id": "_design/teams",
      "language": "javascript",
      "views": {
        "name": {
          "map": "function(doc) {\n\tif (doc.type == 'team') {\n\t\temit(doc.org + '/' + doc.name.toLowerCase().replace(/\\ /g, '-'), doc);\n\t}\n}"
        },
        "org": {
          "map": "function (doc) {\n\tif (doc.type == 'team') {\n\t\temit(doc.org, doc);\n\t}\n}"
        },
        "user": {
          "map": "function(doc) {\n\tif (doc.type == 'team') {\n\t\tObject.keys(doc.users).forEach(function (user) {\n\t\t\temit(doc.org + '/' + user, doc);\n\t\t});\n\t}\n}"
        }
      }
    },
    {
      "_id": "_design/users",
      "language": "javascript",
      "views": {
        "email": {
          "map": "function(doc) {\n\tif (doc.type == 'user') {\n\t\temit(doc.email, doc);\n\t}\n}"
        },
        "token": {
          "map": "function(doc) {\n\tif (doc.type == 'user' && doc.access_token) {\n\t\temit(doc.access_token, doc);\n\t}\n}"
        },
        "username": {
          "map": "function(doc) {\n\tif (doc.type == 'user') {\n\t\temit(doc.username, doc);\n\t}\n}"
        }
      }
    },
    {
      "_id": "orgs/confyio",
      "name": "Confyio",
      "email": "admin@confy.io",
      "type": "org",
      "owner": "pksunkara",
      "plan": "none",
      "users": {
        "pksunkara": 4,
        "whatupdave": 1,
        "vanstee": 1,
        "shea": 1
      }
    },
    {
      "_id": "orgs/confyio/projects/knowledge-base",
      "name": "Knowledge Base",
      "description": "Wiki & FAQ support",
      "type": "project",
      "teams": {
        "owners": true,
        "consultants": true
      },
      "org": "confyio",
      "users": {
        "pksunkara": 2,
        "whatupdave": 1,
        "vanstee": 1
      }
    },
    {
      "_id": "orgs/confyio/projects/main",
      "name": "Main",
      "description": "Main app",
      "type": "project",
      "teams": {
        "owners": true,
        "engineering": true
      },
      "org": "confyio",
      "users": {
        "pksunkara": 2
      }
    },
    {
      "_id": "orgs/confyio/projects/url-shortener",
      "name": "Url Shortener",
      "description": "Service to be used by bots",
      "type": "project",
      "teams": {
        "owners": true
      },
      "org": "confyio",
      "users": {
        "pksunkara": 1
      }
    },
    {
      "_id": "orgs/confyio/projects/knowledge-base/envs/production",
      "name": "Production",
      "description": "Production environment",
      "org": "confyio",
      "project": "knowledge-base",
      "type": "env",
      "token": "e3badca8afdcb3cc2603666865cd0eb66c011ee8",
      "config": "EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==",
      "versions": [
        {
          "config": "EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==",
          "user": "pksunkara",
          "time": 1427638419608
        },
        {
          "config": {
            "port": 8000,
            "database": {
              "port": 5984,
              "url": "http://db.confy.io",
              "name": "support"
            }
          },
          "user": "vanstee",
          "time": 1427633285584
        }
      ]
    },
    {
      "_id": "orgs/confyio/projects/main/envs/production",
      "name": "Production",
      "description": "Production environment",
      "org": "confyio",
      "project": "main",
      "type": "env",
      "token": "b3587b32be5a0cd7043680090b1af780e473cb5b",
      "config": {
        "port": 5000,
        "name": "confy",
        "database": {
          "port": 5984,
          "url": "http://db.confy.io",
          "user": "admin",
          "pass": "secret"
        }
      },
      "versions": [
        {
          "config": {
            "port": 5000,
            "name": "confy",
            "database": {
              "port": 5984,
              "url": "http://db.confy.io",
              "user": "admin",
              "pass": "secret"
            }
          },
          "user": "pksunkara",
          "time": 1427638419608
        }
      ]
    },
    {
      "_id": "orgs/confyio/projects/main/envs/staging",
      "name": "Staging",
      "description": "Staging environment",
      "org": "confyio",
      "project": "main",
      "type": "env",
      "token": "e677fd908735ae87d7c45b0649436f4ff6d5752c",
      "config": {
        "port": 5000,
        "name": "confy",
        "database": {
          "port": 5984,
          "url": "http://localhost"
        }
      },
      "versions": [
        {
          "config": {
            "port": 5000,
            "name": "confy",
            "database": {
              "port": 5984,
              "url": "http://localhost"
            }
          },
          "user": "pksunkara",
          "time": 1427638419608
        }
      ]
    },
    {
      "_id": "orgs/confyio/projects/main/envs/qa",
      "name": "QA",
      "description": "Quality assurance guys",
      "org": "confyio",
      "project": "main",
      "type": "env",
      "token": "4a80b9373574c2cd157b4ade3e28dc25dd0c3efa",
      "config": {
        "port": 5000,
        "name": "confy",
        "database": {
          "port": 5984,
          "url": "http://staging.confy.io",
          "user": "admin",
          "pass": "secret"
        }
      },
      "versions": [
        {
          "config": {
            "port": 5000,
            "name": "confy",
            "database": {
              "port": 5984,
              "url": "http://staging.confy.io",
              "user": "admin",
              "pass": "secret"
            }
          },
          "user": "pksunkara",
          "time": 1427638419608
        }
      ]
    },
    {
      "_id": "orgs/confyio/projects/url-shortener/envs/production",
      "name": "Production",
      "description": "Production environment",
      "org": "confyio",
      "project": "url-shortener",
      "type": "env",
      "token": "8f32385d69001b7a44c37c73489a2e3fd4cbbf32",
      "config": {
        "port": 3333,
        "database": {
          "port": 5984,
          "url": "http://db.confy.io",
          "name": "url"
        }
      },
      "versions": [
        {
          "config": {
            "port": 3333,
            "database": {
              "port": 5984,
              "url": "http://db.confy.io",
              "name": "url"
            }
          },
          "user": "pksunkara",
          "time": 1427638024748
        }
      ]
    },
    {
      "_id": "orgs/confyio/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "type": "team",
      "users": {
        "pksunkara": true
      },
      "org": "confyio"
    },
    {
      "_id": "orgs/confyio/teams/consultants",
      "name": "Consultants",
      "description": "Consultants will have restricted access to the projects",
      "users": {
        "pksunkara": true,
        "whatupdave": true,
        "vanstee": true
      },
      "org": "confyio",
      "type": "team"
    },
    {
      "_id": "orgs/confyio/teams/engineering",
      "name": "Engineering",
      "description": "Engineers in the company",
      "users": {
        "pksunkara": true
      },
      "org": "confyio",
      "type": "team"
    },
    {
      "_id": "orgs/confyio/teams/designers",
      "name": "Designers",
      "description": "Designers in the company",
      "users": {
        "pksunkara": true,
        "shea": true
      },
      "org": "confyio",
      "type": "team"
    },
    {
      "_id": "orgs/app123/projects/app",
      "name": "App",
      "description": "Heroku application",
      "type": "project",
      "teams": {
        "owners": true
      },
      "org": "app123",
      "users": {
        "app123": 1
      }
    },
    {
      "_id": "orgs/app123/projects/app/envs/production",
      "name": "Production",
      "description": "Production environment",
      "org": "app123",
      "project": "app",
      "type": "env",
      "token": "bcabb12af54350e15712931587024c23e630372c",
      "config": {
        "port": 8000
      },
      "versions": [
        {
          "config": {
            "port": 8000
          },
          "user": "pksunkara",
          "time": 1427634005584
        },
        {
          "config": {
            "port": 8001
          },
          "user": "pksunkara",
          "time": 1427633915584
        },
        {
          "config": {
            "port": 8002
          },
          "user": "pksunkara",
          "time": 1427633825584
        },
        {
          "config": {
            "port": 8003
          },
          "user": "pksunkara",
          "time": 1427633735584
        },
        {
          "config": {
            "port": 8004
          },
          "user": "pksunkara",
          "time": 1427633645584
        },
        {
          "config": {
            "port": 8005
          },
          "user": "shea",
          "time": 1427633555584
        },
        {
          "config": {
            "port": 8006
          },
          "user": "pksunkara",
          "time": 1427633465584
        },
        {
          "config": {
            "port": 8007
          },
          "user": "pksunkara",
          "time": 1427633375584
        },
        {
          "config": {
            "port": 8008
          },
          "user": "shea",
          "time": 1427633285584
        },
        {
          "config": {
            "port": 8009
          },
          "user": "pksunkara",
          "time": 1427633195584
        }
      ]
    },
    {
      "_id": "orgs/app123",
      "name": "app123",
      "email": "app123@heroku.com",
      "type": "org",
      "owner": "app123",
      "plan": "heroku",
      "users": {
        "app123": 1
      }
    },
    {
      "_id": "orgs/app123/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "app123": true
      },
      "org": "app123",
      "type": "team"
    },
    {
      "_id": "orgs/pksunkara",
      "name": "Pavan Kumar Sunkara",
      "email": "pavan.sss1991@gmail.com",
      "type": "org",
      "owner": "pksunkara",
      "plan": "none",
      "users": {
        "pksunkara": 1
      }
    },
    {
      "_id": "orgs/pksunkara/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "pksunkara": true
      },
      "org": "pksunkara",
      "type": "team"
    },
    {
      "_id": "orgs/sunkara",
      "name": "Sunkara",
      "email": "pavan.sss1991@gmail.com",
      "type": "org",
      "owner": "pksunkara",
      "plan": "none",
      "users": {
        "pksunkara": 1
      }
    },
    {
      "_id": "orgs/sunkara/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "pksunkara": true
      },
      "org": "sunkara",
      "type": "team"
    },
    {
      "_id": "orgs/vanstee",
      "name": "Patrick Van Stee",
      "email": "patrick@vanstee.me",
      "type": "org",
      "owner": "vanstee",
      "plan": "none",
      "users": {
        "vanstee": 1
      }
    },
    {
      "_id": "orgs/vanstee/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "vanstee": true
      },
      "org": "vanstee",
      "type": "team"
    },
    {
      "_id": "orgs/whatupdave",
      "name": "Dave Newman",
      "email": "dave@snappyco.de",
      "type": "org",
      "owner": "whatupdave",
      "plan": "none",
      "users": {
        "whatupdave": 1
      }
    },
    {
      "_id": "orgs/whatupdave/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "whatupdave": true
      },
      "org": "whatupdave",
      "type": "team"
    },
    {
      "_id": "orgs/mdeiters",
      "name": "mdeiters",
      "email": "mdeiters@gmail.com",
      "owner": "mdeiters",
      "plan": "none",
      "type": "org",
      "users": {
        "mdeiters": 1
      }
    },
    {
      "_id": "orgs/mdeiters/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "mdeiters": true
      },
      "org": "mdeiters",
      "type": "team"
    },
    {
      "_id": "orgs/shea",
      "name": "shea",
      "email": "knifeandfox@gmail.com",
      "owner": "shea",
      "plan": "none",
      "type": "org",
      "users": {
        "shea": 1
      }
    },
    {
      "_id": "orgs/shea/teams/owners",
      "name": "Owners",
      "description": "Has access to all projects",
      "users": {
        "shea": true
      },
      "org": "shea",
      "type": "team"
    },
    {
      "_id": "users/app123",
      "username": "app123",
      "email": "app123@heroku.com",
      "password": "$2a$10$h.tbQoE/vDHq1eZuT0o0guXz1k/vh9ffQIHaJ0PTWUpnSziOFvcba",
      "type": "user",
      "verified": true,
      "heroku": true
    },
    {
      "_id": "users/pksunkara",
      "username": "pksunkara",
      "fullname": "Pavan Kumar Sunkara",
      "email": "pavan.sss1991@gmail.com",
      "password": "$2a$10$h.tbQoE/vDHq1eZuT0o0guXz1k/vh9ffQIHaJ0PTWUpnSziOFvcba",
      "type": "user",
      "verified": true
    },
    {
      "_id": "users/vanstee",
      "username": "vanstee",
      "fullname": "Patrick Van Stee",
      "email": "patrick@vanstee.me",
      "password": "$2a$10$5eJFpD749KIaUXHhK/LVHOH3uQW1fdyJkZV7VLKpEEccDKDzB.dq6",
      "type": "user",
      "verified": true
    },
    {
      "_id": "users/whatupdave",
      "username": "whatupdave",
      "fullname": "Dave Newman",
      "email": "dave@snappyco.de",
      "password": "$2a$10$zLU2YvIuUH8EiGgqOc0g.exDZXobiXlfLy20yifWnuD/7xqvaxl3y",
      "access_token": "6b6669d493a7b9e375741e34c2b3a1fea38df3a7",
      "type": "user",
      "verified": true
    },
    {
      "_id": "users/mdeiters",
      "username": "mdeiters",
      "fullname": "Matt Deiters",
      "email": "mdeiters@gmail.com",
      "password": "$2a$10$MLXwXjnxk1covLgEaAR8YeOQYQcO7INoHpfkIDi3.7pmwtsJbGw6.",
      "type": "user",
      "verified": true
    },
    {
      "_id": "users/shea",
      "username": "shea",
      "fullname": "Shea Lewis",
      "email": "knifeandfox@gmail.com",
      "password": "$2a$10$MLXwXjnxk1covLgEaAR8YeOQYQcO7INoHpfkIDi3.7pmwtsJbGw6.",
      "type": "user",
      "verified": true
    },
    {
      "_id": "invites/jksmithorg@gmail.com",
      "org": "orgs/none",
      "team": "orgs/none/teams/owners",
      "type": "invite"
    },
    {
      "_id": "invites/jksmithteam@gmail.com",
      "org": "orgs/confyio",
      "team": "orgs/confyio/teams/none",
      "type": "invite"
    }
  ]
};
