// auth.js

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const products = document.getElementById("products"); // div chứa sản phẩm

// Ẩn sản phẩm khi chưa đăng nhập
if(products) products.style.display = "none";

// Đăng ký
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      message.style.color = "green";
      message.innerText = "Đăng ký thành công! 🎉";
      registerForm.reset();
    })
    .catch((error) => {
      message.style.color = "red";
      if(error.code === "auth/email-already-in-use"){
        message.innerText = "Email đã tồn tại! Hãy đăng nhập.";
      } else {
        message.innerText = error.message;
      }
    });
});

// Đăng nhập
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      message.style.color = "green";
      message.innerText = "Đăng nhập thành công! 🎉";
      loginForm.reset();
      registerForm.style.display = "none"; // ẩn form đăng ký
      loginForm.style.display = "none";    // ẩn form đăng nhập
      if(products) products.style.display = "block"; // hiện sản phẩm
    })
    .catch((error) => {
      message.style.color = "red";
      message.innerText = error.message;
    });
});

// Kiểm tra trạng thái đăng nhập
auth.onAuthStateChanged((user) => {
  if(user){
    registerForm.style.display = "none";
    loginForm.style.display = "none";
    if(products) products.style.display = "block";
    console.log("User hiện tại:", user.email);
  } else {
    registerForm.style.display = "block";
    loginForm.style.display = "block";
    if(products) products.style.display = "none";
    console.log("Chưa đăng nhập");
  }
});
