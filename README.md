# Isari
 class Fish {
  constructor(text) {
    this.text = text;
    this.row = null;
    this.element = null;
    this.position = 0;
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;
  }

  create() {
    this.element = document.createElement("div");
    this.element.classList.add("fish");
    this.element.textContent = this.text;
    this.element.style.left = `${this.position}px`;
    seaContent.appendChild(this.element);

    this.element.addEventListener("mousedown", this.dragStart.bind(this), false);
    this.element.addEventListener("mouseup", this.dragEnd.bind(this), false);
    this.element.addEventListener("contextmenu", this.remove.bind(this), false);
  }

  moveRight() {
    this.position += 10;//
    if (this.position >= seaContent.clientWidth) {
      this.position = 0;
    }
    this.element.style.left = `${this.position}px`;
  }

  dragStart(e) {
    this.startX = e.clientX - this.element.offsetLeft;
    this.startY = e.clientY - this.element.offsetTop;
    this.element.style.cursor = "grabbing";
    window.addEventListener("mousemove", this.drag.bind(this), true);
  }

  drag(e) {
    e.preventDefault();
    this.element.style.left = e.clientX - this.startX + "px";
    this.element.style.top = e.clientY - this.startY + "px";
  }

  dragEnd() {
    this.element.style.cursor = "move";
    window.removeEventListener("mousemove", this.drag, true);
    this.element.style.left = `${this.position}px`;
    this.element.style.top = `${(this.row - 1) * rowHeight}px`;
  }

  remove(e) {
    e.preventDefault();
    this.element.remove();
    const index = fishes.indexOf(this);
    if (index !== -1) {
      fishes.splice(index, 1);
    }
  }
}

let fishCounter = 0;
const seaContent = document.getElementById("seaContent");
const rowOrder = [3, 2, 5, 1, 4];
const fishes = [];

function createFish() {
  const inputText = document.getElementById("inputText").value;
  if (!inputText) {
    alert("テキストを入力してください");
    return;
  }

  const row = rowOrder[fishCounter % rowOrder.length];
  const rowHeight = seaContent.clientHeight / 5;

  const fish = new Fish(inputText);
  fish.row = row;

  // 古い魚がいる場合、古い魚を右に移動させる
  fishes.forEach((oldFish) => {
    oldFish.moveRight();
  });

  // 新しい魚の初期位置を海の左端に設定
  fish.position = 0;

  fish.create();

  const fishTop = (row - 1) * rowHeight;
  fish.element.style.top = `${fishTop}px`;

  fishes.push(fish);
  fishCounter++;
}