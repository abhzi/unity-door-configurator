export const doorCatalog = {
    traditional: {
        id: 'traditional',
        name: 'Traditional Doors',
        description: 'Classic timber door styles',
        doors: {
            sixPanel: {
                id: 'six-panel',
                name: '6 Panel Traditional',
                description: 'Classic six panel timber door',
                image: 'door-images/six-panel.jpg',
                basePrice: 299,
                allowsGlass: false,
                doorType: 'panel',
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 44,
                    material: 'oak',
                    finish: 'natural',
                    hardware: 'brass-traditional',
                    hingeType: 'butt',
                    lockType: 'mortice'
                },
                availableOptions: {
                    sizes: [
                        { width: 762, height: 1981, name: '30"' },
                        { width: 838, height: 1981, name: '33"' },
                        { width: 914, height: 1981, name: '36"' }
                    ],
                    materials: ['oak', 'pine', 'mahogany'],
                    finishes: ['natural', 'stained', 'painted'],
                    hardware: ['brass-traditional', 'chrome-traditional', 'black-traditional'],
                    hinges: ['butt', 'ball-bearing'],
                    locks: ['mortice', 'cylinder']
                }
            },
            fourPanel: {
                id: 'four-panel',
                name: '4 Panel Traditional',
                description: 'Four panel timber door with glass option',
                image: 'door-images/four-panel.jpg',
                basePrice: 329,
                allowsGlass: true,
                doorType: 'panel',
                glassOptions: {
                    types: ['clear', 'frosted', 'decorative'],
                    maxWidth: 400,
                    maxHeight: 600,
                    minEdgeDistance: 120
                },
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 44,
                    material: 'oak',
                    finish: 'natural',
                    hardware: 'brass-traditional',
                    hasGlass: false,
                    glassType: 'clear'
                },
                availableOptions: {
                    sizes: [
                        { width: 762, height: 1981, name: '30"' },
                        { width: 838, height: 1981, name: '33"' },
                        { width: 914, height: 1981, name: '36"' }
                    ],
                    materials: ['oak', 'pine', 'mahogany'],
                    finishes: ['natural', 'stained', 'painted'],
                    hardware: ['brass-traditional', 'chrome-traditional'],
                    glassTypes: ['clear', 'frosted', 'georgian-bars', 'decorative']
                }
            },
            glazedTraditional: {
                id: 'glazed-traditional',
                name: 'Traditional Glazed',
                description: 'Traditional door with large glass panel',
                image: 'door-images/glazed-traditional.jpg',
                basePrice: 359,
                allowsGlass: true,
                doorType: 'glazed',
                glassOptions: {
                    types: ['clear', 'frosted', 'decorative', 'georgian-bars'],
                    maxWidth: 500,
                    maxHeight: 800,
                    minEdgeDistance: 100
                },
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 44,
                    material: 'oak',
                    finish: 'natural',
                    hardware: 'brass-traditional',
                    hasGlass: true,
                    glassType: 'clear',
                    glassWidth: 400,
                    glassHeight: 600
                }
            }
        }
    },
    
    contemporary: {
        id: 'contemporary',
        name: 'Contemporary Doors',
        description: 'Modern timber door designs',
        doors: {
            verticalSlat: {
                id: 'vertical-slat',
                name: 'Contemporary Vertical',
                description: 'Modern vertical slat design',
                image: 'door-images/vertical-slat.jpg',
                basePrice: 399,
                allowsGlass: true,
                doorType: 'contemporary',
                glassOptions: {
                    types: ['clear', 'frosted'],
                    maxWidth: 200,
                    maxHeight: 1200,
                    minEdgeDistance: 150
                },
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 44,
                    material: 'oak',
                    finish: 'natural',
                    hardware: 'chrome-modern',
                    hasGlass: false
                },
                availableOptions: {
                    sizes: [
                        { width: 762, height: 1981, name: '30"' },
                        { width: 838, height: 1981, name: '33"' },
                        { width: 914, height: 1981, name: '36"' }
                    ],
                    materials: ['oak', 'walnut'],
                    finishes: ['natural', 'stained', 'painted'],
                    hardware: ['chrome-modern', 'black-modern', 'brass-modern']
                }
            },
            flush: {
                id: 'flush',
                name: 'Contemporary Flush',
                description: 'Clean modern flush door',
                image: 'door-images/flush.jpg',
                basePrice: 279,
                allowsGlass: false,
                doorType: 'flush',
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 40,
                    material: 'oak',
                    finish: 'painted',
                    hardware: 'chrome-modern'
                }
            }
        }
    },

    rustic: {
        id: 'rustic',
        name: 'Rustic Doors',
        description: 'Traditional farmhouse style doors',
        doors: {
            plankedDoor: {
                id: 'planked',
                name: 'Rustic Planked',
                description: 'Traditional planked farmhouse door',
                image: 'door-images/planked.jpg',
                basePrice: 349,
                allowsGlass: false,
                doorType: 'rustic',
                defaultConfig: {
                    width: 838,
                    height: 1981,
                    thickness: 50,
                    material: 'pine',
                    finish: 'natural',
                    hardware: 'black-rustic'
                }
            }
        }
    }
};
