$(document).ready(function () {
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
})

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