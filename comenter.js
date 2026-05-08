// ============================
// comenter.js - Mobile + Pagination
// ============================

// Dữ liệu đánh giá ban đầu (demo)
let reviews = [
  { name: "Nguyễn A", rating: 4, comment: "Sản phẩm tốt, giao nhanh" },
  { name: "Trần B", rating: 5, comment: "Mình rất hài lòng" },
  { name: "Lê C", rating: 3, comment: "Ổn, nhưng giao chậm" },
  { name: "Phạm D", rating: 5, comment: "Rất đẹp, đúng hình" },
  { name: "Hoàng E", rating: 4, comment: "Tạm ổn" },
  { name: "Mai F", rating: 5, comment: "Tuyệt vời" },
  { name: "Quang G", rating: 4, comment: "Hài lòng" }
];

// Pagination
let currentPage = 1;
const reviewsPerPage = 5;

// Tạo container chính
const reviewsContainer = document.createElement('div');
reviewsContainer.id = "reviews-container";
document.body.appendChild(reviewsContainer);

// Render review theo page
function renderReviews() {
  const start = (currentPage - 1) * reviewsPerPage;
  const end = start + reviewsPerPage;
  const pageReviews = reviews.slice(start, end);

  reviewsContainer.innerHTML = `
    <h3>Đánh giá khách hàng</h3>
    <div id="reviews-list">
      ${pageReviews.map(r => `
        <div class="review">
          <strong>${r.name}:</strong> ${"⭐".repeat(r.rating)}<br>
          "${r.comment}"
        </div>
      `).join('')}
    </div>

    <div class="pagination">
      <button id="prev-page" ${currentPage === 1 ? "disabled" : ""}>« Trang trước</button>
      <span>Trang ${currentPage} / ${Math.ceil(reviews.length / reviewsPerPage)}</span>
      <button id="next-page" ${currentPage >= Math.ceil(reviews.length / reviewsPerPage) ? "disabled" : ""}>Trang sau »</button>
    </div>

    <h4>Viết đánh giá của bạn</h4>
    <input type="text" id="review-name" placeholder="Tên của bạn"><br>
    <label>Đánh giá: </label>
    <select id="review-rating">
      <option value="5">5 ⭐</option>
      <option value="4">4 ⭐</option>
      <option value="3">3 ⭐</option>
      <option value="2">2 ⭐</option>
      <option value="1">1 ⭐</option>
    </select><br>
    <textarea id="review-comment" placeholder="Bình luận của bạn"></textarea><br>
    <button id="review-submit">Gửi đánh giá</button>
  `;

  // Pagination buttons
  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) currentPage--;
    renderReviews();
  };
  document.getElementById("next-page").onclick = () => {
    if (currentPage < Math.ceil(reviews.length / reviewsPerPage)) currentPage++;
    renderReviews();
  };

  // Submit review
  document.getElementById("review-submit").onclick = () => {
    const name = document.getElementById("review-name").value.trim();
    const rating = parseInt(document.getElementById("review-rating").value);
    const comment = document.getElementById("review-comment").value.trim();

    if (!name || !comment) { alert("Vui lòng nhập tên và bình luận!"); return; }

    reviews.push({ name, rating, comment });
    document.getElementById("review-name").value = "";
    document.getElementById("review-comment").value = "";
    document.getElementById("review-rating").value = 5;

    // tự nhảy trang cuối để thấy bình luận mới
    currentPage = Math.ceil(reviews.length / reviewsPerPage);
    renderReviews();
  };
}

// CSS mobile + pagination
const style = document.createElement('style');
style.innerHTML = `
  #reviews-container { padding: 15px; font-family: Arial, sans-serif; max-width: 480px; margin: auto; width: 100%; }
  .review { margin-bottom: 12px; background: #f8f8f8; padding: 12px; border-radius: 8px; word-wrap: break-word; font-size: 14px; }
  input, select, textarea { width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px; box-sizing: border-box; }
  #review-submit { width: 100%; padding: 12px; background: #00bcd4; color: #fff; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; margin-top: 5px; }
  #review-submit:hover { background: #0097a7; }
  h3, h4 { margin-top: 15px; font-size: 16px; }
  .pagination { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pagination button { padding: 6px 10px; border: none; border-radius: 5px; background: #eee; cursor: pointer; }
  .pagination button:disabled { opacity: 0.5; cursor: default; }
  .pagination span { font-size: 14px; }
  @media (max-width: 480px) {
    .review { font-size: 13px; padding: 10px; }
    h3, h4 { font-size: 15px; }
    .pagination span { font-size: 13px; }
  }
`;
document.head.appendChild(style);

// Render lần đầu
renderReviews();
