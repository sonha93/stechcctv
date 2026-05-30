const inventoryDashboard =
  document.getElementById(
    "inventoryDashboard"
  );

const inventoryAlerts =
  document.getElementById(
    "inventoryAlerts"
  );
// ============================
// INVENTORY MANAGER V8
// ============================

const inventoryBody =
  document.getElementById("inventoryBody");
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
// LOAD INVENTORY
// ============================

async function loadInventory(){

  if(!inventoryBody) return;

  try{

    inventoryBody.innerHTML = `
      <tr>
        <td colspan="14"
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
const soldMap = {};

orderSnap.forEach(orderDoc => {

  const order = orderDoc.data();

  if(order.status !== "completed")
    return;

  (order.items || []).forEach(item => {

    soldMap[item.name] =
      (soldMap[item.name] || 0)
      + Number(item.qty || 0);

  });

});
let html = "";

let totalProducts = 0;
let totalStock = 0;
let totalSold = 0;

let totalRevenue = 0;
let totalCost = 0;
let totalProfit = 0;

let totalInventoryValue = 0;

let negativeCount = 0;
let lowStockCount = 0;

const topSelling = [];
const topStock = [];

    productSnap.forEach(doc => {

      const p = doc.data();

      // search
      if(
        keyword &&
        !String(p.name || "")
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
    totalProducts++;

      totalStock += stock;
      // ============================
      // SOLD
      // ============================

     const sold =
  soldMap[p.name] || 0;

      // ============================
      // PROFIT
      // ============================

      const revenue =
  sold * price;

const cost =
  sold * importPrice;

const profit =
  revenue - cost;

const inventoryValue =
  stock * importPrice;

const margin =
  revenue > 0
  ? (
      profit /
      revenue
    ) * 100
  : 0;

      // ============================
      // NEGATIVE STOCK
      // ============================


      totalSold += sold;

totalRevenue += revenue;

totalCost += cost;

totalProfit += profit;

totalInventoryValue +=
  inventoryValue;

if(stock < 0)
  negativeCount++;

if(stock <= 5)
  lowStockCount++;

topSelling.push({
  name:p.name,
  sold
});

topStock.push({
  name:p.name,
  stock
});

let warning = `
<span style="color:green;font-weight:bold">
OK
</span>
`;

if(stock <= 5){
  warning = `
  <span style="color:#ff9800;font-weight:bold">
  Sắp hết
  </span>
  `;
}

if(stock <= 0){
  warning = `
  <span style="color:red;font-weight:bold">
  Hết hàng
  </span>
  `;
}

html += `
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

         <td>${sold}</td>

<td>
  ${formatVND(revenue)}
</td>

<td>
  ${formatVND(cost)}
</td>

<td style="
  color:${profit < 0 ? "red":"green"};
  font-weight:bold;
">
  ${formatVND(profit)}
</td>

<td>
  ${margin.toFixed(1)}%
</td>

<td>
  ${formatVND(inventoryValue)}
</td>

     <td>
  ${warning}
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
      `;

    });

    if(!html){

      html = `
        <tr>
          <td colspan="14"
            style="
              text-align:center;
              padding:20px;
            ">
            Không có dữ liệu
          </td>
        </tr>
      `;

    }
const totalMargin =
  totalRevenue > 0
  ? (
      totalProfit /
      totalRevenue
    ) * 100
  : 0;

if(inventoryDashboard){

  inventoryDashboard.innerHTML = `

<div class="stat-box">
<h3>Tổng SKU</h3>
<span>${totalProducts}</span>
</div>

<div class="stat-box">
<h3>Tồn kho</h3>
<span>${totalStock}</span>
</div>

<div class="stat-box">
<h3>Đã bán</h3>
<span>${totalSold}</span>
</div>

<div class="stat-box">
<h3>Doanh thu</h3>
<span>${formatVND(totalRevenue)}</span>
</div>

<div class="stat-box">
<h3>Giá vốn</h3>
<span>${formatVND(totalCost)}</span>
</div>

<div class="stat-box">
<h3>Lợi nhuận</h3>
<span>${formatVND(totalProfit)}</span>
</div>

<div class="stat-box">
<h3>Margin</h3>
<span>${totalMargin.toFixed(1)}%</span>
</div>

<div class="stat-box">
<h3>Giá trị tồn</h3>
<span>${formatVND(totalInventoryValue)}</span>
</div>

<div class="stat-box">
<h3>Sắp hết hàng</h3>
<span>${lowStockCount}</span>
</div>

`;

}
    const bestSelling =
  topSelling
    .sort((a,b)=>b.sold-a.sold)
    .slice(0,5);

const highestStock =
  topStock
    .sort((a,b)=>b.stock-a.stock)
    .slice(0,5);

if(inventoryAlerts){

inventoryAlerts.innerHTML = `

<h3 style="margin-bottom:10px;">
📈 TOP BÁN CHẠY
</h3>

${bestSelling.map((x,i)=>`
<div>
${i+1}. ${x.name}
- ${x.sold}
</div>
`).join("")}

<hr style="margin:15px 0;">

<h3 style="margin-bottom:10px;">
📦 TỒN KHO CAO
</h3>

${highestStock.map((x,i)=>`
<div>
${i+1}. ${x.name}
- ${x.stock}
</div>
`).join("")}

`;
  }
    inventoryBody.innerHTML = html;

    bindInventoryEvents();

  }catch(err){

    console.log(err);

    inventoryBody.innerHTML = `
      <tr>
        <td colspan="14"
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
          await db
            .collection("products")
            .doc(id)
            .update({
              importPrice
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
              data.createdAt
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

          <td>${data.qty || 0}</td>

          <td>
            ${
              data.createdAt
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

function hideAllSections(){

  if(ordersSection)
    ordersSection.style.display = "none";

  if(inventorySection)
    inventorySection.style.display = "none";

  if(importSection)
    importSection.style.display = "none";

  if(movementsSection)
    movementsSection.style.display = "none";

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

      }
    );

  });

// mặc định
hideAllSections();

if(ordersSection){
  ordersSection.style.display = "block";
}
// ============================
// INIT
// ============================

loadImportPrices();
loadStockMovements();
loadInventory();
