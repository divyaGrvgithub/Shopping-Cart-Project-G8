const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const ProductController = require("../controllers/productController")
const CartController = require("../controllers/cartController")
const OrderController = require("../controllers/orderController")
const Middleware = require("../middleware/auth.js")

// **********************************USER APIs ******************************

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",Middleware.authentication,UserController.getUserProfile)
router.put("/user/:userId/profile",Middleware.authentication,Middleware.authorization,UserController.updateUser )

// **********************************PRODUCT APIs******************************

router.post("/products",ProductController.createProduct)
router.get("/products",ProductController.getAllProduct)
router.get("/products/:productId",ProductController.getProductsById)
router.delete("/products/:productId",ProductController.deleteProductById)

// **********************************************Cart APIs*********************

router.post("/users/:userId/cart",Middleware.authentication,Middleware.authorization,CartController.createCart)
router.get('/users/:userId/cart',Middleware.authentication,Middleware.authorization,CartController.getCart)
router.put('/users/:userId/cart',Middleware.authentication,Middleware.authorization,CartController.updateCart)
router.delete('/users/:userId/cart',Middleware.authentication,Middleware.authorization,CartController.deleteCart)

// ***************************************Order APIs**************************************

router.post("/users/:userId/orders",Middleware.authentication,Middleware.authorization,OrderController.createOrder)
router.put("/users/:userId/orders",Middleware.authentication,Middleware.authorization,OrderController.updateOrder)

// **********************************************Invalid Path*******************************

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Path is not valid" });
});

module.exports= router