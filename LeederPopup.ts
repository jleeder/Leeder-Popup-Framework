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
        iframeCloseHtml?: string;
        loadingClass?: string;
        beforeOpen?: (Popup) => any;
        beforeClose?: (Popup) => any;
        html?: string;
        url?: string;
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
            loadingClass: "popupLoading",
            beforeOpen: function () { },
            beforeClose: function () { },
            html: null, //for popups with loadMethod html
            url : null, //for popups with loadMethod ajax, iframe or jsonp
        }
        
        stack: Popup[];
        popupNumber: number;
        overlay: JQuery;

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

            if (this.options.overlayClickClose) {
                this.overlay.click(function () {
                    //TODO - close the top popup if overlay click to close is active
                });
            }
        }

        open(popup: Popup) 
        {
            popup = $.extend(this.defaultPopup, popup);
            popup.id = this.options.contentIdPrefix + "_" + this.popupNumber++;
            if (this.stack.length > 0) { //something is already opened
                //move the last popup behind the threshold
                //don't worry about the rest they should have been moved when the last opened
                // TODO - think about moving all popups in front of the threshold instead of just doing the last
                $('#' + this.stack[this.stack.length - 1].id).css('zIndex', this.options.threshold - 10);
            }

            switch (popup.loadMethod.toLowerCase()) 
            {
                case 'html':
                    break;
                case 'ajax':
                    break;
            }
        }
    }
}