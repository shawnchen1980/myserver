const signup=require('./controllers/auth').signup
const signin=require('./controllers/auth').signin
const passportService = require('./services/passport')
const passport = require('passport')

const requireAuth = passport.authenticate('jwt',{session:false})
const requireLocalAuth = passport.authenticate('local',{session:false})


module.exports = (app)=>{
	app.get("/",requireAuth,function(req,res){
		res.json({iat:req.user.iat})
	})
	app.post("/signin",requireLocalAuth,signin)
	app.post("/signup",signup)
}
//数据流的顺序是index.js->router.js->services/passport.js->controllers/auth.js
//router.js拿到index.js传过来的app实例，要为其加载request handler，但要保证req handler收到的
//req中已经有user信息了，所以需要passport提供验证中间件，上述requireAuth和requireLocalAuth
//就是两个验证中间件，具体的验证策略是在services/passport.js中实现的，并且通过passport.use
//的方式输出，所以虽然services/passport.js中并没有任何的export语句，但是还是必须在require('passport')
//之前被require进来，否则验证中间件将无法获知验证策略

//情况1：带email password原始数据直接Post /signup, 请求处理器从req.body获得email和password,利用User Model生成新用户实例，直接保存，
//并根据用户id，当前时间和本地秘钥生成jwt返回,需要注意的是，保存user实例时，password已经变为hash，这一步在model定义中已实现
//情况2：带着email和password数据 post /signin, 首先是LocalStrategy做得事情：从请求报文中获得email和password信息，根据email从数据库中获得
//user实体，利用User Model中定义的密码比较函数比较数据库中user实体的密码与请求报文中的密码是否匹配，如匹配返回user实体作为req.user
//接下来是signin请求处理器根据req.user利用jwt.encode生成jwt，这一步与情况一类似
//情况3：带着jwt数据 get /,JwtStrategy直接做了一个jwt.encode的反向操作，从当初打包加密的数据中获得userid，然后根据userid从数据库中
//获得user实体，作为req.user共后续请求处理器使用