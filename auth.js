// auth.js

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// Đăng ký
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      message.innerText = "Đăng ký thành công! 🎉";
      registerForm.reset();
    })
    .catch((error) => {
      message.innerText = "Lỗi: " + error.message;
    });
});

// Đăng nhập
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      message.innerText = "Đăng nhập thành công! 🎉";
      loginForm.reset();
      // Bạn có thể redirect user hoặc hiển thị trang mới ở đây
    })
    .catch((error) => {
      message.innerText = "Lỗi: " + error.message;
    });
});

// Kiểm tra trạng thái đăng nhập
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User hiện tại:", user.email);
  } else {
    console.log("Chưa đăng nhập");
  }
});