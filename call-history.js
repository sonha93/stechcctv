import { auth, db } from "./firebase-init.js";


const callList =
document.getElementById("callList");



auth.onAuthStateChanged(user=>{

    if(!user)
    return;


    loadCallHistory(user.uid);


});





function loadCallHistory(uid){


db.collection("call_history")

.orderBy(
"createdAt",
"desc"
)

.onSnapshot(snapshot=>{


callList.innerHTML="";



snapshot.forEach(doc=>{


const call =
doc.data();



if(
call.from !== uid &&
call.to !== uid
)
return;



let icon="📞";

let text="";



if(call.status==="missed"){

    icon="❌";

    text="Cuộc gọi nhỡ";

}

else if(call.from===uid){

    icon="↗️";

    text="Cuộc gọi đi";

}

else{

    icon="↙️";

    text="Cuộc gọi đến";

}




const div =
document.createElement("div");


div.className="call-item";



div.innerHTML=`

<div class="avatar">
👤
</div>


<div class="info">

<div>

${icon}
${text}

</div>


<div class="time">

${formatTime(call.createdAt)}

</div>


</div>


<div class="duration">

${formatDuration(call.duration)}

</div>


`;



callList.appendChild(div);



});


});


}





function formatDuration(sec){


if(!sec)
return "00:00";


let m =
Math.floor(sec/60);


let s =
sec%60;



return String(m).padStart(2,"0")
+":"+
String(s).padStart(2,"0");


}






function formatTime(time){


if(!time)
return "";


return time.toDate()
.toLocaleString("vi-VN");

}
