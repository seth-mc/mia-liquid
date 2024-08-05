document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader');
  const loaderNumber = document.querySelector('.loader__number');
  const loaderProgress = document.querySelector('.loader__progress');
  const loaderQuote = document.querySelector('.loader__quote');
  const loaderImage = document.querySelector('.loader__image');

  let counter = {
    value: 0,
  };

  let loaderDuration = 5;

  function isHomepage() {
    return (
      window.location.pathname === '/' ||
      window.location.pathname === '/index' ||
      window.location.pathname === '/home'
    );
  }

  function shouldShowLoader() {
    return isHomepage() && !sessionStorage.getItem('visited');
  }

  function updateLoaderText() {
    let progress = Math.round(counter.value);
    loaderNumber.textContent = progress;
    loaderProgress.style.width = `${progress}%`;
  }

  function startLoader() {
    if (!shouldShowLoader()) {
      return;
    }

    loader.style.display = 'block';

    gsap.to(counter, {
      value: 100,
      duration: loaderDuration,
      ease: CustomEase.create(
        'custom',
        'M0,0 C0.041,0.081 0.268,0.407 0.47,0.501 0.701,0.608 0.695,1 1,1',
      ),
      onUpdate: updateLoaderText,
      onComplete: () => {
        gsap.to(loader, {
          duration: 0.5,
          opacity: 0,
          onComplete: () => {
            loader.style.display = 'none';
            sessionStorage.setItem('visited', 'true');
          },
        });
      },
    });

    gsap.from(loaderQuote, {
      x: 100,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      delay: 0.5,
    });

    if (window.innerWidth >= 768) {
      gsap.from(loaderImage, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 0.5,
      });
    }
  }

  // Check if GSAP and CustomEase are loaded before starting the loader
  function checkGSAP() {
    if (window.gsap && window.CustomEase) {
      startLoader();
    } else {
      setTimeout(checkGSAP, 50);
    }
  }

  checkGSAP();
});

// Add these functions for page transitions (similar to the example you provided)
function delay(t) {
  t = t || 1000;
  return new Promise(function (done) {
    setTimeout(function () {
      done();
    }, t);
  });
}

function pageIn() {
  const tl = gsap.timeline({
    ease: 'expo.inOut',
  });
  tl.set('.content', {
    opacity: 1,
  }).to(
    '.content',
    {
      duration: 0.5,
      opacity: 1,
    },
    0.1,
  );
}

function pageTrans() {
  const tl = gsap.timeline();
  tl.set('.trans-pane', {
    x: '-100%',
    display: 'block',
  })
    .to('.trans-pane', {
      duration: 0.3,
      x: 0,
      stagger: 0.1,
    })
    .to('.trans-pane', {
      duration: 0.3,
      x: '100%',
      stagger: 0.1,
    })
    .set('.trans-pane', { display: 'none' });
}

function pageOut() {
  const tl = gsap.timeline({
    ease: 'expo.inOut',
  });
  tl.to('.content', {
    duration: 0.5,
    opacity: 0,
  });
}
