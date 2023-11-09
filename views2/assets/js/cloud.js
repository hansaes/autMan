$(document).ready(function () {
    // 设置card-body的初始高度
    $(".card-body").height($(window).height() - 2 * $(".card-toolbar").outerHeight() - $(".card-footer").outerHeight() - 60);
    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".card-body").height($(window).height() - 2 * $(".card-toolbar").outerHeight() - $(".card-footer").outerHeight() - 60);
    });

    //更新aut币数据
    updateAUT()

    //获取云端插件数据
    $.get("/js/cloud", function (response, status) {
        console.log(response)
        var cloudObj
        if (response.code == 200) {
            cloudObj = response.data;
        }
        //获取本地数据
        $.get("/js/details", function (response, status) {
            if (response.code == 200) {
                console.log(response)
                //加载插件数据
                fillPlugins(cloudObj, response.data)
            }
        })
    });

    //为搜索框的回车事件添加监听
    $("#keyword").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            jssearch(); // 调用搜索函数
        }
    });

    //弹出框（有隐影），提示aut云市场支持1小时试用
    //$.notify('AUT云市场支持1小时首装试用，插件安装1小时内卸载会自动退款', 'warning', 10000, 'mdi mdi-emoticon-happy', 'top', 'center');
})

//获取本地插件数据
function my() {
    //alert("调用我的")
    $.get("/js/details", function (response) {
        console.log(response.data)
        fillPlugins(null, response.data)
    });
}

//获取已购买数据
function bought() {
    //alert("调用我的")
    $.get("/js/bought", function (cloudResponse) {
        //console.log("云端：" + JSON.stringify(cloudResponse))
        if (cloudResponse.code == 200) {
            //获取本地数据
            $.get("/js/details", function (localResponse, status) {
                if (localResponse.code == 200) {
                    //console.log("本地：" + localResponse)
                    //加载插件数据
                    fillPlugins(cloudResponse.data, localResponse.data)
                }
            })
        }
    });
}

//按关键词搜索
function jssearch() {
    //alert("搜索插件")
    keyword = $("#keyword").val()
    //清空input
    $("#keyword").val("")
    //if (keyword) {
    $.get("/js/cloud?keyword=" + keyword, function (response) {
        if (response.code == 200) {
            cloudObjs = response.data;
            //加载插件数据
            $.get("/js/details", function (response) {
                //加载插件数据
                fillPlugins(cloudObjs, response.data)
            })
        }
    });
}

//更新AUT币数据
function updateAUT() {
    //alert("更新AUT币")
    $.post("/js/aut", function (response) {
        if (response.code == 200) {
            obj = response.data;
            console.log(obj)
            $("#aut").html("(AUT:" + obj.aut + ")")
        }
    })
}

//let currentSortingCriteria = "download"; // Default sorting criteria
let currentMode = "asc"; // Default sorting mode
const sortingModes = ["asc", "desc"];
let isRequestInProgress = false; // Add a flag to track if a request is in progress
let source_currentSortingCriteria = ""
function rank(currentSortingCriteria,button) {
    // If a request is already in progress, don't initiate a new one
    // if (!source_currentSortingCriteria){
    //     source_currentSortingCriteria = currentSortingCriteria
    //     const nextMode = "asc"
    // }else if(source_currentSortingCriteria == currentSortingCriteria){
    //     const nextMode = "desc"
    // }
    const icon = button.querySelector("i")
    console.log(icon)
    if (icon.getAttribute("class").split(" ")[1].split("-")[2] == "up"){
        var nextMode = "desc"
    }else {
        var nextMode = "asc"
    }

    console.log("nextMode",nextMode)
    if (icon) {
    icon.setAttribute("class", `mdi mdi-arrow-${nextMode === "asc" ? "up" : "down"}`);
    }
    // Disable the button while the request is in progress
    // button.disabled = true;
    console.log(button)
    // Determine the next sorting mode.
    // const nextMode = sortingModes[(sortingModes.indexOf(currentMode) + 1) % sortingModes.length];
    console.log(nextMode)
    // Call the rankByMode function with the current sorting criteria and mode.
    rankByMode(currentSortingCriteria, nextMode);

    // const icon = button.querySelector("i"); // Find the <i> element within the button

}

