const userModel = require("../models/userModel");
const { userlogin, userJoi } = require("../validation/validator");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const uploadFile = require("../router/aws");
const userCreate = async (req, res) => {
  try {
    let data = req.body;
    let files = req.files;
    // console.log(files)
    let address = JSON.parse(data.address);
    data.address = address;
    let shipPin = data.address.shipping.pincode.toString();
    data.address.shipping.pincode = shipPin;
    let billPin = data.address.billing.pincode.toString();
    data.address.billing.pincode = billPin;
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
      //    console.log("hii")
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

const getUserProfile = async (req, res) => {
  try {
    userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).send({ status: false, message: "invalid id" });

    let userProfile = await userModel.findById(userId);
    if (!userProfile)
      return res.status(404).send({ status: false, message: "user not found" });

    return res
      .status(200)
      .send({
        status: true,
        message: "User profile details",
        data: userProfile,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { login, getUserProfile, userCreate };
