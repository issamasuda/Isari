class RiverFish {
  constructor(text) {
    this.text = text;
    this.row = null;
    this.element = null;
    this.position = 0;
    this.rowHeight = 0;
  }

  create() {
    this.element = document.createElement("div");
    this.element.classList.add("fish");
    this.element.textContent = this.text;
    this.element.style.left = `${this.position}px`;
    riverContent.appendChild(this.element); // 川のエリアに追加するよう変更
  }

  moveRight() {
    this.position += 10;
    if (this.position >= riverContent.clientWidth) {
      this.position = 0;
    }
    this.element.style.left = `${this.position}px`;
  }

  calculateNewFishPosition() {
    let newPosition = 0;
    if (riverFishes.length > 0) {
      const lastFish = riverFishes[riverFishes.length - 1];
      newPosition = lastFish.position + lastFish.text.length * 5 + this.text.length * 5;
    }
    return newPosition;
  }

  remove() {
    this.element.remove();
    const index = riverFishes.indexOf(this);
    if (index !== -1) {
      riverFishes.splice(index, 1);
    }
  }
}

let riverFishCounter = 0;
const riverContent = document.getElementById("riverContent");
const riverWords = ["apple", "banana", "orange", "grape", "melon"];
const riverFishes = [];

function createRiverFish() {
  const randomWord = getRandomWord();
  if (randomWord) {
    addRiverFish(randomWord);
  }
  riverContent.scrollLeft = riverContent.scrollWidth; // 右端にスクロールする
}

function getRandomWord() {
  if (riverWords.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * riverWords.length);
  return riverWords[randomIndex];
}

function addRiverFish(inputText) {
  const rowHeight = riverContent.clientHeight / 5;
  const fishSpacing = 5; // 魚同士の間隔

  const fish = new RiverFish(inputText);
  fish.row = getRandomRow();
  fish.rowHeight = rowHeight;

  // 新しい魚の初期位置を川の左端に設定
  fish.position = fish.calculateNewFishPosition();

  fish.create();

  const fishTop = (fish.row - 1) * rowHeight;
  fish.element.style.top = `${fishTop}px`;

  riverFishes.push(fish);
}

function getRandomRow() {
  const numRows = 5; // 川の行数
  return Math.floor(Math.random() * numRows) + 1;
}
setInterval(createRiverFish, 2000);
