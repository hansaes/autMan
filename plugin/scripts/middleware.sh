#!/bin/bash

# 网络访问请求函数
# 参数:
#   $1: URL
#   $2: 超时时间（秒）
function make_request() {
    local url="http://localhost:8080/otto${1}"
    local timeout=$2

    # 发送GET请求，并设置超时时间
    if response=$(curl -s -m "$timeout" "$url"); then
        echo "$response"
    else
        echo "请求超时或失败"
    fi
}


# 推送消息
function push(){
    local imType=$1
    local groupcode=$2
    local userid=$3
    local title=$4
    local content=$5

    local url="/push?imType=${imType}&groupCode=${groupcode}&userID=${userid}&title=${title}&content=${content}"
    make_request "$url" 5000
}

# 获取机器人名称
function name(){
    local url="/name"
    make_request "$url" 5000
}

# 获取机器id
function machineId(){
    local url="/machineId"
    make_request "$url" 5000
}

# 获取机器人版本
function version(){
    local url="/version"
    make_request "$url" 5000
}

# 获取数据库数据
function get(){
    local key=$1
    local url="/get?key=${key}"
    make_request "$url" 5000
}

# 设置数据库数据
function set(){
    local key=$1
    local value=$2
    local url="/set?key=${key}&value=${value}"
    make_request "$url" 5000
}

# 删除数据库数据
function del(){
    local key=$1
    local url="/del?key=${key}"
    make_request "$url" 5000
}

# 获取指定数据库指定的key值
function bucketGet(){
    local bucket=$1
    local key=$2
    local url="/bucket/get?bucket=${bucket}&key=${key}"
    make_request "$url" 5000
}

# 设置指定数据库指定的key值
function bucketSet(){
    local bucket=$1
    local key=$2
    local value=$3
    local url="/bucket/set?bucket=${bucket}&key=${key}&value=${value}"
    make_request "$url" 5000
}

# 删除指定数据库指定的key值
function bucketDel(){
    local bucket=$1
    local key=$2
    local url="/bucketDel?bucket=${bucket}&key=${key}"
    make_request "$url" 5000
}

# 获取指定数据库的所有值为value的keys
function bucketKeys(){
    local bucket=$1
    local value=$2
    local url="/bucket/keys?bucket=${bucket}&value=${value}"
    make_request "$url" 5000
}

# 获取指定数据库的所有key
function bucketAllKeys(){
    local bucket=$1
    local url="/bucketAllKeys?bucket=${bucket}"
    make_request "$url" 5000
}

# 通知管理员
function notifyMasters(){
    local content=$2
    local imtypes=$3
    local url="/notifyMasters?content=${content}&imtypes=${imtypes}"
    make_request "$url" 5000
}

# 系统授权状态
function coffee(){
    local url="/coffee"
    make_request "$url" 5000
}

# 京东、淘宝、拼多多转链推广
function spread(){
    local msg=$1
    local url="/spread?msg=${msg}"
    make_request "$url" 5000
}

declare -A sender
# 设置变量
sender[senderid]="senderid"

# 获取路由路径
sender.getRoutePath() {
    make_request "/getRoutePath?senderid=${sender[senderid]}" 5000
}

# 获取路由参数
sender.getRouteParams() {
    make_request "/getRouteParams?senderid=${sender[senderid]}" 5000
}

# 获取路由方法
sender.getRouteMethod() {
    make_request "/getRouteMethod?senderid=${sender[senderid]}" 5000
}

# 获取路由请求头
sender.getRouteHeaders() {
    make_request "/getRouteHeaders?senderid=${sender[senderid]}" 5000
}

# 获取路由请求cookies
sender.getRouteCookies() {
    make_request "/getRouteCookies?senderid=${sender[senderid]}" 5000
}

# 获取路由请求体
sender.getRouteBody() {
    make_request "/getRouteBody?senderid=${sender[senderid]}" 5000
}

# 发送者渠道
sender.getImtype() {
    make_request "/getImtype?senderid=${sender[senderid]}" 5000
}

