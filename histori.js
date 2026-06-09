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

const qtyAfterSold =
    qty - soldInPeriod;

const minusLeft =
    Number(
        minusLeftMap[id] || 0
    );

const lossInPeriod =
    Math.min(
        minusLeft,
        qtyAfterSold
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
                ---
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
