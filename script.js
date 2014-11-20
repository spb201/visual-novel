$(function(){
  var boxes = $('.box'),
      $window = $(window);
  $window.scroll(function(){
    var scrollTop = $window.scrollTop();
    boxes.each(function(){
      var $this = $(this),
          yscrollspeed = parseInt($this.data('yscroll-speed')),
          yval = - scrollTop / yscrollspeed,
          xscrollspeed = parseInt($this.data('xscroll-speed')),
          xval = - scrollTop / xscrollspeed;
          sval = (1 - scrollTop/1500)>0?(1 - scrollTop/1500):0;
      if (xval) $this.css({transform: 'translateX(' + xval + 'px) scale(' + sval + ')'});
      if (yval) $this.css({transform: 'translateY(' + yval + 'px) scale(' + sval + ')'});
      if (scrollTop == 0) {
		  $this.css('transform', 'translateX(' + 0 + 'px)');
          $this.css('transform', 'translateY(' + 0 + 'px)');
      }
    });
  });
})
