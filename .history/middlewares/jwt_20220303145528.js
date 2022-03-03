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

const generateJwtTokenForEmailValidate = (data) => {
    return jwt.sign(
      data,
      process.env.JWT_SECRET_TOKEN_SECRET,
      {
        expiresIn: "2 hours",
      }
    );
};

const verify_token_extract = async(token)=>{

}

module.exports = {
    generateJwtToken,
    generateJwtTokenForEmailValidate,
    verify_token_extract
}

