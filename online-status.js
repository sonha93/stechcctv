// ================================
// ONLINE STATUS (FIREBASE V8)
// ================================

import { db, auth } from "./firebase-init.js";


// ONLINE KHI ĐĂNG NHẬP

auth.onAuthStateChanged(user=>{


    if(!user) return;


    db.collection("users")
    .doc(user.uid)
    .update({

        online:true

    });


});


// OFFLINE KHI RỜI TRANG

window.addEventListener(
"beforeunload",
()=>{


    const user = auth.currentUser;


    if(!user) return;


    db.collection("users")
    .doc(user.uid)
    .update({

        online:false

    });


});
