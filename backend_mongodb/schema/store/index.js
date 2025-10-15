import mongoose from 'mongoose';
import { medicineSchema } from '../medicine/index.js';
import billingSchema from '../billing/index.js';
import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';

const StoreSchema = new mongoose.Schema({
    storeEmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true,
    },
    storeName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    stock: {
        type: [
            {
                medData:medicineSchema,
                medObjectid: { 
                    type : mongoose.Schema.Types.ObjectId, 
                    ref  : "Medicines" 
                },
                quantity: Number,
            }
        ],
        default: []
    },
    token:{
        type: String,
        default: ""
    },
    billingHistory: {
        type: [billingSchema],
        default: []
    } 
},{timestamps: true});

StoreSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

StoreSchema.methods.toJSON = function() {
    const storeObject = this.toObject();
    delete storeObject.password; // Remove password field from the response
    delete storeObject.token; // Remove token field from the response
    delete storeObject.stock;
    delete storeObject.billingHistory;

    return storeObject;
};

// Create a model from the schema
const Stores = mongoose.model('Stores', StoreSchema);

export default Stores;
