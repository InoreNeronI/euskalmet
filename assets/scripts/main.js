// Import only the Bootstrap components we need
import Dropdown from 'bootstrap/js/src/dropdown';
import './theme';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((dropdown) => Dropdown.getOrCreateInstance(dropdown, {}));
});
