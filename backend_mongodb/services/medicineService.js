/**
 * Medicine Service
 * Business logic for medicine operations
 */

import { Medicine } from '../schema/medicine/index.js';
import logger from '../utils/logger.js';

/**
 * Search medicines by query
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Medicines with pagination
 */
export async function searchMedicines(query = '', options = {}) {
  const { page = 1, limit = 30, medType = null } = options;

  let searchConditions = {};
  
  if (query && query.trim() !== '') {
    const searchTerm = query.trim();
    const capitalizedTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
    
    searchConditions.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { medID: { $regex: searchTerm, $options: 'i' } },
      { name: { $regex: capitalizedTerm } },
    ];
  }

  if (medType) {
    searchConditions.medType = medType;
  }

  const total = await Medicine.countDocuments(searchConditions);
  const skip = (page - 1) * limit;
  
  const medicines = await Medicine.find(searchConditions)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    items: medicines,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + medicines.length < total,
    },
  };
}

/**
 * Get medicines by type
 * @param {string} medType - Medicine type (tablet, fluid, capsules, accessories)
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Medicines with pagination
 */
export async function getMedicinesByType(medType, options = {}) {
  return searchMedicines('', { ...options, medType });
}

/**
 * Get medicine by ID
 * @param {string} medID - Medicine ID
 * @returns {Promise<Object|null>} Medicine or null
 */
export async function getMedicineById(medID) {
  return await Medicine.findOne({ medID }).lean();
}

/**
 * Create a new medicine in the global database
 * @param {Object} medicineData - Medicine data
 * @returns {Promise<Object>} Created medicine
 */
export async function createMedicine(medicineData) {
  const {
    medID,
    name,
    secName,
    sellingType,
    medType,
    pricePerTab,
    quantityPerCard,
    cardPerBox,
    pricePerBox,
  } = medicineData;

  // Check if medicine already exists
  const existing = await Medicine.findOne({ medID });
  if (existing) {
    throw new Error('MEDICINE_EXISTS');
  }

  const newMedicine = await Medicine.create({
    medID,
    name,
    secName: secName || '',
    medType,
    sellingType: sellingType || '',
    pricePerTab: parseFloat(pricePerTab) || 0,
    quantityPerCard: parseInt(quantityPerCard, 10) || 0,
    cardPerBox: parseInt(cardPerBox, 10) || 0,
    pricePerBox: parseFloat(pricePerBox) || 0,
  });

  logger.info('New medicine created', { medID, name });

  return newMedicine.toObject();
}

/**
 * Update medicine details
 * @param {string} medID - Medicine ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated medicine
 */
export async function updateMedicine(medID, updates) {
  const medicine = await Medicine.findOne({ medID });
  if (!medicine) {
    throw new Error('MEDICINE_NOT_FOUND');
  }

  const allowedUpdates = ['name', 'secName', 'sellingType', 'pricePerTab', 'pricePerBox', 'quantityPerCard', 'cardPerBox'];
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      medicine[key] = updates[key];
    }
  }

  await medicine.save();
  logger.info('Medicine updated', { medID, updates: Object.keys(updates) });

  return medicine.toObject();
}

/**
 * Get medicine stats
 * @returns {Promise<Object>} Medicine statistics
 */
export async function getMedicineStats() {
  const stats = await Medicine.aggregate([
    {
      $group: {
        _id: '$medType',
        count: { $sum: 1 },
        avgPrice: { $avg: '$pricePerTab' },
      },
    },
  ]);

  const total = await Medicine.countDocuments();

  return {
    total,
    byType: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avgPrice: Math.round(stat.avgPrice * 100) / 100,
      };
      return acc;
    }, {}),
  };
}

export default {
  searchMedicines,
  getMedicinesByType,
  getMedicineById,
  createMedicine,
  updateMedicine,
  getMedicineStats,
};
