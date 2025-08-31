import { ConfigurationValidator } from '../utils/validator.js';

export class Configurator {
  constructor(onConfigChanged, viewer) {
    this.onConfigChanged = onConfigChanged; this.viewer = viewer; this.currentDoor = null; this.currentConfig = {};
  }
  loadDoor(doorData, config) {
    this.currentDoor = doorData;
    this.currentConfig = { ...config };
    this.updateHeader();
    this.renderConfigPanels();
    if (this.viewer) this.viewer.createDoor(this.currentConfig);
  }
  updateHeader() {
    document.getElementById('selected-door-name').textContent = this.currentDoor.name;
    document.getElementById('selected-door-description').textContent = 'Resizable ' + this.currentDoor.description;
  }
  renderConfigPanels() {
    const container = document.getElementById('config-panels');
    let html = this.renderDimensionsPanel();
    html += this.renderMaterialPanel();
    html += this.renderHardwarePanel();
    if (this.currentDoor.allowsGlass) html += this.renderGlassPanel();
    container.innerHTML = html;
    this.attachEventListeners();
    this.updatePrice();
  }
  renderDimensionsPanel() {
    const sizes = this.currentDoor.availableOptions?.sizes || [];
    return `<div class="config-section"><h4>Dimensions</h4>${
      sizes.length > 0
        ? `<div class="input-group"><label>Standard Sizes</label><div class="option-grid">${sizes
            .map(
              (size) =>
                `<button class="option-btn size-option ${
                  size.width === this.currentConfig.width ? 'active' : ''
                }" data-width="${size.width}" data-height="${size.height}">${size.name}<br><small>${
                  size.width
                } × ${size.height}mm</small></button>`
            )
            .join('')}</div></div>`
        : ''}
      <div class="input-group"><label>Width (mm)</label><div class="dual-input"><input type="number" id="door-width" value="${this.currentConfig.width}" min="610" max="1200" step="1"><input type="range" id="door-width-slider" value="${this.currentConfig.width}" min="610" max="1200" step="1"></div></div><div class="input-group"><label>Height (mm)</label><div class="dual-input"><input type="number" id="door-height" value="${this.currentConfig.height}" min="1800" max="2400" step="1"><input type="range" id="door-height-slider" value="${this.currentConfig.height}" min="1800" max="2400" step="1"></div></div><div class="input-group"><label>Thickness (mm)</label><select id="door-thickness"><option value="35" ${this.currentConfig.thickness === 35 ? 'selected' : ''}>35mm - Standard</option><option value="40" ${this.currentConfig.thickness === 40 ? 'selected' : ''}>40mm</option><option value="44" ${this.currentConfig.thickness === 44 ? 'selected' : ''}>44mm - Premium</option><option value="50" ${this.currentConfig.thickness === 50 ? 'selected' : ''}>50mm - Heavy Duty</option><option value="54" ${this.currentConfig.thickness === 54 ? 'selected' : ''}>54mm - Fire Rated</option></select></div></div>`;
  }
  renderMaterialPanel() {
    const materials = this.currentDoor.availableOptions?.materials || ['oak', 'pine'];
    const finishes = this.currentDoor.availableOptions?.finishes || ['natural', 'stained', 'painted'];
    return `<div class="config-section"><h4>Material & Finish</h4><div class="input-group"><label>Wood Type</label><select id="door-material">${materials
      .map(
        (material) =>
          `<option value="${material}" ${material === this.currentConfig.material ? 'selected' : ''}>${this.formatMaterialName(
            material
          )}</option>`
      )
      .join('')}</select></div><div class="input-group"><label>Finish</label><div class="option-grid">${finishes
      .map(
        (finish) =>
          `<button class="option-btn finish-option ${
            finish === this.currentConfig.finish ? 'active' : ''
          }" data-finish="${finish}">${this.formatFinishName(finish)}</button>`
      )
      .join('')}</div></div>${
      this.currentConfig.finish === 'painted'
        ? `<div class="input-group"><label>Paint Color</label><select id="paint-color"><option value="white">White</option><option value="cream">Cream</option><option value="grey">Grey</option><option value="black">Black</option><option value="custom">Custom RAL Color</option></select></div>`
        : ''}
      ${
        this.currentConfig.finish === 'stained'
          ? `<div class="input-group"><label>Stain Color</label><select id="stain-color"><option value="light-oak">Light Oak</option><option value="medium-oak">Medium Oak</option><option value="dark-oak">Dark Oak</option><option value="mahogany">Mahogany</option><option value="walnut">Walnut</option></select></div>`
          : ''
    }</div>`;
  }
  renderHardwarePanel() {
    const hardware = this.currentDoor.availableOptions?.hardware || ['brass-traditional'];
    return `<div class="config-section"><h4>Hardware</h4><div class="input-group"><label>Handle Style</label><div class="option-grid">${hardware
      .map(
        (hw) =>
          `<button class="option-btn hardware-option ${hw === this.currentConfig.hardware ? 'active' : ''}" data-hardware="${hw}">${this.formatHardwareName(hw)}</button>`
      )
      .join('')}</div></div><div class="input-group"><label>Hinge Type</label><select id="hinge-type"><option value="butt" ${this.currentConfig.hingeType === 'butt' ? 'selected' : ''}>Butt Hinge - Standard</option><option value="ball-bearing" ${this.currentConfig.hingeType === 'ball-bearing' ? 'selected' : ''}>Ball Bearing - Premium (+£25)</option><option value="parliament" ${this.currentConfig.hingeType === 'parliament' ? 'selected' : ''}>Parliament - Special Order (+£45)</option></select></div><div class="input-group"><label>Lock Type</label><select id="lock-type"><option value="mortice" ${this.currentConfig.lockType === 'mortice' ? 'selected' : ''}>Mortice Lock - High Security</option><option value="cylinder" ${this.currentConfig.lockType === 'cylinder' ? 'selected' : ''}>Cylinder Lock - Standard</option><option value="multipoint" ${this.currentConfig.lockType === 'multipoint' ? 'selected' : ''}>Multi-point - Maximum Security (+£95)</option></select></div></div>`;
  }
  renderGlassPanel() {
    const glassTypes = this.currentDoor.availableOptions?.glassTypes || ['clear', 'frosted'];
    const defaultGlassWidth = Math.min(400, Math.floor(this.currentConfig.width * 0.6));
    const defaultGlassHeight = Math.min(600, Math.floor(this.currentConfig.height * 0.6));
    const glassWidth = this.currentConfig.glassWidth || defaultGlassWidth;
    const glassHeight = this.currentConfig.glassHeight || defaultGlassHeight;
    return `<div class="config-section"><h4>Glass Panel</h4><div class="checkbox-group"><input type="checkbox" id="has-glass" ${this.currentConfig.hasGlass ? 'checked' : ''}><label for="has-glass">Add Glass Panel (+£75)</label></div><div id="glass-options" class="glass-options" style="${this.currentConfig.hasGlass ? '' : 'display:none'}"><div class="input-group"><label>Glass Type</label><div class="option-grid">${glassTypes.map((type) => `<button class="option-btn glass-type-option ${
      type === (this.currentConfig.glassType || 'clear') ? 'active' : ''
    }" data-glass-type="${type}">${this.formatGlassTypeName(type)}</button>`).join('')}</div></div><div class="input-group"><label>Glass Width (mm)</label><div class="dual-input"><input type="number" id="glass-width" value="${glassWidth}" min="200" max="${Math.floor(
      this.currentConfig.width * 0.7
    )}" step="1"><input type="range" id="glass-width-slider" value="${glassWidth}" min="200" max="${Math.floor(
      this.currentConfig.width * 0.7
    )}" step="1"></div></div><div class="input-group"><label>Glass Height (mm)</label><div class="dual-input"><input type="number" id="glass-height" value="${glassHeight}" min="300" max="${Math.floor(
      this.currentConfig.height * 0.8
    )}" step="1"><input type="range" id="glass-height-slider" value="${glassHeight}" min="300" max="${Math.floor(
      this.currentConfig.height * 0.8
    )}" step="1"></div></div></div></div>`;
  }
  attachEventListeners() {
    document.querySelectorAll('.size-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const width = parseInt(e.target.dataset.width);
        const height = parseInt(e.target.dataset.height);
        this.updateConfig({ width, height });
        this.updateSizeInputs();
      });
    });
    const dimensionPairs = [
      { input: 'door-width', slider: 'door-width-slider', prop: 'width' },
      { input: 'door-height', slider: 'door-height-slider', prop: 'height' },
    ];
    dimensionPairs.forEach((pair) => {
      const inputEl = document.getElementById(pair.input);
      const sliderEl = document.getElementById(pair.slider);
      if (inputEl && sliderEl) {
        inputEl.addEventListener('change', (e) => {
          const val = parseInt(e.target.value);
          sliderEl.value = val;
          this.updateConfig({ [pair.prop]: val });
          this.updateGlassLimits();
        });
        sliderEl.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          inputEl.value = val;
          this.updateConfig({ [pair.prop]: val });
          this.updateGlassLimits();
        });
      }
    });
    const thicknessEl = document.getElementById('door-thickness');
    if (thicknessEl) thicknessEl.addEventListener('change', (e) => this.updateConfig({ thickness: parseInt(e.target.value) }));
    ['door-material', 'hinge-type', 'lock-type'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => this.handleConfigChange());
    });
    document.querySelectorAll('.finish-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.updateConfig({ finish: e.target.dataset.finish });
        this.rerenderPanels();
      });
    });
    document.querySelectorAll('.hardware-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.updateConfig({ hardware: e.target.dataset.hardware });
      });
    });
    const glassCheckbox = document.getElementById('has-glass');
    if (glassCheckbox) {
      glassCheckbox.addEventListener('change', (e) => {
        const hasGlass = e.target.checked;
        document.getElementById('glass-options').style.display = hasGlass ? 'block' : 'none';
        if (hasGlass) {
          if (!this.currentConfig.glassWidth) this.currentConfig.glassWidth = Math.min(400, Math.floor(this.currentConfig.width * 0.6));
          if (!this.currentConfig.glassHeight) this.currentConfig.glassHeight = Math.min(600, Math.floor(this.currentConfig.height * 0.6));
          if (!this.currentConfig.glassType) this.currentConfig.glassType = 'clear';
          this.syncGlassInputs();
          this.updateGlassLimits();
        }
        this.updateConfig({
          hasGlass,
          glassWidth: hasGlass ? this.currentConfig.glassWidth : undefined,
          glassHeight: hasGlass ? this.currentConfig.glassHeight : undefined,
          glassType: hasGlass ? this.currentConfig.glassType : undefined,
        });
      });
    }
    const glassPairs = [
      { input: 'glass-width', slider: 'glass-width-slider', prop: 'glassWidth' },
      { input: 'glass-height', slider: 'glass-height-slider', prop: 'glassHeight' },
    ];
    glassPairs.forEach((pair) => {
      const inputEl = document.getElementById(pair.input);
      const sliderEl = document.getElementById(pair.slider);
      if (inputEl && sliderEl) {
        inputEl.addEventListener('change', (e) => {
          const val = parseInt(e.target.value);
          sliderEl.value = val;
          this.updateConfig({ [pair.prop]: val });
        });
        sliderEl.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          inputEl.value = val;
          this.updateConfig({ [pair.prop]: val });
        });
      }
    });
    document.querySelectorAll('.glass-type-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.updateConfig({ glassType: e.target.dataset.glassType });
      });
    });
  }
  handleConfigChange() {
    const newConfig = {
      material: document.getElementById('door-material')?.value || this.currentConfig.material,
      hingeType: document.getElementById('hinge-type')?.value || this.currentConfig.hingeType,
      lockType: document.getElementById('lock-type')?.value || this.currentConfig.lockType,
    };
    this.updateConfig(newConfig);
  }
  handleGlassChange() {
    if (!this.currentConfig.hasGlass) return;
    const glassWidth = parseInt(document.getElementById('glass-width')?.value) || this.currentConfig.glassWidth;
    const glassHeight = parseInt(document.getElementById('glass-height')?.value) || this.currentConfig.glassHeight;
    this.updateConfig({ glassWidth, glassHeight });
    this.syncGlassInputs();
  }
  updateConfig(changes) {
    if (changes.hasGlass === true && !changes.glassWidth && !this.currentConfig.glassWidth) {
      changes.glassWidth = Math.min(400, Math.floor(this.currentConfig.width * 0.6));
      changes.glassHeight = Math.min(600, Math.floor(this.currentConfig.height * 0.6));
      changes.glassType = changes.glassType || this.currentConfig.glassType || 'clear';
    }
    this.currentConfig = { ...this.currentConfig, ...changes };
    this.onConfigChanged(this.currentConfig);
    this.updatePrice();
    this.updateActiveStates();
  }
  updateSizeInputs() {
    this.syncInputs('door-width', 'door-width-slider', this.currentConfig.width);
    this.syncInputs('door-height', 'door-height-slider', this.currentConfig.height);
  }
  syncInputs(inputId, sliderId, value) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    if (input) input.value = value;
    if (slider) slider.value = value;
  }
  syncGlassInputs() {
    this.syncInputs('glass-width', 'glass-width-slider', this.currentConfig.glassWidth);
    this.syncInputs('glass-height', 'glass-height-slider', this.currentConfig.glassHeight);
  }
  updateGlassLimits() {
    const maxGlassWidth = Math.floor(this.currentConfig.width * 0.7);
    const maxGlassHeight = Math.floor(this.currentConfig.height * 0.8);
    ['glass-width', 'glass-width-slider'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.max = maxGlassWidth;
    });
    ['glass-height', 'glass-height-slider'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.max = maxGlassHeight;
    });
  }
  updateActiveStates() {
    document.querySelectorAll('.size-option').forEach((btn) => {
      btn.classList.toggle(
        'active',
        parseInt(btn.dataset.width) === this.currentConfig.width && parseInt(btn.dataset.height) === this.currentConfig.height
      );
    });
    document.querySelectorAll('.finish-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.finish === this.currentConfig.finish);
    });
    document.querySelectorAll('.hardware-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.hardware === this.currentConfig.hardware);
    });
    document.querySelectorAll('.glass-type-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.glassType === this.currentConfig.glassType);
    });
  }
  rerenderPanels() {
    this.renderConfigPanels();
  }
  updatePrice() {
    const validation = ConfigurationValidator.validate(this.currentDoor, this.currentConfig);
    const totalPrice = (this.currentDoor.basePrice || 299) + (validation.additionalCosts || 0);
    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay) priceDisplay.textContent = totalPrice;
  }
  formatMaterialName(material) {
    const names = {
      oak: 'Oak Wood',
      pine: 'Pine Wood',
      mahogany: 'Mahogany (+£120)',
      walnut: 'Walnut (+£150)',
    };
    return names[material] || material.charAt(0).toUpperCase() + material.slice(1);
  }
  formatFinishName(finish) {
    const names = {
      natural: 'Natural',
      stained: 'Stained (+£15)',
      painted: 'Painted (+£25)',
    };
    return names[finish] || finish.charAt(0).toUpperCase() + finish.slice(1);
  }
  formatHardwareName(hardware) {
    const names = {
      'brass-traditional': 'Traditional Brass',
      'chrome-traditional': 'Traditional Chrome',
      'black-traditional': 'Traditional Black',
      'chrome-modern': 'Modern Chrome',
      'black-modern': 'Modern Black',
      'brass-modern': 'Modern Brass',
      'black-rustic': 'Rustic Black',
    };
    return names[hardware] || hardware;
  }
  formatGlassTypeName(type) {
    const names = {
      clear: 'Clear Glass',
      frosted: 'Frosted Glass',
      decorative: 'Decorative Glass',
      'georgian-bars': 'Georgian Bars',
    };
    return names[type] || type;
  }
}
