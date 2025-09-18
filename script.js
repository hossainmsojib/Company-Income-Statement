const $ = sel => document.querySelector(sel);
const format = n => Number(n||0);
const currency = n => (Math.round(n*100)/100).toLocaleString();

// Table bodies
const labourTbody = $('#labourTable tbody');
const materialsTbody = $('#materialsTable tbody');
const expensesTbody = $('#expensesTable tbody');
const ordersTbody = $('#ordersTable tbody');

// ===== LABOUR =====
function addLabourRow(data={name:'',post:'',basic:0,ot:0}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="lab-name" value="${data.name}"></td>
    <td><input type="text" class="lab-post" value="${data.post}"></td>
    <td><input type="number" class="lab-basic" value="${data.basic}"></td>
    <td><input type="number" class="lab-ot" value="${data.ot}"></td>
    <td class="lab-total">0</td>
    <td><button class="del">Delete</button></td>`;
  labourTbody.appendChild(tr);
  attachLabourListeners(tr);
  recalcAll();
  saveToLocalStorage();
}
function attachLabourListeners(tr){
  const basic = tr.querySelector('.lab-basic');
  const ot = tr.querySelector('.lab-ot');
  const del = tr.querySelector('.del');
  function update(){ 
    const sum = format(basic.value)+format(ot.value);
    tr.querySelector('.lab-total').textContent = currency(sum);
    recalcAll();
    saveToLocalStorage();
  }
  basic.addEventListener('input', update);
  ot.addEventListener('input', update);
  del.addEventListener('click', ()=>{ tr.remove(); recalcAll(); saveToLocalStorage(); });
  update();
}

// ===== MATERIALS =====
function addMaterialRow(data={name:'',qty:0,cost:0}){
  const tr=document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="mat-name" value="${data.name}"></td>
    <td><input type="number" class="mat-qty" value="${data.qty}"></td>
    <td><input type="number" class="mat-cost" value="${data.cost}"></td>
    <td><button class="del">Delete</button></td>`;
  materialsTbody.appendChild(tr);
  tr.querySelector('.mat-cost').addEventListener('input', ()=>{ recalcAll(); saveToLocalStorage(); });
  tr.querySelector('.del').addEventListener('click', ()=>{ tr.remove(); recalcAll(); saveToLocalStorage(); });
  saveToLocalStorage();
}

// ===== EXPENSES =====
function addExpenseRow(data={no:null,desc:'',amt:0}){
  const tr=document.createElement('tr');
  tr.innerHTML = `
    <td class="exp-no">${data.no!==null?data.no:''}</td>
    <td><input type="text" class="exp-desc" value="${data.desc}"></td>
    <td><input type="number" class="exp-amt" value="${data.amt}"></td>
    <td><button class="del">Delete</button></td>`;
  expensesTbody.appendChild(tr);
  tr.querySelector('.exp-amt').addEventListener('input', ()=>{ recalcAll(); saveToLocalStorage(); });
  tr.querySelector('.del').addEventListener('click', ()=>{ tr.remove(); renumberExpenses(); recalcAll(); saveToLocalStorage(); });
  saveToLocalStorage();
}
function renumberExpenses(){
  [...expensesTbody.querySelectorAll('tr')].forEach((r,i)=>r.querySelector('.exp-no').textContent = i+1);
}

