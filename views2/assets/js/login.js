var loader;
$(document).ajaxStart(function () {
  $("button:submit").html('登录中...').attr("disabled", true);
  loader = $('button:submit').lyearloading({
    opacity: 0.2,
    spinnerSize: 'nm'
  });
}).ajaxStop(function () {
  loader.destroy();
  $("button:submit").html('立即登录').attr("disabled", false);
});

$('.signin-form').on('submit', function (event) {
  if ($(this)[0].checkValidity() === false) {
    event.preventDefault();
    event.stopPropagation();
    $(this).addClass('was-validated');
    return false;
  }
  var username = $("#username").val();
  var password = $("#password").val();
  //alert(username)
  $.ajax({
    url: "/login",
    type: "post",
    data: {
      "username": username,
      "password": password,
    },
    dataType: "json",
    success: function (response) {
      if (response.code == 200) {
        $.notify({
          message: '登录成功，页面即将跳转~',
        }, {
          type: 'success',
          placement: {
            from: 'top',
            align: 'center'
          },
          z_index: 10800,
          delay: 1500,
          animate: {
            enter: 'animate__animated animate__fadeInUp',
            exit: 'animate__animated animate__fadeOutDown'
          }
        });
        setTimeout(function () {
          location.href = 'index.html';
        }, 1500);
      } else {
        $.notify({
          message: '登录失败，错误原因：' + res.msg,
        }, {
          type: 'danger',
          placement: {
            from: 'top',
            align: 'center'
          },
          z_index: 10800,
          delay: 1500,
          animate: {
            enter: 'animate__animated animate__shakeX',
            exit: 'animate__animated animate__fadeOutDown'
          }
        });
        $('#password').val('');
        $("#captcha").click();
      }
    },
    error: function () {
      $.notify({
        message: '服务器错误',
      }, {
        type: 'danger',
        placement: {
          from: 'top',
          align: 'center'
        },
        z_index: 10800,
        delay: 1500,
        animate: {
          enter: 'animate__animated animate__shakeX',
          exit: 'animate__animated animate__fadeOutDown'
        }
      });
    }
  });
  return false;
});

$(function () {
  $.get("/register", function (data) {
    if (data.code != 200) {
      timestamp = new Date().getTime();
      location.href = "aut_pages_register.html?t=" + timestamp
    }
  });

  // 填充icp备案号
  $.get("/icp", function (data) {
    console.log(data)
    $("#icp").html(data.data)
  });

  // 回车键事件
  $('#password').keypress(function (event) {
    if (event.keyCode === 13) {
      // 这里是回车键被按下后执行的代码
      console.log('回车键被按下了');
      login()
    }
  });

  function login() {
    //显示等待
    lightyear.loading('show');
    var username = $("#username").val();
    var password = $("#password").val();
    //alert(username)
    $.ajax({
      url: "/login",
      type: "post",
      data: {
        "username": username,
        "password": password,
      },
      dataType: "json",
      success: function (response) {
        if (response.code == 200) {
          lightyear.loading('hide');
          lightyear.notify('验证成功，页面即将自动跳转~', 'success', 3000);
          location.href = "index.html"
        } else {
          lightyear.loading('hide');
          lightyear.notify(response.message, 'danger', 1000);
        }
      }
    })
  }
})
