const UserModel = require("../models/userModel")
const {userlogin,userJoi,updateUserJoi, isValidPinCode} = require("../validation/validator");
const PIN = require("pincode-validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const aws = require("../router/aws")
const mongoose = require("mongoose")

const createUser = async (req, res) => {
    try {
        let data = req.body
        const profileImage = req.files
        // let { fname, lname, phone, email, password, address } = data
        //  CHECK  if request body is empty
        if (!Object.keys(data).length > 0) return res.status(400).send({ status: false, error: "Please enter data" })

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

        email = data.email.toLowerCase()
        const isEmailAlreadyUsed = await UserModel.findOne({ email: email })
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: `This ${email} email is  already exists, please provide another email` })
        
        phone=data.phone
        const isPhoneAlreadyUsed = await UserModel.findOne({ phone: phone })
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `This ${phone} mobile no is number already exists, please provide another mobile number` })

        //  ENCRYPTING PASSWORD
        password=data.password
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(password, salt);
        data.password = hash

        //  Create : aws link for profile image
        var uploadedFileURL = await aws.uploadFile(profileImage[0])

        data.profileImage = uploadedFileURL;

        const createUser = await UserModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const login = async (req, res) => {
    try {
        let data = req.body;
        let { email, password } = data

        if (Object.keys(data).length == 0)
            return res
                .status(400)
                .send({ status: false, message: "please enter data first" });
        try {
            await userlogin.validateAsync(data);
        } catch (error) {
            return res.status(400).send({ status: false, message: error.message });
        }
        let findUser = await UserModel.findOne({ email: email.trim() });
        if (!findUser)
            return res
                .status(404)
                .send({ status: false, message: "Credentials do not match" });

        let codePass = findUser.password;
        let originalPass = bcrypt.compareSync(password, codePass);
        if (!originalPass)
            return res
                .status(401)
                .send({ status: false, message: "password incorrect" });
        let token = jwt.sign({ userId: findUser._id }, "shopping-cart-group8", {
            expiresIn: "24h",
        });
        res.setHeader("x-api-key", token);
        res.status(200).send({
            status: true,
            message: "User login successfully",
            data: { userId: findUser._id, token: token },
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "invalid id" })

        let userProfile = await UserModel.findById(userId)
        if (!userProfile) return res.status(404).send({ status: false, message: "user not found" })
        return res.status(200).send({ status: true, message: "User profile details", data: userProfile })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

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
        const existingData = await UserModel.findOne({
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
      const updateData = await UserModel.findByIdAndUpdate(
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
module.exports = { createUser, login, getUserProfile, updateUser }
