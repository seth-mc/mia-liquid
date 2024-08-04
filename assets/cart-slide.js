const PubSub = {
  events: {},
  subscribe: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  unsubscribe: function (eventName, fn) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter((f) => f !== fn);
    }
  },
  publish: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => fn(data));
    }
  },
};

class CartSlideOut extends HTMLElement {
  constructor() {
    super();
    this.cartCount = document.getElementById('cart-count');
    this.cartTotal = document.getElementById('cart-total');
    this.liveRegion = document.getElementById('cart-live-region-text');
    this.debouncedOnChange = this.debounce(this.onChange.bind(this), 300);
  }

  connectedCallback() {
    this.cartSlideMenu = this.querySelector('#cartSlideMenu');
    this.cartToggle = document.getElementById('cart-toggle');
    this.bindEvents();

    PubSub.subscribe('cartUpdate', this.onCartUpdate.bind(this));
  }

  disconnectedCallback() {
    PubSub.unsubscribe('cartUpdate', this.onCartUpdate.bind(this));
  }

  bindEvents() {
    if (this.cartToggle) {
      this.cartToggle.addEventListener('click', this.toggleCartMenu.bind(this));
    }
    this.addEventListener('click', this.handleQuantityChanges.bind(this));
    this.addEventListener('change', this.debouncedOnChange);
  }

  toggleCartMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.cartSlideMenu) {
      if (
        this.cartSlideMenu.style.maxHeight === '0px' ||
        this.cartSlideMenu.style.maxHeight === ''
      ) {
        this.cartSlideMenu.style.maxHeight = `${this.cartSlideMenu.scrollHeight}px`;
      } else {
        this.cartSlideMenu.style.maxHeight = '0px';
      }
    } else {
      console.error('cartSlideMenu not found');
    }
  }

  handleQuantityChanges(event) {
    if (event.target.classList.contains('quantity-adjust')) {
      const button = event.target;
      const action = button.dataset.action;
      const itemKey = button.dataset.item;
      const input = this.querySelector(`input[data-item="${itemKey}"]`);
      let quantity = parseInt(input.value);

      if (action === 'increase') {
        quantity++;
      } else if (action === 'decrease' && quantity > 0) {
        quantity--;
      }

      input.value = quantity;
      this.updateCartItem(itemKey, quantity);
    } else if (event.target.classList.contains('remove-item')) {
      const itemKey = event.target.dataset.item;
      this.updateCartItem(itemKey, 0);
    }
  }

  onChange(event) {
    if (event.target.name === 'updates[]') {
      const itemKey = event.target.dataset.item;
      const quantity = parseInt(event.target.value);
      this.updateCartItem(itemKey, quantity);
    }
  }

  updateCartItem(itemKey, quantity) {
    this.enableLoading(itemKey);

    fetch(`${routes.cart_change_url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: itemKey,
        quantity: quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.updateCartCount(data.item_count);
        this.renderCartItems(data);
        PubSub.publish('cartUpdate', data);
      })
      .catch((error) => {
        console.error('Error:', error);
        this.setLiveRegionText('Error updating cart. Please try again.');
      })
      .finally(() => {
        this.disableLoading(itemKey);
      });
  }

  updateCartCount(count) {
    console.log(count);
    this.cartCount.textContent = `(${count})`;
  }

  renderCartItems(cartData) {
    console.log('Before updating cart total:', this.cartTotal.innerHTML);
    console.log('cartData.total_price:', cartData.total_price);

    this.getSectionsToRender().forEach((section) => {
      const elementToUpdate = document.getElementById(section.id);
      if (elementToUpdate && cartData.sections[section.section]) {
        const newHTML = this.getSectionInnerHTML(
          cartData.sections[section.section],
          section.selector,
        );
        this.updateElementContent(elementToUpdate, newHTML);
      }
    });

    // Update cart total
    if (this.cartTotal) {
      this.cartTotal.innerHTML = cartData.total_price;
    }

    console.log('After updating cart total:', this.cartTotal.innerHTML);

    this.setLiveRegionText('Cart updated.');
  }

  updateElementContent(element, newContent) {
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(newContent, 'text/html');
    const newElement = newDoc.body.firstChild;

    // Update only changed parts
    if (!element.isEqualNode(newElement)) {
      const childNodes = Array.from(newElement.childNodes);
      childNodes.forEach((newChild, index) => {
        const currentChild = element.childNodes[index];
        if (!currentChild || !currentChild.isEqualNode(newChild)) {
          if (currentChild) {
            element.replaceChild(newChild.cloneNode(true), currentChild);
          } else {
            element.appendChild(newChild.cloneNode(true));
          }
        }
      });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'cartSlideMenu',
        section: 'cart-slide-out',
        selector: '#cartSlideMenu',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(itemKey) {
    const item = this.querySelector(`[data-item="${itemKey}"]`);
    if (item) {
      item.classList.add('loading');
    }
  }

  disableLoading(itemKey) {
    const item = this.querySelector(`[data-item="${itemKey}"]`);
    if (item) {
      item.classList.remove('loading');
    }
  }

  setLiveRegionText(text) {
    if (this.liveRegion) {
      this.liveRegion.textContent = text;
      this.liveRegion.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        this.liveRegion.setAttribute('aria-hidden', 'true');
      }, 1000);
    }
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define('cart-slide-out', CartSlideOut);
document.addEventListener('DOMContentLoaded', CartSlideOut.init);
