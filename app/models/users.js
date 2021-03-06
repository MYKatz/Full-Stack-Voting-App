'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	},
	twitter: {
	    id: String,
	    token: String,
	    username: String,
	    displayName: String
	},
	polls: {
		polls: Array	
	},
   nbrClicks: {
      clicks: Number
   }
});

module.exports = mongoose.model('User', User);