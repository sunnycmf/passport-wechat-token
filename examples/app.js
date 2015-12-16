var express = require('express'),
    passport = require('passport'),
    WechatTokenStrategy = require('../'),
    util = require('util');

passport.serializeUser(function(user, callback) {
    callback(null, user);
});

passport.deserializeUser(function(obj, callback) {
    callback(null, obj);
});

var app = express();
app.use(require('morgan')('dev'));
// required for `state` support
app.use(require('cookie-session')({ secret: 'a keyboard cat' }));
// initialize for express
app.use(passport.initialize());
// passport session for express
app.use(passport.session());

if ('development' === app.get('env')) {
    app.use(require('errorhandler')());
}

// Auth
passport.use(new WechatTokenStrategy({
        clientID: '<CLIENT_ID>',
        clientSecret: '<CLIENT_SECRET>'
    }, function(accessToken, refreshToken, profile, done) {
        // console.log(util.inspect(profile));
        console.log(profile);
        done(null, profile);
    })
);

app.all('/auth/wechat/token', passport.authenticate('wechat-token', {session: false}), function(req, res) {
    // Congratulations, you're authenticated!
    res.send(req.user);
});

var server = app.listen(parseInt(process.env.NODE_PORT, 10) || 3000, function() {
  console.log('Listening on port %d', server.address().port);
});
