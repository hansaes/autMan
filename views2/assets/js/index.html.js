//定义3个变量用于存储logo_bg、header_bg、sidebar_bg的值
var site_theme_a = "default", logo_bg_a = "default", header_bg_a = "default", sidebar_bg_a = "default";

$(document).ready(function () {

  //避免缓存问题
  // $('.multitabs').each(function () {
  //   var timestamp = new Date().getTime(); // 获取当前时间戳
  //   var href = $(this).attr('href'); // 获取当前链接的 href 属性值
  //   var newHref = href + '?t=' + timestamp; // 在原有的 href 上添加时间戳参数
  //   $(this).attr('href', newHref); // 更新链接的 href 属性值
  // });

  // 检查登录状态
  $.get("/login", function (response) {
    console.log(response)
    //生成1-4的随机数
    var random = Math.floor(Math.random() * 4 + 1);
    if (response.code == 200) {
      $("#username").html(response.data.user + '<span class="caret"></span>')
    } else {
      timestamp = new Date().getTime()
      location.href = `aut_pages_login_${random}.html?t=${timestamp}`
    }
  }).fail(function () {
    timestamp = new Date().getTime()
    location.href = `aut_pages_login_${random}.html?t=${timestamp}`
  })

  //设置主题
  $.get("/theme", function (data) {
    console.log(data)
    if (data.code == 200) {
      site_theme_a = data.data.site_theme ? data.data.site_theme : "default"
      logo_bg_a = data.data.logo_bg ? data.data.logo_bg : "default"
      header_bg_a = data.data.header_bg ? data.data.header_bg : "default"
      sidebar_bg_a = data.data.sidebar_bg ? data.data.sidebar_bg : "default"
      console.log(site_theme_a, logo_bg_a, header_bg_a, sidebar_bg_a)
      //设置radio元素选中
      $(`input[type="radio"][name="site_theme"][value="${site_theme_a}"]`).attr("checked", true);
      $(`input[type="radio"][name="logo_bg"][value="${logo_bg_a}"]`).attr("checked", true);
      $(`input[type="radio"][name="header_bg"][value="${header_bg_a}"]`).attr("checked", true);
      $(`input[type="radio"][name="sidebar_bg"][value="${sidebar_bg_a}"]`).attr("checked", true);
      //刷新显示
      $(`input[type="radio"][name="site_theme"][value="${site_theme_a}"]`).trigger('click');
      $(`input[type="radio"][name="logo_bg"][value="${logo_bg_a}"]`).trigger('click');
      $(`input[type="radio"][name="header_bg"][value="${header_bg_a}"]`).trigger('click');
      $(`input[type="radio"][name="sidebar_bg"][value="${sidebar_bg_a}"]`).trigger('click');
      //如果logo_bg为log_bg_1则logo元素的孙子结点image源为logo.png
      if (data.data.logo_bg != "default" || data.data.site_theme != "default") {
        $("#logo_image").attr("src", "images/logo-sidebar2.png")
      } else {
        $("#logo_image").attr("src", "images/logo-sidebar.png")
      }
    }
  });

  // 填充icp备案号
  $.get("/icp", function (data) {
    console.log(data)
    $("#icp").html(data.data)
  });

  // 填充web插件
  $.get("/webplugin", function (data) {
    console.log(data)
    let web_plugins = $("#web_plugins")
    for (let i = 0; i < data.data.length; i++) {
      const element = data.data[i];
      web_plugins.append(`<li> <a class="multitabs" href="/${element}/static"><i
    class="mdi mdi-18px m-r-5 mdi-web"></i> ${element}</a> </li>`)
    }
  })

  // 绑定logo_bg事件
  $('.form-check-input').on('change', function () {
    console.log("radio change")
    //分别获取id为"logo_bg"、"header_bg"、"sidebar_bg"的radio元素选中的值
    var site_theme = $('input[type="radio"][name="site_theme"]:checked').val();
    var logo_bg = $('input[type="radio"][name="logo_bg"]:checked').val();
    var header_bg = $('input[type="radio"][name="header_bg"]:checked').val();
    var sidebar_bg = $('input[type="radio"][name="sidebar_bg"]:checked').val();

    if (site_theme == site_theme_a && logo_bg == logo_bg_a && header_bg == header_bg_a && sidebar_bg == sidebar_bg_a) {
      return
    }

    //将以上数据json化
    var data = {
      site_theme: site_theme,
      logo_bg: logo_bg,
      header_bg: header_bg,
      sidebar_bg: sidebar_bg
    };

    console.log(data)
    //将选中的值提交服务器存储
    $.ajax({
      url: '/theme', // 请求URL
      type: 'POST', // 请求方法
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (response) { // 请求成功的回调函数
        console.log('Success:', response);
        //如果logo_bg为log_bg_1则logo元素的孙子结点image源为logo.png
        if (logo_bg != "default" || site_theme != "default") {
          $("#logo_image").attr("src", "images/logo-sidebar2.png")
        } else {
          $("#logo_image").attr("src", "images/logo-sidebar.png")
        }
        // 更新变量
        site_theme_a = site_theme
        logo_bg_a = logo_bg
        header_bg_a = header_bg
        sidebar_bg_a = sidebar_bg
      },
      error: function (xhr, status, error) { // 请求失败的回调函数
        console.log('Error:', error);
      }
    });
  });
})

// 退出登录
function logout() {
  $.get("/logout", function (response) {
    console.log(response)
    if (response.code == 200) {
      //生成1-4的随机数
      var random = Math.floor(Math.random() * 4 + 1);
      timestamp = new Date().getTime()
      location.href = `aut_pages_login_${random}.html?t=${timestamp}`
    }
  })
}

// 重启函数
function reboot() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      showNotify(`${5 - i}秒后重启`, 'success', 1000, 'mdi mdi-restart', 'top', 'center');
    }, 1000 * i);
  }
  //ajax post请求重启
  $.ajax({
    url: '/restart', // 请求URL
    type: 'POST', // 请求方法
    success: function (response) { // 请求成功的回调函数
      console.log('Success:', response);
      if (response.code == 200) {
        //6秒后刷新页面
        setTimeout(() => {
          location.reload()
        }, 6000);
      }
    },
    error: function (xhr, status, error) { // 请求失败的回调函数
      console.log('Error:', error);
    }
  });
}
// 退出服务
function exit() {
  $.ajax({
    url: '/exit', // 请求URL
    type: 'POST', // 请求方法
    success: function (response) { // 请求成功的回调函数
      console.log('Success:', response);
      if (response.code == 200) {
        showNotify('5秒后退出服务', 'success', 3000, 'mdi mdi-logout', 'top', 'center');
      }
    },
    error: function (xhr, status, error) { // 请求失败的回调函数
      console.log('Error:', error);
    }
  });
}