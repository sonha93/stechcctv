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

// Profile page elements
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");
const profileDOB = document.getElementById("profileDOB");
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
      }
    });
  } else {
    window.location.href="index.html";
  }
});

// Save profile info
saveProfile.addEventListener("click", ()=>{
  const user = auth.currentUser;
  if(!user) return;
  authMessage.innerText = "Đang lưu...";
  db.collection("users").doc(user.uid).set({
    name: profileName.value,
    phone: profilePhone.value,
    address: profileAddress.value,
    dob: profileDOB.value
  }, {merge:true})
  .then(()=>{
    authMessage.style.color="green";
    authMessage.innerText="Lưu thành công!";
    user.updateProfile({ displayName: profileName.value });
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
