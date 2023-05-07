//importing the json
const data = {
    states: require('../model/states.json'),
    setStates: function (data) {this.states = data}
}
//importing data from database
const mongoStates = require('../model/States.js');
//states array
//handle get request for all states
const getAllStates = async (req, res) => {
    
    let statesList;
    const contig = req.query?.contig
 //below are responses needed for the api according to rubrick 
    // states/?contig=true
    if (contig === 'true') {
        statesList = data.states.filter(st => st.code !== 'AK' && st.code !== 'HI');
    }
    // /states/?contig=false
    else if (contig === 'false'){
        statesList = data.states.filter(st => st.code === 'AK' || st.code === 'HI');
    }
    // /states
    else {
        statesList = data.states;
    }
    // all states
    const allMongoStates = await mongoStates.find({});
    statesList.forEach(state => {
        try {
            const stateExists = allMongoStates.find(st => st.stateCode === state.code); //match codes
            if (stateExists) {
                state.funfacts = [...stateExists.funfacts];
            }
        } catch (err) {
            console.log(err);
        }
    })
    res.json(statesList);
}
//handle get request for single state
const getState = async (req, res) => {
    const oneJSONState = data.states.filter(st => st.code === req.code); //get for json 
    const oneMongoState = await mongoStates.findOne({stateCode: req.code}).exec(); //get for mongo

    let singleStateData = oneJSONState[0];
    try{
        singleStateData.funfacts = oneMongoState.funfacts;
    } catch (err) { //leave empty  
    }
        res.json(singleStateData);
}
// handle single get request for funfact
const getFunfact = async (req, res) => {
    
    const oneJSONState = data.states.filter(st => st.code === req.code); //getting array for json
    const oneMongoState = await mongoStates.findOne({stateCode: req.code}).exec(); //getting info with mongo
    if (!oneMongoState) { //nothing found 
        res.status(404).json({"message":`No Fun Facts found for ${oneJSONState[0].state}`});
    }

    const randomArrayElement = oneMongoState.funfacts[Math.floor(Math.random() * oneMongoState.funfacts.length)];
        res.json({"funfact": randomArrayElement});
}
//handle post request for funfact
const createFunfact = async (req, res) => {
    if (!req?.body?.funfacts){ //does body exist?
        return res.status(400).json({"message": "State fun facts value required"});
    }  
    if (!Array.isArray(req?.body?.funfacts)){ //is it in array?
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }

    const oneMongoState = await mongoStates.findOne({stateCode: req.code}).exec();
    if (!oneMongoState) { //create new if needed in mongo
        try {
            const result = await mongoStates.create({
                "stateCode": req.code,
                "funfacts": req.body.funfacts
            });
            res.status(201).json(result);
        } catch (err) {
            //console.log(err); //is this needed? come back to check
        }
    } else { //add fact info for state in the db 
            let allFunfacts = [...oneMongoState.funfacts, ...req.body.funfacts];
            const update = await mongoStates.updateOne({"stateCode": req.code},{"funfacts": allFunfacts});
            const result = await mongoStates.findOne({stateCode: req.code}).exec();
            res.status(201).json(result);
    } 
}
//handles put requests for funfact
const updateFunfact = async (req, res) => {   
    if (!req?.body?.index){//body exists?
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    if (!req?.body?.funfact){
        return res.status(400).json({"message": "State fun fact value required"});
    }
    const oneJSONState = data.states.filter(st => st.code === req.code);
    const oneMongoState = await mongoStates.findOne({stateCode: req.code}).exec();
    console.log(oneMongoState);

    if (!(oneMongoState)) {
        return res.status(404).json({"message":`No Fun Facts found for ${oneJSONState[0].state}`});
    }

    const funfactIndex = req.body.index -1; //index

    if (oneMongoState.funfacts.length < funfactIndex || funfactIndex < 0){
        return res.status(404).json({"message":`No Fun Fact found at that index for ${oneJSONState[0].state}`});
    }
    let allFunfacts = oneMongoState.funfacts; //entry updating   
    allFunfacts.splice(funfactIndex, 1, req.body.funfact); //adding fun fact!
    const update = await mongoStates.updateOne({"stateCode": req.code},{"funfacts": allFunfacts});
    const result = await mongoStates.findOne({stateCode: req.code}).exec(); //retrieving the new document
    res.status(201).json(result);
}
// handle delete requests
const deleteFunfact = async (req, res) => {
    if (!req?.body?.index){
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    const oneJSONState = data.states.filter(st => st.code === req.code);
    const oneMongoState = await mongoStates.findOne({stateCode: req.code}).exec();

    if (!oneMongoState) {
        return res.status(404).json({"message":`No Fun Facts found for ${oneJSONState[0].state}`});
    }

    const funfactIndex = req.body.index -1;

    if (oneMongoState.funfacts.length < funfactIndex || funfactIndex < 0){
        return res.status(404).json({"message":`No Fun Fact found at that index for ${oneJSONState[0].state}`});
    }

    const funfactArray = oneMongoState.funfacts.filter((element, index) => {return index != funfactIndex});
    oneMongoState.funfacts = funfactArray;
    const result = await oneMongoState.save();
    res.status(201).json(result);
}

const getAttribute = async (req, res) => {
    const oneJSONState = data.states.filter(st => st.code === req.code);
    const pathArray = req.route.path.split('/');
    if (pathArray[2] === 'capital'){
        res.json({
            "state" : oneJSONState[0].state,
            "capital" : oneJSONState[0].capital_city
        });
    } else if (pathArray[2] === 'nickname'){
            res.json({
                "state" : oneJSONState[0].state,
                "nickname" : oneJSONState[0].nickname
            });
    } else if (pathArray[2] === 'population'){
            res.json({
                "state" : oneJSONState[0].state,
                "population" : oneJSONState[0].population.toLocaleString('en-US')
            });
    } else if (pathArray[2] === 'admission'){
            res.json({
                "state" : oneJSONState[0].state,
                "admitted" : oneJSONState[0].admission_date
            });
    }
}

module.exports = {
    getAllStates,
    getState,
    getFunfact,
    getAttribute,
    createFunfact,
    updateFunfact,
    deleteFunfact
}