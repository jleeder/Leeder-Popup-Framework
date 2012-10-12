/// <reference path="jquery.d.ts" />

module LeederPopup {

    interface ControllerConfiguration {
        threshold?: number;
        overlayId?: string;
        contentIdPrefix?: string;
        overlayColor?: string;
        opacity?: number;
        overlayClickClose?: bool;
    }

    interface Popup {
        id?: string;
        className?: string;
        closeClassName?: string;
        width?: number;
        height?: number;
        loadMethod?: string;
        positionType?: string;
        iframeCloseHtml?: string;
        loadingClass?: string;
        beforeOpen?: (Popup) => any;
        beforeClose?: (Popup) => any;
        html?: string;
        url?: string;
        offset?: number;
    }

    interface WindowDimensions {
        width: number;
        height: number;
    }

    export class Controller {
        options: ControllerConfiguration =
        {
            threshold: 5000,
            overlayId: "popup_overlay",
            contentIdPrefix: "popup_container",
            overlayColor: "#000000",
            opacity: 0.5,
            overlayClickClose: true
        }

        defaultPopup: Popup =
        {
            className: "default",
            closeClass: "close",
            width: 500,
            height: 500,
            loadMethod: "ajax", //ajax, iframe, jsonp, html
            callback: "callback",
            iframeAnchorHtml: 'X',
            positionType: 'centered',
            loadingClass: "popupLoading",
            beforeOpen: function () { },
            beforeClose: function () { },
            html: null, //for popups with loadMethod html
            url: null, //for popups with loadMethod ajax, iframe or jsonp
            offset: 0
        }

        stack: Popup[];
        popupNumber: number;
        overlay: JQuery;
        windowDimensions: WindowDimensions;
        $window: JQuery;

        constructor (config: ControllerConfiguration) {
            $.extend(this.options, config);
            this.popupNumber = 0;

            $('body').append('<div id="' + this.options.overlayId + '" style="display:none; position: absolute"></div>');

            this.stack = new Array();
            this.overlay = $('#' + this.options.overlayId);

            this.overlay.css({
                "zIndex": this.options.threshold,
                "position": "fixed",
                "top": 0, "left": 0,
                "backgroundColor": this.options.overlayColor
            });

            this.$window = $(window);
            this.windowDimensions =
            {
                width: this.$window.width(),
                height: this.$window.height()
            };
            if (this.options.overlayClickClose) {
                this.overlay.click(function () {
                    //TODO - close the top popup if overlay click to close is active
                });
            }

            this.$window.resize(this.resize);
        }

        private resize(event: JQueryEventObject): any {
            this.windowDimensions =
             {
                 width: this.$window.width(),
                 height: this.$window.height()
             };
        }

        open(popup: Popup): Popup {
            popup = $.extend(this.defaultPopup, popup);
            popup.id = this.options.contentIdPrefix + "_" + this.popupNumber++;

            this.moveAllBehindThreshold();

            var position = { 'x': (this.windowDimensions.width - popup.width) / 2, 'y': (this.windowDimensions.height - popup.height) / 2 };
            var overlayCss =
            {
                "width": this.windowDimensions.width,
                "height": this.windowDimensions.height
            }

            var left, top = 0;
            switch (popup.positionType) {
                case "centered":
                    left = position.x < 0 ? $(document).scrollLeft() : position.x + $(document).scrollLeft();
                    top = position.y < 0 ? $(document).scrollTop() : position.y + $(document).scrollTop();
                    break;
                case "offset":
                    left = position.x < 0 ? $(document).scrollLeft() : position.x + $(document).scrollLeft();
                    top = $(document).scrollTop() + popup.offset;
                    break;
            }
            var css =
            {
                'position': 'absolute',
                'left': left,
                'top': top,
                'display': 'none',
                'width': popup.width,
                'height': popup.height,
                'zIndex': this.options.threshold + 10
            }

            $('body').append('<div id="' + popup.id + '" class="' + popup.loadingClass + '" style="display: none; position: absolute"></div>');
            var $container = $('#' + popup.id);
            var _this = this;
            this.overlay.css(overlayCss).stop().fadeTo("slow", this.options.opacity, function () {
                switch (popup.loadMethod.toLowerCase()) {
                    case 'html':
                        $container.html(popup.html);
                        if (popup.height == null) {
                            css.height = $container.height();
                            var y = (_this.windowDimensions.height - css.height) / 2;
                            if (popup.positionType == 'centered') {
                                css.top = y < 0 ? $(document).scrollTop() : y + $(document).scrollTop();
                            }
                        }
                        if (typeof (popup.beforeOpen) === "function") {
                            popup.beforeOpen(popup);
                        }
                        $container.css(css).addClass(popup.className).stop().fadeIn('fast', function () {
                            $container.removeClass(popup.loadingClass);
                        });
                        $container.find('.' + popup.closeClassName).click(function (event: JQueryEventObject) {
                            //_this.close(popup);
                            event.preventDefault();
                        });
                        break;
                    case 'ajax':
                        //help.openAjax(popup, css);
                        break;
                    case 'iframe':
                        //help.openIframe(popup, css);
                        break;
                }
            });
            this.stack.push(popup);
            return popup;
        }

        moveAllBehindThreshold() {
            var length = this.stack.length;
            for (var i = 0; i < length; i++) {
                $(this.stack[i].id).css('zIndex', this.options.threshold - 10);
            }
        }

    }


}