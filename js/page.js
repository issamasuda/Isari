// エレメントオブジェクトクラス：基本的なDOM要素の操作を提供
class ElementObject {
    constructor(id) {
        this.element = document.getElementById(id);
    }
}

// 魚クラス：魚オブジェクトの基本属性と操作
class Fish extends ElementObject {
    constructor(text, position, type, id, datetime = null) {
        super(id);
        this.text = text;
        this.position = position;
        this.type = type;
        this.id = id;
        this.datetime = datetime ? new Date(datetime) : new Date();
    }
}

// 川魚クラス：川魚に特有の属性や操作
class RiverFish extends Fish {
    constructor(text, position, type, id, speed) {
        super(text, position, type, id);
        this.speed = speed;
    }
}

// 海魚クラス：海魚に特有の属性や操作
class SeaFish extends Fish {
    constructor(text, position, type, id) {
        super(text, position, type, id);
    }
}

// フィールドクラス：オブジェクトのリストを管理
class Field extends ElementObject {
    constructor(id) {
        super(id);
        this.objectList = [];
    }
}

// 海フィールドクラス：海の魚を管理
class SeaField extends Field {
    constructor(id) {
        super(id);
        this.element.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        this.element.addEventListener('drop', this.handleDrop.bind(this), true);
        this.fishNum = 0;
    }

    // ドロップイベントのハンドラ
    handleDrop(e) {
        const droppedElement = document.getElementById(e.dataTransfer.getData('id'));
        const droppedParentElement = document.getElementById(e.dataTransfer.getData('parentId'));
        if (droppedParentElement.classList.contains("fish") && droppedParentElement.parentElement.id == "river") {
            this.createFish(droppedParentElement.firstElementChild.children[1].innerHTML, "position", "type", `convert_${e.dataTransfer.getData('id')}`);
        }
    }

    // 魚を生成
    createFish(text, position, type, id) {
        if (text === "") return;
        id = "seaFish_" + createUuid4();
        this.fishNum++;
        this.objectList.push(new SeaFish(text, position, type, id));
        this.updateField();
        this.element.scrollLeft = this.element.scrollWidth;
    }

    // フィールドの状態を更新
    updateField() {
        while (this.element.lastChild) {
            this.element.removeChild(this.element.lastChild);
        }
        let text = "";
        for (let i = 0; i < this.objectList.length; i++) {
            text += `
                <div id="${this.objectList[i].id}" class="fish" style="left:${20 + i * 100}px;top:${20 + i % 4 * 80}px;" draggable="true" ondragstart="handleDragStart(event)" oncontextmenu="if(window.confirm('削除してもよろしいですか？')){seaField.removeFish('${this.objectList[i].id}')}return false;">
                    <div class="fish-body" draggable="true" onKeyPress="(event) => {if(event.key === 'Enter') {return event.preventDefault()}}">
                        <div class="fish-tail"></div>
                        <div class="fish-content" contentEditable onchange="if(board.handler != null){board.jsonHandler.updateJson(seaField.fishListToJson());}">
                            ${this.objectList[i].text}
                        </div>
                        <div class="fish-head"></div>
                    </div>
                    <div class="time-label">${this.objectList[i].datetime.getHours()}:${this.objectList[i].datetime.getMinutes().toString().padStart(2, '0')}</div>
                </div>
            `
        }
        this.element.insertAdjacentHTML('afterbegin', text);
        console.log(board)
        if (board.handler != null) { board.jsonHandler.updateJson(seaField.fishListToJson()) };
    }

    // 魚を削除
    removeFish(id) {
        document.getElementById(id).remove();
        this.objectList = this.objectList.filter((object) => object.id != id);
        if (board.handler != null) { board.jsonHandler.updateJson(seaField.fishListToJson()) };
    }

    // 魚リストをJsonに変換
    fishListToJson() {
        return JSON.stringify(this.objectList.map(fish => {
            return {
                text: fish.text,
                position: fish.position,
                type: fish.type,
                id: fish.id,
                datetime: fish.datetime.toISOString()
            };
        }));
    }

    // Jsonを魚リストに変換
    jsonToFishList(jsonStr) {
        const jsonObj = JSON.parse(jsonStr);
        this.objectList = jsonObj.map(obj => {
            return new Fish(obj.text, obj.position, obj.type, obj.id, obj.datetime);
        });
        this.updateField();
    }
}

