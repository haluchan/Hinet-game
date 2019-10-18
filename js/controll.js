$(function() {

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    console.log('ios');
    reiFrameSize();
    game();
    GEvent('首頁進站');
    $('.btn-go').on('click touchstart',function (){
      GEvent('首頁立馬挑戰按鈕');
      $('.page1').css('display','none');
      $('.page2').css('display','block');

      stopVideo();
    });

    var start = document.querySelector(".start");
    start.addEventListener('click',function () {
      document.querySelector('.page2').style.display = "none";
      document.querySelector('.preGame').style.display = "block";
      GEvent('開始遊戲按鈕');
    },false);

    var preGame = document.querySelector(".preGame");
    preGame.addEventListener('click',function () {
      document.querySelector('.preGame').style.display = "none";
      document.querySelector('#game').style.display = "block";
    },false);

    $('.btn4').on('click touchstart',function () {

      $('.share').css('display',"none");
      $('#game').css('display',"block");
      GEvent('再次挑戰');
    });
    $('.btn3').on('click touchstart',shareFB);

    var btn5 = document.querySelector(".btn5");
    btn5.addEventListener('click',function () {
      window.open("https://www.cht.com.tw/home/Campaign/broadband300m/index.html?utm_source=AD2&utm_medium=cpc&utm_campaign=HiNetQ3_20180801&utm_content=banner&utm_term=limittime",'_blank');
      GEvent('前往中華電信');
    },false);



  }else{
    $('.pc').css('display','block');
    $('.container').css('display','none');
    console.log('pc');
  }




  function chackOrientation() {
    console.log(window.orientation);
    switch(window.orientation) {
      case 90 || -90:
        $('#revert').css('display','block');
        $('body').css('background-color','#23b9eb');
        $('.container').css('display','none');
        console.log('landscape');
        break;
      default:
        $('#revert').css('display','none');
        $('.container').css('display','block');
        console.log('portrait');
        break;
    }

  }
  function shareFB() {
    var localURL = location.href;
    var myUrl = 'http://www.facebook.com/share.php?u=' + encodeURIComponent("https://wwwosc.ad2iction.com/18/hinet/index.html");
    window.open(myUrl, 'window', 'width=550, height=450,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
    GEvent('fb分享按鈕');
  }

  function reiFrameSize(){

    var $iframes = $("iframe" );

    $iframes.each(function () {
      $( this ).data( "ratio", this.height / this.width )
      // Remove the hardcoded width &#x26; height attributes
        .removeAttr( "width" )
        .removeAttr( "height" );
    });

// Resize the iframes when the window is resized
    $( window ).resize( function () {
      $iframes.each( function() {
// Get the parent container&#x27;s width
        var width = $( this ).parent().width();
        $( this ).width( width -14 )
          .height( width * $( this ).data( "ratio" ) );
      });
// Resize to fix all iframes on page load.
    }).resize();

  }

  function stopVideo() {
    var iframe = document.querySelector( 'iframe');
    var video = document.querySelector( 'video' );
    if ( iframe ) {
      var iframeSrc = iframe.src;
      iframe.src = iframeSrc;
    }
    if ( video ) {
      video.pause();
    }
  }
});



