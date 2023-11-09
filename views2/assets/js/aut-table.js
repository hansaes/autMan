//const { data } = require("jquery");

/**
* 分页相关的配置
**/
const pagination = {
    // 分页方式：[client] 客户端分页，[server] 服务端分页
    sidePagination: "client",
    // 初始化加载第一页，默认第一页
    pageNumber: 1,
    // 每页的记录行数
    pageSize: 10,
    // 可供选择的每页的行数 - (亲测大于1000存在渲染问题)
    pageList: [5, 10, 25, 50, 100, 200, 500, 1000],
    // 在上百页的情况下体验较好 - 能够显示首尾页
    paginationLoop: true,
    // 展示首尾页的最小页数
    paginationPagesBySide: 2
};

/**
 * 按钮相关配置
 **/
const button = {
    // 按钮的类
    buttonsClass: 'default',
    // 类名前缀
    buttonsPrefix: 'btn'
}

/**
 * 图标相关配置
 **/
const icon = {
    // 图标前缀
    iconsPrefix: 'mdi',
    // 图标大小
    iconSize: 'mini',
    // 图标的设置
    icons: {
        paginationSwitchDown: 'mdi-door-closed',//显示隐藏分页
        paginationSwitchUp: 'mdi-door-open',//显示隐藏分页
        refresh: 'mdi-refresh',//刷新
        toggleOff: 'mdi-toggle-switch-off',
        toggleOn: 'mdi-toggle-switch',
        columns: 'mdi-table-column-remove',
        detailOpen: 'mdi-plus',
        detailClose: 'mdi-minus',
        fullscreen: 'mdi-monitor-screenshot',//全屏
        search: 'mdi-table-search',
        clearSearch: 'mdi-trash-can-outline'
    }
};

/**
 * 表格相关的配置
 **/
const table = {
    classes: 'table table-bordered table-hover table-striped lyear-table',
    // 唯一ID字段
    uniqueId: 'id',
    // 每行的唯一标识字段
    idField: 'id',
    // 显示搜索框
    search: true,
    // 工具按钮容器
    toolbar: '#toolbar',
    // 是否分页
    pagination: true,
    // 是否显示所有的列
    showColumns: true,
    // 是否显示刷新按钮
    showRefresh: true,
    // 显示图标
    showButtonIcons: true,
    // 显示文本
    showButtonText: false,
    // 显示全屏
    showFullscreen: true,
    // 开关控制分页
    showPaginationSwitch: true,
    // 总数字段
    totalField: 'total',
    // 当字段为 undefined 显示
    undefinedText: '-',
    // 排序方式
    sortOrder: "asc",
    ...icon,
    ...pagination,
    ...button
};

/* 行操作 - 表格每行的编辑按钮
    * row: 当前行的数据
    * path: 请求的路径
    * modal: 要使用的模版模态框
*/
function autEditRow(row, path, modal) {
    console.log(row.id);
    timestamp = new Date().getTime()
    $.get(`${path}/${row.id}?t=${timestamp}`, function (response) {
        form = modal.find("form");
        form.find("input[type=text], textarea, input[type=email],input[type=number],input[type=password]").val('');
        form.find("input[type=checkbox]").prop("checked", false);
        fillForm(response)
    });
    modal.modal('show');
}

