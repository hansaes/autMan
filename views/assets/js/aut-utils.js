function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();

    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
}

//清空模态表单
function autClearModalForm(modal) {
    //清空modal_carry_rule这个表单下所有的input值
    modal.find("input[type=text], textarea, input[type=email],input[type=number],input[type=password]").val('');
    //清空modal_carry_rule这个表单下所有的checkbox值
    modal.find("input[type=checkbox]").prop("checked", false);
}

// 将json数据填充到表单中
function fillForm(response) {
    console.log(response);
    $.each(response.data, function (key, value) {
        var selector = "[name='" + key + "']";
        var $element = $(selector);
        if ($.isPlainObject(value)) {//如果是对象
            $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
        } else if ($element.is(":radio")) {//如果是单选框
            $element.prop("checked", true);
        } else if ($element.is(":checkbox")) {//如果是复选框
            $element.prop("checked", parseBool(value.toString()));
        } else {//其他
            $element.val(value);
        }
    });
}

// 将表单数据序列化为json
function serializaJson(form) {
    var formData = {};
    form.each(function () {
        var fieldName = $(this).attr("name");
        var fieldType = $(this).attr("type");
        if (fieldType === "number") {
            formData[fieldName] = parseInt($(this).val());
        } else if (fieldType === "text") {
            formData[fieldName] = $(this).val().toString();
        } else if (fieldType === "checkbox") {
            formData[fieldName] = $(this).is(":checked");
        }
    });
    return JSON.stringify(formData);
}

//日期格式化
Date.prototype.Format = function (fmt) {
    var e,
        n = this,
        d = fmt,
        l = {
            "M+": n.getMonth() + 1,
            "d+": n.getDate(),
            "D+": n.getDate(),
            "h+": n.getHours(),
            "H+": n.getHours(),
            "m+": n.getMinutes(),
            "s+": n.getSeconds(),
            "w+": n.getDay(),
            "q+": Math.floor((n.getMonth() + 3) / 3),
            "S+": n.getMilliseconds()
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t,
                a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

//为String扩展自定义属性
String.prototype.replaceAll = function (f, e) { //吧f替换成e
    var reg = new RegExp(f, "g"); //创建正则RegExp对象   
    return this.replace(reg, e);
}

function isNull(param) {
    if (typeof param !== "undefined" && param !== null && param !== "") {
        return false
    } else {
        return true
    }
}
