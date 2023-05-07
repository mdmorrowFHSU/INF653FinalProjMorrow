const express = require('express');
const app = express();
statesArray = require('../model/states.json');
//custom verifying middleware 
const verifyState = () => { 
    return (req, res, next) => {
        
         if (!req?.params?.state){ //state abbreviation check
            return res.status(400).json({"message":"Invalid state abbreviation parameter"});
        }
        const shorthand = req.params.state.toUpperCase(); //convert to upper / cross check data
        const code = statesArray.map(st => st.code); //states array
        const codeExists = code.find(code=> code === shorthand); //found?
        if (!codeExists) {return res.status(400).json({ //404 
            "message":"Invalid state abbreviation parameter" //message to user for 404
        })
    }
    req.code = shorthand;
    next();
    }
}
module.exports = verifyState;

