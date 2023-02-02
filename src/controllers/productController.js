const productModel = require('../models/productModel')
const aws = require("../router/aws")
const { createProductJoi, isValidSize, isValidObjectId } = require('../validation/validator')

// **********************************************CREATE PRODUCT******************************

const createProduct = async (req, res) => {
    try {
        let data = req.body
        //validation
        try {
            await createProductJoi.validateAsync(data)
        }
        catch (err) {
            return res.status(400).send({ msg: err.message })
        }
        //unique value
        const existingTitle = await productModel.findOne({ title: data.title, isDeleted: false })
        if (existingTitle) return res.status(400).send({ status: false, message: "title already exist please enter another one" })

        //aws s3
        let files = req.files
        let fileUrl
        if (files && files.length > 0) {
            let uploadImage = await aws.uploadFile(files[0])
            fileUrl = uploadImage
        } else {
            return res.status(400).send({ status: false, message: "please upload image" })
        }
        data.productImage = fileUrl
        //data creation

        const createProduct = await productModel.create(data)
        delete createProduct["__V"]

        return res.status(201).send({ status: true, message: "success", data: createProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// **********************************************Get All PRODUCT******************************

const getAllProduct = async (req, res) => {
    try {
        const filters = req.query
        const finalFilters = { isDeleted: false }

        const { name, size, priceGreaterThan, priceLessThan, priceSort } = filters
        if (name) {
            finalFilters.title = { $regex: `.*${name.trim()}.*`, $options: "i" }
        }
        if (size) {
            if (!isValidSize(size)) return res.status(400).send({ status: false, message: 'please provide valid Sizes' })
            finalFilters.availableSizes = size.toUpperCase()
        }
        if (priceLessThan) {
            finalFilters.price = { $lte: priceLessThan }
        }
        if (priceGreaterThan) {
            finalFilters.price = { $gte: priceGreaterThan }
        }
        if (priceLessThan && priceGreaterThan) {
            finalFilters.price = { $lte: priceLessThan, $gte: priceGreaterThan }
        }
        if (priceSort) {
            if (!(priceSort == "1" || priceSort == "-1")) return res.status(400).send({
                status: false, message: "value priceSort can either be 1 or -1"
            })

            if (priceSort == "1") {
                const allProducts = await productModel.find(finalFilters).sort({ price: 1 })
                if (allProducts.length == 0) return res.status(404).send({ status: false, message: "No Product Found" })
                return res.status(200).send({ status: true, message: "Success", data: allProducts })
            }
            else if (priceSort == "-1") {
                const allProducts = await productModel.find(finalFilters).sort({ price: -1 })
                if (allProducts.length == 0) return res.status(404).send({ status: false, message: "Product not Found" })
                return res.status(200).send({ status: true, message: "Success", data: allProducts })
            }

        }
        const allProducts = await productModel.find(finalFilters).select({ _id: 0, __v: 0 }).sort({ price: 1 })
        if (allProducts.length == 0) return res.status(404).send({ status: false, message: "Product not Found" })
        return res.status(200).send({ status: true, message: "Success", data: allProducts })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

// **********************************************Get Poduct ById******************************

let getProductsById = async (req, res) => {
    try {
        let productId = req.params.productId

        if (!productId) return res.status(400).send({ status: false, message: "Please provide the productId" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid ObjectId" })

        const products = await productModel.findById({ _id: productId, isDeleted: false })
        return res.status(200).send({ status: true, message: "Success", data: products })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

// **********************************************Delete Product BYID******************************

let deleteProductById = async (req, res) => {
    try {
        let productId = req.params.productId

        if (!productId) return res.status(400).send({ status: false, message: "You have to provide productId to delete the product" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid ObjectId" })

        let productExist = await productModel.findById({ _id: productId })

        if (!productExist || productExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product is already removed or never existed" })
        }

        const deleteData = await productModel.findByIdAndUpdate({ _id: productId },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: Date.now()
                }
            },
            { new: true })
        return res.status(200).send({ status: true, message: "Success", data: deleteData })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

module.exports = { createProduct, getAllProduct, getProductsById, deleteProductById }
