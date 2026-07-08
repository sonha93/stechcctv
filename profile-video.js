import {app} from "./auth.js";

import {

getFirestore,
doc,
getDoc,
collection,
query,
where,
orderBy,
getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const db=getFirestore(app);



const params=new URLSearchParams(location.search);


const uid=params.get("uid");

const videoId=params.get("video");



const video=document.getElementById("video");

const name=document.getElementById("name");

const username=document.getElementById("username");

const time=document.getElementById("time");

const desc=document.getElementById("desc");



document.getElementById("backBtn").onclick=()=>{

history.back();

};




// đổi thời gian

function timeAgo(t){

let diff=Date.now()-t;


let min=60000;

let hour=min*60;

let day=hour*24;


if(diff < hour){

return Math.floor(diff/min)+" phút trước";

}


if(diff < day){

return Math.floor(diff/hour)+" giờ trước";

}


return Math.floor(diff/day)+" ngày trước";


}




async function load(){


const userSnap=await getDoc(

doc(db,"users",uid)

);



if(userSnap.exists()){


const u=userSnap.data();


name.innerHTML=u.name || "Người dùng";


}





async function loadVideos(){


const q=query(
    collection(db,"videos"),
    where("uid","==",uid),
    orderBy("createdAt","desc")
);


const snap=await getDocs(q);


const container=document.getElementById("videoList");


container.innerHTML="";


snap.forEach(d=>{


const v=d.data();


container.innerHTML += `

<div class="video-item">

<video
src="${v.videoUrl}"
playsinline
loop
muted>
</video>


<div class="info">

<div>${v.description || ""}</div>

<div>
${timeAgo(v.createdAt || Date.now())}
</div>

</div>


</div>

`;

});


enableSwipe();


}

loadVideos();



if(!videoSnap.exists()){

alert("Không tìm thấy video");

return;

}


const v=videoSnap.data();



video.src=v.videoUrl || v.url || "";



time.innerHTML=timeAgo(
v.createdAt || Date.now()
);



desc.innerHTML=v.description || "";



}


load();
function enableSwipe(){


const videos=document.querySelectorAll(
".video-item video"
);


const observer=new IntersectionObserver(entries=>{


entries.forEach(e=>{


if(e.isIntersecting){

e.target.play();

}else{

e.target.pause();

}


});


},{
threshold:0.7
});



videos.forEach(v=>{

observer.observe(v);


});


}
