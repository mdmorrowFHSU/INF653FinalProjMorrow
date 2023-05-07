const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//model schema for states will allow crud
//everything in mongoose starts with a schema
const stateSchema = new Schema({
    stateCode: { //mapping out data
        type: String,
        required: true,
        unique: true
    },
    funfacts: [String]  
});
module.exports = mongoose.model('State', stateSchema); 