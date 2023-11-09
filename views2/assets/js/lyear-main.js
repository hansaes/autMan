$(function (e) {
    //获取统计数据
    $.get("/statistics", function (response) {
        console.log(response)
        if (response.code == 200) {
            $("#version").html(response.data.version + "<span class='fs-5'> 版本</span>")//版本号
            $("#coffee").html(response.data.coffee + "<span class='fs-5'> 授权</span>")//咖啡码
            $("#started_at").html(response.data.started_at + "<span class='fs-5'> 启动</span>")//启动时间

            //柱状图数据
            var $dashChartBarsCnt = jQuery('.js-chartjs-bars')[0].getContext('2d'),
                $dashChartLinesCnt = jQuery('.js-chartjs-lines')[0].getContext('2d');
            //柱状图-彩色
            var $dashChartBarsData = {
                labels: Object.keys(response.data.msgs_imtype),
                datasets: [
                    {
                        label: '频分消息',
                        borderWidth: 1,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        hoverBackgroundColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        hoverBorderColor: "rgba(0,0,0,0)",
                        data: Object.values(response.data.msgs_imtype)
                    }
                ]
            };


            //曲线图
            var $dashChartLinesData = {
                labels: Object.keys(response.data.msgs_time),
                datasets: [
                    {
                        label: '时分消息',
                        data: Object.values(response.data.msgs_time),
                        borderColor: '#358ed7',
                        backgroundColor: 'rgba(53, 142, 215, 0.175)',
                        borderWidth: 1,
                        fill: false,
                        lineTension: 0.5
                    }
                ]
            };


            // options = {
            //     scales: {
            //         x: {
            //             grid: {
            //                 color: 'white' // 设置 x 轴网格线颜色为白色
            //             }
            //         },
            //         y: {
            //             grid: {
            //                 color: 'white' // 设置 y 轴网格线颜色为白色
            //             }
            //         }
            //     },
            // }

            new Chart($dashChartBarsCnt, {
                type: 'bar',
                data: $dashChartBarsData,
                //options: options,
            });

            new Chart($dashChartLinesCnt, {
                type: 'line',
                data: $dashChartLinesData,
                //options: options,
            });
        }
    })
    //显示系统时间
    showTime()
    //实时监测数据
    autFillRealtime()
});

function showTime() {
    var date = new Date();
    var time = date.toLocaleTimeString();
    document.getElementById("time").innerHTML = `${time}<span class='fs-5'> 时间</span>`;
}

setInterval(showTime, 1000); // 每 1000 毫秒（即每秒）更新一次时间

function autFillRealtime() {
    $.get("/realtime", function (response) {
        $("#cpu").html(response.data.cpu + "<span class='fs-5'> CPU</span>")
        $("#memory").html(response.data.memory + "<span class='fs-5'> 内存</span>")
        $("#total").html(response.data.total + "<span class='fs-5'> 总任务</span>")
        $("#finished").html(response.data.finished + "<span class='fs-5'> 已完成</span>")
    })
}
setInterval(autFillRealtime, 1000)