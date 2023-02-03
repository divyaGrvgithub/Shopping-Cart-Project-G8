const express = require("express")
const router = express.Router()
const {userCreate,login,getUserProfile,updateUser} = require("../controllers/userController")
const {createProduct,deleteProduct,getAllProduct,getProductsById} = require("../controllers/productontroller")
const {authentication}= require("../middleware/auth.js")
// ***************************************User APIs******************************
router.post("/register",userCreate)
router.post("/login",login)
router.get("/user/:userId/profile",authentication,getUserProfile)
router.put("/user/:userId/profile",authentication,updateUser)
// ****************************************Product APIs*********************
router.post('/products',createProduct)
router.get("/products",getAllProduct)
router.get("/products/:productId",getProductsById)
router.delete('/products/:productId',deleteProduct)
// **********************************************Invalid Path*******************************
router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Page not found" });
});

module.exports= router