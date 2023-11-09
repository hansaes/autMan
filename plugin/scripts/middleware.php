<?php
//本地服务请求函数，返回请求结果
function fetchLocalURL($path, $timeout) {
    $url="http://localhost:9999/otto".$path;
    echo $url."\n";
    // 本地环境
    $ch = curl_init();
    //
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    echo "curl_exec\n";
    $response = curl_exec($ch);
    echo $response;
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return "请求失败: " . $error;
    } else {
        curl_close($ch);
        return $response;
    }
}

// 推送消息
function push($imType,$groupCode,$userID,$title,$content){
    $path = "/push?imType=".$imType."&groupCode=".$groupCode."&userID=".$userID."&title=".$title."&content=".$content;
    return fetchLocalURL($path, 5); 
}

// 获取autMan名称
function name(){
    $path = "/name";
    return fetchLocalURL($path, 5); 
}

// 获取autMan版本
function version(){
    $path = "/version";
    return fetchLocalURL($path, 5); 
}

// 获取数据库数据
function get($key){
    $path = "/get?key=".$key;
    return fetchLocalURL($path, 5); 
}

// 设置数据库数据
function set($key,$value){
    $path = "/set?key=".$key."&value=".$value;
    return fetchLocalURL($path, 5); 
}

// 删除数据库数据
function del($key){
    $path = "/del?key=".$key;
    return fetchLocalURL($path, 5); 
}

// 获取指定数据库指定的key的值
function bucketGet($bucket,$key){
    $path = "/bucket/get?bucket=".$bucket."&key=".$key;
    return fetchLocalURL($path, 5); 
}

// 设置指定数据库指定的key的值
function bucketSet($bucket,$key,$value){
    $path = "/bucket/set?bucket=".$bucket."&key=".$key."&value=".$value;
    return fetchLocalURL($path, 5); 
}

// 删除指定数据库指定的key的值
function bucketDel($bucket,$key){
    $path = "/bucketDel?bucket=".$bucket."&key=".$key;
    return fetchLocalURL($path, 5); 
}

// 获取指定数据库的所有值为value的keys
function bucketKeys($bucket,$value){
    $path = "/bucketKeys?bucket=".$bucket."&value=".$value;
    $keys= fetchLocalURL($path, 5); 
    return explode(",",$keys);
}

// 获取指定数据桶内所有key的集合
function bucketAllKeys($bucket){
    $path = "/bucketAllKeys?bucket=".$bucket;
    $keys= fetchLocalURL($path, 5); 
    return explode(",",$keys);
}

// 通知管理员
function notifyMasters($content,$imtypes){
    $path = "/notifyMasters?content=".$content."&imtypes=".$imtypes;
    return fetchLocalURL($path, 5); 
}

// 系统咖啡码授权状态
function coffee(){
    $path = "/coffee";
    return fetchLocalURL($path, 5); 
}

//京东淘宝拼多多等转链推广
function spread($msg){
    $path = "/spread?msg=".$msg;
    return fetchLocalURL($path, 5); 
}

class Sender{
    // 发送者ID 成员变量
    public $senderID;

