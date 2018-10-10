const User = require('../models/user')
const jwt=require('jwt-simple')
const config=require('../config')
//jwt实现的交互流程是怎样的？
//以下函数中jwt会将用户id和当前时刻用服务器私钥加密成token返回用户，注意用户id是用户在signup时首次生成的
//以后每次用户访问服务器时比句将该token置于http报头authorization中（这一策略是可以在service/passport.js中配置的），服务器可以根据该token获取用户id以及用户
//上次登录时间,在reqest handler处通过req.user.id来获取用户id，通过req.user.iat来获取登录时间戳。
function tokenForUser (user){
	const timestamp= new Date();
	return jwt.encode({sub:user.id, iat: timestamp.getTime(),time:timestamp.toString()},config.secret)
}
exports.tokenForUser = tokenForUser;

exports.signin = (req,res,next)=>{
	if(req.user){
		console.log(req.user);
		res.json({token:tokenForUser(req.user),email:req.user.email,origin:req.user.origin,title:req.user.title})
	}
}
//use the email and password supplied by the user to create
//a new user instance, then generate a token by encrypting the id of 
//the user instance
//note that the user's password is also encrypted before saving into the
//db

//在client端用axios.post发送的对象{a:1,b:2}，在server端通过req.body.a,req.body.b获得
//还需要app.use(bodyParser.json())配合
//在server端用res.json发出去的对象，在client端用res.data收到
exports.signup = ( (req,res,nex)=>{
	const {email,password}=req.body
	User.findOne({email:email},function(err,one){
		if(err) {return nex(err);}
		if(one) {
			return res.status(422).send({error:'Email is in use'})
		}
		const user = new User({email,password,origin:'local',originId:email,title:email})
		user.save((err)=>{
			if(err) {return nex(err)}
			res.json({token:tokenForUser(user),email,title:email})
		})
	})
	// console.log(req.body)
	// res.send({status:"success"})
} )
