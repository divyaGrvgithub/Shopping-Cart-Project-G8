const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const mongoose = require('mongoose')
const createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    const { productId,cartId } = data;
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "not valid userId" });
    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "empty body" });
    console.log(cartId)
    let cartExist = await cartModel.findById(cartId);
    console.log(cartExist)
    if (!cartExist) {
      let productPrice = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    
    if (!productPrice)
      return res
        .status(404)
        .send({ status: false, message: "product not found" });
      let totalPrice = 0;
      const newCart = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: 1,
          },
        ],
        totalPrice: (totalPrice += productPrice.price),
        totalItems: 1,
      };
      let create = await cartModel.create(newCart);
      return res
        .status(201)
        .send({ status: true, message: "Success", data: create });
    } else {
      const items = cartExist.items;
      let totalPrice = cartExist.totalPrice      
      let totalItems=cartExist.totalItems
      let updatedItems = []
      for (let item of items) {
        const product = await productModel.findOne({
          _id: item.productId,
          isDeleted: false,
        });
        if (!product)
          return res.status(404).send({ message: "no product found" });
        totalPrice += product.price;
        totalItems+=item.quantity
      }
      let updateCart = {
        items: items,
        totalPrice: totalPrice,
        totalItems: totalItems
      };
      const createCart = await cartModel.findByIdAndUpdate(
        cartExist._id,
        { $set: updateCart  },
        { new: true }
      );
      return res
        .status(201)
        .send({ status: true, message: "Success", data: createCart });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart };
