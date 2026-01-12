import express from "express";
import { Medicine } from "../../schema/medicine/index.js";

const medicineRoutes = express.Router();

medicineRoutes.post("/globaladd", async (req, res) => {
    const {
        medID,
        name,
        secName,
        sellingType,
        medType,
        pricePerTab,
        quantityPerCard,
        cardPerBox,
    } = req.body;
    
    try {
        let newMedicine = await Medicine.create({
            medID,
            name,
            secName,
            medType,
            sellingType,
            pricePerTab, 
            quantityPerCard,
            cardPerBox,
        });
        
        if (!newMedicine) {
            throw new Error("Medicine not added");
        } else {
            return res.status(201).send("added ✅");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});

medicineRoutes.post("/tablets", async (req, res) => {    
    try {
        const tablets = await Medicine.find({ medType: 'tablet' });
        res.json(tablets);
    } catch (error) {
        console.error('Error searching for tablets:', error);
        res.status(500).send('Error searching for tablets');
    }
});

medicineRoutes.post("/fluid", async (req, res) => {    
    try {
        const tablets = await Medicine.find({ medType: 'fluid' });
        res.json(tablets);
    } catch (error) {
        console.error('Error searching for fluid type:', error);
        res.status(500).send('Error searching for fluid type');
    }
});

medicineRoutes.post("/capsules", async (req, res) => {    
    try {
        const tablets = await Medicine.find({ medType: 'capsules' });
        res.json(tablets);
    } catch (error) {
        console.error('Error searching for capsules:', error);
        res.status(500).send('Error searching for capsules');
    }
});

medicineRoutes.post("/accessories", async (req, res) => {    
    try {
        const tablets = await Medicine.find({ medType: 'accessories' });
        res.json(tablets);
    } catch (error) {
        console.error('Error searching for accessories:', error);
        res.status(500).send('Error searching for accessories');
    }
});

medicineRoutes.post("/search", async (req, res) => { 
    let query = req.body.query;
    console.log(query);
    try{
        query = query.toLowerCase();
        let searchResult = await Medicine.find({ "$or": [{ "name": { "$regex": query } }, { "medID": { "$regex": query } }, { "name": {"$regex": query.charAt(0).toUpperCase()+query.slice(1)}}] });
        res.send(searchResult);
    }catch(err){
        console.log(err);
    }
});





export default medicineRoutes;