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
    this.element.draggable = true;
    this.element.id = `fish${fishCounter}`;
    seaContent.appendChild(this.element);

    this.element.addEventListener("dragstart", this.dragStart.bind(this), false);
    this.element.addEventListener("mouseup", this.dragEnd.bind(this), false);
    this.element.addEventListener("contextmenu", this.remove.bind(this), false);

    fishCounter++;
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
    this.dropped = false;
    this.element.style.cursor = "grabbing";
    window.addEventListener("mousemove", this.drag.bind(this), true);
  }

  drag(e) {
    e.preventDefault();
    if (this.isDragging) {
      this.element.style.left = e.clientX - this.startX + "px";
      this.element.style.top = e.clientY - this.startY + "px";
      
      // ドラッグ中の位置が海の範囲外か判定
      if (
        e.clientX < seaContent.offsetLeft ||
        e.clientX > seaContent.offsetLeft + seaContent.offsetWidth ||
        e.clientY < seaContent.offsetTop ||
        e.clientY > seaContent.offsetTop + seaContent.offsetHeight
      ) {
        this.isDragging = false; // ドラッグ操作を終了
      }
    }
  }

  dragEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      this.element.style.cursor = "move";
  
      if (!this.dropped) {
        // ドロップが海の枠外になる場合の処理
        if (
          this.element.offsetLeft < seaContent.offsetLeft ||
          this.element.offsetLeft + this.element.offsetWidth > seaContent.offsetLeft + seaContent.offsetWidth ||
          this.element.offsetTop < seaContent.offsetTop ||
          this.element.offsetTop + this.element.offsetHeight > seaContent.offsetTop + seaContent.offsetHeight
        ) {
          // ドラッグが海の枠外になる場合の処理
          if (this.element.offsetTop < seaContent.offsetTop) {
            this.element.style.top = `${seaContent.offsetTop}px`;
          } else if (this.element.offsetTop + this.element.offsetHeight > seaContent.offsetTop + seaContent.offsetHeight) {
            this.element.style.top = `${seaContent.offsetTop + seaContent.offsetHeight - this.element.offsetHeight}px`;
          }
  
          if (this.element.offsetLeft < seaContent.offsetLeft) {
            this.element.style.left = `${seaContent.offsetLeft}px`;
          } else if (this.element.offsetLeft + this.element.offsetWidth > seaContent.offsetLeft + seaContent.offsetWidth) {
            this.element.style.left = `${seaContent.offsetLeft + seaContent.offsetWidth - this.element.offsetWidth}px`;
          }
  
          seaContent.appendChild(this.element);
        }
      } else {
      // ドロップされた場合の処理
        const dropX = this.element.offsetLeft;
        const dropY = this.element.offsetTop;
        
        // バケツの位置・サイズを取得
        const bucketRect = bucket.getBoundingClientRect();
        const bucketLeft = bucketRect.left + window.scrollX;
        const bucketRight = bucketRect.right + window.scrollX;
        const bucketTop = bucketRect.top + window.scrollY;
        const bucketBottom = bucketRect.bottom + window.scrollY;
    
        // ドロップ位置がバケツ内か判定
        const isInsideBucket = dropX >= bucketLeft && dropX <= bucketRight && dropY >= bucketTop && dropY <= bucketBottom;
    
        if (isInsideBucket) {
          // バケツ内にドロップされた場合
          bucket.appendChild(this.element);
          this.element.style.position = "static"; // ドラッグ中のスタイルをリセット
        } else {
          // バケツ外にドロップされた場合
          this.returnToOriginalPosition();
        }
      }
    }
  }
  

  remove(e) {
    e.preventDefault();
    this.element.remove();
    const index = fishes.indexOf(this);
    if (index !== -1) {
      fishes.splice(index, 1);
    }
  }

  drop(e) {
    e.preventDefault();
    if (this.isDragging) {
      // ドロップ先がバケツでない場合、元の位置に戻す
      if (!e.currentTarget.classList.contains("bucket")) {
        this.isDragging = false;
        this.element.style.left = `${this.position}px`;
        this.element.style.top = `${(this.row - 1) * this.rowHeight}px`;
        seaContent.appendChild(this.element);
        return;
      }else {
        // バケツに魚を追加
        bucket.appendChild(this.element);
        this.element.style.position = "static"; // 移動制限を解除
        this.dropped = true; // ドロップされたことをフラグで示す
      }
  
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

const bucket = document.getElementById("bucketContent");

// バケツに対するdragoverイベントとdropイベントの処理を追加
bucket.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

bucket.addEventListener("drop", (e) => {
  e.preventDefault();
  const fishId = e.dataTransfer.getData("text/plain");
  const fish = fishes.find(fish => fish.element.id === fishId);
  if (fish) {
    // ドロップ位置の座標を取得
    const dropX = e.clientX + window.scrollX;
    const dropY = e.clientY + window.scrollY;

    // バケツの位置・サイズを取得
    const bucketRect = bucket.getBoundingClientRect();
    const bucketLeft = bucketRect.left + window.scrollX;
    const bucketRight = bucketRect.right + window.scrollX;
    const bucketTop = bucketRect.top + window.scrollY;
    const bucketBottom = bucketRect.bottom + window.scrollY;

    // ドロップ位置がバケツ内か判定
    const isInsideBucket = dropX >= bucketLeft && dropX <= bucketRight && dropY >= bucketTop && dropY <= bucketBottom;

    if (isInsideBucket) {
      // バケツ内にドロップされた場合
      bucket.appendChild(fish.element);
      fish.element.style.position = "static"; // ドラッグ中のスタイルをリセット
    } else {
      // バケツ外にドロップされた場合
      fish.returnToOriginalPosition();
    }

    fish.isDragging = false; // ドラッグ操作を終了
  }
});