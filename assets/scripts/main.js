// Import only the Bootstrap components we need
import Dropdown from 'bootstrap/js/src/dropdown';
import Tab from 'bootstrap/js/src/tab';
import './theme';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((dropdown) => Dropdown.getOrCreateInstance(dropdown, {}));
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => Tab.getOrCreateInstance(tab, {}));
});
