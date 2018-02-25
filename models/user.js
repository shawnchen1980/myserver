const bcrypt=require('bcrypt-nodejs')
const mongoose = require("mongoose")
const Schema = mongoose.Schema

//define our model
const userSchema = new Schema({
	email:{type:String,unique:true,lowercase: true},
	password:String
})

//userSchema.preSave()
userSchema.pre("save",function(next){
	const user=this
	bcrypt.genSalt(10,function(err,salt){
		if(err) {return next(err)}
		bcrypt.hash(user.password,salt,null,function(err,hash){
			if(err) { return next(err)}
			user.password=hash;
			next();
		})

	})
})
userSchema.methods.comparePassword = function(pass,cb) {
	bcrypt.compare(pass,this.password,function(err,isMatch){
		if(err) {return cb(err)}
		cb(null,isMatch)
	})
}
//同步函数syncFun与异步函数asyncFun在调用时的区别
//result=syncFun(params);
//asyncFun(params,function callback(result){...})
//由上可见，同步函数调用后直接返回结果，异步函数则需要利用回调函数的参数来接收返回结果
//上文中bcrypt.genSalt,bcrypt.hash,bcrypt.compare都是异步函数
//需要指出的是，异步函数在定义时回调函数并没有具体定义，反倒是调用时才会定义回调函数
//因为异步函数要定义的是如何产生结果，而回调函数定义的是如何处理结果，这两者是有区别的，需要注意
//当A函数需要调用B函数来返回计算结果并且B函数是异步函数时，A肯定也是异步函数，
//如同上述userSchema.methods.comparePassword与bcrypt.compare的关系

//create our model
const user = mongoose.model("user",userSchema)


//export our model
module.exports =  user