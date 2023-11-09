$(document).ready(function () {
    //填充表格
    autFillTable()

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

//填充桶内键值对表格
function autFillTable() {
    //设置隐藏的数据桶名
    $.get("/instructions", function (response) {
        if (response.code == 200) {
            obj = response.data;
            html = ""
            if (obj.length >= 1) {
                for (var i = 0; i < obj.length; i++) {
                    html += "<tr>" +
                        "<td>" + (i + 1) + "</td>" +
                        "<td>" + obj[i].priority + "</td>" +//开关状态
                        "<td>" + obj[i].rule + "</td>" +//指令
                        "<td>" + obj[i].title + "</td>" +//题头
                        "<td>" + obj[i].description + "</td>" +//描述
                        "<td></td>" +
                        `</tr>`
                }
                $("#datasets").html(html);
                return
            }
        }
    });
    $("datasets").html("")
}