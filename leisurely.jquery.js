var leisurely = function(options) {
    // parsing options
    var defaults = {
        elements: null,
        interval: 0,
        onload: function () {}
    };
    var options = Object.assign(defaults, options);

    // lazy load
    function load(element) {
        console.log('Loading element...');
        console.log(element);
        if (element.hasAttribute('data-onload')) {
            var onload = function () {
                eval(element.getAttribute('data-onload'));
            }
        } else {
            var onload = options.onload;
        }
        if (element.hasAttribute('data-method')) {
            switch (element.getAttribute('data-method')) {
                case 'background':
                    loadBackground(element, onload);
                    break;
                case 'svg':
                    loadSvg(element, onload);
                    break;
                default:
                    setSrc(element, onload);
                    break;
            }
        } else {
            // default method
            setSrc(element, onload);
        }
    }

    function preload(url) {
        // preload image
        var img = new Image();
        img.src = url;
        return img;
    }

    // set image src
    function setSrc(element, onload) {
        var img = preload(element.getAttribute("data-src"));
        img.addEventListener("load", function (event) {
            element.src = element.getAttribute("data-src");
            onload();
            if (options.interval > 0) {
                setTimeout(function() {
                    loadNext();
                }, options.interval);
            } else {
                loadNext();
            }
        });
    }

    // svg loader
    function loadSvg(element, onload) {
        $.ajax({
            url: element.getAttribute('data-src'),
            dataType: 'html',
            type: 'GET',
            success: function (data) {
                $(element).replaceWith(data);
                onload();
            },
            complete: function () {
                loadNext();
            }
        });
    }

    // background-img loader
    function loadBackground(element, onload) {
        var img = preload(element.getAttribute("data-src"));
        // change only selected background-image
        if (element.hasAttribute('data-replace-nth')) {
            var css = replaceNthImage(
                element.getAttribute("data-replace-nth"),
                $(element).css('background-image'),
                img.src
            );
        } else {
            var css = 'url("' + img.src + '")';
        }
        img.addEventListener("load", function (event) {
            $(element).css('background-image', css);
            onload();
            if (options.interval > 0) {
                setTimeout(function () {
                    loadNext();
                }, options.interval);
            } else {
                loadNext();
            }
        });
    }

    // helper method to replace only one out of multiple background-images
    function replaceNthImage(nth, originalString, replacementUrl) {
        // split on comma
        var images = originalString.split(",");
        // select nth item and replace
        images[nth] = 'url("' + replacementUrl + '")';
        // implode array and return
        return images.join(',');
    }

    // iterate through elements
    var i = 0;
    var loadNext = function() {
        if (i < options.elements.length) {
            load(options.elements[i]);
            i++;
        }
    };
    loadNext();
};

// leisurely
leisurely({
    elements: document.querySelectorAll(".leisurely")
});