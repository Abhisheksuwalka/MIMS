/**
 * Medicine Routes
 * Handles medicine-related operations using the new controller architecture
 */

import express from "express";
import medicineController from "../../controllers/medicineController.js";

const medicineRoutes = express.Router();

// Add new medicine to global database
medicineRoutes.post("/globaladd", medicineController.addGlobalMedicine);

// Get medicines by type
medicineRoutes.post("/tablets", (req, res) => medicineController.getMedicinesByType(req, res, 'tablet'));
medicineRoutes.post("/fluid", (req, res) => medicineController.getMedicinesByType(req, res, 'fluid'));
medicineRoutes.post("/capsules", (req, res) => medicineController.getMedicinesByType(req, res, 'capsules'));
medicineRoutes.post("/accessories", (req, res) => medicineController.getMedicinesByType(req, res, 'accessories'));

// Search medicines
medicineRoutes.post("/search", medicineController.searchMedicines);

export default medicineRoutes;
