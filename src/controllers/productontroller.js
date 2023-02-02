const productModel = require('../models/productModel')
const uploadFile = require("../router/aws")
const {createProductJoi} = require('../validation/validator')

// **********************************************CREATE PRODUCT******************************

const createProduct = async (req,res) =>{
    try{
        let data=req.body              //check for data type


   
    //validation
try{
    await createProductJoi.validateAsync(data)
}
catch(err){
    return res.status(400).send({ msg: err.message })
}
    //unique value
    const existingTitle=await productModel.findOne({title:data.title,isDeleted:false})
    if(existingTitle) return res.status(400).send({status:false,message:"title already exist please enter another one"})

    //aws s3
    let files=req.files
    let fileUrl
    if(files&&files.length>0){
        let uploadImage=await uploadFile(files[0])
    fileUrl=uploadImage
    }else{
        return res.status(400).send({status:false,message:"please upload image"})
    }
  data.productImage=fileUrl
    //data creation

    const createProduct=await productModel.create(data)

  

    delete createProduct["__V"]

   return res.status(201).send({status:true,message:"success",data:createProduct})
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports = {createProduct}