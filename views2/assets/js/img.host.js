$(document).ready(function () {
    fillData()
})

function checkPic(e) {
    alert("检测文件")
    if (!e || !e.value) return false;
    var patn = /\.jpg$|\.jpeg$|\.png$|\.bmp$|\.gif$/i;
    if (!patn.test(e.value)) {
        alert("您选择的似乎不是图像文件。");
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
                    alert("上传成功");
                }
            }
        )
    }
    // else {
    //     //以下的代码可以 把选中的图片 放到img中显示
    //     var $file = $(e);
    //     var fileObj = $file[0];
    //     var windowURL = window.URL || window.webkitURL;
    //     var dataURL;
    //     //var $img = $("#"+id+"");
    //     if (fileObj && fileObj.files && fileObj.files[0]) {
    //         dataURL = windowURL.createObjectURL(fileObj.files[0]);
    //         console.log(dataURL);
    //         //$img.attr('src', dataURL);
    //     }
    // }
}

//填充页面数据
function fillData() {
    $.get("/gallery", function (data, status) {
        //alert(JSON.stringify(data))
        //alert(data.result.menu)
        var html
        for (var i = 0; i < data.result.menu.length; i++) {
            //alert(data.result.menu[i])
            imgName=data.result.menu[i].split("imgs/static/")[1]
            html += "<tr>" +
                "<td><img  width='60px' height='60px' object-fit='contain' src=\"/imgs/static/" + imgName + "\"></td>" +//开关状态
                "<td><a id='"+imgName+"' target='_blank' href=\"" + data.result.menu[i] + "\">"+data.result.menu[i]+"</a></td>" +
                "<td><a id='delete' href='javascript:void(0);' onclick='delImg(\"" + imgName + "\")'>删除</a></td>" +
                "</tr>"
        }
        $("#datasets").html(html);
        return
    });
}

function delImg(imgName){
    if (confirm("确定删除吗？")){
        $.ajax(
            {
                url: "/gallery",
                type: "DELETE",
                data:JSON.stringify([imgName]),
                contentType: "application/json",
                success: function (response) {
                    fillData();
                    alert("删除成功");
                }
            }
        )
    }
}