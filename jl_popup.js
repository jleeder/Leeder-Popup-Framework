/*
Written By: Josh Leeder
Date: Jun 30 2010

Updated: August 15 2011
*/

var PopupController = function (config) {
    this.options =
	{
	    'threshold': 5000,
	    'overlay': 'popup_overlay',
	    'contentPrefix': 'popup_container',
	    "overlayColor": '#000000',
	    "opacity": 0.5,
	    "overlayClickClose": true
	}
    $.extend(this.options, config);

    this.stack = new Array();
    this.popupNumber = 0;
    var scope = this;
    var zindex = this.options.threshold;

    $('body').append('<div id="' + this.options.overlay + '" style="display:none; position: absolute"></div>');

    this.overlay = $('#' + this.options.overlay);
    if (this.options.overlayClickClose) {
        this.overlay.click(function () {
            var popup = scope.getActivePopup();
            if (popup.options.overlayClickClose == undefined || popup.options.overlayClickClose == true) {
                scope.close(popup);
            }
        });
    }
    this.overlay.css({
        "zIndex": this.options.threshold,
        "position": "fixed",
        "top": 0, "left": 0,
        "backgroundColor": this.options.overlayColor
    });
}

PopupController.prototype.open = function (popupOptions, url) {
    var p = new Popup(popupOptions);
    var scope = this;
    p.options.id = this.options.contentPrefix + "_" + this.popupNumber;
    this.popupNumber++;
    if (this.stack.length > 0) {
        $('#' + this.getActivePopup().options.id).css({ "zIndex": scope.options.threshold - 10 });
    }
    this.stack.push(p);
    p.open(this, url);
    return p;
}

PopupController.prototype.close = function (popup) {
    this.removePopupFromStack(popup);
    popup.close();
    var scope = this;
    if (this.stack.length > 0) {
        $('#' + this.getActivePopup().options.id).css({ "zIndex": scope.options.threshold + 10 });
    }
    else {
        this.overlay.fadeOut('slow', function () {
            scope.overlay.hide();
        })
    }
}

PopupController.prototype.getActivePopup = function () {
    if (this.stack.length < 1) {
        return undefined;
    }
    return this.stack[this.stack.length - 1];
}

PopupController.prototype.list = function () {
    for (var i = 0; i < this.stack.length; i++) {
        //console.log(this.stack[i].options.id);
    }
}

PopupController.prototype.removePopupFromStack = function (popup) {
    if (this.stack.length > 0) {
        var index = this.findIndexOfPopup(popup);
        this.stack.splice(index, 1);
    }
}

PopupController.prototype.findIndexOfPopup = function (popup) {
    for (var i = 0; i < this.stack.length; i++) {
        if (this.stack[i].options.id == popup.options.id) {
            return i;
        }
    }
    return undefined;
}

var Popup = function (config) {
    this.options =
	{
	    "className": "default",
	    "closeClass": "close",
	    "width": 500,
	    "height": 500,
	    "loadMethod": "ajax", //ajax, iframe, jsonp, html
	    "callback": "callback",
	    "iframeAnchorHtml": 'X',
	    "loadingClass": "popupLoading",
	    "positionType": "centered", //offset
        "topOffset" : "0",
	    "beforeOpen": function () { },
	    "beforeClose": function () { }
	}

    $.extend(this.options, config);
}

