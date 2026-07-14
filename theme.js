// ======================================================
// THEME.JS (PART 1)
// FIREBASE V8
// ======================================================

// ==============================
// FIREBASE
// ==============================

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ==============================
// ELEMENT
// ==============================

const themeModal = document.getElementById("themeModal");

const closeTheme = document.getElementById("closeTheme");
const cancelTheme = document.getElementById("cancelTheme");
const saveTheme = document.getElementById("saveTheme");
const resetTheme = document.getElementById("resetTheme");

const chooseImage = document.getElementById("chooseImage");
const removeImage = document.getElementById("removeImage");
const defaultTheme = document.getElementById("defaultTheme");

const fileInput = document.getElementById("themeImage");
const previewImage = document.getElementById("previewImage");

// ==============================
// TAB
// ==============================

const menus = document.querySelectorAll(".theme-menu");
const tabs = document.querySelectorAll(".tab");

// ==============================
// COLOR
// ==============================

const colors = document.querySelectorAll(".theme-color");
const gradients = document.querySelectorAll(".gradient-item");

// ==============================
// RANGE
// ==============================

const blurRange = document.getElementById("blurRange");
const brightnessRange = document.getElementById("brightnessRange");
const opacityRange = document.getElementById("opacityRange");

const blurValue = document.getElementById("blurValue");
const brightnessValue = document.getElementById("brightnessValue");
const opacityValue = document.getElementById("opacityValue");

// ==============================
// DARK MODE
// ==============================

const darkTheme = document.getElementById("darkTheme");

// ==============================
// STATE
// ==============================

let roomId = "";
let selectedFile = null;

const themeData = {

    background: "",

    color: "#0084ff",

    gradient: "",

    blur: 0,

    brightness: 100,

    opacity: 100,

    dark: false,

    scope: "me"

};

// ==============================
// OPEN
// ==============================

function openTheme(id){

    roomId = id;

    themeModal.style.display = "flex";

}

// Cho phép gọi từ file khác
window.openTheme = openTheme;

// ==============================
// CLOSE
// ==============================

function closeThemeModal(){

    themeModal.style.display = "none";

}

closeTheme.onclick = closeThemeModal;
cancelTheme.onclick = closeThemeModal;

// ==============================
// CLICK OUTSIDE
// ==============================

themeModal.addEventListener("click",e=>{

    if(e.target===themeModal){

        closeThemeModal();

    }

});

// ==============================
// TAB
// ==============================

menus.forEach(menu=>{

    menu.addEventListener("click",()=>{

        menus.forEach(m=>m.classList.remove("active"));
        tabs.forEach(t=>t.classList.remove("active"));

        menu.classList.add("active");

        const tabId = menu.dataset.tab + "Tab";

        document.getElementById(tabId)
        .classList.add("active");

    });

});

// ==============================
// CHỌN ẢNH
// ==============================

chooseImage.onclick = ()=>{

    fileInput.click();

};

// ==============================
// PREVIEW
// ==============================

fileInput.addEventListener("change",()=>{

    if(!fileInput.files.length) return;

    selectedFile = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = function(){

        previewImage.src = reader.result;

        themeData.background = reader.result;

    };

    reader.readAsDataURL(selectedFile);

});

// ==============================
// XÓA ẢNH
// ==============================

removeImage.onclick = ()=>{

    selectedFile = null;

    previewImage.src = "images/default-chat.jpg";

    themeData.background = "";

};

// ==============================
// RESET
// ==============================

defaultTheme.onclick = ()=>{

    selectedFile = null;

    previewImage.src = "images/default-chat.jpg";

    themeData.background = "";

    themeData.color = "#0084ff";
    themeData.gradient = "";
    themeData.blur = 0;
    themeData.brightness = 100;
    themeData.opacity = 100;
    themeData.dark = false;

    blurRange.value = 0;
    brightnessRange.value = 100;
    opacityRange.value = 100;

    blurValue.textContent = "0 px";
    brightnessValue.textContent = "100%";
    opacityValue.textContent = "100%";

    darkTheme.checked = false;

};

// ==============================
// RADIO
// ==============================

document
.querySelectorAll("input[name='scope']")
.forEach(r=>{

    r.addEventListener("change",()=>{

        themeData.scope = r.value;

    });

});

// ==============================
// ESC ĐÓNG POPUP
// ==============================

document.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        closeThemeModal();

    }

});
// ======================================================
// THEME.JS (PART 2)
// COLOR + EFFECT
// FIREBASE V8
// ======================================================

// ==============================
// COLOR PICKER
// ==============================

colors.forEach(item=>{

    item.addEventListener("click",()=>{

        colors.forEach(c=>c.classList.remove("active"));

        item.classList.add("active");

        themeData.gradient="";

        themeData.color=item.dataset.color;

        previewTheme();

    });

});

// ==============================
// GRADIENT PICKER
// ==============================

gradients.forEach(item=>{

    item.addEventListener("click",()=>{

        gradients.forEach(g=>g.classList.remove("active"));

        item.classList.add("active");

        themeData.gradient=item.dataset.gradient;

        previewTheme();

    });

});

// ==============================
// BLUR
// ==============================

blurRange.addEventListener("input",()=>{

    themeData.blur=parseInt(blurRange.value);

    blurValue.textContent=

    themeData.blur+" px";

    previewTheme();

});

// ==============================
// BRIGHTNESS
// ==============================

brightnessRange.addEventListener("input",()=>{

    themeData.brightness=

    parseInt(brightnessRange.value);

    brightnessValue.textContent=

    themeData.brightness+"%";

    previewTheme();

});

// ==============================
// OPACITY
// ==============================

