import { app } from "./auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

const wrap = document.getElementById("viewedProducts");
const section = document.getElementById("viewedSection");

async function loadViewedProducts(user){

    wrap.innerHTML="";

    const q = query(
        collection(
            db,
            "users",
            user.uid,
            "viewedProducts"
        ),
        orderBy("viewedAt","desc"),
        limit(20)
    );

    const snap = await getDocs(q);

    if(snap.empty){
        section.style.display="none";
        return;
    }

    section.style.display="block";

    snap.forEach(doc=>{

        const p = doc.data();

        let sale = "";

        if(
            p.oldPrice &&
            Number(p.oldPrice) > Number(p.price)
        ){

            sale = Math.round(
                (
                    (Number(p.oldPrice)-Number(p.price))
                    /
                    Number(p.oldPrice)
                )*100
            );

        }

        const card = document.createElement("a");

        card.href = "logo.html?id=" + p.id;

        card.className = "featured-card";

        card.innerHTML = `

            <div class="featured-thumb">

                ${
                    sale
                    ?
                    `<div class="discount-badge">-${sale}%</div>`
                    :
                    ""
                }

                <img
                    src="${p.img}"
                    loading="lazy"
                >

            </div>

            <div class="featured-name">
                ${p.name}
            </div>

            <div class="featured-price-wrap">

                <div class="featured-price">
                    ${Number(p.price).toLocaleString()}đ
                </div>

                ${
                    p.oldPrice
                    ?
                    `<div class="featured-original-price">
                        ${Number(p.oldPrice).toLocaleString()}đ
                    </div>`
                    :
                    ""
                }

            </div>

        `;

        wrap.appendChild(card);

    });

}

onAuthStateChanged(auth,user=>{

    if(!user){

        section.style.display="none";

        return;

    }

    loadViewedProducts(user);

});

document
.getElementById("viewedNext")
.onclick=()=>{

    wrap.scrollBy({

        left:320,

        behavior:"smooth"

    });

};

document
.getElementById("viewedPrev")
.onclick=()=>{

    wrap.scrollBy({

        left:-320,

        behavior:"smooth"

    });

};
