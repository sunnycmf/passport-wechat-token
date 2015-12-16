# passport-weibo-token

[![Build Status](https://travis-ci.org/drudge/passport-weibo-token.svg)](https://travis-ci.org/drudge/passport-weibo-token)
[![Coverage Status](https://coveralls.io/repos/drudge/passport-weibo-token/badge.svg?branch=master&service=github)](https://coveralls.io/github/drudge/passport-weibo-token?branch=master)
![Downloads](https://img.shields.io/npm/dm/passport-weibo-token.svg)
![Downloads](https://img.shields.io/npm/dt/passport-weibo-token.svg)
![npm version](https://img.shields.io/npm/v/passport-weibo-token.svg)
![dependencies](https://img.shields.io/david/drudge/passport-weibo-token.svg)
![dev dependencies](https://img.shields.io/david/dev/drudge/passport-weibo-token.svg)
![License](https://img.shields.io/npm/l/passport-weibo-token.svg)

[Passport](http://passportjs.org/) strategy for authenticating with [Sina Weibo](http://www.weibo.com/)
access tokens using the OAuth 2.0 API.
If you are looking for Web integration, please refer to [passport-sina](https://github.com/kfll/passport-sina)

This module lets you authenticate using Facebook in your Node.js applications.
By plugging into Passport, Facebook authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

Inspired from [passport-facebook-token](https://github.com/drudge/passport-facebook-token)

## Installation

    $ npm install passport-weibo-token

## Usage

### Configure Strategy

The Sina Weibo authentication strategy authenticates users using a Weibo
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID and app secret.

```js
var WeiboTokenStrategy = require('passport-weibo-token');

passport.use(new WeiboTokenStrategy({
    clientID: WEIBO_APP_ID,
    clientSecret: WEIBO_APP_SECRET
  }, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({weiboId: profile.id}, function (error, user) {
      return done(error, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'weibo-token'` strategy, to authenticate requests.

```js
app.post('/auth/weibo/token',
  passport.authenticate('weibo-token'),
  function (req, res) {
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);
```

Or using Sails framework:

```javascript
// api/controllers/AuthController.js
module.exports = {
  weibo: function(req, res) {
    passport.authenticate('weibo-token', function(error, user, info) {
      // do stuff with user
      res.ok();
    })(req, res);
  }
};
```

The post request to this route should include POST or GET data with the keys `access_token` and optionally, `refresh_token` set to the credentials you receive from Sina Weibo.

```
GET /auth/weibo/token?access_token=<TOKEN_HERE>
```

## Credits

  - [Nicholas Penree](http://github.com/drudge)
  - [Jared Hanson](http://github.com/jaredhanson)
  - [Eugene Obrezkov](http://github.com/ghaiklor)

## License

The MIT License (MIT)

Copyright (c) 2015 Nicholas Penree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.