opacityRange.addEventListener("input",()=>{

    themeData.opacity=

    parseInt(opacityRange.value);

    opacityValue.textContent=

    themeData.opacity+"%";

    previewTheme();

});

// ==============================
// DARK MODE
// ==============================

darkTheme.addEventListener("change",()=>{

    themeData.dark=

    darkTheme.checked;

    previewTheme();

});

// ==============================
// PREVIEW
// ==============================

function previewTheme(){

    // Preview Background

    if(themeData.background){

        previewImage.src=

        themeData.background;

    }

    // Blur

    previewImage.style.filter=

    `blur(${themeData.blur}px)
    brightness(${themeData.brightness}%)
    opacity(${themeData.opacity}%)`;

    // Window Color

    if(themeData.gradient){

        document.documentElement
        .style
        .setProperty(
        "--primary",
        "#0084ff");

        document.querySelectorAll(".btn-primary")
        .forEach(btn=>{

            btn.style.background=

            themeData.gradient;

        });

    }else{

        document.documentElement
        .style
        .setProperty(

        "--primary",

        themeData.color

        );

        document.querySelectorAll(".btn-primary")
        .forEach(btn=>{

            btn.style.background=

            themeData.color;

        });

    }

    // Dark Mode

    const win=

    document.querySelector(".theme-window");

    if(themeData.dark){

        win.classList.add("dark");

    }else{

        win.classList.remove("dark");

    }

}

// ==============================
// RESET COLOR
// ==============================

resetTheme.addEventListener("click",()=>{

    colors.forEach(c=>

        c.classList.remove("active")

    );

    gradients.forEach(g=>

        g.classList.remove("active")

    );

    colors[0].classList.add("active");

    previewTheme();

});

// ==============================
// PREVIEW WHEN OPEN
// ==============================

previewTheme();
// ======================================================
// THEME.JS (PART 3)
// FIREBASE V8
// SAVE / LOAD / REALTIME
// ======================================================

// ==============================
// UPLOAD IMAGE
// ==============================

async function uploadThemeImage(){

    if(!selectedFile){

        return themeData.background || "";

    }

    const ext = selectedFile.name.split(".").pop();

    const fileName =
        "theme_" +
        roomId +
        "_" +
        Date.now() +
        "." +
        ext;

    const ref =
        storage
        .ref()
        .child("chatThemes/" + fileName);

    await ref.put(selectedFile);

    return await ref.getDownloadURL();

}

// ==============================
// SAVE
// ==============================

saveTheme.onclick = async ()=>{

    if(!auth.currentUser){

        alert("Bạn chưa đăng nhập.");

        return;

    }

    saveTheme.disabled = true;

    try{

        let backgroundUrl =
            themeData.background;

        if(selectedFile){

            backgroundUrl =
                await uploadThemeImage();

        }

        const data={

            background:backgroundUrl,

            color:themeData.color,

            gradient:themeData.gradient,

            blur:themeData.blur,

            brightness:themeData.brightness,

            opacity:themeData.opacity,

            dark:themeData.dark,

            updatedAt:
            firebase.firestore
            .FieldValue.serverTimestamp()

        };

        // ==========================
        // CHỈ MÌNH TÔI
        // ==========================

        if(themeData.scope==="me"){

            await db

            .collection("users")

            .doc(auth.currentUser.uid)

            .collection("chatThemes")

            .doc(roomId)

            .set(data);

        }

        // ==========================
        // CẢ HAI NGƯỜI
        // ==========================

        else{

            data.updatedBy =
            auth.currentUser.uid;

            await db

            .collection("chatThemes")

            .doc(roomId)

            .set(data);

        }

        alert("Đã lưu giao diện.");

        closeThemeModal();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    saveTheme.disabled=false;

};

// ==============================
// LOAD THEME
// ==============================

async function loadTheme(roomId){

    if(!auth.currentUser) return;

    // ưu tiên theme cá nhân

    let doc = await db

    .collection("users")

    .doc(auth.currentUser.uid)

    .collection("chatThemes")

    .doc(roomId)

    .get();

    if(doc.exists){

        applyTheme(doc.data());

        return;

    }

    // nếu không có thì lấy theme chung

    doc = await db

    .collection("chatThemes")

    .doc(roomId)

    .get();

    if(doc.exists){

        applyTheme(doc.data());

    }

}

// ==============================
// REALTIME
// ==============================

function listenTheme(roomId){

    db.collection("chatThemes")

    .doc(roomId)

    .onSnapshot(doc=>{

        if(!doc.exists) return;

        applyTheme(doc.data());

    });

}

// ==============================
// APPLY
// ==============================

function applyTheme(data){

    const chatBody =
    document.querySelector(".chat-body");

    if(!chatBody) return;

    if(data.background){

        chatBody.style.backgroundImage =
        `url(${data.background})`;

        chatBody.style.backgroundSize="cover";

        chatBody.style.backgroundPosition="center";

    }

    chatBody.style.filter =

    `brightness(${data.brightness}%)
     opacity(${data.opacity}%)`;

    chatBody.style.setProperty(

        "--chat-color",

        data.color

    );

    if(data.gradient){

        chatBody.style.setProperty(

            "--chat-gradient",

            data.gradient

        );

    }

    document.body.classList.toggle(

        "dark-chat",

        data.dark

    );

}

// ==============================
// REMOVE
// ==============================

async function removeTheme(){

    if(!confirm("Khôi phục mặc định?"))

        return;

    await db

    .collection("chatThemes")

    .doc(roomId)

    .delete();

}

// ==============================
// EXPORT
// ==============================

window.loadTheme = loadTheme;

window.listenTheme = listenTheme;

window.applyTheme = applyTheme;

window.removeTheme = removeTheme;
