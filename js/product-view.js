/**
 * Gomez 360 View Plugin
 * @author: Diego.A.Martinez
 */
(function( $ ){
	var methods = {
		//Item objetcs
		item: null,
		threesixtyImages: null,
		staticImages: null,

		//Image containers
		viewerContainer: null,
		threesixtyImageList: null,
		staticImageList: null,

		navigationContainer: null,
		zoomContainer: null,
		viewPortHandler: null,
		staticImageButtonList: null,

		sliderControl: null,
		imageViewerContainer: null,

		spContainer: null,

		showing: null,

		init : function(settings){

		},
		
		draw : function(settings){
			var self = methods;

			return this.each(function(){
				var spContainer = $(this);
				self.spContainer = spContainer;

				try{

					if(settings){
						self.item = settings.item;
					}

					spContainer.empty();
					/*	Product container layout
						<div class="threesixty product1">
					        <div class="spinner"><span>0%</span></div>
					        <ol class="threesixty_images"></ol>
				    	</div>
					*/

					//Scrren size
					var windowWidth = $( window ).width();

					//Layou the viewer
					self.viewerContainer = $(document.createElement('div'))
						.appendTo(spContainer)
						.addClass('image-container');

					self.imageViewerContainer = $(document.createElement('div'))
						.appendTo(self.viewerContainer)
						.append('<div class="spinner"><span>0%</span></div>')
						.addClass('image-viewer');

					self.threesixtyImageList = $(document.createElement('ol'))
						.appendTo(self.imageViewerContainer)
						.addClass('image-list');

					var sliderContainer = $(document.createElement('div'))
						.appendTo(self.viewerContainer)
						.addClass('control-container');

					self.staticImageList = $(document.createElement('div'))
						.appendTo(self.imageViewerContainer)
						.addClass('static-image-list');


					self.navigationContainer = $(document.createElement('div'))
						.appendTo(spContainer)
						.addClass('navigation-container');

					self.zoomContainer = $(document.createElement('div'))
						.attr('id', 'zoom-detail-container')
						.appendTo(self.navigationContainer);
					
					self.sliderControl = $(document.createElement('div'))
						.appendTo(sliderContainer);

					self.viewPortHandler = !$.browser.msie ? $('<div class="test-viewport"></div>').appendTo(self.threesixtyImageList) : $('');

					//Position the container
					var positionLeft = windowWidth / 2 - spContainer.width() / 2;
					spContainer.css('left', positionLeft + 'px');

					methods.setupUI();

				}catch(err){
					try{if(console) console.log(err);}catch(noconosoloeE){}
				}
			});
		},

		/**
		 * Setup the controls
		 */
		setupUI: function(){
			var self = this;

			if(self.item.threesixtyImages){
				self.threesixtyImages = self.item.threesixtyImages;
				self.setupThreeSixty();
			}else{
				$('.spinner').hide();
			}

			if(self.item.staticImages){
				self.staticImages = self.item.staticImages;
				self.setupStaticImages();
			}

			self.spContainer.on('show-image', function(){
				self.threesixtyImageList.hide();
				self.staticImageList.hide();
			});
		},

		/**
		 * Builds the 360 view
		 */
		setupThreeSixty: function(){
			var self = this;

			//Setup the viewer components
			var imageList = _.pluck(self.threesixtyImages, 'img');

			var product = self.imageViewerContainer.ThreeSixty({
				    totalFrames: imageList.length,
				    endFrame: imageList.length,
				    currentFrame: 1,
				    imgList: '.image-list',
				    progress: '.spinner',
				    filePrefix: '',
				    width: 600,
				    height: 450,
				    navigation: false,
				    disableSpin: false,
				    drag: false,
				    imgArray: imageList,

				    onReady: function(){
				    	setTimeout(function(){
				    		var listHeight = $('.image-viewer .image-list img.current-image').height();
				    		self.threesixtyImageList.css('top', (225 - listHeight / 2) + 'px');
					    	
					    	//Enable slider to navigate 360 view.
					    	$('.control-container').fadeIn();

							//Setup image zooming
							$('.image-viewer .image-list img').each(function(index){
								var img = $(this);
								if(self.threesixtyImages[index].imgLarge){
									img.attr('data-zoom-image', self.threesixtyImages[index].imgLarge).addClass('zoom-enabled');
									self.setZoomable(img);
								}
								
							});
					    }, 50);
				    }
			    });

			self.sliderControl.noUiSlider({
					start: 0,
					step: 1,
					range: {
						'min': 0,
						'max': imageList.length
					},

					serialization: {
						format: {
							decimals: 0
						}
					}
				}).on('slide', function(){
					var frame = parseInt(self.sliderControl.val());
					console.log(frame)
					product.gotoAndPlay(frame);
				});


			//Create the navigator handler
			var threesixtyButton = $(document.createElement('a'))
				.appendTo(self.navigationContainer)
				.addClass('threesixty-button')
				.css('background-image', 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8)), URL(' + imageList[0] + ')')
				.append('<span>360°</span>')
				//on click, show the image on the image-container
				.on('click', function(){
					if(self.showing != 'threesixty'){
						self.spContainer.trigger('show-image');
						self.threesixtyImageList.show();

			    		self.showing = 'threesixty';
					}
				});
		},

		/**
		 * To setup the list of images
		 */
		setupStaticImages: function(){
			var self = this;
			var imageList = self.staticImages;

			self.staticImageButtonList = $(document.createElement('div'))
				.appendTo(self.navigationContainer)
				.addClass('static-images-button-list');
						
			//Setup the viewer components
			_.each(imageList, function(imageItem, index){
				//Create the images access
				var imgButton = $(document.createElement('a'))
					.css('background-image', 'URL(' + imageItem.img + ')')
					.attr('index', index)

					.appendTo(self.staticImageButtonList)
					//on click, show the image on the image-container
					.on('click', function(){
						var index = $(this).attr('index');

						if(self.showing != 'static'){
							self.spContainer.trigger('show-image');
							self.staticImageList.show();

							var listHeight = self.staticImageList.find('img:first-child').height();
				    		self.staticImageList.css('top', (225 - listHeight / 2) + 'px');

				    		self.showing = 'static';
						}

						self.staticImageList.find('img').fadeOut();
						self.staticImageList.find('[index=' + index +']').fadeIn();
					});

				var img = $(document.createElement('img'))
					.attr('src', imageItem.img)
					.attr('index', index)
					.appendTo(self.staticImageList);
				
				if(imageItem.imgLarge){
					img.attr('data-zoom-image', imageItem.imgLarge).addClass('zoom-enabled');
					self.setZoomable(img);
				}
			});
		},

		/**
		 * Enables the zoom functionality over the img item.
		 */
		setZoomable: function(img){
			var self = this;

			var viewPortHandler = self.viewPortHandler;

			var zoomContainer = self.zoomContainer;

			var zoomCurrentImgURL = '';

			var viewportWidth = zoomContainer.width();
			var viewportHeight = zoomContainer.height();
			var imageNaturalWidth = 0;
			var imageNaturalHeight = 0;
			var naturalRelationWidth = 0;
			var naturalRelationHeight = 0;

			var relativeWidth = 0; //Relative difference between image and zoom viewport
			var relativeHeight = 0;

			//if this image has a large image, create the zoom component
			img.on('mousemove', function(event){
				var imgUrl = img.attr('data-zoom-image');

				if(imgUrl != zoomCurrentImgURL){
					zoomCurrentImgURL = imgUrl;
					zoomContainer.css('background-image', 'URL(' + zoomCurrentImgURL + ')');

					imageNaturalWidth = img.get(0).naturalWidth;
					imageNaturalHeight = img.get(0).naturalHeight;

					var viewportAspectRatio = viewportHeight / viewportWidth;
					naturalRelationWidth = img.width() / imageNaturalWidth; //60% of the natural size
					naturalRelationHeight = img.height() / imageNaturalHeight;

					relativeWidth = viewportWidth * naturalRelationWidth;
					relativeHeight = relativeWidth * viewportAspectRatio;

					//$('.test-viewport').width(relativeWidth);
					//$('.test-viewport').height(relativeHeight);
				};

				var imgPostion = img.position();

				var x = event.offsetX ? event.offsetX : event.pageX - img.offset().left;
				var y = event.offsetY ? event.offsetY : event.pageY - img.offset().top;

				var left = (x - relativeWidth / 2);
				var top = (y - relativeHeight / 2);
				var relativeX = left / img.width();
				var relativeY = top / img.height();

				//$('.test-viewport').css('left', left + 'px').css('top', (top + img.offset().top)+ 'px');

				console.log('x: [%s] - y [%s] - relative x: %s\% - relative y: %s\%', x, y, relativeX, relativeY);
				console.log(event.target + 'left %s top %s' , left,  top  );

				zoomContainer.css('background-position', (relativeX * imageNaturalWidth * -1) + 'px ' + (relativeY * imageNaturalHeight * -1) + 'px');
			}).on('mouseenter', function(){
				viewPortHandler.fadeIn('slow');
				zoomContainer.fadeIn();
			}).on('mouseleave', function(){
				zoomContainer.fadeOut();
				viewPortHandler.fadeOut();
			});
		}
	};

	$.fn.Gomez360Viewer = function(settings) {
		if(typeof(settings) === 'string'){
			return methods[settings].apply( this, arguments );
		}else{
			if(!methods.spContainer) methods.init.apply( this, arguments );
			return methods.draw.apply( this, arguments  );
		}
	};
})( jQuery );


