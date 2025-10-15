import Stores from "../schema/store/index.js";
import Jwt from 'jsonwebtoken';

const authenticateToken = (req,res,next) => {
    const token = req.header('Authorization');
    if(!token) return res.send("Access Denied");
    try{
        const verified = Jwt.verify(token, process.env.JWT_SECRET);
        req.store = verified;
        next();
    }
    catch(err){
        console.log(err);
        res.send("Invalid token");
    }
}
const validateStore = async (req,res,next) => {
    const { storeEmail } = req.body;
    const token = req.header('Authorization'); 
    const store = await Stores.findOne({storeEmail: storeEmail});
    if(store){
        if(store.token === token){
            next();
        }
        else{
            console.log(store.token,token);
            res.send("Invalid token.");
        }
    }
    else{
        res.send("Invalid email.");
    }
}

export {
     authenticateToken,
     validateStore,
}