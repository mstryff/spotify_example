var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SpotifyWebApi = require('spotify-web-api-node');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Spotify config
var scopes = ['playlist-modify-public'],
    redirectUri = 'http://localhost:3000/callback',
    clientId = 'ed2dd86671d74cb0a3710afa4844e6b5',
    clientSecret = '6870c9025d77489ab3741dcde748c81a';

app.set('spotifyApi', new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : clientId,
  clientSecret : clientSecret
}));

app.use('/', routes);

app.use('/login', function(req, res, next) {
  var authorizeURL = app.get('spotifyApi').createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

app.use('/users', users);
app.use('/callback', routes.callback);
app.use('/create-playlist', routes.createPlaylist);
app.use('/add-song', routes.addSong);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
