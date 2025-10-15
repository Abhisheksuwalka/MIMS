import express from 'express';
import Stores from '../../schema/store/index.js';
import { validateStore } from '../../middleware/index.js';
import { Medicine } from '../../schema/medicine/index.js';
const querryApi = express.Router();

querryApi.use(validateStore);

querryApi.post('/getStoreData', async (req, res) => {
    try{
        const { storeEmail } = req.body;
        const store = await Stores.findOne({storeEmail});
        if(!store){
            res.status(402).send("invalid store email");
            return;
        }
        res.status(200).send(store.toJSON());
    }catch(err){
        console.log(err);
        res.status(401).send("error occured!");
    }
});

querryApi.post('/addMed', async (req,res) => {
    let {
        medID,
        name,
        secName,
        sellingType,
        medType,
        pricePerTab,
        cardPerBox,
        pricePerBox,
        medicineQuantityToAdd,
        storeEmail,
    } = req.body;
    const price = parseFloat(pricePerTab);
    if (isNaN(price)) {
        pricePerTab = pricePerBox;
    }
    try{
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        //check if the med exist in stock...
        const medExist = store.stock.filter(med => med.medData.medID === medID);
        if(medExist.length > 0){
            //adding to stock...
            const newStock = store.stock.map(med => {
                if(med.medData.medID == medID){
                    console.log(med);
                    return {...med, quantity: parseInt(med.quantity)+parseInt(medicineQuantityToAdd)};//convert to number then add as number....
                }
                return med;
            });
            console.log(newStock);
            console.log("Quantity was updated in the database..");
            store.stock = newStock;
            await store.save();
            res.status(200).send("succes");
            return;
        }else{
            // const await medId = await Medicine.findOne({medId})._id;
            store.stock.push({
                medData: {
                    medID,
                    name,
                    secName,
                    sellingType,
                    medType,
                    pricePerTab,
                    cardPerBox
                },
                medObjectid: await Medicine.findOne({medID: medID})._id,
                quantity: medicineQuantityToAdd
            });
            await store.save();
            console.log("Added to stock");
            res.status(200).send("succes");
        }
        
    }
    catch(err){
        console.log(err);
        res.status(402).send("error occured");
    }
})

querryApi.post('/querryStock', async (req,res) => {
    const {
        query,
        storeEmail,
    } = req.body;
    try{
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        const my_med_with_querry =  store.stock.filter(med => {
            if(med.medData.name.toLowerCase().includes(query.toLowerCase()) || med.medData.secName?.toLowerCase().includes(query.toLowerCase()) || med.medData.medID.toLowerCase().includes(query.toLowerCase())){
                return true;
            }
            return false;
        });
        console.log("Selected data for email and querry: ",storeEmail,query, "is");
        console.log(my_med_with_querry);
        res.send(my_med_with_querry);
    }
    catch(err){
        console.log(err);
        res.send("error occured");
    }
})

querryApi.post('/removeMed', async (req,res) => {
    const {
        medID,
        storeEmail,
        quantityToRemove,
    } = req.body;
    try{
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        const newStock = store.stock.map(med => {
            if(med.medData.medID == medID){
                if(parseInt(med.quantity) >= parseInt(quantityToRemove)){
                    med.quantity = parseInt(med.quantity) - parseInt(quantityToRemove);
                }else{
                    res.send("quantity exceed the stock quantity,!! can't remove");
                }
            }
            return med;
        });
        const newerStock = newStock.filter(med => med.quantity !== 0);
        store.stock = newerStock;
        await store.save();
        res.status(200).send("succes_man");
    }catch(err){
        res.status(401).send('failed');
        console.log(err);
    }
})

querryApi.post('/billing', async (req, res)=>{
    const {
        storeEmail,
        formName,
        formAge,
        formPhone,
        medSchemaBasedData,//medSchemaBasedData -> array of { medData:medicienSchema,quantity}
        totalAmount,
    } = req.body;
    try{
        console.log(JSON.parse(medSchemaBasedData));
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        const billingData = {
            storeId: store._id,
            customerName: formName,
            customerAge: formAge,
            phone: formPhone,
            productList: JSON.parse(medSchemaBasedData),
            totalAmount,
        }
        store.billingHistory.push(billingData);
        for(let i in medSchemaBasedData){
            const medData = medSchemaBasedData[i];
            const medID = medData?.medData?.medID;
            const quantity = medData?.quantity;
            const newStock = store?.stock.map(med => {
                if(med.medData.medID == medID){
                    if(parseInt(med.quantity) >= parseInt(quantity)){
                        med.quantity = parseInt(med.quantity) - parseInt(quantity);
                    }else{
                        res.send("quantity exceed the stock quantity,!! can't remove");
                        throw Error("caught a case where stock dosent contain sufficient quantity to remove the med.");
                    }
                }
                return med;
            });
            const newerStock = newStock.filter(med => med.quantity !== 0);
            store.stock = newerStock;
        }
        await store.save();
        res.status(200).send("succes");
    }catch(err){
        console.log(err);
        res.status(402).send("error occured");
    }
});

querryApi.post('/getBillsByName', async (req,res) => {
    const {
        storeEmail,
        query,
    } = req.body;
    try{
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        let bills = [];
        if(!query || query === ""){
            bills = store.billingHistory;
        }else{
            bills = store.billingHistory.filter(bill => bill.customerName.toLowerCase().includes(query.toLowerCase()));
        }
        res.json(bills);
    }
    catch(err){
        console.log(err);
        res.send("error occured");
    }
});

querryApi.post('/getBillsByPhone', async (req,res) => {
    const {
        storeEmail,
        query,
    } = req.body;
    try{
        const store = await Stores.findOne({storeEmail: storeEmail});
        if(!store){
            res.send("invalid store email");
            return;
        }
        let bills = [];
        if(query && query !== ""){
            bills = store.billingHistory.filter(bill => {
                console.log(bill.phone, query, typeof bill.phone, typeof query)
                return (bill.phone) == parseInt(query)});
        }
        res.status(200).send(bills);
    }
    catch(err){
        console.log(err);
        res.status(402).send("error occured");
    }
});

querryApi.post('/getBillByMed',(req,res)=>{
    const {
        storeEmail,
        query,
    } = req.body;
    Stores.findOne({storeEmail: storeEmail}).then(store => {
        if(!store){
            res.send("invalid store email");
            return;
        }
        const bills = store.billingHistory.filter(bill => {
            const medExist = bill.productList.filter(med => 
                // create a proper conditional filter here..
                med.medData.medID === query ||
                med.medData.name.toLowerCase().includes(query.toLowerCase())
            );
            if(medExist.length > 0){
                return true;
            }
            return false;
        });
        res.status(200).send(bills);
    }).catch(err => {
        console.log(err);
        res.send("error occured");
    })
})

export default querryApi;