(() => {
  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    return;
  }

  const measurementId = 'G-R6E061DGN0';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // The Google tag API expects an arguments object in the data layer.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(googleTag);
})();
