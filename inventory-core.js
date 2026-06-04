// ============================
// INVENTORY CORE
// ============================

const importDateFilter = document.getElementById("importDateFilter");
const movementsDateFilter = document.getElementById("movementsDateFilter");

const inventoryBody = document.getElementById("inventoryBody");
const inventoryFooter = document.getElementById("inventoryFooter");

const importBody = document.getElementById("importBody");
const movementsBody = document.getElementById("movementsBody");

const inventorySearch = document.getElementById("inventorySearch");

const db = firebase.firestore();

let currentPage = 1;
const rowsPerPage = 15;

function formatVND(number){
    return Number(number || 0).toLocaleString("vi-VN") + "đ";
}
