<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
    authDomain:"stech-73b89.firebaseapp.com",
    databaseURL:"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"stech-73b89",
    storageBucket:"stech-73b89.appspot.com",
    messagingSenderId:"873739162979",
    appId:"1:873739162979:web:978f1a4043f025b1cdaf56",
    measurementId:"G-98Q3927PHZ"
  };

  // Init Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Khai báo chung cho cart.js dùng
  window.auth = firebase.auth();
  window.db = firebase.database();
</script>
