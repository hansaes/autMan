$(document).ready(function (e) {
    //获取统计数据
    $.get("/statistics", function (response) {
        console.log(response)
        if (response.code == 200) {
            $("#version").html(response.data.version)
            $("#coffee").html(response.data.coffee.substring(0, 10))//咖啡码
            $("#started_at").html(response.data.started_at.substring(5))//启动时间

            //柱状图数据
            var $dashChartBarsCnt = jQuery('.js-chartjs-bars')[0].getContext('2d'),
                $dashChartLinesCnt = jQuery('.js-chartjs-lines')[0].getContext('2d');
            //柱状图
            var $dashChartBarsData = {
                labels: Object.keys(response.data.msgs_imtype),
                datasets: [
                    {
                        label: '频分消息',
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0)',
                        backgroundColor: 'rgba(51,202,185,0.5)',
                        hoverBackgroundColor: "rgba(51,202,185,0.7)",
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

            new Chart($dashChartBarsCnt, {
                type: 'bar',
                data: $dashChartBarsData
            });

            var myLineChart = new Chart($dashChartLinesCnt, {
                type: 'line',
                data: $dashChartLinesData,
            });

        }
    })

    showTime()
    autFillRealtime()
});

function showTime() {
    var date = new Date();
    var time = date.toLocaleTimeString();
    document.getElementById("time").innerHTML = time;
}

setInterval(showTime, 1000); // 每 1000 毫秒（即每秒）更新一次时间

function autFillRealtime() {
    $.get("/realtime", function (response) {
        $("#cpu").html(response.data.cpu)
        $("#memory").html(response.data.memory)
        $("#total").html(response.data.total)
        $("#finished").html(response.data.finished)
    })
}
setInterval(autFillRealtime, 1000)