function rankByMode(criteria, mode) {
    isRequestInProgress = true; // Set the flag to indicate a request is in progress
    currentSortingCriteria = criteria;
    currentMode = mode;
    console.log("currentMode", currentMode);
    $.get("/js/cloud", function (response) {
        isRequestInProgress = false; // Reset the flag when the request is complete

        if (response.code == 200) {
            obj = response.data;
            switch (criteria) {
                case "appraise":
                    sortPluginsByProperty(obj, "rating", mode);
                    break;
                case "download":
                    sortPluginsByProperty(obj, "download", mode);
                    break;
                case "price":
                    sortPluginsByProperty(obj, "price", mode);
                    break;
                default:
                    break;
            }
            console.log(obj);
            $.get("/js/details", function (local_data, status) {
                fillPlugins(obj, local_data.data);
            });
        }
    });
}


function sortPluginsByProperty(plugins, property, sortOrder) {
    for (var i = 0; i < plugins.length - 1; i++) {
        for (var j = 0; j < plugins.length - 1 - i; j++) {
            var comparisonValueA = plugins[j][property];
            var comparisonValueB = plugins[j + 1][property];

            if (sortOrder === "asc" && comparisonValueA > comparisonValueB) {
                swap(plugins, j, j + 1);
            } else if (sortOrder === "desc" && comparisonValueA < comparisonValueB) {
                swap(plugins, j, j + 1);
            }
        }
    }
}

function swap(arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
}






//分类
function classify(cls) {
    $.get("/js/cloud?class=" + encodeURIComponent(cls), function (response) {
        //云插件对is_pinned进行排序
        if (response.code == 200) {
            //alert(data)
            obj = response.data;
            //alert(data)
            $.get("/js/details", function (response) {
                //加载插件数据
                fillPlugins(obj, response.data)
            })
        }

    });
}

