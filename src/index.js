/** @format */

let arc;
let tot;

async function init() {
  sectors = await window.api.getItems2();
  console.log(sectors);

  arc = TAU / sectors.length;
  tot = sectors.length;

  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine
  bodyClickEl.addEventListener("click", () => {
    if (!angVel) {
      // Set a random angular velocity for each spin
      angVel = rand(0.3, 0.6); // Increase the range if you want more variability
      spinButtonClicked = true;
    }
  });
}

init();

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
  img.src =
    i === 0
      ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941846/fkh5dhczev88rbypmm7k.png"
      : i === 1
      ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941989/w7uwdwis2gbf5p9xy54f.png"
      : i === 2
      ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736947162/pu0tlogr54tnhtjvsev7.png"
      : i === 3
      ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941846/fkh5dhczev88rbypmm7k.png"
      : i === 4
      ? "https://res.cloudinary.com/dicewvvjl/image/upload/v1736941989/w7uwdwis2gbf5p9xy54f.png"
      : "https://res.cloudinary.com/dicewvvjl/image/upload/v1736940599/mxcmvvbiy3edq3wkmirc.png";
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
  ctx.fillText("", rad - 100, 10);

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
  console.log(`Woop! You won ${sector.itemName}`);
  resultsWrapperEl.style.display = "flex"; // display the result div

  resultTextEl.textContent =
    sector.itemName === "try again" ? "" : "You have won";
  resultEl.textContent =
    sector.text === "You Lose" ? "Game Over" : sector.itemName;
  console.log("Decrementing item:", sector.itemName);
  decrementItemInDB(sector.itemName); // Decrement the item count
});

//! This event listens when you click anywhere in the result shows to close the results window
//! -----------------------------------------------------------------------------------------
resultsWrapperEl.addEventListener("click", function () {
  event.stopPropagation(); // stop spin event being executed
  resultsWrapperEl.style.display = "none";
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
      await window.api.itemUpdated(itemName);
    } else {
      console.error(`Error decrementing ${itemName} count:`, response.error);
    }
    loadItems(); // Reload items to reflect updated count
  } catch (error) {
    console.error("Failed to decrement item:", error);
  }
}
