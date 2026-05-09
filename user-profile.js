// user-profile.js
document.addEventListener("DOMContentLoaded", () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
    authDomain: "stech-73b89.firebaseapp.com",
    projectId: "stech-73b89",
    storageBucket: "stech-73b89.appspot.com",
    messagingSenderId: "873739162979",
    appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
  };

  // Initialize Firebase
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // DOM elements
  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const addressInput = document.getElementById("addressInput");
  const dobInput = document.getElementById("dobInput");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const saveStatus = document.getElementById("saveStatus");

  // 1️⃣ Load thông tin user khi vào trang
  auth.onAuthStateChanged(user => {
    if (!user) {
      // Chưa login → quay về trang chủ
      return window.location.href = "index.html";
    }

    // Tên hiển thị từ Firebase Auth
    nameInput.value = user.displayName || "";

    // Lấy thông tin bổ sung từ Firestore
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        phoneInput.value = data.phone || "";
        addressInput.value = data.address || "";
        dobInput.value = data.dob || "";
        if (data.avatarURL) avatarPreview.src = data.avatarURL;
      }
    });
  });

  // 2️⃣ Preview avatar ngay khi chọn file
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => avatarPreview.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  // 3️⃣ Lưu thông tin vào Firebase
  saveProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      saveStatus.style.color = "red";
      saveStatus.innerText = "Chưa đăng nhập!";
      return;
    }

    saveStatus.style.color = "blue";
    saveStatus.innerText = "Đang lưu...";

    try {
      let avatarURL = avatarPreview.src;

      // Upload avatar nếu có thay đổi
      if (avatarInput.files[0]) {
        const storageRef = storage.ref(`avatars/${user.uid}`);
        await storageRef.put(avatarInput.files[0]);
        avatarURL = await storageRef.getDownloadURL();
      }

      // Cập nhật displayName
      await user.updateProfile({ displayName: nameInput.value });

      // Cập nhật Firestore
      await db.collection("users").doc(user.uid).set({
        phone: phoneInput.value,
        address: addressInput.value,
        dob: dobInput.value,
        avatarURL: avatarURL
      }, { merge: true });

      saveStatus.style.color = "green";
      saveStatus.innerText = "Lưu thành công!";
    } catch (err) {
      console.error(err);
      saveStatus.style.color = "red";
      saveStatus.innerText = "Lỗi khi lưu: " + err.message;
    }
  });

  // 4️⃣ Logout
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "index.html";
    });
  });

});
