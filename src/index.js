import { OAuth2Strategy, InternalOAuthError } from 'passport-oauth';

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
export default class WechatTokenStrategy extends OAuth2Strategy {
  constructor(_options, _verify) {
    let options = _options || {};
    let verify = _verify;

    options.authorizationURL = options.authorizationURL || 'https://open.weixin.qq.com/connect/oauth2/authorize';
    options.tokenURL = options.tokenURL || 'https://open.weixin.qq.com/connect/oauth2/authorize';

    options.sessionKey = options.sessionKey || 'oauth:wechat';

    super(options, verify);

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
  authenticate(req, options) {
    let accessToken = (req.body && req.body[this._accessTokenField]) || (req.query && req.query[this._accessTokenField]);
    let refreshToken = (req.body && req.body[this._refreshTokenField]) || (req.query && req.query[this._refreshTokenField]);
    let userId = (req.body && req.body[this._userIdField]) || (req.query && req.query[this._userIdField]);

    if (!accessToken || !userId) return this.fail({message: `You should provide ${this._accessTokenField} and ${this._userIdField}`});

    // Following the link back to the application is interpreted as an authentication failure
    if (req.query && req.query.denied) return this.fail();

    this.userProfile(accessToken, refreshToken, userId, (error, profile) => {
      if (error) return this.error(error);

      const verified = (error, user, info) => {
        if (error) return this.error(error);
        if (!user) return this.fail(info);

        return this.success(user, info);
      };

      if (this._passReqToCallback) {
        this._verify(req, accessToken, refreshToken, profile, verified);
      } else {
        this._verify(accessToken, refreshToken, profile, verified);
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
  userProfile(accessToken, refreshToken, userId, done) {
    this._oauth2.get(this._profileURL + `?openId=${userId}`, accessToken, (error, body, res) => {
      if (error) return done(new InternalOAuthError('Failed to fetch user profile', error));

      try {
        let json = JSON.parse(body);

        if (!json.errcode) {
          let profile = {
            provider: 'wechat',
            id: json.unionid,
            username: json.openid,
            displayName: json.nickname,
            name: {
              familyName: '',
              givenName: '',
              middleName: ''
            },
            emails: [{value: ''}],
            photos: [{value: json.headimgurl}],
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
}