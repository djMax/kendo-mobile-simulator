if (kendo.support.browser.webkit || kendo.support.browser.mozilla || (kendo.support.browser.msie && kendo.support.browser.version >= 10)) {
    (function($, undefined) {
        var qs = (document.location.search||'').replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = decodeURIComponent(n[1]),this}.bind({}))[0];
        var original = qs.url || $("#simulator")[0].src,
            mobiles = {
                ipad: {
                    ua: "Mozilla/5.0(iPad; U; CPU OS 7_0_2 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0.2 Mobile/11a501 Safari/8536.25",
                    size: "11px"
                },
                iphone: {
                    ua: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 7_0_2 like Mac OS X; xx-xx) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11a501",
                    size: "12px"
                },
                nexus5: {
                    ua: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
                    size: "12px"
                },
                a100: {
                    ua: "Mozilla/5.0 (Linux; U; Android 4.0; en-us; A100 Build/HTJ85B) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13",
                    size: "11px"
                },
                wp8: {
                    ua: "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)",
                    size: "14px"
                }
            },
            currentDevice = kendo.support.detectOS(mobiles["ipad"].ua);

        function setOrientation(orientation) {
            var orientationClass = "km-" + orientation;

            $(".device-container")
                .removeClass("horizontal vertical")
                .addClass(orientation);

            if (currentDevice.blackberry) {
                orientationClass = orientationClass == "km-horizontal" ? "km-vertical" : "km-horizontal";
            }

            frame.contentWindow.orientation = orientationClass == "km-horizontal" ? 90 : 0;

            $(foreignDocument.documentElement)
                .removeClass("km-horizontal km-vertical")
                .addClass(orientationClass);
        }

        function changeDevice() {
            var devicename = deviceSelector.value(),
                head = $(document.getElementsByTagName("head")[0]),
                deviceLink = head.find("link[href*='devices/']"),
                location = (/^.*?(?=\?|#)/.exec(window.location.href) || [ window.location.href ])[0],
                url, newLink, matches;

            location = location.replace(/index\.html$/,"");
            location += location[location.length-1] != "/" ? "/" : "";

            url = location + "devices/" + devicename + "/styles.css";

            if (kendo.support.browser.msie && kendo.support.browser.version < 11) {
                newLink = document.createStyleSheet(url);
            } else {
                newLink = deviceLink
                    .eq(0)
                    .clone()
                    .attr("href", url);
            }

            head.append(newLink);

            matches = deviceSelector.text().match(/(^\w+)\s(.*)/m);
            $(".description .device")
                    .html(matches[1] + "<span class='model'>" + matches[2] + "</span>")
                    .css("background-image", "url('" + location + "images/" + devicename + ".png')");

            setTimeout(function () {
                deviceLink.remove();
                setTimeout( function () {
                    $(".content").kendoStop(true, true).kendoAnimate("tile:up", function () {
                        resizeContent();
                    });
                }, 500);
            }, 0);
        }

        function resizeContent() {
            var container = $(".device-container"),
                iframe = $(".device-container iframe");
            container[0].style.cssText = "";
            iframe[0].style.cssText = "";
            var offset = parseInt($(".device-skin").css("padding-top"), 10),
                heightOffset = parseInt(container.css("padding-top"), 10) - offset;

            if (offset) {
                iframe.animate({
                    height: iframe.height() + heightOffset
                });
                container.animate({
                    paddingTop: "+" + offset
                });
            }
        }

        function fixAdjust() {
            var doc = $(foreignDocument.documentElement);

            if (kendo.support.transitions.prefix == "webkit") {
                doc.add(foreignDocument.body).css("-webkit-text-size-adjust", "auto");
            }

            changeFontSize();
        }

        function loadUrl(url) {
            var currentMobile = mobiles[deviceSelector.value()];

            $.get(url, function (file) {
                var fileContent = file.replace(/(<head\b.*?>)/igm, "$1\n<base href='" + url + "' />\n" +
                    "<script>\n" +
                    "    var kendoSimulatorAgent = function() {\n" +
                    "            return '" + currentMobile.ua + "';\n" +
                    "        };\n" +
                    "    if (navigator.__defineGetter__) {\n" +
                    "        navigator.__defineGetter__('userAgent', kendoSimulatorAgent);\n" +
                    "    }  else if (Object.defineProperty) {\n" +
                    "        Object.defineProperty(navigator, 'userAgent', {\n" +
                    "            get: kendoSimulatorAgent\n" +
                    "        });\n" +
                    "    }\n" +
                    "    document.addEventListener('DOMContentLoaded', function () {\n" +
                    "    }, false)\n" +
                    "    window['ppAndroid'] = {methodCall:function () { window.parent.nativeSim(arguments); }};" +
                    "</script>\n" +
                    "<style>\n" +
                    "    html { font-size: " + currentMobile.size + " !important; }\n" +
                    "    body { overflow: hidden; height: 100% !important; }\n" +
                    "</style>\n"),
                preview = frame.contentDocument ||  frame.contentWindow.document;

                currentDevice = kendo.support.detectOS(currentMobile.ua);

                if (window.URL && !kendo.support.browser.msie) {
                    window.blob = window.URL.createObjectURL(new Blob([ fileContent ], { type: "text/html" }));
                    frame.contentWindow.location.href = window.blob;
                } else {
                    preview.open();
                    preview.write(fileContent);
                    preview.close();

                    frame.contentWindow.addEventListener("hashchange", function (e) {
                        window.scrollTo(0,0);
                    }, true);
                }
            });
        }

        var deviceSelector = $("#device-selector")
                                    .val("iphone")
                                    .change( function () {
                                        $(".content").kendoStop(true, true).kendoAnimate("tile:up", true, function () {
                                            loadUrl(original);
                                        });
                                    })
                                    .kendoDropDownList({
                                        dataSource: [
                                            { text: "Apple iPad Air", value: "ipad" },
                                            { text: "Apple iPhone 5S", value: "iphone" },
                                            { text: "Google Nexus 5", value: "nexus5" }
                                        ],
                                        dataTextField: "text",
                                        dataValueField: "value"
                                    }).data("kendoDropDownList");

        var frame = $("#simulator")[0],
            addressBar = $("#address-bar"),
            foreignDocument;

        function changeFontSize() {
            $(frame).css("height", "");

            foreignDocument = frame.contentWindow.document;
            setTimeout(function () {
                setOrientation($(".device-container")[0].className.match(/horizontal|vertical/)[0]);
            }, 300);
        }

        $(window).bind("DOMFrameContentLoaded", changeFontSize);
        $(frame.contentWindow).bind("DOMContentLoaded", changeFontSize);

        var suppressedInitialFrameLoad = false;
        frame.onload = function () {
            frame.contentWindow.orientation = $(".device-container").hasClass("horizontal") ? 90 : 0;

            foreignDocument = frame.contentWindow.document;
            if (frame.src != addressBar.val())
                addressBar.val(frame.src);

            $(frame).unbind("mouseleave").bind("mouseleave", function (e) {
                var event = foreignDocument.createEvent("MouseEvents");
                event.initMouseEvent("mouseup", true, true, frame.contentWindow, 1, e.screenX, e.screenY, e.clientX, e.clientY, false, false, false, false, 0, null);

                var scroller = $(foreignDocument).find(".km-scroll-container:visible");
                if (scroller.length)
                    $(foreignDocument).find(".km-scroll-container:visible")[0].dispatchEvent(event);
            });

            if (suppressedInitialFrameLoad) {
                $('#mobile-header>.header-title').text('Simulator');
                changeDevice();
            } else {
                suppressedInitialFrameLoad = true;
            }
        };

        loadUrl(original);

        var backTag = null;
        window["nativeSim"] = function (nativeArgs) {
            var args;
            try {
                args = JSON.parse(nativeArgs[1]);
            } catch (x) {
                args = null;
            }
            switch (nativeArgs[0]) {
                case "SetTitleBar":
                    if (args.hasOwnProperty("WindowTitle")) {
                        $('#mobile-header>.header-title').text(args.WindowTitle);
                    }
                    if (args.hasOwnProperty("LeftButton")) {
                        var lb = $('#mobile-header>.left-button');
                        if (args.LeftButton && args.LeftButton.text) {
                            lb.text(args.LeftButton.text);
                            lb.show();
                            backTag = args.LeftButton.tag;
                        } else {
                            lb.hide();
                            backTag = null;
                        }
                    }
                    break;
                default:
                    console.log('Unknown native bridge call', arguments);
                    break;
            }
        };

        $('#mobile-header>.left-button').on('click', function () {
            if (backTag) {
                try {
                    window.frames[0].$.NativeBridge.callHandler(backTag);
                } catch (x) {
                    console.log('Failed to call registered back button handler.');
                    console.log(x);
                }
            }
        });

        $(document)
                .delegate("[data-orientation]", "click", function () {
                    var button = $(this),
                        container = $(".device-container"),
                        currentOrientation = button.data("orientation");

                    if (!container.hasClass(button.data("orientation"))) {
                        $(".content").kendoStop(true, true).kendoAnimate("tile:right", true, function () {

                            setOrientation(currentOrientation);

                            frame.contentWindow.orientation = currentOrientation == "horizontal" ? 90 : 0;
                            $(foreignDocument.documentElement)
                                .removeClass("km-horizontal km-vertical")
                                .addClass("km-" + currentOrientation);

                            container[0].style.cssText = "";

                            setTimeout( function () {
                                $(".content").kendoStop(true, true).kendoAnimate("tile:right", function () {
                                    resizeContent();
                                    fixAdjust();
                                });
                            }, 100);
                        });
                    }
                })
                .delegate("#navigate-back", "click", function () {
                    frame.contentWindow.history.back()
                });
    })(jQuery);
} else {
    $(document.body).addClass("old-browser");
    $(".header").hide();
    $(".content").empty().html("<span class='centered'><strong>The Kendo Mobile <span>simulator and demo</span></strong><span>are fully supported in WebKit based browsers and partially supported in Firefox.</span><br>Please use a compatible desktop browser or open the demo in a mobile WebKit based browser.</span>")
}
