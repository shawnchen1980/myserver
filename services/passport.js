const passport =require('passport')
const User = require('../models/user')
const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local')
const tokenForUser = require('../controllers/auth').tokenForUser;
const localOptions ={usernameField:'email'}

const localLogin = new LocalStrategy(localOptions,function(email,password,done){
	User.findOne({email:email},function(err,user){
		if(err){return done(err)}
		if(!user) {return done(null,false)}
		user.comparePassword(password,function(err,isMatch){
			if(err){return done(err)}
			if(isMatch) {
				return done(null,user)
			} else {
				return done(null,false)
			}
		})
	})
})
/*
异步函数参数中的回调函数由谁来定义？
异步函数的参数中如果有回调函数的话，那么谁调用这个异步函数，谁就必须定义这个回调函数的代码
比如上文中LocalStrategy的第二个参数是回调函数，那么当前代码调用了它，所以当前代码中必须定义这个回调函数
而这个无名的回调函数中的第三个参数done又是一个回调函数，而这个无名函数是被LocalStrategy调用的，所以done对应
回调函数的代码定义由LocalStrategy定义，当前代码不需要定义，直接调用即可
*/


const jwtOptions = {
	jwtFromRequest:ExtractJwt.fromHeader('authorization'),
	secretOrKey:config.secret
}
//每个strategy都产生一个中间件，其作用就是根据输入（从http req的authorization报头中的token，或http body中的email、password属性对）
//生成一个user对象，并将其嵌入req中，供request handler使用。策略面对的输入来自原始request报文
//所以如何从报文中获取需要的数据，就要根据定义策略时的第一个参数来说明
//比如jwtOptions中就说明了用户验证数据jwt来自报头authorization,本地私钥来自config.secret
//将这两者转换为回调函数中的payload则是JwtStrategy的任务了
const jwtLogin= new JwtStrategy(jwtOptions,function(payload,done){
	User.findById(payload.sub,function(err,user){
		if(err) {return done(err,false)}
		if(user){
			user.iat=payload.iat
			return done(null,user)
		} else {
			done(null,false)
		}
	})
})
const googleLogin = new GoogleStrategy({
    clientID: "159044113885-9tkitaa6t39uu5lr5bt9d3f88pup3k5i.apps.googleusercontent.com",
    clientSecret: "W7I0g17b47DVNBxSl18cYpos",
    callbackURL: "http://localhost:3030/oauth2callback",
    proxy:true
  },
  function(accessToken, refreshToken, profile, done) {
    //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //     return done(err, user);
	//   });
	User.findOne({origin:"google",originId:profile.id},function(err,one){
		if(err) {return done(err,false);}
		if(one) {
			//return res.status(422).send({error:'Email is in use'})
			return done(null,one);
			
		}
		else {
			const user = new User({origin:'google',originId:profile.id,title:profile.displayName})
			user.save((err)=>{
				if(err) {return done(err,false)}
				return done(null,user)
				//res.json({token:tokenForUser(user),email,title:email})
			})
			//return done(null,false);
		}
	})
    console.log('第一步：浏览器访问服务器/auth/google，被转向google进行身份认证')
    console.log('第二步：身份验证成功后，浏览器被google重定向至服务器/oauth2callback')
    console.log('第三步：服务器从浏览器处获取授权码，服务器用授权码访问google成功获取用户信息和accesstoken，程序进入googlestrategy定义的函数')
    console.log('在googlestrategy中，根据用户id从自建数据库中查到或建立用户信息，通过done函数返回用户对象user')
    console.log('profile',profile);
    //return done(null,{username:profile.id,password:666})
  }
);
passport.use(jwtLogin)
passport.use(localLogin)
passport.use(googleLogin) 