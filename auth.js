

// ==========================
// EMAIL AUTH
// ==========================

// Đăng ký
function register(email, password) {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      console.log("REGISTER OK:", user.user);
      return user.user;
    })
    .catch(err => {
      console.log(err);
    });
}

// Đăng nhập
function login(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
      console.log("LOGIN OK:", user.user);
      return user.user;
    })
    .catch(err => {
      console.log(err);
    });
}

// Logout
function logout() {
  return firebase.auth().signOut();
}

// Listen user
firebase.auth().onAuthStateChanged(user => {
  console.log("AUTH STATE:", user);
});


// ==========================
// PHONE OTP AUTH
// ==========================

let confirmationResult;

// CAPTCHA
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  "recaptcha-container",
  {
    size: "normal"
  }
);

// gửi OTP
function sendOTP() {
  const phoneNumber = document.getElementById("phone").value;

  firebase.auth().signInWithPhoneNumber(
    phoneNumber,
    window.recaptchaVerifier
  )
  .then(result => {
    confirmationResult = result;
    document.getElementById("message").innerText = "OTP đã gửi";
  })
  .catch(error => {
    console.log(error);
    document.getElementById("message").innerText = "Gửi OTP lỗi";
  });
}

// verify OTP
function verifyOTP() {
  const code = document.getElementById("otp").value;

  confirmationResult.confirm(code)
    .then(result => {
      const user = result.user;

      console.log("LOGIN PHONE OK:", user);

      document.getElementById("message").innerText =
        "Đăng nhập OK: " + user.phoneNumber;
    })
    .catch(error => {
      console.log(error);
      document.getElementById("message").innerText = "Sai OTP";
    });
}


// expose ra HTML dùng onclick
window.register = register;
window.login = login;
window.logout = logout;
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
