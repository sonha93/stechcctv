// Firebase config
const firebaseConfig = {
  apiKey:"YOUR_API_KEY",
  authDomain:"YOUR_PROJECT.firebaseapp.com",
  projectId:"YOUR_PROJECT",
  storageBucket:"YOUR_PROJECT.appspot.com",
  messagingSenderId:"YOUR_SENDER_ID",
  appId:"YOUR_APP_ID"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ELEMENTS
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

// LOAD user data
auth.onAuthStateChanged(user => {
  if(user){
    emailInput.value = user.email;
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

// SAVE user data
saveBtn.addEventListener("click", ()=>{
  const user = auth.currentUser;
  if(!user) return;

  const userData = {
    name: nameInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
    dob: dobInput.value
  };

  // upload avatar nếu có chọn
  if(avatarInput.files[0]){
    const file = avatarInput.files[0];
    const storageRef = storage.ref().child(`avatars/${user.uid}`);
    storageRef.put(file).then(()=>{
      storageRef.getDownloadURL().then(url=>{
        userData.avatar = url;
        db.collection("users").doc(user.uid).set(userData, {merge:true})
          .then(()=> saveStatus.innerText="Đã lưu thành công!");
      });
    });
  } else {
    db.collection("users").doc(user.uid).set(userData, {merge:true})
      .then(()=> saveStatus.innerText="Đã lưu thành công!");
  }
});

// LOGOUT
logoutBtn.addEventListener("click", ()=>{
  auth.signOut().then(()=> window.location.href="index.html");
});
