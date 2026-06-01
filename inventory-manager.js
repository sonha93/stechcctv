
// ============================
// INVENTORY MANAGER V8
// ============================
const importDateFilter =
  document.getElementById("importDateFilter");

const movementsDateFilter =
  document.getElementById("movementsDateFilter");
const inventoryBody =
  document.getElementById("inventoryBody");
const inventoryFooter =
  document.getElementById("inventoryFooter");
const db = firebase.firestore();
const importBody =
  document.getElementById("importBody");

const movementsBody =
  document.getElementById("movementsBody");

const inventorySearch =
  document.getElementById("inventorySearch");

// ============================
// FORMAT PRICE
// ============================

function formatVND(number){

  return Number(number || 0)
    .toLocaleString("vi-VN") + "đ";

}
// ============================
// PAGINATION
// ============================

let currentPage = 1;
const rowsPerPage = 15;
// ============================
// BUILD SOLD MAP
// ============================

async function buildSoldMap(){

  const orderSnap = await db
    .collection("orders")
    .get();

  const soldMap = {};

  orderSnap.forEach(orderDoc => {

    const order = orderDoc.data();

    const validStatus = [
      "completed",
      "delivered",
      "done"
    ];

    if(
      !validStatus.includes(
        String(order.status || "")
          .toLowerCase()
      ) ||
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

  return soldMap;

}
// ============================
// LOAD INVENTORY
// ============================

async function loadInventory(){

  if(!inventoryBody) return;

  try{

    inventoryBody.innerHTML = `
      <tr>
        <td colspan="10"
          style="text-align:center;padding:20px;">
          Đang tải kho...
        </td>
      </tr>
    `;

    const keyword =
      inventorySearch
        ? inventorySearch.value
            .trim()
            .toLowerCase()
        : "";

    const productSnap = await db
      .collection("products")
      .get();

    const orderSnap = await db
      .collection("orders")
      .get();
  

const soldMap = await buildSoldMap();


let html = "";
let rows = [];

let totalImportPrice = 0;
let totalPrice = 0;
let totalOldPrice = 0;
let totalStock = 0;
let totalSold = 0;
let totalProfit = 0;

    productSnap.forEach(doc => {

      const p = doc.data();

      // search
    if(
  keyword &&
  !String(p.name || "")
      .toLowerCase()
      .includes(keyword) &&
  !String(doc.id)
      .toLowerCase()
      .includes(keyword)
){
  return;
}

      const stock =
        Number(p.stock || 0);
    

      
      const importPrice =
        Number(p.importPrice || 0);

      const price =
        Number(p.price || 0);

      const oldPrice =
        Number(p.oldPrice || 0);

      // ============================
      // SOLD
      // ============================
const sold =
  Number(soldMap[String(doc.id)] || 0);



      // ============================
      // PROFIT
      // ============================

const remain = stock;

const revenue =
  price * sold;

const capital =
  importPrice * sold;
const profit =
  revenue - capital;

totalImportPrice += importPrice;

totalPrice += price;

totalOldPrice += oldPrice;

totalStock += stock;

totalSold += sold;

totalProfit += profit;

const negative =
  remain < 0;

const lowStock =
  remain > 0 && remain <= 5;
rows.push(`
  <tr>

    <td>${doc.id}</td>

    <td>
      ${p.name || "-"}
    </td>

    <td>
      <input
        type="number"
        class="importPriceInput"
        data-id="${doc.id}"
        value="${importPrice}"
        style="
          width:120px;
          padding:8px;
        "
      >
    </td>

    <td>
      ${
        oldPrice
          ? formatVND(oldPrice)
          : "---"
      }
    </td>

    <td>
      ${formatVND(price)}
    </td>

    <td>
      ${stock}
    </td>

    <td>
      ${sold}
    </td>

    <td style="
      color:${profit < 0 ? "red" : "green"};
      font-weight:bold;
    ">
      ${formatVND(profit)}
    </td>

    <td>
      ${
        negative
        ? `<span style="color:red;font-weight:bold;">
            Âm kho
          </span>`
        : lowStock
        ? `<span style="color:#ff9800;font-weight:bold;">
            Tồn thấp
          </span>`
        : `<span style="color:green;font-weight:bold;">
            __
          </span>`
      }
    </td>

    <td>

      <button
        class="saveImportBtn"
        data-id="${doc.id}"
        style="
          padding:8px 12px;
          border:none;
          border-radius:8px;
          background:#00acc1;
          color:white;
          cursor:pointer;
        "
      >
        Lưu
      </button>

    </td>

  </tr>
`);
});
   // ============================
// PAGINATION
// ============================

const totalPages =
  Math.max(
    1,
    Math.ceil(rows.length / rowsPerPage)
  );
if(currentPage > totalPages){
  currentPage = 1;
}

const start =
  (currentPage - 1) * rowsPerPage;

const end =
  start + rowsPerPage;

html =
  rows.slice(start, end).join("");

// EMPTY
if(!html){

  html = `
    <tr>
      <td colspan="10"
        style="
          text-align:center;
          padding:20px;
        ">
        Không có dữ liệu
      </td>
    </tr>
  `;

}

    inventoryBody.innerHTML = html;
    // ============================
// RENDER PAGINATION
// ============================

let pagination =
  document.getElementById("inventoryPagination");

if(!pagination){

  pagination = document.createElement("div");

  pagination.id = "inventoryPagination";

  pagination.style.marginTop = "15px";
  pagination.style.display = "flex";
  pagination.style.gap = "10px";
  pagination.style.alignItems = "center";
  pagination.style.justifyContent = "center";

  inventoryBody
    .closest("table")
    .after(pagination);

}

pagination.innerHTML = `
  <button id="prevPageBtn"
    ${currentPage === 1 ? "disabled" : ""}
    style="
      padding:8px 14px;
      cursor:pointer;
    ">
    ← Prev
  </button>

  <span>
    Trang ${currentPage}/${totalPages || 1}
  </span>

  <button id="nextPageBtn"
    ${currentPage >= totalPages ? "disabled" : ""}
    style="
      padding:8px 14px;
      cursor:pointer;
    ">
    Next →
  </button>
`;

const prevBtn =
  document.getElementById("prevPageBtn");

const nextBtn =
  document.getElementById("nextPageBtn");

if(prevBtn){

  prevBtn.onclick = () => {

    if(currentPage > 1){

     currentPage--;

loadInventory();


    }

  };

}

if(nextBtn){

  nextBtn.onclick = () => {

    if(currentPage < totalPages){

      currentPage++;

      loadInventory();

    }

  };

}
if(inventoryFooter){

inventoryFooter.innerHTML = `

<tr style="
  background:#111;
  color:white;
  font-weight:bold;
">

  <td colspan="2">
    TOTAL
  </td>

  <!-- Giá nhập -->
  <td>
    ${formatVND(totalImportPrice)}
  </td>

 <!-- Giá KM -->
<td>
  ${formatVND(totalOldPrice)}
</td>

<!-- Giá bán -->
<td>
  ${formatVND(totalPrice)}
</td>

  <!-- Tồn -->
  <td style="
    color:${
      totalStock < 0
        ? "red"
        : "#00ff90"
    };
  ">
    ${totalStock}
  </td>

  <!-- Đã bán -->
  <td>
    ${totalSold}
  </td>

  <!-- Lợi nhuận -->
  <td style="
    color:${
      totalProfit < 0
        ? "red"
        : "#00ff90"
    };
  ">
    ${formatVND(totalProfit)}
  </td>

  <td colspan="2">
    ---
  </td>

</tr>

`;
}
    bindInventoryEvents();

  }catch(err){

    console.log(err);

    inventoryBody.innerHTML = `
      <tr>
        <td colspan="10"
          style="
            text-align:center;
            color:red;
            padding:20px;
          ">
          Lỗi tải inventory
        </td>
      </tr>
    `;

  }

}

// ============================
// SAVE IMPORT PRICE
// ============================

function bindInventoryEvents(){

  document
    .querySelectorAll(".saveImportBtn")
.forEach(btn => {

  if(btn.dataset.bound === "true"){
    return;
  }

  btn.dataset.bound = "true";

      btn.addEventListener("click", async () => {

        try{

          const id =
            btn.dataset.id;

          const row =
            btn.closest("tr");

          const importInput =
            row.querySelector(
              ".importPriceInput"
            );

          const importPrice =
            Number(importInput.value || 0);

          // update products
         const productRef = db
  .collection("products")
  .doc(id);

const productDoc =
  await productRef.get();

const productData =
  productDoc.data();

const qtyImport = Number(
  prompt("Nhập số lượng nhập thêm") || 0
);

const currentStock =
  Number(productData.stock || 0);

const newStock =
  currentStock + qtyImport;

const totalImport =
  qtyImport * importPrice;

await productRef.update({

  importPrice,

  stock:newStock,

  totalImportedQty:
    Number(
      productData.totalImportedQty || 0
    ) + qtyImport,

  totalImportValue:
    Number(
      productData.totalImportValue || 0
    ) + totalImport

});

          // save import history
          await db
            .collection("import_prices")
            .add({

              productId:id,

              importPrice,

              createdAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()

            });

          // save stock movement
          await db
            .collection("stock_movements")
            .add({

              productId:id,

              type:"import_price_update",

              qty:0,

              createdAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()

            });

        alert("Lưu giá nhập thành công");

currentPage = 1;
loadInventory();
loadImportPrices();
loadStockMovements();

      }catch(err){

  console.error(err);

  alert(err.message);

}

      });

    });

}

// ============================
// LOAD IMPORT PRICES
// ============================

async function loadImportPrices(){

  if(!importBody) return;

  try{

    const snap = await db
      .collection("import_prices")
      .orderBy("createdAt","desc")
      .limit(50)
      .get();

let html = "";


    for(const doc of snap.docs){

      const data = doc.data();

     const selectedDate =
  importDateFilter?.value;

if(!data.createdAt){
  continue;
}

if(selectedDate){

  const itemDate =
    data.createdAt
      .toDate()
      .toISOString()
      .split("T")[0];

  if(itemDate !== selectedDate){
    continue;
  }

}
      
      let productName = "-";

      try{

        const productDoc = await db
          .collection("products")
          .doc(data.productId)
          .get();

        if(productDoc.exists){

          productName =
            productDoc.data().name;

        }

      }catch{}

  html += `
        <tr>

          <td>${productName}</td>

          <td>
            ${formatVND(
              data.importPrice
            )}
          </td>

          <td>
           ${
data.createdAt &&
typeof data.createdAt.toDate === "function"
  ? data.createdAt
      .toDate()
      .toLocaleString("vi-VN")
  : "-"
}
            
          </td>

        </tr>
      `;

    }

    if(!html){

      html = `
        <tr>
          <td colspan="3"
            style="
              text-align:center;
              padding:20px;
            ">
            Chưa có dữ liệu
          </td>
        </tr>
      `;

    }

    importBody.innerHTML = html;

  }catch(err){

    console.log(err);

  }

}

// ============================
// LOAD STOCK MOVEMENTS
// ============================

async function loadStockMovements(){

  if(!movementsBody) return;

  try{

    const snap = await db
      .collection("stock_movements")
      .orderBy("createdAt","desc")
      .limit(100)
      .get();

    let html = "";

    for(const doc of snap.docs){

      const data = doc.data();
      
    const selectedDate =
  movementsDateFilter?.value;

if(!data.createdAt){
  continue;
}

if(selectedDate){

  const itemDate =
    data.createdAt
      .toDate()
      .toISOString()
      .split("T")[0];

  if(itemDate !== selectedDate){
    continue;
  }

}

      let productName = "-";

      try{

        const productDoc = await db
          .collection("products")
          .doc(data.productId)
          .get();

        if(productDoc.exists){

          productName =
            productDoc.data().name;

        }

      }catch{}

      html += `
        <tr>

          <td>${productName}</td>

          <td>${data.type || "-"}</td>

         <td style="
  color:${
    data.type === "MANUAL_MINUS"
      ? "red"
      : "#00c853"
  };
  font-weight:bold;
">
  ${
    data.type === "MANUAL_MINUS"
      ? "-" + Number(data.qty || 0)
      : "+" + Number(data.qty || 0)
  }
</td>

          <td>
            ${
  data.createdAt &&
  typeof data.createdAt.toDate === "function"
    ? data.createdAt
        .toDate()
        .toLocaleString("vi-VN")
    : "-"
}
          </td>

        </tr>
      `;

    }

    if(!html){

      html = `
        <tr>
          <td colspan="4"
            style="
              text-align:center;
              padding:20px;
            ">
            Chưa có dữ liệu
          </td>
        </tr>
      `;

    }

    movementsBody.innerHTML = html;

  }catch(err){

    console.log(err);

  }

}

// ============================
// SEARCH
// ============================

if(inventorySearch){

  inventorySearch
    .addEventListener("input", () => {

      loadInventory();

    });

}

// ============================
// SWITCH MODULE
// ============================

const ordersSection =
  document.getElementById("ordersSection");

const inventorySection =
  document.getElementById("inventorySection");

const importSection =
  document.getElementById("importSection");

const movementsSection =
  document.getElementById("movementsSection");
const historySection =
  document.getElementById("historySection");
function hideAllSections(){
if(historySection)
  historySection.style.display = "none";
  if(ordersSection)
    ordersSection.style.display = "none";

  if(inventorySection)
    inventorySection.style.display = "none";

  if(importSection)
    importSection.style.display = "none";

  if(movementsSection)
    movementsSection.style.display = "none";
 // HIDE INVENTORY PAGINATION
  const inventoryPagination =
    document.getElementById(
      "inventoryPagination"
    );

  if(inventoryPagination){
    inventoryPagination.style.display =
      "none";
  }

}


document
  .querySelectorAll(
    'input[name="adminView"]'
  )
  .forEach(radio => {

    radio.addEventListener(
      "change",
      () => {

        hideAllSections();

        const value = radio.value;

        // ORDERS
        if(value === "orders"){

          ordersSection.style.display =
            "block";

        }

        // INVENTORY
        if(value === "inventory"){

          inventorySection.style.display =
            "block";
const inventoryPagination =
  document.getElementById(
    "inventoryPagination"
  );

if(inventoryPagination){
  inventoryPagination.style.display =
    "flex";
}
          loadInventory();

        }

        // IMPORT
        if(value === "import"){

          importSection.style.display =
            "block";

          loadImportPrices();

        }

        // MOVEMENTS
        if(value === "movements"){

          movementsSection.style.display =
            "block";

          loadStockMovements();

        }

        // HISTORY
        if(value === "history"){

          historySection.style.display =
            "block";

          loadHistory();

        }

      } // đóng callback change
    ); // đóng addEventListener

  }); // đóng forEach
if(importDateFilter){
  importDateFilter.addEventListener(
    "change",
    loadImportPrices
  );
}

if(movementsDateFilter){
  movementsDateFilter.addEventListener(
    "change",
    loadStockMovements
  );
}
const clearImportDate =
  document.getElementById("clearImportDate");

if(clearImportDate){

  clearImportDate.addEventListener(
    "click",
    () => {

      importDateFilter.value = "";

      loadImportPrices();

    }
  );

}

const clearMovementsDate =
  document.getElementById("clearMovementsDate");

if(clearMovementsDate){

  clearMovementsDate.addEventListener(
    "click",
    () => {

      movementsDateFilter.value = "";

      loadStockMovements();

    }
  );

}
// Mặc định chọn ngày hôm nay
const today = new Date();
today.setMinutes(
  today.getMinutes() - today.getTimezoneOffset()
);

const todayStr =
  today.toISOString().split("T")[0];

if(importDateFilter){
  importDateFilter.value = todayStr;
}

if(movementsDateFilter){
  movementsDateFilter.value = todayStr;
}
// mặc định
hideAllSections();

ordersSection.style.display =
  "block";
// ============================
// MANUAL MINUS PRODUCT INFO
// ============================

const manualMinusSearch =
  document.getElementById(
    "manualMinusSearch"
  );

const manualMinusProductInfo =
  document.getElementById(
    "manualMinusProductInfo"
  );

if(
  manualMinusSearch &&
  manualMinusProductInfo
){

  manualMinusSearch.addEventListener(
    "input",
    async () => {

      const keyword =
        manualMinusSearch.value
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

        const soldMap = await buildSoldMap();

        let found = null;

        productSnap.forEach(doc => {

          const data = doc.data();

          const name =
            String(data.name || "")
              .toLowerCase();

          const productId =
            String(doc.id)
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
            <span style="color:red;font-weight:bold;">
              Không tìm thấy sản phẩm
            </span>
          `;

          return;

        }

        const sold =
          Number(
            soldMap[String(found.id)] || 0
          );

        manualMinusProductInfo.innerHTML = `
          <div>
            <b>${found.name || "-"}</b>
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
// ============================
// MANUAL MINUS STOCK
// ============================

const manualMinusBtn =
  document.getElementById(
    "manualMinusBtn"
  );

if(manualMinusBtn){

  manualMinusBtn.addEventListener(
    "click",
    async () => {

      try{

        const keyword =
          document
            .getElementById(
              "manualMinusSearch"
            )
            .value
            .trim()
            .toLowerCase();

        const qty =
          Number(
            document
              .getElementById(
                "manualMinusQty"
              )
              .value || 0
          );

        const reason =
          document
            .getElementById(
              "manualMinusReason"
            )
            .value
            .trim();

        if(!keyword){

          alert("Nhập tên sản phẩm");
          return;

        }

        if(qty <= 0){

          alert("Số lượng không hợp lệ");
          return;

        }

        // tìm sản phẩm
        const snap = await db
          .collection("products")
          .get();

        let foundDoc = null;

        snap.forEach(doc => {

          const data = doc.data();

          const name =
            String(data.name || "")
              .toLowerCase();

         const productId =
  String(doc.id).toLowerCase();

if(
  name.includes(keyword) ||
  productId.includes(keyword)
){
  foundDoc = doc;
}

        });

        if(!foundDoc){

          alert("Không tìm thấy sản phẩm");
          return;

        }

        const product =
          foundDoc.data();

        const currentStock =
          Number(product.stock || 0);

      const newStock =
  Number(currentStock) - Number(qty);

console.log({
  currentStock,
  qty,
  newStock
});

        // update stock
        await db
          .collection("products")
          .doc(foundDoc.id)
          .update({

            stock:newStock

          });

        // save movement
        await db
          .collection("stock_movements")
          .add({

            productId:foundDoc.id,

            type:"MANUAL_MINUS",

            qty:qty,

            reason:reason || "Sự cố",

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()

          });

        alert(
          `Đã trừ ${qty} stock`
        );

        // clear input
        document.getElementById(
          "manualMinusSearch"
        ).value = "";

        document.getElementById(
          "manualMinusQty"
        ).value = "";

        document.getElementById(
          "manualMinusReason"
        ).value = "";

        loadInventory();
        loadStockMovements();

      }catch(err){

        console.log(err);

        alert(err.message);

      }

    }
  );

}
// ============================
// INIT
// ============================

loadInventory();
loadImportPrices();
loadStockMovements();
