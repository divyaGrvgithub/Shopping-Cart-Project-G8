const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const authentication = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      res.status(400).send({ status: false, message: "token is required" });
    }
    let fetchToken = token.split(" ")[1];
    jwt.verify(fetchToken, "group8", function (err, decode) {
      if (err) {
        res.status(401).send({ status: false, message: err.message });
      } else {
        req.decode = decode;
        next();
      }
    });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

const authorization = async (req, res, next) => {
 try{
    let userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res
      .status(400)
      .send({ status: false, message: "userId is not valid" });
      const checkUserExist = await userModel.findById(userId)
      if(!checkUserExist) return res.status(404).send({status:false,message:"user is not exist"})
  if (userId != req.decode.userId){
    return res
      .status(403)
      .send({ status: false, message: "You are not authorized" });
  }else{ return next()}
}catch(err){
    res.status(500).send({ status: false, error: err.message })
}
};

module.exports = { authentication, authorization };
