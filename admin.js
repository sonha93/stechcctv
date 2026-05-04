function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products){
  localStorage.setItem("products", JSON.stringify(products));
}

/* =========================
   🟢 ADD PRODUCT (FULL FIX)
========================= */
function addProductWithImage(e){

  // ⭐ chặn reload form nếu có form
  e?.preventDefault();

  const nameEl = document.getElementById("name");
  const priceEl = document.getElementById("price");
  const oldPriceEl = document.getElementById("oldPrice");
  const descEl = document.getElementById("desc");
  const fileEl = document.getElementById("fileImg");
  const featuredEl = document.getElementById("featured");

  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const oldPrice = Number(oldPriceEl?.value || 0);
  const moTa = descEl?.value || "";
  const file = fileEl?.files?.[0];
  const featured = featuredEl?.checked || false;

  // ⭐ DEBUG (rất quan trọng khi lỗi upload)
  console.log("FILE:", file);

  if(!name || !price){
    alert("Nhập tên + giá!");
    return;
  }

  if(!file){
    alert("Chọn ảnh!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event){

    const products = getProducts();

    products.push({
      id: Date.now(),
      name,
      price,
      oldPrice,
      img: event.target.result,

      badge: "NEW",
      featured: featured,

      spec: {
        dungLuong: "",
        tocDo: "",
        loai: "",
        baoHanh: "12 tháng",
        moTa: moTa
      }
    });

    saveProducts(products);

    alert("Đã thêm sản phẩm!");

    // reset form
    nameEl.value = "";
    priceEl.value = "";
    oldPriceEl.value = "";
    descEl.value = "";
    fileEl.value = "";

    if(featuredEl){
      featuredEl.checked = false;
    }
  };

  reader.onerror = function(){
    alert("Lỗi đọc file ảnh!");
  };

  reader.readAsDataURL(file);
}

/* =========================
   🟡 ADD PRODUCT CŨ (GIỮ NGUYÊN)
========================= */
function addProduct(){

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const oldPrice = Number(document.getElementById("oldPrice")?.value || 0);
  const file = document.getElementById("fileImg").files?.[0];

  if(!name || !price){
    alert("Nhập đủ tên + giá");
    return;
  }

  if(!file){
    alert("Chọn ảnh");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){

    const products = getProducts();

    products.push({
      id: Date.now(),
      name,
      price,
      oldPrice,
      img: e.target.result,
      badge: "NEW",
      featured: false,

      spec: {
        dungLuong: "",
        tocDo: "",
        loai: "",
        baoHanh: "12 tháng"
      }
    });

    saveProducts(products);

    alert("Đã thêm sản phẩm!");

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("oldPrice").value = "";
    document.getElementById("fileImg").value = "";
  };

  reader.onerror = function(){
    alert("Lỗi đọc file ảnh!");
  };

  reader.readAsDataURL(file);
}