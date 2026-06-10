import { db } from "./firebase-init.js";
window.currentCart = [];

window.offlineProducts = [];
async function createOfflineSale() {

  const customerName =
document.getElementById("offlineCustomer").value.trim();

const phone =
document.getElementById("offlinePhone").value.trim();
    const items =
        window.currentCart || [];

    if (!items.length) {
        alert("Chưa có sản phẩm");
        return;
    }

    let total = 0;

    items.forEach(item => {
        total += Number(item.price || 0) * Number(item.qty || 0);
    });

   const orderData = {

    customerName:
        customerName || "Khách lẻ",

    phone:
        phone || "",

    address: "Mua tại cửa hàng",

    source: "offline",

    status: "completed",

    offlineSale: true,

    createdAt: new Date(),

    items: items.map(i => ({
        productId: String(i.productId),
        name: String(i.name),
        price: Number(i.price),
        qty: Number(i.qty)
    })),

    total,

    paidAmount:
        Number(
            document.getElementById("customerPaid")?.value || 0
        ),

    changeAmount:
        Number(
            document.getElementById("customerPaid")?.value || 0
        ) - total,

    customerCancelled: false,

    adminCancelled: false
};
   try {

    const orderRef =
        await db.collection("orders")
        .add(orderData);

  
        for (const item of items) {

           const productRef =
    db.collection("products")
    .doc(String(item.productId));
            const productDoc =
                await productRef.get();

            if (!productDoc.exists)
                continue;

            const product =
                productDoc.data();

            const currentStock =
                Number(product.stock || 0);

            const qty =
                Number(item.qty || 0);

            const newStock =
                currentStock - qty;

            await productRef.update({
                stock: newStock
            });

            await db.collection("sales_history").add({

                orderId:
                    orderRef.id,

               productId:
    String(item.productId),
                productName:
                    item.name,

                qty,

                importPrice:
                    Number(product.importPrice || 0),

                sellPrice:
                    Number(item.price || 0),

                revenue:
                    Number(item.price || 0) * qty,

                capital:
                    Number(product.importPrice || 0) * qty,

                profit:
                    (Number(item.price || 0) -
                     Number(product.importPrice || 0)) * qty,

                createdAt: new Date()
            });

            await db.collection("stock_movements").add({

                productId:
                    item.productId,

                productName:
                    item.name,

                qty: -qty,

                type: "SALE",

                reason:
                    "Bán tại cửa hàng",

                stockAfter:
                    newStock,

                createdAt: new Date()

            });

        }

      alert("Đã tạo đơn bán offline");

window.currentCart = [];

renderOfflineCart();

document.getElementById("offlineSearch").value = "";
document.getElementById("offlineSearchResults").innerHTML = "";
    
} catch (err) {

    console.error(err);

    alert(err.message);

}

}

window.createOfflineSale =
    createOfflineSale;
async function loadOfflineProducts(){

    const snap =
        await db.collection("products").get();

  window.offlineProducts =
    snap.docs.map(doc => ({
        ...doc.data(),
        _id: doc.id
    }));
}

document.addEventListener("input", e => {

    if (e.target.id !== "offlineSearch") return;

    const keyword =
        e.target.value.toLowerCase().trim();

    const box =
        document.getElementById("offlineSearchResults");

    if (!keyword) {
        box.innerHTML = "";
        return;
    }

    const result =
        window.offlineProducts.filter(p =>
            (p.name || "")
                .toLowerCase()
                .includes(keyword)
        );

    box.innerHTML = "";

    result.forEach(p => {

        const btn =
            document.createElement("button");

        btn.type = "button";

        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.padding = "12px";
        btn.style.border = "1px solid #ddd";
        btn.style.background = "#fff";
        btn.style.marginBottom = "5px";
        btn.style.cursor = "pointer";

        btn.innerText =
            `${p.name} - ${Number(p.price || 0).toLocaleString()}đ - Tồn ${p.stock || 0}`;

        btn.onclick = () => {
    window.addOfflineItem(p._id);
};

        box.appendChild(btn);

    });

});
window.addOfflineItem = function(productId){

  const product =
    window.offlineProducts.find(
        x => x._id === productId
    );

    if(!product) return;

    const existed =
        window.currentCart.find(
            x => x.productId === productId
        );

    if(existed){

        existed.qty++;

    }else{

     window.currentCart.push({
    productId: product._id,
    name: product.name,
    price: product.price,
    qty: 1
});
    }

   
 renderOfflineCart();

   document.getElementById("offlineSearch").value = "";
   document.getElementById("offlineSearchResults").innerHTML = "";

}
window.changeQty = function(productId, delta){

    const item =
        window.currentCart.find(
            x => x.productId === productId
        );

    if(!item) return;

    item.qty += delta;

    if(item.qty <= 0){
        window.removeOfflineItem(productId);
        return;
    }

    renderOfflineCart();
};

window.removeOfflineItem = function(productId){

    window.currentCart =
        window.currentCart.filter(
            x => x.productId !== productId
        );

    renderOfflineCart();
};
function renderOfflineCart(){

    let total = 0;

    document.getElementById(
        "offlineCart"
    ).innerHTML = window.currentCart.map(item => {

        total +=
            Number(item.price) *
            Number(item.qty);
return `
<div style="
    padding:10px;
    border-bottom:1px solid #ddd;
    display:flex;
    justify-content:space-between;
    align-items:center;
">

    <div>
        ${item.name}
        x${item.qty}
        =
        ${(item.price * item.qty).toLocaleString()}đ
    </div>

    <div>

        <button onclick="window.changeQty('${item.productId}',1)">
            +
        </button>

        <button onclick="window.changeQty('${item.productId}',-1)">
            -
        </button>

        <button onclick="window.removeOfflineItem('${item.productId}')">
            X
        </button>

    </div>

</div>
`;

  
    }).join("");

    document.getElementById(
        "offlineTotal"
    ).innerText =
        total.toLocaleString() + "đ";
const paid =
    Number(
        document.getElementById("customerPaid")?.value || 0
    );

const changeBox =
    document.getElementById("changeMoney");

if(changeBox){
    changeBox.value =
        (paid - total).toLocaleString() + "đ";
}
}

loadOfflineProducts();
const saveBtn =
    document.getElementById("saveOfflineSale");

if (saveBtn) {
    saveBtn.addEventListener(
        "click",
        createOfflineSale
    );
}
document.addEventListener("input", e => {

    if(e.target.id !== "customerPaid") return;

    const paid =
        Number(e.target.value || 0);

    const total =
        window.currentCart.reduce(
            (sum,item)=>
                sum + Number(item.price)*Number(item.qty),
            0
        );

    document.getElementById("changeMoney").value =
        (paid - total).toLocaleString() + "đ";
});
