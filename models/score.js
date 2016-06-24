var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    
var Score = new Schema({
		scores:Number,
		player1Username:String,
		player2Username:String

});    
    
module.exports = mongoose.model('scores', Score);