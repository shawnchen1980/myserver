/*
目标：做一个简单的todolist后端
使用方式：	post /todos -> 增加一条todoitem
			get /todos -> 获取一组todoitem
*/

const mongoose = require("mongoose")
const Schema = mongoose.Schema
const path=require('path')
//define our model
const todoSchema = new Schema({
	title:{type:String,lowercase: true},
	completed:Boolean
})

const Todo= mongoose.model('todox',todoSchema)
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

app.use(cors());
app.post("/todos",(req,res)=>{
	const {title,completed} = req.body
	const todo = new Todo({title,completed})
	todo.save((err)=>{
		if(err){
			console.log(err)
			res.status(401).json({err})
		}
		res.json(todo)

	})
})
app.get("/todos",(req,res)=>{
	const todoArr=Todo.find({},(err,todos)=>{
		if(err){
			console.log(err)
			res.status(401).json({err})
		}
		res.json(todos)
	})
})
const server = http.createServer(app)

server.listen(3034)

console.log("server started at 3034")