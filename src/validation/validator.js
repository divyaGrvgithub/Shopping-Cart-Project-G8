
const joi = require('joi')

const userJoi = joi.object({
    fname:joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid first name"),
    lname:joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid first name"),
    email:joi.string().trim().required().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),
    profileImage:joi.string().trim(),
    phone:joi.string().trim().required().regex(/^[0]?[6789]\d{9}$/).message("phone is not valid"),
    password:joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password  should contain Min 8 character and 1 Special Symbol"),
    address:joi.object({
        "shipping":joi.object({
            street:joi.string().required(),
            city:joi.string().required().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid city name"),
            pincode:joi.string().required().trim().regex(/^([0-9]{4}|[0-9]{6})$/).message("please enter valid pin")
        }),
        "billing":joi.object({
            street:joi.string().required(),
            city:joi.string().required().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid city name"),
            pincode:joi.string().trim().required().regex(/^([0-9]{4}|[0-9]{6})$/).message("please enter valid PIN")
        })
    })
})

const userlogin = joi.object({
    email:joi.string().required().trim().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),
    password:joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("please enter valid password")
})




module.exports = {userlogin,userJoi}