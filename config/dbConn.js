const mongoose = require('mongoose'); //start file by requiring mongoose
//database connect 
const connectDB = async () => {
    try{ //trying to connect to mongoose
        await mongoose.connect(process.env.DATABASE_URI, { //await for db given by instructor
            useUnifiedTopology: true, //Set to true to opt in to using the MongoDB
            useNewUrlParser: true
        });
    } catch (err) { 
        console.error(err);
    }
}
module.exports = connectDB;