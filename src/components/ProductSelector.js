import { doorCatalog } from '../data/doorCatalog.js';

export class ProductSelector {
  constructor(onDoorSelected) {
    this.onDoorSelected = onDoorSelected;
    this.searchTerm = '';
  }
  render() {
    const container = document.getElementById('door-categories');
    const searchInput = document.getElementById('door-search');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.filterAndRender();
    });
    this.renderCategories(container);
    this.attachEventListeners();
  }
  renderCategories(container) {
    let html = '';
    Object.entries(doorCatalog).forEach(([categoryId, category]) => {
      const filteredDoors = this.filterDoors(category.doors);
      if (Object.keys(filteredDoors).length === 0) return;
      html += `<div class="category-section"><h3>${category.name}</h3><p class="category-description">${category.description}</p><div class="door-grid">`;
      Object.entries(filteredDoors).forEach(([doorId, door]) => {
        html += this.renderDoorCard(categoryId, doorId, door);
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }
  renderDoorCard(categoryId, doorId, door) {
    return `<div class="door-card" data-category="${categoryId}" data-door="${doorId}"><div class="door-image"><img src="${door.image || '/door-images/placeholder.png'}" alt="${door.name}" onerror="this.src='/door-images/placeholder.png'"></div><div class="door-info"><h4>${door.name}<svg class="info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1L9,7V9H3V21H21V9H21M12,19C8.7,19 6,16.3 6,13C6,11.4 6.6,10 7.6,8.9L12,13.3L16.4,8.9C17.4,10 18,11.4 18,13C18,16.3 15.3,19 12,19Z"/></svg></h4><p>${door.description}</p>${door.allowsGlass ? '<span class="feature-tag">Glass option available</span>' : ''}<div class="price-info"><span class="price">From £${door.basePrice}</span>${this.getAvailabilityBadge(door)}</div></div></div>`;
  }
  getAvailabilityBadge(door) {
    const hasSpecialOrder = door.availableOptions?.materials?.some(() => false);
    return hasSpecialOrder
      ? '<span class="availability-badge special">Special Order</span>'
      : '<span class="availability-badge standard">In Stock</span>';
  }
  filterDoors(doors) {
    if (!this.searchTerm) return doors;
    const filtered = {};
    Object.entries(doors).forEach(([doorId, door]) => {
      if (
        door.name.toLowerCase().includes(this.searchTerm) ||
        door.description.toLowerCase().includes(this.searchTerm)
      ) {
        filtered[doorId] = door;
      }
    });
    return filtered;
  }
  filterAndRender() {
    const container = document.getElementById('door-categories');
    this.renderCategories(container);
    this.attachEventListeners();
  }
  attachEventListeners() {
    const container = document.getElementById('door-categories');
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    newContainer.addEventListener('click', (e) => {
      const doorCard = e.target.closest('.door-card');
      if (doorCard) this.onDoorSelected(doorCard.dataset.category, doorCard.dataset.door);
    });
  }
}
