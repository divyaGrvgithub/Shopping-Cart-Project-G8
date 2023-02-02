const userModel = require("../models/userModel");
const {
  userlogin,
  userJoi,
  updateUserJoi,
  isValidPinCode,
} = require("../validation/validator");
const jwt = require("jsonwebtoken");
// const PIN = require("pincode-validator");
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
    if (!isValidPinCode(pincodeShipping) || !isValidPinCode(pincodeBilling))
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
    let userId = req.params.userId;
    let data = req.body;
    const files = req.files;
    let fileUrl;
    if (files) {
      if (files && files.length > 0) {
        const uploadedFileURL = await uploadFile(files[0]);
        fileUrl = uploadedFileURL;
      }
    }
    data.profileImage = fileUrl;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter data to update" });
    }
    if (data.address) {
      data.address = JSON.parse(data.address);

      if (data.address.shipping) {
        if (data.address.shipping.pincode) {
          if (!isValidPinCode(data.address.shipping.pincode))
            return res.status(400).send({
              status: false,
              message: "pin code in shipping address is not valid",
            });
        }
      }
      if (data.address.billing) {
        if (data.address.billing.pincode) {
          if (!isValidPinCode(data.address.billing.pincode))
            return res.status(400).send({
              status: false,
              message: "pin code in billing address is not valid",
            });
        }
      }
    }
    //joi validation
    try {
      await updateUserJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }
    //unique email and phone
    if (data.email || data.phone) {
      const existingData = await userModel.findOne({
        $or: [{ email: data.email }, { phone: data.phone }],
      });
      if (existingData) {
        if (existingData.email == data.email.trim())
          return res
            .status(400)
            .send({ status: false, message: "update email should be new " });
        if (existingData.phone == data.phone.trim())
          return res
            .status(400)
            .send({ status: false, message: "update phone should be new" });
      }
    }

    //password hashed
    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      const codePass = bcrypt.hashSync(data.password, salt);
      data.password = codePass;
    }
    

    //updation of data
    const updateData = await userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    );

    return res.status(200).send({
      status: false,
      message: "User profile updated",
      data: updateData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { login, getUserProfile, userCreate, updateUser };
