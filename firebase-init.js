// ==========================
// FIREBASE INIT
// ==========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {

    apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

    authDomain:
        "stech-73b89.firebaseapp.com",

    databaseURL:
        "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "stech-73b89",

    storageBucket:
        "stech-73b89.appspot.com",

    messagingSenderId:
        "873739162979",

    appId:
        "1:873739162979:web:978f1a4043f025b1cdaf56"
};

/* =========================
   INIT APP
========================= */

const app = initializeApp(firebaseConfig);

/* =========================
   SERVICES
========================= */

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

/* =========================
   EXPORT
========================= */

export {
    auth,
    db,
    storage
};
