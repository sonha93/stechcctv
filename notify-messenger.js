function updateNotify(count){
  localStorage.setItem("notifyCount", count);
  renderNotify();
}

function renderNotify(){
  const count = localStorage.getItem("notifyCount") || 0;

  const el = document.getElementById("notifyCount");
  if(!el) return;

  if(count > 0){
    el.style.display = "flex";
    el.innerText = count;
  }else{
    el.style.display = "none";
  }
}

renderNotify();
