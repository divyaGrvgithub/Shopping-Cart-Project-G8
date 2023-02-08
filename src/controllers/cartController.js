const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");

// **********************************************Create Cart******************************************************
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
// *****************************************Get Cart***************************************************
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
// ******************************************Update Cart**********************************************************
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

    if (removeProduct===undefined)
      return res
        .status(400)
        .send({ status: false, message: "please enter remove Product first" });

    const getCart = await cartModel.findById(cartId);
    if (!getCart)
      return res
        .status(400)
        .send({ status: false, message: "no cart present" });
// console.log((getCart.items));
    let removeItem;
    let items = getCart.items;
    for (let item in items) {
      
      if (items[item].productId.toString() == productId.toString()) {
        // console.log(removeProduct)
        if (removeProduct === 0) {
                // console.log("hi",item)
          removeItem = items.splice(item, 1);
          console.log(items);
          break;
        }
        if (removeProduct == 1 && items[item].quantity >= 1) {
          if(items[item].quantity ==1){
            removeItem = items.splice(item, 1);
            break;
          }
          items[item].quantity -= 1;
          removeItem = items[item];
          // console.log(removeItem);
          break;
        }
      }
    }
    // console.log(removeItem)
    let pId ,Q
    if(Array.isArray(removeItem)){
      pId=removeItem[0]?.productId
      Q=removeItem[0]?.quantity
    }else{
      pId=removeItem?.productId
      Q=removeItem?.quantity
    }
    if (!pId){
      return res
        .status(400)
        .send({ status: false, message: "no product present to remove" })};
        
    let productTORemove = await productModel.findById(pId);
    if (!productTORemove)
      return res
        .status(404)
        .send({ status: false, message: "Product is not found" });
        // console.log(getCart.totalPrice)
        // console.log(productTORemove.price)
    let totalPrice = getCart.totalPrice - (productTORemove.price*Q);
    // console.log(totalPrice);
    let totalItems = getCart.items.length;
    let updateCart = await cartModel.findOne({_id:cartId});
    updateCart.totalPrice=totalPrice
    updateCart.totalItems=totalItems
    updateCart.items=items
    await updateCart.save();
    let nextUpdate = await cartModel.findOne({_id:cartId})

    return res
      .status(200)
      .send({ status: true, message: "Update Cart", data: nextUpdate });
  } catch (err) {
    res.status(500).send({ Status: false, message: err.message });
  }
};
// ****************************************************Delete Cart******************************************
const deleteCart = async (req, res) => {
  try {
      let userId = req.params.userId;

      let cartData = await cartModel.findOne({ userId });
      if (!cartData) {
          return res.status(404).send({ status: false, message: 'Cart does not exist' });
      }

      if(cartData.totalItems==0)  return res.status(404).send({ status: false, message: 'cart is already empty' });

      await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 });
    return  res.status(204).send();
  }
  catch (err) {
    return  res.status(500).send({ status: false, message: err.message });
  }
} 
module.exports = { createCart, getCart, updateCart,deleteCart };