    public function __construct($senderid){
        $this->senderID = $senderid;
    }
    // 路由路径
    public function getRoutePath(){
        $path="/getRoutePath?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 路由参数
    public function getRouteParams(){
        $path="/getRouteParams?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 路由方法
    public function getRouteMethod(){
        $path="/getRouteMethod?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 路由请求头
    public function getRouteHeaders(){
        $path="/getRouteHeaders?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 路由请求cookies
    public function getRouteCookies(){
        $path="/getRouteCookies?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 路由请求体
    public function getRouteBody(){
        $path="/getRouteBody?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 获取发送者类型
    public function getImtype(){
        $path="/getImtype?id=".$this->id;
        return fetchLocalURL($path, 5);
    }
    // 获取发送者ID
    public function getUserID(){
        $path="/getUserID?senderid=".$this->senderID;
        //去掉两头的引号
        return substr(fetchLocalURL($path, 5),1,-1);
    }
    // 获取发送者名称
    public function getUserName(){
        $path="/getUserName?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 获取发送者头像
    public function getUserAvatarUrl(){
        $path="/getUserAvatarUrl?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 获取当前群组ID
    public function getChatID(){
        $path="/getChatID?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 获取当前群组名称
    public function getGroupName(){
        $path="/getGroupName?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 是否管理员
    public function isAdmin(){
        $path="/isAdmin?senderid=".$this->senderID;
        return "true"==fetchLocalURL($path, 5);
    }
    // 获取消息id
    public function getMessageID(){
        $path="/getMessageID?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 撤回消息
    public function recallMessage($messageID){
        $path="/recallMessage?senderid=".$this->senderID."&id=".$messageID;
        return fetchLocalURL($path, 5);
    }
    // 模拟新消息输入，即将消息发送者的消息修改为新的内容，重新送往autMan内部处理
    public function breakIn($content){
        $path="/breakIn?senderid=".$this->senderID."&content=".$content;
        return fetchLocalURL($path, 5);
    }
    // 获取匹配的文本参数
    public function param($index){
        $path="/param?senderid=".$this->senderID."&index=".$index;
        return fetchLocalURL($path, 5);
    }
    // 回复文本消息
    public function reply($text){
        $path="/sendText?senderid=".$this->senderID."&text=".$text;
        return fetchLocalURL($path, 5);
    }
    // 回复图片消息 
    public function replyImage($imageUrl){
        $path="/sendImage?senderid=".$this->senderID."&imageurl=".$imageUrl;
        return fetchLocalURL($path, 5);
    }
    // 回复语音消息
    public function replyVoice($voiceUrl){
        $path="/sendVoice?senderid=".$this->senderID."&voiceurl=".$voiceUrl;
        return fetchLocalURL($path, 5);
    }
    // 回复视频消息 
    public function replyVideo($videoUrl){
        $path="/sendVideo?senderid=".$this->senderID."&videourl=".$videoUrl;
        return fetchLocalURL($path, 5);
    }
    // 等待用户输入
    public function listen($timeout){
        $path="/listen?senderid=".$this->senderID."&timeout=".$timeout;
        $response= fetchLocalURL($path, 5);
        //返回response的文本部分
        echo $response;
        return responseText($response);
    }
    // 等待用户输入,timeout为超时时间，单位为毫秒,recallDuration为撤回用户输入的延迟时间，单位为毫秒，0是不撤回，forGroup为bool值true或false，是否接收群聊所有成员的输入
    public function input($timeout,$recallDuration,$forGroup){
        $path="/input?senderid=".$this->senderID."&timeout=".$timeout."&recallDuration=".$recallDuration."&forGroup=".$forGroup;
        $response= fetchLocalURL($path, 5);
        //返回response的文本部分
        echo $response;
        return responseText($response);
    }
    
    // 等待支付
    public function waitPay($exitcode,$timeout){
        $path="/waitPay?senderid=".$this->senderID."&exitcode=".$exitcode."&timeout=".$timeout;
        $response= fetchLocalURL($path, 5);
        //返回response的文本部分
        echo $response;
        return responseText($response);
    }
    // 是否处于等待支付状态
    public function atWaitPay(){
        $path="/atWaitPay";
        return "true"==fetchLocalURL($path, 5);
    }
    // 添加好友至群聊
    public function groupInviteIn($friendID,$groupID){
        $path="/groupInviteIn?senderid=".$this->senderID."&friendid=".$friendID."&groupid=".$groupID;
        return fetchLocalURL($path, 5);
    }
    // 从群聊中移除好友
    public function groupKick($userid){
        $path="/groupKick?senderid=".$this->senderID."&userid=".$userid;
        return fetchLocalURL($path, 5);
    }
    // 群聊禁言
    public function groupBan($userid,$time){
        $path="/groupBan?senderid=".$this->senderID."&userid=".$userid."&time=".$time;
        return fetchLocalURL($path, 5);
    }
    // 群聊解除禁言
    public function groupUnban($userid){
        $path="/groupUnban?senderid=".$this->senderID."&userid=".$userid;
        return fetchLocalURL($path, 5);
    }
    // 全员禁言
    public function groupWholeBan($time){
        $path="/groupWholeBan?senderid=".$this->senderID."&time=".$time;
        return fetchLocalURL($path, 5);
    }

    // 全员解除禁言
    public function groupWholeUnban(){
        $path="/groupWholeUnban?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }

    // 发送群公告
    public function groupNoticeSend($notice){
        $path="/groupNoticeSend?senderid=".$this->senderID."&notice=".$notice;
        return fetchLocalURL($path, 5);
    }

    // 获取当前处理流程的插件名
    public function getPluginName(){
        $path="/getPluginName?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
    // 获取当前处理流程的插件版本
    public function getPluginVersion(){
        $path="/getPluginVersion?senderid=".$this->senderID;
        return fetchLocalURL($path, 5);
    }
}

class Cron{
    // 获取定时指令集合
    public function getCrons(){
        $path="/croncmdsGet";
        return fetchLocalURL($path, 5);
    }
    //获取某个定时指令
    public function getCron($id){
        $path="/croncmdsGet?id=".$id;
        return fetchLocalURL($path, 5);
    }
    // 添加定时指令，返回id
    public function addCron($cron,$cmd,$isToSelf,$toOthers,$memo){
        $path="/croncmdsAdd?cron=".$cron."&cmd=".$cmd."&isToSelf=".$isToSelf."&toOthers=".$toOthers."&memo=".$memo;
        return fetchLocalURL($path, 5);
    }
    // 修改定时指令
    public function updateCron($id,$cron,$cmd,$isToSelf,$toOthers,$memo){
        $path="/croncmdsUpd?id=".$id."&cron=".$cron."&cmd=".$cmd."&isToSelf=".$isToSelf."&toOthers=".$toOthers."&memo=".$memo;
        return fetchLocalURL($path, 5);
    }
    // 删除定时指令
    public function deleteCron($id){
        $path="/croncmdsDel?id=".$id;
        return fetchLocalURL($path, 5);
    }
}
?>