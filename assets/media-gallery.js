class MediaGallery extends HTMLElement {
  constructor() {
    super();
    this.emblaNode = this;
    this.viewportNode = this.querySelector('.embla__viewport');
    this.prevBtnNode = this.querySelector('.embla__button--prev');
    this.nextBtnNode = this.querySelector('.embla__button--next');
    this.dotsNode = this.querySelector('.embla__dots');

    this.style.width = '100%';
    this.style.height = '100%';

    if (typeof EmblaCarousel !== 'undefined') {
      this.init();
    } else {
      window.addEventListener('load', () => this.init());
    }
  }

  connectedCallback() {
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
  }

  updateSize() {
    const containerWidth = this.offsetWidth;
    const containerHeight = this.offsetHeight;

    this.style.width = `${containerWidth}px`;
    this.style.height = `${containerHeight}px`;

    const viewport = this.querySelector('.embla__viewport');
    if (viewport) {
      viewport.style.width = `${containerWidth}px`;
      viewport.style.height = `${containerHeight}px`;
    }

    // Force update on Embla if it's initialized
    if (this.emblaApi) {
      this.emblaApi.reInit();
    }
  }

  init() {
    const OPTIONS = { loop: true };
    const PLUGINS = [EmblaCarouselAutoplay()];
    this.emblaApi = EmblaCarousel(this.viewportNode, OPTIONS, PLUGINS);
    this.setupPrevNextBtns();
    this.setupDotBtns();

    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());

    this.emblaApi.on('destroy', () => {
      this.removePrevNextBtnsClickHandlers();
      this.removeDotBtnsAndClickHandlers();
    });
  }

  setupPrevNextBtns() {
    const scrollPrev = () => {
      this.emblaApi.scrollPrev();
    };
    const scrollNext = () => {
      this.emblaApi.scrollNext();
    };
    this.prevBtnNode.addEventListener('click', scrollPrev, false);
    this.nextBtnNode.addEventListener('click', scrollNext, false);

    const togglePrevNextBtnsState = () => {
      const canScrollPrev = this.emblaApi.canScrollPrev();
      const canScrollNext = this.emblaApi.canScrollNext();
      if (canScrollPrev) this.prevBtnNode.removeAttribute('disabled');
      else this.prevBtnNode.setAttribute('disabled', 'disabled');
      if (canScrollNext) this.nextBtnNode.removeAttribute('disabled');
      else this.nextBtnNode.setAttribute('disabled', 'disabled');
    };

    this.emblaApi
      .on('select', togglePrevNextBtnsState)
      .on('init', togglePrevNextBtnsState)
      .on('reInit', togglePrevNextBtnsState);

    this.removePrevNextBtnsClickHandlers = () => {
      this.prevBtnNode.removeEventListener('click', scrollPrev, false);
      this.nextBtnNode.removeEventListener('click', scrollNext, false);
    };
  }

  setupDotBtns() {
    let dotNodes = [];

    const addDotBtnsWithClickHandlers = () => {
      const scrollSnaps = this.emblaApi.scrollSnapList();
      this.dotsNode.innerHTML = scrollSnaps
        .map(() => '<button class="embla__dot" type="button"></button>')
        .join('');

      dotNodes = Array.from(this.dotsNode.querySelectorAll('.embla__dot'));
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener(
          'click',
          () => {
            this.emblaApi.scrollTo(index);
          },
          false,
        );
      });
    };

    const toggleDotBtnsActive = () => {
      const previous = this.emblaApi.previousScrollSnap();
      const selected = this.emblaApi.selectedScrollSnap();
      dotNodes[previous]?.classList.remove('embla__dot--selected');
      dotNodes[selected]?.classList.add('embla__dot--selected');
    };

    this.emblaApi
      .on('init', addDotBtnsWithClickHandlers)
      .on('reInit', addDotBtnsWithClickHandlers)
      .on('init', toggleDotBtnsActive)
      .on('reInit', toggleDotBtnsActive)
      .on('select', toggleDotBtnsActive);

    this.removeDotBtnsAndClickHandlers = () => {
      this.dotsNode.innerHTML = '';
    };
  }

  updateSize() {
    const containerWidth = this.offsetWidth;
    const containerHeight = this.offsetHeight;
    // Update embla instance if necessary
    if (this.emblaApi) {
      this.emblaApi.reInit();
    }
  }
}

customElements.define('media-gallery', MediaGallery);

// Add this CSS to your theme's stylesheet or in a <style> tag in your HTML
const style = document.createElement('style');
style.textContent = `
  .embla {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    width: 100%;
    height: 100%;
  }
  .embla__viewport {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .embla__container {
    display: flex;
    height: 100%;
  }
  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;
  }
  .product-media-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: 100%; 
  }
  .product-media__image,
  .product-media__preview-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .embla__button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #2A55EB;
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .embla__button--prev {
    left: 10px;
  }
  .embla__button--next {
    right: 10px;
  }
  .embla__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.embla__dot {
  width: 5px;
  height: 5px;
  background: #2A55EB;
  margin: 0 5px;
  padding: 0;
  cursor: pointer;
  border: none;
  transition: 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.embla__dot--selected {
  width: 10px;
  height: 10px;
  transition: 0.3s;
  background: #2A55EB;
}
`;
document.head.appendChild(style);
