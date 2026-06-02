// ============================
// PRODUCT CHANGE LOGS
// ============================

const db = firebase.firestore();

// ============================
// FORMAT
// ============================

function formatVND(number){

    return Number(number || 0)
        .toLocaleString("vi-VN") + "đ";

}

// ============================
// SAVE LOG
// ============================

async function saveProductChangeLog({

    productId,
    productName,

    changedBy = "admin",

    oldImportPrice = 0,
    newImportPrice = 0,

    oldPrice = 0,
    newPrice = 0,

    oldOldPrice = 0,
    newOldPrice = 0,

    changeType = "PRICE_UPDATE"

}){

    try{

        const profitBefore =
            Number(oldPrice)
            -
            Number(oldImportPrice);

        const profitAfter =
            Number(newPrice)
            -
            Number(newImportPrice);

        const importChangePercent =
            Number(oldImportPrice) > 0
            ? Number(
                (
                    (
                        newImportPrice
                        -
                        oldImportPrice
                    )
                    /
                    oldImportPrice
                    *
                    100
                ).toFixed(2)
            )
            : 0;

        const priceChangePercent =
            Number(oldPrice) > 0
            ? Number(
                (
                    (
                        newPrice
                        -
                        oldPrice
                    )
                    /
                    oldPrice
                    *
                    100
                ).toFixed(2)
            )
            : 0;

        const oldPriceChangePercent =
            Number(oldOldPrice) > 0
            ? Number(
                (
                    (
                        newOldPrice
                        -
                        oldOldPrice
                    )
                    /
                    oldOldPrice
                    *
                    100
                ).toFixed(2)
            )
            : 0;

        await db
            .collection("product_change_logs")
            .add({

                productId,
                productName,

                changedBy,

                changeType,

                before:{
                    importPrice:
                        oldImportPrice,

                    price:
                        oldPrice,

                    oldPrice:
                        oldOldPrice
                },

                after:{
                    importPrice:
                        newImportPrice,

                    price:
                        newPrice,

                    oldPrice:
                        newOldPrice
                },

                profitBefore,
                profitAfter,

                importChangePercent,
                priceChangePercent,
                oldPriceChangePercent,

                createdAt:
                    firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

            });

        return true;

    }catch(err){

        console.error(err);
        return false;

    }

}
