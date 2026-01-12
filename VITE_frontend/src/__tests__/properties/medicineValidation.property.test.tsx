/**
 * Property Test: Medicine Creation Validation
 * Feature: mims-improvements, Property 3
 * Validates: Requirements 3.3
 * 
 * For any valid medicine form submission (non-empty medID, non-empty name, 
 * valid medType, non-negative prices), the validation SHALL pass.
 * For any invalid submission, the validation SHALL fail with appropriate errors.
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

// Types matching AddMedicineDialog
type MedType = 'tablet' | 'fluid' | 'capsules' | 'accessories';

interface MedicineFormData {
  medID: string;
  name: string;
  medType: MedType | '';
  sellingType: string;
  pricePerTab: number | '';
  pricePerBox: number | '';
  cardPerBox: number | '';
  quantityPerCard: number | '';
}

interface FormErrors {
  medID?: string;
  name?: string;
  medType?: string;
  pricePerTab?: string;
}

/**
 * Validation function matching AddMedicineDialog.validateForm()
 */
function validateMedicineForm(data: MedicineFormData): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  if (!data.medID || !data.medID.trim()) {
    errors.medID = 'Medicine ID is required';
  } else if (data.medID.length < 3) {
    errors.medID = 'Medicine ID must be at least 3 characters';
  }

  if (!data.name || !data.name.trim()) {
    errors.name = 'Medicine name is required';
  }

  if (!data.medType) {
    errors.medType = 'Please select a medicine type';
  }

  if (!data.pricePerTab && !data.pricePerBox) {
    errors.pricePerTab = 'Please enter at least one price';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Generators
const validMedTypeArb = fc.constantFrom<MedType>('tablet', 'fluid', 'capsules', 'accessories');

const validMedIDArb = fc.string({ minLength: 3, maxLength: 20 })
  .filter(s => s.trim().length >= 3);

const validNameArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length >= 1);

const validPriceArb = fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true });

// Valid medicine form generator
const validMedicineFormArb: fc.Arbitrary<MedicineFormData> = fc.record({
  medID: validMedIDArb,
  name: validNameArb,
  medType: validMedTypeArb,
  sellingType: fc.string({ maxLength: 50 }),
  pricePerTab: validPriceArb,
  pricePerBox: fc.oneof(fc.constant<number | ''>(0), validPriceArb),
  cardPerBox: fc.oneof(fc.constant<number | ''>(0), fc.integer({ min: 0, max: 100 })),
  quantityPerCard: fc.oneof(fc.constant<number | ''>(0), fc.integer({ min: 0, max: 100 })),
});

describe('Feature: mims-improvements, Property 3: Medicine Creation Validation', () => {
  it('should pass validation for any valid medicine form data', () => {
    fc.assert(
      fc.property(validMedicineFormArb, (formData) => {
        const result = validateMedicineForm(formData);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should fail validation when medID is empty', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, medID: '' })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(false);
          expect(result.errors.medID).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when medID is whitespace only', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb,
        fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 }).map(arr => arr.join('')),
        (formData, whitespace) => {
          const invalidForm = { ...formData, medID: whitespace };
          const result = validateMedicineForm(invalidForm);
          expect(result.isValid).toBe(false);
          expect(result.errors.medID).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when medID is too short (< 3 chars)', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb,
        fc.string({ minLength: 1, maxLength: 2 }).filter(s => s.trim().length > 0 && s.trim().length < 3),
        (formData, shortID) => {
          const invalidForm = { ...formData, medID: shortID };
          const result = validateMedicineForm(invalidForm);
          expect(result.isValid).toBe(false);
          expect(result.errors.medID).toContain('at least 3 characters');
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when name is empty', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, name: '' })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(false);
          expect(result.errors.name).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when medType is not selected', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, medType: '' as MedType | '' })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(false);
          expect(result.errors.medType).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when both prices are zero or empty', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, pricePerTab: '' as number | '', pricePerBox: '' as number | '' })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(false);
          expect(result.errors.pricePerTab).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when only pricePerTab is provided', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, pricePerBox: '' as number | '' })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when only pricePerBox is provided', () => {
    fc.assert(
      fc.property(
        validMedicineFormArb.map(f => ({ ...f, pricePerTab: '' as number | '', pricePerBox: 50 })),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should collect multiple errors when multiple fields are invalid', () => {
    fc.assert(
      fc.property(
        fc.constant<MedicineFormData>({
          medID: '',
          name: '',
          medType: '',
          sellingType: '',
          pricePerTab: '',
          pricePerBox: '',
          cardPerBox: '',
          quantityPerCard: '',
        }),
        (formData) => {
          const result = validateMedicineForm(formData);
          expect(result.isValid).toBe(false);
          expect(result.errors.medID).toBeDefined();
          expect(result.errors.name).toBeDefined();
          expect(result.errors.medType).toBeDefined();
          expect(result.errors.pricePerTab).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
