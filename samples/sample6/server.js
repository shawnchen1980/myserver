/*
代码目标：对客户端发来的任何get请求返回当前时间作为应答，应答内容为一个json对象，格式为{time:当前时间}
*/
var cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
var express = require('express')
var passport = require('passport')
var app = express()
var LocalStrategy = require('passport-local').Strategy;

var GoogleStrategy = require('passport-google-oauth20').Strategy;


//app.set('trust proxy', 1) // trust first proxy
 //对应Content-type:application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session1',
  keys: ['key1', 'key2']
}))
passport.serializeUser((user,done)=>{
    //console.log('from serializeUser user',user)
    console.log('第四步：在第三步传给done函数的user对象被传递给了serializeUser函数，在此提取user对象的某一属性（一般是id），传递给本函数内的done函数')
    console.log('由于使用了cookieSession，这一动作也就意味着把用户id写入了cookie发给浏览器，将来这一cookie中的值也将成为req.session.passport.user的值')
    console.log('需要注意的是，serializeUser函数的执行永远是跟在各类passport的strategy定义函数之后的，因此只有当某个url使用了passport.authenticate中间件才会触发serializeUser函数的执行')
    done(null,JSON.stringify(user))
})
passport.deserializeUser((id,done)=>{
  console.log('第六步：浏览器被重定向后访问根路径/，由于使用了passport.session中间件，直接从cookie中构建req.session.passport.user的值')
  console.log('同时该中间件把这个值传递给deserializeUser函数，期望它能用这个值从自建数据库中查出用户信息，并把user对象传给done函数，构建出req.user')
    console.log(id);
    done(null,{id,hello:'world'})
})
app.use(passport.initialize())
app.use(passport.session())
app.get('/', function (req, res, next) {
  // Update views
  //req.session.views = (req.session.views || 0) + 1
 
  // Write response
  //res.end(req.session.views + ' views')
  console.log('第七步：deserializeUser返回user对象后，passport.session中间件执行结束，进入根路径的处理函数，此时req.user已经生成完毕')
  res.json(req.user);
  //console.log("this is req._passport",req._passport)
  //console.log("this is req.user",req.user)
  //console.log("this is ")
  res.end();
})
app.get('/login',function(req,res){
  console.log('第一步：浏览器访问/login，服务器发回登陆表单')
    res.sendFile(__dirname+`\\form.html`);
})
passport.use(new LocalStrategy(
    function(username, password, done) {
    //   User.findOne({ username: username }, function(err, user) {
    //     if (err) { return done(err); }
    //     if (!user) {
    //       return done(null, false, { message: 'Incorrect username.' });
    //     }
    //     if (!user.validPassword(password)) {
    //       return done(null, false, { message: 'Incorrect password.' });
    //     }
    //     return done(null, user);
    //   });
    console.log('from local-strategy username and password',username,password)
    console.log('第二步：用户在登陆表单中输入用户名密码后浏览器post到/login')
    console.log('第三步：请求被passport.authenticate(local)拦截，进入localstrategy函数，该函数使用用户名密码与数据库数据比对，将查询到的用户信息通过user对象传递给done函数')
    return done(null,{username,password})
    }
  ));

app.post('/login',
  passport.authenticate('local'),
    function(req,res){
        console.log('user',req.user)
        console.log('第五步：从localstrategy函数退出后，进入位于/login的post路由处理函数，此时浏览器被重定向至根路径/')
        //res.end(req.user)
        res.redirect('/')
    }
    
);

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: "159044113885-9tkitaa6t39uu5lr5bt9d3f88pup3k5i.apps.googleusercontent.com",
    clientSecret: "W7I0g17b47DVNBxSl18cYpos",
    callbackURL: "http://localhost:3036/oauth2callback",
    proxy:true
  },
  function(accessToken, refreshToken, profile, done) {
    //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //     return done(err, user);
    //   });
    console.log('第一步：浏览器访问服务器/auth/google，被转向google进行身份认证')
    console.log('第二步：身份验证成功后，浏览器被google重定向至服务器/oauth2callback')
    console.log('第三步：服务器从浏览器处获取授权码，服务器用授权码访问google成功获取用户信息和accesstoken，程序进入googlestrategy定义的函数')
    console.log('在googlestrategy中，根据用户id从自建数据库中查到或建立用户信息，通过done函数返回用户对象user')
    //console.log('profile',profile);
      return done(null,{username:profile.id,password:666})
  }
));
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/oauth2callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('第五步：从googlestrategy函数退出后，进入位于/oauth2callback的路由处理函数，此时浏览器被重定向至根路径/')
    res.redirect('/');
  });
app.get('/add',function(req,res){
    req.session.count=req.session.count || 0;
    req.session.count+=1;
    res.json({count:req.session.count})

})
app.get('/adduser',function(req,res){
    req.session.passport={user:123};
    res.send("user added!")
})
app.get('/kill',function(req,res){
    req.session=null;
    res.end('session killed!')
})
app.get('/user/:id', function (req, res, next) {
    // if the user ID is 0, skip to the next route
    if (req.params.id === '0') next('route')
    // otherwise pass the control to the next middleware function in this stack
    else next()
  }, function (req, res, next) {
    // render a regular page
    res.send('regular')
  })
  
  // handler for the /user/:id path, which renders a special page
  app.get('/user/:id', function (req, res, next) {
    res.send('special')
  })
app.listen(3036)