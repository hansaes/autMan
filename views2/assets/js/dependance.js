var depId//当前日志
$(function () {
    //绑定tab切换事件
    $('#myTab a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    })

    //触发第一个tab
    $('#myTab a:first').tab('show')

    autFillRows()

    var intervalId//日志不间断请求的id

    //绑定日志模态框的显示和隐藏事件
    $('#logModal').on('show.bs.modal', function () {
        console.log('模态框显示了');
        $("#log-datasets").html("正在加载日志...")

        //不间断的请求日志
        intervalId = setInterval(function () {
            $.ajax({
                url: `/dependencies/${depId}/log?t=` + Date.now(), // 请求URL
                type: 'GET', // 请求方法
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        str = response.data.replace(/\n/g, '<br>');
                        $("#log-datasets").html(str)
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
        }, 1000);
    });

    $('#logModal').on('hide.bs.modal', function () {
        console.log('模态框隐藏了');
        clearInterval(intervalId)
    });
})


function autFillRows() {
    //填充数据
    $.get("/dependencies", function (response) {
        console.log(response)
        obj = response.data
        var htmlLinux, htmlPython3, htmlNodejs
        for (i = 0; i < obj.length; i++) {
            //状态
            let status = ""
            switch (obj[i].status) {
                case 6://正在安装
                    status = `<button class="btn btn-warning btn-xs"><i class="mdi mdi-spin mdi-chemical-weapon"></i> 安装中</button>`
                    break
                case 1://已安装
                    status = `<button class="btn btn-success btn-xs"><i class="mdi mdi-clock"></i>  已安装</button>`
                    break
                case 2://安装失败
                    status = `<button class="btn btn-danger btn-xs"><i class="mdi mdi-close-circle-outline"></i> 已失败</button>`
                    break
                case 3://已卸载
                    status = `<button class="btn btn-default btn-xs"><i class="mdi mdi-clock"></i> 已卸载</button>`
                    break
                case 4://卸载失败
                    status = `<button class="btn btn-danger btn-xs"><i class="mdi mdi-close-circle-outline"></i> 已失败</button>`
                    break
                case 5://正在卸载
                    status = `<button class="btn btn-warning btn-xs"><i class="mdi mdi-spin mdi-chemical-weapon"></i> 卸载中</button>`
                    break
            }
            html = `<tr>
                <td>
                    <label class="lyear-checkbox checkbox-primary">
                    <input type="checkbox" id="${obj.id}"><span></span>
                    </label>
                </td>
                <td>${obj[i].name}</td>
                <td>${obj[i].version}</td>
                <td>${status}</td>
                <td>
                    <div class="btn-group" id="operation_${obj[i].id}">
                        <a href="#!" title="日志" id="realtimelog" data-toggle="modal" data-target="#logModal" onclick="depId=${obj[i].id};"><i class="mdi mdi-file-outline"></i></a>
                        <a href="#!" title="卸载依赖" onclick="removePackage(${obj[i].id})"><i class="mdi mdi-delete"></i></a>
                        <a href="#!" title="删除记录" onclick="deleteRecord(${obj[i].id})"><i class="mdi mdi-window-close"></i></a>
                    </div>
                </td>
                </tr>`
            switch (obj[i].type) {
                case 0:
                    htmlLinux += html
                    break
                case 1:
                    htmlPython3 += html
                    break
                case 2:
                    htmlNodejs += html
                    break
            }
        }
        $("#rows-linux").html(htmlLinux)
        $("#rows-python3").html(htmlPython3)
        $("#rows-nodejs").html(htmlNodejs)
    })
}


function autSubmitModalForm() {
    //ajax提交表单
    $.ajax({
        type: "POST",
        url: "/dependencies",
        data: $("#modal").serialize(),
        success: function (response) {
            if (response.code == 200) {
                autFillRows()
                //关闭模态框
                $("#modal").modal('hide')
            } else {
                $.alert(response.message)
            }
        }
    })
}

function removePackage(id) {
    $.confirm({
        title: '卸载依赖',
        content: '确认卸载?',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-danger',
                action: function () {
                    $.ajax({
                        type: "DELETE",
                        url: "/dependencies",
                        data: JSON.stringify([id]),
                        contentType: "application/json; charset=utf-8",
                        success: function (response) {
                            if (response.code == 200) {
                                autFillRows()
                            } else {
                                $.alert(response.message)
                            }
                        }
                    })
                }
            },
            cancel: {
                text: '取消',
                btnClass: 'btn-default'
            }
        }
    })
}

function deleteRecord(id) {
    $.confirm({
        title: '删除记录',
        content: '确认删除?',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-danger',
                action: function () {
                    $.ajax({
                        type: "DELETE",
                        url: "/dependencies/force",
                        data: JSON.stringify([id]),
                        contentType: "application/json; charset=utf-8",
                        success: function (response) {
                            if (response.code == 200) {
                                autFillRows()
                            } else {
                                $.alert(response.message)
                            }
                        }
                    })
                }
            },
            cancel: {
                text: '取消',
                btnClass: 'btn-default'
            }
        }
    })
}