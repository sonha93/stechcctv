// auth.js – chuẩn popup sidebar

document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const authModal = document.getElementById("authModal");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authRegisterBtn = document.getElementById("authRegisterBtn");
  const authLoginBtn = document.getElementById("authLoginBtn");
  const closeAuth = document.getElementById("closeAuth");
  const authMessage = document.getElementById("authMessage");
  const products = document.getElementById("products");

  // HIỆN POPUP LOGIN
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    authModal.style.display = "flex";
    authMessage.innerText = "";
  });

  // ĐÓNG POPUP
  closeAuth.addEventListener("click", () => {
    authModal.style.display = "none";
  });

  // ĐĂNG KÝ
  authRegisterBtn.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if (!email || !pass) {
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => {
        authMessage.style.color = "green";
        authMessage.innerText = "Đăng ký thành công! 🎉";
        authEmail.value = "";
        authPassword.value = "";
      })
      .catch(err => {
        authMessage.style.color = "red";
        if (err.code === "auth/email-already-in-use") {
          authMessage.innerText = "Email đã tồn tại! Hãy đăng nhập.";
        } else {
          authMessage.innerText = err.message;
        }
      });
  });

  // ĐĂNG NHẬP
  authLoginBtn.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if (!email || !pass) {
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    auth.signInWithEmailAndPassword(email, pass)
      .then(() => {
        authMessage.style.color = "green";
        authMessage.innerText = "Đăng nhập thành công! 🎉";
        authModal.style.display = "none";
        loginLink.style.display = "none";
        logoutLink.style.display = "block";
        if (products) products.style.display = "grid";
        authEmail.value = "";
        authPassword.value = "";
      })
      .catch(err => {
        authMessage.style.color = "red";
        authMessage.innerText = err.message;
      });
  });

  // ĐĂNG XUẤT
  logoutLink.addEventListener("click", () => {
    auth.signOut().then(() => {
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if (products) products.style.display = "none";
    });
  });

  // KIỂM TRA AUTH STATE
  auth.onAuthStateChanged(user => {
    if (user) {
      loginLink.style.display = "none";
      logoutLink.style.display = "block";
      if (products) products.style.display = "grid";
    } else {
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if (products) products.style.display = "none";
    }
  });
});
