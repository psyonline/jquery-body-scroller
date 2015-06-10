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
*/

(function($) {


	var
		ie = navigator.userAgent.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
		webkit = (/applewebkit/i).test(navigator.userAgent),
		documentElement = document.documentElement,
		lastScrollTop = 0,
		captured = false,
		paused = false,
		callbacks = [],
		numCallbacks = 0;


	$._bodyScroller = {
		on: on,
		off: off,
		addEvent: function(callback) {
			for (var i = 0; i < numCallbacks; i++) {
				if (callbacks[i] === callback) {
					return;
				}
			}
			callbacks.push(callback);
			numCallbacks++;
			scroll();
		},
		removeEvent: function(callback) {
			for (var i = 0; i < numCallbacks; i++) {
				if (callbacks[i] === callback) {
					callbacks.splice(i, 1);
					numCallbacks--;
					i--;
				}
			}
		}
	};


	if ((/win/i).test(navigator.appVersion) && ie) {
		$(documentElement)
			.on('mousewheel', function(e) {
				if (paused || !numCallbacks) {
					return true;
				}
				fix(e.originalEvent.deltaY || e.originalEvent.wheelDelta*-1);
				e.preventDefault();
			})
			.on('keydown', function(e) {
				if (paused || !numCallbacks) {
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
	}

	$(window).scroll(scroll);


	function fix(scrollBy) {
		var newScrollTop = Math.min(getMaxScrollTop(), Math.max(0, getScrollTop()+scrollBy));
		if (newScrollTop != lastScrollTop) {
			scroll(newScrollTop);
			captured = true;
			documentElement.scrollTop = newScrollTop;
		}
	}

	function getScrollTop() {
		return documentElement.scrollTop || document.body && document.body.scrollTop || 0;
	}

	function getMaxScrollTop() {
		return Math.max(document.body && document.body.scrollHeight, documentElement.scrollHeight)-Math.min(documentElement.offsetHeight, documentElement.clientHeight);
	}

	function on() {
		paused = false;
	}

	function off() {
		paused = true;
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