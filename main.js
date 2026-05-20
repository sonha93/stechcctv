// ===== DARK MODE TOGGLE =====
function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");

  // lưu trạng thái
  if(document.body.classList.contains("dark-mode")){
    localStorage.setItem("mode","dark");
  }else{
    localStorage.setItem("mode","light");
  }
}

// load trạng thái khi mở web
window.addEventListener("load", () => {
  if(localStorage.getItem("mode") === "dark"){
    document.body.classList.add("dark-mode");
  }
});