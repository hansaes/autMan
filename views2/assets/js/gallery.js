$(document).ready(function () {
    //填充页面数据
    fillData()
})

//检查是否为图片文件
function checkPic(e) {
    //alert("检测文件")
    if (!e || !e.value) return false;
    var patn = /\.jpg$|\.jpeg$|\.png$|\.bmp$|\.gif$/i;
    if (!patn.test(e.value)) {
        $.alert("您选择的似乎不是图像文件。");
        e.value = "";
        return false;
    } else {
        var formData = new FormData();
        formData.append("imgfile", $("#file")[0].files[0]);
        $.ajax(
            {
                url: "/gallery",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    fillData();
                    $.alert("上传成功");
                }
            }
        )
    }
}

//填充页面数据
function fillData() {
    $.get("/gallery", function (response) {
        var html
        for (var i = 0; i < response.data.length; i++) {
            imgName = response.data[i].split("imgs/static/")[1]
            html += `<tr>
                <td>
                    <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" id="ids_${imgName}" name="${imgName}" value="${imgName}"><span></span>
                    </label>
                </td>
                <td>${i + 1}</td>
                <td><img width='60px' height='60px' object-fit='contain' src="/imgs/static/${imgName}"></td>
                <td><a id="${imgName}" target='_blank' href="${response.data[i]}">${response.data[i]}</a></td>
                <td><div class="btn-group">
                    <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="delImg('${imgName}')"><i class="mdi mdi-window-close"></i></a>
                </div></td>
                </tr>`
        }
        $("#datasets").html(html);
        return
    });
    $("#datasets").html(`<tr><td colspan="5">无记录</td></tr>`);
}

//删除图片
function delImg(imgName) {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    $.ajax({
                        url: "/gallery",
                        type: "DELETE",
                        data: JSON.stringify([imgName]),
                        contentType: "application/json",
                        success: function (response) {
                            fillData()
                            //$.alert("删除成功");
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