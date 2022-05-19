const jwt = require('jsonwebtoken');

const extractTokenFromHeader = (req) => {
    const authorization = req.headers.authorization;
    if (authorization) {
        const token = authorization.split(' ')[1];
        return token;
    }
    return null;
}

const verifyTokenValidity = async(token) => {
    var object = null;
    jwt.verify(
        token,
        process.env.JWT_SECRET_TOKEN_SECRET,
        {},
        async (error, decoded) => {
          if (error) {
              console.log(error)
            return false;
          } else {
            object = decoded;
          }
        }
    );

    return object;
}

const verifyUsersToken = async(req, res, next) => {
    const token = extractTokenFromHeader(req);
    if (token) {
        const verifiedToken = (verifyTokenValidity(token))
        if(verifiedToken){
            req.user = verifiedToken;
            next();
        }else{
            return res.status(401).json({
                status: false,
                message: 'Token not valid',
                error: []
            })
        }
    }else{
        return res.status(401).json({
            status: false,
            message: 'Unauthorized',
            error: []
        })
    }
}

module.exports = {
    verifyUsersToken
}