const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")

router.post("/register",UserController.createUser)

module.exports= router