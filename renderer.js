/** @format */

async function addItem() {
  const itemName = document.getElementById("itemName");
  const itemCount = document.getElementById("itemCount");
  const itemNameValue = document.getElementById("itemName").value;
  const itemCountValue = parseInt(document.getElementById("itemCount").value);
  const itemImage = document.getElementById("itemImage").files[0];

  // await window.api.addItem(itemNameValue, itemCountValue);
  if (itemImage) {
    const imageData = await itemImage.arrayBuffer();
    await window.api.addItem(
      itemNameValue,
      itemCountValue,
      new Uint8Array(imageData)
    );
  } else {
    await window.api.addItem(itemNameValue, itemCountValue);
  }

  document.getElementById("itemImage").value = "";
  itemName.value = "";
  itemCount.value = "";
  loadItems();
}

async function loadItems() {
  const items = await window.api.getItems();
  const table1 = document.getElementById("table1");
  const itemSelect = document.getElementById("itemSelect");

  if (!table1 || !itemSelect) return;

  table1.innerHTML = "";
  itemSelect.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${item.itemName}</td>
            <td>${item.count}</td>
            <td><button onclick="openEditModal(${item.id}, '${item.itemName}', ${item.count})" style="padding: 6px 24px; margin: 0 0 0 8px; background:rgb(55, 124, 214); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s;">Edit</button></td>
            <td><button onclick="deleteItem(${item.id})" style="padding: 6px 24px; margin: 0 0 0 8px; background:rgb(218, 54, 54); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s;">Delete</button></td>`;
    table1.appendChild(row);
    const option = document.createElement("option");
    option.value = item.itemName;
    option.textContent = item.itemName;
    itemSelect.appendChild(option);
  });
}

async function deleteItem(id) {
  await window.api.deleteItem(id);
  loadItems();
}

async function addToTable2() {
  const itemName = document.getElementById("itemSelect").value;
  await window.api.addToTable2(itemName);
  loadTable2();
}

async function loadTable2() {
  const items = await window.api.getItems2();
  const table2 = document.getElementById("table2");

  if (!table2) return; // Guard clause for table2

  if (items) console.log(items);
  table2.innerHTML = "";

  items.forEach((item) => {
    console.log(item);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.itemName}</td>
      <td><button onclick="deleteItem2(${item.id})" 
          style="padding: 6px 24px; margin: 0 0 0 8px; background:rgb(218, 54, 54); 
          color: white; border: none; border-radius: 6px; cursor: pointer; 
          font-size: 14px; transition: all 0.3s;">Delete</button></td>`;
    table2.appendChild(row);
  });
}

async function deleteItem2(id) {
  await window.api.deleteItem2(id);
  loadTable2();
}

let currentEditId = null;

// Open edit modal and populate it with prize data
function openEditModal(id, name, stock) {
  currentEditId = id;
  document.getElementById("edit-prize-name").value = name;
  document.getElementById("edit-prize-stock").value = stock;
  document.getElementById("edit-prize-id").value = id;
  document.getElementById("edit-modal").style.display = "block";
}

// Close the edit modal
document.getElementById("close-modal").onclick = function () {
  document.getElementById("edit-modal").style.display = "none";
};

// Handle editing a prize
document.getElementById("edit-prize-form").addEventListener("submit", (e) => {
  e.preventDefault();
  onSubmitt();
});
async function onSubmitt() {
  let editedName = document.getElementById("edit-prize-name").value;
  let count = parseInt(document.getElementById("edit-prize-stock").value, 10);
  let currentId = document.getElementById("edit-prize-id").value;
  console.log(document.getElementById("edit-prize-id").value);
  await window.api.updateItem(currentId, editedName, count);
  document.getElementById("edit-modal").style.display = "none";
  loadItems();
}

document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  loadTable2();

  // Listen for item count updates in real time
  window.api.onItemCountUpdate((event, updatedItems) => {
    // updateItemCountDisplay(updatedItems);
    loadItems();
  });
});

async function decrementItem(name) {
  console.log("decrement func called", name);
  await window.api.decrementItem(name);
  // loadItems();
}

// ipcRenderer.on("update-item-count", async (event, itemName) => {
//     console.log(`Item count for ${itemName} updated`);
//     loadItems(); // Reloads item list with updated counts
// });
