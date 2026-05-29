
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

    let html = "";

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

      // ============================
      // SOLD
      // ============================

      let sold = 0;

      orderSnap.forEach(orderDoc => {

        const order = orderDoc.data();

        if(order.status !== "completed"){
          return;
        }

        (order.items || []).forEach(item => {

          if(item.name === p.name){

            sold += Number(item.qty || 0);

          }

        });

      });

      // ============================
      // PROFIT
      // ============================

      const profit =
        (price - importPrice) * sold;

      // ============================
      // NEGATIVE STOCK
      // ============================

      const negative =
        sold > stock;

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
            ${formatVND(price)}
          </td>

          <td>
            ${
              oldPrice
                ? formatVND(oldPrice)
                : "---"
            }
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
              ? `
                <span style="
                  color:red;
                  font-weight:bold;
                ">
                  Âm kho
                </span>
              `
              : `
                <span style="
                  color:green;
                  font-weight:bold;
                ">
                  OK
                </span>
              `
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
      `;

    });

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

          alert(
            "Lưu giá nhập thành công"
          );

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

ordersSection.style.display =
  "block";
// ============================
// INIT
// ============================

loadInventory();
loadImportPrices();
loadStockMovements();
