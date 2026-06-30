import { app } from "./auth.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);

let allProducts = [];

function formatPrice(n){
  return Number(n || 0).toLocaleString() + "đ";
}

async function loadProducts(){

  const snap = await getDocs(collection(db,"products"));

  allProducts = [];

  snap.forEach(doc=>{

    allProducts.push({
      id:doc.id,
      ...doc.data()
    });

  });

}

function render(list){

  const box=document.getElementById("searchResults");

  box.innerHTML="";

  if(list.length===0){

    box.innerHTML="<div style='padding:10px'>Không tìm thấy sản phẩm</div>";
    box.style.display="block";
    return;

  }

  list.forEach(p=>{

    box.innerHTML+=`
      <div class="search-item" onclick="location.href='logo.html?id=${p.id}'">

        <img src="${p.img}">

        <div class="search-info">

          <div class="search-name">${p.name}</div>

          <div class="search-price">
            ${formatPrice(p.price)}
          </div>

          ${
            p.oldPrice>p.price
            ?
            `<div class="search-oldprice">${formatPrice(p.oldPrice)}</div>`
            :
            ""
          }

        </div>

      </div>
    `;

  });

  box.style.display="block";

}

document.addEventListener("DOMContentLoaded",async()=>{

  await loadProducts();

  const input=document.getElementById("searchInput");
  const box=document.getElementById("searchResults");

  if(!input) return;

  input.addEventListener("input",()=>{

    const key=input.value.trim().toLowerCase();

    if(!key){

      box.innerHTML="";
      box.style.display="none";
      return;

    }

    render(
      allProducts.filter(p=>
        (p.name||"").toLowerCase().includes(key)
      )
    );

  });

  document.addEventListener("click",e=>{

    if(!e.target.closest(".search-box")){

      box.innerHTML="";
      box.style.display="none";

    }

  });

});
