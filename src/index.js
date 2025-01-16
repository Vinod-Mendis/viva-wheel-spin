/** @format */

let arc;
let tot;
let inventory;
let sectors;
let displayText;

//function for get item count from table2
async function loadInventory() {
  inventory = await window.api.getItems();
  // console.log(inventory);
}

async function init() {
  sectors = await window.api.getItems2();
  await loadInventory(); // load item count init

  if (!sectors || sectors.length === 0) {
    console.error("Sectors are not properly initialized.");
    return;
  }

  arc = TAU / sectors.length;
  tot = sectors.length;

  sectors.forEach((sector, i) => {
    // console.log("Inventory:", inventory); // Log inventory here if needed
    // console.log("Sector:", sectors); // Log sectors here if needed
    drawSector(sector, i);
  });

  rotate(); // Initial rotation
  engine(); // Start engine
  bodyClickEl.addEventListener("click", () => {
    if (!angVel) {
      angVel = rand(0.3, 0.6); // Set a random angular velocity for each spin
      spinButtonClicked = true;
    }
  });
}

// console.log("Inven: ", inventory);
// console.log("Sec :", sectors);

init();

// update item count on decrement
window.api.onItemCountUpdate((event, updatedItems) => {
  // updateItemCountDisplay(updatedItems);
  loadInventory();
});

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

//! Stock of each item
//!---------------------------------------
const stock = { lexus: 5, bugatti: 5, ferrari: 5, lamborghini: 5, bmw: 5 };

const rand = (m, M) => Math.random() * (M - m) + m;
const bodyClickEl = document.querySelector("#body");
const spinEl = document.querySelector("#spin");
const resultsWrapperEl = document.querySelector("#results-wrapper");
const resultEl = document.querySelector("#result");
const resultTextEl = document.querySelector("#result-text");
const resultText1El = document.querySelector("#result-text1");
const congratsTextEl = document.querySelector("#congrats");
const resultContEl = document.querySelector("#result-container");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

// function drawSector(sector, i) {
//   const ang = arc * i;
//   ctx.save();

//   // COLOR
//   ctx.beginPath();
//   ctx.fillStyle = sector.color;
//   ctx.moveTo(rad, rad);
//   ctx.arc(rad, rad, rad, ang, ang + arc);
//   ctx.lineTo(rad, rad);
//   ctx.fill();

//   // TEXT
//   ctx.translate(rad, rad);
//   ctx.rotate(ang + arc / 2);
//   ctx.textAlign = "right";
//   ctx.fillStyle = "#000";
//   ctx.font = "bold 30px 'Lato', sans-serif";
//   ctx.fillText(sector.text, rad - 100, 10);
//   //

//   ctx.restore();
// }

