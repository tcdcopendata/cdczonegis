/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

$(document).ready(function() {
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    $("body").addClass('is-mobile');
  }
});


// get Screen height
function getH() {

  $(document).ready(function() {
    getHeight();
  });

  // make sure div stays full width/height on resize
  $(window).resize(function() {
    getHeight();
  });

  function getHeight (){
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    $('.hero-item__content').css({'height': winHeight});
  }

}

// click
function menuToggle() {

  $('.c-hamburger').click(function(){
    $(".c-hamburger").toggleClass('active');
    $(".site-menu").toggleClass('is-toggle');
    $("body").toggleClass('scroll--hidden');
    return false;
  });
  
}

// header sticky on scroll
function headerSticky() {

  $(window).scroll(function() {    
    var scroll = $(window).scrollTop();
    if (scroll >= 152) {
        $(".site-header").addClass("sticky");
        $(".header--sticky").addClass("sticky");
    } else {
        $(".site-header").removeClass("sticky");
        $(".header--sticky").removeClass("sticky");
    }
  });

  $(window).height(function() {    
    var scroll = $(window).scrollTop();
    if (scroll >= 152) {
        $(".site-header").addClass("sticky");
        $(".header--sticky").addClass("sticky");
    } else {
        $(".site-header").removeClass("sticky");
        $(".header--sticky").removeClass("sticky");
    }
  });

}

// slick slider
function slick() {

  $('.hero-slick').slick({
    lazyLoad: 'ondemand',
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    arrows: true,
    dots: true,
    fade: true
  });

  $('.banner-slick').slick({
    lazyLoad: 'ondemand',
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    arrows: false,
    dots: true,
    fade: true
  });

  $(".hero-slick, .banner-slick").slickAnimation();

}

$(window).on('resize orientationchange', function() {
  $('.hero-slick').slick('resize');
});


// scroll Reveal
function scrollreveal() {

  var fadeInBottom = {
    origin: "bottom",
    distance: "1.5em",
    duration : 500,
    delay: 100,
    scale: 1.00
  }

  window.sr = ScrollReveal();

  sr.reveal('.process-item, .features-item, .brand-item, .special-item, .price-item, .news-item, .special-footer', { duration: 1000, scale: 1, delay: 100 });

}


function popup() {

  $('.popup-link').magnificPopup({
    type: 'inline',
    preloader: false,
    focus: '#username',
    modal: true,
    midClick: true,
    closeOnBgClick: false
  });

  $(document).on('click', '.mfp-close', function (e) {
    e.preventDefault();
    $.magnificPopup.close();
  });

}



function pickadate() {

  var $input = $( '.datepicker' ).pickadate({
      format: 'yyyy/mm/dd',
      formatSubmit: 'yyyy/mm/dd',
      container: '#container',
      // editable: true,
      closeOnSelect: false,
      closeOnClear: false,
      onStart: function() {
        $('.picker__select--month').attr('name', 'month');
        $('.picker__day--selected').attr('name', 'day');
        $('.picker__select--year').attr('name', 'year');
      }
  })

  var picker = $input.pickadate('picker');

  $('.timepicker').pickatime({
    clear: '清除'
  });

}


function check_login_form()
{
    if($("#member_no").val()==""){
      alert("請輸入會員編號");
      $("#member_no").focus();
      return false;
    }

    if($("#birth").val() == ""){
      alert("請輸入會員生日");
      $("#birth").focus();
      return false;
    }

    return true;
}

//scroll to Top
$(function(){$.fn.scrollToTop=function(){$(this).hide().removeAttr("href");if($(window).scrollTop()!="0"){$(this).fadeIn("slow")}var scrollDiv=$(this);$(window).scroll(function(){if($(window).scrollTop()=="0"){$(scrollDiv).fadeOut("slow")}else{$(scrollDiv).fadeIn("slow")}});$(this).click(function(){$("html, body").animate({scrollTop:0},"slow")})}});


// open loading
$(window).load(function() {
  $("#loader").fadeOut();
});

$(document).ready(function(){

  getH();
  headerSticky();
  menuToggle();
  slick();
  scrollreveal();
  popup();
  pickadate();

  $("img.lazy").lazyload({
      threshold : 200,
      effect : "fadeIn",
  });

  $("#toTop").scrollToTop();

  
  $("#login_submit").click(function(){
    if(!check_login_form()){
      return false;
    }
    
    $.post("verify_user.php", $("#login_form").serialize(), function(data){
      if(data == "success"){
        location.href="member.php";
        return;
      }else{
        alert(data);
      }
    }, "text");
  });


});