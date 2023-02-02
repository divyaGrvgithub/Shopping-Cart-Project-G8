const userModel = require("../models/userModel");
const {
  userlogin,
  userJoi,
  updateUserJoi,
} = require("../validation/validator");
const jwt = require("jsonwebtoken");
const PIN = require("pincode-validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uploadFile = require("../router/aws");
// ************************************************CREATE USER**********************************************************
const userCreate = async (req, res) => {
  try {
    let data = req.body;
    let files = req.files;
    if (Object.keys(req.body).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter data first" });
    }
    let address = JSON.parse(data.address);
    data.address = address;
    let pincodeShipping = data.address.shipping.pincode;
    let pincodeBilling = data.address.billing.pincode;
    if (!PIN.validate(pincodeShipping) || !PIN.validate(pincodeBilling))
      return res.status(400).send({
        status: false,
        message:
          "pin code in shipping address or billing address  is not valid",
      });
    try {
      await userJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }
    let existUser = await userModel.findOne({
      $or: [{ email: data.email }, { phone: data.phone }],
    });
    if (existUser) {
      if (existUser.email == data.email) {
        return res
          .status(400)
          .send({ status: false, message: "This email is already in use" });
      } else {
        existUser.phone == data.phone;
        return res.status(400).send({
          status: false,
          message: "This phone number is already in use",
        });
      }
    }
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }

    const salt = bcrypt.genSaltSync(10);
    const codePass = bcrypt.hashSync(data.password, salt);
    data.password = codePass;

    let create = await userModel.create(data);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: create,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
// ******************************************************LOGIN USER**************************************************************
const login = async (req, res) => {
  try {
    let data = req.body;
    let email = data.email;
    let password = data.password;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please enter data first" });
    try {
      await userlogin.validateAsync(data);
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
    let findeUser = await userModel.findOne({ email: email.trim() });
    if (!findeUser)
      return res
        .status(404)
        .send({ status: false, message: "Credentials do not match" });

    let codePass = findeUser.password;
    let originalPass = bcrypt.compareSync(password, codePass);
    if (!originalPass)
      return res
        .status(401)
        .send({ status: false, message: "password incorrect" });
    let token = jwt.sign({ userId: findeUser._id }, "group8", {
      expiresIn: "24h",
    });
    res.setHeader("x-api-key", token);
    res.status(200).send({
      status: true,
      message: "User login successfully",
      data: { userId: findeUser._id, token: token },
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
// **********************************************************GETUSER PROFILE*******************************************
const getUserProfile = async (req, res) => {
  try {
    userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).send({ status: false, message: "invalid id" });

    let userProfile = await userModel.findById(userId);
    if (!userProfile)
      return res.status(404).send({ status: false, message: "user not found" });

    return res.status(200).send({
      status: true,
      message: "User profile details",
      data: userProfile,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
// ************************************************************UPDATE USER PROFILE********************************************
const updateUser = async (req, res) => {
  try {
    let Userid = req.params.userId;
    let data = req.body;
    const files = req.files
    if(data.address){
    let address = JSON.parse(data.address)
    data.address = address}
    try {
      await updateUserJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }
    let userData = await userModel.findOne({_id:Userid}).select({_id:0,updatedAt:0,createdAt:0,__v:0}).lean()
    if(data.fname){
      userData.fname= data.fname
    }
    if(data.lname){
      userData.lname = data.lname
    }
    if(data.password){
      const salt = bcrypt.genSaltSync(10);
    const codePass = bcrypt.hashSync(data.password, salt);
    data.password = codePass;
    }
    if(data.address){
      if(data.address.billing){
        if(data.address.billing.city){
          userData.address.billing.city == data.address.billing.city
        }
      }
    }
    if(data.address){
      if(data.address.billing){
        if(data.address.billing.street){
          userData.address.billing.street = data.address.billing.street
        }
      }
    }
    if(data.address){
      if(data.address.billing){
        if(data.address.billing.pincode){
          if(!PIN.validate(data.address.billing.pincode)) return res.status(400).send({status:false,message:"please enter valid PIN"})
          userData.address.billing.pincode == data.address.billing.pincode
        }
      }
    }
    if(data.address){
      if(data.address.shipping){
        if(data.address.shipping.city){
          userData.address.shipping.city == data.address.shipping.city
        }
      }
    }
    if(data.address){
      if(data.address.shipping){
        if(data.address.shipping.street){
          userData.address.shipping.street = data.address.shipping.street
        }
      }
    }
    if(data.address){
      if(data.address.shipping){
        if(data.address.shipping.pincode){
          if(!PIN.validate(data.address.shipping.pincode)) return res.status(400).send({status:false,message:"please enter valid PIN"})
          userData.address.shipping.pincode == data.address.shipping.pincode
        }
      }
    }
     if(data.email){
      let checkEmail = await userModel.findOne({$and:[{email:data.email,_id:{$ne:Userid}}]})
      if(checkEmail) {return res.status(400).send({status:false,message:`this email ${data.email} is already in use`})}
      userData.email = data.email
     }
     if(data.phone){
      let checkPhone = await userModel.findOne({$and:[{phone:data.phone,_id:{$ne:Userid}}]})
      if(checkPhone) {return res.status(400).send({status:false,message:`this phone ${data.phone} is already in use`})}
      else
      { userData.phone == data.phone }
      
     }
     if (files && files.length > 0) {
      let formate = files[0].originalname
      if (!(/\.(jpe?g|png|bmp)$/i.test(formate))) return res.status(400).send({ status: false, message: "file must be an image(jpg,png,jpeg)" })
      let uploadedFileURL = await uploadFile(files[0])
      userData.profileImage = uploadedFileURL
  }

    const updatedData = await userModel.findByIdAndUpdate(
      Userid,
      { $set: userData },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "User profile updated",
      data: updatedData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { login, getUserProfile, userCreate, updateUser };
