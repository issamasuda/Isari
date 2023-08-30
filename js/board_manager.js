const backend = new IsariBackend();
    
function getCurrentUrlWithoutQuery() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const pathname = window.location.pathname;
    return `${protocol}//${host}${pathname}`;
}

function formatDateToYMD(dateObject) {
    // 年を取得
    const year = dateObject.getFullYear();
    // 月を取得（月は0から11で表されるので+1する）
    const month = dateObject.getMonth() + 1;
    // 日を取得
    const day = dateObject.getDate();
    
    // %Y/%M/%D 形式の文字列に変換
    return `${year}/${month}/${day}`;
}

// メニューの表示/非表示を切り替える関数
function toggleMenu(event, target) {
    allHidden();
    // イベントのバブリングを阻止
    event.stopPropagation();

    // クリックされたボタンの親要素（リストアイテム）を取得
    const listItem = event.target.closest('.list-item');

    // リストアイテム内のメニュー要素を取得
    const menu = listItem.querySelector('.menu');

    // メニューの表示/非表示を切り替え
    menu.classList.toggle('hidden');
}

function overlay(disabled){
    document.getElementById("add-board-button").disabled = disabled;
    const overlay = document.getElementById('overlay');
    if(disabled == true){
        overlay.style.display = 'block';
    }else{
        overlay.style.display = 'none';
    }
}

function allHidden(){
    const menus = document.querySelectorAll('.menu');
    menus.forEach(menu => menu.classList.add('hidden'))
    if(document.getElementById("board-make").classList.contains("hidden") && document.getElementById("board-change").classList.contains("hidden") && document.getElementById("board-share-submit").classList.contains("hidden") && document.getElementById("board-share").classList.contains("hidden") && document.getElementById("board-del-window").classList.contains("hidden")){
        overlay(false);
    }
}
  // ページ全体をクリックしたときに全てのメニューを閉じる
document.addEventListener('click', function() {
    allHidden();
});

function updateRoomList(){
    listElement = document.getElementById("roomList");
    overlay(false);
    backend.getAllRooms().then((res) => {
        console.log(res);
        while(listElement.lastChild){
            listElement.removeChild(listElement.lastChild);
        }
        if(res.length == 0){
            listElement.insertAdjacentHTML('afterbegin', `
            <tr id="list_1" class="board-item">
                <td style="">　</td>
                <td style="">　</td>
                <td style="">　</td>
                <td class="_td" style="position:absolute;top:67px;left:100px;pointer-events: none;">ボードがありません</div>
            </tr>
            
            `);
        }
        for(let i = 0; i < res.length ; i++){
            listElement.insertAdjacentHTML('afterbegin', `
            <tr id="list_${i}" class="board-item" onclick="if (event.target.id == 'board_${i}_config' || event.target.id == 'board_${i}_img') {return;}changePage('${res[i].roomId}','${res[i].roomName}','${res[i].password}');">
                <td>${res[i].roomName}</td>
                <td>${formatDateToYMD(new Date(res[i].lastAccessTime), '%YYYY%年%MM%月%DD%日')}</td>
                <td id="board_${i}_config" class="list-item" onclick="if (event.target.id == 'board_${i}_config' || event.target.id == 'board_${i}_img')toggleMenu(event, 'board_${i}_menu');">
                    <img id="board_${i}_img" src="img/DotsIcon.svg" width="5" height="13" alt="">
                    <div id="board_${i}_menu" class="menu hidden" onclick="event.stopPropagation();">
                        <div class="name-del-window">
                            <div class="nd-window-header">
                                <button class="close-button" onclick="allHidden();"><img src="./img/XButton.svg" width="25" height="25" alt=""></button>
                            </div>
                            <div class="nd-window-body">
                                <button class="name-button" onclick="changeButtonState('${res[i].roomId}','${res[i].roomName}','${res[i].password}');allHidden();overlay(true);">名前を変更</button>
                                <button class="share-button" onclick="document.getElementById('board-share').classList.remove('hidden');setupShareWindow('${res[i].roomId}','${res[i].roomName}','${res[i].password}');allHidden();overlay(true);">ボードを共有</button>
                                <button class="del-button" onclick="deleteId='list_${i}';deleteRoomId='${res[i].roomId}';document.getElementById('board-del-window').classList.remove('hidden');allHidden();overlay(true);">削除する</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
            `);
        }
    })
}

