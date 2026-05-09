// user.js - quản lý thông tin người dùng
document.addEventListener("DOMContentLoaded", function(){

  const auth = firebase.auth();

  // ELEMENTS
  const userInfoPreview = document.getElementById("userInfoPreview");
  const userAvatarPreview = document.getElementById("sidebarUserAvatarPreview");
  const userNamePreview = document.getElementById("sidebarUserNamePreview");

  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authMessage = document.getElementById("authMessage");
  const authRegisterBtn = document.getElementById("authRegisterBtn");
  const authLoginBtn = document.getElementById("authLoginBtn");
  const authModal = document.getElementById("authModal");

  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const products = document.getElementById("products");

  // Hàm cập nhật sidebar user info
  function updateUserUI(user){
    if(user){
      loginLink.style.display = "none";
      logoutLink.style.display = "block";
      userInfoPreview.style.display = "block";
      userAvatarPreview.src = user.photoURL || "https://via.placeholder.com/40";
      userNamePreview.innerText = user.displayName || user.email || "Người dùng";
      if(products) products.style.display = "grid";
    } else {
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      userInfoPreview.style.display = "none";
      if(products) products.style.display = "none";
    }
  }

  // REGISTER với nhập tên + avatar tùy chỉnh
  authRegisterBtn.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();

    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    // Prompt user nhập tên + avatar
    let displayName = prompt("Nhập tên hiển thị của bạn:", email.split("@")[0]);
    if(!displayName) displayName = email.split("@")[0];
    let photoURL = prompt("Nhập URL avatar (để trống nếu muốn mặc định):", "https://via.placeholder.com/40");
    if(!photoURL) photoURL = "https://via.placeholder.com/40";

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
      const user = userCredential.user;
      await user.updateProfile({ displayName, photoURL });

      authMessage.style.color = "green";
      authMessage.innerText = "Đăng ký thành công!";
      authEmail.value = ""; 
      authPassword.value = "";
      authModal.style.display = "none";

      updateUserUI(user); // cập nhật sidebar ngay lập tức
    } catch(err) {
      authMessage.style.color = "red";
      authMessage.innerText = err.message;
    }
  });

  // LOGIN
  authLoginBtn.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();

    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, pass);
      const user = userCredential.user;

      authMessage.style.color = "green";
      authMessage.innerText = "Đăng nhập thành công!";
      authModal.style.display = "none";

      updateUserUI(user); // cập nhật sidebar ngay lập tức
    } catch(err) {
      authMessage.style.color = "red";
      authMessage.innerText = err.message;
    }
  });

  // LOGOUT
  logoutLink.addEventListener("click", async () => {
    try {
      await auth.signOut();
      updateUserUI(null);
    } catch(err) {
      console.error("Logout error:", err);
    }
  });

  // AUTH STATE CHANGE
  auth.onAuthStateChanged(user => {
    updateUserUI(user);
  });

});
