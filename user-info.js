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
const storage = firebase.storage();
const db = firebase.firestore();

// Elements
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");
const profileDOB = document.getElementById("profileDOB");
const profileAvatarFile = document.getElementById("profileAvatarFile");
const saveProfile = document.getElementById("saveProfile");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");

// Load user info
auth.onAuthStateChanged(user=>{
  if(user){
    profileEmail.value = user.email;
    const userRef = db.collection("users").doc(user.uid);
    userRef.get().then(doc=>{
      if(doc.exists){
        const data = doc.data();
        profileName.value = data.name || "";
        profilePhone.value = data.phone || "";
        profileAddress.value = data.address || "";
        profileDOB.value = data.dob || "";
        profileAvatar.src = data.avatarURL || "https://via.placeholder.com/100";
      }
    });
  } else {
    // chưa login → quay về index
    window.location.href = "index.html";
  }
});

// Save profile info
saveProfile.addEventListener("click", async ()=>{
  const user = auth.currentUser;
  if(!user) return;
  authMessage.innerText = "Đang lưu...";
  
  let avatarURL = profileAvatar.src;

  // Nếu có file mới → upload
  if(profileAvatarFile.files.length > 0){
    const file = profileAvatarFile.files[0];
    const storageRef = storage.ref().child(`avatars/${user.uid}`);
    await storageRef.put(file);
    avatarURL = await storageRef.getDownloadURL();
  }

  // Lưu vào Firestore
  db.collection("users").doc(user.uid).set({
    name: profileName.value,
    phone: profilePhone.value,
    address: profileAddress.value,
    dob: profileDOB.value,
    avatarURL: avatarURL
  }, {merge:true})
  .then(()=>{
    authMessage.style.color="green";
    authMessage.innerText="Lưu thành công!";
    profileAvatar.src = avatarURL;
    user.updateProfile({ photoURL: avatarURL, displayName: profileName.value });
  })
  .catch(err=>{
    authMessage.style.color="red";
    authMessage.innerText = err.message;
  });
});

// Logout
logoutBtn.addEventListener("click", ()=>{
  auth.signOut().then(()=> window.location.href="index.html");
});