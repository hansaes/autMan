$(function () {
    // 设置card-body的初始高度
    $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 15);

    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 15);
    });

    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });

    //填充表格
    autFillRows()

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event); // 调用搜索函数
        }
    });
});

function autSearchRows(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillRows(searchvalue) {
    //加载动画
    lightyear.loading('show');

    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/users?searchValue=" + searchvalue, function (response) {
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].qq}" value="${obj[i].qq}"><span></span>
                      </label>
                    </td>
                    <td>${i + 1}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].name}</td>
                    <td>${obj[i].qq}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].qb}</td>
                    <td>${obj[i].wx}</td>
                    <td>${obj[i].tg}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].wxmp}</td>
                    <td>${obj[i].point}</td>
                    <td>${obj[i].coin}</td>
                    <td>${obj[i].charm}</td>
                    <td>${obj[i].memo}</td>
                    <td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].qq});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow('${obj[i].qq}')"><i class="mdi mdi-window-close"></i></a>
                        </div>
                    </td></tr>`
            }
            $("#check-all").attr("checked", false)
            $("#datasets").html(html ? html : "<tr><td colspan='13'>没有数据</td></tr>");
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
        } else {
            $("#datasets").html("<tr><td colspan='13'>没有数据</td></tr>");
        }
        //取消加载动画
        lightyear.loading('hide');
    });
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
                        url: '/users', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
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

//用于表格每行的结尾操作按钮，id为qq号字符串
function autDelRow(id) {
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
                        url: "/users",
                        data: JSON.stringify([id]),
                        contentType: "application/json; charset=utf-8",
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

//提交模态表单
function autSubmitModalForm() {
    // 遍历表单中的所有输入框，形成一个对象
    var formData = {};
    $('#modal input').each(function () {
        if ($(this).attr('type') == "checkbox") {//boolean类型
            formData[$(this).attr('name')] = $(this).is(':checked');
        } else if ($(this).attr('type') == "number") {//number类型
            formData[$(this).attr('name')] = parseInt($(this).val());
        } else {//其他类型
            formData[$(this).attr('name')] = $(this).val();
        }
    });
    console.log(formData)
    //先获取数据
    $.ajax({
        url: '/users', // 请求URL
        type: 'POST', // 请求方法
        data: JSON.stringify(formData), // 提交的数据
        contentType: "application/json; charset=utf-8",
        success: function (response) { // 请求成功的回调函数
            if (response.code == 200) {
                lightyear.notify('保存成功', 'success', 1000);
                autFillRows()
            } else {
                lightyear.notify('保存失败', 'danger', 3000);
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
    $.get("/users/" + id, function (response) {
        fillForm(response)
    });
}