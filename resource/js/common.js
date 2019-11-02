/**
 * 页面数据命名空间
 * @type {{id: null}}
 */
var page = {id: null};
page.url = urlParas(window.location.href.split('#')[0]);
// 验证条件
var valid = {
  tel: '^1\d{10}$',
  idCard: '^(^\d{18}$|^\d{17}(\d|X))$',
  email: '^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$',
};


var tmpWidth = 750,
  windowWidth = document.documentElement.clientWidth;
var scale = tmpWidth / windowWidth;
var agent = window.navigator.userAgent.toLowerCase();

//处理mui跳转问题
$('body,.mui-scroll,.mui-bar-tab').on('tap.window', 'a', function (event) {
  event.preventDefault();
  return toNewPage($(this).attr('href'));
});

/**
 * 需要返回强制刷新的页面调用
 * 解决ios返回不刷新问题
 */
function pageReload() {
  var isPageHide = false;
  window.addEventListener('pageshow', function () {
    if (isPageHide) {
      location.replace(page.url.set('rad',parseInt(Math.random()*100000000)));
    }
  });
  window.addEventListener('pagehide', function () {
    isPageHide = true;
  });
}


/**
 * 异步json获取
 * @desc 封装mui.ajax,预留app验证接口
 * @param {String} url 接口地址
 * @param {Object} param 发送数据
 *
 * @param {Function} [success] 成功回调
 * @param {Function} [error] 错误回调
 * @param {Function} [completes] 完成的回调，只在getWidgetData组件调用时使用，用于去掉modalLoading.change(-1);
 */
function getJson(url, param, success, error) {
  $.ajax({
    type: 'POST',
    url: url,
    data: param,
    dataType: 'json',
    success: function (res) {
      //数据状态
      if (typeof success == 'function') {
        success(res);
      } else {
        console.group('----后台数据----');
        console.info('send:' + JSON.stringify(param) + '\nto:' + url + '\nreturn:\n');
        console.groupCollapsed('json字符串');
        console.log(JSON.stringify(res, null, 2));
        console.groupEnd();
        console.info(res);
        console.groupEnd();
      }
      if (page.debug) {
        console.group('----后台数据----');
        console.info('send:' + JSON.stringify(param) + '\nto:' + url + '\nreturn:\n');
        console.groupCollapsed('json字符串');
        console.log(JSON.stringify(res, null, 2));
        console.groupEnd();
        console.info(res);
        console.groupEnd();
      }
    },
    error: function (msg) {
      if (typeof error == 'function') {
        error(msg);
      } else {
        console.error('send:' + JSON.stringify(param) + '\nto:' + url + '\nstatus:' + msg.status + '\nreturn:\n' + JSON.stringify(msg))
      }
    },
    complete: function (res) {
    }
  });
}

/**
 * 渲染模板，追加数据
 * @desc 传入callback时返回dom+html，不做数据追加处理
 * @param {String} selector mui选择器，只处理第一个元素
 * @param {String} tmpId 模板id
 * @param {JSON} data 后台返回的json数据
 * @param {Function} [callback] 回调函数
 * @example renderTmp('#brandList','brandItem',data);
 */
function renderTmp(selector, tmpId, data, callback) {
  var Tpl = template(tmpId, data),
    el;
  if ('object' == typeof selector) {
    el = selector;
  } else {
    el = $(selector)[0];
  }
  if (typeof callback == 'function') {
    callback(el, Tpl);
    return;
  }
  el.innerHTML += Tpl;
}

/**
 * 处理页面跳转
 * @desc muiApp新建webview（需配置host），微信或浏览器location.href
 * @param href
 * @param {Boolean} [cantBack] true 禁止页面返回，替换url
 * @example toNewPage('http://www.baidu.com')
 */
