(() => {

const DATA = {

    indoor: {
        title: "Camera trong nhà",
        desc: "AI giám sát thông minh – xoay 360° – phát hiện chuyển động",

        items: [
            { name:"AI Mini 2K", img:"https://images.unsplash.com/photo-1583225171125-3c9c6f5c9f2a?w=900", link:"#"},
            { name:"Camera 360", img:"https://images.unsplash.com/photo-1558002038-1055907df827?w=900", link:"#"},
            { name:"Baby Monitor", img:"https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=900", link:"#"},
            { name:"Wifi Dome", img:"https://images.unsplash.com/photo-1581091870622-2c5c9a7d7c5a?w=900", link:"#"},
            { name:"Night Vision", img:"https://images.unsplash.com/photo-1508614999368-9260051292e5?w=900", link:"#"},
            { name:"Smart Cam", img:"https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900", link:"#"}
        ]
    },

    outdoor: {
        title: "Camera ngoài trời",
        desc: "Chống nước IP67 – AI cảnh báo – full color ban đêm",

        items: [
            { name:"4K Ultra", img:"https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=900", link:"#"},
            { name:"Solar AI", img:"https://images.unsplash.com/photo-1508614999368-9260051292e5?w=900", link:"#"},
            { name:"PTZ Dome", img:"https://images.unsplash.com/photo-1527430253228-e93688616381?w=900", link:"#"},
            { name:"Bullet Pro", img:"https://images.unsplash.com/photo-1583225171125-3c9c6f5c9f2a?w=900", link:"#"},
            { name:"AI Tracking", img:"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900", link:"#"},
            { name:"IR Night", img:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900", link:"#"}
        ]
    }

};


// ================= CSS AUTO =================
const css = document.createElement("style");
css.innerHTML = `
#megaOverlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    backdrop-filter: blur(10px);
    display:none;
    z-index:99999;
}

#megaBox{
    width:1100px;
    max-width:95vw;
    margin:70px auto;
    background:#fff;
    border-radius:22px;
    padding:25px;
    box-shadow:0 25px 70px rgba(0,0,0,.25);
}

.mega-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
    gap:15px;
}

.mega-card{
    text-decoration:none;
    color:#000;
    border-radius:14px;
    overflow:hidden;
    background:#fff;
    box-shadow:0 6px 18px rgba(0,0,0,.10);
    transition:.25s;
}

.mega-card:hover{
    transform:translateY(-6px);
}

.mega-card img{
    width:100%;
    height:140px;
    object-fit:cover;
}

.mega-card span{
    display:block;
    padding:10px;
    font-weight:600;
}
`;
document.head.appendChild(css);


// ================= CREATE PANEL =================
const overlay = document.createElement("div");
overlay.id = "megaOverlay";

overlay.innerHTML = `<div id="megaBox"></div>`;
document.body.appendChild(overlay);

const box = document.getElementById("megaBox");


// ================= RENDER =================
function render(key){

    const d = DATA[key];
    if(!d) return;

    box.innerHTML = `
        <h2 style="margin:0">${d.title}</h2>
        <p style="color:#666;margin-top:5px">${d.desc}</p>

        <div class="mega-grid" style="margin-top:15px">
            ${d.items.map(i => `
                <a class="mega-card" href="${i.link}">
                    <img src="${i.img}">
                    <span>${i.name}</span>
                </a>
            `).join("")}
        </div>
    `;
}


// ================= EVENTS =================
document.querySelectorAll("[data-mega]").forEach(el => {

    el.addEventListener("mouseenter", () => {
        render(el.dataset.mega);
        overlay.style.display = "block";
    });

});

overlay.addEventListener("mouseleave", () => {
    overlay.style.display = "none";
});

})();