// ドラッグ開始時のハンドラ
function handleDragStart(e) {
    console.log(e)
    e.dataTransfer.setData('id', e.srcElement.id);
    e.dataTransfer.setData('parentId', e.srcElement.parentNode.id);
}

// 川フィールドクラス：川の魚を管理
class RiverField extends Field {
    constructor(id) {
        super(id);
        this.fishNum = 0;
        const fishMoveInterval = 20;  // 魚の動きの更新間隔（ms）
        setInterval(this.moveFish.bind(this), fishMoveInterval);
        const fishCreationInterval = 3000;  // 魚の生成間隔（ms）

        this.flag = true;
        function SetFlag(bool) {
            this.flag = bool;
        }
        let func = SetFlag.bind(this);
        setInterval(this.createFish.bind(this), fishCreationInterval);

        // フォーカスが当たった場合の処理
        window.addEventListener("focus", function () {
            console.log("active")
            this.flag = true;
        }.bind(this));
        // フォーカスが外れた場合の処理
        window.addEventListener("blur", function () {
            console.log("inactive")
            this.flag = false;
        }.bind(this));

    }

    getRandomRow(numRows = 5) {
        return Math.floor(Math.random() * numRows) + 1;
    }

    // すべての魚の移動と削除
    moveFish() {
        for (let i = 0; i < this.objectList.length; i++) {
            const objectElement = document.getElementById(this.objectList[i].id)
            let currentLeft = objectElement.style.left.replace("px", "");
            // 移動
            objectElement.style.left = (currentLeft - 1 + 2) + 'px';
            // 余分な魚を削除
            if (currentLeft > window.screen.width) {
                objectElement.remove();
                this.objectList.splice(i, 1);
            }
        };
    }

    // 魚を生成
    createFish() {
        if (this.flag == false) return;
        function getRandomWord() {
            const riverWords = ["apple", "banana", "orange", "grape", "melon"];
            if (riverWords.length === 0) {
                return null;
            }
            const randomIndex = Math.floor(Math.random() * riverWords.length);
            return riverWords[randomIndex];
        }
        const id = `${createUuid4()}`;
        const words = getRandomWord();
        const fish = new RiverFish(words, "null", "river", id, 1)
        // console.log(fish)
        this.objectList.push(fish);
        this.element.insertAdjacentHTML('afterbegin', `
<div id="${id}" class="fish" style="left:-150px;top:${20 + (Math.floor(Math.random() * 3) + 1) % 3 * 45}px;" draggable="true" ondragstart="handleDragStart(event)">
    <div class="fish-body" draggable="true" onKeyPress="(event) => {if(event.key === 'Enter') {return event.preventDefault()}}">
        <div class="fish-tail"></div>
        <div class="fish-content">
        ${words}
        </div>
        <div class="fish-head"></div>
    </div>
</div>
            `);
        this.fishNum += 1;
    }
}

// バケツクラス：バケツを管理
class Bucket extends ElementObject {
    constructor(id) {
        super(id);
    }
}

