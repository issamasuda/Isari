function getCurrentUrlWithoutQuery() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const pathname = window.location.pathname;
    return `${protocol}//${host}/board_manager.html`;
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