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

const verify_token_extract = (token)=>{
    jwt.verify(
        token,
        process.env.JWT_SECRET_TOKEN_SECRET,
        {},
        async (error, decoded) => {
          if (error) {
              console.log(error)
            return false;
          } else {
            console.log(decoded)
            return decoded
          }
        }
      );
}

module.exports = {
    generateJwtToken,
    generateJwtTokenForEmailValidate,
    verify_token_extract
}

