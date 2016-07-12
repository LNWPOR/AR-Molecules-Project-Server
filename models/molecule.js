var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    
var Molecule = new Schema({
		name: String,
        ownerID : String,
        moleculeObjectsList: [{}]
});    
    
module.exports = mongoose.model('molecules', Molecule);