'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
   
   owner: String,
   title: String,
   options: Array,
   votes: Array,
   ips: Array,
   users: Array
   
   
});

module.exports = mongoose.model('Poll', Poll);