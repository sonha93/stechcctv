// ============================
// INVENTORY EVENTS
// ============================

function bindInventoryEvents(){

    document.querySelectorAll(".saveImportBtn").forEach(btn => {

        if(btn.dataset.bound === "true"){
            return;
        }

        btn.dataset.bound = "true";

        btn.addEventListener("click", async () => {

            try{

                const id = btn.dataset.id;

                const row = btn.closest("tr");

                const importInput =
                    row.querySelector(".importPriceInput");

                const importPrice =
                    Number(importInput.value || 0);

                const productRef =
                    db.collection("products").doc(id);

                const productDoc =
                    await productRef.get();

                const productData =
                    productDoc.data();

                const qtyImport = Number(
                    prompt("Nhập số lượng nhập thêm")
                );

                if (!Number.isInteger(qtyImport) || qtyImport < 0) {
                    alert("Số lượng không hợp lệ");
                    return;
                }

                const currentStock =
                    Number(productData.stock || 0);

                const newStock =
                    currentStock + qtyImport;

                await productRef.update({

                    importPrice,
                    stock:newStock

                });

                alert("Lưu thành công");

                loadInventory();
                loadImportPrices();
                loadStockMovements();

            }catch(err){

                console.log(err);

            }

        });

    });

}
