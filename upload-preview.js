// ===============================
// upload-preview.js
// PHẦN 2A
// ===============================

const {

    videoInput,

    imageInput,

    previewVideo,

    previewImage

} = window.uploadUI;

let selectedVideo = null;
let selectedThumbnail = null;

let videoDuration = 0;

const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

const allowTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
    "video/ogg"
];

videoInput.addEventListener("change", () => {

    const file = videoInput.files[0];

    if (!file) return;

    // kiểm tra định dạng

    if (!allowTypes.includes(file.type)) {

        alert("Video không được hỗ trợ");

        videoInput.value = "";

        return;

    }

    // kiểm tra dung lượng

    if (file.size > MAX_VIDEO_SIZE) {

        alert("Video tối đa 200MB");

        videoInput.value = "";

        return;

    }

    selectedVideo = file;

    // xóa URL cũ

    if (previewVideo.dataset.url) {

        URL.revokeObjectURL(previewVideo.dataset.url);

    }

    const url = URL.createObjectURL(file);

    previewVideo.dataset.url = url;

    previewVideo.src = url;

    previewVideo.style.display = "block";

    previewVideo.load();

    previewImage.style.display = "none";

});
// ===============================
// upload-preview.js
// PHẦN 2B
// ===============================

// Khi video load xong
previewVideo.addEventListener("loadedmetadata", () => {

    videoDuration = previewVideo.duration || 0;

    console.log(
        "Thời lượng:",
        videoDuration.toFixed(1),
        "giây"
    );

    console.log(
        "Độ phân giải:",
        previewVideo.videoWidth +
        "x" +
        previewVideo.videoHeight
    );

    // Tự phát preview
    previewVideo.currentTime = 0;

    previewVideo.muted = true;

    const p = previewVideo.play();

    if (p !== undefined) {

        p.catch(() => {});

    }

});

// Lặp preview giống TikTok
previewVideo.addEventListener("ended", () => {

    previewVideo.currentTime = 0;

    const p = previewVideo.play();

    if (p !== undefined) {

        p.catch(() => {});

    }

});

// Nếu lỗi video
previewVideo.addEventListener("error", () => {

    alert("Không đọc được video.");

    if (previewVideo.dataset.url) {

        URL.revokeObjectURL(
            previewVideo.dataset.url
        );

    }

    previewVideo.removeAttribute("src");

    previewVideo.load();

    previewVideo.style.display = "none";

    videoInput.value = "";

    selectedVideo = null;

});

// Hàm dùng cho các file sau
window.uploadPreview = {

    getVideo(){

        return selectedVideo;

    },

    getThumbnail(){

        return selectedThumbnail;

    },

    getDuration(){

        return videoDuration;

    }

};

console.log("upload-preview 2B loaded");
// ===============================
// upload-preview.js
// PHẦN 2C
// ===============================

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const allowImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
];

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    // kiểm tra định dạng

    if (!allowImageTypes.includes(file.type)) {

        alert("Ảnh không được hỗ trợ.");

        imageInput.value = "";

        return;

    }

    // kiểm tra dung lượng

    if (file.size > MAX_IMAGE_SIZE) {

        alert("Ảnh tối đa 10MB.");

        imageInput.value = "";

        return;

    }

    selectedThumbnail = file;

    // xóa URL cũ

    if (previewImage.dataset.url) {

        URL.revokeObjectURL(
            previewImage.dataset.url
        );

    }

    const url = URL.createObjectURL(file);

    previewImage.dataset.url = url;

    previewImage.src = url;

    previewImage.style.display = "block";

});

previewImage.onload = () => {

    console.log(
        "Thumbnail:",
        previewImage.naturalWidth +
        "x" +
        previewImage.naturalHeight
    );

};

previewImage.onerror = () => {

    alert("Không đọc được ảnh.");

    if (previewImage.dataset.url) {

        URL.revokeObjectURL(
            previewImage.dataset.url
        );

    }

    previewImage.removeAttribute("src");

    previewImage.style.display = "none";

    imageInput.value = "";

    selectedThumbnail = null;

};
