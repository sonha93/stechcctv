const currentUser =
JSON.parse(
    localStorage.getItem("adminUser")
);

if(!currentUser){

    window.location.href =
    "login.html";

}
