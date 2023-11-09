$(document).ready(function () {
    // 使聊天框滚动到最底部
    function scrollChatWindow() {
        var myDiv = $('#mychatbody');
        var scrollHeight = myDiv.prop('scrollHeight');
        var duration = 500; // 滚动动画的持续时间
        myDiv.animate({ scrollTop: scrollHeight }, duration);
    }

    var socket = null;

    function sendMsg() {
        var message = $('#msg').val();
        if (message && socket) {
            socket.send(message);
            // 追加信息
            $('.chat-body').append(`<div class="item right">
            <img class="header-img" src="images/users/avatar.png" class="avatar">
            <span class="message">
              ${message}
            </span>
          </div>`);
            // clear input field
            $('#msg').val('');
            // 使聊天框滚动到最底部
            scrollChatWindow();
        }
    }

    $('#msg').keydown(function (e) {
        if (e.keyCode == 13) {
            // 执行相应的函数
            e.preventDefault(); // 防止回车键提交表单
            sendMsg()
        }
    });
    $('#send').click(function () {
        sendMsg()
    });

    $("#login").click(function () {
        //alert("登陆操作")
        if (socket == null || socket.readyState != WebSocket.OPEN) {
            uid = encodeURIComponent($("#username").val());
            pwd = encodeURIComponent($("#password").val());
            //截取当前域名
            href = window.location.href
            //本地地址
            localarr = href.split('/')[2]
            console.log(`ws://${location.host}/ws?uid=${uid}&pwd=${pwd}`)
            // 创建 WebSocket 连接
            socket = new WebSocket(`ws://${location.host}/ws?uid=${uid}&pwd=${pwd}`);

            // 监听 WebSocket 事件
            socket.onopen = function () {
                console.log("WebSocket连接已打开");
                //按钮颜色修改
                $("#login").attr("class", "btn btn-danger")
                //按钮文字修改
                $("#login").text("断开连接")
                //关闭弹窗
                $('#myModalLogin').modal('hide')
            };

            socket.onmessage = function (e) {
                console.log("WebSocket收到消息：" + e.data);
                let cnt = e.data.replace(/\r/g, "").replace(/\n/g, "<br />")
                if (cnt) {
                    $('.chat-body').append(`<div class="item left">
                    <img src="images/users/avatar.png" class="header-img">
                    <span class="message">${cnt}
                    </span>
                  </div>`);
                    // 使聊天框滚动到最底部
                    scrollChatWindow();
                }
            };

            socket.onclose = function () {
                console.log("WebSocket连接已关闭");
                $("#login").attr("class", "btn btn-primary")
                $("#login").text("立即连接")
                $('.chat-body').append(`<div class="item left">
                    <img src="images/users/avatar.png" class="header-img">
                    <span class="message">{"content":"已断开"}
                    </span>
                  </div>`);
                // 使聊天框滚动到最底部
                scrollChatWindow();
            };

            socket.onerror = function () {
                console.log("WebSocket连接发生错误");
            };
            //})

        } else {
            // 关闭已有的 WebSocket 连接
            //alert("关闭已有的 WebSocket 连接")
            socket.close();
        }
    });
});

//发送邮箱验证码
function sendcode() {
    //qq号
    var qq = $("#qq_user").val()
    //正则验证QQ号
    var reg = /^[1-9][0-9]{4,9}$/;
    if (!reg.test(qq)) {
        alert('QQ号格式不正确');
        return false;
    }
    //邮箱
    email = qq + "@qq.com";

    //验证码
    $.ajax({
        url: "/sendUserCode",
        type: "post",
        data: {
            "email": email,
        },
        dataType: "json",
        success: function (response) {
            console.log(response);
            if (response.code == 200) {
                alert("发送成功，请注意查收QQ邮件");
            } else {
                alert(response.message);
            }
        }
    });
}

//注册
function register() {
    //获取参数
    var user = $("#qq_user").val();
    var pwd = $("#qq_pwd").val();
    var code = $("#qq_code").val();
    var data = {
        user: user,
        pwd: pwd,
        code: code,
    }
    //发送请求
    $.ajax({
        type: "POST",
        url: "/registerUser",
        data: data,
        dataType: "json",
        success: function (data) {
            if (data.code == 200) {
                //关闭弹窗
                $('#myModalRegister').modal('hide')
                alert("注册成功")
            } else {
                alert(data.message)
            }
        }
    });
}