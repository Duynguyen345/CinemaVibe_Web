// ===================================================
// main.js – CinéVibe Interactivity
// ===================================================

/* ---- Navbar scroll effect ---- */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ---- Mobile hamburger menu ---- */
function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.toggle('open');
}

/* ---- FAQ accordion ---- */
function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  // Open clicked (if it wasn't open)
  if (!isOpen) item.classList.add('open');
}

/* ---- Scroll reveal animation ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.movie-card, .benefit-item, .review-card, .pricing-card, .faq-item'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ---- Active nav link highlight ---- */
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