/* http://github.com/vml-webdev/threesixty-slider.git */
!function(a){"use strict";a.ThreeSixty=function(b,c){var d,e=this,f=[];e.$el=a(b),e.el=b,e.$el.data("ThreeSixty",e),e.init=function(){d=a.extend({},a.ThreeSixty.defaultOptions,c),d.parallel||e.loadImages(),d.disableSpin&&(d.currentFrame=1,d.endFrame=1),e.initProgress()},e.initProgress=function(){e.$el.css({width:d.width+"px",height:d.height+"px","background-image":"none !important"}).css(d.styles),d.responsive&&e.$el.css({width:"100%"}),e.$el.find(d.progress).css({marginTop:d.height/2-15+"px"}),e.$el.find(d.progress).fadeIn("slow"),e.$el.find(d.imgList).hide()},e.loadImages=function(){var b,c,g,h;b=document.createElement("li"),h=d.zeroBased?0:1,c=d.imgArray?d.imgArray[d.loadedImages]:d.domain+d.imagePath+d.filePrefix+e.zeroPad(d.loadedImages+h)+d.ext+(e.browser.isIE()?"?"+(new Date).getTime():""),g=a("<img>").attr("src",c).addClass("previous-image").appendTo(b),f.push(g),e.$el.find(d.imgList).append(b),a(g).load(function(){e.imageLoaded()})},e.imageLoaded=function(){d.loadedImages+=1,a(d.progress+" span").text(Math.floor(100*(d.loadedImages/d.totalFrames))+"%"),d.loadedImages>=d.totalFrames?(d.disableSpin&&f[0].removeClass("previous-image").addClass("current-image"),a(d.progress).fadeOut("slow",function(){a(this).hide(),e.showImages(),e.showNavigation()})):e.loadImages()},e.showImages=function(){e.$el.find(".txtC").fadeIn(),e.$el.find(d.imgList).fadeIn(),e.ready=!0,d.ready=!0,d.drag&&e.initEvents(),e.refresh(),e.initPlugins(),d.onReady()},e.initPlugins=function(){a.each(d.plugins,function(b,c){if("function"!=typeof a[c])throw new Error(c+" not available.");a[c].call(e,e.$el,d)})},e.showNavigation=function(){if(d.navigation&&!d.navigation_init){var b,c,f,g;b=a("<div/>").attr("class","nav_bar"),c=a("<a/>").attr({href:"#","class":"nav_bar_next"}).html("next"),f=a("<a/>").attr({href:"#","class":"nav_bar_previous"}).html("previous"),g=a("<a/>").attr({href:"#","class":"nav_bar_play"}).html("play"),b.append(f),b.append(g),b.append(c),e.$el.prepend(b),c.bind("mousedown touchstart",e.next),f.bind("mousedown touchstart",e.previous),g.bind("mousedown touchstart",e.play_stop),d.navigation_init=!0}},e.play_stop=function(b){b.preventDefault(),d.autoplay?(d.autoplay=!1,a(b.currentTarget).removeClass("nav_bar_stop").addClass("nav_bar_play"),clearInterval(d.play),d.play=null):(d.autoplay=!0,d.play=setInterval(e.moveToNextFrame,40),a(b.currentTarget).removeClass("nav_bar_play").addClass("nav_bar_stop"))},e.next=function(a){a&&a.preventDefault(),d.endFrame-=5,e.refresh()},e.previous=function(a){a&&a.preventDefault(),d.endFrame+=5,e.refresh()},e.play=function(){d.autoplay||(d.autoplay=!0,d.play=setInterval(e.moveToNextFrame,40))},e.stop=function(){d.autoplay&&(d.autoplay=!1,clearInterval(d.play),d.play=null)},e.moveToNextFrame=function(){1===d.autoplayDirection?d.endFrame-=1:d.endFrame+=1,e.refresh()},e.gotoAndPlay=function(a){if(d.disableWrap)d.endFrame=a,e.refresh();else{var b=Math.ceil(d.endFrame/d.totalFrames);0===b&&(b=1);var c=b>1?d.endFrame-(b-1)*d.totalFrames:d.endFrame,f=d.totalFrames-c,g=0;g=a-c>0?a-c<c+(d.totalFrames-a)?d.endFrame+(a-c):d.endFrame-(c+(d.totalFrames-a)):f+a>c-a?d.endFrame-(c-a):d.endFrame+(f+a),c!==a&&(d.endFrame=g,e.refresh())}},e.initEvents=function(){e.$el.bind("mousedown touchstart touchmove touchend mousemove click",function(a){a.preventDefault(),"mousedown"===a.type&&1===a.which||"touchstart"===a.type?(d.pointerStartPosX=e.getPointerEvent(a).pageX,d.dragging=!0):"touchmove"===a.type?e.trackPointer(a):"touchend"===a.type&&(d.dragging=!1)}),a(document).bind("mouseup",function(){d.dragging=!1,a(this).css("cursor","none")}),a(document).bind("mousemove",function(a){d.dragging?(a.preventDefault(),!e.browser.isIE&&d.showCursor&&e.$el.css("cursor","url(assets/images/hand_closed.png), auto")):!e.browser.isIE&&d.showCursor&&e.$el.css("cursor","url(assets/images/hand_open.png), auto"),e.trackPointer(a)})},e.getPointerEvent=function(a){return a.originalEvent.targetTouches?a.originalEvent.targetTouches[0]:a},e.trackPointer=function(a){d.ready&&d.dragging&&(d.pointerEndPosX=e.getPointerEvent(a).pageX,d.monitorStartTime<(new Date).getTime()-d.monitorInt&&(d.pointerDistance=d.pointerEndPosX-d.pointerStartPosX,d.endFrame=d.pointerDistance>0?d.currentFrame+Math.ceil((d.totalFrames-1)*d.speedMultiplier*(d.pointerDistance/e.$el.width())):d.currentFrame+Math.floor((d.totalFrames-1)*d.speedMultiplier*(d.pointerDistance/e.$el.width())),d.disableWrap&&(d.endFrame=Math.min(d.totalFrames-(d.zeroBased?1:0),d.endFrame),d.endFrame=Math.max(d.zeroBased?0:1,d.endFrame)),e.refresh(),d.monitorStartTime=(new Date).getTime(),d.pointerStartPosX=e.getPointerEvent(a).pageX))},e.refresh=function(){0===d.ticker&&(d.ticker=setInterval(e.render,Math.round(1e3/d.framerate)))},e.render=function(){var a;d.currentFrame!==d.endFrame?(a=d.endFrame<d.currentFrame?Math.floor(.1*(d.endFrame-d.currentFrame)):Math.ceil(.1*(d.endFrame-d.currentFrame)),e.hidePreviousFrame(),d.currentFrame+=a,e.showCurrentFrame(),e.$el.trigger("frameIndexChanged",[e.getNormalizedCurrentFrame(),d.totalFrames])):(window.clearInterval(d.ticker),d.ticker=0)},e.hidePreviousFrame=function(){f[e.getNormalizedCurrentFrame()].removeClass("current-image").addClass("previous-image")},e.showCurrentFrame=function(){f[e.getNormalizedCurrentFrame()].removeClass("previous-image").addClass("current-image")},e.getNormalizedCurrentFrame=function(){var a,b;return d.disableWrap?(a=Math.min(d.currentFrame,d.totalFrames-(d.zeroBased?1:0)),b=Math.min(d.endFrame,d.totalFrames-(d.zeroBased?1:0)),a=Math.max(a,d.zeroBased?0:1),b=Math.max(b,d.zeroBased?0:1),d.currentFrame=a,d.endFrame=b):(a=Math.ceil(d.currentFrame%d.totalFrames),0>a&&(a+=d.totalFrames-1)),a},e.zeroPad=function(a){function b(a,b){var c=a.toString();if(d.zeroPadding)for(;c.length<b;)c="0"+c;return c}var c=Math.log(d.totalFrames)/Math.LN10,e=1e3,f=Math.round(c*e)/e,g=Math.floor(f)+1;return b(a,g)},e.browser={},e.browser.isIE=function(){var a=-1;if("Microsoft Internet Explorer"===navigator.appName){var b=navigator.userAgent,c=new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");null!==c.exec(b)&&(a=parseFloat(RegExp.$1))}return-1!==a},e.init()},a.ThreeSixty.defaultOptions={dragging:!1,ready:!1,pointerStartPosX:0,pointerEndPosX:0,pointerDistance:0,monitorStartTime:0,monitorInt:10,ticker:0,speedMultiplier:7,totalFrames:180,currentFrame:0,endFrame:0,loadedImages:0,framerate:60,domains:null,domain:"",parallel:!1,queueAmount:8,idle:0,filePrefix:"",ext:"png",height:300,width:300,styles:{},navigation:!1,autoplay:!1,autoplayDirection:1,disableSpin:!1,disableWrap:!1,responsive:!1,zeroPadding:!1,zeroBased:!1,plugins:[],showCursor:!1,drag:!0,onReady:function(){}},a.fn.ThreeSixty=function(b){return Object.create(new a.ThreeSixty(this,b))}}(jQuery),"function"!=typeof Object.create&&(Object.create=function(a){"use strict";function b(){}return b.prototype=a,new b});
(function(c){function m(a,c,d){if((a[c]||a[d])&&a[c]===a[d])throw Error("(Link) '"+c+"' can't match '"+d+"'.'");}function r(a){void 0===a&&(a={});if("object"!==typeof a)throw Error("(Format) 'format' option must be an object.");var h={};c(u).each(function(c,n){if(void 0===a[n])h[n]=A[c];else if(typeof a[n]===typeof A[c]){if("decimals"===n&&(0>a[n]||7<a[n]))throw Error("(Format) 'format.decimals' option must be between 0 and 7.");h[n]=a[n]}else throw Error("(Format) 'format."+n+"' must be a "+typeof A[c]+
".");});m(h,"mark","thousand");m(h,"prefix","negative");m(h,"prefix","negativeBefore");this.r=h}function k(a,h){"object"!==typeof a&&c.error("(Link) Initialize with an object.");return new k.prototype.p(a.target||function(){},a.method,a.format||{},h)}var u="decimals mark thousand prefix postfix encoder decoder negative negativeBefore to from".split(" "),A=[2,".","","","",function(a){return a},function(a){return a},"-","",function(a){return a},function(a){return a}];r.prototype.a=function(a){return this.r[a]};
r.prototype.L=function(a){function c(a){return a.split("").reverse().join("")}a=this.a("encoder")(a);var d=this.a("decimals"),n="",k="",m="",r="";0===parseFloat(a.toFixed(d))&&(a="0");0>a&&(n=this.a("negative"),k=this.a("negativeBefore"));a=Math.abs(a).toFixed(d).toString();a=a.split(".");this.a("thousand")?(m=c(a[0]).match(/.{1,3}/g),m=c(m.join(c(this.a("thousand"))))):m=a[0];this.a("mark")&&1<a.length&&(r=this.a("mark")+a[1]);return this.a("to")(k+this.a("prefix")+n+m+r+this.a("postfix"))};r.prototype.w=
function(a){function c(a){return a.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g,"\\$&")}var d;if(null===a||void 0===a)return!1;a=this.a("from")(a);a=a.toString();d=a.replace(RegExp("^"+c(this.a("negativeBefore"))),"");a!==d?(a=d,d="-"):d="";a=a.replace(RegExp("^"+c(this.a("prefix"))),"");this.a("negative")&&(d="",a=a.replace(RegExp("^"+c(this.a("negative"))),"-"));a=a.replace(RegExp(c(this.a("postfix"))+"$"),"").replace(RegExp(c(this.a("thousand")),"g"),"").replace(this.a("mark"),".");a=this.a("decoder")(parseFloat(d+
a));return isNaN(a)?!1:a};k.prototype.K=function(a,h){this.method=h||"html";this.j=c(a.replace("-tooltip-","")||"<div/>")[0]};k.prototype.H=function(a){this.method="val";this.j=document.createElement("input");this.j.name=a;this.j.type="hidden"};k.prototype.G=function(a){function h(a,c){return[c?null:a,c?a:null]}var d=this;this.method="val";this.target=a.on("change",function(a){d.B.val(h(c(a.target).val(),d.t),{link:d,set:!0})})};k.prototype.p=function(a,h,d,k){this.g=d;this.update=!k;if("string"===
typeof a&&0===a.indexOf("-tooltip-"))this.K(a,h);else if("string"===typeof a&&0!==a.indexOf("-"))this.H(a);else if("function"===typeof a)this.target=!1,this.method=a;else{if(a instanceof c||c.zepto&&c.zepto.isZ(a)){if(!h){if(a.is("input, select, textarea")){this.G(a);return}h="html"}if("function"===typeof h||"string"===typeof h&&a[h]){this.method=h;this.target=a;return}}throw new RangeError("(Link) Invalid Link.");}};k.prototype.write=function(a,c,d,k){if(!this.update||!1!==k)if(this.u=a,this.F=a=
this.format(a),"function"===typeof this.method)this.method.call(this.target[0]||d[0],a,c,d);else this.target[this.method](a,c,d)};k.prototype.q=function(a){this.g=new r(c.extend({},a,this.g instanceof r?this.g.r:this.g))};k.prototype.J=function(a){this.B=a};k.prototype.I=function(a){this.t=a};k.prototype.format=function(a){return this.g.L(a)};k.prototype.A=function(a){return this.g.w(a)};k.prototype.p.prototype=k.prototype;c.Link=k})(window.jQuery||window.Zepto);

/*$.fn.noUiSlider - WTFPL - refreshless.com/nouislider/ */
(function(c){function m(e){return"number"===typeof e&&!isNaN(e)&&isFinite(e)}function r(e){return c.isArray(e)?e:[e]}function k(e,b){e.addClass(b);setTimeout(function(){e.removeClass(b)},300)}function u(e,b){return 100*b/(e[1]-e[0])}function A(e,b){if(b>=e.d.slice(-1)[0])return 100;for(var a=1,c,f,d;b>=e.d[a];)a++;c=e.d[a-1];f=e.d[a];d=e.c[a-1];c=[c,f];return d+u(c,0>c[0]?b+Math.abs(c[0]):b-c[0])/(100/(e.c[a]-d))}function a(e,b){if(100<=b)return e.d.slice(-1)[0];for(var a=1,c,f,d;b>=e.c[a];)a++;c=
e.d[a-1];f=e.d[a];d=e.c[a-1];c=[c,f];return 100/(e.c[a]-d)*(b-d)*(c[1]-c[0])/100+c[0]}function h(a,b){for(var c=1,g;(a.dir?100-b:b)>=a.c[c];)c++;if(a.m)return g=a.c[c-1],c=a.c[c],b-g>(c-g)/2?c:g;a.h[c-1]?(g=a.h[c-1],c=a.c[c-1]+Math.round((b-a.c[c-1])/g)*g):c=b;return c}function d(a,b){if(!m(b))throw Error("noUiSlider: 'step' is not numeric.");a.h[0]=b}function n(a,b){if("object"!==typeof b||c.isArray(b))throw Error("noUiSlider: 'range' is not an object.");if(void 0===b.min||void 0===b.max)throw Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
c.each(b,function(b,g){var d;"number"===typeof g&&(g=[g]);if(!c.isArray(g))throw Error("noUiSlider: 'range' contains invalid value.");d="min"===b?0:"max"===b?100:parseFloat(b);if(!m(d)||!m(g[0]))throw Error("noUiSlider: 'range' value isn't numeric.");a.c.push(d);a.d.push(g[0]);d?a.h.push(isNaN(g[1])?!1:g[1]):isNaN(g[1])||(a.h[0]=g[1])});c.each(a.h,function(b,c){if(!c)return!0;a.h[b]=u([a.d[b],a.d[b+1]],c)/(100/(a.c[b+1]-a.c[b]))})}function E(a,b){"number"===typeof b&&(b=[b]);if(!c.isArray(b)||!b.length||
2<b.length)throw Error("noUiSlider: 'start' option is incorrect.");a.b=b.length;a.start=b}function I(a,b){a.m=b;if("boolean"!==typeof b)throw Error("noUiSlider: 'snap' option must be a boolean.");}function J(a,b){if("lower"===b&&1===a.b)a.i=1;else if("upper"===b&&1===a.b)a.i=2;else if(!0===b&&2===a.b)a.i=3;else if(!1===b)a.i=0;else throw Error("noUiSlider: 'connect' option doesn't match handle count.");}function D(a,b){switch(b){case "horizontal":a.k=0;break;case "vertical":a.k=1;break;default:throw Error("noUiSlider: 'orientation' option is invalid.");
}}function K(a,b){if(2<a.c.length)throw Error("noUiSlider: 'margin' option is only supported on linear sliders.");a.margin=u(a.d,b);if(!m(b))throw Error("noUiSlider: 'margin' option must be numeric.");}function L(a,b){switch(b){case "ltr":a.dir=0;break;case "rtl":a.dir=1;a.i=[0,2,1,3][a.i];break;default:throw Error("noUiSlider: 'direction' option was not recognized.");}}function M(a,b){if("string"!==typeof b)throw Error("noUiSlider: 'behaviour' must be a string containing options.");var c=0<=b.indexOf("snap");
a.n={s:0<=b.indexOf("tap")||c,extend:0<=b.indexOf("extend"),v:0<=b.indexOf("drag"),fixed:0<=b.indexOf("fixed"),m:c}}function N(a,b,d){a.o=[b.lower,b.upper];a.g=b.format;c.each(a.o,function(a,e){if(!c.isArray(e))throw Error("noUiSlider: 'serialization."+(a?"upper":"lower")+"' must be an array.");c.each(e,function(){if(!(this instanceof c.Link))throw Error("noUiSlider: 'serialization."+(a?"upper":"lower")+"' can only contain Link instances.");this.I(a);this.J(d);this.q(b.format)})});a.dir&&1<a.b&&a.o.reverse()}
function O(a,b){var f={c:[],d:[],h:[!1],margin:0},g;g={step:{e:!1,f:d},start:{e:!0,f:E},connect:{e:!0,f:J},direction:{e:!0,f:L},range:{e:!0,f:n},snap:{e:!1,f:I},orientation:{e:!1,f:D},margin:{e:!1,f:K},behaviour:{e:!0,f:M},serialization:{e:!0,f:N}};a=c.extend({connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal"},a);a.serialization=c.extend({lower:[],upper:[],format:{}},a.serialization);c.each(g,function(c,d){if(void 0===a[c]){if(d.e)throw Error("noUiSlider: '"+c+"' is required.");
return!0}d.f(f,a[c],b)});f.style=f.k?"top":"left";return f}function P(a,b){var d=c("<div><div/></div>").addClass(f[2]),g=["-lower","-upper"];a.dir&&g.reverse();d.children().addClass(f[3]+" "+f[3]+g[b]);return d}function Q(a,b){b.j&&(b=new c.Link({target:c(b.j).clone().appendTo(a),method:b.method,format:b.g},!0));return b}function R(a,b){var d,f=[];for(d=0;d<a.b;d++){var k=f,h=d,m=a.o[d],n=b[d].children(),r=a.g,s=void 0,v=[],s=new c.Link({},!0);s.q(r);v.push(s);for(s=0;s<m.length;s++)v.push(Q(n,m[s]));
k[h]=v}return f}function S(a,b,c){switch(a){case 1:b.addClass(f[7]);c[0].addClass(f[6]);break;case 3:c[1].addClass(f[6]);case 2:c[0].addClass(f[7]);case 0:b.addClass(f[6])}}function T(a,b){var c,d=[];for(c=0;c<a.b;c++)d.push(P(a,c).appendTo(b));return d}function U(a,b){b.addClass([f[0],f[8+a.dir],f[4+a.k]].join(" "));return c("<div/>").appendTo(b).addClass(f[1])}function V(d,b,m){function g(){return t[["width","height"][b.k]]()}function n(a){var b,c=[q.val()];for(b=0;b<a.length;b++)q.trigger(a[b],
c)}function u(d,p,e){var g=d[0]!==l[0][0]?1:0,H=x[0]+b.margin,k=x[1]-b.margin;e&&1<l.length&&(p=g?Math.max(p,H):Math.min(p,k));100>p&&(p=h(b,p));p=Math.max(Math.min(parseFloat(p.toFixed(7)),100),0);if(p===x[g])return 1===l.length?!1:p===H||p===k?0:!1;d.css(b.style,p+"%");d.is(":first-child")&&d.toggleClass(f[17],50<p);x[g]=p;b.dir&&(p=100-p);c(y[g]).each(function(){this.write(a(b,p),d.children(),q)});return!0}function B(a,b,c){c||k(q,f[14]);u(a,b,!1);n(["slide","set","change"])}function w(a,c,d,e){a=
a.replace(/\s/g,".nui ")+".nui";c.on(a,function(a){var c=q.attr("disabled");if(q.hasClass(f[14])||void 0!==c&&null!==c)return!1;a.preventDefault();var c=0===a.type.indexOf("touch"),p=0===a.type.indexOf("mouse"),F=0===a.type.indexOf("pointer"),g,k,l=a;0===a.type.indexOf("MSPointer")&&(F=!0);a.originalEvent&&(a=a.originalEvent);c&&(g=a.changedTouches[0].pageX,k=a.changedTouches[0].pageY);if(p||F)F||void 0!==window.pageXOffset||(window.pageXOffset=document.documentElement.scrollLeft,window.pageYOffset=
document.documentElement.scrollTop),g=a.clientX+window.pageXOffset,k=a.clientY+window.pageYOffset;l.C=[g,k];l.cursor=p;a=l;a.l=a.C[b.k];d(a,e)})}function C(a,c){var b=c.b||l,d,e=!1,e=100*(a.l-c.start)/g(),f=b[0][0]!==l[0][0]?1:0;var k=c.D;d=e+k[0];e+=k[1];1<b.length?(0>d&&(e+=Math.abs(d)),100<e&&(d-=e-100),d=[Math.max(Math.min(d,100),0),Math.max(Math.min(e,100),0)]):d=[d,e];e=u(b[0],d[f],1===b.length);1<b.length&&(e=u(b[1],d[f?0:1],!1)||e);e&&n(["slide"])}function s(a){c("."+f[15]).removeClass(f[15]);
a.cursor&&c("body").css("cursor","").off(".nui");G.off(".nui");q.removeClass(f[12]);n(["set","change"])}function v(a,b){1===b.b.length&&b.b[0].children().addClass(f[15]);a.stopPropagation();w(z.move,G,C,{start:a.l,b:b.b,D:[x[0],x[l.length-1]]});w(z.end,G,s,null);a.cursor&&(c("body").css("cursor",c(a.target).css("cursor")),1<l.length&&q.addClass(f[12]),c("body").on("selectstart.nui",!1))}function D(a){var d=a.l,e=0;a.stopPropagation();c.each(l,function(){e+=this.offset()[b.style]});e=d<e/2||1===l.length?
0:1;d-=t.offset()[b.style];d=100*d/g();B(l[e],d,b.n.m);b.n.m&&v(a,{b:[l[e]]})}function E(a){var c=(a=a.l<t.offset()[b.style])?0:100;a=a?0:l.length-1;B(l[a],c,!1)}var q=c(d),x=[-1,-1],t,y,l;if(q.hasClass(f[0]))throw Error("Slider was already initialized.");t=U(b,q);l=T(b,t);y=R(b,l);S(b.i,q,l);(function(a){var b;if(!a.fixed)for(b=0;b<l.length;b++)w(z.start,l[b].children(),v,{b:[l[b]]});a.s&&w(z.start,t,D,{b:l});a.extend&&(q.addClass(f[16]),a.s&&w(z.start,q,E,{b:l}));a.v&&(b=t.find("."+f[7]).addClass(f[10]),
a.fixed&&(b=b.add(t.children().not(b).children())),w(z.start,b,v,{b:l}))})(b.n);d.vSet=function(){var a=Array.prototype.slice.call(arguments,0),d,e,g,h,m,s,t=r(a[0]);"object"===typeof a[1]?(d=a[1].set,e=a[1].link,g=a[1].update,h=a[1].animate):!0===a[1]&&(d=!0);b.dir&&1<b.b&&t.reverse();h&&k(q,f[14]);a=1<l.length?3:1;1===t.length&&(a=1);for(m=0;m<a;m++)h=e||y[m%2][0],h=h.A(t[m%2]),!1!==h&&(h=A(b,h),b.dir&&(h=100-h),!0!==u(l[m%2],h,!0)&&c(y[m%2]).each(function(a){if(!a)return s=this.u,!0;this.write(s,
l[m%2].children(),q,g)}));!0===d&&n(["set"]);return this};d.vGet=function(){var a,c=[];for(a=0;a<b.b;a++)c[a]=y[a][0].F;return 1===c.length?c[0]:b.dir?c.reverse():c};d.destroy=function(){c.each(y,function(){c.each(this,function(){this.target&&this.target.off(".nui")})});c(this).off(".nui").removeClass(f.join(" ")).empty();return m};q.val(b.start)}function W(a){if(!this.length)throw Error("noUiSlider: Can't initialize slider on empty selection.");var b=O(a,this);return this.each(function(){V(this,
b,a)})}function X(a){return this.each(function(){var b=c(this).val(),d=this.destroy(),f=c.extend({},d,a);c(this).noUiSlider(f);d.start===f.start&&c(this).val(b)})}function B(){return this[0][arguments.length?"vSet":"vGet"].apply(this[0],arguments)}var G=c(document),C=c.fn.val,z=window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",
end:"mouseup touchend"},f="noUi-target noUi-base noUi-origin noUi-handle noUi-horizontal noUi-vertical noUi-background noUi-connect noUi-ltr noUi-rtl noUi-dragable  noUi-state-drag  noUi-state-tap noUi-active noUi-extended noUi-stacking".split(" ");c.fn.val=function(){var a=arguments,b=c(this[0]);return arguments.length?this.each(function(){(c(this).hasClass(f[0])?B:C).apply(c(this),a)}):(b.hasClass(f[0])?B:C).call(b)};c.noUiSlider={Link:c.Link};c.fn.noUiSlider=function(a,b){return(b?X:W).call(this,
a)}})(window.jQuery||window.Zepto);

//Underscore.js 1.5.2
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
