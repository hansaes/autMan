$(document).ready(function () {
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


function autSearchBucket(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    //$("#searchInput").val(''); // 将输入框中的值清空
    bucketName = $("#bucket_current").val()

    $.get("/buckets?bucket=" + bucketName, function (response) {
        //alert(data)
        if (response.code == 200 && response.data) {
            $.get(`/buckets?bucket=pinMEMO`, function (response) {
                console.log(response)
                if (response.code == 200 && response.data) {
                    obj = JSON.parse(response.data);
                    obj2 = JSON.parse(memo.data)
                    if (obj.length >= 1) {
                        kvs = obj[0].kvs
                        //获取备注
                        html = ""
                        for (var i = 0; i < kvs.length; i++) {
                            if (kvs[i].key.indexOf(inputValue) == -1 && kvs[i].value.indexOf(inputValue) == -1) {
                                continue
                            }
                            mem = ""
                            console.log(kvs[i].key)
                            if (obj2.length > 0) {
                                for (j = 0; j < obj2[0].kvs.length; j++) {
                                    if (kvs[i].key == obj2[0].kvs[j].key) {
                                        mem = obj2[0].kvs[j].value
                                        break
                                    }
                                }
                            }
                            console.log(mem)
                            html += "<tr>" +
                                `<td>
                              <label class="lyear-checkbox checkbox-primary">
                                <input type="checkbox" id="ids_`+ kvs[i].key + `" name="` + kvs[i].key + `" value="` + kvs[i].key + `"><span></span>
                              </label></td>`+
                                "<td>" + (i + 1) + "</td>" +
                                "<td>" + bucketName + "</td>" +//开关状态
                                "<td>" + decodeURIComponent(kvs[i].key) + "</td>" +//开关状态
                                "<td>" + kvs[i].value + "</td>" +
                                `<td>${mem}</td>
                                <td><div class="btn-group">
                                <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm('`+ bucketName + "','" + kvs[i].key + `')"><i class="mdi mdi-pencil"></i></a>
                                <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelBucketKey('`+ kvs[i].key + `')"><i class="mdi mdi-window-close"></i></a>
                        </div></td></tr>`
                        }
                        $("#datasets").html(html);
                        return
                    }
                }
            })

        }
    });
    $("datasets").html("")
}

//填充桶内键值对表格
function autFillKeyValues(bucketName) {
    // 移除其他所有兄弟元素的 active 类
    $("#li_" + bucketName).siblings().removeClass('active bg-primary');
    // 为当前元素添加 active 类
    $("#li_" + bucketName).addClass('active bg-primary');
    //设置隐藏的数据桶名
    $("#bucket_current").val(bucketName)
    $.get("/buckets?bucket=" + bucketName, function (response) {
        //alert(data)
        if (response.code == 200) {
            $.get(`/buckets?bucket=pinMEMO`, function (memo) {
                console.log(memo)
                if (memo.code == 200) {
                    obj = response.data;
                    obj2 = memo.data;
                    if (obj.length >= 1) {
                        kvs = obj[0].kvs
                        //获取备注
                        html = ""
                        for (var i = 0; i < kvs.length; i++) {
                            mem = ""
                            console.log(kvs[i].key)
                            if (obj2.length > 0) {
                                for (j = 0; j < obj2[0].kvs.length; j++) {
                                    if (kvs[i].key == obj2[0].kvs[j].key) {
                                        mem = obj2[0].kvs[j].value
                                        break
                                    }
                                }
                            }
                            console.log(mem)
                            html += "<tr>" +
                                `<td>
                              <label class="lyear-checkbox checkbox-primary">
                                <input type="checkbox" id="ids_`+ kvs[i].key + `" name="` + kvs[i].key + `" value="` + kvs[i].key + `"><span></span>
                              </label></td>`+
                                "<td>" + (i + 1) + "</td>" +
                                "<td>" + bucketName + "</td>" +//开关状态
                                "<td>" + decodeURIComponent(kvs[i].key) + "</td>" +//开关状态
                                "<td>" + kvs[i].value + "</td>" +
                                `<td>${mem}</td>
                                <td><div class="btn-group">
                                <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm('`+ bucketName + "','" + kvs[i].key + `')"><i class="mdi mdi-pencil"></i></a>
                                <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelBucketKey('`+ kvs[i].key + `')"><i class="mdi mdi-window-close"></i></a>
                        </div></td></tr>`
                        }
                        $("#datasets").html(html);
                        return
                    }
                }
            })
        }
    });
    $("datasets").html("")
}

//填充模态框
function autFillModalForm(bucketName, key) {
    $.get("/buckets?bucket=" + bucketName + "&key=" + key, function (response) {
        //alert(JSON.stringify(response))
        if (response.code == 200) {
            obj = response.data;
            if (obj.length >= 1 && obj[0].kvs.length > 0) {
                $("#bucket_name").val(bucketName)
                $("#bucket_key").val(key)
                $("#bucket_old").val(key)
                $("#bucket_value").val(obj[0].kvs[0].value)
            }
            $.get(`/buckets?bucket=pinMEMO&key=` + key, function (memo) {
                if (memo.code == 200) {
                    obj2 = memo.data
                    console.log(memo.data)
                    if (obj2.length > 0 && obj2[0].kvs.length > 0) {
                        $("#bucket_memo").val(obj2[0].kvs[0].value)
                    }
                }
            })

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
    //当前桶
    bucket = $("#bucket_current").val()

    old = $("#bucket_old").val()
    //alert(old)
    key = $("#bucket_key").val()
    //alert(key)
    memo = $("#bucket_memo").val()
    if (memo == "") {
        memo = "-"
    }
    if (old && old != key) {
        //alert("删除")
        $.ajax({
            type: "DELETE",
            url: `/buckets?bucket=${bucket}`,
            data: "[" + old + "]",
            success: function (response) {
            }
        })
    }
    //保存Keyvalue
    $.ajax({
        url: '/buckets',
        data: $('#buckets_modal').serialize(),
        type: 'POST',
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                //保存备注
                $.ajax({
                    url: '/buckets',
                    data: `bucket=pinMEMO&key=${key}&value=${memo}`,
                    type: 'POST',
                    success: function (response) {
                        console.log(response)
                        if (response.code == 200) {
                            autFillKeyValues(bucket)
                            lightyear.notify('提交成功', 'success', 1000);
                        } else {
                            lightyear.notify(response.msg, 'danger', 3000);
                        }
                    },
                    error: function (xhr, status, error) {
                        //alert('提交失败！错误信息：' + error);
                        lightyear.notify('提交失败！错误信息：' + error, 'danger', 3000);
                    }
                });
            } else {
                lightyear.notify(response.msg, 'danger', 3000);
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
                                lightyear.notify(response.msg, 'success', 1000);
                                autFillKeyValues()
                            }
                        },
                        error: function (xhr, status, error) { // 请求失败的回调函数
                            console.log('Error:', error);
                            lightyear.notify('Error:', error, 'danger', 3000);
                        }
                    })
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
