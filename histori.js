
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

salesSnap.forEach(doc=>{

    const sale = doc.data();

    const id = sale.productId;

    if(!salesMap[id]){
        salesMap[id] = 0;
    }

    salesMap[id] +=
        Number(sale.qty || 0);

});
    // FIFO SALES LEFT
    const salesLeftMap = {
        ...salesMap
    };

    // LOOP IMPORT
    moveSnap.forEach(doc=>{

        const data = doc.data();

        if(data.type !== "IMPORT")
            return;

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

        // FIFO
        const soldInPeriod =
            Math.min(
                salesLeft,
                qty
            );

        const remain =
            qty - soldInPeriod;

        // TRỪ SALES CÒN LẠI
        salesLeftMap[id] =
            salesLeft - soldInPeriod;

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

                <td>0</td>

            </tr>
        `;

    });


    // ======================
    // TOTAL
    // ======================

    let totalImport = 0;
    let totalSold = 0;

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

    salesSnap.forEach(doc=>{

        const sale = doc.data();

       const p =
    productMap[sale.productId];

if(
    keyword &&
    !String(p?.name || "")
        .toLowerCase()
        .includes(keyword) &&
    !String(sale.productId)
        .toLowerCase()
        .includes(keyword)
){
    return;
}

        totalSold +=
            Number(sale.qty || 0);

    });

    const totalRemain =
        totalImport - totalSold;

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
                ---
            </td>

            <td>
                ${totalSold}
            </td>

            <td style="color:#00e676;">
                ${totalRemain}
            </td>

            <td>
                0
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
