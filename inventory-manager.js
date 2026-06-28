
// ============================
// INVENTORY MANAGER V8
// ============================

const importDateFilter = document.getElementById("importDateFilter");
const movementsDateFilter = document.getElementById("movementsDateFilter");
const inventoryBody = document.getElementById("inventoryBody");
const inventoryFooter = document.getElementById("inventoryFooter");

const db = firebase.firestore();

const importBody = document.getElementById("importBody");
const movementsBody = document.getElementById("movementsBody");
const inventorySearch = document.getElementById("inventorySearch");

let canManageStock = false;
let canAddStock = false;

firebase.auth().onAuthStateChanged(async (user) => {

    if (!user) return;

   const permSnap = await firebase
    .database()
    .ref(user.uid + "/permissions")
    .once("value");

const permissions = permSnap.val() || {};

canManageStock = permissions.manageStock === true;
canAddStock = permissions.addStock === true;

});
// ============================
// FORMAT PRICE
// ============================

function formatVND(number){
    return Number(number || 0).toLocaleString("vi-VN") + "đ";
}

// ============================
// PAGINATION
// ============================

let currentPage = 1;
const rowsPerPage = 15;

// ============================
// LOAD INVENTORY
// ============================

async function loadInventory(){

    if(!inventoryBody) return;

    try{

        inventoryBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:20px;">
                    Đang tải kho...
                </td>
            </tr>
        `;

        const keyword = inventorySearch
            ? inventorySearch.value.trim().toLowerCase()
            : "";

        const productSnap = await db.collection("products").get();
        const orderSnap = await db.collection("orders").get();

        const soldMap = {};

        orderSnap.forEach(orderDoc => {

            const order = orderDoc.data();

       if (
    order.customerCancelled ||
    order.adminCancelled ||
    order.status === "cancelled" ||
    order.status === "returned"
) {
    return;
}

            (order.items || []).forEach(item => {

    const id = String(item.productId || "");

    if (!id) return;

    soldMap[id] = (soldMap[id] || 0) + Number(item.qty || 0);

});

        });

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

            // SEARCH
            if(
                keyword &&
                !String(p.name || "").toLowerCase().includes(keyword) &&
                !String(doc.id).toLowerCase().includes(keyword)
            ){
                return;
            }

            const stock = Number(p.stock || 0);
            const importPrice = Number(p.importPrice || 0);
            const price = Number(p.price || 0);
            const oldPrice = Number(p.oldPrice || 0);

            // SOLD
            console.log("Product ID:", doc.id);
console.log("soldMap:", soldMap);
            const sold = Number(soldMap[String(doc.id)] || 0);

            // PROFIT
            const remain = stock;
            const revenue = price * sold;
            const capital = importPrice * sold;
            const profit = revenue - capital;

            totalImportPrice += importPrice;
            totalPrice += price;
            totalOldPrice += oldPrice;
            totalStock += stock;
            totalSold += sold;
            totalProfit += importPrice * stock;

            const negative = remain < 0;
            const lowStock = remain > 0 && remain <= 5;

            rows.push(`
                <tr>

                    <td>${doc.id}</td>

                    <td>
                        ${p.name || "-"}
                    </td>

                    <td>
                       ${formatVND(importPrice)}
                    
                    </td>

                    <td>
                        ${oldPrice ? formatVND(oldPrice) : ""}
                    </td>

                  <td>
    ${formatVND(price)}
</td>

<td>
    ${
        canManageStock
        ? `
        <input
            type="number"
            class="add-stock-input"
            min="0"
            value="0"
            style="
                width:80px;
                padding:6px;
                border:1px solid #ddd;
                border-radius:6px;
                text-align:center;
            "
        >
        `
        : ""
    }
</td>

<td>
    ${stock}
</td>

                    <td>
                        ${sold}
                    </td>

                 <td
    style="
        color:#00c853;
        font-weight:bold;
    "
>
    ${formatVND(importPrice * stock)}
</td>

                    <td>

                        ${
                            negative
                            ? `
                                <span style="color:red;font-weight:bold;">
                                    Âm kho
                                </span>
                            `
                            : lowStock
                            ? `
                                <span style="color:#ff9800;font-weight:bold;">
                                    Tồn thấp
                                </span>
                            `
                            : `
                                <span style="color:green;font-weight:bold;">
                                    
                                </span>
                            `
                        }

                    </td>

                  <td>

    ${
        canManageStock
        ? `
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
        `
        : ""
    }

</td>

                </tr>
            `);

        });

        // ============================
        // PAGINATION
        // ============================

        const totalPages = Math.max(
            1,
            Math.ceil(rows.length / rowsPerPage)
        );

        if(currentPage > totalPages){
            currentPage = 1;
        }

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        html = rows.slice(start, end).join("");

        // EMPTY
        if(!html){

            html = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:20px;">
                        Không có dữ liệu
                    </td>
                </tr>
            `;

        }

        inventoryBody.innerHTML = html;

        // ============================
        // RENDER PAGINATION
        // ============================

        let pagination = document.getElementById("inventoryPagination");

        if(!pagination){

            pagination = document.createElement("div");

            pagination.id = "inventoryPagination";

            pagination.style.marginTop = "15px";
            pagination.style.display = "flex";
            pagination.style.gap = "10px";
            pagination.style.alignItems = "center";
            pagination.style.justifyContent = "center";

            const table =
    inventoryBody.closest("table");

if(table){

    table.after(pagination);

}

        }

        pagination.innerHTML = `
            <button
                id="prevPageBtn"
                ${currentPage === 1 ? "disabled" : ""}
                style="
                    padding:8px 14px;
                    cursor:pointer;
                "
            >
                ← Prev
            </button>

            <span>
                Trang ${currentPage}/${totalPages || 1}
            </span>

            <button
                id="nextPageBtn"
                ${currentPage >= totalPages ? "disabled" : ""}
                style="
                    padding:8px 14px;
                    cursor:pointer;
                "
            >
                Next →
            </button>
        `;

        const prevBtn = document.getElementById("prevPageBtn");
        const nextBtn = document.getElementById("nextPageBtn");

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

        // ============================
        // FOOTER
        // ============================

if(inventoryFooter){

    inventoryFooter.innerHTML = `
        <tr
            style="
                background:#111;
                color:white;
                font-weight:bold;
            "
        >

            <td colspan="2">
                TOTAL
            </td>

            <td>
                ${formatVND(totalImportPrice)}
            </td>

            <td>
                ${formatVND(totalOldPrice)}
            </td>

            <td>
                ${formatVND(totalPrice)}
            </td>

            <td></td>

            <td
                style="
                    color:${totalStock < 0 ? "red" : "#00ff90"};
                "
            >
                ${totalStock}
            </td>

            <td>
                ${totalSold}
            </td>

            <td
                style="
                    color:${totalProfit < 0 ? "red" : "#00ff90"};
                "
            >
                ${formatVND(totalProfit)}
            </td>

            <td>

                
            </td>

            <td></td>

        </tr>
    `;

}

        bindInventoryEvents();

    }catch(err){

        console.log(err);

        inventoryBody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    style="
                        text-align:center;
                        color:red;
                        padding:20px;
                    "
                >
                    Lỗi tải inventory
                </td>
            </tr>
        `;

    }

}
// ============================
// SAVE PRODUCT CHANGE LOG
// ============================

async function saveProductChangeLog({

    productId,
    productName,

    changedBy = "admin",

    oldImportPrice = 0,
    newImportPrice = 0,

    oldPrice = 0,
    newPrice = 0,

    oldOldPrice = 0,
    newOldPrice = 0,

    changeType = "IMPORT"

}){

    try{

       const profitBefore =
    Number(oldPrice) -
    Number(oldImportPrice);

const profitAfter =
    Number(newPrice) -
    Number(newImportPrice);

const priceChangePercent =
    Number(oldPrice) > 0
    ? (
        (
            newPrice -
            oldPrice
        ) /
        oldPrice *
        100
    ).toFixed(2)
    : 0;

const importChangePercent =
    Number(oldImportPrice) > 0
    ? (
        (
            newImportPrice -
            oldImportPrice
        ) /
        oldImportPrice *
        100
    ).toFixed(2)
    : 0;
        await db
            .collection(
                "product_change_logs"
            )
            .add({

                productId,
                productName,

                changedBy,
                changeType,

                before:{
                    importPrice:
                        oldImportPrice,

                    price:
                        oldPrice,

                    oldPrice:
                        oldOldPrice
                },

                after:{
                    importPrice:
                        newImportPrice,

                    price:
                        newPrice,

                    oldPrice:
                        newOldPrice
                },

               profitBefore,
profitAfter,

priceChangePercent,
importChangePercent,
                createdAt:
                    firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

            });

    }catch(err){

        console.error(
            "Save log error:",
            err
        );

    }

}
// ============================
// SAVE IMPORT PRICE
// ============================

function bindInventoryEvents(){

    document.querySelectorAll(".saveImportBtn").forEach(btn => {

        if(btn.dataset.bound === "true"){
            return;
        }

        btn.dataset.bound = "true";
       
        btn.addEventListener("click", async () => {
        if(!canAddStock){
    alert("Bạn không có quyền nhập thêm hàng");
    return;
}
            try{

                const id = btn.dataset.id;

                const row = btn.closest("tr");

               
                
               
                // UPDATE PRODUCTS

               const productRef = db.collection("products").doc(id);

const productDoc = await productRef.get();

const productData = productDoc.data();

const importPrice =
    Number(productData.importPrice || 0);
if (!Number.isFinite(importPrice) || importPrice < 0) {
    alert("Giá nhập không hợp lệ");
    return;
}
const qtyImport = Number(
    row.querySelector(".add-stock-input")?.value || 0
);

if(
    !Number.isInteger(qtyImport)
    || qtyImport <= 0
){

    alert("Lưu không thành công");

    return;
}


                const currentStock = Number(productData.stock || 0);

                const newStock = currentStock + qtyImport;

                const totalImport = qtyImport * importPrice;

              await productRef.update({

    stock:newStock,

    totalImportedQty:
        Number(productData.totalImportedQty || 0)
        + qtyImport,

    totalImportValue:
        Number(productData.totalImportValue || 0)
        + (
            qtyImport *
            Number(productData.importPrice || 0)
        )

});
                await saveProductChangeLog({

    productId:id,
    productName:productData.name,

    oldImportPrice:
        productData.importPrice || 0,

    newImportPrice:
        importPrice,

    oldPrice:
        productData.price || 0,

    newPrice:
        productData.price || 0,

    oldOldPrice:
        productData.oldPrice || 0,

    newOldPrice:
        productData.oldPrice || 0,

    changedBy:"admin",

    changeType:"IMPORT"

});
                // SAVE STOCK MOVEMENT
if(qtyImport > 0){

 await db.collection("stock_movements").add({

    productId:id,
    productName: productData.name || "",

    type:"IMPORT",

    qty:qtyImport,
    remainQty:qtyImport,
    reason:"Nhập kho",
     staffName:
        document.getElementById("adminName")?.textContent || "",
    importPrice: importPrice,
    createdAt:
        firebase.firestore
        .FieldValue
        .serverTimestamp()

});
}
                // SAVE IMPORT HISTORY

           if(qtyImport > 0){

    await db.collection("import_prices").add({
        productId:id,
        importPrice,
        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()
    });

}
                // SAVE STOCK MOVEMENT

              
                alert("Đã lưu");

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

            const selectedDate = importDateFilter?.value;

            if(!data.createdAt){
                continue;
            }

            if(selectedDate){

                const itemDate = data.createdAt
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
                    productName = productDoc.data().name;
                }

            }catch{}

            html += `
                <tr>

                    <td>${productName}</td>

                    <td>
                        ${formatVND(data.importPrice)}
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
                    <td colspan="3" style="text-align:center;padding:20px;">
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

            const selectedDate = movementsDateFilter?.value;
            const keyword =
    manualMinusSearch?.value
    ?.trim()
    .toLowerCase() || "";
            if(!data.createdAt){
                continue;
            }

            if(selectedDate){

                const itemDate = data.createdAt
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
                    productName = productDoc.data().name;
                }
                    if(keyword){

    const productId =
        String(data.productId || "")
        .toLowerCase();

    const productNameLower =
        String(productName || "")
        .toLowerCase();

    if(
        !productNameLower.includes(keyword)
        &&
        !productId.includes(keyword)
    ){
        continue;
    }

}
            }catch{}
       html += `
<tr>
    <td>${productName}</td>

   <td>
${
  data.type === "SALE"
    ? "SALE"
    : data.type === "RETURN"
    ? "RETURN"
    : data.type || ""
}
</td>

    <td style="color:${data.qty < 0 ? "red" : "#00c853"};">
        ${data.qty > 0 ? "+" + data.qty : data.qty}
    </td>

    <td>${data.reason || "Đơn hàng 0đ"}</td>

    <td>${data.staffName || "-"}</td>

    <td>
        ${
            data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toLocaleString("vi-VN")
            : "-"
        }
    </td>

</tr>
`;
        }

        if(!html){

            html = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;">
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
// loadHistory
// ============================
async function loadHistory(){

    const historyBody =
        document.getElementById("historyBody");

    const keyword =
        document.getElementById("historySearch")
        ?.value
        .trim()
        .toLowerCase();

    const moveSnap =
        await db.collection("stock_movements")
        .orderBy("createdAt","asc")
        .get();

    const salesSnap =
        await db.collection("sales_history")
        .orderBy("createdAt","asc")
        .get();

    const productSnap =
        await db.collection("products")
        .get();

    let html = "";

    // MAP PRODUCT
    const productMap = {};

    productSnap.forEach(doc=>{

        productMap[doc.id] = doc.data();

    });

   // GROUP SALES
const salesMap = {};
salesSnap.forEach(doc => {

    const sale = doc.data();

    const id = String(
        sale.productId || ""
    );

    if(!id) return;

    salesMap[id] =
        (salesMap[id] || 0)
        + Number(sale.qty || 0);

});
    // GROUP RETURN
const returnMap = {};

moveSnap.forEach(doc => {

    const data = doc.data();

    if(data.type !== "RETURN") return;

    const id = String(data.productId || "");

    if(!id) return;

    returnMap[id] =
        (returnMap[id] || 0)
        + Math.abs(Number(data.qty || 0));

});

// TRỪ HÀNG ĐÃ TRẢ KHỎI SỐ ĐÃ BÁN
Object.keys(returnMap).forEach(id => {

    salesMap[id] = Math.max(
        0,
        (salesMap[id] || 0) - returnMap[id]
    );

});
   const minusMap = {};
const plusMap = {};

moveSnap.forEach(doc=>{

    const data = doc.data();

    const id = data.productId;

    if(!id) return;

    if(data.type === "MANUAL_MINUS"){

        minusMap[id] =
            (minusMap[id] || 0)
            +
            Math.abs(Number(data.qty || 0));

    }

    if(data.type === "MANUAL_PLUS"){

        plusMap[id] =
            (plusMap[id] || 0)
            +
            Number(data.qty || 0);

    }

});
    // FIFO SALES LEFT
    const salesLeftMap = {
        ...salesMap
    };

    const minusLeftMap = {
    ...minusMap
};

const plusLeftMap = {
    ...plusMap
};
    // LOOP IMPORT
    moveSnap.forEach(doc=>{

        const data = doc.data();
if(data.type !== "IMPORT"){
    return;
}

        const id = data.productId;

        const p = productMap[id];

        if(!p)
            return;

        if(
            keyword &&
            !String(p.name || "")
                .toLowerCase()
                .includes(keyword) &&
            !String(id)
                .toLowerCase()
                .includes(keyword)
        ){
            return;
        }

        const qty =
            Number(data.qty || 0);
const salesLeft =
    Number(salesLeftMap[id] || 0);

const soldInPeriod =
    Math.min(
        salesLeft,
        qty
    );

salesLeftMap[id] =
    salesLeft - soldInPeriod;



const minusLeft =
    Number(
        minusLeftMap[id] || 0
    );

const lossInPeriod =
    Math.min(
        minusLeft,
        qty
    );

minusLeftMap[id] =
    minusLeft - lossInPeriod;

const plusLeft =
    Number(
        plusLeftMap[id] || 0
    );

const plusInPeriod =
    Math.min(
        plusLeft,
        qty
    );

plusLeftMap[id] =
    plusLeft - plusInPeriod;

const remain =
    qty
    - soldInPeriod
    - lossInPeriod
    + plusInPeriod;

        html += `
            <tr>

                <td>${id}</td>

                <td>${p.name || "-"}</td>

                <td>
                    ${
                        data.createdAt
                        ? data.createdAt
                            .toDate()
                            .toLocaleString("vi-VN")
                        : "-"
                    }
                </td>

                <td>${qty}</td>

                <td>
                    ${formatVND(data.importPrice || 0)}
                </td>

                <td>
                    ${soldInPeriod}
                </td>

                <td>
                    ${remain}
                </td>

<td
style="
    color:red;
    font-weight:bold;
"
>
    ${
        lossInPeriod > 0
        ? "-" + lossInPeriod
        : 0
    }
</td>

            </tr>
        `;

    });


    // ======================
    // TOTAL
    // ======================

    let totalImport = 0;
let totalSold = 0;
let totalMinus = 0;
let totalPlus = 0;

    moveSnap.forEach(doc=>{

        const data = doc.data();

        if(
            data.type === "IMPORT"
        ){

            // nếu đang search
          const p =
    productMap[data.productId];

if(
    keyword &&
    !String(p?.name || "")
        .toLowerCase()
        .includes(keyword) &&
    !String(data.productId)
        .toLowerCase()
        .includes(keyword)
){
    return;
}

            totalImport +=
                Number(data.qty || 0);

        }

    });

    Object.keys(salesMap).forEach(id => {

    const p = productMap[id];

    if(
        keyword &&
        !String(p?.name || "")
            .toLowerCase()
            .includes(keyword) &&
        !String(id)
            .toLowerCase()
            .includes(keyword)
    ){
        return;
    }

    totalSold += Number(salesMap[id] || 0);

});
   
moveSnap.forEach(doc=>{

    const data = doc.data();

    const p = productMap[data.productId];

    if(
        keyword &&
        !String(p?.name || "")
        .toLowerCase()
        .includes(keyword) &&
        !String(data.productId)
        .toLowerCase()
        .includes(keyword)
    ){
        return;
    }

    if(data.type === "MANUAL_MINUS"){
        totalMinus += Math.abs(
            Number(data.qty || 0)
        );
    }

    if(data.type === "MANUAL_PLUS"){
        totalPlus += Number(
            data.qty || 0
        );
    }

});
let totalRemain = 0;

Object.entries(productMap).forEach(([id,p])=>{

    if(
        keyword &&
        !String(p?.name || "")
            .toLowerCase()
            .includes(keyword) &&
        !String(id)
            .toLowerCase()
            .includes(keyword)
    ){
        return;
    }

    totalRemain += Number(
        p.stock || 0
    );

});
    // FOOTER
    html += `
        <tr
            style="
                background:#111;
                color:#fff;
                font-weight:bold;
            "
        >

            <td colspan="3">
                TOTAL
            </td>

            <td>
                ${totalImport}
            </td>

            <td>
                
            </td>

            <td>
                ${totalSold}
            </td>

            <td style="color:#00e676;">
                ${totalRemain}
            </td>

          <td
style="
    color:red;
    font-weight:bold;
"
>
    ${totalMinus > 0 ? "-" + totalMinus : 0}
</td>

        </tr>
    `;

    if(!html){

        html = `
            <tr>
                <td colspan="8"
                style="
                    text-align:center;
                    padding:20px;
                ">
                    Chưa có dữ liệu
                </td>
            </tr>
        `;

    }

    historyBody.innerHTML = html;

}

// ============================
// SEARCH
// ============================

if(inventorySearch){

    inventorySearch.addEventListener("input", () => {

        loadInventory();

    });

}

// ============================
// SWITCH MODULE
// ============================

const ordersSection = document.getElementById("ordersSection");
const inventorySection = document.getElementById("inventorySection");
const importSection = document.getElementById("importSection");
const movementsSection = document.getElementById("movementsSection");
const historySection = document.getElementById("historySection");
const lossSection = document.getElementById("lossSection");
const logsSection = document.getElementById("logsSection");
const salesSection =
    document.getElementById("salesSection");

function hideAllSections(){

    if(historySection) historySection.style.display = "none";
    if(lossSection) lossSection.style.display = "none";
    if(logsSection) logsSection.style.display = "none";
    if(salesSection) salesSection.style.display = "none";
    if(ordersSection) ordersSection.style.display = "none";
    if(inventorySection) inventorySection.style.display = "none";
    if(importSection) importSection.style.display = "none";
   if(movementsSection){
    movementsSection.style.display = "none";
}
    const inventoryPagination =
        document.getElementById("inventoryPagination");

    if(inventoryPagination){
        inventoryPagination.style.display = "none";
    }
}

document
.querySelectorAll('input[name="adminView"]')
.forEach(radio => {

    radio.addEventListener("change", () => {

        hideAllSections();

        const value = radio.value;

        // ORDERS
        if(value === "orders"){
            ordersSection.style.display = "block";
        }

        // INVENTORY
        if(value === "inventory"){

            inventorySection.style.display = "block";

            const inventoryPagination =
                document.getElementById("inventoryPagination");

            if(inventoryPagination){
                inventoryPagination.style.display = "flex";
            }

            loadInventory();

        }

        // IMPORT
        if(value === "import"){

            importSection.style.display = "block";
            loadImportPrices();

        }

        // MOVEMENTS
        if(value === "movements"){

            movementsSection.style.display = "block";
            loadStockMovements();

        }

        // HISTORY
        if(value === "history"){

            historySection.style.display = "block";
            loadHistory();
}
     if(value === "loss"){

    lossSection.style.display = "block";
    loadLoss();

}
if(value === "logs"){

    logsSection.style.display = "block";
    loadProductChangeLogs();

}
        if(value === "sales"){

    salesSection.style.display = "block";

    loadSalesHistory();

}
    });

});

// ============================
// DATE FILTER
// ============================

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

    clearImportDate.addEventListener("click", () => {

        importDateFilter.value = "";
        loadImportPrices();

    });

}

