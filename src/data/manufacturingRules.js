export const manufacturingRules = {
    dimensions: {
        width: { 
            min: 610, 
            max: 1200,
            standard: [610, 686, 762, 838, 914, 990],
            customSurcharge: 50 // £50 for non-standard widths
        },
        height: { 
            min: 1800, 
            max: 2400,
            standard: [1981, 2032, 2134],
            customSurcharge: 30
        },
        thickness: { 
            standard: [35, 40, 44, 50, 54],
            default: 44,
            minimum: 35
        }
    },
    
    glass: {
        minEdgeDistance: 100, // mm from any edge
        maxWidthPercentage: 0.7, // 70% of door width max
        maxHeightPercentage: 0.8, // 80% of door height max
        requiredThickness: 44, // minimum door thickness for glass
        safetyGlassRequired: true,
        additionalCost: 75,
        
        restrictions: {
            'flush': { allowsGlass: false },
            'rustic': { allowsGlass: false, reason: 'Not structurally suitable' }
        }
    },
    
    hardwareCompatibility: {
        hinges: {
            'butt': {
                compatibleLocks: ['mortice', 'cylinder'],
                incompatibleDoorStyles: ['ultra-thin'],
                minThickness: 35,
                maxWeight: 45 // kg
            },
            'ball-bearing': {
                compatibleLocks: ['cylinder', 'multipoint'],
                requiredThickness: 44,
                maxWeight: 65,
                additionalCost: 25
            },
            'parliament': {
                compatibleLocks: ['cylinder'],
                requiredThickness: 44,
                specialOrder: true,
                additionalCost: 45,
                leadTime: 7 // additional days
            }
        },
        
        locks: {
            'mortice': {
                requiredThickness: 44,
                compatibleHinges: ['butt', 'ball-bearing'],
                securityRating: 'high'
            },
            'cylinder': {
                requiredThickness: 35,
                compatibleHinges: ['butt', 'ball-bearing', 'parliament'],
                securityRating: 'medium'
            },
            'multipoint': {
                requiredThickness: 50,
                compatibleHinges: ['ball-bearing'],
                additionalCost: 95,
                securityRating: 'maximum'
            }
        },
        
        handles: {
            'brass-traditional': { styles: ['traditional'], finish: 'brass' },
            'chrome-traditional': { styles: ['traditional'], finish: 'chrome' },
            'black-traditional': { styles: ['traditional'], finish: 'black' },
            'chrome-modern': { styles: ['contemporary'], finish: 'chrome' },
            'black-modern': { styles: ['contemporary'], finish: 'black' },
            'brass-modern': { styles: ['contemporary'], finish: 'brass' },
            'black-rustic': { styles: ['rustic'], finish: 'black' }
        }
    },
    
    materialConstraints: {
        'oak': {
            additionalCost: 50,
            availability: 'standard',
            finishOptions: ['natural', 'stained', 'painted']
        },
        'pine': {
            additionalCost: 0,
            availability: 'standard',
            finishOptions: ['natural', 'stained', 'painted']
        },
        'mahogany': {
            additionalCost: 120,
            availability: 'special-order',
            leadTime: 10,
            finishOptions: ['natural', 'stained']
        },
        'walnut': {
            additionalCost: 150,
            availability: 'special-order',
            leadTime: 14,
            finishOptions: ['natural', 'stained']
        }
    },
    
    finishConstraints: {
        'painted': {
            additionalCost: 25,
            leadTime: 5,
            availableColors: [
                'white', 'cream', 'grey', 'black', 'blue', 'green',
                'custom' // RAL color matching available
            ]
        },
        'stained': {
            additionalCost: 15,
            leadTime: 3,
            availableStains: [
                'light-oak', 'medium-oak', 'dark-oak', 'mahogany', 
                'walnut', 'ebony'
            ]
        },
        'natural': {
            additionalCost: 0,
            leadTime: 0
        }
    },
    
    businessRules: {
        minimumOrderValue: 150,
        standardLeadTime: 14, // days
        rushOrderSurcharge: 0.3, // 30% surcharge
        customSizeTolerance: 2, // ±2mm
        
        incompatibleCombinations: [
            { 
                hinge: 'parliament', 
                lock: 'multipoint',
                reason: 'Mechanical interference'
            },
            { 
                thickness: 35, 
                lock: 'mortice',
                reason: 'Insufficient thickness for mortice lock'
            },
            {
                doorType: 'flush',
                hardware: 'brass-traditional',
                reason: 'Style mismatch'
            }
        ]
    }
};