# 获取用户id
sender.getUserID() {
    # 去除字符串两头的引号
    local userid=$(make_request "/getUserID?senderid=${sender[senderid]}" 5000)
    userid=${userid#\"}
    userid=${userid%\"}
    echo "$userid"
}
# 获取用户头像地址
sender.getUserAvatarUrl() {
    make_request "/getUserAvatarUrl?senderid=${sender[senderid]}" 5000
}
# 获取用户昵称
sender.getUserName() {
    make_request "/getUserName?senderid=${sender[senderid]}" 5000
}
# 获取群组id
sender.getChatID() {
    make_request "/getChatID?senderid=${sender[senderid]}" 5000
}
# 获取群组名称
sender.getGroupName() {
    make_request "/getGroupName?senderid=${sender[senderid]}" 5000
}
# 是否为管理员
sender.isAdmin() {
    make_request "/isAdmin?senderid=${sender[senderid]}" 5000
}
# 获取消息ID
sender.getMessageID() {
    make_request "/getMessageID?senderid=${sender[senderid]}" 5000
}
# 撤回消息
sender.recallMessage() {
    local msgid=$1
    make_request "/recall?senderid=${sender[senderid]}&msgid=${msgid}" 5000
}
# 模拟新消息输入，即将消息发送者的消息修改为新的内容，重新送往autMan内部处理
sender.breakIn(){
    local content=$1
    make_request "/breakIn?senderid=${sender[senderid]}&msg=${content}" 5000
}
# 获取匹配的文本参数
sender.param() {
    local index=$1
    make_request "/getMatchedText?senderid=${sender[senderid]}&index=${index}" 5000
}
# 回复消息
sender.reply() {
    local text=$1
    make_request "/sendText?senderid=${sender[senderid]}&text=${text}" 5000
}
# 回复图片消息
sender.replyImage() {
    local imageurl=$1
    make_request "/sendImage?senderid=${sender[senderid]}&imageurl=${imageurl}" 5000
}
# 回复语音消息
sender.replyVoice() {
    local voiceurl=$1
    make_request "/sendVoice?senderid=${sender[senderid]}&voiceurl=${voiceurl}" 5000
}
# 回复视频消息
sender.replyVideo() {
    local videourl=$1
    make_request "/sendVideo?senderid=${sender[senderid]}&videourl=${videourl}" 5000
}
# 等待用户输入
sender.listen() {
    local timeout=$1
    make_request "/listen?senderid=${sender[senderid]}&timeout=${timeout}" 5000
}
# 等待用户输入,timeout为超时时间，单位为毫秒,recallDuration为撤回用户输入的延迟时间，单位为毫秒，0是不撤回，forGroup为bool值true或false，是否接收群聊所有成员的输入
sender.input() {
    local timeout=$1
    local recallDuration=$2
    local forGroup=$3
    make_request "/input?senderid=${sender[senderid]}&timeout=${timeout}&recallDuration=${recallDuration}&forGroup=${forGroup}" 5000
}
# 等待用户支付
sender.waitPay() {
    local exitcode=$1
    local timeout=$2
    make_request "/waitPay?senderid=${sender[senderid]}&exitcode=${exitcode}&timeout=${timeout}" 5000
}
# 是否处于等待支付状态
sender.atWaitingPay() {
    make_request "/atWaitingPay" 5000
}
# 邀请入群
sender.groupInviteIn() {
    local friend=$1
    local group=$2
    make_request "/groupInviteIn?senderid=${sender[senderid]}&friend=${friend}&group=${group}" 5000
}

# 踢出群组
sender.groupKick() {
    local userid=$1
    make_request "/groupKick?senderid=${sender[senderid]}&userid=${userid}" 5000
}

# 禁言
sender.groupBan() {
    local userid=$1
    local time=$2
    make_request "/groupBan?senderid=${sender[senderid]}&userid=${userid}&time=${time}" 5000
}

# 解除禁言
sender.groupUnban() {
    local userid=$1
    make_request "/groupUnban?senderid=${sender[senderid]}&userid=${userid}" 5000
}

# 全员禁言
sender.groupWholeBan() {
    make_request "/groupWholeBan?senderid=${sender[senderid]}&time=${time}" 5000
}

# 解除全员禁言
sender.groupWholeUnban() {
    make_request "/groupWholeUnban?senderid=${sender[senderid]}" 5000
}

# 发送群公告
sender.groupNoticeSend(){
    notice=$1
    make_request "/groupNoticeSend?senderid=${sender[senderid]}&notice=${notice}" 5000
}

# 获取当前处理流程的插件名
sender.getPluginName(){
    local url="/getPluginName?senderid=${sender[senderid]}"
    make_request "$url" 5000
}

# 获取当前处理流程的插件版本
sender.getPluginVersion(){
    local url="/getPluginVersion?senderid=${sender[senderid]}"
    make_request "$url" 5000
}

declare -A cron

# 获取定时指令集合
cron.getCrons() {
    make_request "/croncmdsGet" 5000
}

# 获取定时指令
cron.getCron() {
    local id=$1
    make_request "/croncmdsGet?id=${id}" 5000
}

# 添加定时指令
cron.addCron() {
    local cron=$1
    local cmd=$2
    local isToSelf=$3
    local toOthers=$4
    local memo=$5
    make_request "/croncmdsAdd?cron=${cron}&cmd=${cmd}&isToSelf=${isToSelf}&toOthers=${toOthers}&memo=${memo}" 5000
}

# 修改定时指令
cron.updateCron(){
    local id=$1
    local cron=$2
    local cmd=$3
    local isToSelf=$4
    local toOthers=$5
    local memo=$6
    make_request "/croncmdsUpd?id=${id}&cron=${cron}&cmd=${cmd}&isToSelf=${isToSelf}&toOthers=${toOthers}&memo=${memo}" 5000
}

# 删除定时指令
cron.deleteCron(){
    local id=$1
    make_request "/croncmdsDel?id=${id}" 5000
}

