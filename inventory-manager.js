// ============================
// MANUAL MINUS PRODUCT INFO
// CHẠY DỌC
// ============================

const manualMinusSearch = document.getElementById(
  "manualMinusSearch"
);

const manualMinusProductInfo = document.getElementById(
  "manualMinusProductInfo"
);

if(
  manualMinusSearch &&
  manualMinusProductInfo
){

  // ép layout dọc bằng JS
  const wrap = document.querySelector(
    ".manual-minus-wrap"
  );

  if(wrap){
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";
    wrap.style.width = "100%";
    wrap.style.alignItems = "stretch";
  }

  [
    "manualMinusSearch",
    "manualMinusQty",
    "manualMinusReason",
    "manualMinusBtn"
  ].forEach(id => {

    const el = document.getElementById(id);

    if(el){
      el.style.width = "100%";
      el.style.height = "48px";
    }

  });

  manualMinusProductInfo.style.width = "100%";
  manualMinusProductInfo.style.minHeight = "80px";
  manualMinusProductInfo.style.display = "flex";
  manualMinusProductInfo.style.flexDirection = "column";
  manualMinusProductInfo.style.justifyContent = "center";
  manualMinusProductInfo.style.alignItems = "flex-start";
  manualMinusProductInfo.style.padding = "12px 14px";

  manualMinusSearch.addEventListener(
    "input",
    async () => {

      const keyword = manualMinusSearch.value
        .trim()
        .toLowerCase();

      if(!keyword){

        manualMinusProductInfo.innerHTML =
          "Chưa chọn sản phẩm";

        return;
      }

      try{

        const productSnap = await db
          .collection("products")
          .get();

        const orderSnap = await db
          .collection("orders")
          .get();

        // SOLD MAP
        const soldMap = {};

        orderSnap.forEach(orderDoc => {

          const order = orderDoc.data();

          if(
            order.status !== "completed" ||
            order.customerCancelled ||
            order.adminCancelled
          ){
            return;
          }

          (order.items || []).forEach(item => {

            const id = String(item.id);

            if(!soldMap[id]){
              soldMap[id] = 0;
            }

            soldMap[id] += Number(item.qty || 0);

          });

        });

        let found = null;

        productSnap.forEach(doc => {

          const data = doc.data();

          const name = String(data.name || "")
            .toLowerCase();

          const productId = String(doc.id)
            .toLowerCase();

          if(
            name.includes(keyword) ||
            productId.includes(keyword)
          ){

            found = {
              id:doc.id,
              ...data
            };

          }

        });

        if(!found){

          manualMinusProductInfo.innerHTML = `
            <span style="
              color:red;
              font-weight:bold;
            ">
              Không tìm thấy sản phẩm
            </span>
          `;

          return;
        }

        const sold = Number(
          soldMap[String(found.id)] || 0
        );

        manualMinusProductInfo.innerHTML = `
          <div>
            <b>${found.name || "-"}</b>
          </div>

          <div>
            ID:
            <span style="color:#666;">
              ${found.id}
            </span>
          </div>

          <div>
            Tồn:
            <span style="
              color:#00c853;
              font-weight:bold;
            ">
              ${Number(found.stock || 0)}
            </span>
          </div>

          <div>
            Đã bán:
            <span style="
              color:#ff9800;
              font-weight:bold;
            ">
              ${sold}
            </span>
          </div>
        `;

      }catch(err){

        console.log(err);

      }

    }
  );

}
