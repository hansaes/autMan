$(document).ready(function () {
    //检查是否已经注册
    $.get("/register", function (data) {
        if (data.code == 200) {
            timestamp = new Date().getTime();
            //产生一个1-4的随机数
            var loginPageIndex = Math.floor(Math.random() * 4 + 1);
            location.href = `aut_pages_login_${loginPageIndex}.html?t=` + timestamp
        }
    });

    var guideObj = $('.lyear-guide-box');
    var nav_item = guideObj.find('.nav-item');
    var tab_pane = guideObj.find('.nav-step-pane');
    // 初始化引导页
    guideObj.bootstrapWizard({
        'tabClass': 'nav-step',
        'nextSelector': '[data-wizard="next"]',
        'previousSelector': '[data-wizard="prev"]',
        'finishSelector': '[data-wizard="finish"]',
        'onTabClick': function (e, t, i) {
            if (!$('.lyear-guide-box').is('[data-navigateable="true"]')) return !1
        },
        'onTabShow': function (e, t, i) {
            t.children(":gt(" + i + ").complete").removeClass("complete");
            t.children(":lt(" + i + "):not(.complete)").addClass("complete");
        },
        'onNext': function (tab, navigation, index) {
            var current_index = guideObj.bootstrapWizard('currentIndex');
            var curr_tab = tab_pane.eq(current_index);

            var validator_selector = '[data-provide="validation"]';
            var validator = curr_tab.find(validator_selector).addBack(validator_selector);
            if (validator.length) {
                var forms = validator.find('input, select, textarea');
                var validation = true;
                forms.each(function () {
                    if (this.checkValidity() === false) {
                        guideObj.addClass('was-validated');
                        validation = false;
                    } else {
                        guideObj.removeClass('was-validated');
                    }
                });
                if (!validation) {
                    guideObj.addClass('was-validated');
                    return false;
                }
            }
        },
        'onPrevious': function () {
        },
        'onFinish': function (e, t, i) {
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
                showNotify('请输入完整信息', 'danger', 1000, true, 'top', 'right');
                return
            }

            //判断两次输入的密码是否一致
            if (password1 != password2) {
                showNotify('两次输入的密码不一致', 'danger', 1000, true, 'top', 'right');
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
                        if (results.code == 200) {
                            showNotify('注册成功', 'success', 1000, true, 'top', 'right');
                            //产生一个1-4的随机数
                            var loginPageIndex = Math.floor(Math.random() * 4 + 1);
                            location.href = `aut_pages_login_${loginPageIndex}.html`
                        } else {
                            showNotify('注册失败', 'danger', 1000, true, 'top', 'right');
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

    // 勾选已注册用户时，隐藏用户名输入框
    $("#is_registered").click(function () {
        if ($(this).prop('checked')) {
            $('#usernameError').hide();
        } else {
            $('#usernameError').show();
        }
    });
});