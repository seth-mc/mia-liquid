// header-toggle.js

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const slideMenu = document.getElementById('slideMenu');
  const cartCount = document.getElementById('cart-count');
  const dynamicLinks = document.getElementById('dynamicLinks');
  let isOpen = false;

  // Function to trigger header animation
  const animateHeader = () => {
    header.classList.add('header-visible');
  };

  // Call the function to animate the header
  animateHeader();

  // Function to add brackets dynamically
  const addBrackets = () => {
    const links = dynamicLinks.querySelectorAll('span[data-link]');
    links.forEach((link) => {
      const text = link.textContent;
      link.textContent = `[${text}]`;
    });
  };

  // Call the function to add brackets
  addBrackets();

  const openMenu = () => {
    slideMenu.style.maxHeight = `${slideMenu.scrollHeight}px`;
    isOpen = true;
  };

  const closeMenu = () => {
    slideMenu.style.maxHeight = '0px';
    isOpen = false;
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleClickOutside = (event) => {
    if (
      isOpen &&
      !header.contains(event.target) &&
      !slideMenu.contains(event.target)
    ) {
      closeMenu();
    }
  };

  const handleSlideMenuClick = (event) => {
    event.stopPropagation();
  };

  hamburger.addEventListener('click', toggleMenu);
  document.addEventListener('click', handleClickOutside);
  slideMenu.addEventListener('click', handleSlideMenuClick);

  // Optional: Close menu on escape key press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });
});
