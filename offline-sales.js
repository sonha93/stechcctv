// ============================
// OFFLINE SALES
// ============================

const offlineSection =
document.getElementById("offlineSalesSection");

const ordersSection =
document.getElementById("ordersSection");

const inventorySection =
document.getElementById("inventorySection");

const importSection =
document.getElementById("importSection");

const movementsSection =
document.getElementById("movementsSection");

const historySection =
document.getElementById("historySection");

const lossSection =
document.getElementById("lossSection");

const logsSection =
document.getElementById("logsSection");

const salesSection =
document.getElementById("salesSection");

document
.querySelectorAll(
'input[name="adminView"]'
)
.forEach(radio => {

radio.addEventListener(
"change",
() => {

const value = radio.value;

if(value !== "offlineSales")
return;

ordersSection.style.display = "none";

if(inventorySection)
inventorySection.style.display = "none";

if(importSection)
importSection.style.display = "none";

if(movementsSection)
movementsSection.style.display = "none";

if(historySection)
historySection.style.display = "none";

if(lossSection)
lossSection.style.display = "none";

if(logsSection)
logsSection.style.display = "none";

if(salesSection)
salesSection.style.display = "none";

offlineSection.style.display = "block";

}
);

});
