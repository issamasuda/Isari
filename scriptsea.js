class Fish {
  constructor(text) {
    this.text = text;
    this.row = null;
    this.element = null;
    this.position = 0;
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;
    this.rowHeight = 0;
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
    this.position += 10;
    if (this.position >= seaContent.clientWidth) {
      this.position = 0;
    }
    this.element.style.left = `${this.position}px`;
  }

  calculateNewFishPosition() {
    let newPosition = 0;
    if (fishes.length > 0) {
      const lastFish = fishes[fishes.length - 1];
      newPosition = lastFish.position + lastFish.text.length * 5 + this.text.length * 5;
    }
    return newPosition;
  }

  dragStart(e) {
    this.startX = e.clientX - this.element.offsetLeft;
    this.startY = e.clientY - this.element.offsetTop;
    this.isDragging = true;
    this.element.style.cursor = "grabbing";
    window.addEventListener("mousemove", this.drag.bind(this), true);
  }

  drag(e) {
    e.preventDefault();
    if (this.isDragging) {
      this.element.style.left = e.clientX - this.startX + "px";
      this.element.style.top = e.clientY - this.startY + "px";
    }
  }

  dragEnd() {
    this.isDragging = false;
    this.element.style.cursor = "move";
    window.removeEventListener("mousemove", this.drag.bind(this), true);
    this.element.style.left = `${this.position}px`;
    this.element.style.top = `${(this.row - 1) * this.rowHeight}px`;
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
  addFish(inputText);
  removeOldFish();
  seaContent.scrollLeft = seaContent.scrollWidth; // 右端にスクロールする
}

function addFish(inputText) {
  if (!inputText) {
    alert("テキストを入力してください");
    return;
  }

  const row = rowOrder[fishes.length % rowOrder.length];
  const rowHeight = seaContent.clientHeight / 5;
  const fishSpacing = 5; // 魚同士の間隔

  const fish = new Fish(inputText);
  fish.row = row;
  fish.rowHeight = rowHeight;

  // 新しい魚の初期位置を海の左端に設定
  fish.position = fish.calculateNewFishPosition();

  fish.create();

  const fishTop = (row - 1) * rowHeight;
  fish.element.style.top = `${fishTop}px`;

  fishes.push(fish);
}

function removeOldFish() {
  // 現在表示されている魚の一番右側の魚を削除する
  const fishToRemove = fishes[0];
  const fishWidth = fishToRemove.element.clientWidth;

  if (fishToRemove.position + fishWidth < 0) {
    fishToRemove.element.remove();
    fishes.shift(); // 配列から削除
  }
}