//填充插件相关数据，cloud_data为aut云数据，local_data为本地安装数据，btnValue为按钮的value值
function fillPlugins(cloudObjs, localObjs) {
    var obj
    var isCloud = false//是否为云插件 
    var isMine = false//是否为我的插件
    if (!isNull(cloudObjs)) { //市场数据
        isCloud = true
        obj = cloudObjs;
        localObj = localObjs;
    } else if (!isNull(localObjs)) {//我的数据
        isMine = true
        obj = localObjs
    } else {
        return
    }

    html = ""
    for (var i = 0; i < obj.length; i++) {
        //描述
        if (!obj[i].description) {
            obj[i].description = "暂无"
        }
        if (!obj[i].language) {
            obj[i].language = "es5"
        }

        var btnClass, btnValue, divMethod, divComment, download, updatedTime, score, openSource, btnSettings
        //云插件卡片背景class
        var divCardClass = "rounded-div"
        if (isCloud) {
            //按钮的class
            btnClass = `btn btn-round btn-info btn-w-xs`
            //图标拉起不同的显示框
            divMethod = `data-bs-toggle="modal" data-bs-target="#myModalDescript" onclick="fillModalDescript(\`` + encodeURIComponent(JSON.stringify(obj[i])) + `\`)"`
            //评论拉起不同的显示框
            divComment = `data-bs-toggle="modal" data-bs-target="#myModalAppraise" onclick="fillModalAppraise('${obj[i].title}')"`
            //下载数据
            download = `<p class="card-text mt-1 mb-1"><b>下载：</b>` + obj[i].download + `</p>`
            //更新时间数据
            updatedTime = `<p class="card-text mt-1 mb-1"><b>更新：</b>${obj[i].created_at}</p>`
            //按钮文字
            if (parseFloat(obj[i].price) > 0.0) {
                btnValue = "￥" + obj[i].price.toString()
            } else {
                btnValue = "免费"
            }
            //判断是否已安装
            if ($.isArray(localObj)) {
                for (j = 0; j < localObj.length; j++) {
                    if (obj[i].title == localObj[j].title) {
                        if (obj[i].version != localObj[j].version) {
                            btnValue = "更新"
                            btnClass = `btn btn-round btn-success btn-w-xs`
                        } else {
                            btnValue = "卸载"
                            btnClass = `btn btn-round btn-danger btn-w-xs`
                        }
                        break
                    }
                }
            }

            rating = parseFloat(obj[i].rating)
            if (rating == 0.0) {
                score = '<i class="mdi mdi-star"></i> 暂无'
            } else {
                score = '<i class="mdi mdi-star"></i> ' + parseFloat(obj[i].rating).toFixed(1)
            }
            if (obj[i].open_source) {
                openSource = '<i class="mdi mdi-source-branch"></i> 开源'
            } else {
                openSource = ''
            }

            if (obj[i].is_pinned) {
                divCardClass = "pinned-rounded-div"
            }
            btnSettings = ``
        } else {
            //按钮
            btnClass = `btn btn-round btn-danger btn-w-xs`
            divMethod = `data-bs-toggle="modal" data-bs-target="#myModalSettings" onclick="fillModalSettings(\`` + encodeURIComponent(JSON.stringify(obj[i])) + `\`)"`
            divComment = `data-bs-toggle="modal" data-bs-target="#myModalRating" onclick="fillModalRating('${obj[i].title}')"`
            download = `<a><small><b>点此修改插件配置</b></small></a>`
            score = '<a><small><b>点此评价</b></small></a>'
            btnValue = "卸载"
            updatedTime = ""
            openSource = ""
            //配参按钮
            btnSettings = `<input type="button" 
            class="btn btn-round btn-success btn-w-xs mt-2" 
            value="配参" 
            data-bs-toggle="modal" 
            data-bs-target="#myModalParams" 
            onclick="fillModalParams('${encodeURIComponent(JSON.stringify(obj[i].params))}')">`
            console.log(obj[i].params)
        }

        html += `<div class="col-sm-6 col-lg-4">
                        <div class="card ${divCardClass} mt-2 mb-2 pt-3 pb-3">
                            <div class="row small">
                                <!-- 左侧图标 -->
                                <div class="col-sm-3 col-lg-3" ${divComment}>
                                    <span class="img-avatar img-avatar-48 bg-translucent">
                                        <img src="icons/${obj[i].language}.png">
                                    </span>
                                    <p class="card-text mt-1 mb-0">${score}</p>
                                    <p class="card-text mt-0 mb-0">${openSource}</p>
                                </div>

                                <!-- 标题和介绍 -->
                                <div class="col-sm-6 col-lg-6" ${divMethod}>
                                    <p class="card-text mt-1 mb-1"><b>名称：</b>${obj[i].title}</p>
                                    <p class="card-text mt-1 mb-1"><b>介绍：</b>${obj[i].description}</p>
                                    ${download}
                                    ${updatedTime}
                                </div>

                                <!-- 右侧按钮 -->
                                <div class="col-sm-3 col-lg-3">
                                    <input id="${obj[i].title}" type="button" class="${btnClass}" value="${btnValue}" onclick="install('${obj[i].language}','${obj[i].title}',${obj[i].price})">
                                    ${btnSettings}
                                </div>
                            </div>
                        </div>
                    </div>`
    }
    $("#plugins").html(html)
}

//填充详细信息的数据
function fillModalDescript(msg) {
    msg = decodeURIComponent(msg)
    data = JSON.parse(msg)
    // 将数据填充到模态框中
    $.each(data, function (key, value) {
        if (Array.isArray(value)) {
            val = value.join(",")
        } else {
            val = value
        }
        $("#desc-" + key).html(val);
    });
}

//填充插件设置的相关信息
function fillModalSettings(msg) {
    msg = decodeURIComponent(msg)
    console.log(msg)
    jsonData = JSON.parse(msg);//解析成对象
    $.each(jsonData, function (key, value) {
        var selector = "[name='" + key + "']";
        var $element = $(selector);
        if ($.isPlainObject(value)) {//对象
            $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
        } else if ($element.is(":radio")) {//radio
            $element.prop("checked", true);
        } else if ($element.is(":checkbox")) {//checkbox
            $element.prop("checked", parseBool(value.toString()));
        } else {//文本框
            $element.val(value);
        }
    });
}

//填充用户评价模式框的相关信息
function fillModalRating(title) {
    $("#modalRating [name='title']").val(title);
    $("#modalRating [name='comment']").val("");
}

