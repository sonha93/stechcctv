import {app} from "./auth.js";

import {

getFirestore,
doc,
getDoc

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


username.innerHTML="@"+(u.username || "");


}





const videoSnap=await getDoc(

doc(db,"videos",videoId)

);



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
