const productModel = require("../models/productModel");
const uploadFile = require("../router/aws");
const { createProductJoi } = require("../validation/validator");
const mongoose = require('mongoose')
// **********************************************CREATE PRODUCT****************************************************************

const createProduct = async (req, res) => {
  try {
    let data = req.body;
    let { title, description, price, availableSizes, isFreeShipping, installments } = data
    let reSize = availableSizes.toUpperCase()
    data.availableSizes = reSize
    //validation
    try {
      await createProductJoi.validateAsync(data);
    } catch (err) {
      return res.status(400).send({ msg: err.message });
    }
    //unique value
    const existingTitle = await productModel.findOne({$and:[{title: title,isDeleted: false }]});
    if (existingTitle)
      return res.status(400).send({
        status: false,
        message: "title already exist please enter another one",
      });

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

    //data creation
    const createProduct = await productModel.create(data);

    delete createProduct["__V"];

    return res
      .status(201)
      .send({ status: true, message: "success", data: createProduct });
  } catch (err) {
    console.log(err.message)
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteProduct = async (req,res) =>{
    try{
        const productId = req.params.productId
        if(!productId) return res.status(400).send({status:false,message:"please enter productID first"})
        if(!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({status:false,message:"please enter valid product ID"})
        const deleteProduct = await productModel.findOneAndUpdate({_id:productId,isDeleted:false},{isDeleted:true,deletedAt:new Date()},{new:true})
        if(!deleteProduct)return res.status(404).send({ status: true, message: "This product is deleted or not found" })
        return res.status(200).send({status:true,message:"Product is deleted"})
    }catch(e){
        return res.status(500).send({ status: false, message: e.message })
    }
}
module.exports = { createProduct,deleteProduct };
