$(function(){

    var rec;
    function recopen(){
        var type=$("[name=type]:checked").val();
        var bit=+$(".bit").val();
        var sample=+$(".sample").val();
        
        var wave,waveSet=$(".recwaveSet")[0].checked;
        
        var disableEnvInFixSet=$(".disableEnvInFixSet")[0].checked;
        if(disableEnvInFixSet){
            reclog("已禁用设备卡顿时音频输入丢失补偿，可以通过别的程序大量占用CPU来模拟设备卡顿，然后录音听听未补偿时的播放效果，然后再试试不禁用的效果");
        };
        
        var realTimeSendSet=$(".realTimeSendSet")[0].checked;
        var realTimeSendTime=+$(".realTimeSend").val();
        
        rec=Recorder({
            type:type
            ,bitRate:bit
            ,sampleRate:sample
            ,disableEnvInFix:disableEnvInFixSet
            ,onProcess:function(buffers,level,time,sampleRate){
                $(".recpowerx").css("width",level+"%");
                $(".recpowert").html(time+"/"+level);
                
                waveSet && wave.input(buffers[buffers.length-1],level,sampleRate);
                
                if(realTimeSendSet&&window.realTimeSendTry){
                    realTimeSendTry(rec.set,realTimeSendTime,buffers,sampleRate);
                };
            }
        });
        
        dialogInt=setTimeout(function(){//定时8秒后打开弹窗，用于监测浏览器没有发起权限请求的情况，在open前放置定时器利于收到了回调能及时取消（不管open是同步还是异步回调的）
            showDialog();
        },8000);
        
        rec.open(function(){
            dialogCancel();
            reclog("<span style='color:#0b1'>已打开:"+type+" "+bit+"kbps</span> <span style='color:#f60'>最佳实践是: 每次录音都先open -> start -> stop -> close，才能确保最佳的兼容性</span>");
            
            wave=Recorder.WaveView({elem:".recwave"});
        },function(e,isUserNotAllow){
            dialogCancel();
            reclog((isUserNotAllow?"UserNotAllow，":"")+"打开失败："+e);
        });
        
        window.waitDialogClick=function(){
            dialogCancel();
            reclog("打开失败：权限请求被忽略，<span style='color:#f00'>用户主动点击的弹窗</span>");
        };
    };

    event();

    function event(){
        $('body').on('tap','.start_btn',function(){
            start_reco();
        })
    }
})