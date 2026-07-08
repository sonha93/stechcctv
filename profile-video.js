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






const name=document.getElementById("name");




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



const q=query(

collection(db,"videos"),



orderBy("createdAt","desc")

);



const snap=await getDocs(q);



const box=document.getElementById("videoList");


box.innerHTML="";



snap.forEach(d=>{


const v=d.data();



box.innerHTML += `

<div class="videoItem">


<video

src="${v.videoUrl}"

playsinline

loop

muted>

</video>


<div class="info">


<div class="desc">

${v.description || ""}

</div>


<div class="time">

${timeAgo(
    v.createdAt?.toMillis 
    ? v.createdAt.toMillis()
    : Date.now()
)}

</div>


</div>


</div>

`;

});



autoPlayVideo();


}

load();
function autoPlayVideo(){


const videos=document.querySelectorAll(
".videoItem video"
);



const ob=new IntersectionObserver((items)=>{


items.forEach(item=>{


if(item.isIntersecting){

item.target.play();

}else{

item.target.pause();

}


});


},{
threshold:0.7

});



videos.forEach(v=>ob.observe(v));


}
