const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const mongoose = require("mongoose");

// *********************************************************CREATE ORDER**********************************************

const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    const { cancellable, status, cartId } = data;
    if (Object.keys(data).length==0)
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
newOrderCreate = newOrderCreate.toObject()
delete newOrderCreate.isDeleted
    return res
      .status(201)
      .send({ status: true, message: "Success", data: newOrderCreate });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

// **********************************************UPDATE ORDER******************************

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: 'Please provide Data in request body' })

        const { orderId, status } = data
        if (status != "pending" && status != "completed" && status != "cancelled") {
            return res.status(400).send({ status: false, message: "order status can only be pending,completed and cancelled" })
        }

        const findOrder = await orderModel.findById(orderId)
        if (!findOrder) return res.status(404).send({ status: false, message: "order Not found" })

        if (findOrder.status == "completed")
            return res.status(400).send({ status: false, message: "Can Not Update This Order, Because It's Completed Already" })

        if (findOrder.status == "cancelled")
            return res.status(400).send({ status: false, message: "Can Not Update This Order, Because It's Cancelled Already" })

        if (findOrder.userId != userId) return res.status(403).send({ status: false, message: "order is not belong to the user " })

        if (status == "cancelled") {
            if (!findOrder.cancellable) return res.status(400).send({ status: false, message: "This order is not cancellable" })
        }
        const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: updateOrder })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createOrder,updateOrder };
