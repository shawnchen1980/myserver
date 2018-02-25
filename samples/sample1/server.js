/*
目标：接受客户端发来的用户名与密码对，检查无重复情况下新建User对象存入mongodb数据库
打开方式：需本地开启mongodb，直接node server.js，浏览器访问localhost:3031
*/

const mongoose = require("mongoose")
const Schema = mongoose.Schema
const path=require('path')
//define our model
const userSchema = new Schema({
	email:{type:String,unique:true,lowercase: true},
	password:String
})

const User= mongoose.model('userx',userSchema)
const morgan =require('morgan')
const bodyParser = require('body-parser')
const express =require('express')
const http =require ('http')
const app = express()

//const mongoose = require("mongoose")
const cors=require('cors')
//DB setup
mongoose.connect('mongodb://localhost/mydb',{useMongoClient:true})
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

const handler1=(req,res,nex)=>{
	const {email,password}=req.body
	console.log(`email is ${email},password is ${password}`)
	User.findOne({email:email},function(err,one){
		if(err) {return nex(err);}
		if(one) {
			return res.status(422).send({error:'Email is in use'})
		}
		const user = new User({email,password})
		console.log(user);
		user.save((err)=>{
			if(err) {return nex(err)}
				res.json({token:user})
		})
	})
	// console.log(req.body)
	// res.send({status:"success"})
}
app.post("/signup1",(req,res)=>{
	//res.redirect("/signup");
	//res.redirect使用302，如果原来是post新请求会变为get，如果使用下面的307则不会
	res.writeHead(307,{
		'Location':'/signup'
	})
	res.end();
})
app.post("/signup",handler1)
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

server.listen(3031)

console.log("server started at 3031")
/*
可以用以下这段代码放到浏览器的devTool中对上述代码进行调试
var header=new Headers();
header.append("content-type","application/json");
var req=new Request("http://localhost:3031/signup",{method:'POST',headers:header,body:'{"email":"bar","password":"hahah"}'});
fetch(req).then(res=>res.json()).then(console.log);
*/
/*
接收来自客户端的数据并保存到mongo数据库的关键步骤及代码
1 定义表结构
const userSchema=new Schema({name:String,password:String})
2 定义表名(以下userx为db中的表名)和模型，非常关键，以下数据库操作都以模型为准
const User=mongoose.model('userx',userSchema)
3 连接数据库（如果是第一次连接则创建数据库,以下dbname为数据库名）
mongoose.connect("mongodb://localhost:port/dbname",{useMongoClient:true})
4 建立请求处理函数并加载到对应url上,要注意db模型User的运用！
app.post("/signup",(req,res)=>{var user=new User({email:"email",password:"pass"});user.save((err)=>{res.json({result:"ok"})})})
*/