import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({  
    medID: {
        type: String,
        required: true,
        unique: true, // Added unique index
        index: true   // Added index
    },
    name: {
        type: String,
        required: true,
        index: true   // Added index for search
    },
    secName: {
        type: String,
    },
    sellingType: {
        type:String,
        default: "",
    },
    medType: {
        type: String,
        enum: ['tablet', 'fluid', 'capsules', 'accessories'],
        required: true,
        index: true   // Added index for filtering
    },
    pricePerTab:{
        type: Number,
    },
    quantityPerCard: {
        type: Number,
    },
    cardPerBox:{
        type:Number,
    },
    pricePerBox:{ //box also specifies that it would be a item like pouch....
        type:Number,
    },
    // New fields for 4-star tasks
    expiryDate: {
        type: Date,
    },
    manufacturer: {
        type: String,
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    }

}, { timestamps: true });

// Compound index for search
medicineSchema.index({ name: 'text', medID: 'text', secName: 'text' });

const Medicine = mongoose.model('Medicines', medicineSchema);

export {
    Medicine,
    medicineSchema
};
