const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {

    try {

        const token = req.headers.authorization.split(" ")[1];
        const isCustomAuth = token.length < 500; 

        let decodedData;

        if(token && isCustomAuth){
            decodedData = jwt.verify(token, process.env.secret );

            req.userId = (id == null ? null : decodedData.id);
        }else{
            decodedData = jwt.decode(token);

            req.userId = decodedData?.sub;
        }
        
        next();
    } catch (error) {
        console.log(error);
    }
}