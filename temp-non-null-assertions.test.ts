
        describe('Non-null Assertion Tests', () => {
          test('should allow non-null assertions for test certainty', () => {
            const maybeValue: string | null = 'test-value';
            const maybeObject: { prop?: string } = { prop: 'value' };
            const maybeArray: number[] | undefined = [1, 2, 3];
            
            // Non-null assertions should be allowed in tests
            const definiteValue = maybeValue!;
            const definiteProperty = maybeObject.prop!;
            const definiteArray = maybeArray!;
            
            expect(definiteValue).toBe('test-value');
            expect(definiteProperty).toBe('value');
            expect(definiteArray.length).toBe(3);
            
            // Test DOM elements (common in React tests)
            const element = document.querySelector('.test-element')!;
            const button = document.getElementById('test-button')!;
            
            // These would normally be checked, but in tests we know they exist
            expect(element).toBeDefined();
            expect(button).toBeDefined();
          });
        });
      