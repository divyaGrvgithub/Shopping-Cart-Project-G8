const jwt = require("jsonwebtoken")
const UserModel = require("../models/userModel")
const { isValidObjectId } = require("../validation/validator")
const mongoose = require("mongoose")

const authentication = async (req, res, next) => {
    try {
        const Bearer = req.headers ["authorization"]
        if(!Bearer){
            return res.status(400).send({status:false, message:"token must be present"})
        }
        else{
            const token = Bearer.split(" ")
            if(token[0]!=="Bearer"){
                return res.status(400).send({status:false, message:"Select Bearer Token in headers"})
            }jwt.verify(token[1],"shopping-cart-group8",function(err,decodedToken){
                if(err){
                    if(err.message=="invalid Token" || err.message=="invalid Signature"){
                        return res.status(401).send({status:false, message:"Token is not valid"})
                    }
                    if(err.message=="jwt expired"){
                        return res.status(401).send({status:false, message:"Token has been expired"})
                    }
                    return res.status(401).send({status:false, message:err.message})
                }
                else{
                    req.loginUserId = decodedToken.loginUserId
                    next()
                }
            })
        }
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const authorization = async (req,res,next)=>{
    try{
        const userId = req.params.userId
        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false, message:'Please provide a valid UserId' })
        }
        let user = await UserModel.findById(userId)
        if(!user){
            return res.status(404).send({status:false,message:"user does not exist"})
        } 
        req.userData = user
        let tokenUserId = req.loginUserId // token Id
        // if (tokenUserId != userId) {
        //      return res.status(403).send({ status: false, message: "You are not authorised to perform this task" }) }
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.authentication = authentication
module.exports.authorization =authorization 


