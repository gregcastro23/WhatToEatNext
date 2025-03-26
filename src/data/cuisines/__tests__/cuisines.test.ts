import { cuisinesMap } from '../index';

describe('Cuisines', () => {
    it('should export cuisinesMap', () => {
        expect(cuisinesMap).toBeDefined();
    });

    it('should have all required cuisines', () => {
        const expectedCuisines = [
            'Japanese',
            'Chinese',
            'French',
            'Indian',
            'Italian',
            'Korean',
            'Mexican',
            'Middle Eastern',
            'Russian',
            'Vietnamese'
        ];

        expectedCuisines.forEach(cuisine => {
            expect(cuisinesMap[cuisine]).toBeDefined();
            expect(cuisinesMap[cuisine].name).toBeDefined();
            expect(cuisinesMap[cuisine].description).toBeDefined();
            expect(cuisinesMap[cuisine].dishes).toBeDefined();
            expect(cuisinesMap[cuisine].elementalBalance).toBeDefined();
        });
    });

    it('should have valid elemental balance for each cuisine', () => {
        Object.values(cuisinesMap).forEach(cuisine => {
            const { elementalBalance } = cuisine;
            expect(elementalBalance).toHaveProperty('Fire');
            expect(elementalBalance).toHaveProperty('Water');
            expect(elementalBalance).toHaveProperty('Earth');
            expect(elementalBalance).toHaveProperty('Air');

            const total = Object.values(elementalBalance).reduce((sum, value) => sum + value, 0);
            expect(total).toBeCloseTo(1, 2); // Sum should be approximately 1
        });
    });
}); 