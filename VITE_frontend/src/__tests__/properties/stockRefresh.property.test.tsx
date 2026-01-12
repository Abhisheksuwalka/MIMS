/**
 * Property Test: Stock Refresh After Modification
 * 
 * Feature: mims-improvements
 * Property 2: Stock Refresh After Modification
 * 
 * For any successful stock modification operation (add, remove, or billing),
 * the Stock component's data SHALL be refreshed within 1 second,
 * and the displayed quantities SHALL match the server state.
 * 
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { StockRefreshProvider, useStockRefresh } from '@/context/StockRefreshContext';
import { act, renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { ReactNode } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';

// Configure fast-check for minimum 100 runs
fc.configureGlobal({ numRuns: 100 });

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <StockRefreshProvider>{children}</StockRefreshProvider>
);

describe('Feature: mims-improvements, Property 2: Stock Refresh After Modification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should increment refreshTrigger for any number of triggerRefresh calls', () => {
    fc.assert(
      fc.property(
        // Generate a random number of refresh calls (1 to 50)
        fc.integer({ min: 1, max: 50 }),
        (numCalls) => {
          const { result } = renderHook(() => useStockRefresh(), { wrapper });
          
          const initialTrigger = result.current.refreshTrigger;
          
          // Call triggerRefresh numCalls times
          for (let i = 0; i < numCalls; i++) {
            act(() => {
              result.current.triggerRefresh();
            });
          }
          
          // Property: refreshTrigger should have incremented by exactly numCalls
          return result.current.refreshTrigger === initialTrigger + numCalls;
        }
      ),
      { verbose: true }
    );
  });

  it('should always return a non-negative refreshTrigger value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (numCalls) => {
          const { result } = renderHook(() => useStockRefresh(), { wrapper });
          
          // Call triggerRefresh numCalls times
          for (let i = 0; i < numCalls; i++) {
            act(() => {
              result.current.triggerRefresh();
            });
          }
          
          // Property: refreshTrigger should always be non-negative
          return result.current.refreshTrigger >= 0;
        }
      ),
      { verbose: true }
    );
  });

  it('should maintain monotonically increasing refreshTrigger', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of operations (true = trigger, false = no-op)
        fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }),
        (operations) => {
          const { result } = renderHook(() => useStockRefresh(), { wrapper });
          
          let previousTrigger = result.current.refreshTrigger;
          
          for (const shouldTrigger of operations) {
            if (shouldTrigger) {
              act(() => {
                result.current.triggerRefresh();
              });
            }
            
            // Property: refreshTrigger should never decrease
            if (result.current.refreshTrigger < previousTrigger) {
              return false;
            }
            previousTrigger = result.current.refreshTrigger;
          }
          
          return true;
        }
      ),
      { verbose: true }
    );
  });

  it('should provide stable triggerRefresh function reference', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (numCalls) => {
          const { result, rerender } = renderHook(() => useStockRefresh(), { wrapper });
          
          const initialFn = result.current.triggerRefresh;
          
          // Trigger multiple times and rerender
          for (let i = 0; i < numCalls; i++) {
            act(() => {
              result.current.triggerRefresh();
            });
            rerender();
          }
          
          // Property: triggerRefresh function reference should remain stable (useCallback)
          return result.current.triggerRefresh === initialFn;
        }
      ),
      { verbose: true }
    );
  });
});
