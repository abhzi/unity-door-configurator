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
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window;
        this.sidebarOpen = false;
        this.lastTouchY = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.pullIndicatorShown = false;
        
        this.productSelector = new ProductSelector(this.onDoorSelected.bind(this));
        this.configurator = null;
        
        this.init();
    }
    
    init() {
        this.productSelector.render();
        this.setupEventListeners();
        this.setupHistoryManagement();
        this.setupMobileDetection();
        this.setupPerformanceOptimizations();
        
        this.viewer = new ThreeJSViewer('three-canvas');
        
        console.log('Unity Door Configurator initialized');
        console.log('Available door catalog:', doorCatalog);
        console.log('Mobile device:', this.isMobile, 'Touch device:', this.isTouch);
    }
    
    setupMobileDetection() {
        // Enhanced mobile detection
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
        
        if (isMobileDevice || this.isMobile) {
            document.body.classList.add('mobile-device');
            this.setupMobileOptimizations();
        }
        
        // Dynamic viewport height for mobile browsers
        if (this.isMobile) {
            this.setViewportHeight();
            window.addEventListener('resize', () => this.setViewportHeight());
        }
    }
    
    setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setupPerformanceOptimizations() {
        // Throttle resize events for better performance
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= 768;
                
                if (wasMobile !== this.isMobile) {
                    this.handleDeviceChange();
                }
                
                if (this.viewer) {
                    this.viewer.onWindowResize();
                }
                
                if (this.isMobile) {
                    this.setViewportHeight();
                }
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Preload critical resources
        if (this.isMobile) {
            this.preloadMobileAssets();
        }
        
        // Memory management for mobile
        this.setupMemoryManagement();
    }
    
    preloadMobileAssets() {
        const criticalImages = [
            'door-images/jcklogo.png',
            'door-images/unitydoorslogo.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    setupMemoryManagement() {
        // Clean up resources on page hide/unload for mobile
        const cleanup = () => {
            if (this.viewer) {
                this.viewer.dispose();
            }
        };
        
        window.addEventListener('pagehide', cleanup);
        window.addEventListener('beforeunload', cleanup);
        
        // Memory pressure handling for mobile
        if ('memory' in performance && performance.memory) {
            const checkMemoryUsage = () => {
                const memoryInfo = performance.memory;
                const usedMemoryMB = memoryInfo.usedJSHeapSize / 1048576;
                
                if (usedMemoryMB > 50 && this.isMobile) {
                    console.warn('High memory usage detected, optimizing...');
                    this.optimizeForLowMemory();
                }
            };
            
            setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
        }
    }
    
    optimizeForLowMemory() {
        // Reduce quality settings for mobile devices with memory pressure
        if (this.viewer) {
            this.viewer.setLowMemoryMode(true);
        }
        
        // Clear any cached data if needed
        if (this.productSelector) {
            this.productSelector.clearCache();
        }
    }
    
    setupMobileOptimizations() {
        // Improve touch scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Prevent rubber band scrolling on iOS
        let preventTouch = false;
        document.addEventListener('touchmove', (e) => {
            if (preventTouch) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Better touch feedback
        this.setupTouchFeedback();
        
        // Optimize for mobile keyboards
        this.setupMobileKeyboard();
    }
    
    setupTouchFeedback() {
        // Add haptic feedback for supported devices
        const addHapticFeedback = (element, intensity = 'light') => {
            if ('vibrate' in navigator) {
                element.addEventListener('touchstart', () => {
                    switch(intensity) {
                        case 'light':
                            navigator.vibrate(10);
                            break;
                        case 'medium':
                            navigator.vibrate(25);
                            break;
                        case 'heavy':
                            navigator.vibrate(50);
                            break;
                    }
                });
            }
        };
        
        // Add to interactive elements
        document.querySelectorAll('button, .door-card, .option-btn').forEach(el => {
            addHapticFeedback(el, 'light');
        });
    }
    
    setupMobileKeyboard() {
        // Prevent zoom on input focus for iOS
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                    }
                }
            });
            
            input.addEventListener('blur', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
                    }
                }
            });
        });
    }
    
    handleDeviceChange() {
        if (this.isMobile && !this.wasMobile) {
            // Switched to mobile
            this.setupMobileFeatures();
            this.setupMobileOptimizations();
        } else if (!this.isMobile && this.wasMobile) {
            // Switched to desktop
            this.removeMobileFeatures();
        }
        this.wasMobile = this.isMobile;
    }
    
    removeMobileFeatures() {
        const toggle = document.querySelector('.mobile-sidebar-toggle');
        if (toggle) {
            toggle.remove();
        }
        
        const indicator = document.querySelector('.mobile-pull-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        
        const backdrop = document.querySelector('.mobile-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
        }
    }
    
    setupHistoryManagement() {
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                if (event.state.page === 'configurator' && event.state.doorData) {
                    this.currentDoor = doorCatalog[event.state.doorData.doorType].doors[event.state.doorData.doorId];
                    this.currentConfig = { ...this.currentDoor.defaultConfig };
                    this.showConfigurator(event.state.doorData.doorType, event.state.doorData.doorId, false);
                } else if (event.state.page === 'selector') {
                    this.showProductSelector(false);
                }
            } else {
                this.showProductSelector(false);
            }
        });

        window.history.replaceState({ page: 'selector' }, 'Unity Doors - Door Selector', window.location.pathname);
    }
    
    onDoorSelected(doorType, doorId) {
        this.currentDoor = doorCatalog[doorType].doors[doorId];
        this.currentConfig = { ...this.currentDoor.defaultConfig };
        
        console.log('Door selected:', this.currentDoor.name);
        console.log('Default config:', this.currentConfig);
        
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
        this.showLoadingState(true);
        
        if (!this.configurator) {
            this.configurator = new Configurator(this.onConfigChanged.bind(this), this.viewer);
        }
        
        document.getElementById('product-selector').classList.add('hidden');
        document.getElementById('configurator').classList.remove('hidden');
        
        this.configurator.loadDoor(this.currentDoor, this.currentConfig);
        
        this.setupMobileFeatures();
        
        setTimeout(() => {
            this.viewer.createDoor(this.currentConfig);
            this.showLoadingState(false);
            
            // Show mobile pull indicator after a delay
            if (this.isMobile && !this.pullIndicatorShown) {
                this.showMobilePullIndicator();
            }
        }, 100);
    }
    
    showMobilePullIndicator() {
        const indicator = document.getElementById('mobile-pull-indicator');
        if (indicator && this.isMobile) {
            indicator.style.display = 'block';
            this.pullIndicatorShown = true;
            
            // Hide after 5 seconds
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 5000);
        }
    }
    
    setupMobileFeatures() {
        if (this.isMobile) {
            this.createMobileSidebarToggle();
            this.setupAdvancedMobileGestures();
            this.setupMobileBackdrop();
            this.optimizeMobilePerformance();
        }
    }
    
    createMobileSidebarToggle() {
        const existingToggle = document.querySelector('.mobile-sidebar-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-sidebar-toggle';
        toggleBtn.setAttribute('aria-label', 'Open configuration panel');
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;" aria-hidden="true">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
        `;
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileSidebar();
        });
        
        // Add haptic feedback
        if ('vibrate' in navigator) {
            toggleBtn.addEventListener('touchstart', () => {
                navigator.vibrate(15);
            });
        }
        
        const configurator = document.getElementById('configurator');
        if (configurator) {
            configurator.appendChild(toggleBtn);
        }
    }
    
    setupMobileBackdrop() {
        let backdrop = document.getElementById('mobile-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'mobile-backdrop';
            backdrop.id = 'mobile-backdrop';
            const configurator = document.getElementById('configurator');
            if (configurator) {
                configurator.insertBefore(backdrop, configurator.firstChild);
            }
        }
        
        backdrop.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
        
        backdrop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.closeMobileSidebar();
        });
    }
    
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('mobile-backdrop');
        
        if (!sidebar) return;
        
        this.sidebarOpen = !this.sidebarOpen;
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Update toggle button
            const toggle = document.querySelector('.mobile-sidebar-toggle');
            if (toggle) {
                toggle.setAttribute('aria-label', 'Close configuration panel');
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;" aria-hidden="true">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                `;
            }
        } else {
            this.closeMobileSidebar();
        }
    }
    
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('mobile-backdrop');
        
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (backdrop) {
            backdrop.classList.remove('active');
        }
        
        document.body.style.overflow = '';
        this.sidebarOpen = false;
        
        // Update toggle button
        const toggle = document.querySelector('.mobile-sidebar-toggle');
        if (toggle) {
            toggle.setAttribute('aria-label', 'Open configuration panel');
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;" aria-hidden="true">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            `;
        }
    }
    
    setupAdvancedMobileGestures() {
        const viewport = document.querySelector('.viewport');
        const sidebar = document.querySelector('.sidebar');
        
        if (!viewport || !sidebar) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let velocity = 0;
        let lastMoveTime = 0;
        const velocityThreshold = 0.5;
        const dragThreshold = 50;
        
        // Enhanced touch handling for viewport (pull up gesture)
        viewport.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startY = touch.clientY;
            this.touchStartY = startY;
            isDragging = false;
            velocity = 0;
            lastMoveTime = Date.now();
            
            // Only trigger pull-up from bottom area
            if (startY > window.innerHeight * 0.7) {
                e.preventDefault();
            }
        }, { passive: false });
        
        viewport.addEventListener('touchmove', (e) => {
            if (!startY) return;
            
            const touch = e.touches[0];
            currentY = touch.clientY;
            const deltaY = startY - currentY;
            const now = Date.now();
            const timeDelta = now - lastMoveTime;
            
            if (timeDelta > 0) {
                velocity = deltaY / timeDelta;
            }
            
            // Start from bottom area and swipe up
            if (this.touchStartY > window.innerHeight * 0.7 && deltaY > 10) {
                isDragging = true;
                e.preventDefault();
                
                // Provide visual feedback during drag
                const progress = Math.min(deltaY / dragThreshold, 1);
                const indicator = document.getElementById('mobile-pull-indicator');
                if (indicator) {
                    indicator.style.opacity = 1 - progress;
                }
            }
            
            lastMoveTime = now;
        }, { passive: false });
        
        viewport.addEventListener('touchend', (e) => {
            if (!startY) return;
            
            const deltaY = startY - currentY;
            const shouldOpen = deltaY > dragThreshold || velocity > velocityThreshold;
            
            if (isDragging && shouldOpen && !this.sidebarOpen) {
                this.toggleMobileSidebar();
            }
            
            // Reset values
            startY = 0;
            currentY = 0;
            isDragging = false;
            velocity = 0;
            
            // Reset indicator
            const indicator = document.getElementById('mobile-pull-indicator');
            if (indicator) {
                indicator.style.opacity = '';
            }
        });
        
        // Enhanced touch handling for sidebar (pull down to close)
        sidebar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startY = touch.clientY;
            isDragging = false;
            velocity = 0;
            lastMoveTime = Date.now();
        });
        
        sidebar.addEventListener('touchmove', (e) => {
            if (!startY || !this.sidebarOpen) return;
            
            const touch = e.touches[0];
            currentY = touch.clientY;
            const deltaY = currentY - startY;
            const now = Date.now();
            const timeDelta = now - lastMoveTime;
            
            if (timeDelta > 0) {
                velocity = deltaY / timeDelta;
            }
            
            // Only handle downward swipes from the top area of sidebar
            if (startY < 100 && deltaY > 10) {
                isDragging = true;
                e.preventDefault();
            }
            
            lastMoveTime = now;
        });
        
        sidebar.addEventListener('touchend', (e) => {
            if (!startY) return;
            
            const deltaY = currentY - startY;
            const shouldClose = deltaY > dragThreshold || velocity > velocityThreshold;
            
            if (isDragging && shouldClose && this.sidebarOpen) {
                this.closeMobileSidebar();
            }
            
            // Reset values
            startY = 0;
            currentY = 0;
            isDragging = false;
            velocity = 0;
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sidebarOpen && this.isMobile && 
                !sidebar.contains(e.target) && 
                !e.target.classList.contains('mobile-sidebar-toggle')) {
                this.closeMobileSidebar();
            }
        });
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.setViewportHeight();
                if (this.viewer) {
                    this.viewer.onWindowResize();
                }
            }, 100);
        });
    }
    
    optimizeMobilePerformance() {
        // Throttle scroll events
        let scrollTimeout;
        const optimizedElements = document.querySelectorAll('.config-panels, .door-categories');
        
        optimizedElements.forEach(element => {
            element.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    // Trigger any scroll-dependent updates
                }, 100);
            }, { passive: true });
        });
        
        // Use will-change for animated elements
        const animatedElements = document.querySelectorAll('.sidebar, .mobile-backdrop, .door-card');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });
        
        // Optimize touch events
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        document.addEventListener('touchend', () => {}, { passive: true });
    }
    
    showProductSelector(updateHistory = true) {
        document.getElementById('configurator').classList.add('hidden');
        document.getElementById('product-selector').classList.remove('hidden');
        
        // Close mobile sidebar if open
        if (this.isMobile && this.sidebarOpen) {
            this.closeMobileSidebar();
        }
        
        // Remove mobile features when going back to selector
        this.removeMobileFeatures();
        
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
                loadingOverlay.setAttribute('aria-hidden', 'false');
            } else {
                loadingOverlay.classList.add('hidden');
                loadingOverlay.setAttribute('aria-hidden', 'true');
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
        
        const validation = ConfigurationValidator.validate(this.currentDoor, this.currentConfig);
        this.displayValidationResults(validation);
        
        this.viewer.createDoor(this.currentConfig);
        
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
            errorContainer.setAttribute('aria-hidden', 'false');
        } else {
            errorContainer.classList.add('hidden');
            errorContainer.setAttribute('aria-hidden', 'true');
        }
        
        if (validation.warnings.length > 0) {
            console.info('Configuration warnings:', validation.warnings);
        }
    }
    
    setupEventListeners() {
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showProductSelector(true);
        });
        
        document.getElementById('export-config').addEventListener('click', () => {
            this.exportConfiguration();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            if (this.viewer) {
                this.viewer.resetView();
            }
        });
        
        const closeBtn = document.getElementById('close-selector');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Close configurator');
                if (confirm('Are you sure you want to leave the configurator?')) {
                    window.open('https://unitydoors.com', '_self');
                }
            });
        }
        
        // Throttled resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.viewer) {
                    this.viewer.onWindowResize();
                }
                
                // Update mobile state
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= 768;
                
                if (wasMobile !== this.isMobile) {
                    this.handleDeviceChange();
                }
            }, 100);
        });
        
        // Handle visibility changes for mobile optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause any animations or reduce resource usage
                if (this.viewer) {
                    this.viewer.pause();
                }
            } else {
                // Resume normal operation
                if (this.viewer) {
                    this.viewer.resume();
                }
            }
        });
    }
    
    exportConfiguration() {
        const validation = ConfigurationValidator.validate(this.currentDoor, this.currentConfig);
        
        if (validation.errors.length > 0) {
            const errorMessage = 'Please resolve configuration errors before exporting:\n\n' + 
                                validation.errors.join('\n');
            
            if (this.isMobile) {
                // Better mobile alert handling
                const modal = this.createMobileAlert('Configuration Errors', errorMessage);
                document.body.appendChild(modal);
            } else {
                alert(errorMessage);
            }
            return;
        }
        
        const exportData = {
            door: {
                id: this.currentDoor.id,
                name: this.currentDoor.name,
                category: this.findDoorCategory(this.currentDoor.id),
                type: this.currentDoor.doorType
            },
            
            configuration: {
                ...this.currentConfig,
                timestamp: new Date().toISOString()
            },
            
            pricing: {
                basePrice: this.currentDoor.basePrice,
                additionalCosts: validation.additionalCosts || 0,
                totalPrice: this.currentDoor.basePrice + (validation.additionalCosts || 0),
                currency: 'GBP'
            },
            
            manufacturing: {
                estimatedLeadTime: validation.estimatedLeadTime || 14,
                specialOrder: this.isSpecialOrder(),
                certifications: this.getRequiredCertifications()
            },
            
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
            
            customer: {
                name: '',
                email: '',
                phone: '',
                address: ''
            },
            
            deviceInfo: {
                isMobile: this.isMobile,
                isTouch: this.isTouch,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            },
            
            export: {
                version: '1.2',
                generatedBy: 'Unity Door Configurator',
                timestamp: new Date().toISOString()
            }
        };
        
        // Mobile-optimized file download
        if (this.isMobile && navigator.share) {
            // Use Web Share API if available
            const jsonString = JSON.stringify(exportData, null, 2);
            const file = new File([jsonString], `unity-door-quote-${Date.now()}.json`, {
                type: 'application/json'
            });
            
            navigator.share({
                files: [file],
                title: 'Unity Door Quote',
                text: `Door configuration for ${this.currentDoor.name}`
            }).catch(() => {
                // Fallback to traditional download
                this.downloadFile(exportData);
            });
        } else {
            this.downloadFile(exportData);
        }
        
        console.log('Configuration exported:', exportData);
        
        const successMessage = `Quote generated successfully!\n\n` +
                              `Door: ${this.currentDoor.name}\n` +
                              `Size: ${this.currentConfig.width} × ${this.currentConfig.height}mm\n` +
                              `Estimated Price: £${exportData.pricing.totalPrice}\n` +
                              `Lead Time: ${validation.estimatedLeadTime || 14} days\n\n` +
                              `Quote file downloaded. Please send this to Unity Doors for processing.`;
        
        if (this.isMobile) {
            const modal = this.createMobileAlert('Quote Generated', successMessage);
            document.body.appendChild(modal);
        } else {
            alert(successMessage);
        }
    }
    
    downloadFile(exportData) {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `unity-door-quote-${Date.now()}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    createMobileAlert(title, message) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 90vw;">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="white-space: pre-line;">${message}</p>
                    <button class="primary-btn" style="margin-top: 20px;">OK</button>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.primary-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        return modal;
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

// Enhanced modal functions with mobile optimization
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
                    <strong>Phone:</strong> <a href="tel:01234567890" style="color: var(--unity-primary); text-decoration: none;">01234 567 890</a>
                </div>
                <div class="contact-item">
                    <strong>Email:</strong> <a href="mailto:info@unitydoors.com" style="color: var(--unity-primary); text-decoration: none;">info@unitydoors.com</a>
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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    const isMobile = window.innerWidth <= 768;
    const modalStyle = isMobile ? 'style="max-width: 95vw; max-height: 90vh;"' : '';
    
    modal.innerHTML = `
        <div class="modal" ${modalStyle}>
            <div class="modal-header">
                <h2 id="modal-title">${title}</h2>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    const closeModal = () => {
        modal.classList.add('hidden');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Focus management
    setTimeout(() => {
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
    
    return modal;
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.doorConfiguratorApp = new DoorConfiguratorApp();
        window.doorCatalog = doorCatalog;
        console.log('DOM loaded - Door configurator app started');
        console.log('Mobile device detected:', window.innerWidth <= 768);
    } catch (error) {
        console.error('Failed to initialize Door Configurator:', error);
        
        // Mobile-friendly error handling
        if (window.innerWidth <= 768) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: #fee2e2;
                border: 2px solid #fca5a5;
                border-radius: 12px;
                padding: 16px;
                z-index: 9999;
                text-align: center;
            `;
            errorDiv.innerHTML = `
                <h3 style="color: #dc2626; margin-bottom: 8px;">Loading Error</h3>
                <p style="color: #991b1b; margin-bottom: 12px;">Failed to load Door Configurator. Please refresh the page.</p>
                <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Refresh Page</button>
            `;
            document.body.appendChild(errorDiv);
        } else {
            alert('Failed to load Door Configurator. Please refresh the page.');
        }
    }
});

window.addEventListener('error', (e) => {
    console.error('Door configurator error:', e.error);
    console.log('An error occurred. Check console for details.');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

export default DoorConfiguratorApp;