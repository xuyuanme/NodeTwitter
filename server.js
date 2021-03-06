'use strict'

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express')
var oauth = require('oauth')
var util = require('util')
var session = require('express-session')
var cors = require('cors')
var config = require('./config.js')

var reactTwitterAppName = 'reacttwitter'
var _requestTokenAppCallBackUrl = reactTwitterAppName + '://foo'
var _requestTokenWebCallBackUrl = 'http://localhost:8080/' + reactTwitterAppName + '/callback'

var consumer = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  config.twitterConsumerKey, config.twitterConsumerSecret, '1.0A', _requestTokenAppCallBackUrl, 'HMAC-SHA1'
)

var _tApiProfile = 'https://api.twitter.com/1.1/account/verify_credentials.json'

var port = process.env.PORT || 8483    // set our port
var app = express()         // define our app using express
app.use(session({secret: 'React Twitter Secret'}))

// Enable cors request and cookies for localhost debug
var corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true
};
app.use(cors(corsOptions))

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router()        // get an instance of the express Router

router.get('/requestToken', function (req, res) {
  console.log('Get /twitter/requestToken')

  if (isAppClient(req)) {
    consumer._authorize_callback = _requestTokenAppCallBackUrl
  } else {
    consumer._authorize_callback = _requestTokenWebCallBackUrl
  }

  consumer.getOAuthRequestToken(
    function (error, oauthToken, oauthTokenSecret, results) {
      if (error) {
        handleError(req, res, error)
      } else {
        console.log('Set request token to sessionID ' + req.sessionID)
        req.session.oauthRequestToken = oauthToken
        req.session.oauthRequestTokenSecret = oauthTokenSecret
        console.log(req.session)

        res.json({'oauthRequestToken': req.session.oauthRequestToken})
        console.log('Complete /twitter/requestToken')
      }
    }
  )
})

router.get('/accessToken', function (req, res) {
  console.log('Get /twitter/accessToken')
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier,
    function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        console.log('Error results: ' + util.inspect(results))
        handleError(req, res, error)
      } else {
        console.log('Set access token to sessionID ' + req.sessionID)
        req.session.oauthAccessToken = oauthAccessToken
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret
        console.log(req.session)

        res.send('OK')
        console.log('Complete /twitter/accessToken')
      }
    }
  )
})

router.get('/profile', function (req, res) {
  console.log('Get /twitter/profile')
  consumer.get(_tApiProfile, req.session.oauthAccessToken, req.session.oauthAccessTokenSecret,
    function (error, data, response) {
      if (error) {
        handleError(req, res, error)
      } else {
        var parsedData = JSON.parse(data)
        res.json(parsedData)
        console.log('Complete /twitter/profile')
      }
    })
})

router.get('*', function (req, res) {
  res.redirect('/twitter/profile')
})

function isAppClient(req) {
  if (req.headers['user-agent'].substr(0, reactTwitterAppName.length).toLowerCase() === reactTwitterAppName) {
    // React Native iOS App
    return true
  } else if (req.headers['user-agent'].substr(0, 6) === 'okhttp') {
    // React Native Android App
    return true
  } else {
    return false
  }
}

function handleError(req, res, error) {
  console.log('Error: ' + util.inspect(error))
  res.status(error.statusCode).send(util.inspect(error))
}

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /twitter
app.use('/twitter', router)

// START THE SERVER
// =============================================================================
app.listen(port)
