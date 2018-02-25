/*
目标：接受客户端向/signin发来的用户名与密码对，直接生成User对象(包括生成的userid)和jwt的token一起返回
接受客户端向/decode发来的jwt的token，解析出id并返回，真实场景中，id被用来查询出用户user信息
打开方式：浏览器访问localhost:3032,email随便输，password必须是abc,提交后可看到userid和token信息
再打开浏览器访问localhost:3032，将前面的token复制到token文本框提交，可看到前面返回的id

本代码中，jwt的策略是从html的body里获得验证码解码的
*/
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const userSchema = new Schema({
	email:{type:String,unique:true,lowercase: true},
	password:String
})

const User= mongoose.model('userx',userSchema)

/*passport.js*/
//第一步，定义策略，也就是如何从request中提取信息并生成user对象返回，定义完策略还要导入passport
const passport =require('passport')
//const User = require('../models/user')
//const config = require('../config')
const config={
	secret:'kdjflsdfjiweofk,dfk'
}
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local')

const localOptions ={usernameField:'email'}

const localLogin = new LocalStrategy(localOptions,function(email,password,done){
	// User.findOne({email:email},function(err,user){
	// 	if(err){return done(err)}
	// 	if(!user) {return done(null,false)}
	// 	user.comparePassword(password,function(err,isMatch){
	// 		if(err){return done(err)}
	// 		if(isMatch) {
	// 			return done(null,user)
	// 		} else {
	// 			return done(null,false)
	// 		}
	// 	})
	// })
	const user=new User({email,password})
	if(password==="abc"){
		return done(null, user)
	}
	else {
		return done(null,false)
	}
})

const jwtOptions = {
	jwtFromRequest:ExtractJwt.fromBodyField('authorization'),
	secretOrKey:config.secret
}

const jwtLogin= new JwtStrategy(jwtOptions,function(payload,done){
	// User.findById(payload.sub,function(err,user){
	// 	if(err) {return done(err,false)}
	// 	if(user){
	// 		return done(null,user)
	// 	} else {
	// 		done(null,false)
	// 	}
	// })
	const user={email:"testemail",password:"testpass",_id:payload.sub}
	return done(null,user);
})
passport.use(jwtLogin)
passport.use(localLogin) 
/*end of passport.js*/

//第二步，将策略导出为中间件
const requireAuth = passport.authenticate('jwt',{session:false})
const requireLocalAuth = passport.authenticate('local',{session:false})


// const mongoose = require("mongoose")
// const Schema = mongoose.Schema
const path=require('path')
//define our model

const morgan =require('morgan')
const bodyParser = require('body-parser')
const express =require('express')
const http =require ('http')
const app = express()

//const mongoose = require("mongoose")
const cors=require('cors')
//DB setup
//mongoose.connect('mongodb://localhost/mydb',{useMongoClient:true})
//连本地mongod需先安装mongodb，创建对应的数据文件夹，然后直接命令行运行mongod即可，数据文件夹如没有，可根据错误提示得出
//mongoose.connect('mongodb://testshawn:abcd1111@ds034807.mlab.com:34807/testshawn')
app.use(morgan('common'))
//对应Content-type:application/json
app.use(bodyParser.json())
//对应Content-type:application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// // app.use("/",function(req,res,next){
// // 	const {header,method,url} = re

// // 	console.log(header,method,url)
// // 	res.json(req.body)
// // 	//res.send(["hello","world"])
// // 	res.end()
// // })

//bodyParser = require('body-parser').json();
app.use(cors());

const jwt=require('jwt-simple')

function tokenForUser(user){
	const timestamp= new Date().getTime();
	return jwt.encode({sub:user.id, iat: timestamp},config.secret)
}
//第三步，定义请求处理函数，使用req中的user（此user即为第一步的策略所提供的)
const handler1=(req,res,nex)=>{
	res.json({user:req.user,token:tokenForUser(req.user)})
	// const {email,password}=req.body
	// console.log(`email is ${email},password is ${password}`)
	// User.findOne({email:email},function(err,one){
	// 	if(err) {return nex(err);}
	// 	if(one) {
	// 		return res.status(422).send({error:'Email is in use'})
	// 	}
	// 	const user = new User({email,password})
	// 	console.log(user);
	// 	user.save((err)=>{
	// 		if(err) {return nex(err)}
	// 			res.json({token:user})
	// 	})
	// })
	// console.log(req.body)
	// res.send({status:"success"})
}
const handler2=(req,res,nex)=>{
	res.json(req.user)
}
app.post("/signin1",(req,res)=>{
	//res.redirect("/signup");
	//res.redirect使用302，如果原来是post新请求会变为get，如果使用下面的307则不会
	res.writeHead(307,{
		'Location':'/signin'
	})
	res.end();
})
//第四步，将端点url，验证中间件和请求处理函数相绑定
app.post("/signin",requireLocalAuth,handler1)
app.post("/decode",requireAuth,handler2)
app.get("/",(req,res)=>{
	res.sendFile(path.resolve(__dirname,"index.html"))
})
// app.post('/itemSearch', bodyParser.json(), function(req, res) {
//   //var Keywords = req.body.Keywords;
//   console.log("Yoooooo");
//   console.log(req.headers);
//   console.log(req.body);
//   res.status(200).send("yay");
// });
const server = http.createServer(app)

server.listen(3032)

console.log("server started at 3032")


/*
接收来自客户端的身份数据验证后调用请求处理函数的关键步骤并及代码
第一步，定义策略，也就是如何从request中提取信息并生成user对象返回，定义完策略还要导入passport
const localLogin = new LocalStrategy(localOptions,function(email,password,done){...})
const jwtLogin= new JwtStrategy(jwtOptions,function(payload,done){...})
passport.use(jwtLogin)
passport.use(localLogin) 

第二步，将策略导出为中间件
const requireAuth = passport.authenticate('jwt',{session:false})
const requireLocalAuth = passport.authenticate('local',{session:false})


第三步，定义请求处理函数，使用req中的user（此user即为第一步的策略所提供的)
const handler1=(req,res,nex)=>{	res.json({user:req.user,token:tokenForUser(req.user)})}


//第四步，将端点url，验证中间件和请求处理函数相绑定
app.post("/signin",requireLocalAuth,handler1)

*/