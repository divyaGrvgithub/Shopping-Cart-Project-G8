const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const ProductController = require("../controllers/productController")
const CartController = require("../controllers/cartController")
const middleware = require("../middleware/auth.js")

// **********************************USER API ******************************

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",middleware.authentication,UserController.getUserProfile)
router.put("/user/:userId/profile",middleware.authentication,middleware.authorization,UserController.updateUser )

// **********************************PRODUCT API******************************

router.post("/products",ProductController.createProduct)
router.get("/products",ProductController.getAllProduct)
router.get("/products/:productId",ProductController.getProductsById)
router.delete("/products/:productId",ProductController.deleteProductById)

// **********************************************Cart APIs*********************

router.post('/users/:userId/cart',middleware.authentication,middleware.authorization,CartController.createCart)
router.get('/users/:userId/cart',middleware.authentication,middleware.authorization,CartController.getCart)
router.put('/users/:userId/cart',middleware.authentication,middleware.authorization,CartController.updateCart)
router.delete('/users/:userId/cart',middleware.authentication,middleware.authorization,CartController.deleteCart)

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Path is not valid" });
});

module.exports= router