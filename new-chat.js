// ================================
// NEW CHAT JS (FIREBASE V8)
// ================================


import {
    db,
    auth
} from "./firebase.js";


import {
    createConversation
} from "./chat-service.js";



// ================================
// ELEMENT
// ================================

const userList =
document.getElementById("userList");


const searchUser =
document.getElementById("searchUser");



// ================================
// DATA
// ================================

let users = [];



// ================================
// LOAD USERS
// ================================

async function loadUsers(){

try{


    const snap =
    await db
    .collection("users")
    .get();



    users=[];



    snap.forEach(doc=>{


        const data =
        doc.data();



        users.push({

            uid:doc.id,

            ...data

        });


    });



    renderUsers();



}catch(err){

    console.error(
        "Load users lỗi:",
        err
    );

}


}




// ================================
// RENDER USERS
// ================================

function renderUsers(){


if(!userList)
return;



userList.innerHTML="";



const keyword =
searchUser?.value
?.toLowerCase()
.trim() || "";



let list =
users;



if(keyword){


    list =
    users.filter(user=>{


        return (
            user.name ||
            ""
        )
        .toLowerCase()
        .includes(keyword);



    });


}





list.forEach(user=>{


const div =
document.createElement("div");


div.className =
"user-item";



div.innerHTML = `

<div class="user-name">

${user.name || "Người dùng"}

</div>


<div class="user-phone">

${user.phone || ""}

</div>

`;



div.onclick =
async()=>{


    const id =
    await createConversation({

        uid:user.uid,

        name:user.name,

        avatar:user.avatar || ""

    });



    if(id){


        location.href =
        `message.html?id=${id}`;


    }


};



userList.appendChild(div);



});



}





// ================================
// SEARCH
// ================================

if(searchUser){


searchUser.addEventListener(
"input",
()=>{


    renderUsers();


});


}



// ================================
// START
// ================================

auth.onAuthStateChanged(
user=>{


if(user){

    loadUsers();

}


});
