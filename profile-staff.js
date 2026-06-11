// ============================
// PROFILE PAGE
// ============================
import { auth, db } from "./firebase-init.js";
export function loadProfilePage() {

  document.getElementById("profileSection").innerHTML  = `

    <div class="profile-page">

        <div class="profile-card">

            <div class="profile-header">

                <div class="profile-avatar">
                    <img id="profileAvatar"
                        src="https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff&size=200">
                </div>

                <div class="profile-user-info">
                    <h2 id="profileTitle">Đang tải...</h2>
                    <span id="profilePositionBadge">
                        Đang tải...
                    </span>
                </div>

            </div>

            <div class="profile-grid">

                <div class="profile-group">
                    <label>Họ và tên</label>
                    <input type="text" id="profileName">
                </div>

                <div class="profile-group">
                    <label>Email</label>
                    <input type="email" id="profileEmail" disabled>
                </div>

                <div class="profile-group">
                    <label>Số điện thoại</label>
                    <input type="text" id="profilePhone">
                </div>

                <div class="profile-group">
                    <label>Ngày sinh</label>
                    <input type="date" id="profileBirthday">
                </div>

                <div class="profile-group">
                    <label>Chức vụ</label>
                    <input type="text" id="profilePosition" disabled>
                </div>

                <div class="profile-group">
                    <label>Ngày vào làm</label>
                    <input type="date" id="profileJoinDate" disabled>
                </div>

            </div>

            <div class="profile-actions">
                <button id="saveProfileBtn">
                    💾 Cập nhật thông tin
                </button>
            </div>

        </div>

    </div>
    `;

    injectProfileCSS();

    initProfilePage();
}

// ============================
// LOAD DATA
// ============================

async function initProfilePage() {

    const user = firebase.auth().currentUser;

    if (!user) return;

    const snap = await firebase
        .database()
        .ref("users/" + user.uid)
        .once("value");

    const data = snap.val() || {};

    document.getElementById("profileTitle").textContent =
        data.name || "Chưa cập nhật";

    document.getElementById("profilePositionBadge").textContent =
        data.position || "Nhân viên";

    document.getElementById("profileName").value =
        data.name || "";

    document.getElementById("profileEmail").value =
        user.email || "";

    document.getElementById("profilePhone").value =
        data.phone || "";

    document.getElementById("profileBirthday").value =
        data.birthday || "";

    document.getElementById("profilePosition").value =
        data.position || "Nhân viên";

    document.getElementById("profileJoinDate").value =
        data.joinDate || "";

    if (data.name) {

        document.getElementById("profileAvatar").src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0ea5e9&color=fff&size=200`;

    }

    document.getElementById("saveProfileBtn")
        .addEventListener("click", saveProfile);
}

// ============================
// SAVE
// ============================

async function saveProfile() {

    const user = firebase.auth().currentUser;

    if (!user) return;

    const name =
        document.getElementById("profileName").value.trim();

    const phone =
        document.getElementById("profilePhone").value.trim();

    const birthday =
        document.getElementById("profileBirthday").value;

    await firebase
        .database()
        .ref("users/" + user.uid)
        .update({

            name,
            phone,
            birthday

        });

    document.getElementById("profileTitle").textContent =
        name || "Chưa cập nhật";

    alert("Đã cập nhật thông tin");
}

// ============================
// CSS
// ============================

function injectProfileCSS() {

    if (document.getElementById("profileStyle")) return;

    const style = document.createElement("style");

    style.id = "profileStyle";

    style.textContent = `

    .profile-page{
        padding:20px;
    }

    .profile-card{
        background:#fff;
        border-radius:20px;
        padding:30px;
        box-shadow:0 2px 10px rgba(0,0,0,.08);
    }

    .profile-header{
        display:flex;
        gap:25px;
        align-items:center;
        margin-bottom:30px;
        flex-wrap:wrap;
    }

    .profile-avatar img{
        width:120px;
        height:120px;
        border-radius:50%;
        object-fit:cover;
        border:4px solid #0ea5e9;
    }

    .profile-user-info h2{
        margin:0;
        font-size:28px;
    }

    .profile-user-info span{
        display:inline-block;
        margin-top:10px;
        background:#e0f2fe;
        color:#0284c7;
        padding:8px 16px;
        border-radius:999px;
        font-weight:600;
    }

    .profile-grid{
        display:grid;
        grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
        gap:20px;
    }

    .profile-group{
        display:flex;
        flex-direction:column;
    }

    .profile-group label{
        font-weight:600;
        margin-bottom:8px;
    }

    .profile-group input{
        height:48px;
        border:1px solid #ddd;
        border-radius:12px;
        padding:0 14px;
        font-size:15px;
    }

    .profile-group input:focus{
        outline:none;
        border-color:#06b6d4;
    }

    .profile-actions{
        margin-top:30px;
    }

    #saveProfileBtn{
        border:none;
        background:#06b6d4;
        color:white;
        padding:14px 25px;
        border-radius:12px;
        cursor:pointer;
        font-size:15px;
        font-weight:600;
    }

    #saveProfileBtn:hover{
        opacity:.9;
    }

    @media(max-width:768px){

        .profile-header{
            flex-direction:column;
            text-align:center;
        }

        .profile-avatar img{
            width:100px;
            height:100px;
        }

    }

    `;

    document.head.appendChild(style);
}
