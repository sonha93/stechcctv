// comenter.js
// ============================
// JS hoàn chỉnh: đánh giá & bình luận
// ============================

// Dữ liệu đánh giá ban đầu
let reviews = [
  { name: "Nguyễn A", rating: 4, comment: "Sản phẩm tốt, giao nhanh" },
  { name: "Trần B", rating: 5, comment: "Mình rất hài lòng" }
];

// Tạo container chính
const reviewsContainer = document.createElement('div');
reviewsContainer.id = "reviews-container";
document.body.appendChild(reviewsContainer);

// Hàm render danh sách đánh giá
function renderReviews() {
  reviewsContainer.innerHTML = `
    <h3>Đánh giá khách hàng</h3>
    <div id="reviews-list">
      ${reviews.map(r => `
        <div class="review">
          <strong>${r.name}:</strong> ${"⭐".repeat(r.rating)}<br>
          "${r.comment}"
        </div>
      `).join('')}
    </div>

    <h4>Viết đánh giá của bạn</h4>
    <input type="text" id="review-name" placeholder="Tên của bạn" style="width: 100%; margin-bottom: 5px;"><br>
    <label>Đánh giá: </label>
    <select id="review-rating">
      <option value="5">5 ⭐</option>
      <option value="4">4 ⭐</option>
      <option value="3">3 ⭐</option>
      <option value="2">2 ⭐</option>
      <option value="1">1 ⭐</option>
    </select><br><br>
    <textarea id="review-comment" placeholder="Bình luận của bạn" style="width: 100%; height: 60px;"></textarea><br>
    <button id="review-submit">Gửi đánh giá</button>
  `;

  // Xử lý nút gửi
  document.getElementById("review-submit").onclick = () => {
    const name = document.getElementById("review-name").value.trim();
    const rating = parseInt(document.getElementById("review-rating").value);
    const comment = document.getElementById("review-comment").value.trim();

    if (!name || !comment) {
      alert("Vui lòng nhập tên và bình luận!");
      return;
    }

    // Thêm đánh giá mới
    reviews.push({ name, rating, comment });

    // Reset form
    document.getElementById("review-name").value = "";
    document.getElementById("review-comment").value = "";
    document.getElementById("review-rating").value = 5;

    // Render lại danh sách
    renderReviews();
  };
}

// Thêm CSS trực tiếp bằng JS
const style = document.createElement('style');
style.innerHTML = `
  #reviews-container { padding: 10px; font-family: Arial, sans-serif; max-width: 600px; margin: auto; }
  .review { margin-bottom: 10px; background: #f0f0f0; padding: 8px; border-radius: 5px; }
  #review-submit { padding: 6px 15px; background: #00bcd4; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
  #review-submit:hover { background: #0097a7; }
  input, select, textarea { padding: 6px; margin-bottom: 5px; border-radius: 4px; border: 1px solid #ccc; }
  h3, h4 { margin-top: 15px; }
`;
document.head.appendChild(style);

// Render lần đầu
renderReviews();