import { doorCatalog } from './data/doorCatalog.js';
import { ProductSelector } from './components/ProductSelector.js';
import { Configurator } from './components/Configurator.js';
import { ThreeJSViewer } from './components/ThreeJSViewer.js';
import { ConfigurationValidator } from './utils/validator.js';

class DoorConfiguratorApp {
    constructor() {
        this.currentDoor = null;
        this.currentConfig = {};
        this.viewer = null;
        
        this.productSelector = new ProductSelector(this.onDoorSelected.bind(this));
        this.configurator = null;
        
        this.init();
    }
    
    init() {
        this.productSelector.render();
        this.setupEventListeners();
        this.setupHistoryManagement();
        
        // Initialize 3D viewer (hidden initially)
        this.viewer = new ThreeJSViewer('three-canvas');
        
        console.log('Unity Door Configurator initialized');
        console.log('Available door catalog:', doorCatalog);
    }
    
    setupHistoryManagement() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                if (event.state.page === 'configurator' && event.state.doorData) {
                    // Reconstruct the door selection
                    this.currentDoor = doorCatalog[event.state.doorData.doorType].doors[event.state.doorData.doorId];
                    this.currentConfig = { ...this.currentDoor.defaultConfig };
                    this.showConfigurator(event.state.doorData.doorType, event.state.doorData.doorId, false);
                } else if (event.state.page === 'selector') {
                    this.showProductSelector(false);
                }
            } else {
                // No state means we're back to the initial page
                this.showProductSelector(false);
            }
        });

        // Set initial state
        window.history.replaceState({ page: 'selector' }, 'Unity Doors - Door Selector', window.location.pathname);
    }
    
    onDoorSelected(doorType, doorId) {
        this.currentDoor = doorCatalog[doorType].doors[doorId];
        this.currentConfig = { ...this.currentDoor.defaultConfig };
        
        console.log('Door selected:', this.currentDoor.name);
        console.log('Default config:', this.currentConfig);
        
        // Add to browser history
        window.history.pushState(
            { 
                page: 'configurator',
                doorData: { doorType, doorId }
            }, 
            `Unity Doors - ${this.currentDoor.name}`,
            `#configurator/${doorType}/${doorId}`
        );
        
        this.showConfigurator(doorType, doorId, true);
    }
    
    showConfigurator(doorType, doorId, updateHistory = true) {
        // Show loading state
        this.showLoadingState(true);
        
        // Initialize configurator if not already done
        if (!this.configurator) {
            this.configurator = new Configurator(this.onConfigChanged.bind(this), this.viewer);
        }
        
        // Hide product selector, show configurator
        document.getElementById('product-selector').classList.add('hidden');
        document.getElementById('configurator').classList.remove('hidden');
        
        // Load door into configurator
        this.configurator.loadDoor(this.currentDoor, this.currentConfig);
        
        // Update 3D model
        setTimeout(() => {
            this.viewer.createDoor(this.currentConfig);
            this.showLoadingState(false);
        }, 100);
    }
    
    showProductSelector(updateHistory = true) {
        document.getElementById('configurator').classList.add('hidden');
        document.getElementById('product-selector').classList.remove('hidden');
        
        if (updateHistory) {
            window.history.pushState({ page: 'selector' }, 'Unity Doors - Door Selector', window.location.pathname);
        }
        
        console.log('Returned to product selector');
    }
    
    showLoadingState(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }
    
    onConfigChanged(newConfig) {
        const oldConfig = { ...this.currentConfig };
        this.currentConfig = { ...this.currentConfig, ...newConfig };
        
        console.log('Configuration changed:', {
            from: oldConfig,
            to: this.currentConfig,
            changes: newConfig
        });
        
        // Validate configuration
        const validation = ConfigurationValidator.validate(this.currentDoor, this.currentConfig);
        this.displayValidationResults(validation);
        
        // Update 3D model
        this.viewer.createDoor(this.currentConfig);
        
        // Log validation results
        if (validation.errors.length > 0) {
            console.warn('Configuration errors:', validation.errors);
        }
        if (validation.warnings.length > 0) {
            console.info('Configuration warnings:', validation.warnings);
        }
    }
    
    displayValidationResults(validation) {
        const errorContainer = document.getElementById('validation-errors');
        
        if (validation.errors.length > 0) {
            errorContainer.innerHTML = validation.errors.map(error => 
                `<div class="error">${error}</div>`
            ).join('');
            errorContainer.classList.remove('hidden');
        } else {
            errorContainer.classList.add('hidden');
        }
        
        // Show warnings as console logs for now
        if (validation.warnings.length > 0) {
            console.info('Configuration warnings:', validation.warnings);
        }
    }
    
    setupEventListeners() {
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showProductSelector(true);
        });
        
        // Export configuration
        document.getElementById('export-config').addEventListener('click', () => {
            this.exportConfiguration();
        });
        
        // View controls
        document.getElementById('reset-view').addEventListener('click', () => {
            if (this.viewer) {
                this.viewer.resetView();
            }
        });
        
        // Close selector (if needed)
        const closeBtn = document.getElementById('close-selector');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Close configurator');
                // Could redirect to main website or close app
                if (confirm('Are you sure you want to leave the configurator?')) {
                    window.open('https://unitydoors.com', '_self');
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.viewer) {
                this.viewer.onWindowResize();
            }
        });
    }
    
    exportConfiguration() {
        const validation = ConfigurationValidator.validate(this.currentDoor, this.currentConfig);
        
        if (validation.errors.length > 0) {
            alert('Please resolve configuration errors before exporting:\n\n' + 
                  validation.errors.join('\n'));
            return;
        }
        
        const exportData = {
            // Door information
            door: {
                id: this.currentDoor.id,
                name: this.currentDoor.name,
                category: this.findDoorCategory(this.currentDoor.id),
                type: this.currentDoor.doorType
            },
            
            // Configuration
            configuration: {
                ...this.currentConfig,
                timestamp: new Date().toISOString()
            },
            
            // Pricing
            pricing: {
                basePrice: this.currentDoor.basePrice,
                additionalCosts: validation.additionalCosts || 0,
                totalPrice: this.currentDoor.basePrice + (validation.additionalCosts || 0),
                currency: 'GBP'
            },
            
            // Manufacturing information
            manufacturing: {
                estimatedLeadTime: validation.estimatedLeadTime || 14,
                specialOrder: this.isSpecialOrder(),
                certifications: this.getRequiredCertifications()
            },
            
            // Technical specifications
            specifications: {
                dimensions: {
                    width: this.currentConfig.width,
                    height: this.currentConfig.height,
                    thickness: this.currentConfig.thickness
                },
                materials: {
                    wood: this.currentConfig.material,
                    finish: this.currentConfig.finish,
                    glass: this.currentConfig.hasGlass ? this.currentConfig.glassType : null
                },
                hardware: {
                    handle: this.currentConfig.hardware,
                    hinges: this.currentConfig.hingeType,
                    lock: this.currentConfig.lockType
                }
            },
            
            // Customer information (to be filled by sales)
            customer: {
                name: '',
                email: '',
                phone: '',
                address: ''
            },
            
            // Export metadata
            export: {
                version: '1.0',
                generatedBy: 'Unity Door Configurator',
                timestamp: new Date().toISOString()
            }
        };
        
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `unity-door-quote-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        // Log export
        console.log('Configuration exported:', exportData);
        
        // Show success message
        alert(`Quote generated successfully!\n\n` +
              `Door: ${this.currentDoor.name}\n` +
              `Size: ${this.currentConfig.width} × ${this.currentConfig.height}mm\n` +
              `Estimated Price: £${exportData.pricing.totalPrice}\n` +
              `Lead Time: ${validation.estimatedLeadTime || 14} days\n\n` +
              `Quote file downloaded. Please send this to Unity Doors for processing.`);
    }
    
    findDoorCategory(doorId) {
        for (const [categoryId, category] of Object.entries(doorCatalog)) {
            if (category.doors[doorId]) {
                return categoryId;
            }
        }
        return 'unknown';
    }
    
    isSpecialOrder() {
        // Simplified check - in real app would reference manufacturing rules
        const expensiveMaterials = ['mahogany', 'walnut'];
        const specialHardware = this.currentConfig.hingeType === 'parliament';
        
        return expensiveMaterials.includes(this.currentConfig.material) || specialHardware;
    }
    
    getRequiredCertifications() {
        const certifications = [];
        
        if (this.currentConfig.thickness >= 54) {
            certifications.push('Fire Rated');
        }
        
        if (this.currentConfig.hasGlass) {
            certifications.push('Safety Glass Compliant');
        }
        
        return certifications;
    }
}

// Modal Functions (Global)
window.showAbout = function() {
    const modal = createModal('About Unity Doors', `
        <div class="modal-content">
            <h3>Unity Doors - Premium Door Solutions</h3>
            <p>We specialize in bespoke timber doors, combining traditional craftsmanship with modern design. Our configurator allows you to design your perfect door with real-time 3D visualization.</p>
            <ul>
                <li>Premium quality timber construction</li>
                <li>Bespoke sizing and customization</li>
                <li>Professional installation service</li>
                <li>10-year manufacturing warranty</li>
            </ul>
            <p><strong>Est. 1985</strong> - Over 35 years of door craftsmanship excellence</p>
        </div>
    `);
    document.body.appendChild(modal);
}

window.showContact = function() {
    const modal = createModal('Contact Unity Doors', `
        <div class="modal-content">
            <h3>Get in Touch</h3>
            <div class="contact-info">
                <div class="contact-item">
                    <strong>Phone:</strong> 01234 567 890
                </div>
                <div class="contact-item">
                    <strong>Email:</strong> info@unitydoors.com
                </div>
                <div class="contact-item">
                    <strong>Address:</strong><br>
                    Unity Doors Ltd<br>
                    Industrial Estate<br>
                    Craftsman Way<br>
                    Sheffield, S12 3AB
                </div>
                <div class="contact-item">
                    <strong>Opening Hours:</strong><br>
                    Mon-Fri: 8:00 AM - 6:00 PM<br>
                    Sat: 9:00 AM - 4:00 PM<br>
                    Sun: Closed
                </div>
            </div>
            <p><em>For quotes from this configurator, please export your configuration and email it to our sales team.</em></p>
        </div>
    `);
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    return modal;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.doorConfiguratorApp = new DoorConfiguratorApp();
        
        // Make it globally accessible for debugging
        window.doorCatalog = doorCatalog;
        
        console.log('DOM loaded - Door configurator app started');
    } catch (error) {
        console.error('Failed to initialize Door Configurator:', error);
        alert('Failed to load Door Configurator. Please refresh the page.');
    }
});

// Handle any global errors
window.addEventListener('error', (e) => {
    console.error('Door configurator error:', e.error);
    console.log('An error occurred. Check console for details.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export for potential external integration
export default DoorConfiguratorApp;
