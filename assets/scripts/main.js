// Import only the Bootstrap components we need
import Collapse from 'bootstrap/js/src/collapse';
import Dropdown from 'bootstrap/js/src/dropdown';
import Modal from 'bootstrap/js/src/modal';
import './theme';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((collapse) => Collapse.getOrCreateInstance(collapse, {}));
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((dropdown) => Dropdown.getOrCreateInstance(dropdown, {}));
  document.querySelectorAll('[data-bs-toggle="modal"]').forEach((modal) => Modal.getOrCreateInstance(modal, { backdrop: false }));
  // @see https://stackoverflow.com/a/42401686
  const menuBrand = document.querySelector('.navbar-brand');
  const menuFilesCollapse = Dropdown.getOrCreateInstance(document.getElementById('dropdownFilesButton'));
  menuBrand.addEventListener('click', () => menuFilesCollapse.toggle());

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
    menuBrand.style.top = '0.1rem';
    menuToggler.style.position = 'absolute';
    menuToggler.style.right = '0.75rem';
    menuToggler.style.top = '0.4rem';
  });
});
