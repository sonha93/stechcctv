/* =========================
    render();
  });
}

loadData();

// CORE
function calcStock(code){
  let stock = 0;
  logs.filter(l=>l.procode===code).forEach(l=>{
    if(l.type==='import') stock+=l.qty;
    if(l.type==='export') stock-=l.qty;
    if(l.type==='return') stock+=l.qty;
    if(l.type==='cancel') stock-=l.qty;
  });
  return stock;
}

function calcMinus(stock){
  return stock<0?Math.abs(stock):0;
}

function calcProfit(code){
  let p=0;
  logs.filter(l=>l.procode===code && l.type==='export')
  .forEach(l=>{
    let pr = products[code]?.sellPrice||0;
    let cp = products[code]?.costPrice||0;
    p += (pr-cp)*l.qty;
  });
  return p;
}

// ADD LOG
window.addLog=function(){

  let procode=document.getElementById("procode").value;
  let type=document.getElementById("type").value;
  let qty=Number(document.getElementById("qty").value);
  let price=Number(document.getElementById("price").value);

  if(!procode||!qty) return;

  if(!products[procode]){
    db.collection("products").doc(procode).set({
      procode,
      costPrice:price,
      sellPrice:price+500000
    });
  }

  db.collection("inventory_logs").add({
    procode,type,qty,price,
    createdAt:Date.now()
  });

  document.getElementById("qty").value="";
}

// RENDER
function render(){

  let table=document.getElementById("table");

  let list=Object.keys(products).map(code=>{

    let stock=calcStock(code);
    let minus=calcMinus(stock);
    let profit=calcProfit(code);

    return `
      <tr>
        <td>${code}</td>
        <td class="${stock<0?'red':'green'}">${stock}</td>
        <td class="red">${minus}</td>
        <td>${products[code].costPrice}</td>
        <td>${products[code].sellPrice}</td>
        <td>${profit}</td>
      </tr>
    `;
  }).join('');

  table.innerHTML=list;
}
