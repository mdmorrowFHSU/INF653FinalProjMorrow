require('dotenv').config(); //for the .env 
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose'); //using mongoose 
const connectDB = require('./config/dbConn'); //pulling in the dbConn file
const PORT = process.env.PORT || 3000; //hosting or custom port 
//connect to mongodb
connectDB();
app.use(cors(corsOptions));
// form data 
app.use(express.urlencoded({ extended: false}));
//json data
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public'))); //static files
//defining routes here
app.use('/', require('./routes/api/root'));
app.use('/states', require('./routes/api/states'));


app.all('*',(req, res) => { //404 status
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

//check mongodb connection
mongoose.connection.once('open', () => { //just listen one time once it opens
    console.log('Mongo DB Connected');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})
