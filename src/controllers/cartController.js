const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    const { productId, cartId } = data;
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "not valid userId" });
    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "empty body" });

    let cartExist = await cartModel.findOne({userId:userId});

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
      let totalPrice = cartExist.totalPrice;

      const product = await productModel.findOne(
        { _id: productId },
        { isDeleted: false }
      );
      totalPrice += product.price;

      let quantity = 1;
      for (let item of cartExist.items) {
        // console.log(item)
        if (item.productId.toString() == productId.toString()) {

          quantity = item.quantity+1
          item.quantity=quantity
         
        }
      }
      if (quantity === 1) {
        let newItem = {
          productId: productId,
          quantity: quantity
        }
        cartExist.items.push(newItem)
      }
      let updateCart = {
        items: cartExist.items,
        totalPrice: totalPrice,
        totalItems: cartExist.items.length,
      };
      const createCart = await cartModel.findOneAndUpdate(
        { _id: cartExist._id },
        { $set: updateCart },
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

const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "invalid userId" });
    let getCartData = await cartModel
      .findOne({ userId })
      .populate({
        path: "items.productId",
        model: "Product",
        select: [
          "title",
          "price",
          "currencyFormat",
          "description",
          "productImage",
        ],
      });
    if (!getCartData)
      return res.status(404).send({ status: false, message: "cart is empty" });
    res
      .status(200)
      .send({ status: true, message: "Success", data: getCartData });
  } catch (err) {
    res.status(500).send({ Status: false, message: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const data = req.body;
    let { cartId, productId, removeProduct } = data;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Body can't be empty" });

    if (!cartId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide cartId" });
    if (!mongoose.isValidObjectId(cartId))
      return res
        .status(400)
        .send({ status: false, message: "This is invalid Cart Id" });

    if (!productId)
      return res
        .status(400)
        .send({ status: false, message: "Please provide productId" });
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "This is invalid Prodict Id" });

    if (removeProduct != 0 && removeProduct != 1)
      return res
        .status(400)
        .send({ status: false, message: "please enter remove Product first" });

    const getCart = await cartModel.findById(cartId);
    if (!getCart)
      return res
        .status(400)
        .send({ status: false, message: "no cart present" });

    let removeItem;
    let items = getCart.items;
    for (let item of items) {
      if (item.productId == productId) {
        if (removeProduct == 0) {
          removeItem = items.splice(item, 1);
          break;
        }
        if (removeProduct == 1 && item.quantity > 1) {
          item.quantity = -1;
          removeItem = item;
          break;
        }
      }
    }
    console.log("hii")
    if (!removeItem)
      return res
        .status(400)
        .send({ status: false, message: "no product present to remove" });
        let idOfProduct=removeItem.productId
    let productTORemove = await productModel.findById(idOfProduct.toString());
    if (!productTORemove)
      return res
        .status(404)
        .send({ status: false, message: "Product is not found" });
    let totalPrice = getCart.totalPrice - productTORemove.price;
    let totalItems = getCart.items.length;
    let update = {
      items: getCart.items,
      totalPrice: totalPrice,
      totalItems: totalItems,
    };
    let updateCart = await cartModel.findOneAndUpdate(
      { _id: getCart._id },
      { $set: { update } },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, mssage: "Update Cart", data: updateCart });
  } catch (err) {
    res.status(500).send({ Status: false, message: err.message });
  }
};
module.exports = { createCart, getCart, updateCart };