Popup.prototype.open = function (controller, url) {
    var scope = this;
    var windowDimensions = { "width": $(window).width(), "height": $(window).height() };
    //    var bodyDimensions = { "width": $(document).width(), "height": $(document).height() };

    var position = { 'x': (windowDimensions.width - this.options.width) / 2, 'y': (windowDimensions.height - this.options.height) / 2 };
    var overlayCss =
	{
	    "width": windowDimensions.width,
	    "height": windowDimensions.height
	};

    var left, top = 0;
    //console.log(scope.options.positionType);
    switch (scope.options.positionType)
    {
        case "centered":
            left = position.x < 0 ? $(document).scrollLeft() : position.x + $(document).scrollLeft();
            top = position.y < 0 ? $(document).scrollTop() : position.y + $(document).scrollTop();
            break;
        case "offset":
            left = position.x < 0 ? $(document).scrollLeft() : position.x + $(document).scrollLeft();
            top = $(document).scrollTop() + scope.options.topOffset;
            break;
    }

    //console.log(left, top);
    var css =
	{
	    'position': 'absolute',
	    'left': left,
	    'top': top,
	    'display': 'none',
	    'width': scope.options.width,
	    'height': scope.options.height,
	    'zIndex': controller.options.threshold + 10
	};

    $('body').append('<div id="' + this.options.id + '" class="' + this.options.loadingClass + '" style="display: none; position: absolute"></div>');
    $container = $('#' + this.options.id);
    controller.overlay.css(overlayCss).stop().fadeTo("slow", controller.options.opacity, function () {
        switch (scope.options.loadMethod) {
            case "jsonp":
                $.ajax({
                    url: url,
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: "jsonp",
                    jsonp: scope.options.callback,
                    success: function (response) {
                        $container.html(response);
                        if (typeof (scope.options.beforeOpen) == "function") {
                            scope.options.beforeOpen(scope);
                        }
                        $container.css(css).addClass(scope.options.className).stop().fadeIn('fast', function () {
                            $container.removeClass(scope.options.loadingClass);
                            var heightInQuestion = $(document).scrollTop() + $container.height();
                            if (heightInQuestion > controller.overlay.height()) { controller.overlay.height(heightInQuestion); }
                        });
                        $container.find('.' + scope.options.closeClass).bind('click', function () {
                            controller.close(scope);
                            return false;
                        });
                    }
                });
                break;
            case "ajax":
                $container.load(url, function () {
                    if (typeof (scope.options.beforeOpen) == "function") {
                        scope.options.beforeOpen(scope);
                    }
                    $container.css(css).addClass(scope.options.className).stop().fadeIn('fast', function () {
                        $container.removeClass(scope.options.loadingClass);
                        var heightInQuestion = $(document).scrollTop() + $container.height();
                        if (heightInQuestion > controller.overlay.height()) { controller.overlay.height(heightInQuestion); }
                    });
                    $container.find('.' + scope.options.closeClass).bind('click', function () {
                        controller.close(scope);
                        return false;
                    });
                });
                break;
            case "iframe":
                var iframe = '<iframe style="visibility:hidden;" onload="this.style.visibility = \'visible\'; $(\'#' + scope.options.id + ' .' + scope.options.closeClass +'\').show(); $(\'#' + scope.options.id + '\').removeClass(\'' + scope.options.loadingClass + '\');" src="' + url + '" frameborder="0" allowTransparency="true" scrolling="no" width="' + scope.options.width + '" height="' + scope.options.height + '"/>';
                var closeButton = '<a href="#" class="' + scope.options.closeClass + '" style="display: none; position: absolute">' + scope.options.iframeAnchorHtml + '</a>';
                $container.html(closeButton + iframe);
                if (typeof (scope.options.beforeOpen) == "function") {
                    scope.options.beforeOpen(scope);
                }
                $container.css(css).addClass(scope.options.className).stop().fadeIn('fast', function () {
                    var heightInQuestion = $(document).scrollTop() + $container.height();
                    if (heightInQuestion > controller.overlay.height()) { controller.overlay.height(heightInQuestion); }
                }); //not removing the loading class because can't tell when iframe is finished loading
                $container.find('.' + scope.options.closeClass).bind('click', function () {
                    controller.close(scope);
                    return false;
                });
                break;
            case "html":
                $container.html(url);
                if (scope.options.height == null) {
                    css.height = $container.height();
                    var y = (windowDimensions.height - css.height) / 2;
                    if (scope.options.positionType == 'centered') {
                        css.top = y < 0 ? $(document).scrollTop() : y + $(document).scrollTop();
                    }
                }
                if (typeof (scope.options.beforeOpen) == "function") {
                    scope.options.beforeOpen(scope);
                }
                $container.css(css).addClass(scope.options.className).stop().fadeIn('fast', function () {
                    $container.removeClass(scope.options.loadingClass);
                    //                    var heightInQuestion = $(document).scrollTop() + $container.height();
                    //                    if (heightInQuestion > controller.overlay.height()) { controller.overlay.height(heightInQuestion); }
                });
                $container.find('.' + scope.options.closeClass).bind('click', function () {
                    controller.close(scope);
                    return false;
                });
                break;
            default:
                throw new Error("Invalid Load Method");

        }
    });

}

Popup.prototype.close = function () {
    if (typeof (this.options.beforeClose) == "function") {
        this.options.beforeClose(this);
    }
    $('#' + this.options.id).remove();

}