// バケツフィールドクラス：バケツの魚を管理
class BucketField extends Field {
    constructor(id) {
        super(id);
        this.element.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        this.element.addEventListener('drop', this.handleDrop.bind(this), true);
        this.fishNum = 0;
        this.bucketNum = 0;

        // スクロール可能な要素（バケツ）の設定
        interact('.resizable')
            .resizable({
                edges: { top: false, left: false, bottom: true, right: true },
                listeners: {
                    move: function (event) {
                        let { x, y } = event.target.dataset

                        x = (parseFloat(x) || 0) + event.deltaRect.left
                        y = (parseFloat(y) || 0) + event.deltaRect.top

                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            transform: `translate(${x}px, ${y}px)`
                        })

                        Object.assign(event.target.dataset, { x, y })
                    }
                }
            })

        // ドラッグ可能な要素（バケツ魚）の設定
        interact('.draggable').draggable({
            modifiers: [
                interact.modifiers.restrict({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            onmove: function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        });
        // ドラッグ可能な要素（バケツ）の設定
        interact('.bucketBox').draggable({
            onmove: function (event) {
                let target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);

                const resizableRect = target.firstElementChild.getBoundingClientRect();
                document.querySelectorAll('.draggable').forEach((draggable) => {
                    const draggableRect = draggable.getBoundingClientRect();
                    if (
                        draggableRect.x >= resizableRect.x &&
                        draggableRect.y >= resizableRect.y &&
                        draggableRect.x <= resizableRect.x + resizableRect.width &&
                        draggableRect.y <= resizableRect.y + resizableRect.height
                    ) {
                        let draggableTarget = draggable,
                            x = (parseFloat(draggableTarget.getAttribute('data-x')) || 0) + event.dx,
                            y = (parseFloat(draggableTarget.getAttribute('data-y')) || 0) + event.dy;

                        draggableTarget.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                        draggableTarget.setAttribute('data-x', x);
                        draggableTarget.setAttribute('data-y', y);
                    }
                });
            }
        });
    }

    // ドロップイベントのハンドラ
    handleDrop(e) {
        const droppedElement = document.getElementById(e.dataTransfer.getData('id'));
        const droppedParentElement = document.getElementById(e.dataTransfer.getData('parentId'));
        console.log(droppedParentElement);
        // バケツ魚の生成
        if (droppedParentElement.classList.contains("fish")) {
            let rect = this.element.getBoundingClientRect();
            let x = e.clientX - rect.x;
            let y = e.clientY - rect.y;
            let id = "bucket_fish_" + createUuid4();
            this.fishNum++;
            this.element.insertAdjacentHTML('afterbegin', `
                <div id="${id}" class="draggable" data-x="${x}" data-y="${y}" contentEditable style="transform: translate(${x}px, ${y}px);" oncontextmenu="if(window.confirm('削除してもよろしいですか？')){ document.getElementById('${id}').remove();}return false;">
                    ${droppedParentElement.firstElementChild.outerHTML}
                </div>
            `);
        }
    }



    // バケツを生成
    createBucket(text, id) {
        id = "bucket_" + createUuid4();
        this.bucketNum++;
        let bucket = new Bucket(id, text);
        this.objectList.push(bucket);
        this.element.insertAdjacentHTML('beforeend', `<div id="${id}" class="bucketBox" oncontextmenu="if(window.confirm('削除してもよろしいですか？')){document.getElementById('${id}').remove();}return false;"><div class="resizable"></div><b><div style="width:fit-content;" contentEditable>名前を入力</div></b></div>`);
    }
}

function createUuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (a) {
        let r = (new Date().getTime() + Math.random() * 16) % 16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function isariCursorCallback(values, parentId) {
    const parentCursor = document.getElementById(parentId);
    // 既存のカーソル要素をクリア
    parentCursor.innerHTML = '';
    // 位置を変更
    values.forEach(function (value, key) {
        if ("cursor" in value) {
            for (let [key, pos] of Object.entries(value.cursor)) {
                const element = document.getElementById(key);
                const rect = element.getBoundingClientRect();
                // カーソルの大きさ
                const cursorWidth = 35;
                const cursorHeight = 35;
                // 要素のスクロール位置を取得
                const scrollLeft = element.scrollLeft || 0;
                const scrollTop = element.scrollTop || 0;
                // スクロール位置をカーソル位置に反映
                let cursorX = pos.x + element.getBoundingClientRect().left - scrollLeft - (cursorWidth / 2);
                let cursorY = pos.y + element.getBoundingClientRect().top - scrollTop - (cursorHeight / 2);
                
                // カーソル座標が要素の境界内にあるかをチェック
                if (pos.x - scrollLeft >= 0 && pos.x - scrollLeft <= rect.width && pos.y - scrollTop >= 0 && pos.y - scrollTop <= rect.height) {
                    // カーソル座標が要素の境界内にある場合のみ描画
                    let cursorDiv = document.createElement('div');
                    cursorDiv.style.width = cursorWidth + 'px';
                    cursorDiv.style.height = cursorHeight + 'px';
                    cursorDiv.style.borderRadius = '50%';
                    cursorDiv.style.borderWidth = '0px';
                    cursorDiv.style.borderStyle = 'solid';
                    cursorDiv.style.borderColor = value.user.color;
                    cursorDiv.style.backgroundColor = 'transparent';
                    cursorDiv.style.position = 'absolute';
                    cursorDiv.className = 'cursor';
                    cursorDiv.style.pointerEvents = 'none';
                    cursorDiv.style.left = cursorX + 'px';
                    cursorDiv.style.top = cursorY + 'px';
                    cursorDiv.style.zIndex = '1000';
                    cursorDiv.insertAdjacentHTML('afterbegin', `
                    <svg width="${cursorWidth}" height="${cursorHeight}" viewBox="0 0 30 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24.7998" cy="5" r="4" fill="${value.user.color}" stroke="white" stroke-width="2"/>
                    <path d="M25.7998 5C25.7998 5.55228 25.3521 6 24.7998 6C24.2475 6 23.7998 5.55228 23.7998 5C23.7998 4.44772 24.2475 4 24.7998 4C25.3521 4 25.7998 4.44772 25.7998 5Z" fill="white"/>
                    <path d="M22.5002 25.2V8.69995H27V25.2C26.3333 29.2 22.8 37.2 14 37.2C3 37.2 1.00032 26.7811 1.00016 25.2C1 23.7 1.00006 21.7 1 20.2C1.5 15.7 6.35646 13.4862 8.50016 12.2C11 10.7 9.83349 12.7 9.50016 13.7C9.16682 15.0333 8.60016 18.2 9.00016 20.2C9.40016 22.2 8.16682 21.7 7.50016 21.2L6.00016 20.2C5.50016 20.7 5.50016 24.2 5.50016 25.2C5.50016 26.2 7.00016 33.7 14.0002 32.7C19.6002 31.9 22.0002 27.3666 22.5002 25.2Z" fill="${value.user.color}" stroke="white" stroke-width="2"/>
                    <path d="M23.5 7.69995H26V9.69995H23.5V7.69995Z" fill="${value.user.color}"/>
                    </svg>             
                    `);
                    // ユーザー名の追加
                    var usernameSpan = document.createElement('span');
                    usernameSpan.style.position = 'absolute';
                    usernameSpan.style.bottom = '0px'; // カーソルの下側
                    usernameSpan.style.fontSize = '12px';
                    usernameSpan.style.color = value.user.color;
                    usernameSpan.style.pointerEvents = 'none';
                    usernameSpan.textContent = value.user.name; // ユーザー名を設定

                    // カーソルが中央より右側にあれば名前を左側に表示
                    if (pos.x - scrollLeft > rect.width / 2) {
                        usernameSpan.style.right = '35px'; // カーソルの左側
                    } else {
                        usernameSpan.style.left = '35px'; // カーソルの右側
                    }

                    cursorDiv.appendChild(usernameSpan);
                    parentCursor.appendChild(cursorDiv);
                }
            }
        }
    });
}

// グローバルから見えるインスタンスの変数を作成
let seaField, riverField, bucketField, board;
let userName, userColor, pageName, pageId, password;

// ボードクラス
class Board {
    constructor() {
        if (localStorage.userName != null) userName = localStorage.userName;
        if (localStorage.userColor != null) userColor = localStorage.userColor;
        if (localStorage.pageName != null) pageName = localStorage.pageName;
        if (localStorage.pageId != null) pageId = localStorage.pageId;
        if (localStorage.password != null) password = localStorage.password;
        if (userName == null) {
            location.href = `./login.html`;
        }
        if (pageId == null) {
            location.href = `./board_manager.html`;
        }
        seaField = new SeaField("sea");
        riverField = new RiverField("river");
        bucketField = new BucketField("bucket");
        document.getElementById("title").innerText = pageName;
        document.getElementById("user").innerText = userName;
        document.getElementById("user-color").style.backgroundColor = userColor;
        document.getElementById("page-title").innerText = pageName;
        this.connect();
    }

    connect() {
        let roomId = pageId;
        console.log(userName, userColor, pageName, pageId, password);
        this.handler = new IsariBackend();
        this.handler.connect({ host: "wss://isari.f5.si/ws/", port: 443, room: pageId, password: password, timeout: 100000 }).then((message) => {
            // カーソル共有
            this.handler.addSyncCursolElement("sea");
            // this.handler.addSyncCursolElement("river");
            this.handler.addSyncCursolElement("bucket");
            // ユーザ情報の設定
            this.handler.setupAwareness(userName, userColor, "cursorDiv", isariCursorCallback); //this.handler.sampleCursorCallback
            // バケツの共有
            this.handler.addSyncElement("bucket");
            // JSONの同期
            this.jsonHandler = this.handler.startSyncJson('seaJson', (event, ytext) => {
                seaField.jsonToFishList(this.jsonHandler.getJson());
            });
            // JSON初期化
            seaField.jsonToFishList(this.jsonHandler.getJson());
        });
    }
}

// 読み込み時の処理
window.onload = function () {
    board = new Board();
}