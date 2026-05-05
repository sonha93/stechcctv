function addProductWithImage(){

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const oldPrice = Number(document.getElementById("oldPrice")?.value || 0);
  const file = document.getElementById("fileImg").files[0];

  // check input
  if(!name || !price){
    alert("Nhập tên và giá!");
    return;
  }

  if(!file){
    alert("Chọn ảnh đi!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){

    let products = JSON.parse(localStorage.getItem("products")) || [];

    const newProduct = {
      id: Date.now(),
      name,
      price,
      oldPrice,
      img: e.target.result,
      badge: "NEW",
      spec: {
        dungLuong: "",
        tocDo: "",
        loai: "",
        baoHanh: "12 tháng"
      }
    };

    products.push(newProduct);

    localStorage.setItem("products", JSON.stringify(products));

    alert("Đã thêm sản phẩm!");

    // reset form (tốt hơn reload)
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("oldPrice").value = "";
    document.getElementById("fileImg").value = "";
  };

  reader.readAsDataURL(file);
}