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
    
    let cartExist = await cartModel.findById(cartId);
   
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
      let totalPrice=cartExist.totalPrice
      
      const product=await productModel.findOne({_id:productId},{isDeleted:false});
      totalPrice+=product.price;
    
      let quantity=1
      for (const item of cartExist.items){
         
     if(item.productId.toString()===productId.toString()){
        quantity= item.quantity+1;       
        }}
        if(quantity==1){
         let newItem ={
          productId:productId,
          quantity: quantity
         }
      cartExist.items.push(newItem)
        }
        let updateCart = {
          items: cartExist.items,
          totalPrice: totalPrice,
          totalItems: cartExist.items.length
        }
        const createCart = await cartModel.findOneAndUpdate(
          {_id:cartExist._id},
          { $set: updateCart  },
          { new: true }
        );
        return res
          .status(201)
          .send({ status: true, message: "Success", data: createCart })
        }
      
    
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
  }


  const getCart = async (req,res)=>{
    try{
      const userId = req.params.userId;
      if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"invalid userId"})
      let getCartData = await cartModel.findOne({userId}).populate({path:'items.productId',model:'Product',select:["title","price","currencyFormat","description","productImage"]})
      if(!getCartData) return res.status(404).send({ status: false, message: "cart is empty" })
      res.status(200).send({status:true,message:"Success",data:getCartData})
    }catch(err){
      res.status(500).send({ Status: false, message: err.message })
    }
  }
module.exports = { createCart, getCart };
