// user-info.js

// Firebase đã được init sẵn trong index.html
const auth = firebase.auth();
const db = firebase.firestore();

// Sidebar elements
const userInfoPreview = document.getElementById("userInfoPreview");
const userAvatarPreview = document.getElementById("sidebarUserAvatarPreview");
const userNamePreview = document.getElementById("sidebarUserNamePreview");

// Sidebar login/logout links
const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");

// Product grid
const products = document.getElementById("products");

// Khi auth state thay đổi
auth.onAuthStateChanged(user => {
  if(user){
    // User logged in
    loginLink.style.display = "none";
    logoutLink.style.display = "block";
    if(products) products.style.display = "grid";

    // Lấy dữ liệu người dùng từ Firestore
    db.collection("users").doc(user.uid).get()
      .then(doc => {
        if(doc.exists){
          const data = doc.data();
          userAvatarPreview.src = data.avatar || "images/logo-default.png";
          userNamePreview.innerText = data.name || "Người dùng";
        } else {
          // Nếu chưa có data, dùng email + avatar mặc định
          userAvatarPreview.src = "images/logo-default.png";
          userNamePreview.innerText = user.email || "Người dùng";
        }
        userInfoPreview.style.display = "block";
      })
      .catch(err => {
        console.error("Lỗi load user info:", err);
        userInfoPreview.style.display = "block";
        userAvatarPreview.src = "images/logo-default.png";
        userNamePreview.innerText = user.email || "Người dùng";
      });
  } else {
    // User logged out
    loginLink.style.display = "block";
    logoutLink.style.display = "none";
    userInfoPreview.style.display = "none";
    if(products) products.style.display = "none";
  }
});

// Click avatar sidebar -> chuyển sang profile
userInfoPreview.addEventListener("click", () => {
  window.location.href = "user-profile.html";
});

// Logout click
if(logoutLink){
  logoutLink.addEventListener("click", () => {
    auth.signOut();
  });
}
