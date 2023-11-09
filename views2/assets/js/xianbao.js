$(function () {
    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });
});

$(document).ready(function () {
    autFillRows()

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event); // 调用搜索函数
        }
    });
})

function autSearchRows(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/jingfen?searchValue=" + searchvalue, function (data, status) {
        //alert(JSON.stringify(data))
        if (data.code==200) {
            obj = data.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                //开关
                let jfswitch = ""
                if (obj[i].on) {
                    jfswitch = "checked"
                }
                //带图
                let jfpic = ""
                if (obj[i].pic) {
                    jfpic = "checked"
                }
                let jfhead = ""
                if (obj[i].title) {
                    jfTitle = "checked"
                }

                let pinlei = stringTable[obj[i].elite_id]

                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                      </label>
                    </td>
                    <td>${obj[i].id}</td>
                    <td>${obj[i].name}</td>
                    <td><label class="lyear-switch switch-solid switch-primary">
                        <input type="checkbox" ${jfswitch}  name="switch_${obj[i].id}" id="switch_${obj[i].id}" onchange="autHandleCheckboxChangeEvent(this)">
                        <span></span>
                    </label></td>
                    <td>${pinlei}</td>
                    <td>${obj[i].time_quantum}</td>
                    <td>${obj[i].interval}</td>
                    <td>${obj[i].page_size}</td>
                    <td>${obj[i].to}</td>
                    <td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelQinglong(${obj[i].id})"><i class="mdi mdi-window-close"></i></a>
                        </div>
                    </td></tr>`
            }
            //$("#datasets").append(html)
            $("#check-all").attr("checked", false)
            $("#datasets").html(html);
        }
    });
}


stringTable = {
    1: "好券商品",
    2: "精选卖场",
    10: "9.9包邮",
    15: "京东配送",
    22: "实时热销榜",
    23: "为你推荐",
    24: "数码家电",
    25: "超市",
    26: "母婴玩具",
    27: "家具日用",
    28: "美妆穿搭",
    30: "图书文具",
    31: "今日必推",
    32: "京东好物",
    33: "京东秒杀",
    34: "拼购商品",
    40: "高收益榜",
    41: "自营热卖榜",
    108: "秒杀进行中",
    109: "新品首发",
    110: "自营",
    112: "京东爆品",
    125: "首购商品",
    129: "高佣榜单",
    130: "视频商品",
    153: "历史最低价商品榜",
    210: "极速版商品",
    238: "新人价商品",
    247: "京喜9.9",
    249: "京喜秒杀",
    315: "秒杀未开始",
    340: "时尚趋势品",
    341: "3C新品",
    342: "智能新品",
    343: "3C长尾商品",
    345: "时尚新品",
    346: "时尚爆品",
    426: "京喜自营",
    1001: "选品库",
}


//处理表格中的开关
function autHandleCheckboxChangeEvent(checkbox) {
    ids = "[" + checkbox.id.split("_")[1] + "]"
    //alert(ids)
    if (checkbox.checked) {
        // 当前 checkbox 被选中
        $.ajax({
            type: "PUT",
            url: "/jingfen/enable",
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.code==200) {
                    lightyear.notify('启用成功', 'success', 3000);
                } else {
                    lightyear.notify('启用失败', 'danger', 1000);
                }
            },
        })
    } else {
        //alert("当前 checkbox 被取消选中")
        // 当前 checkbox 被取消选中
        $.ajax({
            type: "PUT",
            url: "/jingfen/disable",
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.code==200) {
                    lightyear.notify('禁用成功', 'success', 3000);
                } else {
                    lightyear.notify('禁用失败', 'danger', 1000);
                }
            },
        })
    }
}

//用于左上角删除大按钮
function autDelRows() {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    var ids = $('input[name^="ids_"]:checked').map(function () {
                        return $(this).val();
                    }).get(); // 将所有值添加到一个数组中

                    // 如果没有选中任何 checkbox，则返回
                    if (ids.length === 0) {
                        return;
                    }

                    // 创建Ajax请求
                    $.ajax({
                        url: '/jingfen', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code==200) {
                                autFillRows()
                            }
                        },
                        error: function (xhr, status, error) { // 请求失败的回调函数
                            console.log('Error:', error);
                        }
                    });
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                    //$.alert('你点击了取消!');
                }
            }
        }
    });
}

//用于表格每行的结尾操作按钮
function autDelQinglong(id) {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    $.ajax({
                        type: "DELETE",
                        url: "/jingfen",
                        data: "[" + id + "]",
                        success: function () {
                            autFillRows()
                        }
                    })
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                    //$.alert('你点击了取消!');
                }
            }
        }
    });
}

//清空模态表单
function autClearModalForm() {
    //清空modal_qinglong_rule这个表单下所有的input值
    //alert("清空modal_qinglong_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    var formData = $("#modal").serialize();
    //alert(JSON.stringify(formData))
    //先获取数据
    $.ajax({
        url: '/jingfen', // 请求URL
        type: 'POST', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: formData, // 提交的数据
        success: function (response) { // 请求成功的回调函数
            if (response.code==200) {
                lightyear.notify('保存成功', 'success', 3000);
                autFillRows()
            } else {
                lightyear.notify('保存失败', 'danger', 1000);
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//填充模态表单
function autFillModalForm(id) {
    //先获取数据
    $.get("/jingfen?id=" + id, function (data, status) {
        // 将 JSON 数据设置为表单值
        jsonData = data.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);
            if ($.isPlainObject(value)) {
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else if ($element.is(":radio")) {
                $(`input[name='${key}'][value='${value}']`).prop("checked", true);
            } else if ($element.is(":checkbox")) {
                $element.prop("checked", parseBool(value.toString()));
            } else {
                $element.val(value);
            }
        });
    });
}

//启用规则
function autEnableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }
    //alert(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/jingfen/enable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code==200) {
                autFillRows()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//禁用规则
function autDisableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/jingfen/disable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code==200) {
                autFillRows()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}