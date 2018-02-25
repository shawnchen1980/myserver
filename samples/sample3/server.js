/*
代码目标：对客户端发来的任何get请求返回当前时间作为应答，应答内容为一个json对象，格式为{time:当前时间}
*/
var express=require('express')
var app=express()
var http=require('http')
var cors=require('cors')

app.use(cors())

app.get("*",(req,res)=>{
	const d=new Date()
	res.json({time:d.toString()})
})


var server=http.createServer(app)

server.listen(3033)
console.log("server is listening at 3033")