//! funtion to draw each segment
function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();
  // console.log("Inventory inside drawSector:", inventory);
  // console.log("Sectors inside drawSector:", sectors);
  // console.log("i :", i === inventory[i].id);

  // // Rin - 1
  // console.log(
  //   sectors[0].itemName === inventory[3].itemName
  //     ? `${inventory[3].itemName} stock: ${inventory[3].count}`
  //     : "logic error"
  // );
  // // cap - 2
  // console.log(
  //   sectors[1].itemName === inventory[1].itemName
  //     ? `${inventory[1].itemName} stock: ${inventory[1].count}`
  //     : "logic error"
  // );
  // // Rin - 3
  // console.log(
  //   sectors[2].itemName === inventory[3].itemName
  //     ? `${inventory[3].itemName} stock: ${inventory[3].count}`
  //     : "logic error"
  // );
  // // tshirt - 4
  // console.log(
  //   sectors[3].itemName === inventory[0].itemName
  //     ? `${inventory[0].itemName} stock: ${inventory[0].count}`
  //     : "logic error"
  // );
  // // cap - 5
  // console.log(
  //   sectors[4].itemName === inventory[1].itemName
  //     ? `${inventory[1].itemName} stock: ${inventory[1].count}`
  //     : "logic error"
  // );
  // // sunlight - 6
  // console.log(
  //   sectors[5].itemName === inventory[2].itemName
  //     ? `${inventory[2].itemName} stock: ${inventory[2].count}`
  //     : "logic error"
  // );

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = i % 2 === 0 ? "#FFF" : "#ffda85";
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  //! Draw Image
  //! ---------------------
  const img = new Image();
  // img.src = "https://www.pngplay.com/wp-content/uploads/13/Scuderia-Ferrari-Transparent-PNG.png";
  let imgUrl = "";

  // Set imgUrl based on sector and inventory count
  if (i === 0 || i === 2) {
    // Rin sectors
    imgUrl =
      inventory[3].count > 0
        ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736947162/pu0tlogr54tnhtjvsev7.png"
        : "";
  } else if (i === 1 || i === 4) {
    // Cap sectors
    imgUrl =
      inventory[1].count > 0
        ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941989/w7uwdwis2gbf5p9xy54f.png"
        : "";
  } else if (i === 3) {
    // T-shirt sector
    imgUrl =
      inventory[0].count > 0
        ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941846/fkh5dhczev88rbypmm7k.png"
        : "";
  } else {
    // Sunlight sector (i === 5)
    imgUrl =
      inventory[2].count > 0
        ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736940599/mxcmvvbiy3edq3wkmirc.png"
        : "";
  }

  img.src = imgUrl;
  img.onload = () => {
    ctx.save();
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.drawImage(img, -rad + 560, -rad - -640 / 2, rad - 200, rad - 200); // Adjust dimensions and position as needed
    ctx.restore();
  };

  //! TEXT
  //! --------------------------------
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";
  ctx.font = "bold 30px 'Lato', sans-serif";
  displayText = imgUrl === "" ? "Try Again" : "";
  ctx.fillText(displayText, rad - 100, 10);

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.itemName;
  // resultEl.textContent = !angVel && sector.itemName;
  spinEl.style.background = "#ffffff"; //sector.color
  spinEl.style.color = "#000";
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; // reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

//? this event listens when the wheel stops
events.addListener("spinEnd", (sector) => {
  console.log(sector);
  resultsWrapperEl.style.display = "flex"; // display the result div
  // Find the item in the inventory array
  const item = inventory.find((item) => item.itemName === sector.itemName);

  // Check if the item exists and log its count
  if (item) {
    console.log(`Count of ${sector.itemName}:`, item.count);
  } else {
    console.error(`${sector.itemName} not found in inventory.`);
  }

  item.count === 0
    ? (resultText1El.style.display = "none")
    : (resultText1El.style.display = "block");

  resultTextEl.textContent =
    sector.itemName === "try again" ? "" : "You have won a";
  resultEl.textContent = item.count === 0 ? "Try Again" : sector.itemName; // <-----------------------------------------
  console.log("Decrementing item:", sector.itemName);
  decrementItemInDB(sector.itemName); // Decrement the item count
  // setTimeout(function () {
  //   window.location.reload(); // Refreshes the current page after 4 seconds
  // }, 4000); // 4000 milliseconds = 4 seconds
});

//! This event listens when you click anywhere in the result shows to close the results window
//! -----------------------------------------------------------------------------------------
resultsWrapperEl.addEventListener("click", function () {
  event.stopPropagation(); // stop spin event being executed
  resultsWrapperEl.style.display = "none";
  window.location.reload();
});

function reload() {
  console.log("reload");
  mainWindow.webContents.reloadIgnoringCache();
}

async function decrementItemInDB(itemName) {
  try {
    const response = await window.api.decrementItem(itemName);
    if (response.success) {
      console.log(`${itemName} count decremented successfully.`);

      // Find the item in the inventory array
      const item = inventory.find((item) => item.itemName === itemName);

      // Check if the item exists and log its count
      if (item) {
        console.log(`Count of ${itemName}:`, item.count);
      } else {
        console.error(`${itemName} not found in inventory.`);
      }
      await window.api.itemUpdated(itemName);
    } else {
      console.error(`Error decrementing ${itemName} count:`, response.error);
    }
    loadItems(); // Reload items to reflect updated count
  } catch (error) {
    console.error("Failed to decrement item:", error);
  }
}
