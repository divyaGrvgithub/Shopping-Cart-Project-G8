const UserModel = require("../models/userModel")
const { userlogin, userJoi, updateUserJoi, isValidPinCode } = require("../validation/validator");
const PIN = require("pincode-validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const aws = require("../router/aws")
const mongoose = require("mongoose")

// **********************************************CREATE USER******************************

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

        phone = data.phone
        const isPhoneAlreadyUsed = await UserModel.findOne({ phone: phone })
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `This ${phone} mobile no is number already exists, please provide another mobile number` })

        //  ENCRYPTING PASSWORD
        password = data.password
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

// **********************************************LOGIN USER******************************

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

// **********************************************GET USER PROFILE******************************

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

// **********************************************UPDATE USER******************************

const updateUser = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;
        const files = req.files;
        let fileUrl;

        if (files && files.length > 0) {
            const uploadedFileURL = await uploadFile(files[0])
            fileUrl = uploadedFileURL;
        }
        data.profileImage = fileUrl;
        if (Object.keys(data).length == 0) {
            return res
                .status(400)
                .send({ status: false, message: "Please Enter data to update" });
        }
        if (data.address) {
            let address = JSON.parse(data.address)
            data.address = address
        }
        try {
            await updateUserJoi.validateAsync(data);
        } catch (err) {
            return res.status(400).send({ msg: err.message });
        }
        let userdata = await UserModel.findOne({ _id: userId }).select({ _id: 0, updatedAt: 0, createdAt: 0, __v: 0 }).lean()
        if (fileUrl) {
            userdata.profileImage = fileUrl
        }
        if (data.fname) {
            userdata.fname = data.fname
        }
        if (data.lname) {
            userdata.lname = data.lname
        }
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            const codePass = bcrypt.hashSync(data.password, salt);
            data.password = codePass;
        }
        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.city) {
                    data.address.billing.city = userdata.address.billing.city
                    // console.log("hii")
                }
            }
        }
        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.street) {
                    userdata.address.billing.street = data.address.billing.street
                }
            }
        }
        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.pincode) {
                    if (!isValidPinCode(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    userdata.address.billing.pincode = data.address.billing.pincode
                }
            }
        }
        if (data.address) {
            if (data.address.shipping) {
                // console.log("hii")
                if (data.address.shipping.city) {
                    userdata.address.shipping.city = data.address.shipping.city
                }
            }
        }
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.street) {
                    userdata.address.shipping.street = data.address.shipping.street
                }
            }
        }
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.pincode) {
                    if (!isValidPinCode(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    userdata.address.shipping.pincode = data.address.shipping.pincode
                }
            }
        }
        if (data.email) {
            let checkEmail = await UserModel.findOne({ email: data.email })
            if (checkEmail) {
                if (checkEmail.email == data.email) return res.status(400).send({ status: false, message: `this mail [${data.email}] is already in use` })
            }
            if (!checkEmail) {
                userdata.email = data.email
            }
        }
        if (data.phone) {
            let checkPhone = await UserModel.findOne({ phone: data.phone })
            if (checkPhone) {
                if (checkPhone.phone == data.phone) return res.status(400).send({ status: false, message: `this Phone number-( ${data.phone} )is already in use` })
            }
            if (!checkPhone) {
                userdata.phone = data.phone
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
            { $set: userdata },
            { new: true }
        );
        return res.status(200).send({
            status: true,
            message: "Update user profile is successful",
            data: updateData,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createUser, login, getUserProfile, updateUser }
