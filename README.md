### jquery-body-scroller
---

Fix Internet Explorer's delayed scroll event firing.

**Methods**  
- $._bodyScroller.addEvent(callback) : 스크롤 이벤트 추가. callback 함수가 호출 될 때 (scrollTop, maxScrollTop) 파리미터 전달
- $._bodyScroller.removeEvent(callback) : 스크롤 이벤트 제거.
- $._bodyScroller.on() : 기능 활성화
- $._bodyScroller.off() : 기능 비활성화
- $._bodyScroller.scrollTo(value [, duration] [, easing] [, complete]) : 스크를 이동. 애니매이션 가능(jQuery.animate와 동일한 형식)

**Demo**  
<http://www.psyonline.kr/blog/pages/jquery-body-scroller/demo.html>