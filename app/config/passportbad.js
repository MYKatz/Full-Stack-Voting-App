'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	passport.use(new TwitterStrategy ({
		consumerKey : configAuth.twitterAuth.consumerKey,
		consumerSecret : configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL
	},
	function(token, refreshToken, profile, done) {
		
		
		process.nextTick(function (){
			
			User.findOne({"details.id": profile.id, "details.type": "twitter"}, function(err, user){
			
				if(err){return done(err);}
				if(user){return done(null, user)}
				else{
					var newUser = new User();
					
					newUser.details.type = "twitter";
					newUser.details.id = profile.id;
					newUser.details.username = profile.username;
					newUser.details.displayName = profile.displayName;
					newUser.nbrClicks.clicks = 0;
					
					
					newUser.save(function (err){
					
						if(err){throw err}
						return done(null, newUser);
						
					});
					
				}
				
			});
			
		});
		
		
	}));

	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'details.id': profile.id}, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
					newUser.details.id = profile.id;
					newUser.details.username = profile.username;
					newUser.details.displayName = profile.displayName;
					newUser.details.publicRepos = profile._json.public_repos;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}));
};
