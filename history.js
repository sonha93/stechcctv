document.addEventListener(
  "DOMContentLoaded",
  () => {

    const historyBody =
      document.getElementById("historyBody");

    const historySearch =
      document.getElementById("historySearch");

    function formatVND(number){

      return Number(number || 0)
        .toLocaleString("vi-VN") + "đ";

    }

    async function loadHistory(){

      if(!historyBody) {
        console.log("Không tìm thấy historyBody");
        return;
      }

      try{

        const keyword = historySearch
          ? historySearch.value.trim().toLowerCase()
          : "";

        const productSnap = await db
          .collection("products")
          .get();

        console.log(productSnap.size);

        let html = "";

        productSnap.forEach(doc => {

          const p = doc.data();

          const name =
            String(p.name || "");

          const id =
            String(doc.id || "");

          if(
            keyword &&
            !name.toLowerCase().includes(keyword) &&
            !id.toLowerCase().includes(keyword)
          ){
            return;
          }

          html += `
            <tr>
              <td>${name}</td>
              <td>${p.totalImportedQty || 0}</td>
              <td>${p.totalSoldQty || 0}</td>
              <td>${p.stock || 0}</td>
              <td>${formatVND(p.totalImportValue)}</td>
              <td>${formatVND(p.totalSaleValue)}</td>
              <td>${formatVND(p.totalProfit)}</td>
            </tr>
          `;

        });

        if(!html){

          html = `
            <tr>
              <td colspan="7"
                style="text-align:center;padding:20px;">
                Không có dữ liệu
              </td>
            </tr>
          `;

        }

        historyBody.innerHTML = html;

      }catch(err){

        console.log(err);

      }

    }

    if(historySearch){

      historySearch.addEventListener(
        "input",
        loadHistory
      );

    }

    loadHistory();

  }
);
