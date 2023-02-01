const userModel = require('../models/userModel')
const loginjoi = require('../validation/validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const login = async (req,res) =>{
   try{ let data = req.body
    let email = data.email
    let password = data.password

    if(Object.keys(data).length==0) return res.status(400).send({status:false, message:"please enter data first"})
    try {
        const valid = await loginjoi.validateAsunc(data)
    } catch (error) {
        return res.status(400).send({message: error.message})
    }
    let findeUser = await userModel.findOne({email:email.trim()})
    if(!findeUser) return res.status(404).send({status:false,message:"Credentials do not match"})

    let codePass = findeUser.password
    let originalPass = bcrypt.compareSync(password,codePass)
    if(!originalPass) return res.status(401).send({status:false, message:"password incorrect"})
    let token = jwt.sign({userId: findeUser._id},"group8",{expiresIn:'24h'})
    res.setHeader('x-api-key',token)
    res.status(200).send({ status: true, message: "User login successfully", data: { userId: findeUser._id, token: token } });
}
catch(err){
    return res.status(500).send({status:false, message:err.message})
}
}


const getUserProfile= async (req,res) =>{
    try{
        userId = req.params.userId
       if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false,message:"invalid id"})

       let userProfile = await userModel.findById(userId)
       if(!userProfile) return res.status(404).send({status:false, message:"user not found"})
       let profile= userProfile.toObject()
       delete profile.password
       return res.status(200).send({status:true, message:"User profile details",data:profile})

    }
    catch(err){
        return res.status(500).send({status:false, message: err.message})
    }
}
module.exports = {login,getUserProfile}