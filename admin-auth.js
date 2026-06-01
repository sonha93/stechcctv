let currentUser = null;

try{

    currentUser = JSON.parse(
        localStorage.getItem("adminUser")
    );

}catch(err){

    localStorage.removeItem("adminUser");

}

if(!currentUser){

    window.location.href =
    "login.html";

}
