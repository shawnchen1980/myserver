const User = require('../models/user')
const jwt=require('jwt-simple')
const config=require('../config')

function tokenForUser(user){
	const timestamp= new Date().getTime();
	return jwt.encode({sub:user.id, iat: timestamp},config.secret)
}


exports.signin = (req,res,next)=>{
	if(req.user){
		res.json({token:tokenForUser(req.user),email:req.user.email})
	}
}
//use the email and password supplied by the user to create
//a new user instance, then generate a token by encrypting the id of 
//the user instance
//note that the user's password is also encrypted before saving into the
//db


exports.signup = ( (req,res,nex)=>{
	const {email,password}=req.body
	User.findOne({email:email},function(err,one){
		if(err) {return nex(err);}
		if(one) {
			return res.status(422).send({error:'Email is in use'})
		}
		const user = new User({email,password})
		user.save((err)=>{
			if(err) {return nex(err)}
				res.json({token:tokenForUser(user),email})
		})
	})
	// console.log(req.body)
	// res.send({status:"success"})
} )