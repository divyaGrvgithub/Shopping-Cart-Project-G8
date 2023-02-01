const express = require("express")
const router = express.Router()
const {userCreate,login,getUserProfile} = require("../controllers/userController")
const middleware = require("../middleware/auth.js")

router.post("/register",userCreate)
router.post("/login",login)
router.get("/user/:userId/profile",getUserProfile)

router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Page not found" });
});

module.exports= router