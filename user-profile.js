document.addEventListener("DOMContentLoaded", () => {
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

  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const addressInput = document.getElementById("addressInput");
  const dobInput = document.getElementById("dobInput");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const saveStatus = document.getElementById("saveStatus");

  // Load user info
  auth.onAuthStateChanged(user => {
    if(!user) return window.location.href = "index.html"; // chưa login

    nameInput.value = user.displayName || "";
    db.collection("users").doc(user.uid).get()
      .then(doc=>{
        if(doc.exists){
          const data = doc.data();
          phoneInput.value = data.phone || "";
          addressInput.value = data.address || "";
          dobInput.value = data.dob || "";
        }
      });
  });

  // Lưu thông tin
  saveProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return;

    saveStatus.style.color = "blue";
    saveStatus.innerText = "Đang lưu...";

    try{
      // update displayName
      await user.updateProfile({ displayName: nameInput.value });

      // lưu thêm info vào Firestore
      await db.collection("users").doc(user.uid).set({
        phone: phoneInput.value,
        address: addressInput.value,
        dob: dobInput.value
      }, {merge:true});

      saveStatus.style.color = "green";
      saveStatus.innerText = "Lưu thành công!";
    } catch(err) {
      saveStatus.style.color = "red";
      saveStatus.innerText = "Lỗi khi lưu: " + err.message;
    }
  });
});
