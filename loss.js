

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

                const id = String(
                    item.id ||
                    item.productId ||
                    ""
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
                String(m.productId || "");

            if(!id) return;

            // IMPORT
            if(m.type === "IMPORT"){

                importMap[id] =
                    (importMap[id] || 0)
                    + Number(m.qty || 0);

            }

            // MANUAL MINUS
            if(m.type === "MANUAL_MINUS"){

                lossMap[id] =
                    (lossMap[id] || 0)
                    + Math.abs(
                        Number(m.qty || 0)
                    );

            }

            // MANUAL PLUS
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

            const id = doc.id;

            const importPrice =
                Number(p.importPrice || 0);

            const sellPrice =
                Number(p.price || 0);

            // ====================
            // REAL DATA
            // ====================

            const importedQty =
                importMap[id] || 0;

            const sold =
                soldMap[id] || 0;

            const lossQty =
                lossMap[id] || 0;

            const plusQty =
                plusMap[id] || 0;

            // STOCK SYSTEM
            const systemStock =
                Number(p.stock || 0);

            // STOCK HISTORY
            const realStock =
                importedQty
                - sold
                - lossQty
                + plusQty;

            // DIFF
            const stockDiff =
                systemStock - realStock;

            // MONEY
            const revenue =
                sold * sellPrice;

            const capital =
                sold * importPrice;

            const profit =
                revenue - capital;

            const stockValue =
                realStock * importPrice;

            const lossValue =
                lossQty * importPrice;

            const importValue =
                importedQty * importPrice;

            // %
            const lossPercent =
                importedQty > 0
                ? (
                    lossQty
                    /
                    importedQty
                    *
                    100
                ).toFixed(2)
                : "0.00";

            const profitPercent =
                revenue > 0
                ? (
                    profit
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
                        ${formatVND(importValue)}
                    </td>

                    <td>
                        ${sold}
                    </td>

                    <td>
                        ${formatVND(revenue)}
                    </td>

                    <td
                    style="
                        color:${
                            realStock < 0
                            ? "red"
                            : "#00c853"
                        };
                        font-weight:bold;
                    "
                    >
                        ${realStock}
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
                            lossQty > 0
                            ? "-" + lossQty
                            : 0
                        }
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
                            profit < 0
                            ? "red"
                            : "#00c853"
                        };
                        font-weight:bold;
                    "
                    >
                        ${formatVND(profit)}
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

                    <td
                    style="
                        color:${
                            stockDiff === 0
                            ? "#00c853"
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
