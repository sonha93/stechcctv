function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products){
  localStorage.setItem("products", JSON.stringify(products));
}

/* =========================
   🟢 ADD PRODUCT (GIỮ NGUYÊN + THÊM FEATURED)
========================= */
function addProductWithImage(){

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const oldPrice = Number(document.getElementById("oldPrice")?.value || 0);
  const moTa = document.getElementById("desc").value;
  const file = document.getElementById("fileImg").files[0];

  // ⭐ FEATURED CHECKBOX (MỚI THÊM)
  const featured = document.getElementById("featured")?.checked || false;

  if(!name || !price){
    alert("Nhập tên + giá!");
    return;
  }

  if(!file){
    alert("Chọn ảnh!");
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

      // ⭐ THÊM FEATURED
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
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("oldPrice").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("fileImg").value = "";

    if(document.getElementById("featured")){
      document.getElementById("featured").checked = false;
    }
  };

  reader.readAsDataURL(file);
}

/* =========================
   🟡 ADD PRODUCT CŨ (GIỮ NGUYÊN)
========================= */
function addProduct(){

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const oldPrice = Number(document.getElementById("oldPrice").value || 0);
  const file = document.getElementById("fileImg").files[0];

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
      featured: false, // ⭐ mặc định không lên trang chủ

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

  reader.readAsDataURL(file);
}