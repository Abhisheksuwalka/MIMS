import mongoose from 'mongoose';
import { medicineSchema } from '../medicine/index.js';

const billingSchema = new mongoose.Schema({
    storeId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerAge: {
        type: Number,
        required: true
    },
    phone:{
        type: String,
        required: true,
    },
    productList: {
        type: [{
            medData:medicineSchema,
            quantity: Number,
        }],
    
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
},{ timestamps: true });

export default billingSchema;
