const historyBody =
  document.getElementById("historyBody");

const historySearch =
  document.getElementById("historySearch");

function formatVND(number){

  return Number(number || 0)
    .toLocaleString("vi-VN") + "đ";

}

async function loadHistory(){

  if(!historyBody) return;

  try{

    const keyword =
      historySearch.value
        .trim()
        .toLowerCase();

    const productSnap = await db
      .collection("products")
      .get();

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

      const imported =
        Number(p.totalImportedQty || 0);

      const sold =
        Number(p.totalSoldQty || 0);

      const stock =
        Number(p.stock || 0);

      const totalImport =
        Number(p.totalImportValue || 0);

      const totalSale =
        Number(p.totalSaleValue || 0);

      const profit =
        Number(p.totalProfit || 0);

      html += `
        <tr>

          <td>${name}</td>

          <td>${imported}</td>

          <td>${sold}</td>

          <td>${stock}</td>

          <td style="color:#ff9800;font-weight:bold;">
            ${formatVND(totalImport)}
          </td>

          <td style="color:#00acc1;font-weight:bold;">
            ${formatVND(totalSale)}
          </td>

          <td style="color:green;font-weight:bold;">
            ${formatVND(profit)}
          </td>

        </tr>
      `;

    });

    if(!html){

      html = `
        <tr>
          <td colspan="7"
            style="
              text-align:center;
              padding:20px;
            "
          >
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