const morgan =require('morgan')
const bodyParser = require('body-parser')
const express =require('express')
const http =require ('http')
const passport = require('passport')
const app = express()
const router = require("./router")
const mongoose = require("mongoose")
const cors=require('cors')
//DB setup
mongoose.connect('mongodb://localhost:auth/auth')
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
app.use(passport.initialize());
router(app);
app.use('/portal',express.static(__dirname+"\\public"))
// app.post('/itemSearch', bodyParser.json(), function(req, res) {
//   //var Keywords = req.body.Keywords;
//   console.log("Yoooooo");
//   console.log(req.headers);
//   console.log(req.body);
//   res.status(200).send("yay");
// });
app.use(express.static('public'))
const server = http.createServer(app)

server.listen(3030)

console.log("server started at 3030")
 