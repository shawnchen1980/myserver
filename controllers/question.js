const mongoose = require('mongoose');
require('../models/question');

const Question= mongoose.model('question');

//在server端用res.json发出去的对象，在client端用res.data收到
//在client端用fetch或axios post发出来的对象，在server端用req.body获取
exports.addNewQuestion = (req,res,nex)=>{
    if(req.user){
		//res.json({user:req.user})
	
		const {q,a} = req.body;
		new Question({q,a}).save().then(question=>{res.json(question)});
			

    }
    else {
        res.json({"no":"no!!"});
    }
}
