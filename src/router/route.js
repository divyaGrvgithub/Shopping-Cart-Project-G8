const express = require("express")
const router = express.Router()
const {userCreate,login,getUserProfile,updateUser} = require("../controllers/userController")
const middleware = require("../middleware/auth.js")

router.post("/register",userCreate)
router.post("/login",login)
router.get("/user/:userId/profile",getUserProfile)
router.put("/user/:userId/profile",updateUser)

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Page not found" });
});

module.exports= router