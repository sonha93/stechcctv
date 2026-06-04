// ============================
// STOCK MOVEMENTS
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

        snap.forEach(doc=>{

            const data = doc.data();

            html += `
                <tr>

                    <td>${data.productName || "-"}</td>

                    <td>${data.type || "-"}</td>

                    <td>${data.qty}</td>

                    <td>${data.reason || "-"}</td>

                    <td>
                        ${
                            data.createdAt
                            ? data.createdAt.toDate().toLocaleString("vi-VN")
                            : "-"
                        }
                    </td>

                </tr>
            `;

        });

        movementsBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
