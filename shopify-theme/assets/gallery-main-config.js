// Show footer only after entering gallery
// Uses window._SS bridge exposed by gallery-main.js (ES module)
const ssFooter = document.getElementById('ss-footer');
const showFooterObserver = setInterval(() => {
  const ss = window._SS;
  if (!ss) return;
  if (ss.entered && !ss.gridActive && ss.productModal.style.display !== 'flex') {
    ssFooter.style.display = 'block';
  } else if (ss.productModal.style.display === 'flex' || ss.gridActive) {
    ssFooter.style.display = 'none';
  }
}, 500);
