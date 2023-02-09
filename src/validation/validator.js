const joi = require("joi");
const mongoose=require("mongoose")

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
  password: joi.string().required().min(8).max(15),
  address: joi.object({
    shipping: joi.object({
      street: joi.string().required(),
      city: joi.string().required(),
      pincode: joi.number().required(),
    }),
    billing: joi.object({
      street: joi.string().required(),
      city: joi.string().required(),
      pincode: joi.number().required(),
    }),
  }),
});

const userlogin = joi.object({
  email: joi
    .string()
    .required()
    .trim()
    .regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/)
    .message("please enter valid email"),
  password: joi.string().required().min(8).max(15),
});

const updateUserJoi = joi.object({
  fname: joi
    .string()
    .optional()
    .regex(/^[a-zA-Z. ]+$/)
    .message("please enter valid fname"),

  lname: joi
    .string()
    .optional()
    .regex(/^[a-zA-Z. ]+$/)
    .message("please enter valid lname"),

  email: joi
    .string()
    .optional()
    .regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/)
    .message("please enter valid email"),
  profileImage: joi.string().trim(),
  phone: joi
    .string()
    .optional()
    .regex(/^[5-9]{1}[0-9]{9}$/)
    .message("please enter valid mobile number"),

  password: joi.string().min(8).max(15),

  address: joi.object({
    shipping: joi.object({
      street: joi.string().optional(),
      city: joi.string().optional(),
      pincode: joi.number().optional(),
    }),

    billing: joi.object({
      street: joi.string().optional(),
      city: joi.string().optional(),
      pincode: joi.number().optional(),
    }),
  }),
});
const isValidPinCode = (value) => {
  const regEx = /^\s*([0-9]){6}\s*$/;
  const result = regEx.test(value);
  return result;
};
const createProductJoi = joi.object({
  title: joi.string().optional(),
  description: joi.string().optional(),
  price: joi.number(),
  currencyId: joi.string().optional().valid("INR"),
  currencyFormat: joi.string().valid("₹"),
  isFreeShipping: joi.boolean().optional(),
  style: joi.string().optional(),
  availableSizes: joi.string().optional(),
  productImage: joi.optional(),
  installments: joi.number().optional(),
  deletedAt: joi.date().optional(),
  isDeleted: joi.boolean()
});

const updateProductJoi = joi.object({
  title: joi.string().optional(),
  description: joi.string().optional(),
  price: joi.number().optional(),
  productImage: joi.optional(),
  currencyId: joi.string().optional().valid("INR"),
  currencyFormat: joi.string().optional().valid("₹"),
  isFreeShipping: joi.boolean().optional(),
  style: joi.string().optional(),
  availableSizes: joi.string().optional(),
  installments: joi.number().optional(),
  deletedAt: joi.date(),
  isDeleted: joi.boolean(),
})

const validObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId)
}
module.exports = {
  userlogin,
  userJoi,
  isValidPinCode,
  updateProductJoi,
  updateUserJoi,
  createProductJoi,
  validObjectId
};
