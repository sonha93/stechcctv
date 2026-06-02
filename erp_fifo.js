const db = firebase.firestore();

/* =========================
   1. NHẬP HÀNG (FIFO BATCH)
========================= */
async function importStock(productId, qty, importPrice) {

    const ref = db.collection("products").doc(productId);
    const p = await ref.get();

    const currentStock = p.data()?.stock || 0;

    // update stock
    await ref.update({
        stock: currentStock + qty
    });

    // tạo batch FIFO
    await db.collection("stock_batches").add({
        productId,
        qty,
        remainingQty: qty,
        importPrice,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // log giá nhập
    await db.collection("price_events").add({
        productId,
        type: "IMPORT",
        oldPrice: null,
        newPrice: importPrice,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/* =========================
   2. FIFO COST
========================= */
async function calcFIFO(productId, qtyNeed) {

    const snap = await db.collection("stock_batches")
        .where("productId", "==", productId)
        .orderBy("createdAt", "asc")
        .get();

    let need = qtyNeed;
    let cost = 0;

    for (const d of snap.docs) {

        const b = d.data();

        if (need <= 0) break;

        const take = Math.min(b.remainingQty, need);

        cost += take * b.importPrice;

        need -= take;
    }

    return cost;
}

/* =========================
   3. BÁN HÀNG FIFO + PROFIT
========================= */
async function sellStock(productId, qty, sellPrice) {

    const snap = await db.collection("stock_batches")
        .where("productId", "==", productId)
        .orderBy("createdAt", "asc")
        .get();

    let need = qty;
    let cost = 0;

    for (const d of snap.docs) {

        const b = d.data();

        if (need <= 0) break;

        const take = Math.min(b.remainingQty, need);

        cost += take * b.importPrice;

        await d.ref.update({
            remainingQty: b.remainingQty - take
        });

        need -= take;
    }

    const revenue = qty * sellPrice;
    const profit = revenue - cost;

    // update stock
    const ref = db.collection("products").doc(productId);
    const p = await ref.get();

    await ref.update({
        stock: (p.data().stock || 0) - qty
    });

    // log sale
    await db.collection("sales").add({
        productId,
        qty,
        sellPrice,
        costPrice: cost,
        revenue,
        profit,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { revenue, cost, profit };
}

/* =========================
   4. PROMO / GIÁ KHUYẾN MÃI
========================= */
async function setPromoPrice(productId, newPrice, note) {

    const ref = db.collection("products").doc(productId);
    const p = await ref.get();

    const oldPrice = p.data()?.price || 0;

    await ref.update({
        price: newPrice,
        promo: true
    });

    await db.collection("price_events").add({
        productId,
        type: "PROMO",
        oldPrice,
        newPrice,
        note,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/* =========================
   5. AUDIT FULL
========================= */
async function getAudit(productId) {

    const price = await db.collection("price_events")
        .where("productId", "==", productId)
        .orderBy("createdAt", "desc")
        .get();

    const sales = await db.collection("sales")
        .where("productId", "==", productId)
        .orderBy("createdAt", "desc")
        .get();

    return {
        prices: price.docs.map(d => d.data()),
        sales: sales.docs.map(d => d.data())
    };
}
