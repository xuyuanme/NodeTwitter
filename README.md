# NodeTwitter

NodeTwitter is a demo Twitter proxy server built with node.js. It wraps the Twitter OAuth and REST API. It is the server side counterparty of [ReactTwitter](https://github.com/xuyuanme/ReactTwitter) demo, which tries to demonstrate how to share unified business logic code for both React Native app and React website.

## Config & Run

1.[Get](https://apps.twitter.com/) Twitter consumer key/secret, and add your own `./config.js` file to the project:

```javascript
module.exports = {
  twitterConsumerKey: 'your_twitter_consumer_key',
  twitterConsumerSecret: 'your_twitter_cosumer_secret'
}
```

2.Change `./server.js` to config the callback url for native apps or web pages:

```javascript
var reactTwitterAppName = 'reacttwitter'
var _requestTokenAppCallBackUrl = reactTwitterAppName + '://foo'
var _requestTokenWebCallBackUrl = 'http://localhost:8080/' + reactTwitterAppName + '/callback'
```

3.Change `./server.js` to set the PORT if you like:

```javascript
var port = process.env.PORT || 8483
```

4.`npm install`

5.`node server.js`

6.For how to call the server side NodeTwitter in front-end (native app or website), see [ReactTwitter](https://github.com/xuyuanme/ReactTwitter) demo.