// ===== ORDERS =====
function addOrderRow(data={order:'',customer:'',product:'',qty:0,price:0}){
  const tr=document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="ord-no" value="${data.order}"></td>
    <td><input type="text" class="ord-cust" value="${data.customer}"></td>
    <td><input type="text" class="ord-prod" value="${data.product}"></td>
    <td><input type="number" class="ord-qty" value="${data.qty}"></td>
    <td><input type="number" class="ord-price" value="${data.price}"></td>
    <td class="ord-total">0</td>
    <td><button class="del">Delete</button></td>`;
  ordersTbody.appendChild(tr);
  attachOrderListeners(tr);
  recalcAll();
  saveToLocalStorage();
}
function attachOrderListeners(tr){
  const qty=tr.querySelector('.ord-qty');
  const price=tr.querySelector('.ord-price');
  const del=tr.querySelector('.del');
  function update(){
    const sum=format(qty.value)*format(price.value);
    tr.querySelector('.ord-total').textContent=currency(sum);
    recalcAll();
    saveToLocalStorage();
  }
  qty.addEventListener('input', update);
  price.addEventListener('input', update);
  del.addEventListener('click', ()=>{ tr.remove(); recalcAll(); saveToLocalStorage(); });
  update();
}

// ===== RECALCULATE =====
function recalcAll(){
  let labourSum=[...labourTbody.querySelectorAll('tr')].reduce((s,r)=>s+(parseFloat(r.querySelector('.lab-total').textContent.replace(/,/g,''))||0),0);
  $('#labourTotal').textContent=currency(labourSum);
  $('#sumLabour').textContent=currency(labourSum);

  let matsSum=[...materialsTbody.querySelectorAll('tr')].reduce((s,r)=>s+format(r.querySelector('.mat-cost').value),0);
  $('#materialsTotal').textContent=currency(matsSum);
  $('#sumMaterials').textContent=currency(matsSum);

  let expSum=[...expensesTbody.querySelectorAll('tr')].reduce((s,r)=>s+format(r.querySelector('.exp-amt').value),0);
  $('#expensesTotal').textContent=currency(expSum);
  $('#sumExpenses').textContent=currency(expSum);

  let ordSum=[...ordersTbody.querySelectorAll('tr')].reduce((s,r)=>s+(parseFloat(r.querySelector('.ord-total').textContent.replace(/,/g,''))||0),0);
  $('#ordersTotal').textContent=currency(ordSum);
  $('#sumOrders').textContent=currency(ordSum);

  const net=ordSum-(labourSum+matsSum+expSum);
  const netEl=$('#netProfit');
  netEl.textContent=currency(net);
  netEl.className=net>=0?'positive':'negative';
}

// ===== LOCALSTORAGE =====
function saveToLocalStorage() {
    const data = {
        labour: labourTbody.innerHTML,
        materials: materialsTbody.innerHTML,
        expenses: expensesTbody.innerHTML,
        orders: ordersTbody.innerHTML
    };
    localStorage.setItem('iyubData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('iyubData');
    if(saved){
        const data = JSON.parse(saved);
        labourTbody.innerHTML = data.labour;
        materialsTbody.innerHTML = data.materials;
        expensesTbody.innerHTML = data.expenses;
        ordersTbody.innerHTML = data.orders;

        [...labourTbody.querySelectorAll('tr')].forEach(tr => attachLabourListeners(tr));
        [...materialsTbody.querySelectorAll('tr')].forEach(tr => {
            tr.querySelector('.mat-cost')?.addEventListener('input', ()=>{ recalcAll(); saveToLocalStorage(); });
            tr.querySelector('.del')?.addEventListener('click', ()=>{ tr.remove(); recalcAll(); saveToLocalStorage(); });
        });
        [...expensesTbody.querySelectorAll('tr')].forEach(tr => {
            tr.querySelector('.exp-amt')?.addEventListener('input', ()=>{ recalcAll(); saveToLocalStorage(); });
            tr.querySelector('.del')?.addEventListener('click', ()=>{ tr.remove(); renumberExpenses(); recalcAll(); saveToLocalStorage(); });
        });
        [...ordersTbody.querySelectorAll('tr')].forEach(tr => attachOrderListeners(tr));
        recalcAll();
    }
}
window.addEventListener('load', loadFromLocalStorage);

// ===== EVENTS =====
$('#addLabour').addEventListener('click', ()=>addLabourRow());
$('#addMaterial').addEventListener('click', ()=>addMaterialRow());
$('#addExpense').addEventListener('click', ()=>addExpenseRow({no:expensesTbody.children.length+1}));
$('#addOrder').addEventListener('click', ()=>addOrderRow());

$('#clearBtn').addEventListener('click', ()=>{
  if(confirm("Clear all data?")){
    labourTbody.innerHTML='';
    materialsTbody.innerHTML='';
    expensesTbody.innerHTML='';
    ordersTbody.innerHTML='';
    recalcAll();
    localStorage.removeItem('iyubData');
  }
});

// ===== EXPORT =====
$('#exportBtn').addEventListener('click', ()=>{
  let csv="Section,Fields\n";
  csv+="Labour,\n";
  csv+=[...labourTbody.querySelectorAll('tr')].map(r=>
    [...r.querySelectorAll('input,td')].slice(0,5).map(td=> td.value||td.textContent ).join(',')
  ).join('\n');
  csv+="\nMaterials,\n";
  csv+=[...materialsTbody.querySelectorAll('tr')].map(r=>
    [...r.querySelectorAll('input')].map(td=>td.value).join(',')
  ).join('\n');
  csv+="\nExpenses,\n";
  csv+=[...expensesTbody.querySelectorAll('tr')].map(r=>
    [...r.querySelectorAll('td,input')].map(td=>td.value||td.textContent).join(',')
  ).join('\n');
  csv+="\nOrders,\n";
  csv+=[...ordersTbody.querySelectorAll('tr')].map(r=>
    [...r.querySelectorAll('input,td')].slice(0,6).map(td=>td.value||td.textContent).join(',')
  ).join('\n');

  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download="iyub_accounting.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️ Light";
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
