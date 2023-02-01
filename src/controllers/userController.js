const UserModel = require("../models/userModel")
const { isValidObjectId, isValidPassword,
    isValidName, isValidString,
    isValidImage, isValidEmail,
    isValidPincode, isValidMobile } = require("../validation/validator")
const bcrypt = require("bcrypt")
const { userlogin } = require('../validation/validator')
const jwt = require("jsonwebtoken")
const aws = require("../router/aws")
const mongoose = require("mongoose")

const createUser = async (req, res) => {
    try {
        let data = req.body
        const profileImage = req.files
        let { fname, lname, phone, email, password, address } = data
        //  CHECK  if request body is empty
        if (!Object.keys(data).length > 0) return res.status(400).send({ status: false, error: "Please enter data" })

        if (!fname) { return res.status(400).send({ status: false, message: "fname is mandatory" }) }
        if (!lname) { return res.status(400).send({ status: false, message: "lname is mandatory" }) }
        if (!email) { return res.status(400).send({ status: false, message: "email is mandatory" }) }
        if (profileImage.length === 0) { return res.status(400).send({ status: false, message: "profileImage is mandatory" }) }
        if (profileImage.length > 1) { return res.status(400).send({ status: false, message: 'please select only one profile image' }) }
        if (!phone) { return res.status(400).send({ status: false, message: "phone is mandatory" }) }
        if (!password) { return res.status(400).send({ status: false, message: "password is mandatory" }) }
        if (!address) { return res.status(400).send({ status: false, message: "address is mandatory" }) }

        address = JSON.parse(address)
        data.address = address
        if (!address.shipping) { return res.status(400).send({ status: false, message: "shipping address is mandatory" }) }
        if (!address.shipping.street) { return res.status(400).send({ status: false, message: "street is mandatory in shipping address" }) }
        if (!address.shipping.city) { return res.status(400).send({ status: false, message: "city is mandatory in shipping address" }) }
        if (!address.shipping.pincode) { return res.status(400).send({ status: false, message: "pincode is mandatory in shipping address" }) }
        if (!address.billing) { return res.status(400).send({ status: false, message: "billing address is mandatory" }) }
        if (!address.billing.street) { return res.status(400).send({ status: false, message: "street is mandatory in billing address" }) }
        if (!address.billing.city) { return res.status(400).send({ status: false, message: "city is mandatory in billing address" }) }
        if (!address.billing.pincode) { return res.status(400).send({ status: false, message: "pincode is mandatory in billing address" }) }

        if (!isValidName(fname)) { return res.status(400).send({ status: false, message: "fname is not valid" }) }
        if (!isValidName(lname)) { return res.status(400).send({ status: false, message: "lname is not valid" }) }
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "email is not valid" }) }
        if (!isValidImage(profileImage[0].originalname)) { return res.status(400).send({ status: false, message: "Profile Image formate is not valid" }) }
        if (!isValidMobile(phone)) { return res.status(400).send({ status: false, message: "Mobile no is not valid" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Choose a Strong Password,Use a mix of letters (uppercase and lowercase), numbers, and symbols in between 8-15 characters" }) }
        if (!isValidString(address.shipping.street)) { return res.status(400).send({ status: false, message: "street is not valid in shipping address" }) }
        if (!isValidName(address.shipping.city)) { return res.status(400).send({ status: false, message: "city is not valid in shipping address" }) }
        if (!isValidPincode(address.shipping.pincode)) { return res.status(400).send({ status: false, message: "pincode is not valid in shipping address" }) }
        if (!isValidString(address.billing.street)) { return res.status(400).send({ status: false, message: "street is not valid in billing address" }) }
        if (!isValidName(address.billing.city)) { return res.status(400).send({ status: false, message: "city is not valid in billing address" }) }
        if (!isValidPincode(address.billing.pincode)) { return res.status(400).send({ status: false, message: "pincode is not valid in billing address" }) }


        email = data.email = data.email.toLowerCase()
        const isEmailAlreadyUsed = await UserModel.findOne({ email: email })
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: `This ${email} email is  already exists, please provide another email` })

        const isPhoneAlreadyUsed = await UserModel.findOne({ phone: phone })
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `This ${phone} mobile no is number already exists, please provide another mobile number` })

        //  ENCRYPTING PASSWORD
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
        let {email,password}=data

        if (Object.keys(data).length == 0)
            return res
                .status(400)
                .send({ status: false, message: "please enter data first" });
        try {
            await userlogin.validateAsync(data);
        } catch (error) {
            return res.status(400).send({ status: false,message: error.message });
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
module.exports = { createUser, login, getUserProfile }