//提交评价模式框
function submitModalRating() {
    //判断表单是否填写完整
    if ($("#modalRating [name='comment']").val() == "") {
        $.notify("请填写评价内容", 'danger', 3000);
        return
    }
    // //判断星级是否选择
    // if ($("#[name='rating']:checked").length > 0) {
    //     $.notify("请选择星级", 'danger', 3000);
    //     return
    // }

    var formData = $("#modalRating").serialize();
    $.ajax({
        url: "/js/appraise",
        type: "POST",
        data: formData,
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                $.notify("评价成功", 'success', 1000);
                $("#myModalRating").modal('hide');
            } else {
                $.notify("评价失败：" + data, 'danger', 3000);
            }
        }
    })
}

//填充配参
function fillModalParams(msg) {
    html = ``
    objs = JSON.parse(decodeURIComponent(msg))
    console.log(objs)
    for (i = 0; i < objs.length; i++) {
        if (objs[i].spliter) {
            html += `<hr>`
            continue
        }
        required = ""
        if (objs[i].required) {//必填
            required = `<span class="text-danger"> *</span>`
        }
        if (objs[i].bool) {//布尔值开关
            html += `<div class="row mb-3">
                        <label class="col-sm-3 control-label">${objs[i].name}${required}</label>
                        <div class="col-sm-9">
                            <input class="form-check-input" type="checkbox" id="${objs[i].key}" name="${objs[i].key}">
                            <small class="text-warning">${objs[i].desc}</small>
                        </div>
                    </div>`
        } else {//文本框
            html += `<div class="row mb-3">
                        <label class="col-sm-3 control-label">${objs[i].name}${required}</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="${objs[i].key}" name="${objs[i].key}" placeholder="${objs[i].placeholder}">
                            <small class="text-warning">${objs[i].desc}</small>
                        </div>
                    </div>`
        }
    }
    html = html ? html : "<p>无可配置参数</p>"
    html += `<div class="modal-footer">
    <button type="button" class="btn btn-default" data-bs-dismiss="modal">关闭</button>
    <button type="button" class="btn btn-info" onclick="submitModalParams()">点击保存</button>
    </div>`
    console.log(html)
    $("#modalParams").html(html)

    //填充表单
    $('#modalParams input').each(function (index, elem) {
        bucketkey = $(elem).attr("name")
        console.log(bucketkey)
        bucket = bucketkey.split(".")[0]
        key = bucketkey.split(".")[1]
        console.log(bucket, key)
        var settings = {
            type: "GET",
            url: `/buckets?bucket=${bucket}&key=${key}`,
            success: function (response) {
                if (response.code == 200) {
                    obj = response.data;
                    console.log(obj)
                    if (obj.length >= 1 && obj[0].kvs.length > 0) {
                        //判断表单元素是否为checkbox
                        if ($(elem).attr('type') == 'checkbox') {
                            //设置checkbox
                            console.log("这里是checkbox")
                            $(elem).prop("checked", parseBool(obj[0].kvs[0].value));
                        } else {
                            $(elem).val(obj[0].kvs[0].value)
                        }
                    }
                }
            },
        }
        $.ajax(settings)
    });
}

//提交配参
function submitModalParams() {
    var formData = {};
    //遍历表单
    $('#modalParams input').each(function (index, elem) {
        bucketkey = $(elem).attr("name")
        bucket = bucketkey.split(".")[0]
        key = bucketkey.split(".")[1]
        if ($(elem).attr('type') == 'checkbox') {
            formData[bucketkey] = $(elem).prop("checked") ? 'true' : 'false';
        } else {
            formData[bucketkey] = $(elem).val();
        }
    });
    //var formData = $("#modalParams").serialize();
    $.ajax({
        url: "/buckets",
        type: "POST",
        data: formData,
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                $.notify("保存成功", 'success', 1000);
            } else {
                $.notify("保存失败：" + data, 'danger', 3000);
            }
        }
    })
}


