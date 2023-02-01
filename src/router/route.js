const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const middleware = require("../middleware/auth.js")

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",UserController.getUserProfile)

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Path is not valid" });
});

module.exports= router