// user-profile.js

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56",
  measurementId: "G-98Q3927PHZ"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Elements
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const addressInput = document.getElementById("addressInput");
const dobInput = document.getElementById("dobInput");
const saveBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveStatus = document.getElementById("saveStatus");

// Load dữ liệu khi user login
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html"; // chưa login → về trang chủ
    return;
  }

  // Load user info từ Firestore
  const docRef = db.collection("users").doc(user.uid);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const data = docSnap.data();
    nameInput.value = data.name || "";
    emailInput.value = data.email || user.email;
    phoneInput.value = data.phone || "";
    addressInput.value = data.address || "";
    dobInput.value = data.dob || "";
    avatarPreview.src = data.avatar || "images/logo-default.png";
  } else {
    emailInput.value = user.email;
  }
});

// Preview avatar khi chọn file
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => avatarPreview.src = e.target.result;
  reader.readAsDataURL(file);
});

// Lưu thông tin & avatar
saveBtn.addEventListener("click", async () => {
  saveStatus.style.color = "black";
  saveStatus.innerText = "Đang lưu...";

  const user = auth.currentUser;
  if (!user) {
    saveStatus.style.color = "red";
    saveStatus.innerText = "Bạn chưa đăng nhập!";
    return;
  }

  let avatarURL = avatarPreview.src;

  try {
    // Upload avatar nếu có file mới
    if (avatarInput.files[0]) {
      const file = avatarInput.files[0];
      const storageRef = storage.ref(`avatars/${user.uid}`);
      await storageRef.put(file);
      avatarURL = await storageRef.getDownloadURL();
    }

    const userData = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      address: addressInput.value,
      dob: dobInput.value,
      avatar: avatarURL
    };

    await db.collection("users").doc(user.uid).set(userData);

    saveStatus.style.color = "green";
    saveStatus.innerText = "Đã lưu thông tin!";
  } catch (err) {
    saveStatus.style.color = "red";
    saveStatus.innerText = "Lỗi: " + err.message;
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});
