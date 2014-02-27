/*	VCO.SizeBar
	Draggable component to control size
================================================== */
 
VCO.SizeBar = VCO.Class.extend({
	
	includes: [VCO.Events, VCO.DomMixins],
	
	_el: {},
	
	/*	Constructor
	================================================== */
	initialize: function(elem, parent_elem, options) {
		// DOM ELEMENTS
		this._el = {
			parent: {},
			container: {},
			button_overview: {},
			button_backtostart: {},
			button_collapse_toggle: {},
			arrow: {},
			line: {},
			coverbar: {},
			grip: {}
		};
		
		this.collapsed = false;
		
		if (typeof elem === 'object') {
			this._el.container = elem;
		} else {
			this._el.container = VCO.Dom.get(elem);
		}
		
		if (parent_elem) {
			this._el.parent = parent_elem;
		}
	
		//Options
		this.options = {
			width: 					600,
			height: 				600,
			duration: 				1000,
			ease: 					VCO.Ease.easeInOutQuint,
			sizebar_default_y: 		0
		};
		
		// Draggable
		this._draggable = {};
		
		// Animation
		this.animator = {};
		
		// Merge Data and Options
		VCO.Util.mergeData(this.options, options);
		
		this._initLayout();
		this._initEvents();
	},
	
	/*	Public
	================================================== */
	show: function(d) {
		
		var duration = this.options.duration;
		if (d) {
			duration = d;
		}
		
		this.animator = VCO.Animate(this._el.container, {
			top: 		this.options.sizebar_default_y + "px",
			duration: 	duration,
			easing: 	VCO.Ease.easeOutStrong
		});
	},
	
	hide: function(top) {
		this.animator = VCO.Animate(this._el.container, {
			top: 		top,
			duration: 	this.options.duration,
			easing: 	VCO.Ease.easeOutStrong
		});
	},
	
	setSticky: function(y) {
		this.options.sizebar_default_y = y;
	},
	
	/*	Color
	================================================== */
	setColor: function(inverted) {
		if (inverted) {
			this._el.container.className = 'vco-sizebar vco-sizebar-inverted';
		} else {
			this._el.container.className = 'vco-sizebar';
		}
	},
	
	/*	Update Display
	================================================== */
	updateDisplay: function(w, h, a, l) {
		this._updateDisplay(w, h, a, l);
	},
	

	/*	Events
	================================================== */
	
	_onMouseClick: function() {
		this.fire("clicked", this.options);
	},
	_onDragStart: function(e) {
		
	},
	_onDragMove: function(e) {
		var top_pos = e.new_pos.y;
		this.fire("move", {y:top_pos});
	},
	_onMomentum: function(e) {
		var top_pos = e.new_pos.y ;
		if (top_pos < this.options.sizebar_default_y) {
			this._draggable.stopMomentum();
			if (e.direction == "down") {
				this.show();
				this.fire("momentum", {y:this.options.sizebar_default_y});
			} else {
				this.hide(25);
				this.fire("momentum", {y:1});
			}
		} else {
			this.fire("momentum", {y:top_pos});
		}
	},
	_onDragEnd: function(e) {
		
	},
	_onSwipeUp: function(e) {
		var top_pos = e.new_pos.y;
		this._draggable.stopMomentum();
		if (top_pos > this.options.sizebar_default_y) {
			this.show();
			this.fire("momentum", {y:this.options.sizebar_default_y});
		} else {
			this.hide(25);
			this.fire("swipe", {y:1});
		}
	},
	
	_onSwipeDown: function(e) {
		this._draggable.stopMomentum();
		this.show();
		this.fire("swipe", {y:this.options.sizebar_default_y});
		
	},
	
	_onButtonOverview: function(e) {
		this.fire("overview", e);
	},
	
	_onButtonBackToStart: function(e) {
		this.fire("back_to_start", e);
	},
	
	_onButtonCollapseMap: function(e) {
		if (this.collapsed) {
			this.collapsed = false;
			this.show();
			this._el.button_overview.style.display = "inline";
			this.fire("swipe", {y:this.options.sizebar_default_y});
			if (VCO.Browser.mobile) {
				this._el.button_collapse_toggle.innerHTML	= "<span class='vco-icon-arrow-up'></span>";
			} else {
				this._el.button_collapse_toggle.innerHTML	= VCO.Language.buttons.collapse_toggle + "<span class='vco-icon-arrow-up'></span>";
			}
		} else {
			this.collapsed = true;
			this.hide(25);
			this._el.button_overview.style.display = "none";
			this.fire("swipe", {y:1});
			if (VCO.Browser.mobile) {
				this._el.button_collapse_toggle.innerHTML	= "<span class='vco-icon-arrow-down'></span>";
			} else {
				this._el.button_collapse_toggle.innerHTML	= VCO.Language.buttons.uncollapse_toggle + "<span class='vco-icon-arrow-down'></span>";
			}
		}
	},
	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		// Create Layout
		this._el.arrow						= VCO.Dom.create("div", "vco-arrow-up", this._el.container);
		this._el.container.style.top		= 0 + "px";
		
		// Buttons
		this._el.button_overview 						= VCO.Dom.create('span', 'vco-sizebar-button', this._el.container);
		VCO.DomEvent.addListener(this._el.button_overview, 'click', this._onButtonOverview, this);
		
		this._el.button_backtostart 					= VCO.Dom.create('span', 'vco-sizebar-button', this._el.container);
		VCO.DomEvent.addListener(this._el.button_backtostart, 'click', this._onButtonBackToStart, this);
		
		this._el.button_collapse_toggle 				= VCO.Dom.create('span', 'vco-sizebar-button', this._el.container);
		VCO.DomEvent.addListener(this._el.button_collapse_toggle, 'click', this._onButtonCollapseMap, this);
		
		if (this.options.map_as_image) {
			this._el.button_overview.innerHTML			= VCO.Language.buttons.overview;
		} else {
			this._el.button_overview.innerHTML			= VCO.Language.buttons.map_overview;
		}
		
		if (VCO.Browser.mobile) {
			
			this._el.button_backtostart.innerHTML		= "<span class='vco-icon-goback'></span>";
			this._el.button_collapse_toggle.innerHTML	= "<span class='vco-icon-arrow-up'></span>";
			this._el.container.setAttribute("ontouchstart"," ");
		} else {
			
			this._el.button_backtostart.innerHTML		= VCO.Language.buttons.backtostart + " <span class='vco-icon-goback'></span>";
			this._el.button_collapse_toggle.innerHTML	= VCO.Language.buttons.collapse_toggle + "<span class='vco-icon-arrow-up'></span>";
		}
		
		if (this.options.layout == "landscape") {
			this._el.button_collapse_toggle.style.display = "none";
		}
		//Make draggable
		
		this._draggable = new VCO.Draggable(this._el.container, {enable:{x:false, y:true}, constraint:{bottom:this.options.height}});
		
		this._draggable.on('dragstart', this._onDragStart, this);
		this._draggable.on('dragmove', this._onDragMove, this);
		this._draggable.on('dragend', this._onDragEnd, this);
		this._draggable.on('swipe_up', this._onSwipeUp, this);
		this._draggable.on('swipe_down', this._onSwipeDown, this);
		this._draggable.on('momentum', this._onMomentum, this);

		this._draggable.enable();
	},
	
	_initEvents: function () {
		
	},
	
	// Update Display
	_updateDisplay: function(width, height, animate, line_height) {
		
		if (width) {
			this.options.width = width;
		}
		if (height) {
			this.options.height = height;
		}
		
		// Update draggable constraint
		this._draggable.updateConstraint({bottom:this.options.height - this._el.container.offsetHeight });
		
		this._el.container.style.width = this.options.width + "px";
		this._el.arrow.style.left = ((this.options.width/2) - 17) + "px";
	}
	
});