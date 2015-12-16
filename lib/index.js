'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _passportOauth = require('passport-oauth');

/**
 * `WechatTokenStrategy` constructor.
 *
 * The Twitter authentication strategy authenticates requests by delegating to
 * Twitter using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to Twitter
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *
 * @param {Object} options
 * @param {Function} verify
 * @example
 * passport.use(new WechatTokenStrategy({
 *   consumerKey: '123456789',
 *   consumerSecret: 'shhh-its-a-secret'
 * }), function(token, tokenSecret, profile, done) {
 *   User.findOrCreate({twitterId: profile.id}, function(error, user) {
 *     done(error, user);
 *   });
 * });
 */

var WechatTokenStrategy = (function (_OAuth2Strategy) {
  _inherits(WechatTokenStrategy, _OAuth2Strategy);

  function WechatTokenStrategy(_options, _verify) {
    _classCallCheck(this, WechatTokenStrategy);

    var options = _options || {};
    var verify = _verify;

    options.authorizationURL = options.authorizationURL || 'https://open.weixin.qq.com/connect/oauth2/authorize';
    options.tokenURL = options.tokenURL || 'https://open.weixin.qq.com/connect/oauth2/authorize';

    options.sessionKey = options.sessionKey || 'oauth:wechat';

    _get(Object.getPrototypeOf(WechatTokenStrategy.prototype), 'constructor', this).call(this, options, verify);

    this.name = 'wechat-token';
    this._accessTokenField = options.accessTokenField || 'access_token';
    this._refreshTokenField = options.refreshTokenField || 'refresh_token';

    this._oauthTokenField = options.oauthTokenField || 'oauth_token';
    this._oauthTokenSecretField = options.oauthTokenSecretField || 'oauth_token_secret';
    this._userIdField = options.userIdField || 'openid';
    this._profileURL = options.profileURL || 'https://api.weixin.qq.com/sns/userinfo';
    this._clientSecret = options.clientSecret;
    this._enableProof = typeof options.enableProof === 'boolean' ? options.enableProof : true;
    this._passReqToCallback = options.passReqToCallback;

    // skip default user profile flow
    this._skipUserProfile = true;
  }

  /**
   * Authenticate request by delegating to Twitter using OAuth.
   * @param {Object} req
   */

  _createClass(WechatTokenStrategy, [{
    key: 'authenticate',
    value: function authenticate(req, options) {
      var _this = this;

      var accessToken = req.body && req.body[this._accessTokenField] || req.query && req.query[this._accessTokenField];
      var refreshToken = req.body && req.body[this._refreshTokenField] || req.query && req.query[this._refreshTokenField];
      var userId = req.body && req.body[this._userIdField] || req.query && req.query[this._userIdField];

      if (!accessToken || !userId) return this.fail({ message: 'You should provide ' + this._accessTokenField + ' and ' + this._userIdField });

      // Following the link back to the application is interpreted as an authentication failure
      if (req.query && req.query.denied) return this.fail();

      this.userProfile(accessToken, refreshToken, userId, function (error, profile) {
        if (error) return _this.error(error);

        var verified = function verified(error, user, info) {
          if (error) return _this.error(error);
          if (!user) return _this.fail(info);

          return _this.success(user, info);
        };

        if (_this._passReqToCallback) {
          _this._verify(req, accessToken, refreshToken, profile, verified);
        } else {
          _this._verify(accessToken, refreshToken, profile, verified);
        }
      });
    }

    /**
     * Retrieve user profile from Twitter.
     * @param {String} token
     * @param {String} tokenSecret
     * @param {Object} params
     * @param {Function} done
     */
  }, {
    key: 'userProfile',
    value: function userProfile(accessToken, refreshToken, userId, done) {
      this._oauth2.get(this._profileURL + ('?openId=' + userId), accessToken, function (error, body, res) {
        if (error) return done(new _passportOauth.InternalOAuthError('Failed to fetch user profile', error));

        console.log(error);
        console.log(body);

        try {
          var json = JSON.parse(body);

          if (!json.errcode) {
            var profile = {
              provider: 'wechat',
              id: json.unionid,
              username: json.openid,
              displayName: json.nickname,
              name: {
                familyName: '',
                givenName: '',
                middleName: ''
              },
              emails: [{ value: '' }],
              photos: [{ value: json.headimgurl }],
              _raw: body,
              _json: json
            };

            done(null, profile);
          } else {
            done(new Error(json), null);
          }
        } catch (e) {
          done(e);
        }
      });
    }
  }]);

  return WechatTokenStrategy;
})(_passportOauth.OAuth2Strategy);

exports['default'] = WechatTokenStrategy;
module.exports = exports['default'];