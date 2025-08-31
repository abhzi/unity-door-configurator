import { manufacturingRules } from '../data/manufacturingRules.js';

export class ConfigurationValidator {
    static validate(doorData, config) {
        const errors = [];
        const warnings = [];
        
        // Dimension validation
        const dimensionErrors = this.validateDimensions(config);
        errors.push(...dimensionErrors);
        
        // Glass validation
        if (config.hasGlass) {
            const glassErrors = this.validateGlass(doorData, config);
            errors.push(...glassErrors);
        }
        
        // Hardware compatibility
        const hardwareErrors = this.validateHardware(doorData, config);
        errors.push(...hardwareErrors);
        
        // Material constraints
        const materialWarnings = this.validateMaterial(config);
        warnings.push(...materialWarnings);
        
        // Business rule validation
        const businessErrors = this.validateBusinessRules(doorData, config);
        errors.push(...businessErrors);
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            estimatedLeadTime: this.calculateLeadTime(config),
            additionalCosts: this.calculateAdditionalCosts(config)
        };
    }
    
    static validateDimensions(config) {
        const errors = [];
        const rules = manufacturingRules.dimensions;
        
        // Width validation
        if (config.width < rules.width.min || config.width > rules.width.max) {
            errors.push(`Width must be between ${rules.width.min}mm and ${rules.width.max}mm`);
        }
        
        // Height validation  
        if (config.height < rules.height.min || config.height > rules.height.max) {
            errors.push(`Height must be between ${rules.height.min}mm and ${rules.height.max}mm`);
        }
        
        // Thickness validation
        if (config.thickness && !rules.thickness.standard.includes(config.thickness)) {
            errors.push(`Available thicknesses: ${rules.thickness.standard.join('mm, ')}mm`);
        }
        
        return errors;
    }
    
    static validateGlass(doorData, config) {
        const errors = [];
        const rules = manufacturingRules.glass;
        
        // Check if door type allows glass
        if (!doorData.allowsGlass) {
            errors.push('This door style does not support glass panels');
            return errors;
        }
        
        // Thickness requirement
        if (config.thickness < rules.requiredThickness) {
            errors.push(`Glass requires minimum ${rules.requiredThickness}mm door thickness`);
        }
        
        // Glass size validation
        if (config.glassWidth && config.glassHeight) {
            const maxGlassWidth = config.width * rules.maxWidthPercentage;
            const maxGlassHeight = config.height * rules.maxHeightPercentage;
            
            if (config.glassWidth > maxGlassWidth) {
                errors.push(`Glass width cannot exceed ${Math.floor(maxGlassWidth)}mm (${Math.floor(rules.maxWidthPercentage * 100)}% of door width)`);
            }
            
            if (config.glassHeight > maxGlassHeight) {
                errors.push(`Glass height cannot exceed ${Math.floor(maxGlassHeight)}mm (${Math.floor(rules.maxHeightPercentage * 100)}% of door height)`);
            }
            
            // Edge distance validation
            const glassX = config.glassX || (config.width - config.glassWidth) / 2;
            const glassY = config.glassY || (config.height - config.glassHeight) / 2;
            
            const leftEdge = glassX;
            const rightEdge = config.width - (glassX + config.glassWidth);
            const bottomEdge = glassY;
            const topEdge = config.height - (glassY + config.glassHeight);
            
            if (leftEdge < rules.minEdgeDistance || 
                rightEdge < rules.minEdgeDistance ||
                bottomEdge < rules.minEdgeDistance || 
                topEdge < rules.minEdgeDistance) {
                errors.push(`Glass must be at least ${rules.minEdgeDistance}mm from all edges`);
            }
        }
        
        // Door-specific glass constraints
        if (doorData.glassOptions) {
            if (config.glassWidth > doorData.glassOptions.maxWidth) {
                errors.push(`Maximum glass width for this door style: ${doorData.glassOptions.maxWidth}mm`);
            }
            if (config.glassHeight > doorData.glassOptions.maxHeight) {
                errors.push(`Maximum glass height for this door style: ${doorData.glassOptions.maxHeight}mm`);
            }
        }
        
        return errors;
    }
    
    static validateHardware(doorData, config) {
        const errors = [];
        const rules = manufacturingRules.hardwareCompatibility;
        
        // Hinge validation
        if (config.hingeType && rules.hinges[config.hingeType]) {
            const hingeRules = rules.hinges[config.hingeType];
            
            // Thickness requirement
            if (hingeRules.requiredThickness && config.thickness < hingeRules.requiredThickness) {
                errors.push(`${config.hingeType} hinges require minimum ${hingeRules.requiredThickness}mm thickness`);
            }
            
            // Lock compatibility
            if (config.lockType && !hingeRules.compatibleLocks.includes(config.lockType)) {
                errors.push(`${config.hingeType} hinges are not compatible with ${config.lockType} locks`);
            }
        }
        
        // Lock validation
        if (config.lockType && rules.locks[config.lockType]) {
            const lockRules = rules.locks[config.lockType];
            
            if (lockRules.requiredThickness && config.thickness < lockRules.requiredThickness) {
                errors.push(`${config.lockType} locks require minimum ${lockRules.requiredThickness}mm thickness`);
            }
        }
        
        // Handle style compatibility
        if (config.hardware && rules.handles[config.hardware]) {
            const handleRules = rules.handles[config.hardware];
            if (handleRules.styles && !handleRules.styles.includes(doorData.doorType)) {
                errors.push(`${config.hardware} handles are not suitable for ${doorData.doorType} doors`);
            }
        }
        
        // Check incompatible combinations
        const incompatible = manufacturingRules.businessRules.incompatibleCombinations.find(combo => {
            return Object.entries(combo).every(([key, value]) => {
                if (key === 'reason') return true;
                return config[key] === value;
            });
        });
        
        if (incompatible) {
            errors.push(incompatible.reason || 'This combination is not available');
        }
        
        return errors;
    }
    
    static validateMaterial(config) {
        const warnings = [];
        const rules = manufacturingRules.materialConstraints;
        
        if (config.material && rules[config.material]) {
            const materialRules = rules[config.material];
            
            if (materialRules.availability === 'special-order') {
                warnings.push(`${config.material} is a special order item (${materialRules.leadTime} additional days)`);
            }
        }
        
        return warnings;
    }
    
    static validateBusinessRules(doorData, config) {
        const errors = [];
        
        // Add any additional business logic here
        
        return errors;
    }
    
    static calculateLeadTime(config) {
        let leadTime = manufacturingRules.businessRules.standardLeadTime;
        
        // Add material lead time
        const materialRules = manufacturingRules.materialConstraints[config.material];
        if (materialRules && materialRules.leadTime) {
            leadTime += materialRules.leadTime;
        }
        
        // Add finish lead time
        const finishRules = manufacturingRules.finishConstraints[config.finish];
        if (finishRules && finishRules.leadTime) {
            leadTime += finishRules.leadTime;
        }
        
        // Add hardware lead time
        if (config.hingeType) {
            const hingeRules = manufacturingRules.hardwareCompatibility.hinges[config.hingeType];
            if (hingeRules && hingeRules.leadTime) {
                leadTime += hingeRules.leadTime;
            }
        }
        
        return leadTime;
    }
    
    static calculateAdditionalCosts(config) {
        let additionalCosts = 0;
        
        // Material cost
        const materialRules = manufacturingRules.materialConstraints[config.material];
        if (materialRules) {
            additionalCosts += materialRules.additionalCost || 0;
        }
        
        // Finish cost
        const finishRules = manufacturingRules.finishConstraints[config.finish];
        if (finishRules) {
            additionalCosts += finishRules.additionalCost || 0;
        }
        
        // Glass cost
        if (config.hasGlass) {
            additionalCosts += manufacturingRules.glass.additionalCost;
        }
        
        // Hardware costs
        if (config.hingeType) {
            const hingeRules = manufacturingRules.hardwareCompatibility.hinges[config.hingeType];
            if (hingeRules && hingeRules.additionalCost) {
                additionalCosts += hingeRules.additionalCost;
            }
        }
        
        if (config.lockType) {
            const lockRules = manufacturingRules.hardwareCompatibility.locks[config.lockType];
            if (lockRules && lockRules.additionalCost) {
                additionalCosts += lockRules.additionalCost;
            }
        }
        
        // Custom size surcharge
        const dimensionRules = manufacturingRules.dimensions;
        if (!dimensionRules.width.standard.includes(config.width)) {
            additionalCosts += dimensionRules.width.customSurcharge;
        }
        if (!dimensionRules.height.standard.includes(config.height)) {
            additionalCosts += dimensionRules.height.customSurcharge;
        }
        
        return additionalCosts;
    }
}
