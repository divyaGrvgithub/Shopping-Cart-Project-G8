const express = require("express")
const router = express.Router()
const {userCreate,login,getUserProfile,updateUser} = require("../controllers/userController")
const {createProduct,deleteProduct,getAllProduct,getProductsById} = require("../controllers/productontroller")
const {authentication, authorization}= require("../middleware/auth.js")
const {createCart,getCart,updateCart, deleteCart} = require("../controllers/cartController")
// ***************************************User APIs******************************
router.post("/register",userCreate)
router.post("/login",login)
router.get("/user/:userId/profile",authentication,authorization,getUserProfile)
router.put("/user/:userId/profile",authentication,authorization,updateUser)
// ****************************************Product APIs*********************
router.post('/products',createProduct)
router.get("/products",getAllProduct)
router.get("/products/:productId",getProductsById)
router.delete('/products/:productId',deleteProduct)
// **********************************************Cart APIs**************************************
router.post('/users/:userId/cart',authentication, authorization, createCart)
router.get('/users/:userId/cart',authentication, authorization, getCart)
router.put('/users/:userId/cart',authentication, authorization, updateCart)
router.delete('/users/:userId/cart',authentication, authorization, deleteCart)
// **********************************************Invalid Path*******************************
router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Page not found" });
});

module.exports= router