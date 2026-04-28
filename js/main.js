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

/* ---- Fetch Movies from API ---- */
async function fetchTrendingMovies() {
  const movieGrid = document.getElementById('movieGrid');
  if (!movieGrid) return; // Chỉ chạy trên trang chủ

  try {
    const response = await fetch('http://localhost:3000/api/movies/trending');
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      movieGrid.innerHTML = ''; // Xoá chữ "Đang tải"
      
      result.data.forEach(movie => {
        // Xử lý huy hiệu
        let badgeHtml = '';
        if (movie.is_hot) {
          badgeHtml = '<span class="badge badge-hot">🔥 Xu hướng</span>';
        } else if (movie.year === new Date().getFullYear()) {
          badgeHtml = '<span class="badge badge-new">✨ Mới</span>';
        }

        const card = document.createElement('div');
        card.className = 'movie-card reveal revealed';
        card.innerHTML = `
          <div class="movie-poster">
            <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='https://placehold.co/300x450/1a1f30/ffffff?text=CinéVibe'" />
            <div class="movie-overlay">
              ${badgeHtml}
              <button class="play-btn" aria-label="Xem ngay">▶</button>
            </div>
            <div class="movie-rating">⭐ ${movie.rating}</div>
          </div>
          <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>${movie.genre} · ${movie.year}</p>
          </div>
        `;
        movieGrid.appendChild(card);
      });
    } else {
      movieGrid.innerHTML = '<div style="text-align:center; padding: 40px; color: #aaa; grid-column: 1 / -1;">Không có dữ liệu phim.</div>';
    }
  } catch (error) {
    console.error('Lỗi khi tải phim:', error);
    movieGrid.innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b; grid-column: 1 / -1;">Lỗi kết nối tới máy chủ. Vui lòng kiểm tra lại Backend.</div>';
  }
}

// Gọi hàm khi trang load xong
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
} else {
  fetchTrendingMovies();
}
