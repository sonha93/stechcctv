import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const orderId = "aaaa";

const orderData = {
  id: orderId,
  customer: "Sơn",
  phone: "0123456789",
  items: [
    { name: "Camera A", price: 1200000, qty: 1 }
  ],
  total: 1200000,
  status: "success",
  time: new Date().toISOString()
};

function saveOrder() {
  set(ref(db, "orders/" + orderId), orderData)
    .then(() => {
      console.log("✅ Lưu đơn hàng thành công:", orderId);
    })
    .catch((error) => {
      console.error("❌ Lỗi lưu đơn:", error);
    });
}

window.addEventListener("load", saveOrder);