let changeId="";
let deleteId="";
let deleteRoomId="";

function changeButtonState(roomId){
    document.getElementById('board-change').classList.remove('hidden');
    changeId = roomId;
}

function createRoom(){
    const room = document.getElementById("room").value;
    const roomPass = document.getElementById("roomPass").value;
    console.log(room, roomPass)
    backend.createRoom(room, roomPass)
    updateRoomList();
}

function createShareUrl(roomId, roomName, password="") {
    if(password!=""){password = `&password=${password}`}
    return `${getCurrentUrlWithoutQuery()}?roomId=${roomId}&roomName=${roomName}${password}`;
}

function distinguishColors(color1, color2, isBrightFirst=true) {
    // 色の明るさを計算する内部関数
    function calculateBrightness(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // 2つの色の明るさを計算
    const brightness1 = calculateBrightness(color1);
    const brightness2 = calculateBrightness(color2);

    // 明るさに応じて色を識別
    let brightColor, darkColor;
    if (brightness1 > brightness2) {
        brightColor = color1;
        darkColor = color2;
    } else {
        brightColor = color2;
        darkColor = color1;
    }

    // 真偽値に応じて出力の順序を変更
    return isBrightFirst ? [brightColor, darkColor] : [darkColor, brightColor];
}

function getContrastColor(hexColor) {
    // 入力色からRGB成分を取り出す
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // YIQ式を用いて明るさを計算する
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // 明るさに応じて対比色を決定する
    const contrastColor = (yiq >= 128) ? '#000000' : '#ffffff';

    return contrastColor;
}

function createShare2dCode(roomId, roomName, password, elementId, size=256){
    const element = document.getElementById(elementId)
    while(element.lastChild){
        element.removeChild(element.lastChild);
    }
    new QRCode(element, {
        text: createShareUrl(roomId, roomName, password),
        width: 256,
        height: 256,
        colorDark : distinguishColors(localStorage.userColor, getContrastColor(localStorage.userColor))[1],
        colorLight : distinguishColors(localStorage.userColor, getContrastColor(localStorage.userColor))[0],
        correctLevel : QRCode.CorrectLevel.H
    });
    element.style.backgroundColor = distinguishColors(localStorage.userColor, getContrastColor(localStorage.userColor))[0];
    element.style.padding = `${size/10}px`;
    element.style.width = "fit-content";
    element.style.margin = "0 auto";
    element.style.borderRadius = "20px"
}

function setupShareWindow(inputRoomId, inputRoomName, inputPassword){
    const url = createShareUrl(inputRoomId, inputRoomName, inputPassword);
    document.getElementById("sharing-board-name").value = url;
    createShare2dCode(inputRoomId, inputRoomName, inputPassword, "QRCode")
}

let roomId;
let roomName;
let password;
window.onload = function() {
    updateRoomList();

    const urlParams = new URLSearchParams(window.location.search);
    roomId   = urlParams.get('roomId');
    roomName = urlParams.get('roomName');
    password = urlParams.get('password');
    
    //ユーザー情報未登録なら画面遷移
    if(localStorage.userName == null || localStorage.userName == ""){
        if(roomId != "" && roomId != null){
            location.href=`./login.html?roomId=${roomId}&roomName=${roomName}&password=${password}`;
        }else{
            location.href=`./login.html`;
        }
    }
    //共有ボードを登録
    // クエリパラメータからページIDを取得
    console.log(roomId, roomName)
    if(roomId != "" && roomId != null){
        overlay(true);
        document.getElementById('board-share-submit').classList.remove('hidden');
        document.getElementById('share-board-name').value = roomName;
    }
}

function changePage(pageId, pageName, password){
    localStorage.setItem('pageName', pageName);
    localStorage.setItem('pageId'  , pageId  );
    localStorage.setItem('password', password);
    location.href=`./page.html`;
}