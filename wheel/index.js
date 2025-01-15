/** @format */

//? Wheel segments :
//? Add a array to the object == adding a segment to the wheel :
const sectors = [
  { id: 1, color: "#FFBC03", text: "Bugatti", label: "Bugatti", imageUrl: "" },
  {
    id: 2,
    color: "#FF5A10",
    text: "Lamborghini",
    label: "Lamborghini",
    imageUrl: "",
  },
  {
    id: 3,
    color: "#FFBC03",
    text: "You Lose",
    label: "You Lose",
    imageUrl: null,
  },
  {
    id: 4,
    color: "#FF5A10",
    text: "",
    label: "Ferrari",
    imageUrl:
      "https://www.pngplay.com/wp-content/uploads/13/Scuderia-Ferrari-Transparent-PNG.png",
  },
  {
    id: 5,
    color: "#FFBC03",
    text: "You Lose",
    label: "You Lose",
    imageUrl: null,
  },
  {
    id: 6,
    color: "#FF5A10",
    text: "BMW",
    label: "BMW",
    imageUrl:
      "https://i.pinimg.com/originals/18/a5/6c/18a56c95cc67e9cd3db848bb93f48b7e.png",
  },
  {
    id: 7,
    color: "#FFBC03",
    text: "Lexus",
    label: "Lexus",
    imageUrl: "url_to_lexus_image",
  },
  {
    id: 8,
    color: "#FF5A10",
    text: "You Lose",
    label: "You Lose",
    imageUrl: null,
  },
];

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
const tot = sectors.length;
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
const arc = TAU / sectors.length;

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
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  //! Draw Image
  //! ---------------------
  const img = new Image();
  img.src = sector.imageUrl;

  img.onload = () => {
    ctx.save();
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.drawImage(img, -rad + 600, -rad - -680 / 2, rad - 280, rad - 280); // Adjust dimensions and position as needed
    ctx.restore();
  };

  //! TEXT
  //! --------------------------------
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.text, rad - 100, 10);

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  // resultEl.textContent = !angVel && sector.label;
  spinEl.style.background = sector.color;
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

function init() {
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

//? this event listens when the wheel stops
events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
  resultsWrapperEl.style.display = "flex"; // display the result div

  resultTextEl.textContent = sector.text === "You Lose" ? "" : "You Got:";
  resultEl.textContent =
    sector.text === "You Lose" ? "Game Over" : sector.label;

  // Decrease stock if not "You Lose"
  if (sector.label !== "You Lose" && stock[sector.label.toLowerCase()] > 0) {
    stock[sector.label.toLowerCase()] -= 1;
    console.log(
      `${sector.label} stock remaining: ${stock[sector.label.toLowerCase()]}`
    );
  }
});

//! This event listens when you click anywhere in the result shows to close the results window
//! -----------------------------------------------------------------------------------------
resultsWrapperEl.addEventListener("click", function () {
  event.stopPropagation(); // stop spin event being executed
  resultsWrapperEl.style.display = "none";
});
