// ============================
// IMPORT PRICES
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

            html += `
                <tr>

                    <td>${data.productId}</td>

                    <td>
                        ${formatVND(data.importPrice)}
                    </td>

                    <td>
                        ${
                            data.createdAt
                            ? data.createdAt.toDate().toLocaleString("vi-VN")
                            : "-"
                        }
                    </td>

                </tr>
            `;

        }

        importBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
