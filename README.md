# Confy [![Build Status](https://travis-ci.org/confyio/confy.svg)](https://travis-ci.org/confyio/confy)

_Easily Manage your Software Credentials_

A good web app stores it's credentials in environment vars. As the number of credentials is high, developers can use "Confy" to pull them from the cloud using a single environment var.

## Development

Prerequisites are:

 * Node.js __v6__
 * CouchDB __v1.2.x__ [dbname: confy]
 * Redis __v2.8.x__

```bash
$ git clone git://github.com/confyio/confy && cd confy

$ export MAILGUN_API_KEY="key-ivd0lsd91b1bvw31mw7"
$ export MAILGUN_DOMAIN="sample.mailgun.org"

# Setup development requirements and seed development database
$ npm install && node test/setup.js

# Start the application
$ node app.js
```

## Idea

**Confy** is a **SaaS** product where developers can manage their software credentials (also known as application config) by storing them in the cloud and retrieve them when starting up their app.

An app’s **config** is everything that is likely to vary between deploys (staging, production, developer environments, etc). This includes:

* Resource handles to the database, Memcached, and other backing services
* Credentials to external services such as Amazon S3 or Twitter
* Per-deploy values such as the canonical hostname for the deploy

The most popular approach to config currently is the use of config files such as `config/database.yml` in Rails. The main drawback of this is that its easy for the developer to check in a config file to the repo. We have all seen some popular HN posts about problems appearing out of this practice.

Heroku and other platforms encourage using environment variables for storing config. But it takes a lot of effort to both setup and maintain them.

**Confy** proposes a new method of approach for this problem. Developer sets a single environment variable. This is used by _confy module/package_ in their app to load the config from the cloud.

> A litmus test for whether an app has all config correctly factored out of the code is whether the codebase could be made open source at any moment, without compromising any credentials.

The above proposed approach passes the above litmus test.

_(A few of the above quotes are taken directly from [12factor.net](http://12factor.net))_
