// review-videos.js

const wrap = document.getElementById("reviewVideos");

db.collection("products")
.get()
.then(snapshot=>{

    wrap.innerHTML = "";

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(!data.videos || !data.videos.length) return;

        data.videos.forEach(video=>{

            wrap.innerHTML += `
                <div class="review-video-card">
                    <video controls preload="metadata">
                        <source src="${video}" type="video/mp4">
                        Trình duyệt không hỗ trợ video.
                    </video>
                </div>
            `;

        });

    });

})
.catch(err=>{

    console.error("Lỗi load video:",err);

});
