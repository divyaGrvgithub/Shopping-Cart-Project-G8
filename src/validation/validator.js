const joi = require("joi");
const mongoose = require("mongoose")

// **********************************CreateUser Validation******************************
const userJoi = joi.object({
  fname: joi
    .string()
    .trim()
    .required()
    .regex(/^[a-zA-Z.]+$/)
    .message("please enter valid first name"),
  lname: joi
    .string()
    .trim()
    .required()
    .regex(/^[a-zA-Z.]+$/)
    .message("please enter valid first name"),
  email: joi
    .string()
    .trim()
    .required()
    .regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/)
    .message("please enter valid email"),
  profileImage: joi.string().trim(),
  phone: joi
    .string()
    .trim()
    .required()
    .regex(/^[0]?[6789]\d{9}$/)
    .message("phone is not valid"),
  password: joi
    .string()
    .trim()
    .required()
    .min(8)
    .max(15)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z@#$&\d]{8,15}$/)
    .message("password  should contain Min 8 character"),
  address: joi.object({
    shipping: joi.object({
      street: joi.string().required(),
      city: joi
        .string()
        .required()
        .trim()
        .regex(/^[a-zA-Z.]+$/)
        .message("please enter valid city name"),
      pincode: joi.number().required(),
    }),
    billing: joi.object({
      street: joi.string().required(),
      city: joi
        .string()
        .required()
        .trim()
        .regex(/^[a-zA-Z.]+$/)
        .message("please enter valid city name"),
      pincode: joi.number().required(),
    }),
  }),
});

// **********************************User Login Validation******************************

const userlogin = joi.object({
  email: joi
    .string()
    .required()
    .trim()
    .regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/)
    .message("please enter valid email"),
  password: joi
    .string()
    .trim()
    .required()
    .min(8)
    .max(15)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z@#$&\d]{8,15}$/)
    .message("please enter valid password"),
});

// **********************************Update User Validation******************************

const updateUserJoi = joi.object({
    fname:joi.string().optional().regex(/^[a-zA-Z. ]+$/).message("please enter valid fname"),

    lname:joi.string().optional().regex(/^[a-zA-Z. ]+$/).message("please enter valid lname"),

    email:joi.string().optional().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),

    phone:joi.string().optional().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    password:joi.string().optional().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z@#$&\d]{8,15}$/).message("please enter valid password"),

    address:joi.object({
        shipping:joi.object({
            street:joi.string().optional(),
            city:joi.string().optional(),
            pincode:joi.optional()
        }),

        billing:joi.object({
            street:joi.string().optional(),
            city:joi.string().optional(),
            pincode:joi.optional()
        })
    })
})

// **********************************Pincode Validation******************************

const isValidPinCode = (value) => {
  const regEx = /^\s*([0-9]){6}\s*$/;
  const result = regEx.test(value);
  return result;
};

// **********************************ObjectId Validation******************************

const isValidObjectId = function (objectId) {
  var valid = mongoose.Types.ObjectId.isValid(objectId)
  if (!valid) { return false }
  else { return true }
}

// **********************************Create Product Validation******************************

const createProductJoi = joi.object({
  title: joi.string().required(),
  description:joi.string().required(),
  price:joi.number().required(),
  currencyId:joi.string().required().valid("INR"),
  currencyFormat: joi.string().valid("₹"),
  isFreeShipping: joi.boolean().optional(),
  style:joi.string().optional(),
  availableSizes:joi.string().valid("S", "XS","M","X", "L","XXL", "XL").optional(),
  installments: joi.number().optional(),
  deletedAt: joi.date(), 
  isDeleted: joi.boolean(),
});

// **********************************Valid Size Validation******************************

const isValidSize = function (value) {
  let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  for (let x of value) {
    if (enumValue.includes(x) == false) return false
  }
  return true;
}

module.exports = { userlogin, userJoi, updateUserJoi,isValidObjectId,createProductJoi ,isValidPinCode,isValidSize,isValidObjectId};