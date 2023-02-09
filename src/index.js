const express = require("express")
const bodyParser = require('body-parser')
const router = require("./router/route")
const mongoose = require("mongoose")
const app = express()
const multer= require("multer");
app.use(express.json())
app.use( multer().any())
app.use(bodyParser.json());
mongoose.set("strictQuery",true)
mongoose.connect("mongodb+srv://Abhi_functionup:dBalIHuDvBLH2uZK@abhi1.m5k3ewv.mongodb.net/product_management",{
    useNewUrlParser:true
})

.then(()=>console.log("MongoDb is Connected"))
.catch((err=>console.log(err)))

app.use("/",router)

app.listen(3000,()=>{
    console.log("This is App Running On Port "+3000)
})
