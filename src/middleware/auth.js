const jwt = require("jsonwebtoken")

const authentication = async (req, res, next) => {
    try {
        let token = req.headers["authorization"]
        if (!token) {
            res.status(400).send({ status: false, message: "token is required" })
        }
        let fetchToken =  token.split(" ")[1]
        jwt.verify(fetchToken, "shopping-cart-group8", function (err, data) {
            if (err) {
                res.status(401).send({ status: false, message: "invalid token" })
            } else {
                req.tokenVerify = data.userId
                return next()
            }
        })
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = {authentication}
