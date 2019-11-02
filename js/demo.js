$(function(){

    var  bgImgArr = ['url(../img/lt/user_bg1.png)','url(../img/lt/user_bg2.png)','url(../img/lt/user_bg3.png)']

    console.log($('.user_info_item').index())

    for(var i=0;i<$('.user_info_item').length;i++){
        if(i % 3 == 0){
            $('.user_info_item').eq(i).css({
                // 'background-color': 'red',
                'background-image': bgImgArr[0]
            })
        }
        if(i % 3 == 1){
            $('.user_info_item').eq(i).css({
                // 'background-color': 'green',
                'background-image': bgImgArr[1]
            })
        }
        if(i % 3 == 2){
            $('.user_info_item').eq(i).css({
                // 'background-color': 'blue',
                'background-image': bgImgArr[2]
            })
        }
    }

    event();

    function event(){

    }
})