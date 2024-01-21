// Import only the Bootstrap components we need
import * as Popper from '@popperjs/core/lib';
import Collapse from 'bootstrap/js/src/collapse';
import Dropdown from 'bootstrap/js/src/dropdown';
import Tab from 'bootstrap/js/src/tab';
import './theme';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((collapse) => new Collapse(collapse, {}));
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((dropdown) => new Dropdown(dropdown, {}));
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => new Tab(tab, {}));
  // @see https://stackoverflow.com/a/42401686
  const menuBrand = document.querySelector('.navbar-brand');
  const menuScriptsCollapse = Dropdown.getOrCreateInstance(document.getElementById('dropdownScriptsButton'));
  menuBrand.addEventListener('click', () => menuScriptsCollapse.toggle());
  const menuToggle = document.getElementById('navbarContent');
  const menuToggler = document.querySelector('.navbar-toggler');
  menuToggle.addEventListener('hidden.bs.collapse', () => {
    menuBrand.style.alignSelf = 'unset';
    menuBrand.style.position = 'initial';
    menuBrand.style.top = 'unset';
    menuToggler.style.position = 'initial';
    menuToggler.style.right = 'unset';
    menuToggler.style.top = 'unset';
  });
  menuToggle.addEventListener('show.bs.collapse', () => {
    menuBrand.style.alignSelf = 'start';
    menuBrand.style.position = 'absolute';
    menuBrand.style.top = '0.4rem';
    menuToggler.style.position = 'absolute';
    menuToggler.style.right = '0.75rem';
    menuToggler.style.top = '0.6rem';
  });
});
