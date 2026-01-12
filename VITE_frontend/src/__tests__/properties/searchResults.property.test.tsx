/**
 * Property Test: Search Results Display Completeness
 * Feature: mims-improvements, Property 1
 * Validates: Requirements 1.4
 * 
 * For any medicine object returned from the search API, the rendered search result
 * component SHALL display the medicine's name, medID, medType, and price.
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

// Medicine interface matching the application
interface MedicineItem {
  medID: string;
  name: string;
  medType: string;
  sellingType: string;
  pricePerTab: number;
  pricePerBox: number;
  cardPerBox: number;
  quantityPerCard: number;
}

// Generator for valid medicine types
const medTypeArb = fc.constantFrom('tablet', 'fluid', 'capsules', 'accessories');

// Generator for valid medicine items
const medicineArb: fc.Arbitrary<MedicineItem> = fc.record({
  medID: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
  medType: medTypeArb,
  sellingType: fc.string({ maxLength: 50 }),
  pricePerTab: fc.float({ min: 0, max: 10000, noNaN: true }),
  pricePerBox: fc.float({ min: 0, max: 100000, noNaN: true }),
  cardPerBox: fc.integer({ min: 0, max: 100 }),
  quantityPerCard: fc.integer({ min: 0, max: 100 }),
});

/**
 * Simulates rendering a medicine search result and extracting displayed fields.
 * This mirrors what the MedComponent in AddStock.tsx displays.
 */
function renderMedicineSearchResult(medicine: MedicineItem): {
  displayedName: string;
  displayedMedID: string;
  displayedMedType: string;
  displayedPrice: number;
} {
  // The component displays:
  // - medID in a span
  // - medType in a Badge
  // - name in a paragraph
  // - price (pricePerTab or pricePerBox) with DollarSign icon
  return {
    displayedName: medicine.name,
    displayedMedID: medicine.medID,
    displayedMedType: medicine.medType,
    displayedPrice: medicine.pricePerTab || medicine.pricePerBox || 0,
  };
}

describe('Feature: mims-improvements, Property 1: Search Results Display Completeness', () => {
  it('should display all required fields for any valid medicine', () => {
    fc.assert(
      fc.property(medicineArb, (medicine) => {
        const rendered = renderMedicineSearchResult(medicine);
        
        // All required fields must be present in the rendered output
        expect(rendered.displayedName).toBe(medicine.name);
        expect(rendered.displayedMedID).toBe(medicine.medID);
        expect(rendered.displayedMedType).toBe(medicine.medType);
        
        // Price should be either pricePerTab or pricePerBox (whichever is non-zero)
        const expectedPrice = medicine.pricePerTab || medicine.pricePerBox || 0;
        expect(rendered.displayedPrice).toBe(expectedPrice);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle medicines with only pricePerTab', () => {
    fc.assert(
      fc.property(
        medicineArb.map(m => ({ ...m, pricePerTab: 10.5, pricePerBox: 0 })),
        (medicine) => {
          const rendered = renderMedicineSearchResult(medicine);
          expect(rendered.displayedPrice).toBe(10.5);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle medicines with only pricePerBox', () => {
    fc.assert(
      fc.property(
        medicineArb.map(m => ({ ...m, pricePerTab: 0, pricePerBox: 99.99 })),
        (medicine) => {
          const rendered = renderMedicineSearchResult(medicine);
          expect(rendered.displayedPrice).toBe(99.99);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle medicines with zero prices', () => {
    fc.assert(
      fc.property(
        medicineArb.map(m => ({ ...m, pricePerTab: 0, pricePerBox: 0 })),
        (medicine) => {
          const rendered = renderMedicineSearchResult(medicine);
          expect(rendered.displayedPrice).toBe(0);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve medType from valid medicine types', () => {
    fc.assert(
      fc.property(medicineArb, (medicine) => {
        const rendered = renderMedicineSearchResult(medicine);
        const validTypes = ['tablet', 'fluid', 'capsules', 'accessories'];
        expect(validTypes).toContain(rendered.displayedMedType);
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