const clearMovementsDate =
    document.getElementById("clearMovementsDate");

if(clearMovementsDate){

    clearMovementsDate.addEventListener("click", () => {

        movementsDateFilter.value = "";
        loadStockMovements();

    });

}

// ============================
// DEFAULT DATE
// ============================

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

// ============================
// DEFAULT VIEW
// ============================

hideAllSections();

ordersSection.style.display = "block";

// ============================
// MANUAL MINUS STOCK (JS SẴN)
// ============================

const manualMinusSearch = document.getElementById("manualMinusSearch");
const manualMinusProductInfo = document.getElementById("manualMinusProductInfo");
const manualMinusQty = document.getElementById("manualMinusQty");
const manualMinusReason = document.getElementById("manualMinusReason");
const manualMinusBtn = document.getElementById("manualMinusBtn");

if (
    manualMinusSearch &&
    manualMinusProductInfo &&
    manualMinusQty &&
    manualMinusReason &&
    manualMinusBtn &&
    manualPlusBtn
) {

    // HIỂN THỊ THÔNG TIN SẢN PHẨM KHI SEARCH
    manualMinusSearch.addEventListener("input", async () => {

        const keyword = manualMinusSearch.value.trim().toLowerCase();

        if (!keyword) {
            manualMinusProductInfo.innerHTML = "Chưa chọn sản phẩm";
            return;
        }

        try {
            const productSnap = await db.collection("products").get();
            const orderSnap = await db.collection("orders").get();

            // SOLD MAP
            const soldMap = {};
            orderSnap.forEach(orderDoc => {
                const order = orderDoc.data();
                if (order.status !== "completed" || order.customerCancelled || order.adminCancelled) return;
               (order.items || []).forEach(item => {

   const id =
    String(
        item.productId ||
        item.id ||
        ""
    );
    if(!id) return;

    if(!soldMap[id]){
        soldMap[id] = 0;
    }

    soldMap[id] +=
        Number(item.qty || 0);

});
            });

         let found = null;

for (const doc of productSnap.docs) {

    const data = doc.data();

    const name =
        String(data.name || "")
        .toLowerCase();

    const productId =
        String(doc.id)
        .toLowerCase();

  if (
    name === keyword ||
    productId === keyword
) {
   found = { ...data, id: doc.id };
    break;
}
    }

            if (!found) {
                manualMinusProductInfo.innerHTML = `<span style="color:red;font-weight:bold;">Không tìm thấy sản phẩm</span>`;
                return;
            }

            const sold = Number(soldMap[String(found.id)] || 0);

            manualMinusProductInfo.innerHTML = `
                <div class="product-info-wrap">
                    <div class="product-info-name">${found.name || "-"}</div>
                    <div class="product-info-stat"><span>Tồn:</span><b class="stock-green">${Number(found.stock || 0)}</b></div>
                    <div class="product-info-stat"><span>Đã bán:</span><b class="sold-orange">${sold}</b></div>
                </div>
            `;

        } catch (err) {
            console.log(err);
        }
    });
    manualPlusBtn.addEventListener("click", async () => {

    if(!canManageStock){
        alert("Bạn không có quyền điều chỉnh tồn kho");
        return;
    }

    try {

        const keyword = manualMinusSearch.value.trim().toLowerCase();
        const qty = Number(manualMinusQty.value);
        const reasonValue = manualMinusReason.value.trim();
        if (!keyword) {
            alert("Nhập tên sản phẩm");
            return;
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            alert("Số lượng không hợp lệ");
            return;
        }

        if (!reasonValue) {
            alert("Chọn lý do");
            return;
        }

        const snap = await db.collection("products").get();

        let foundDoc = null;

        snap.forEach(doc => {

            if (foundDoc) return;

            const data = doc.data();

            const name = String(data.name || "").toLowerCase();
            const productId = String(doc.id).toLowerCase();

            if (
                name === keyword ||
                productId === keyword
            ) {
                foundDoc = doc;
            }

        });

        if (!foundDoc) {
            alert("Không tìm thấy sản phẩm");
            return;
        }

        const product = foundDoc.data();

        const currentStock =
            Number(product.stock || 0);

        const newStock =
            currentStock + qty;

        await db
            .collection("products")
            .doc(foundDoc.id)
            .update({
                stock: newStock
            });

       await db
    .collection("stock_movements")
    .add({
        productId: foundDoc.id,
        productName: product.name || "",
        type: "MANUAL_PLUS",
        qty: qty,
        reason: reasonValue,

       staffName:
    document.getElementById("adminName")?.textContent || "-",

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()
    });
        alert(`Đã cộng ${qty} stock`);

        manualMinusSearch.value = "";
        manualMinusQty.value = "";
        manualMinusReason.value = "";
        manualMinusProductInfo.innerHTML = "Chưa chọn sản phẩm";

        loadInventory();
        loadStockMovements();
        loadHistory();

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

});
    // TRỪ STOCK KHI BẤM NÚT
    manualMinusBtn.addEventListener("click", async () => {
    if(!canManageStock){
    alert("Bạn không có quyền điều chỉnh tồn kho");
    return;
}
        try {
            const keyword = manualMinusSearch.value.trim().toLowerCase();
const qty = Number(manualMinusQty.value);
const reasonValue = manualMinusReason.value.trim();

if (!keyword) {
    alert("Nhập tên sản phẩm");
    return;
}

if (!Number.isInteger(qty) || qty <= 0) {
    alert("Số lượng không hợp lệ");
    return;
}

if (!reasonValue) {
    alert("Chọn lý do");
    return;
}

            // TÌM SẢN PHẨM
            const snap = await db.collection("products").get();
           let foundDoc = null;

snap.forEach(doc => {

    if(foundDoc) return;

    const data = doc.data();

    const name =
        String(data.name || "")
        .toLowerCase();

    const productId =
        String(doc.id)
        .toLowerCase();

    if(
        name === keyword ||
        productId === keyword
    ){
        foundDoc = doc;
    }

});

            if (!foundDoc) { alert("Không tìm thấy sản phẩm"); return; }

            const product = foundDoc.data();
            const currentStock = Number(product.stock || 0);
            if(qty > currentStock){

    alert("Số lượng vượt tồn kho");

    return;
}
            const newStock = currentStock - qty;

            // UPDATE STOCK
            await db.collection("products").doc(foundDoc.id).update({ stock: newStock })
            await db.collection("stock_movements").add({
    productId: foundDoc.id,

    productName: product.name || "",

    type: "MANUAL_MINUS",

    qty: -qty,

    reason: reasonValue,

   staffName:
    document.getElementById("adminName")?.textContent || "-",

    createdAt:
        firebase.firestore.FieldValue.serverTimestamp()
});

            alert(`Đã trừ ${qty} stock`);

            // CLEAR INPUTS
            manualMinusSearch.value = "";
            manualMinusQty.value = "";
            manualMinusReason.value = "";
            manualMinusProductInfo.innerHTML = "Chưa chọn sản phẩm";

            // LOAD LẠI BẢNG
            loadInventory();
            loadStockMovements();
            loadHistory();
        } catch (err) {
            console.log(err);
            alert(err.message);
        }

    });

}
const historySearch =
    document.getElementById("historySearch");

if(historySearch){

    historySearch.addEventListener(
        "input",
        loadHistory
    );

}
// ============================
// LOAD LOSS
// ============================
function normalizeId(id){

    return String(id || "")
        .trim()
        .toLowerCase();

}
async function loadLoss(){

    const lossBody =
        document.getElementById("lossBody");

    if(!lossBody) return;

    try{

        const productSnap =
            await db.collection("products").get();

        const orderSnap =
            await db.collection("orders").get();

        const moveSnap =
            await db.collection("stock_movements").get();

        // ====================
        // MAPS
        // ====================

        const soldMap = {};
        const lossMap = {};
        const plusMap = {};
        const importMap = {};
        const importValueMap = {};
        // ====================
        // SOLD
        // ====================

        orderSnap.forEach(doc => {

            const order = doc.data();

            if(
                order.status !== "completed" ||
                order.customerCancelled ||
                order.adminCancelled
            ){
                return;
            }

            (order.items || []).forEach(item => {

               const id = normalizeId(
                item.productId || item.id
                );

                if(!id) return;

                soldMap[id] =
                    (soldMap[id] || 0)
                    + Number(item.qty || 0);

            });

        });

        // ====================
        // STOCK MOVEMENTS
        // ====================

        moveSnap.forEach(doc => {

            const m = doc.data();

            const id =
    normalizeId(m.productId);

            if(!id) return;
            // NHẬP KHO
            if(m.type === "IMPORT"){

    const qty =
        Number(m.qty || 0);

    const price =
        Number(m.importPrice || 0);

    importMap[id] =
        (importMap[id] || 0)
        + qty;

    importValueMap[id] =
        (importValueMap[id] || 0)
        + (qty * price);

}
            // TRỪ TAY
            if(m.type === "MANUAL_MINUS"){

                lossMap[id] =
                    (lossMap[id] || 0)
                    + Math.abs(
                        Number(m.qty || 0)
                    );

            }

            // CỘNG TAY
            if(m.type === "MANUAL_PLUS"){

                plusMap[id] =
                    (plusMap[id] || 0)
                    + Number(m.qty || 0);

            }

        });

        // ====================
        // HTML
        // ====================

        let html = "";

        productSnap.forEach(doc => {

            const p = doc.data();

            const id = normalizeId(doc.id);

            const importPrice =
                Number(p.importPrice || 0);

            const sellPrice =
                Number(p.price || 0);

            // ====================
            // DATA
            // ====================

          const importedQty =
    Number(importMap[id] || 0);
            const sold =
                soldMap[id] || 0;

            const lossQty =
                lossMap[id] || 0;

            const plusQty =
                plusMap[id] || 0;

            // TỒN HỆ THỐNG
            const systemStock =
                Number(p.stock || 0);

            // TỒN ĐÁNG LẼ PHẢI CÓ
        const expectedStock =
    importedQty
    - sold
    - lossQty
    + plusQty;

            // CHÊNH LỆCH
           
            const stockDiff =
                systemStock
                - expectedStock;
                if(
    Math.abs(stockDiff) > 10
){
    console.log({
        product:p.name,
        importedQty,
        sold,
        lossQty,
        plusQty,
        expectedStock,
        systemStock,
        stockDiff
    });
}
            // ====================
            // MONEY
            // ====================
            const revenue =
    sold * sellPrice;

const capital =
    sold * importPrice;

const profit =
    revenue - capital;

            
const stockValue =
    systemStock * importPrice;

const realLossQty = lossQty;

// giá trị thất thoát thực tế
let lossLeft = realLossQty;
let lossValue = 0;

const importLots = [];

moveSnap.forEach(doc => {

    const m = doc.data();

    if(
        normalizeId(m.productId) === id &&
        m.type === "IMPORT"
    ){

        importLots.push({
            qty: Number(m.qty || 0),
            price: Number(m.importPrice || 0)
        });

    }

});

for(const lot of importLots){

    if(lossLeft <= 0) break;

    const takeQty =
        Math.min(lossLeft, lot.qty);

    lossValue +=
        takeQty * lot.price;

    lossLeft -= takeQty;

}

const realProfit =
    profit - lossValue;

const importValue =
    Number(importValueMap[id] || 0);

// % thất thoát thực tế
const lossPercent =
    importedQty > 0
    ? (
        realLossQty
        /
        importedQty
        *
        100
    ).toFixed(2)
    : "0.00";

                const profitPercent =
    revenue > 0
    ? (
        realProfit
        /
        revenue
        *
        100
    ).toFixed(2)
    : "0.00";
html += `
<tr>

    <td>${id}</td>

    <td>${p.name || "-"}</td>

    <td>
        ${formatVND(importPrice)}
    </td>

    <td>
        ${formatVND(sellPrice)}
    </td>

    <td>
        ${importedQty}
    </td>

    <td>
        ${sold}
    </td>

    <td
    style="
        color:red;
        font-weight:bold;
    "
    >
       ${
    lossQty > 0
    ? "-" + lossQty
    : 0
}
    </td>

    <td
    style="
        color:${
            systemStock < 0
            ? "red"
            : "#00c853"
        };
        font-weight:bold;
    "
    >
        ${systemStock}
    </td>

    <td
    style="
        color:${
            stockDiff === 0
            ? "#00c853"
            : stockDiff > 0
            ? "#ff9800"
            : "red"
        };
        font-weight:bold;
    "
    >
        ${
            stockDiff > 0
            ? "+" + stockDiff
            : stockDiff
        }
    </td>

    <td>
        ${formatVND(importValue)}
    </td>

    <td>
        ${formatVND(revenue)}
    </td>

    <td>
        ${formatVND(stockValue)}
    </td>

    <td
    style="
        color:red;
        font-weight:bold;
    "
    >
        ${
            lossValue > 0
            ? "-" + formatVND(lossValue)
            : formatVND(0)
        }
    </td>

    <td
    style="
        color:red;
        font-weight:bold;
    "
    >
        ${lossPercent}%
    </td>

    <td
    style="
        color:${
            realProfit < 0
            ? "red"
            : "#00c853"
        };
        font-weight:bold;
    "
    >
        ${formatVND(realProfit)}
    </td>

    <td
    style="
        color:${
            profitPercent < 0
            ? "red"
            : "#00c853"
        };
        font-weight:bold;
    "
    >
        ${profitPercent}%
    </td>

</tr>
`;
    
 });

        if(!html){

            html = `
                <tr>
                    <td
                        colspan="16"
                        style="
                            text-align:center;
                            padding:20px;
                        "
                    >
                        Chưa có dữ liệu
                    </td>
                </tr>
            `;

        }

        lossBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
// ============================
// INIT
// ============================

loadInventory();
loadImportPrices();
loadStockMovements();
loadHistory();
loadProductChangeLogs();
loadSalesHistory();
// ============================
// LOAD LOGS
// ============================

async function loadProductChangeLogs(){

    const body =
        document.getElementById(
            "productChangeLogsBody"
        );

    if(!body) return;

    try{

        const snap =
            await db
            .collection(
                "product_change_logs"
            )
            .orderBy(
                "createdAt",
                "desc"
            )
            .limit(500)
            .get();

        let html = "";

        snap.forEach(doc=>{

            const d = doc.data();

            html += `
                <tr>

                    <td>
                        ${
                            d.createdAt
                            ?
                            d.createdAt
                            .toDate()
                            .toLocaleString(
                                "vi-VN"
                            )
                            :
                            "-"
                        }
                    </td>

                    <td>
                        ${d.productId}
                    </td>

                    <td>
                        ${d.productName}
                    </td>

                    <td>
                        ${d.changedBy}
                    </td>

                    <td>
                        ${formatVND(
                            d.before
                            ?.importPrice
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.after
                            ?.importPrice
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.before
                            ?.price
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.after
                            ?.price
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.before
                            ?.oldPrice
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.after
                            ?.oldPrice
                        )}
                    </td>

                 <td
    style="
       color:${
    Number(d.importChangePercent) > 0
    ? "red"
    : "#00c853"
};
        font-weight:bold;
    "
>
    ${
        Number(d.importChangePercent) > 0
        ? "+"
        : ""
    }${d.importChangePercent || 0}%
</td>

<td
    style="
        font-weight:bold;
        color:${
            d.profitAfter >= 0
            ? "#00c853"
            : "red"
        };
    "
>
    ${formatVND(d.profitAfter)}

    <br>

    <small style="font-size:11px;color:#999;">

        ${
            d.profitAfter > d.profitBefore
            ? "▲"
            : d.profitAfter < d.profitBefore
            ? "▼"
            : "="
        }

        ${Math.abs(
            d.profitAfter - d.profitBefore
        ).toLocaleString("vi-VN")}đ

    </small>
</td>
<td
style="
    font-weight:bold;
    color:
    ${
        Number(d.priceChangePercent) > 0
        ? "#00c853"
        : Number(d.priceChangePercent) < 0
        ? "red"
        : "#999"
    };
"
>
    ${
        Number(d.priceChangePercent) > 0
        ? "▲ "
        : Number(d.priceChangePercent) < 0
        ? "▼ "
        : ""
    }

    ${Math.abs(
        Number(d.priceChangePercent || 0)
    ).toFixed(2)}%
</td>
                </tr>
            `;

        });

        if(!html){

            html = `
                <tr>
                    <td
                        colspan="13"
                        style="
                            text-align:center;
                            padding:20px;
                        "
                    >
                        Chưa có dữ liệu
                    </td>
                </tr>
            `;

        }

        body.innerHTML = html;

    }catch(err){

        console.error(err);

    }

}
async function loadSalesHistory(){

    const body =
        document.getElementById(
            "salesHistoryBody"
        );

    if(!body) return;

    try{

        const keyword =
            document.getElementById("salesSearch")
            ?.value
            .trim()
            .toLowerCase();

        const fromDate =
            document.getElementById("salesFromDate")
            ?.value;

        const toDate =
            document.getElementById("salesToDate")
            ?.value;

        const snap =
            await db
            .collection("sales_history")
            .orderBy("createdAt","desc")
            .get();

        let html = "";

        let totalQty = 0;
        let totalRevenue = 0;
        let totalCapital = 0;
        let totalProfit = 0;

        snap.forEach(doc=>{

            const d = doc.data();

            if(!d.createdAt) return;

            const saleDate =
                d.createdAt
                .toDate()
                .toISOString()
                .split("T")[0];

            if(
                fromDate &&
                saleDate < fromDate
            ){
                return;
            }

            if(
                toDate &&
                saleDate > toDate
            ){
                return;
            }

            const productId =
                String(
                    d.productId || ""
                );

            const productName =
                String(
                    d.productName || ""
                );

            if(
                keyword &&
                !productId
                    .toLowerCase()
                    .includes(keyword)
                &&
                !productName
                    .toLowerCase()
                    .includes(keyword)
            ){
                return;
            }

            totalQty +=
                Number(d.qty || 0);

            totalRevenue +=
                Number(d.revenue || 0);

            totalCapital +=
                Number(d.capital || 0);

            totalProfit +=
                Number(d.profit || 0);

            html += `
                <tr>

                    <td>
                        ${
                            d.createdAt
                            .toDate()
                            .toLocaleDateString("vi-VN")
                        }
                    </td>

                    <td>
                        ${productName}
                    </td>

                    <td>
                        ${d.qty}
                    </td>

                    <td>
                        ${formatVND(
                            d.importPrice
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.sellPrice
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.revenue
                        )}
                    </td>

                    <td>
                        ${formatVND(
                            d.capital
                        )}
                    </td>

                    <td
                        style="
                            color:${
                                d.profit < 0
                                ? "red"
                                : "#00c853"
                            };
                            font-weight:bold;
                        "
                    >
                        ${formatVND(
                            d.profit
                        )}
                    </td>

                </tr>
            `;

        });

        html += `
            <tr
                style="
                    background:#111;
                    color:white;
                    font-weight:bold;
                "
            >

                <td colspan="2">
                    TỔNG
                </td>

                <td>
                    ${totalQty}
                </td>

                <td></td>

                <td></td>

                <td>
                    ${formatVND(
                        totalRevenue
                    )}
                </td>

                <td>
                    ${formatVND(
                        totalCapital
                    )}
                </td>

                <td>
                    ${formatVND(
                        totalProfit
                    )}
                </td>

            </tr>
        `;

        body.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
document.addEventListener("input",(e)=>{

    if(
        e.target.id === "salesSearch" ||
        e.target.id === "salesFromDate" ||
        e.target.id === "salesToDate"
    ){
        loadSalesHistory();
    }

});
document
.getElementById("exportExcelBtn")
?.addEventListener("click", () => {

    const table =
        document.getElementById("logsTable");

    const wb =
        XLSX.utils.table_to_book(
            table,
            { sheet:"Logs" }
        );

    XLSX.writeFile(
        wb,
        "Product_Change_Logs.xlsx"
    );

});    
