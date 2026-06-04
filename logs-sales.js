// ============================
// LOGS
// ============================

async function loadProductChangeLogs(){

    const body =
        document.getElementById(
            "productChangeLogsBody"
        );

    if(!body) return;

    try{

        const snap = await db
            .collection("product_change_logs")
            .orderBy("createdAt","desc")
            .limit(500)
            .get();

        let html = "";

        snap.forEach(doc=>{

            const d = doc.data();

            html += `
                <tr>

                    <td>${d.productId}</td>

                    <td>${d.productName}</td>

                    <td>${d.changedBy}</td>

                </tr>
            `;

        });

        body.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}

// ============================
// SALES
// ============================

async function loadSalesHistory(){

    const body =
        document.getElementById(
            "salesHistoryBody"
        );

    if(!body) return;

    try{

        const snap = await db
            .collection("sales_history")
            .orderBy("createdAt","desc")
            .get();

        let html = "";

        snap.forEach(doc=>{

            const d = doc.data();

            html += `
                <tr>

                    <td>${d.productName}</td>

                    <td>${d.qty}</td>

                    <td>${formatVND(d.revenue)}</td>

                    <td>${formatVND(d.profit)}</td>

                </tr>
            `;

        });

        body.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
