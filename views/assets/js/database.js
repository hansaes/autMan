$(document).ready(function () {
    //填充目录
    autFillBucketsMenu()

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
})

//右上角搜索框
function autSearchBucket(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    //$("#searchInput").val(''); // 将输入框中的值清空
    bucketName = $("#bucket_current").val()

    $.get(`/buckets?bucket=${bucketName}`, function (response) {
        //alert(JSON.stringify(response))
        if (response.code == 200 && response.data) {
            obj = response.data;
            if (obj.length >= 1) {
                let kv = obj[0].kvs
                html = ""
                for (var i = 0; i < kv.length; i++) {
                    //关键词过滤
                    if (kv[i].key.indexOf(inputValue) == -1 && kv[i].value.indexOf(inputValue) == -1) {
                        continue
                    }
                    html += "<tr>" +
                        `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" id="ids_`+ kv[i].key + `" name="` + kv[i].key + `" value="` + kv[i].key + `"><span></span>
                      </label></td>`+
                        "<td>" + (i + 1) + "</td>" +
                        "<td>" + bucketName + "</td>" +//开关状态
                        "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + kv[i].key + "</td>" +//开关状态
                        "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + kv[i].value + "</td>" +
                        `<td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm('`+ bucketName + "','" + kv[i].key + `')"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelBucketKey('`+ kv[i].key + `')"><i class="mdi mdi-window-close"></i></a>
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
            }
        }
    });
    $("datasets").html("")
}

//填充桶目录
function autFillBucketsMenu() {
    $.get("/buckets", function (response) {
        if (response.code == 200) {
            obj = response.data;
            var html = ""
            for (var i = 0; i < obj.length; i++) {
                var firstChar = obj[i].name.charAt(0).toLowerCase();
                var icon = "mdi-".concat(firstChar);
                bn = obj[i].name
                html += `<li class="nav-item" id="li_${encodeToHex(bn)}"><a href="javascript:void(0);" onclick='autFillKeyValues(\"${bn}\")'><i class="mdi"></i><span>` + obj[i].name + `</span></a></li>`
            }
            $("#menu").html(html)
        }
    });
}

//填充桶内键值对表格
function autFillKeyValues(bucketName, searchValue) {
    if (!searchValue) {
        searchValue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    // 移除其他所有兄弟元素的 active 类
    $("#li_" + encodeToHex(bucketName)).siblings().removeClass('active bg-primary');
    // 为当前元素添加 active 类
    $("#li_" + encodeToHex(bucketName)).addClass('active bg-primary');
    //设置隐藏的数据桶名
    $("#bucket_current").val(bucketName)
    $.get("/buckets?bucket=" + bucketName, function (response) {
        //alert(data)
        if (response.code == 200) {
            obj = response.data;
            if (obj.length >= 1) {
                kvs = obj[0].kvs
                html = ""
                for (var i = 0; i < kvs.length; i++) {
                    if (kvs[i].key.indexOf(searchValue) == -1 && kvs[i].value.indexOf(searchValue) == -1) {
                        continue
                    }
                    html += "<tr>" +
                        `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" id="ids_`+ kvs[i].key + `" name="` + kvs[i].key + `" value="` + kvs[i].key + `"><span></span>
                      </label></td>`+
                        "<td>" + (i + 1) + "</td>" +
                        "<td>" + bucketName + "</td>" +//开关状态
                        "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + decodeURIComponent(kvs[i].key) + "</td>" +//开关状态
                        "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + kvs[i].value + "</td>" +
                        `<td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm('`+ bucketName + "','" + kvs[i].key + `')"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelBucketKey('`+ kvs[i].key + `')"><i class="mdi mdi-window-close"></i></a>
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
            }
        }
    });
    $("datasets").html("")
}

//填充模态框
function autFillModalForm(bucketName, key) {
    $.get("/buckets?bucket=" + bucketName + "&key=" + key, function (response) {
        console.log(response)
        if (response.code == 200) {
            obj = response.data;
            if (obj.length >= 1 && obj[0].kvs.length > 0) {
                $("#bucket_name").val(bucketName)
                $("#bucket_key").val(key)
                $("#bucket_old").val(key)
                $("#bucket_value").val(obj[0].kvs[0].value)
            }
        }
    });
}

//清空模态表单
function autClearModalForm() {
    //清空modal_carry_rule这个表单下所有的input值
    //alert("清空modal_carry_rule这个表单下所有的input值")
    $("#myModal").find("input[type=text], textarea, input[type=email]").val('');
    $("#bucket_name").val($("#bucket_current").val());
}

//模态框提交
function autSubmitModalForm() {
    old = $("#bucket_old").val()
    //alert(old)
    key = $("#bucket_key").val()
    //alert(key)
    if (old && old != key) {
        //alert("删除")
        bucket = $("#bucket_current").val()
        $.ajax({
            type: "DELETE",
            url: "/buckets?bucket=" + bucket,
            data: "[" + old + "]",
            success: function (response) {
                //alert(JSON.response)
            }
        })
    }
    //alert("模态框数据：" + d)
    $.ajax({
        url: '/buckets',
        data: $('#buckets_modal').serialize(),
        type: 'POST',
        success: function (response) {
            //alert('提交成功！');
            if (response.code == 200) {
                autFillBucketsMenu()
                autFillKeyValues($("#bucket_name").val())
                lightyear.notify('提交成功', 'success', 1000);
            } else {
                lightyear.notify(response.message, 'danger', 3000);
            }
        },
        error: function (xhr, status, error) {
            //alert('提交失败！错误信息：' + error);
            lightyear.notify('提交失败！错误信息：' + error, 'danger', 3000);
        }
    });
}

//删除当前整个桶
function autDelBucketSelf() {
    var bucket = $("#bucket_current").val()
    //alert("删除当前桶")
    if (!bucket) {
        lightyear.notify("不存在当前桶", 'danger', 3000);
    }

    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    $.ajax({
                        url: "/buckets?bucket=" + bucket,
                        type: "DELETE",
                        success: function (response) {
                            if (response.code == 200) {
                                lightyear.notify("删除成功", 'success', 1000);
                                autFillBucketsMenu()
                                autFillKeyValues()
                            }
                        },
                        error: function (xhr, status, error) { // 请求失败的回调函数
                            console.log('Error:', error);
                            lightyear.notify('Error:', error, 'danger', 3000);
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
    })
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
                    var keys = $(':checkbox[id^="ids_"]:checked').map(function () {
                        return this.value;
                    }).get();

                    bucket = $("#bucket_current").val()

                    // 如果没有选中任何 checkbox，则返回
                    if (keys.length === 0) {
                        return;
                    }

                    // 创建Ajax请求
                    $.ajax({
                        url: '/buckets?bucket=' + bucket, // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + keys.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillKeyValues(bucket)
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
function autDelBucketKey(key) {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    var bucket = $("#bucket_current").val()
                    //$.alert('你点击了确认!');
                    $.ajax({
                        type: "DELETE",
                        url: "/buckets?bucket=" + bucket,
                        data: "[" + key + "]",
                        success: function () {
                            autFillKeyValues(bucket)
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
