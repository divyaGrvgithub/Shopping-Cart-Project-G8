const cartModel = require('../models/cartModel')
const productModel= require('../models/productModel')

const createCart = async (req,res)=>{
    try{
        let userId = req.params.userId
        let product = req.body
        let {productId} = product

        let existCart = await cartModel.findById(userId)

        if(!existCart){
            const findPrice = await productModel.findOne({_id:productId,isDeleted:false})
            let totalPrice = 0
            const newCart={
                userId:userId,
                items:[{productId:productId,quantity:1}],
                totalPrice:totalPrice+=findPrice.price,
                totalItems:1
            }

            let createCart = await cartModel.create(newCart)
            res.status(201).send({status:true,data:createCart})
        }else{
            const items = existCart.items
            let totalPrice = existCart.totalPrice
            let totalItems = existCart.totalItems
            for(let item of items){
               const product = await productModel.findOne({_id:item.productId,isDeleted:false})
               totalPrice += product.price
               totalItems += item.quantity?.
            }
        }

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports={createCart}