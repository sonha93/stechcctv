const db = firebase.firestore();

const historyBody = document.getElementById("historyBody");
const historySearch = document.getElementById("historySearch");

let historyData = [];

async function loadHistory(){

    historyBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:20px;">
                Đang tải...
            </td>
        </tr>
    `;

    try{

        const inventorySnap = await db.collection("inventory_snapshot").get();
        const importSnap = await db.collection("import_history").get();
        const salesSnap = await db.collection("sales_history").get();
console.log("inventory:", inventorySnap.size);
console.log("import:", importSnap.size);
console.log("sales:", salesSnap.size);
        const inventoryMap = {};
        const importMap = {};
        const salesMap = {};

        // INVENTORY
        inventorySnap.forEach(doc => {

            const d = doc.data();

            inventoryMap[d.productId] = {
                productName: d.productName || "",
                stock: Number(d.stock || 0),
                stockValue: Number(d.stockValue || 0)
            };

        });

        // IMPORT
        importSnap.forEach(doc => {

            const d = doc.data();

            if(!importMap[d.productId]){
                importMap[d.productId] = {
                    qty:0,
                    total:0
                };
            }

            importMap[d.productId].qty += Number(d.quantity || 0);

            importMap[d.productId].total +=
                Number(d.quantity || 0) *
                Number(d.importPrice || 0);

        });

        // SALES
        salesSnap.forEach(doc => {

            const d = doc.data();

            if(!salesMap[d.productId]){
                salesMap[d.productId] = {
                    qty:0,
                    total:0
                };
            }

            salesMap[d.productId].qty += Number(d.quantity || 0);

            salesMap[d.productId].total +=
                Number(d.quantity || 0) *
                Number(d.salePrice || 0);

        });

        historyData = [];

        Object.keys(inventoryMap).forEach(productId => {

            const inven = inventoryMap[productId] || {};
            const imp = importMap[productId] || {};
            const sale = salesMap[productId] || {};

            const totalImport = imp.total || 0;
            const totalSale = sale.total || 0;

            const profit = totalSale - totalImport;

            historyData.push({
                productId,
                productName: inven.productName || "",
                importedQty: imp.qty || 0,
                soldQty: sale.qty || 0,
                stock: inven.stock || 0,
                totalImport,
                totalSale,
                profit
            });

        });

        renderHistory(historyData);

    }catch(err){

        console.log(err);

        historyBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:20px;color:red;">
                    Lỗi load dữ liệu
                </td>
            </tr>
        `;

    }

}

function renderHistory(data){

    if(!data.length){

        historyBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:20px;">
                    Không có dữ liệu
                </td>
            </tr>
        `;

        return;
    }

    historyBody.innerHTML = data.map(item => `

        <tr>

            <td>
                <b>${item.productName}</b>
                <br>
                <small>${item.productId}</small>
            </td>

            <td>
                ${item.importedQty}
            </td>

            <td>
                ${item.soldQty}
            </td>

            <td>
                ${item.stock}
            </td>

            <td>
                ${formatMoney(item.totalImport)}
            </td>

            <td>
                ${formatMoney(item.totalSale)}
            </td>

            <td style="
                color:${item.profit >= 0 ? 'green' : 'red'};
                font-weight:bold;
            ">
                ${formatMoney(item.profit)}
            </td>

        </tr>

    `).join("");

}

function formatMoney(value){

    return Number(value || 0).toLocaleString("vi-VN") + "đ";

}

// SEARCH
historySearch.addEventListener("input", () => {

    const keyword = historySearch.value.toLowerCase();

    const filtered = historyData.filter(item => {

        return (
            item.productId.toLowerCase().includes(keyword) ||
            item.productName.toLowerCase().includes(keyword)
        );

    });

    renderHistory(filtered);

});

loadHistory();

// DÁN XUỐNG DƯỚI CÙNG FILE
const radios = document.querySelectorAll('input[name="adminView"]');

radios.forEach(radio => {

    radio.addEventListener("change", () => {

        document.getElementById("ordersSection").style.display = "none";
        document.getElementById("inventorySection").style.display = "none";
        document.getElementById("importSection").style.display = "none";
        document.getElementById("movementsSection").style.display = "none";
        document.getElementById("historySection").style.display = "none";

        if(radio.value === "orders"){
            document.getElementById("ordersSection").style.display = "block";
        }

        if(radio.value === "inventory"){
            document.getElementById("inventorySection").style.display = "block";
        }

        if(radio.value === "import"){
            document.getElementById("importSection").style.display = "block";
        }

        if(radio.value === "movements"){
            document.getElementById("movementsSection").style.display = "block";
        }

        if(radio.value === "history"){
            document.getElementById("historySection").style.display = "block";
        }

    });

});
