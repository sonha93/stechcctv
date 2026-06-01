const db = firebase.firestore();

const historyBody = document.getElementById("historyBody");
const historySearch = document.getElementById("historySearch");

let historyData = [];

// LOAD DATA
async function loadHistory() {

    if (!historyBody) {
        console.error("Không tìm thấy historyBody");
        return;
    }

    historyBody.innerHTML = `
        <tr>
            <td colspan="7" style="padding:20px;text-align:center;">
                Đang tải...
            </td>
        </tr>
    `;

    try {

        const [
            inventorySnap,
            importSnap,
            salesSnap
        ] = await Promise.all([
            db.collection("inventory_snapshot").get(),
            db.collection("import_history").get(),
            db.collection("sales_history").get()
        ]);

        const inventoryMap = {};
        const importMap = {};
        const salesMap = {};

        // INVENTORY
        inventorySnap.forEach(doc => {

            const d = doc.data();

            inventoryMap[d.productId] = {
                productName: d.productName || "",
                stock: Number(d.stock || 0)
            };

        });

        // IMPORT
        importSnap.forEach(doc => {

            const d = doc.data();

            if (!importMap[d.productId]) {

                importMap[d.productId] = {
                    qty: 0,
                    total: 0,
                    productName: d.productName || ""
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

            if (!salesMap[d.productId]) {

                salesMap[d.productId] = {
                    qty: 0,
                    total: 0,
                    productName: d.productName || ""
                };

            }

            salesMap[d.productId].qty += Number(d.quantity || 0);

            salesMap[d.productId].total +=
                Number(d.quantity || 0) *
                Number(d.salePrice || 0);

        });

        historyData = [];

        const allProductIds = new Set([
            ...Object.keys(inventoryMap),
            ...Object.keys(importMap),
            ...Object.keys(salesMap)
        ]);

        allProductIds.forEach(productId => {

            const inven = inventoryMap[productId] || {};
            const imp = importMap[productId] || {};
            const sale = salesMap[productId] || {};

            const totalImport = imp.total || 0;
            const totalSale = sale.total || 0;

            const avgImportPrice =
                imp.qty > 0
                    ? totalImport / imp.qty
                    : 0;

            const estimatedCost =
                avgImportPrice * (sale.qty || 0);

            const profit =
                totalSale - estimatedCost;

            historyData.push({

                productId,

                productName:
                    inven.productName ||
                    sale.productName ||
                    imp.productName ||
                    "Không tên",

                importedQty: imp.qty || 0,
                soldQty: sale.qty || 0,
                stock: inven.stock || 0,

                totalImport,
                totalSale,
                profit

            });

        });

        historyData.sort(
            (a, b) => b.totalSale - a.totalSale
        );

        renderHistory(historyData);

    } catch (err) {

        console.error(err);

        historyBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                        padding:20px;
                        text-align:center;
                        color:red;
                    ">
                    Lỗi load dữ liệu
                </td>
            </tr>
        `;

    }

}

// RENDER
function renderHistory(data) {

    if (!data.length) {

        historyBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="padding:20px;text-align:center;">
                    Không có dữ liệu
                </td>
            </tr>
        `;

        return;
    }

    historyBody.innerHTML = data.map(item => `

        <tr>

            <td>
                <b>${item.productName}</b><br>
                <small>${item.productId}</small>
            </td>

            <td>${item.importedQty}</td>

            <td>${item.soldQty}</td>

            <td>${item.stock}</td>

            <td>${formatMoney(item.totalImport)}</td>

            <td>${formatMoney(item.totalSale)}</td>

            <td
                style="
                    color:${item.profit >= 0 ? "green" : "red"};
                    font-weight:bold;
                "
            >
                ${item.profit >= 0 ? "+" : ""}
                ${formatMoney(item.profit)}
            </td>

        </tr>

    `).join("");

}

// FORMAT MONEY
function formatMoney(value) {

    const number = Number(value);

    if (isNaN(number)) {
        return "0đ";
    }

    return number.toLocaleString("vi-VN") + "đ";

}

// SEARCH
if (historySearch) {

    historySearch.addEventListener("input", () => {

        const keyword =
            historySearch.value.toLowerCase();

        const filtered = historyData.filter(item => {

            return (
                (item.productId || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.productName || "")
                    .toLowerCase()
                    .includes(keyword)
            );

        });

        renderHistory(filtered);

    });

}

// LOAD
loadHistory();

// RADIO SWITCH
const radios = document.querySelectorAll(
    'input[name="adminView"]'
);

radios.forEach(radio => {

    radio.addEventListener("change", () => {

        [
            "ordersSection",
            "inventorySection",
            "importSection",
            "movementsSection",
            "historySection"
        ].forEach(id => {

            const el = document.getElementById(id);

            if (el) {
                el.style.display = "none";
            }

        });

        const target =
            document.getElementById(
                radio.value + "Section"
            );

        if (target) {
            target.style.display = "block";
        }

    });

});
