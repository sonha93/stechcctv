// ============================
// LOAD STOCK MOVEMENTS
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

        for(const doc of snap.docs){

            const data = doc.data();

            const selectedDate = movementsDateFilter?.value;

            if(!data.createdAt){
                continue;
            }

            if(selectedDate){

                const itemDate = data.createdAt
                    .toDate()
                    .toISOString()
                    .split("T")[0];

                if(itemDate !== selectedDate){
                    continue;
                }

            }

            let productName = "-";

            try{

                const productDoc = await db
                    .collection("products")
                    .doc(data.productId)
                    .get();

                if(productDoc.exists){
                    productName = productDoc.data().name;
                }

            }catch{}
html += `
    <tr>
        <td>${productName}</td>
        <td>${data.type || "---"}</td>       
        <td style="color:${data.qty < 0 ? "red" : "#00c853"};">
            ${data.qty > 0 ? "+" + data.qty : data.qty}
        </td>                                 
       <td>${data.reason || "Đơn hàng 0đ"}</td>    
        <td>
            ${
                data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toLocaleString("vi-VN")
                : "-"
            }
        </td>
    </tr>
`;
        }

        if(!html){

            html = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;">
                        Chưa có dữ liệu
                    </td>
                </tr>
            `;

        }

        movementsBody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

}
