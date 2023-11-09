$(document).ready(function () {

    //填充表格
    autFillKnowledgea()

    //绑定check-all的change事件
    $("#check-all").change(function () {
        $("input[id^='ids_']").prop('checked', $(this).prop("checked"));
    });

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchBucket(event); // 调用搜索函数
        }
    });

    //绑定name中包含url字符串的checkbox的change事件
    $("input[name*='url']").change(function () {
        if ($(this).prop("checked")) {
            $("input[name*='url']").prop('checked', false);
            $(this).prop('checked', true);
        }
    });
})

//填充桶内键值对表格
function autFillKnowledgea(searchValue) {
    if (!searchValue) {
        searchValue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //设置隐藏的数据桶名
    $.get("/knowledge?searchValue=" + searchValue, function (response) {
        html = ""
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            for (var i = 0; i < obj.length; i++) {
                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" id="ids_`+ obj[i].id + `" name="` + obj[i].id + `" value="` + obj[i].id + `"><span></span>
                      </label></td>
                    <td> ${i + 1} </td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].rules.join(",")}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].imtypes ? obj[i].imtypes.join(",") : ''}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].groups ? obj[i].groups.join(",") : ''}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].content}</td>
                        <td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id})"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelBucketKey(${obj[i].id})"><i class="mdi mdi-window-close"></i></a>
                </div></td></tr>`
            }
            $("#datasets").html(html);
            $(".truncate").hover(
                function () {
                    $(this).attr("data-toggle", 'tooltip');
                    $(this).attr("data-placement", 'bottom');
                    $(this).attr("title", $(this).text());
                },
                function () {
                    $(this).removeAttr("title");
                    $(this).removeAttr("data-toggle");
                    $(this).removeAttr("data-placement");
                }
            );
            return
        } else {
            html = "<tr><td colspan=\"7\">无数据记录</td></tr>"
            $("#datasets").html(html);
        }
    });
}

//填充模态框
function autFillModalForm(id) {
    $.get("/knowledge/" + id, function (response) {
        //alert(JSON.stringify(response))
        if (response.code == 200) {
            obj = response.data;
            $("#id").val(obj.id)
            //正则表达式判断是否为[CQ:image,file=xxx.jpg]格式
            if (obj.content.match(/^\[CQ:image,file=.*\]/)) {
                $("#image_url").prop("checked", true)
                $("#value").val(obj.content.substring(15, obj.content.length - 1))
            } else if (obj.content.match(/^\[CQ:voice,file=.*\]/)) {
                $("#voice_url").prop("checked", true)
                $("#value").val(obj.content.substring(15, obj.content.length - 1))
            } else if (obj.content.match(/^\[CQ:video,file=.*\]/)) {
                $("#video_url").prop("checked", true)
                $("#value").val(obj.content.substring(15, obj.content.length - 1))
            } else {
                $("#value").val(obj.content)
            }
            //判断是否为精确匹配
            isExact = true
            for (var i = 0; i < obj.rules.length; i++) {
                if (obj.rules[i].startsWith("^") && obj.rules[i].endsWith("$")) {
                    continue
                } else {
                    isExact = false
                    break
                }
            }
            if (isExact) {
                $("#exact").prop("checked", true)
                $("#rules").val(obj.rules.map(function (item) {
                    return item.substring(1, item.length - 1)
                }).join("\n"))
            } else {
                $("#exact").prop("checked", false)
                $("#rules").val(obj.rules.join("\n"))
            }

            $("#imtypes").val(obj.imtypes ? obj.imtypes.join(",") : '')
            $("#groups").val(obj.groups ? obj.groups.join(",") : '')
        }
    });
}

//模态框提交
function autSubmitModalForm() {
    //获取id
    id = $("#id").val() ? parseInt($("#id").val()) : 0
    //判断是新增还是修改
    method = "PUT"
    if (id == 0) {
        method = "POST"
    }
    //换行分割关键词
    rules = $("#rules").val() ? $("#rules").val().split("\n") : null
    //获取exact是否checked
    if ($("#exact").prop("checked")) {
        //遍历rules数组，每个元素如果前后没有^和$,就加上^和$
        for (var i = 0; i < rules.length; i++) {
            if (!rules[i].startsWith("^")) {
                rules[i] = "^" + rules[i]
            }
            if (!rules[i].endsWith("$")) {
                rules[i] = rules[i] + "$"
            }
        }
    }
    imtypes = $("#imtypes").val() ? $("#imtypes").val().split(",") : null
    //将字符串数组转换为int数组
    groups = $("#groups").val() ? $("#groups").val().split(",") : null
    if (groups){
        for (var i = 0; i < groups.length; i++) {
            groups[i] = parseInt(groups[i].trim())
        }
    }
    //判断图片、语音、视频是否选中
    var value
    if ($("#image_url").prop("checked")) {
        value = "[CQ:image,file=" + $("#value").val() + "]"
    } else if ($("#voice_url").prop("checked")) {
        value = "[CQ:voice,file=" + $("#value").val() + "]"
    } else if ($("#video_url").prop("checked")) {
        value = "[CQ:video,file=" + $("#value").val() + "]"
    } else {
        value = $("#value").val()
    }
    $.ajax({
        url: '/knowledge',
        data: JSON.stringify({
            "id": id,
            "rules": rules,
            "imtypes": imtypes,
            "groups": groups,
            "content": value
        }),
        type: method,
        contentType: "application/json",
        success: function (response) {
            if (response.code == 200) {
                autFillKnowledgea()
                lightyear.notify('提交成功', 'success', 1000);
            } else {
                lightyear.notify('提交失败', 'danger', 3000);
            }
        },
        error: function (xhr, status, error) {
            lightyear.notify('提交失败！错误信息：' + error, 'danger', 3000);
        }
    });
}

//用于左上角删除大按钮
function autDelBucketKeys() {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    var ids = $(':checkbox[id^="ids_"]:checked').map(function () {
                        return parseInt(this.value);
                    }).get();

                    // 如果没有选中任何 checkbox，则返回
                    if (ids.length === 0) {
                        return;
                    }

                    // 创建Ajax请求
                    $.ajax({
                        url: '/knowledge', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: JSON.stringify(ids), // 提交的数据
                        contentType: "application/json",
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillKnowledgea()
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
function autDelBucketKey(id) {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    $.ajax({
                        type: "DELETE",
                        url: "/knowledge",
                        data: JSON.stringify([id]),
                        contentType: "application/json",
                        success: function () {
                            autFillKnowledgea()
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

//搜索
function autSearchBucket(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    //$("#searchInput").val(''); // 将输入框中的值清空
    autFillKnowledgea(inputValue)
}
