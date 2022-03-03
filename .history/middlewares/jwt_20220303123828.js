const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateJwtToken = (data) => {
    return jwt.sign(
      data,
      process.env.JWT_SECRET_TOKEN_SECRET,
      {
        expiresIn: "900d",
      }
    );
};

module.exports = {
    generateJwtToken
}

