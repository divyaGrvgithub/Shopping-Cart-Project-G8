const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const productController = require("../controllers/productController")
const middleware = require("../middleware/auth.js")

// **********************************USER API ******************************

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",middleware.authentication,UserController.getUserProfile)
router.put("/user/:userId/profile",middleware.authentication,middleware.authorization,UserController.updateUser )

// **********************************PRODUCT API******************************

router.post("/products",productController.createProduct)
router.get("/products",productController.getAllProduct)
router.get("/products/:productId",productController.getProductsById)
router.delete("/products/:productId",productController.deleteProductById)

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Path is not valid" });
});

module.exports= router