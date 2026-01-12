import dotenv from 'dotenv';
import connect from '../configDB/index.js';
import { Medicine } from '../schema/medicine/index.js';
import logger from '../utils/logger.js';

dotenv.config();

const commonMedicines = [
  { medID: 'PARA500', name: 'Paracetamol 500mg', medType: 'tablet', pricePerTab: 5.0, sellingType: 'strip' },
  { medID: 'AMOX500', name: 'Amoxicillin 500mg', medType: 'capsules', pricePerTab: 10.0, sellingType: 'strip' },
  { medID: 'IBU400', name: 'Ibuprofen 400mg', medType: 'tablet', pricePerTab: 4.0, sellingType: 'strip' },
  { medID: 'CET10', name: 'Cetirizine 10mg', medType: 'tablet', pricePerTab: 3.0, sellingType: 'strip' },
  { medID: 'PAN40', name: 'Pantoprazole 40mg', medType: 'tablet', pricePerTab: 8.0, sellingType: 'strip' },
  { medID: 'AZI500', name: 'Azithromycin 500mg', medType: 'tablet', pricePerTab: 20.0, sellingType: 'strip' },
  { medID: 'MET500', name: 'Metformin 500mg', medType: 'tablet', pricePerTab: 2.5, sellingType: 'strip' },
  { medID: 'ASP75', name: 'Aspirin 75mg', medType: 'tablet', pricePerTab: 1.5, sellingType: 'strip' },
  { medID: 'OMZ20', name: 'Omeprazole 20mg', medType: 'capsules', pricePerTab: 5.0, sellingType: 'strip' },
  { medID: 'VITC500', name: 'Vitamin C 500mg', medType: 'tablet', pricePerTab: 3.0, sellingType: 'strip' },
  { medID: 'COF100', name: 'Cough Syrup 100ml', medType: 'fluid', pricePerTab: 80.0, pricePerBox: 80.0, sellingType: 'bottle' },
  { medID: 'ORS', name: 'ORS Sachet', medType: 'accessories', pricePerTab: 20.0, pricePerBox: 20.0, sellingType: 'sachet' },
  { medID: 'BAND', name: 'Bandage Stick', medType: 'accessories', pricePerTab: 2.0, sellingType: 'piece' },
  { medID: 'MASK', name: 'Surgical Mask', medType: 'accessories', pricePerTab: 10.0, sellingType: 'piece' },
  { medID: 'SANI100', name: 'Sanitizer 100ml', medType: 'fluid', pricePerTab: 50.0, pricePerBox: 50.0, sellingType: 'bottle' }
];

async function seed() {
  try {
    await connect();
    logger.info('Connected to MongoDB. checking medicines...');
    
    // Check count
    const count = await Medicine.countDocuments();
    if (count > 0) {
      logger.info(`Database already has ${count} medicines. Skipping seed.`);
      process.exit(0);
    }

    logger.info('Seeding database with common medicines...');
    await Medicine.insertMany(commonMedicines);
    logger.info('Successfully seeded medicines!');
    process.exit(0);
    
  } catch (error) {
    logger.error('Seeding failed', { error: error.message });
    process.exit(1);
  }
}

seed();
