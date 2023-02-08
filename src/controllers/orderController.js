const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const mongoose = require("mongoose");

const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    const { cancellable, status, cartId } = data;
    if (!Object.keys(data))
      return res
        .status(400)
        .send({ status: false, message: "please provide some data" });
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "invalid userId" });
    let cartExist = await cartModel.findOne({ userId: userId });
    if (!cartExist)
      return res.status(400).send({ status: false, message: "cart not found" });
    if (cancellable) {
      if (!(cancellable == true || cancellable == false)) {
        return res
          .status(400)
          .send({
            status: false,
            message: "cancellable can only be true or false",
          });
      }
    }
    if (status) {
      if (cancellable == false && status == "cancelled")
        return res
          .status(400)
          .send({
            status: false,
            message: "if cancel is not allowed the status cannot be cancelled",
          });

      if (!["pending", "completed", "cancelled"].includes(status.toLowerCase()))
        return res
          .status(400)
          .send({
            status: false,
            message: `the status can be from ["pending", "completed", "cancelled"]`,
          });
    }
    let totalQuantity = 0;
    let items = cartExist.items;
    for (let item = 0; item < items.length; item++) {
      totalQuantity += items[item].quantity;
    }
    if (totalQuantity == 0)
      return res
        .status(400)
        .send({ status: false, message: "no product in cart" });
    const orderPlace = {
      userId: userId,
      items: items,
      totalPrice: cartExist.totalPrice,
      totalItems: cartExist.totalItems,
      totalQuantity: totalQuantity,
    };
    let newOrderCreate = await orderModel.create(orderPlace);
    await cartModel.findOneAndUpdate(
      { _id: cartId },
      { $set: { items: [], totalItems: 0, totalPrice: 0 } },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Success", data: newOrderCreate });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { createOrder };
