'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var Poll = require('../models/polls');
var ObjectId = (require('mongoose').Types.ObjectId);

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var clickHandler = new ClickHandler();

	app.route("/")
		.get(function(req, res){
			if(req.isAuthenticated()){
				res.sendFile(path + '/public/authenticated/index.html');
			}
			else{
				res.sendFile(path + '/public/index.html');
			}
		});

	app.route("/mine")
		.get(isLoggedIn, function(req, res){
			res.sendFile(path + "/public/authenticated/mine.html");
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
	app.route('/new')
		.get(isLoggedIn, function(req, res){
				res.sendFile(path + '/public/authenticated/new.html');
		});
	
	app.route('/new/create')
		.post(isLoggedIn, function(req, res){
			var newPoll = new Poll();
			
			newPoll.owner = req.user.twitter.id;
			newPoll.title = req.body.title;
			newPoll.options = req.body.options.split(",");
			newPoll.votes = new Array(newPoll.options.length).fill(0);
			newPoll.ips = [];
			newPoll.users = [];
			
			newPoll.save(function(err){
				if(err){res.redirect("/ERROR"); throw err; }
				else{
					res.redirect("/")	
				}
			});
			
			
		});

	app.route("/api/poll/:id")
		.get(function(req, res) {
			if(req.params.id.length == 24){
				Poll.findOne({_id : new ObjectId(req.params.id)}, function(err, poll){
					if(err){res.send({"error":"invalid ID"})}
					if(poll){
						res.send(poll);
					}
					else{
						res.send({"error":"invalid ID"});
					}
				});
			}
			else{
				res.send({"error":"invalid ID"})
			}
		});


	app.route("/poll/:id")
		.get(function(req, res){
			
			if(req.isAuthenticated()){
				res.sendFile(path + '/public/authenticated/poll.html');
			}
			else{
				res.sendFile(path + '/public/poll.html');
			}
			
				
		});
		
	app.route("/api/polls/:id/addvote/:vote")
		.get(function(req, res){
			Poll.findOne({_id : new ObjectId(req.params.id)}, function(err, poll){
				if(err){throw err;}
				if(req.isAuthenticated() && poll.users.indexOf(req.user.twitter.id) > 0){
					res.send("Already voted!");
				}
				else if(poll.ips.indexOf(req.ip) > 0){
					res.send("Already voted!");
				}
				else if(poll.options.indexOf(req.params.vote) == -1 && req.isAuthenticated()){
					poll.options.push(req.params.vote);
					poll.votes.push(1);
					poll.users.push(req.user.twitter.id);
					poll.ips.push(req.ip);
					res.send("success");
				}
				else if(poll.options.indexOf(req.params.vote) > -1 && req.isAuthenticated()){
					var clone = poll.votes.slice(0);
					clone[poll.options.indexOf(req.params.vote)] = clone[poll.options.indexOf(req.params.vote)] + 1;
					poll.votes = clone;
					poll.users.push(req.user.twitter.id);
					poll.ips.push(req.ip);
					res.send("success");
				}
				else if(poll.options.indexOf(req.params.vote) > -1 && !req.isAuthenticated()){
					var clone = poll.votes.slice(0);
					clone[poll.options.indexOf(req.params.vote)] = clone[poll.options.indexOf(req.params.vote)] + 1;
					poll.votes = clone;
					poll.ips.push(req.ip);
					res.send("success");
				}
				else{
					res.send("You must be logged in to add a new option.");
				}
				poll.save();
			});
		});
	
	app.route("/api/polls")
		.get(function(req, res) {
			Poll.find({}, function(err, docs){
				if(err){throw err}
				else{

					res.json(docs);
					//res.send(JSON.stringify(docs));
				}
			});
		});
	
	app.route("/api/polls/:id")
		.get(function(req, res){
			Poll.find({"owner" : req.user.twitter.id}, function(err, docs){
				if(err){throw err}
				else{

					res.json(docs);
					//res.send(JSON.stringify(docs));
				}
			});
				
		});
	
	app.route("/api/polls/delete/:id")
		.get(isLoggedIn, function(req, res){
			Poll.findOne({_id : new ObjectId(req.params.id)}, function(err, poll){
					if(err){console.log("ERR"); throw err;}
					if(!poll){res.send("error")}
					else{
						if(poll.owner == req.user.twitter.id){
							Poll.findOne({_id : new ObjectId(req.params.id)}).remove().exec();
							res.send("done");
						}
						else{
							res.send(poll.owner + "    " + req.user.twitter.id);	
						}
						
					}
			});
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.twitter);
		});
	
	app.route('/create')
		.get(isLoggedIn, function(req, res){
			res.send(Object.keys(req.query))
				
		});
	
	
	app.route("/auth/twitter")
		.get(passport.authenticate('twitter'));
		
	app.route("/auth/twitter/callback")
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));
			

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
