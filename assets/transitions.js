document.addEventListener('DOMContentLoaded', function () {
  barba.init({
    sync: true,
    debug: true,
    transitions: [
      {
        async leave(data) {
          const done = this.async();
          pageTrans();
          pageOut();
          await delay(500);
          done();
        },
        async enter(data) {
          pageIn();
        },
        async once(data) {
          pageIn();
        },
      },
    ],
    views: [
      {
        namespace: 'home',
        beforeEnter(data) {
          console.log('Entering home page');
        },
      },
      {
        namespace: 'pdp',
        beforeEnter(data) {
          console.log('Entering product page');
        },
      },
    ],
  });

  barba.hooks.enter(() => {
    window.scrollTo(0, 0);
  });

  barba.hooks.leave(() => {
    window.scrollTo(0, 0);
  });

  if (window.document.documentMode) {
    barba.destroy();
  }
});

const delay = (t) => {
  return new Promise((resolve) => setTimeout(resolve, t));
};

const pageIn = () => {
  const tl = gsap.timeline({
    ease: 'expo.inOut',
  });
  tl.set('.content', {
    opacity: 1,
  }).to('.content', {
    duration: 0.5,
    opacity: 1,
    delay: 0.1,
  });
};

const pageTrans = () => {
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
    .set('.trans-pane', {
      display: 'none',
    });
};

const pageOut = () => {
  const tl = gsap.timeline({
    ease: 'expo.inOut',
  });
  tl.to('.content', {
    duration: 0.5,
    opacity: 0,
  });
};
