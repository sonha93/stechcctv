// Firebase config
const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
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
const saveProfileBtn = document.getElementById("saveProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveStatus = document.getElementById("saveStatus");

// Load user data
auth.onAuthStateChanged(user=>{
  if(!user) { window.location.href="index.html"; return; }
  emailInput.value = user.email;
  db.collection("users").doc(user.uid).get().then(doc=>{
    if(doc.exists){
      const data = doc.data();
      nameInput.value = data.name || "";
      phoneInput.value = data.phone || "";
      addressInput.value = data.address || "";
      dobInput.value = data.dob || "";
      avatarPreview.src = data.avatar || "images/logo-default.png";
    }
  });
});

// Preview avatar
avatarInput.addEventListener("change", e=>{
  if(e.target.files[0]){
    avatarPreview.src = URL.createObjectURL(e.target.files[0]);
  }
});

// Save profile
saveProfileBtn.addEventListener("click", async ()=>{
  saveStatus.innerText = "Đang lưu...";
  const user = auth.currentUser;
  if(!user) return;
  let avatarURL = avatarPreview.src;
  // Upload avatar nếu có file mới
  if(avatarInput.files[0]){
    const file = avatarInput.files[0];
    const storageRef = storage.ref().child(`avatars/${user.uid}`);
    await storageRef.put(file);
    avatarURL = await storageRef.getDownloadURL();
  }

  // Lưu Firestore
  await db.collection("users").doc(user.uid).set({
    name: nameInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
    dob: dobInput.value,
    avatar: avatarURL,
    email: user.email
  }, {merge:true});

  saveStatus.style.color="green";
  saveStatus.innerText="Lưu thành công!";
});

// Logout
logoutBtn.addEventListener("click", ()=>auth.signOut().then(()=>window.location.href="index.html"));
