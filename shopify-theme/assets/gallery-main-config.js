// Show footer only when inside gallery (not in grid view or product modal)
// Event-driven instead of 500ms polling
const ssFooter = document.getElementById('ss-footer');

function updateFooter() {
  const ss = window._SS;
  if (!ss) return;
  if (ss.entered && !ss.gridActive && ss.productModal.style.display !== 'flex') {
    ssFooter.style.display = 'block';
  } else {
    ssFooter.style.display = 'none';
  }
}

// Listen for state changes that affect footer visibility
document.addEventListener('pointerlockchange', updateFooter);
document.addEventListener('click', () => setTimeout(updateFooter, 50));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setTimeout(updateFooter, 50); });
// MutationObserver on product modal display (once _SS is available)
const _waitSS = setInterval(() => {
  if (!window._SS) return;
  clearInterval(_waitSS);
  updateFooter();
  new MutationObserver(updateFooter).observe(window._SS.productModal, { attributes: true, attributeFilter: ['style'] });
}, 200);