function toNewPage(href, cantBack) {
  if (!href || href.indexOf('#') == 0 || href.indexOf('javascript') == 0 || href.indexOf('tel') == 0) {
    return;
  }
  var bottom = 0;
  cantBack = cantBack ? cantBack : false;
  if (cantBack) {
    location.replace(href)
  } else {
    //ios增加返回强制刷新标志
    if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      var hisStateArr = href.split('/');
      var hisState = hisStateArr[hisStateArr.length - 1];
      var url = page.url.set({
        reload: 'true'
      });
      history.replaceState(hisState, '', url);
    }
    mui.openWindow({
      id: window.location.href,
      url: href,
      styles: {
        top: 0, //新页面顶部位置
        bottom: bottom //新页面底部位置
      },
      show: {
        autoShow: true, //页面loaded事件发生后自动显示，默认为true
        aniShow: 'pop-in' //页面显示动画，默认为”slide-in-right“；
      },
      waiting: {
        autoShow: true, //自动显示等待框，默认为true
        title: '正在加载...' //等待对话框上显示的提示内容
      }
    });
  }
}

/**
 * 清空重置上拉加载
 * @param {String} selector
 */
function reloadPull(selector) {
  var el = '#pullrefresh';
  if (selector) {
    el = selector
  }
  mui(el).pullRefresh().refresh(true);
  mui(el).pullRefresh().scrollTo(0, 0);
  mui(el).pullRefresh().pullupLoading();
}

/**
 * 下拉刷新
 */
function pulldownRefresh() {
  location.reload();
}

/**
 * 模态加载提示
 * @desc {Object} _num 判断模态框显示状态  change 改变模态框状态  check 检查模态框状态  done 模态框隐藏  ing 模态框显示
 */
var modalLoading = {
  _num: null,
  change: function (num, text) {
    if ('number' == typeof num) {
      if (0 < num) {
        this.ing(text)
      }
      if (this._num == null) {
        this._num = 0;
      }
      this._num = this._num + num;
      this.check();
    } else {
      if ($.isNumeric(num)) {
        this.change(parseInt(num));
      }
    }
  },
  check: function () {
    if (this._num == null) {
      return;
    }
    this._num = 0 < this._num ? this._num : 0;
    if (0 == this._num) {
      this.done();
    }
  },
  done: function () {
    $('body').find('.modal_loading').remove();
  },
  ing: function (text) {
    var text = text ? text : '请稍候...';
    var loading = '<div class="modal_loading"><div class="loading_box"><svg xmlns="http://www.w3.org/2000/svg" width="120" height="30" viewBox="0 0 120 30" fill="#fff">' +
      '<circle cx="15" cy="15" r="13.9512">' +
      '<animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"/>' +
      '<animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"/>' +
      '</circle>' +
      '<circle cx="60" cy="15" r="10.0488" fill-opacity="0.3">' +
      '<animate attributeName="r" from="9" to="9" begin="0s" dur="0.8s" values="9;15;9" calcMode="linear" repeatCount="indefinite"/>' +
      '<animate attributeName="fill-opacity" from="0.5" to="0.5" begin="0s" dur="0.8s" values=".5;1;.5" calcMode="linear" repeatCount="indefinite"/>' +
      '</circle>' +
      '<circle cx="105" cy="15" r="13.9512">' +
      '<animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"/>' +
      '<animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"/>' +
      '</circle>' +
      '</svg><p class="text">' + text + '</p></div></div>';
    $('body').append(loading);
  }
}


/*
 * scrollChange 滚动消息
 * @param dom 父元素选择器 必填
 * @param cla 子元素选择器 必填
 * @param aniTime 动画时间 默认为1000
 * @param easing 过度效果：'linear','swing' 默认为'linear'
 * @param stopTime 间隔时间 默认1000
 */

scrollAct = function (option) {
  var o = $.extend({
    aniTime: 1000,
    easing: 'linear',
    stopTime: 1000,
    dom: '',
    cla: ''
  }, option);
  if (!$(o.dom).find('.scroll_top_use_div_5230').length) {
    $(o.dom).prepend('<div class="scroll_top_use_div_5230"></div>')
  }
  $(o.cla).eq(0).animate({
    marginTop: '-' + $(o.dom).height() + 'px'
  }, o.aniTime, o.easing, function () {
    $(o.cla).eq(0).css('margin-top', 0);
    $(o.dom).append($(o.cla).eq(0));
    setTimeout(function () {
      scrollAct(option);
    }, o.stopTime)
  })
}

//
// function sharePost() {
//   getJson(vars.rootUrl + '/gameShare.do', {
//     actId: vars.actId,
//     orderId: orderId ? orderId : 0
//   }, function (data) {
//     // console.log(data)
//   })
// }
