/**
 * Mock chart data for testing the alchemizer
 */

export const mockChart = {
  CelestialBodies: {
    all: [
      {
        label: 'sun',
        Sign: {
          label: 'Aries'
        },
        House: {
          label: 'Third'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '26°'
          }
        }
      },
      {
        label: 'Moon',
        Sign: {
          label: 'Sagittarius'
        },
        House: {
          label: 'Tenth'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '1°'
          }
        }
      },
      {
        label: 'mercury',
        Sign: {
          label: 'Pisces'
        },
        House: {
          label: 'Second'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '29°'
          }
        }
      },
      {
        label: 'venus',
        Sign: {
          label: 'Pisces'
        },
        House: {
          label: 'Second'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '24°'
          }
        }
      },
      {
        label: 'Mars',
        Sign: {
          label: 'Cancer'
        },
        House: {
          label: 'Sixth'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '29°'
          }
        }
      },
      {
        label: 'Jupiter',
        Sign: {
          label: 'Gemini'
        },
        House: {
          label: 'Fifth'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '18°'
          }
        }
      },
      {
        label: 'Saturn',
        Sign: {
          label: 'Pisces'
        },
        House: {
          label: 'Second'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '26°'
          }
        }
      },
      {
        label: 'Uranus',
        Sign: {
          label: 'Taurus'
        },
        House: {
          label: 'Fourth'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '25°'
          }
        }
      },
      {
        label: 'Neptune',
        Sign: {
          label: 'Aries'
        },
        House: {
          label: 'Second'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '0°'
          }
        }
      },
      {
        label: 'Pluto',
        Sign: {
          label: 'Aquarius'
        },
        House: {
          label: 'Twelfth'
        },
        ChartPosition: {
          Ecliptic: {
            ArcDegreesFormatted30: '3°'
          }
        }
      }
    ],
    sun: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '26°'
        }
      }
    },
    moon: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '1°'
        }
      }
    },
    mercury: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '29°'
        }
      }
    },
    venus: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '24°'
        }
      }
    },
    mars: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '29°'
        }
      }
    },
    jupiter: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '18°'
        }
      }
    },
    saturn: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '26°'
        }
      }
    },
    uranus: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '25°'
        }
      }
    },
    neptune: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '0°'
        }
      }
    },
    pluto: {
      ChartPosition: {
        Ecliptic: {
          ArcDegreesFormatted30: '3°'
        }
      }
    }
  },
  Ascendant: {
    Sign: {
      label: 'Aquarius'
    }
  },
  Aspects: {
    points: {
      sun: [
        {
          aspectKey: 'conjunction',
          point1Label: 'sun',
          point2Label: 'Chiron'
        },
        {
          aspectKey: 'opposition',
          point1Label: 'sun',
          point2Label: 'Lilith'
        },
        {
          aspectKey: 'square',
          point1Label: 'sun',
          point2Label: 'Mars'
        }
      ],
      moon: [
        {
          aspectKey: 'trine',
          point1Label: 'Moon',
          point2Label: 'mercury'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Moon',
          point2Label: 'venus'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Moon',
          point2Label: 'Mars'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Moon',
          point2Label: 'Saturn'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Moon',
          point2Label: 'Neptune'
        },
        {
          aspectKey: 'opposition',
          point1Label: 'Moon',
          point2Label: 'Uranus'
        }
      ],
      mercury: [
        {
          aspectKey: 'trine',
          point1Label: 'mercury',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'mercury',
          point2Label: 'venus'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'mercury',
          point2Label: 'Saturn'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'mercury',
          point2Label: 'Neptune'
        },
        {
          aspectKey: 'trine',
          point1Label: 'mercury',
          point2Label: 'Mars'
        }
      ],
      venus: [
        {
          aspectKey: 'trine',
          point1Label: 'venus',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'venus',
          point2Label: 'mercury'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'venus',
          point2Label: 'Saturn'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'venus',
          point2Label: 'Neptune'
        },
        {
          aspectKey: 'trine',
          point1Label: 'venus',
          point2Label: 'Mars'
        },
        {
          aspectKey: 'square',
          point1Label: 'venus',
          point2Label: 'Jupiter'
        }
      ],
      mars: [
        {
          aspectKey: 'square',
          point1Label: 'Mars',
          point2Label: 'sun'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Mars',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Mars',
          point2Label: 'mercury'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Mars',
          point2Label: 'venus'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Mars',
          point2Label: 'Saturn'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Mars',
          point2Label: 'Neptune'
        },
        {
          aspectKey: 'opposition',
          point1Label: 'Mars',
          point2Label: 'Pluto'
        },
        {
          aspectKey: 'opposition',
          point1Label: 'Mars',
          point2Label: 'Ascendant'
        }
      ],
      jupiter: [
        {
          aspectKey: 'square',
          point1Label: 'Jupiter',
          point2Label: 'venus'
        }
      ],
      saturn: [
        {
          aspectKey: 'trine',
          point1Label: 'Saturn',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Saturn',
          point2Label: 'mercury'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Saturn',
          point2Label: 'venus'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Saturn',
          point2Label: 'Neptune'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Saturn',
          point2Label: 'Mars'
        }
      ],
      uranus: [
        {
          aspectKey: 'opposition',
          point1Label: 'Uranus',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Uranus',
          point2Label: 'South Node'
        }
      ],
      neptune: [
        {
          aspectKey: 'conjunction',
          point1Label: 'Neptune',
          point2Label: 'mercury'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Neptune',
          point2Label: 'venus'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Neptune',
          point2Label: 'Saturn'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Neptune',
          point2Label: 'Moon'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Neptune',
          point2Label: 'Mars'
        }
      ],
      pluto: [
        {
          aspectKey: 'opposition',
          point1Label: 'Pluto',
          point2Label: 'Mars'
        },
        {
          aspectKey: 'conjunction',
          point1Label: 'Pluto',
          point2Label: 'Ascendant'
        },
        {
          aspectKey: 'trine',
          point1Label: 'Pluto',
          point2Label: 'South Node'
        }
      ]
    }
  }
}; 