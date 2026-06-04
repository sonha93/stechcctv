// ============================
// LOAD INVENTORY
// ============================

async function loadInventory(){

    if(!inventoryBody) return;

    try{

        inventoryBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:20px;">
                    Đang tải kho...
                </td>
            </tr>
        `;

        const keyword = inventorySearch
            ? inventorySearch.value.trim().toLowerCase()
            : "";

        const productSnap = await db.collection("products").get();
        const orderSnap = await db.collection("orders").get();

        const soldMap = {};

        orderSnap.forEach(orderDoc => {

            const order = orderDoc.data();

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

                if(!soldMap[id]){
                    soldMap[id] = 0;
                }

                soldMap[id] += Number(item.qty || 0);

            });

        });

        let rows = [];

        let totalImportPrice = 0;
        let totalPrice = 0;
        let totalOldPrice = 0;
        let totalStock = 0;
        let totalSold = 0;
        let totalProfit = 0;

        productSnap.forEach(doc => {

            const p = doc.data();

            if(
                keyword &&
                !String(p.name || "").toLowerCase().includes(keyword) &&
                !String(doc.id).toLowerCase().includes(keyword)
            ){
                return;
            }

            const stock = Number(p.stock || 0);
            const importPrice = Number(p.importPrice || 0);
            const price = Number(p.price || 0);
            const oldPrice = Number(p.oldPrice || 0);

            const sold = Number(soldMap[String(doc.id)] || 0);

            const revenue = price * sold;
            const capital = importPrice * sold;
            const profit = revenue - capital;

            totalImportPrice += importPrice;
            totalPrice += price;
            totalOldPrice += oldPrice;
            totalStock += stock;
            totalSold += sold;
            totalProfit += profit;

            rows.push(`
                <tr>

                    <td>${doc.id}</td>

                    <td>${p.name || "-"}</td>

                    <td>
                        <input
                            type="number"
                            class="importPriceInput"
                            data-id="${doc.id}"
                            value="${importPrice}"
                        >
                    </td>

                    <td>${oldPrice ? formatVND(oldPrice) : "---"}</td>

                    <td>${formatVND(price)}</td>

                    <td>${stock}</td>

                    <td>${sold}</td>

                    <td>${formatVND(profit)}</td>

                    <td>
                        <button
                            class="saveImportBtn"
                            data-id="${doc.id}"
                        >
                            Lưu
                        </button>
                    </td>

                </tr>
            `);

        });

        const totalPages = Math.max(
            1,
            Math.ceil(rows.length / rowsPerPage)
        );

        if(currentPage > totalPages){
            currentPage = 1;
        }

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        inventoryBody.innerHTML =
            rows.slice(start, end).join("");

        if(inventoryFooter){

            inventoryFooter.innerHTML = `
                <tr>
                    <td colspan="2">TOTAL</td>
                    <td>${formatVND(totalImportPrice)}</td>
                    <td>${formatVND(totalOldPrice)}</td>
                    <td>${formatVND(totalPrice)}</td>
                    <td>${totalStock}</td>
                    <td>${totalSold}</td>
                    <td>${formatVND(totalProfit)}</td>
                    <td>---</td>
                </tr>
            `;

        }

        bindInventoryEvents();

    }catch(err){

        console.log(err);

    }

}
