import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({  
    medID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
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
        required: true
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
    pricePerBox:{//box also specifies that it would be a item like pouch....
        type:Number,
    },

});

const Medicine = mongoose.model('Medicines', medicineSchema);

export {
    Medicine,
    medicineSchema
};
