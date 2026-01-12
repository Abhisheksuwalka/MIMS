import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import billingSchema from '../billing/index.js';
import { medicineSchema } from '../medicine/index.js';

const StoreSchema = new mongoose.Schema({
    storeEmail: {
        type: String,
        required: true,
        unique: true,
        index: true // Added index
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
                    ref  : "Medicines",
                    index: true // Added index
                },
                quantity: { 
                    type: Number, 
                    min: 0 
                },
                // NEW: Expiry Management Fields
                expiryDate: {
                    type: Date,
                    index: true // For expiry alerts query
                },
                batchNumber: {
                    type: String,
                    default: ""
                },
                purchasePrice: {
                    type: Number,
                    default: 0
                },
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

// Methods
StoreSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

StoreSchema.methods.toJSON = function() {
    const storeObject = this.toObject();
    delete storeObject.password; // Remove password field from the response
    delete storeObject.token; // Remove token field from the response
    delete storeObject.stock; // Usually too large for auth response
    delete storeObject.billingHistory; // Usually too large for auth response

    return storeObject;
};

// Create a model from the schema
const Stores = mongoose.model('Stores', StoreSchema);

export default Stores;
