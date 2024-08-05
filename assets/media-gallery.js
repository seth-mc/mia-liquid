class MediaGallery extends HTMLElement {
  constructor() {
    super();
    this.emblaNode = this;
    this.viewportNode = this.querySelector('.embla__viewport');
    this.prevBtnNode = this.querySelector('.embla__button--prev');
    this.nextBtnNode = this.querySelector('.embla__button--next');
    this.dotsNode = this.querySelector('.embla__dots');

    console.log('MediaGallery constructed');
    console.log('Viewport node:', this.viewportNode);
    console.log('Prev button:', this.prevBtnNode);
    console.log('Next button:', this.nextBtnNode);
    console.log('Dots node:', this.dotsNode);

    if (typeof EmblaCarousel !== 'undefined') {
      this.init();
    } else {
      console.log('EmblaCarousel not available, waiting for load event');
      window.addEventListener('load', () => this.init());
    }
  }

  init() {
    console.log('Initializing MediaGallery');
    console.log('EmblaCarousel available:', typeof EmblaCarousel);
    console.log('Viewport node HTML:', this.viewportNode.outerHTML);

    const OPTIONS = { loop: true };
    const PLUGINS = [EmblaCarouselAutoplay()];
    this.emblaApi = EmblaCarousel(this.viewportNode, OPTIONS, PLUGINS);

    console.log('Embla initialized:', this.emblaApi);
    console.log('Number of slides:', this.emblaApi.slideNodes().length);
    console.log('Slide nodes:', this.emblaApi.slideNodes());

    this.setupPrevNextBtns();
    this.setupDotBtns();

    this.emblaApi.on('destroy', () => {
      console.log('Embla destroy event triggered');
      this.removePrevNextBtnsClickHandlers();
      this.removeDotBtnsAndClickHandlers();
    });

    this.emblaApi.on('select', () => {
      console.log('Slide changed to:', this.emblaApi.selectedScrollSnap());
    });
  }

  setupPrevNextBtns() {
    console.log('Setting up prev/next buttons');
    const scrollPrev = () => {
      console.log('Scrolling to previous slide');
      this.emblaApi.scrollPrev();
    };
    const scrollNext = () => {
      console.log('Scrolling to next slide');
      this.emblaApi.scrollNext();
    };
    this.prevBtnNode.addEventListener('click', scrollPrev, false);
    this.nextBtnNode.addEventListener('click', scrollNext, false);

    const togglePrevNextBtnsState = () => {
      const canScrollPrev = this.emblaApi.canScrollPrev();
      const canScrollNext = this.emblaApi.canScrollNext();
      console.log('Can scroll prev:', canScrollPrev);
      console.log('Can scroll next:', canScrollNext);
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
    console.log('Setting up dot buttons');
    let dotNodes = [];

    const addDotBtnsWithClickHandlers = () => {
      const scrollSnaps = this.emblaApi.scrollSnapList();
      console.log('Scroll snaps:', scrollSnaps);
      this.dotsNode.innerHTML = scrollSnaps
        .map(() => '<button class="embla__dot" type="button"></button>')
        .join('');

      dotNodes = Array.from(this.dotsNode.querySelectorAll('.embla__dot'));
      console.log('Dot nodes created:', dotNodes.length);
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener(
          'click',
          () => {
            console.log('Dot clicked:', index);
            this.emblaApi.scrollTo(index);
          },
          false,
        );
      });
    };

    const toggleDotBtnsActive = () => {
      const previous = this.emblaApi.previousScrollSnap();
      const selected = this.emblaApi.selectedScrollSnap();
      console.log('Previous slide:', previous);
      console.log('Selected slide:', selected);
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
}

customElements.define('media-gallery', MediaGallery);

// Add this CSS to your theme's stylesheet or in a <style> tag in your HTML
const style = document.createElement('style');
style.textContent = `
  .embla {
    position: relative;
  }
  .embla__viewport {
    overflow: hidden;
  }
  .embla__container {
    display: flex;
  }
  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
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
