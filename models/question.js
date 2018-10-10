
const mongoose = require("mongoose")
const Schema = mongoose.Schema

//define our model
const questionSchema = new Schema({
	q:{type:String},
	a:String
})



//create our model
const question = mongoose.model("question",questionSchema)


//export our model
//module.exports =  question