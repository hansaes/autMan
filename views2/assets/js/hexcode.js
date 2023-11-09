//编码,将一个字符串编码成0-f之间的字符串
function encodeToHex(str) {
    var encoder = new TextEncoder();
    var data = encoder.encode(str);
    var hexStr = '';

    for (var i = 0; i < data.length; i++) {
        var hex = data[i].toString(16);
        hexStr += hex;
    }

    return hexStr;
}
//解码,将一个0-f之间的字符串解码成字符串
function decodeFromHex(encodedHex) {
    var decodedStr = '';

    for (var i = 0; i < encodedHex.length; i += 2) {
        var hex = encodedHex.substr(i, 2);
        var charCode = parseInt(hex, 16);
        decodedStr += String.fromCharCode(charCode);
    }

    return decodedStr;
}