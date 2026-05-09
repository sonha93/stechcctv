document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
    authDomain: "stech-73b89.firebaseapp.com",
    projectId: "stech-73b89",
    storageBucket: "stech-73b89.appspot.com",
    messagingSenderId: "873739162979",
    appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // DOM
  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const addressInput = document.getElementById("addressInput");
  const dobInput = document.getElementById("dobInput");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const emailInput = document.getElementById("emailInput");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const saveStatus = document.getElementById("saveStatus");

  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const authModal = document.getElementById("authModal");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authRegisterBtn = document.getElementById("authRegisterBtn");
  const authLoginBtn = document.getElementById("authLoginBtn");
  const closeAuth = document.getElementById("closeAuth");
  const authMessage = document.getElementById("authMessage");
  const userInfoPreview = document.getElementById("userInfoPreview");
  const userAvatarPreview = document.getElementById("sidebarUserAvatarPreview");
  const userNamePreview = document.getElementById("sidebarUserNamePreview");

  // SHOW / HIDE AUTH MODAL
  loginLink.addEventListener("click", e=>{e.preventDefault(); authModal.style.display="flex";});
  closeAuth.addEventListener("click", ()=> authModal.style.display="none");

  // REGISTER
  authRegisterBtn.addEventListener("click", ()=>{
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if(!email||!pass){ authMessage.style.color="red"; authMessage.innerText="Nhập email & mật khẩu!"; return;}
    auth.createUserWithEmailAndPassword(email, pass)
      .then(userCredential=>{
        const user = userCredential.user;
        return user.updateProfile({displayName: email.split("@")[0], photoURL:"https://via.placeholder.com/40"});
      })
      .then(()=>{
        authMessage.style.color="green"; authMessage.innerText="Đăng ký thành công!";
        authEmail.value=""; authPassword.value=""; authModal.style.display="none";
      })
      .catch(err=>{authMessage.style.color="red"; authMessage.innerText=err.message;});
  });

  // LOGIN
  authLoginBtn.addEventListener("click", ()=>{
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if(!email||!pass){ authMessage.style.color="red"; authMessage.innerText="Nhập email & mật khẩu!"; return;}
    auth.signInWithEmailAndPassword(email, pass)
      .then(()=>{authMessage.style.color="green"; authMessage.innerText="Đăng nhập thành công!"; authModal.style.display="none";})
      .catch(err=>{authMessage.style.color="red"; authMessage.innerText=err.message;});
  });

  // AUTH STATE CHANGE
  auth.onAuthStateChanged(user=>{
    if(user){
      loginLink.style.display="none"; logoutLink.style.display="block"; userInfoPreview.style.display="block";
      emailInput.value = user.email || "";
      userAvatarPreview.src = user.photoURL||"https://via.placeholder.com/40";
      userNamePreview.innerText = user.displayName||user.email||"Người dùng";

      // Load Firestore info
      db.collection("users").doc(user.uid).get().then(doc=>{
        if(doc.exists){
          const data = doc.data();
          nameInput.value = user.displayName||"";
          phoneInput.value = data.phone||"";
          addressInput.value = data.address||"";
          dobInput.value = data.dob||"";
          if(data.avatarURL) avatarPreview.src = data.avatarURL;
        }
      });
    } else {
      loginLink.style.display="block"; logoutLink.style.display="none"; userInfoPreview.style.display="none";
    }
  });

  // PREVIEW AVATAR
  avatarInput.addEventListener("change", ()=>{
    const file = avatarInput.files[0];
    if(file){ const reader = new FileReader(); reader.onload=e=>avatarPreview.src=e.target.result; reader.readAsDataURL(file);}
  });

  // SAVE PROFILE
  saveProfileBtn.addEventListener("click", async ()=>{
    const user = auth.currentUser;
    if(!user){ saveStatus.style.color="red"; saveStatus.innerText="Chưa đăng nhập!"; return;}
    saveStatus.style.color="blue"; saveStatus.innerText="Đang lưu...";
    try{
      let avatarURL = avatarPreview.src;
      if(avatarInput.files[0]){
        const storageRef = storage.ref(`avatars/${user.uid}`);
        await storageRef.put(avatarInput.files[0]);
        avatarURL = await storageRef.getDownloadURL();
      }
      await user.updateProfile({displayName: nameInput.value, photoURL: avatarURL});
      await db.collection("users").doc(user.uid).set({
        phone: phoneInput.value,
        address: addressInput.value,
        dob: dobInput.value,
        avatarURL: avatarURL
      }, {merge:true});
      saveStatus.style.color="green"; saveStatus.innerText="Lưu thành công!";
      userAvatarPreview.src = avatarURL;
      userNamePreview.innerText = nameInput.value;
    } catch(err){ saveStatus.style.color="red"; saveStatus.innerText="Lỗi: "+err.message; }
  });

  // LOGOUT
  logoutBtn.addEventListener("click", ()=> auth.signOut());
  logoutLink.addEventListener("click", ()=> auth.signOut());

});
