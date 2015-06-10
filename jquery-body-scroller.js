/*
* Fix Internet Explorer's delayed scroll event firing.
* by @psyonline (http://www.psyonline.kr/, majorartist@gmail.com)
* https://github.com/psyonline/jquery-body-scroller
* License - http://creativecommons.org/licenses/by-sa/2.0/kr/
*/

/*
* Methods
	- $._bodyScroller.addEvent(callback) : 스크롤 이벤트 추가. callback 함수가 호출 될 때 (scrollTop, maxScrollTop) 파리미터 전달
	- $._bodyScroller.removeEvent(callback) : 스크롤 이벤트 제거.
	- $._bodyScroller.on() : 기능 활성화
	- $._bodyScroller.off() : 기능 비활성화
	- $._bodyScroller.scrollTo(value [, duration] [, easing] [, complete]) : 스크를 이동. 애니매이션 가능(jQuery.animate와 동일한 형식)
*/

(function($) {


	var
		use = false,
		ie = navigator.userAgent.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
		webkit = (/applewebkit/i).test(navigator.userAgent),
		$window = $(window),
		documentElement = document.documentElement,
		$documentElement = $(documentElement),
		lastScrollTop = 0,
		captured = false,
		paused = false,
		wheelDisabled = false,
		callbacks = [],
		numCallbacks = 0,
		$animator = $({v: 0});


	$._bodyScroller = {
		on: function() {
			paused = false;
		},
		off: function() {
			paused = true;
		},
		addEvent: function(callback) {
			addEvent(callback);
		},
		removeEvent: function(callback) {
			removeEvent(callback);
		},
		scrollTo: function(value, d, e, c) {
			(2 > arguments.length) ? setScrollTop(value) : animateTo(value, d, e, c);
		}
	};


	if ((/win/i).test(navigator.appVersion) && ie) {
		$documentElement
			.on('mousewheel', function(e) {
				if (paused || wheelDisabled || !numCallbacks) {
					return true;
				}
				fix(e.originalEvent.deltaY || e.originalEvent.wheelDelta*-1);
				e.preventDefault();
			})
			.on('keydown', function(e) {
				if (paused || wheelDisabled || !numCallbacks) {
					return true;
				}
				var keyCode = e.keyCode, documentHeight = documentElement.clientHeight, newScrollTop;
				if ((/^(32|33|34|38|40)$/).test(keyCode)) { // (space bar|page up|page down|up arrow|down arrow)
					fix(keyCode == 32 || keyCode == 34 ? documentHeight : keyCode == 33 ? -documentHeight : keyCode == 38 ? -75 : 75);
					e.preventDefault();
				}
			})
			.on('keydown', 'input, textarea', function(e) {
				e.stopPropagation();
			});
		use = true;
	}

	$window.scroll(scroll);


	function addEvent(callback) {
		for (var i = 0; i < numCallbacks; i++) {
			if (callbacks[i] === callback) {
				return;
			}
		}
		callbacks.push(callback);
		numCallbacks++;
		scroll();
	}

	function removeEvent(callback) {
		for (var i = 0; i < numCallbacks; i++) {
			if (callbacks[i] === callback) {
				callbacks.splice(i, 1);
				numCallbacks--;
				i--;
			}
		}
	}

	function fix(scrollBy) {
		var newScrollTop = Math.min(getMaxScrollTop(), Math.max(0, getScrollTop()+scrollBy));
		if (newScrollTop != lastScrollTop) {
			scroll(newScrollTop);
			captured = true;
			documentElement.scrollTop = newScrollTop;
		}
	}

	function setScrollTop(value) {
		 $window.scrollTop(value);
	}

	function getScrollTop() {
		return documentElement.scrollTop || document.body && document.body.scrollTop || 0;
	}

	function getMaxScrollTop() {
		return Math.max(document.body && document.body.scrollHeight, documentElement.scrollHeight)-Math.min(documentElement.offsetHeight, documentElement.clientHeight);
	}

	function disableWheel() {
		wheelDisabled = true;
		$documentElement.bind('mousewheel', disableWheelHandler);
	}

	function enableWheel() {
		wheelDisabled = false;
		$documentElement.unbind('mousewheel', disableWheelHandler);
	}

	function disableWheelHandler(e) {
		e.preventDefault();
	}

	function animateTo(value, d, e, c) {

		var options = {}, key,
			stepFunction, completeFunction;

		if ($.isPlainObject(d)) {
			for (key in d) {
				options[key] = d[key];
			}
		} else if (typeof(c) == 'function') {
			options.duration = d;
			options.easing = e;
			options.complete = c;
		} else if (typeof(e) == 'function') {
			if (typeof(d) == 'number') {
				options.duration = d;
			} else {
				options.easing = d;
			}
			options.complete = e;
		} else {
			if (typeof(d) == 'number') {
				options.duration = d;
			} else if (typeof(d) == 'string') {
				options.easing = d;
			} else if (typeof(d) == 'function') {
				options.complete = d;
			}
		}

		stepFunction = options.step;
		completeFunction = options.complete;

		options.step = function(v) {
			v = Math.round(typeof(v) == 'number' ? v : v.target[0].v);
			use ? fix(v-lastScrollTop) : setScrollTop(v);
			stepFunction && stepFunction(v);
		}

		options.complete = function(v) {
			enableWheel();
			completeFunction && completeFunction(lastScrollTop);
		}

		disableWheel();

		$animator[0].v = lastScrollTop;
		$animator.stop().animate({v: value}, options);

	}

	function scroll(_scrollTop) {
		var scrollTop = typeof(_scrollTop) == 'number' ? _scrollTop : getScrollTop(),
			i, maxScrollTop;
		lastScrollTop = scrollTop;
		if (captured) {
			captured = false;
			return false;
		}
		maxScrollTop = getMaxScrollTop();
		for (i = 0; i < numCallbacks; i++) {
			callbacks[i](scrollTop, maxScrollTop);
		}
	}


})(window.jQuery);