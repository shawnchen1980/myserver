const express=require('express')
const app=express()
const webpackMiddleware=require('webpack-dev-middleware')
const webpack=require('webpack')
const webpackConifg=require('../../../mytest2/webpack.config.js')
app.use(webpackMiddleware(webpack(webpackConifg)))

app.listen(3035,()=>console.log("listening on 3035!"))