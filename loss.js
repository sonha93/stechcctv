// ============================
// LOSS
// ============================

async function loadLoss(){

    const lossBody =
        document.getElementById("lossBody");

    if(!lossBody) return;

    try{

        const snap =
            await db.collection("products").get();

        let html = "";

        snap.forEach(doc=>{

            const p = doc.data();

            html += `
                <tr>

                    <td>${doc.id}</td>

                    <td>${p.name || "-"}</td>

                    <td>${p.stock || 0}</td>

                    <td>
                        ${formatVND(p.importPrice)}
                    </td>

                </tr>
            `;

        });

        lossBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
