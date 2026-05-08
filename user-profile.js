// user-profile.js

// ---------------------- Firebase config ----------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ---------------------- ELEMENTS ----------------------
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const addressInput = document.getElementById("addressInput");
const dobInput = document.getElementById("dobInput");
const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveStatus = document.getElementById("saveStatus");

// ---------------------- LOAD USER DATA ----------------------
auth.onAuthStateChanged(user => {
  if(user){
    // Email luôn lấy từ Firebase Auth
    emailInput.value = user.email;

    // Lấy thêm dữ liệu từ Firestore
    const docRef = db.collection("users").doc(user.uid);
    docRef.get().then(doc=>{
      if(doc.exists){
        const data = doc.data();
        nameInput.value = data.name || "";
        phoneInput.value = data.phone || "";
        addressInput.value = data.address || "";
        dobInput.value = data.dob || "";
        avatarPreview.src = data.avatar || "images/logo-default.png";
      }
    });
  } else {
    // Nếu chưa login, redirect về trang login
    window.location.href = "index.html";
  }
});

// ---------------------- AVATAR PREVIEW ----------------------
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = (ev) => {
      avatarPreview.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ---------------------- SAVE USER DATA ----------------------
const saveData = () => {
  const user = auth.currentUser;
  if(!user) return;

  // Xác thực cơ bản
  if(nameInput.value.trim() === "" || phoneInput.value.trim() === ""){
    saveStatus.style.color = "red";
    saveStatus.innerText = "Vui lòng nhập đầy đủ Họ và tên và Số điện thoại!";
    return;
  }

  const userData = {
    name: nameInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
    dob: dobInput.value
  };

  // Upload avatar nếu có chọn
  const uploadAvatar = avatarInput.files[0] 
    ? storage.ref(`avatars/${user.uid}`).put(avatarInput.files[0]) 
    : Promise.resolve();

  uploadAvatar.then(() => {
    if(avatarInput.files[0]){
      storage.ref(`avatars/${user.uid}`).getDownloadURL().then(url => {
        userData.avatar = url;
        db.collection("users").doc(user.uid).set(userData, {merge:true})
          .then(() => {
            saveStatus.style.color = "green";
            saveStatus.innerText = "Đã lưu thành công!";
          })
          .catch(err => {
            saveStatus.style.color = "red";
            saveStatus.innerText = "Lưu thất bại: " + err.message;
          });
      }).catch(err=>{
        saveStatus.style.color="red";
        saveStatus.innerText="Lấy avatar thất bại: "+err.message;
      });
    } else {
      db.collection("users").doc(user.uid).set(userData, {merge:true})
        .then(() => {
          saveStatus.style.color = "green";
          saveStatus.innerText = "Đã lưu thành công!";
        })
        .catch(err => {
          saveStatus.style.color = "red";
          saveStatus.innerText = "Lưu thất bại: " + err.message;
        });
    }
  }).catch(err=>{
    saveStatus.style.color="red";
    saveStatus.innerText = "Upload avatar thất bại: " + err.message;
  });
};

saveBtn.addEventListener("click", saveData);

// ---------------------- LOGOUT ----------------------
logoutBtn.addEventListener("click", ()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
});
