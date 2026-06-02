async function saveSalePriceHistory(
    productId,
    productName,
    oldPrice,
    newPrice,
    oldOldPrice = 0,
    newOldPrice = 0
){

    if(
        Number(oldPrice) === Number(newPrice)
        &&
        Number(oldOldPrice) === Number(newOldPrice)
    ){
        return;
    }

    await db
        .collection("product_sale_price_history")
        .add({

            productId,

            productName,

            oldPrice:Number(oldPrice || 0),

            newPrice:Number(newPrice || 0),

            oldOldPrice:Number(oldOldPrice || 0),

            newOldPrice:Number(newOldPrice || 0),

            createdAt:
                firebase.firestore
                .FieldValue
                .serverTimestamp()

        });

}