/* 行操作 - 日志
    * row: 当前行的数据
    * path: 请求的路径
    * modal: 要使用的模版模态框
*/
function autLogRow(row, path, modal) {

    //清除所有事件绑定
    modal.unbind();
    var intervalId//日志不间断请求的id

    //绑定日志模态框的显示和隐藏事件
    modal.on('show.bs.modal', function () {
        console.log('模态框显示了');
        modal.find(".modal-body").html("正在加载日志...")

        //不间断的请求日志
        intervalId = setInterval(function () {
            $.ajax({
                url: `${path}/${row.id}/log?t=` + Date.now(), // 请求URL
                type: 'GET', // 请求方法
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        str = response.data.replace(/\n/g, '<br>');
                        str = "<small>" + str + "</small>"
                        modal.find(".modal-body").html(str)
                        //滚动到底部
                        modal.find(".modal-body").scrollTop(modal.find(".modal-body")[0].scrollHeight);
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
        }, 1000);
    });

    modal.on('hide.bs.modal', function () {
        console.log('模态框隐藏了');
        clearInterval(intervalId)
        //清除所有事件绑定
        modal.unbind();
    });
    modal.modal('show');
}

/* 行操作 - 表格每行的删除按钮
    * rows: 拟删除行的数据
    * path: 请求的路径
    * modal: 要使用的模版模态框
*/
function autDelRows(rows, path, funcFormatData) {
    ids = []
    for (var i = 0; i < rows.length; i++) {
        ids.push(rows[i].id)
    }
    console.log(ids)
    if (ids.length == 0) {
        showNotify('请先选择行', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
        return;
    }
    $.confirm({
        title: '确定删除',
        content: `确定删除这${ids.length}项吗？`,
        icon: 'mdi mdi-comment-question',
        animation: 'scale',
        closeAnimation: 'scale',
        opacity: 0.5,
        buttons: {
            'confirm': {
                text: '确认',
                btnClass: 'btn-blue',
                action: function () {
                    $.ajax({
                        type: "DELETE",
                        url: path,
                        data: JSON.stringify(ids),
                        success: function () {
                            // 删除多行
                            autRefreshTable(path, funcFormatData);
                        }
                    })
                }
            },
            '取消': function () {
            },
        }
    });
}

// 行操作 - 表格中的启用\禁用\运行\停止按钮
function autToggleRows(rows, action, path) {
    //console.log(row, checked)
    ids = []
    //遍历rows
    for (var i = 0; i < rows.length; i++) {
        ids.push(rows[i].id)
    }
    console.log(ids)
    if (ids.length == 0) {
        showNotify('请先选择行', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
        return;
    }
    //alert(ids)
    router = `${path}/${action}`
    // 当前 checkbox 被选中
    $.ajax({
        type: "PUT",
        url: router,
        data: JSON.stringify(ids),
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
            console.log(response);
            if (response.code == 200) {
                // 刷新行
                autRefreshRows(rows, path);
                msg = response.message ? response.message : "操作成功"
                showNotify(msg, 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
            } else {
                showNotify('操作失败', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
            }
        },
    });
}

// 行移动操作 - 表格中的上移\下移按钮
function autMoveRows(rows, path, action, funcFormatData) {
    //console.log(row, checked)
    ids = []
    //遍历rows
    for (var i = 0; i < rows.length; i++) {
        ids.push(rows[i].id)
    }
    console.log(ids)
    if (ids.length == 0) {
        showNotify('请先选择行', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
        return;
    }
    //alert(ids)
    router = `${path}/${action}`
    // 当前 checkbox 被选中
    $.ajax({
        type: "PUT",
        url: router,
        data: JSON.stringify(ids),
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
            console.log(response);
            if (response.code == 200) {
                // 刷新行
                autRefreshTable(path, funcFormatData);
                //showNotify('操作成功', 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
            } else {
                showNotify('操作失败', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
            }
        },
    });
}

// 有更改时刷新行
function autRefreshRows(rows, path) {
    for (var i = 0; i < rows.length; i++) {
        $.ajax({
            url: `${path}/${rows[i].id}`,
            async: false,
            success: function (response, status) {
                if (response.code == 200 && response.data) {
                    console.log(response.data);
                    $('table').bootstrapTable('updateByUniqueId', {
                        id: rows[i].id,
                        row: response.data
                    });
                }
            }
        });
    }
}

// 有更改时要刷新表格
function autRefreshTable(path, funcFormatData) {
    $.get(path, function (response, status) {
        if (response.code == 200 && response.data) {
            console.log(response.data);
            //对数据进行整理
            if (funcFormatData) {
                funcFormatData(response.data)
            }
            $('table').bootstrapTable('load', response.data);
            showNotify('刷新成功', 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
        } else {
            showNotify('刷新失败', 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
        }
    });
}

// 填充表格
function autFillTable(searchvalue, path, formatData, columns) {
    searchvalue = searchvalue || "";
    $.get(`${path}?searchValue=${searchvalue}`, function (response, status) {
        if (response.code == 200 && response.data) {
            console.log(response.data);
            //对数据进行整理
            if (formatData) {
                formatData(response.data)
            }
            //填充表格
            $('table').bootstrapTable({
                ...table,
                data: response.data,
                columns: columns,
                onLoadSuccess: function (data) {
                    $("[data-bs-toggle='tooltip']").tooltip();
                }
            });
        }
    });
};

//清理模态框并显示
function autClearModalForm(modal) {
    console.log("用于新增按钮")
    //显示模态框
    form = modal.find("form");
    form.find("input[type=text], textarea, input[type=email],input[type=number],input[type=password]").val('');
    form.find("input[type=checkbox]").prop("checked", false);
    modal.modal('show');
}

//提交模态表单
function autSubmitModalForm(modal, funcFormatJson, path) {
    form = modal.find("form");
    //查找form表单中name为id的元素的值
    formData = serializaJson(form)
    method = "POST"
    if (formData.id) {
        method = "PUT"
    }
    //数据类型整理
    if (funcFormatJson) {
        funcFormatJson(formData);
    }

    data = JSON.stringify(formData);
    console.log(data);
    //先获取数据
    $.ajax({
        url: path, // 请求URL
        type: method, // 请求方法
        dataType: 'json', // 返回的数据类型
        data: data, // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            if (response.code == 200) {
                showNotify('操作成功', 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
                modal.modal('hide');
                if (method == "POST") {//新增行，添加到表格头部
                    console.log(response.data);
                    // 追加一行到头部
                    $('table').bootstrapTable('prepend', response.data);
                } else {//刷新更改行
                    autRefreshRows([formData], path);
                }
            } else {
                console.error(response);
                msg = response.message ? response.message : "操作失败"
                showNotify(msg, 'danger', 3000, 'mdi mdi-emoticon-sad', 'top', 'center');
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();

    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
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
            $element.filter("[value='" + value + "']").prop("checked", true);
        } else if ($element.is(":checkbox")) {//如果是复选框
            $element.prop("checked", parseBool(value.toString()));
        } else {//其他
            $element.val(value);
        }
    });
}

// 将表单数据序列化为json对象
function serializaJson(form) {
    var formData = {};
    //对form表单中的所有input进行遍历
    form.find("input,select,textarea").each(function () {
        var fieldName = $(this).attr("name");//名称
        var fieldType = $(this).attr("type");//类型
        var v
        if (fieldType === "number") {//数值类型
            v = $(this).val() ? parseInt($(this).val()) : 0;
        } else if (fieldType === "text") {//文本类型
            v = $(this).val().toString();
        } else if (fieldType === "checkbox") {//复选框类型
            v = $(this).is(":checked");
        } else if (fieldType === "radio") {//单选框类型
            if ($(this).is(":checked")) {
                v = $(this).val();
            }
        } else if (fieldName) {//其他类型
            v = $(this).val();
        }
        console.log(fieldName, fieldType, v);
        if (!v) {
            return;
        }
        //如果有子名称
        var sonFields = fieldName.split(".");//子名称
        for (i = sonFields.length - 1; i >= 0; i--) {
            if (i == 0) {
                formData[sonFields[i]] = v;
                continue;
            } else {
                var sonField = sonFields[i];
                if (sonField) {
                    var obj = {};
                    obj[sonField] = v;
                    v = obj;
                }
            }
        }
    });
    console.log(formData);
    return formData;
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