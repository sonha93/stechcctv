import {
    auth,
    db,
    storage,
    FieldValue
} from "./firebase-init.js";
// ===========================
// ACTIVITY V8
// PART 1
// ===========================

const activitySheet =
document.getElementById("activitySheet");

const activityList =
document.getElementById("activityList");

let activityUser = null;
let activityFilter = "all";
auth.onAuthStateChanged(async user=>{

    activityUser = user;

    if(!user) return;

    loadActivity();

});

window.openActivity = function(){

    document
    .getElementById("activitySheet")
    .classList.add("active");

}

window.closeActivity = function(){

    activitySheet.classList.remove("active");

}

window.closeActivityBackground = function(e){

    if(e.target===activitySheet){

        window.closeActivity();

    }

}
function timeAgo(ts){

    if(!ts) return "Vừa xong";

    const date =
    ts.toDate
    ? ts.toDate()
    : new Date(ts);

    const diff =
    Math.floor(
        (Date.now()-date.getTime())/1000
    );

    if(diff<60)
        return diff+" giây";

    const m=Math.floor(diff/60);

    if(m<60)
        return m+" phút";

    const h=Math.floor(m/60);

    if(h<24)
        return h+" giờ";

    const d=Math.floor(h/24);

    if(d<30)
        return d+" ngày";

    const month=Math.floor(d/30);

    if(month<12)
        return month+" tháng";

    return Math.floor(month/12)+" năm";

}
function activityText(type){

switch(type){

case "story":
    return "đã thêm 1 story mới";

case "message":
    return "đã gửi cho bạn 1 tin nhắn";

case "story_reply":
    return "đã trả lời story của bạn";

case "story_like":
    return "đã thích story của bạn";

case "follow":
    return "đã theo dõi bạn";

case "follow_request":
    return "đã gửi yêu cầu theo dõi";

case "video_like":
    return "đã thích video của bạn";

case "video_comment":
    return "đã bình luận video của bạn";

case "comment_reply":
    return "đã trả lời bình luận của bạn";

default:
    return "có hoạt động mới";

}

}
async function getUser(uid){

    const snap =
    await db
    .collection("users")
    .doc(uid)
    .get();

    if(!snap.exists){

        return{

            name:"Người dùng",

            avatar:
"https://i.ibb.co/Z1kv9nJj/logo.png"

        };

    }

    return snap.data();

}
// ===========================
// LOAD ACTIVITY
// ===========================

let unsubscribeActivity = null;

function loadActivity(){

    if(!activityUser) return;

    if(unsubscribeActivity){

        unsubscribeActivity();

    }

    activityList.innerHTML = `
    <div class="activity-loading">
        Đang tải...
    </div>
    `;

    unsubscribeActivity =
  db

    .collection("users")

    .doc(activityUser.uid)

        .collection("activities")
        .orderBy("createdAt","desc")

    .onSnapshot(async snap=>{

        activityList.innerHTML="";

        if(snap.empty){

            activityList.innerHTML=`
            <div class="activity-empty">

                <div class="icon">🔔</div>

                <div class="text">
                    Chưa có hoạt động nào
                </div>

            </div>
            `;

            return;

        }

          for(const doc of snap.docs){

    const data = doc.data();


    if(activityFilter !== "all"){


        if(activityFilter==="like"){

            if(
                ![
                    "video_like",
                    "story_like"
                ].includes(data.type)
            )
            continue;

        }



        if(activityFilter==="comment"){

            if(
                ![
                    "video_comment",
                    "story_reply",
                    "comment_reply"
                ].includes(data.type)
            )
            continue;

        }



        if(activityFilter==="follow"){

            if(
                ![
                    "follow",
                    "follow_request"
                ].includes(data.type)
            )
            continue;

        }



        if(activityFilter==="message"){

            if(data.type!=="message")
            continue;

        }

    }


    await renderActivity(doc);

}

    });

}
async function renderActivity(docSnap){

    const data = docSnap.data();

        const user =
data.uid
?
await getUser(data.uid)
:
{
    name:"Người dùng",
    avatar:"https://i.ibb.co/Z1kv9nJj/logo.png"
};
    const html = `

    <div
        class="activity-item"

        onclick="openActivityTarget(
        '${docSnap.id}'
        )">

        <img
        class="activity-avatar"
        src="${user.avatar}"

        onerror="
this.src='https://i.ibb.co/Z1kv9nJj/logo.png'
">

        <div class="activity-content">

            <div class="activity-text">

                <span class="activity-name">

                    ${user.name}

                </span>

                     ${activityText(data.type)}

            </div>

            <div class="activity-time">

                ${timeAgo(
                    data.createdAt
                )}

            </div>

        </div>

${
data.preview
?
data.previewType==="video"
?
`
<video
class="activity-preview"
src="${data.preview}"
muted
playsinline
preload="metadata">
</video>
`
:
`
<img
class="activity-preview"
src="${data.preview}">
`
:
""
}
        `
        :
        ""
        }

        ${
        data.read
        ?
        ""
        :
        `<div class="activity-dot"></div>`
        }

    </div>

    `;

    activityList.insertAdjacentHTML(
        "beforeend",
        html
    );

}
window.openActivityTarget =
async function(id){

    const ref =
    db
    .collection("users")
    .doc(activityUser.uid)
    .collection("activities")
    .doc(id);


    const snap =
    await ref.get();


    if(!snap.exists) return;


    const d = snap.data();


    await ref.update({

        read:true

    });


    switch(d.type){


        case "message":

            location.href =
            "message.html?id="+
            encodeURIComponent(d.conversationId);

        break;


        case "follow":

        case "follow_request":

            location.href =
            "profile-review.html?uid="+
            encodeURIComponent(d.uid);

        break;


        case "video_like":

        case "video_comment":

            location.href =
            "review.html?video="+
            d.videoId;

        break;


      case "story":

case "story_reply":

case "story_like":

    if(d.storyOwner){

        location.href =
        "profile-review.html?uid="+
        d.storyOwner;

    }else{

        location.href =
        "story.html?id="+
        d.storyId;

    }

break;

    }

}
// ===========================
// BADGE
// ===========================

auth.onAuthStateChanged(user=>{

    if(!user) return;

  db

    .collection("users")

    .doc(user.uid)

    .collection("activities")

    .where("read","==",false)

    .onSnapshot(snap=>{

        const badge =
        document.getElementById(
            "activityBadge"
        );

        if(!badge) return;

        if(snap.empty){

            badge.style.display="none";

            return;

        }

        badge.style.display="flex";

        badge.innerText =
        snap.size>99
        ?"99+"
        :snap.size;

    });

});
window.changeActivityTab=function(type){

    activityFilter = type;

    loadActivity();

}
