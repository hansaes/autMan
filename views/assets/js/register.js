$(document).ready(function () {
    // 初始化引导页
    $('.guide-box').bootstrapWizard({
        'tabClass': 'nav-step',
        'nextSelector': '[data-wizard="next"]',
        'previousSelector': '[data-wizard="prev"]',
        'finishSelector': '[data-wizard="finish"]',
        'onTabClick': function (e, t, i) {
            if (!$('.guide-box').is('[data-navigateable="true"]')) return !1
        },
        'onTabShow': function (e, t, i) {
            t.children(":gt(" + i + ").complete").removeClass("complete");
            t.children(":lt(" + i + "):not(.complete)").addClass("complete");
        },
        'onFinish': function (e, t, i) {
            // 点击完成后处理提交
            lightyear.loading('show');
            // 用户名
            var username = $("#username").val();
            // 邮箱
            var email = $("#email").val();
            // 是否已注册
            var is_registered = $("#is_registered").prop('checked');
            console.log(is_registered)
            // 密码
            var password1 = $("#password1").val();
            //alert(password1)
            var password2 = $("#password2").val();

            //4个参数均不能为空
            if (username == "" || email == "" || password1 == "" || password2 == "") {
                lightyear.loading('hide');
                lightyear.notify("请填写完整信息", 'danger', 1000);
                return
            }

            //判断两次输入的密码是否一致
            if (password1 != password2) {
                lightyear.loading('hide');
                lightyear.notify("两次输入的密码不一致", 'danger', 1000);
                return
            } else {
                //alert(username)
                $.ajax({
                    url: "/register",
                    type: "post",
                    data: {
                        "username": username,
                        "password": password1,
                        "email": email,
                        "is_registered": is_registered,
                    },
                    dataType: "json",
                    success: function (results) {
                        //alert(JSON.stringify(results))
                        if (results.code==200) {
                            //alert("验证成功");
                            lightyear.loading('hide');
                            lightyear.notify('成功，页面即将自动跳转~', 'success', 3000);
                            location.href = "aut_pages_login.html"
                        } else {
                            lightyear.loading('hide');
                            lightyear.notify("注册失败", 'danger', 1000);
                            //alert("验证失败");
                        }
                    }
                })
            }
        }
    });

    // 注册时检查用户名是否存在当用户名输入框发生变化时触发事件
    $('#username').on('input', function () {
        if ($("#is_registered").prop('checked')) {
            $('#usernameError').text('');
            return
        }
        var username = $(this).val();

        // 发送AJAX请求进行用户名检查
        $.ajax({
            url: '/js/check_username?username=' + encodeURIComponent(username), // 云服务器上的用户名检查接口URL
            method: 'GET',
            success: function (response) {
                if (response.code != 200) {
                    $('#usernameError').text(response.message);
                } else {
                    $('#usernameError').text('用户名可用');
                }
            },
            error: function () {
                // 处理错误
            }
        });
    });
});