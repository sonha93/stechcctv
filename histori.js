// ============================
// HISTORY
// ============================

async function loadHistory(){

    const historyBody =
        document.getElementById("historyBody");

    if(!historyBody) return;

    try{

        const snap = await db
            .collection("stock_movements")
            .orderBy("createdAt","desc")
            .get();

        let html = "";

        snap.forEach(doc=>{

            const data = doc.data();

            html += `
                <tr>

                    <td>${data.productId}</td>

                    <td>${data.productName || "-"}</td>

                    <td>${data.qty}</td>

                    <td>${data.type}</td>

                    <td>${data.reason || "-"}</td>

                </tr>
            `;

        });

        historyBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
