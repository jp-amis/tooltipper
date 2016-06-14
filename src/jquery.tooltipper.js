// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "tooltipper",			
			defaults = {
				baseSelector: '.tooltipper'
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;
			this.$element = $(element);

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
			init: function() {								
				this.tooltippers = this.$element.find(this.settings.baseSelector);

				this.loopTooltippers();
			},
			loopTooltippers: function() {
				this.tooltippers.each(function() {
					new Tooltipper($(this));					
				});
			}
		} );

		var defaultsTooltipper = {
			event: 'hover',
			position: 'top|center'
		};
		function Tooltipper ($el) {		
			this.$element = $el;	
			this.$parent = this.$element.parent();	

			this.settings = $.extend( {}, defaultsTooltipper, this.$element.data() );
			this.settings.position = this.settings.position.split('|');			

			this.isVisible = false;

			this.init();			
		};
		$.extend( Tooltipper.prototype, {
			init: function() {								
				this.handlesEvent();
				this.handlesClose();	
			},

			handlesClose: function() {
				this.$element
					.find('[data-close]')
					.on('click', $.proxy(this.onClickClose, this));
			},

			onClickClose: function(e) {
				this.hide();
			},

			handlesEvent: function() {				
				if(this.settings.event == 'click') {
					this.handlesEventClick();
				} else if(this.settings.event == 'hover') {
					this.handlesEventHover();
				}
			},

			layout: function() {
				if(this.settings.position[0] == 'top') {
					this.$element.css('top', this.$parent.offset().top - this.$element.height());	
				} else if(this.settings.position[0] == 'bottom') {
					this.$element.css('top', this.$parent.offset().top + this.$parent.height());	
				} else if(this.settings.position[0] == 'left') {					
					this.$element.css('left', this.$parent.offset().left - this.$element.width());
				} else if(this.settings.position[0] == 'right') {					
					this.$element.css('left', this.$parent.offset().left + this.$parent.width());
				}


				if(this.settings.position[0] == 'top' || this.settings.position[0] == 'bottom') {
					if(this.settings.position[1] == 'center') {
						this.$element.css('left', this.$parent.offset().left + (this.$parent.width() * .5) - (this.$element.width() * .5));
					} else if(this.settings.position[1] == 'left') {
						this.$element.css('left', this.$parent.offset().left);
					} else if(this.settings.position[1] == 'right') {
						this.$element.css('left', this.$parent.offset().left + this.$parent.width() - this.$element.width());
					}
				}
									
				if(this.settings.position[0] == 'left' || this.settings.position[0] == 'right') {
					if(this.settings.position[1] == 'center') {
						this.$element.css('top', this.$parent.offset().top + (this.$parent.height() * .5) - (this.$element.height() * .5));
					} else if(this.settings.position[1] == 'top') {
						this.$element.css('top', this.$parent.offset().top);
					} else if(this.settings.position[1] == 'bottom') {
						this.$element.css('top', this.$parent.offset().top + this.$parent.height() - this.$element.height());
					}
				}				
			},

			show: function() {
				$('body').append(this.$element);
				this.layout();
				this.$element.addClass('tooltipper-block');

				this.isVisible = true;
			},

			hide: function() {
				this.$parent.append(this.$element);
				this.$element.removeClass('tooltipper-block');

				this.isVisible = false;	
			},

			// CLICK EVENT HANDLER
			handlesEventClick: function() {
				this.$parent.on('click', $.proxy(this.onEventClick, this));
			},
			//		CLICK EVENTS
			onEventClick: function(e) {
				if(!this.isVisible) {
					this.show();
				} else {					
					this.hide();
				}				
			},

			// HOVER EVENT HANDLER
			handlesEventHover: function() {
				this.$parent.on('mouseenter', $.proxy(this.onEventHoverEnter, this));
				this.$parent.on('mouseleave', $.proxy(this.onEventHoverLeave, this));
			},
			//		HOVER EVENTS
			onEventHoverEnter: function() {
				if(!this.isVisible) {
					this.show();
				}
			},
			onEventHoverLeave: function() {
				if(this.isVisible) {
					this.hide();
				}
			}
		} );


		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );