export const _cuisines = {
  japanese: {
    name: 'Japanese',
    dishes: {
      breakfast: {
        all: [
          {
            id: 'japanese-breakfast',
            name: 'Japanese Breakfast',
            cuisine: 'japanese',
            description: 'Traditional Japanese breakfast',
            elementalProperties: {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            },
            ingredients: [
              {
                name: 'Rice',
                amount: 1,
                unit: 'cup',
                elementalProperties: {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25,
                },
              },
            ],
          },
        ],
      },
    },
  },
};

export const _cuisinesMap = {
  japanese: { name: 'Japanese' },
};
