// user-profile.js
document.addEventListener("DOMContentLoaded", function(){

  // Firebase config
  const firebaseConfig = {
    apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
    authDomain:"stech-73b89.firebaseapp.com",
    projectId:"stech-73b89",
    storageBucket:"stech-73b89.appspot.com",
    messagingSenderId:"873739162979",
    appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
  };
  if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);

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

  // LOAD USER INFO
  auth.onAuthStateChanged(async user => {
    if(user){
      emailInput.value = user.email || "";
      nameInput.value = user.displayName || "";
      avatarPreview.src = user.photoURL || "https://via.placeholder.com/100";

      // Load additional info from Firestore
      const doc = await db.collection("users").doc(user.uid).get();
      if(doc.exists){
        const data = doc.data();
        phoneInput.value = data.phone || "";
        addressInput.value = data.address || "";
        dobInput.value = data.dob || "";
      }
    } else {
      // Redirect to login page if needed
      window.location.href = "index.html";
    }
  });

  // UPLOAD AVATAR PREVIEW
  avatarInput.addEventListener("change", function(e){
    const file = e.target.files[0];
    if(file){
      avatarPreview.src = URL.createObjectURL(file);
    }
  });

  // SAVE PROFILE
  saveBtn.addEventListener("click", async ()=>{
    const user = auth.currentUser;
    if(!user) return;

    saveStatus.innerText = "Đang lưu...";
    saveStatus.style.color = "black";

    let avatarURL = user.photoURL || "https://via.placeholder.com/100";

    // Upload new avatar nếu có
    if(avatarInput.files[0]){
      const file = avatarInput.files[0];
      const storageRef = storage.ref().child(`avatars/${user.uid}/${file.name}`);
      await storageRef.put(file);
      avatarURL = await storageRef.getDownloadURL();

      // Update Firebase auth profile
      await user.updateProfile({ displayName: nameInput.value.trim(), photoURL: avatarURL });
    } else {
      await user.updateProfile({ displayName: nameInput.value.trim() });
    }

    // Save additional info to Firestore
    await db.collection("users").doc(user.uid).set({
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      dob: dobInput.value
    }, { merge:true });

    saveStatus.style.color = "green";
    saveStatus.innerText = "Lưu thông tin thành công!";
    avatarPreview.src = avatarURL;
  });

  // LOGOUT
  logoutBtn.addEventListener("click", ()=>{
    auth.signOut().then(()=>{
      window.location.href = "index.html";
    });
  });

});
