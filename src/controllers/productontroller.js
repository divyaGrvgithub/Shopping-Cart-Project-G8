const productModel = require("../models/productModel");
const uploadFile = require("../router/aws");
const {
  createProductJoi,
  updateProductJoi,
} = require("../validation/validator");
const mongoose = require("mongoose");

// **********************************************CREATE PRODUCT****************************************************************

const createProduct = async (req, res) => {
  try {
    let data = req.body;

    let files = req.files;
    let fileUrl;
    if (files && files.length > 0) {
      let uploadImage = await uploadFile(files[0]);
      fileUrl = uploadImage;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "please upload image" });
    }
    data["productImage"] = fileUrl;
    //validation
    try {
      await createProductJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }
    if (data.availableSizes) {
      let reqSize = data.availableSizes.toUpperCase().split(",");
      reqSize = [...new Set(reqSize)];
      let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"];

      for (let i of reqSize) {
        if (!enumValue.includes(i)) {
          return res.status(400).send({
            status: false,
            message: `Sizes can be only from "S", "XS","M","X", "L","XXL", "XL" these`,
          });
        }
      }
      data.availableSizes = reqSize.map((x) => {
        return x;
      });
    }
    //unique value
    const existingTitle = await productModel.findOne({
      $and: [{ title: data.title, isDeleted: false }],
    });
    if (existingTitle)
      return res.status(400).send({
        status: false,
        message: "title already exist please enter another one",
      });

    //data creation
    const createProduct = await productModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: "Success", data: createProduct });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ status: false, message: err.message });
  }
};
// ***********************************************GET PRODUCT BY QUERY***********************************************

const getAllProduct = async (req, res) => {
  try {
    let data = req.query;

    let { size, name, priceGreaterThan, priceLessThan, priceSort, ...rest } =
      data;

    if (Object.keys(rest).length > 0)
      return res.status(400).send({
        status: false,
        message:
          "You can filter only by size, name, priceGreaterThan, priceLessThan, priceSort ",
      });

    let filter = { isDeleted: false };

    if (size) {
      size = size.toUpperCase().split(",");
      filter.availableSizes = { $in: size }; ///check whether it will apply on product creation time
    }
    if (name) {
      filter.title = name;
    }

    if (priceGreaterThan) {
      filter.price = { $gt: priceGreaterThan };
    }

    if (priceLessThan) {
      filter.price = { $lt: priceLessThan };
    }
    if (priceSort) {
      if (!(priceSort == "1" || priceSort == "-1"))
        return res.status(400).send({
          status: false,
          message: "value priceSort can either be 1 or -1",
        });

      if (priceSort == "1") {
        const allProducts = await productModel.find(filter).sort({ price: 1 });
        if (allProducts.length == 0)
          return res
            .status(404)
            .send({ status: false, message: "No Product Found" });
        return res
          .status(200)
          .send({ status: true, message: "Success", data: allProducts });
      } else if (priceSort == "-1") {
        const allProducts = await productModel.find(filter).sort({ price: -1 });
        if (allProducts.length == 0)
          return res
            .status(404)
            .send({ status: false, message: "Product not Found" });
        return res
          .status(200)
          .send({ status: true, message: "Success", data: allProducts });
      }
    }

    let getData = await productModel
      .find(filter)
      .select({ _id: 0, __v: 0 })
      .sort({ price: 1 });
    // console.log(getData)
    if (getData.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "Product not Found" });
    res.status(200).send({ status: true, message: "Success", data: getData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// **********************************************Get Poduct ById******************************

let getProductsById = async (req, res) => {
  try {
    let productId = req.params.productId;

    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide the productId" });
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });

    const products = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!products)
      return res.status(404).send({
        status: true,
        message: "This product is deleted or not found",
      });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: products });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// **********************************************Update Poduct ******************************
const updateProduct = async (req, res) => {
  try {
    let productId = req.params.productId;
    let data = req.body;
    let files = req.files;

    //validProductId
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({
          status: false,
          message: "productId in param is not a valid product id",
        });

    //joiValidation
    try {
      await updateProductJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }

    //exist product id
    const existProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!existProduct)
      return res
        .status(404)
        .send({
          status: false,
          message: "no product found with this product id",
        });

    const titleExist = await productModel.findOne({
      title: data.title,
      isDeleted: false,
    });
    if (titleExist)
      return res
        .status(400)
        .send({
          status: false,
          message: "title already in use please use another one",
        });

    if (data.availableSizes) {
      data.availableSizes = data.availableSizes.split(",");
      let availableSizes = data.availableSizes;
      //enum validaiton
      let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"];

      let unique = [];
      for (let i = 0; i < availableSizes.length; i++) {
        availableSizes[i] = availableSizes[i].toUpperCase();
        if (unique.indexOf(availableSizes[i]) == -1) {
          if (enumValue.includes(availableSizes[i])) {
            unique.push(availableSizes[i]);
          } else {
            return res
              .status(400)
              .send({
                status: false,
                message: `availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these`,
              });
          }
        }
      }

      data.availableSizes = unique;
    }

    if (files && files.length > 0) {
      if (
        files[0].mimetype != "image/jpeg" &&
        files[0].mimetype != "image/png" &&
        files[0].mimetype != "image/jpg"
      )
        return res
          .status(400)
          .send({ status: false, message: "you can upload only image file" });

      let imageUrl = await uploadFile(files[0]);
      data.productImage = imageUrl;
    }

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({
          status: false,
          message: "please enter atleast one field in order to update it",
        });

    const updatedData = await productModel.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "successfully updated",
        data: updatedData,
      });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
// *********************************************************DELETE PRODUCT**********************************************
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "please enter productID first" });
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid product ID" });
    const deleteProduct = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!deleteProduct)
      return res.status(404).send({
        status: true,
        message: "This product is deleted or not found",
      });
    return res
      .status(200)
      .send({ status: true, message: "Product is deleted" });
  } catch (e) {
    return res.status(500).send({ status: false, message: e.message });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductsById,
  updateProduct,
};
