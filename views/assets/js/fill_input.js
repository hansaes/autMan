$(document).ready(function () {
    //填充input text
    $("input[type='text'],input[type='email'],input[type='password'], textarea,select").each(function (i, elem) {
        //alert($(this).attr("name"))
        var settings = {
            type: "GET",
            url: "/system/" + $(this).attr("name"),
            success: function (response) {
                //alert(data)
                $(elem).val(response.data)
            },
            headers: {
                'cookie': $.cookie
            }
        }
        $.ajax(settings)
    });

    //填充input checkbox
    $("input[type='checkbox']").each(function (i, elem) {
        var settings = {
            type: "GET",
            url: "/system/" + $(this).attr("name"),
            success: function (response) {
                //alert(data)
                if (response.data == "true") {
                    $(elem).attr("checked", true)
                } else {
                    $(elem).attr("checked", false)
                }
            },
            headers: {
                'cookie': $.cookie
            }
        }
        $.ajax(settings)
    });

    //填充input radio
    $("input[type='radio']").each(function (i, elem) {
        //alert($(this).attr("name"))
        var settings = {
            type: "GET",
            url: "/system/" + $(this).attr("name"),
            success: function (response) {
                //alert("服务器数据："+data)
                //alert("当前radio的值："+$(elem).val())
                if ($(elem).val() === response.data.toString()) {
                    $(elem).prop("checked", true); // 设置单选框选中状态
                }
            },
        }
        $.ajax(settings)
    });
})

function submitParams() {
    //显示等待
    lightyear.loading('show');
    // 遍历所有input元素
    var data = {};
    $("input").each(function () {
        if ($(this).attr('type') === 'radio') {
            if ($(this).is(':checked')) {
                // 获取输入框的值和名称
                var inputName = $(this).attr("name");
                var inputValue = $(this).val();
                data[inputName] = inputValue
            }
        } else {
            // 获取输入框的值和名称
            var inputName = $(this).attr("name");
            var inputValue = $(this).val();
            data[inputName] = inputValue;
        }

    });

    // 遍历所有元素
    var forms = document.getElementsByTagName('form');
    for (var i = 0; i < forms.length; i++) {
        //var formObj = {};
        var fields = forms[i].elements;
        for (var j = 0; j < fields.length; j++) {
            var field = fields[j];
            var fieldName = field.name;
            var fieldValue;
            switch (field.type) {
                case 'text':
                case 'textarea':
                case 'email':
                case 'tel':
                case 'number':
                case 'password':
                    fieldValue = field.value;
                    break;
                case 'radio':
                    continue;
                case 'checkbox':
                    fieldValue = field.checked ? field.value : 'false';
                    break;
                case 'select-one':
                    fieldValue = field.options[field.selectedIndex].value;
                    break;
                case 'select-multiple':
                    fieldValue = [];
                    for (var k = 0; k < field.options.length; k++) {
                        if (field.options[k].selected) {
                            fieldValue.push(field.options[k].value);
                        }
                    }
                    break;
                default:
                    fieldValue = '';
            }
            data[fieldName] = fieldValue;
        }
        //formValues.push(formObj);
    }
    console.log(JSON.stringify(data))
    // 使用ajax提交数据
    $.ajax({
        type: "POST",
        url: "/system/params",
        data: data,
        success: function (response) {
            // 处理成功响应
            lightyear.loading('hide');
            lightyear.notify('修改成功', 'success', 3000);
            //console.log(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // 处理错误响应
            lightyear.loading('hide');
            lightyear.notify(textStatus + ": " + errorThrown, 'danger', 1000);
            //console.log(textStatus + ": " + errorThrown);
        }
    });
}