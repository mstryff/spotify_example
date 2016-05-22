var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.callback = function(req, res, next){ 
	var code = req.query.code;
	var user;
	
	res.app.get('spotifyApi').authorizationCodeGrant(code)
		.then(function(data){
			res.app.get('spotifyApi').setAccessToken(data.body['access_token']);
			res.app.get('spotifyApi').setRefreshToken(data.body['refresh_token']);

			var options = {}
			return res.app.get('spotifyApi').getMe()
		})
		.then(function(data){
			user = data.body;
			res.render('spotify_profile', { title: "Playlist Creator", user: user.id, message: "Welcome, " + user.id });
		})
		.catch(function(error){
			console.error(error);
		});
}

router.createPlaylist = function(req, res, next) {
	var name = req.query.playlistName;
	var user = req.query.user;

	res.app.get('spotifyApi').createPlaylist(user, name, {'public': true})
		.then(function(data){
			console.log("Created playlist");
			res.render('spotify_profile', { title: "Playlist Creator", user: user, message: "Playlist " + name + " created" });
		}, function(err){
			res.render('spotify_profile', { title: "Playlist Creator", user: user, message: "Error: Unable to create playlist " + name });
		});
}

router.addSong = function(req, res, next) {
	var input = req.query;
	var user = input.user,
		playlist = input.playlist,
		artist = input.artist,
		track = input.track;

	var playlistId;

	res.app.get('spotifyApi').getUserPlaylists(user, { limit: 50 })
		.then(function(data){
			for(var i = 0; i < data.body.items.length; i++){
				if(data.body.items[i].name == playlist){
					playlistId = data.body.items[i].id;
					var searchString = "artist:" + artist + " track:" + track;
					return res.app.get('spotifyApi').searchTracks(searchString)
				}
			}
		})
		.then(function(data){
			return res.app.get('spotifyApi').addTracksToPlaylist(user, playlistId, data.body.tracks.items[0].uri)
		})
		.then(function(data){
			res.render('spotify_profile', { title: "Playlist Creator", user: user, message: track + " added to playlist " + playlist });
		})
		.catch(function(error){
			console.error(error);
			res.render('spotify_profile', { title: "Playlist Creator", user: user, message: "Error: Unable to add song " + track });
		});
}

module.exports = router;