//填充评价的相关信息
function fillModalAppraise(title) {
    console.log(title)
    $("#myLargeModalLabel").html(title)
    $.ajax({
        url: "/js/appraise?title=" + title,
        type: "GET",
        timeout: 60000,
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                html = ""
                for (i = response.data.length - 1; i >= 0; i--) {
                    // 将 Unix 时间戳转换为 JavaScript Date 对象
                    obj = response.data[i]
                    var date = new Date(parseInt(obj.CreatedTime) * 1000);
                    var dateString = date.toLocaleString();
                    rating = "暂无"
                    switch (obj.Stars) {
                        case 1:
                            rating = "★"
                            break;
                        case 2:
                            rating = "★★"
                            break;
                        case 3:
                            rating = "★★★"
                            break;
                        case 4:
                            rating = "★★★★"
                            break;
                        case 5:
                            rating = "★★★★★"
                            break;
                    }
                    html += `<tr>
                            <td>${obj.From}</td>
                            <td>${obj.Comment}</td>
                            <td>${dateString}</td>
                            <td style="color:red;">${rating}</td>

                </tr>`
                }
                $("#modalComments").html(html)
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);
            console.log(XMLHttpRequest.readyState);
            console.log(textStatus);
            $.notify('获取评价失败', 'danger', 3000);
        }
    });
}

//安装js插件
function install(language, name, price) {
    //内联函数
    function installjs() {
        oldValue = $("#" + name).val()
        $("#" + name).val("安装中")
        $.ajax({
            url: "/js/install?language=" + language + "&title=" + name,
            type: "POST",
            timeout: 60000,
            success: function (response) {
                console.log(response)
                if (response.code == 200) {
                    $("#" + name).val("安装成功")
                    $("#" + name).val("卸载")
                    $('#' + name).attr('class', 'btn btn-round btn-danger btn-w-xs');
                } else {
                    $("#" + name).val("安装失败")
                    $("#" + name).val(oldValue)
                    $('#' + name).attr('class', 'btn btn-round btn-info btn-w-xs');
                    //alert(result)
                    $.notify(response.message, 'danger', 3000);
                }
            }
        })
        //更新aut币数据
        updateAUT()
    }

    //安装过程
    btnValue = $("#" + name).val()
    if (btnValue == "卸载") {//卸载过程
        $.confirm({
            title: '提示框',
            content: '确定删除？' +
                `<form action="" class="formName">
                <div class="form-check form-check-inline">
                <input id="delconfig" class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1">
                <label id="delparams" class="form-check-label" for="inlineRadio1">同时删除配置</label>
                </div>
                <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="inlineCheckbox2" value="option2">
                <label class="form-check-label" for="inlineRadio2">同时删除配参</label>
                </div>
                </form>`,
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'btn-info',
                    action: function () {
                        $("#" + name).val("卸载中...")
                        //删除配置
                        delconfig = $("#delconfig").is(':checked')
                        //删除配参
                        delparams = $("#delparams").is(':checked')
                        //测试数据
                        console.log(delconfig, delparams)
                        $.ajax({
                            url: `/js/remove?language=${language}&title=${name}&delconfig=${delconfig}&delparams=${delparams}`,
                            type: "POST",
                            timeout: 60000,
                            success: function (response) {
                                console.log(response)
                                if (response.code == 200) {
                                    $("#" + name).val("已卸载")
                                    if (price > 0) {
                                        $("#" + name).val("￥" + price)
                                    } else {
                                        $("#" + name).val("免费")
                                    }
                                    $('#' + name).attr('class', 'btn btn-round btn-info btn-w-xs');
                                } else {
                                    $("#" + name).val("卸载失败")
                                    $("#" + name).val("卸载")
                                    $('#' + name).attr('class', 'btn btn-round btn-danger btn-w-xs');
                                }
                            }
                        })
                    },
                },
                canel: {
                    text: '取消',
                    action: function () {

                    }
                }
            }
        })
    } else {//安装过程
        if (parseFloat(price) > 0) {//收费插件
            $.alert({
                title: '提示框',
                content: '收费插件（' + 100 * price + 'AUT），如果曾经购买过此插件，不会重复扣费。确定安装此插件？',
                buttons: {
                    confirm: {
                        text: '确认',
                        btnClass: 'btn-info',
                        action: function () {
                            installjs()
                        },
                    },
                    canel: {
                        text: '取消',
                        action: function () {
                        }
                    }
                }
            })
        } else {//免费插件
            installjs()
        }
    }
}

//提交对插件的配置修改
function autSubmitModalForm() {
    var formData = $("#modalSettings").serialize();
    console.log(formData)
    $.ajax({
        url: "/js/update",
        type: "PUT",
        data: formData,
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                my()
                $.notify("修改成功", 'success', 1000);
            } else {
                $.notify("修改失败", 'danger', 3000);
            }
        }
    })
}