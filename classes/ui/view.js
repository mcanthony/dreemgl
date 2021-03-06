/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class('$system/base/node', function(require){
	var Animate = require('$system/base/animate')
	var FlexLayout = require('$system/lib/layout')
	var Shader = this.Shader = require('$system/platform/$platform/shader$platform')
	
	var view = this.constructor

	this.attributes = {
		// a simple boolean to turn visibility of a node on or off
		visible: Config({type:boolean, value: true}),

		// pos(ition) of the view, relative to parent. For 2D only the first 2 components are used, for 3D all three.
		pos: Config({type:vec3, value:vec3(0,0,0),meta:"xyz"}),

		// alias for the x component of pos
		x: Config({alias:'pos', index:0}),
		// alias for the y component of pos
		y: Config({alias:'pos', index:1}),
		// alias for the z component of pos
		z: Config({alias:'pos', index:2}),

		// alias for the x component of pos
		left: Config({alias:'pos', index:0}),
		// alias for the y component of pos
		top: Config({alias:'pos', index:1}),
		// alias for the z component of pos
		front: Config({alias:'pos', index:2}),

		// the bottom/right/rear corner 
		corner: Config({type:vec3, value:vec3(NaN)}),
		// alias for the x component of corner
		right: Config({alias:'corner', index:0}),
		// alias for  y component of corner
		bottom: Config({alias:'corner',index:1}),
		// alias for z component of corner
		rear: Config({alias:'corner', index:2}),

		// the background color of a view, referenced by various shaders
		bgcolor: Config({group:"style", type:vec4, value: vec4('white'), meta:"color"}),
		// the background image of a view. Accepts a string-url or can be assigned a require('./mypic.png')
		bgimage: Config({group:"style",type:Object, meta:"texture"}),
		// the opacity of the image
		opacity: Config({group:"style", value: 1.0, type:float}),

		// the clear color of the view when it is in '2D' or '3D' viewport mode
		clearcolor: Config({group:"style",type:vec4, value: vec4('transparent'), meta:"color"}),
		
		// the scroll position of the view matrix, allows to scroll/move items in a viewport. Only works on a viewport:'2D'
		// this property is manipulated by the overflow:'SCROLL' scrollbars
		scroll: Config({type:vec2, value:vec2(0, 0), persist: true}),
		// the zoom factor of the view matrix, allows zooming of items in a viewport. Only works on viewport:'2D'
		zoom: Config({type:float, value:1}),
		// overflow control, shows scrollbars when the content is larger than the viewport. Only works on viewport:'2D'
		// works the same way as the CSS property
		overflow: Config({type: Enum('','hidden','scroll','auto'), value:''}),

		// size, this holds the width/height/depth of the view. When set to NaN it means the layout engine calculates the size
		size: Config({type:vec3, value:vec3(NaN), meta:"xyz"}),

		// alias for the x component of size
		w: Config({alias:'size', index:0}),
		// alias for the y component of size
		h: Config({alias:'size', index:1}),
		// alias for the z component of size
		d: Config({alias:'size', index:2}),
		
		// alias for the x component of size
		width: Config({alias:'size', index:0}),
		// alias for the y component of size
		height: Config({alias:'size', index:1}),
		// alias for the z component of size
		depth: Config({alias:'size', index:2}),

		// the pixelratio of a viewport. Allows scaling the texture buffer to arbitrary resolutions. Defaults to the system (low/high DPI)
		pixelratio: Config({type: float, value:NaN}),

		// the minimum size for the flexbox layout engine
		minsize: Config({type: vec3, value:vec3(NaN), meta:"xyz"}),
		// the maximum size for the flexbox layout engine
		maxsize: Config({type: vec3, value:vec3(NaN), meta:"xyz"}),

		// alias for the x component of minsize
		minwidth: Config({alias:'minsize', index:0}),
		// alias for the y component of minsize
		minheight: Config({alias:'minsize', index:1}),
		// alias for the z component of minsize
		mindepth: Config({alias:'minsize', index:2}),

		// alias for the x component of maxsize
		maxwidth: Config({alias:'maxsize', index:0}),
		// alias for the y component of maxsize
		maxheight: Config({alias:'maxsize', index:1}),
		// alias for the z component of maxsize
		maxdepth: Config({alias:'maxsize', index:2}),

		// the margin on 4 sides of the box (left, top, right, bottom). Can be assigned a single value to set them all at once
		margin: Config({type: vec4, value: vec4(0,0,0,0), meta: "ltrb"}),
		// alias for the first component of margin
		marginleft: Config({alias:'margin', index:0}),
		// alias for the second component of margin
		margintop: Config({alias:'margin', index:1}),
		// alias for the third component of margin
		marginright: Config({alias:'margin', index:2}),
		// alias for the fourth component of margin
		marginbottom: Config({alias:'margin', index:3}),

		// the padding on 4 sides of the box (left, top, right, bottom) Can be assigned a single value to set them all at once
		padding: Config({type: vec4, value: vec4(0,0,0,0), meta: "ltrb"}),
		// alias for the first component of padding
		paddingleft: Config({alias:'padding', index:0}),
		// alias for the second component of padding
		paddingtop: Config({alias:'padding', index:1}),
		// alias for the third component of padding
		paddingright: Config({alias:'padding', index:2}),
		// alias for the fourth component of padding
		paddingbottom: Config({alias:'padding', index:3}),

		// Scale of an item, only useful for items belof a 3D viewport
		scale: Config({type: vec3, value: vec3(1), meta:"xyz"}),
		// The anchor point around which items scale and rotate, depending on anchor mode its either a factor of size or and absolute value
		anchor: Config({type: vec3, value: vec3(0.)}),
		// the mode with which the anchor is computed. Factor uses the size of an item to find the point, defaulting to center
		anchormode: Config({type:Enum('','factor','absolute'), value:'factor'}),
		// rotate the item around x, y or z in radians. If you want degrees type it like this: 90*DEG
		rotate: Config({type: vec3, value: vec3(0), meta:"xyz"}),

		// the color of the border of an item. 
		bordercolor: Config({group:"style",type: vec4, value: vec4(0,0,0,0), meta:"color"}),

		// the radius of the corners of an item, individually settable left, top, right, bottom. Setting this value will switch to rounded corner shaders
		borderradius: Config({group:"style",type: vec4, value: vec4(0,0,0,0)}),

		// the width of the border. Setting this value will automatically enable the border shaders
		borderwidth: Config({group:"style",type: vec4, value: vec4(0,0,0,0)}),

		// alias for the first component of borderwidth
		borderleftwidth: Config({alias:'borderwidth', index:0}),
		// alias for the second component of borderwith
		bordertopwidth: Config({alias:'borderwidth', index:1}),
		// alias for the third component of borderwith
		borderrightwidth: Config({alias:'borderwidth', index:2}),
		// alias for the fourth component of borderwith
		borderbottomwidth: Config({alias:'borderwidth', index:3}),

		// turn on flex sizing. Flex is a factor that distributes either the widths or the heights of nodes by this factor
		// flexbox layout is a web standard and has many great tutorials online to learn how it works
		flex: Config({group:"layout", type: float, value: NaN}),

		// wraps nodes around when the flexspace is full
		flexwrap: Config({group:"layout", type: Enum('wrap','nowrap'), value: "wrap"}),	
		// which direction the flex layout is working,
		flexdirection: Config({group:"layout", type: Enum('row','column'), value: "row"}),
		// pushes items eitehr to the start, center or end
		justifycontent: Config({group:"layout", type: Enum('','flex-start','center','flex-end','space-between','space-around'), value: ""}), 
		// align items to either start, center, end or stretch them
		alignitems: Config({group:"layout", type: Enum('flex-start','center','flex-end','stretch'), value:"stretch"}),  
		// overrides the parents alignitems with our own preference
		alignself: Config({group:"layout", type: Enum('flex-start','center','flex-end','stretch'), value:"stretch"}),  
		// item positioning, if absolute it steps 'outside' the normal flex layout 
		position: Config({group:"layout", type:  Enum('relative','absolute'), value: "relative" }),	

		// the layout object, contains width/height/top/left after computing. Its a read-only property and should be used in shaders only.
		// Can be listened to to observe layout changes
		layout: Config({ type:Object, value:{}, meta:"hidden"}),

		// When set to 2D or 3D the render engine will create a separate texture pass for this view and all its children
		// using a 2D viewport is a great way to optimize render performance as when nothing changes, none of the childstructures
		// need to be processed and a single texture can just be drawn by the parent
		// the viewportblend shader can be used to render this texture it into its parent
		viewport: Config({group:"layout", type:Enum('','2d','3d'), value:''}),
		
		// the field of view of a 3D viewport. Only useful on a viewport:'3D'
		fov: Config({group:"3d", type:float, value: 45}),
		// the nearplane of a 3D viewport, controls at which Z value near clipping start. Only useful on a viewport:'3D'
		nearplane: Config({group:"3d",type:float, value: 0.001}),
		// the farplane of a 3D viewport, controls at which Z value far clipping start. Only useful on a viewport:'3D'
		farplane: Config({group:"3d",type:float, value: 1000}),
		
		// the position of the camera in 3D space. Only useful on a viewport:'3D'
		camera: Config({group:"3d",type: vec3, value: vec3(-2,2,-2)}),
		// the point the camera is looking at in 3D space. Only useful on a viewport:'3D'
		lookat: Config({group:"3d",type: vec3, value: vec3(0)}),
		// the up vector of the camera (which way is up for the camera). Only useful on a viewport:'3D'
		up: Config({group:"3d",type: vec3, value: vec3(0,-1,0)}),
		
		// the current time which can be used in shaders to create continous animations
		time:Config({meta:"hidden", value:0}),

		// fired when the mouse doubleclicks
		mousedblclick: Config({type:Event}),
		// fires when the mouse moves 'out' of the view. The event argument is the mouse position as {local:vec2}
		mouseout: Config({type:Event}),
		// fires when the mouse moves over the view. The event argument is the mouse position as {local:vec2}
		mouseover: Config({type:Event}),
		// fires when the mouse moves. The event argument is the mouse position as {local:vec2}
		mousemove: Config({type:Event}),
		// fires when the left mouse button is down. The event argument is the mouse position as {local:vec2}
		mouseleftdown: Config({type:Event}),
		// fires when the left mouse button is up. The event argument is the mouse position as {local:vec2}
		mouseleftup: Config({type:Event}),
		// fires when the right mouse button is down. The event argument is the mouse position as {local:vec2}
		mouserightdown: Config({type:Event}),
		// fires when the right mouse button is up. The event argument is the mouse position as {local:vec2}
		mouserightup: Config({type:Event}),
		// fires when the mouse wheels x coordinate changes, also for 2 finger scroll on mac. The event argument is {wheel:float, local:vec2}
		mousewheelx: Config({type:Event}),
		// fires when the mouse wheels y coordinate changes, alsof or 2 finger scroll on mac. The event argument is {wheel:float, local:vec2}
		mousewheely: Config({type:Event}),
		// fires when pinchzoom is used in chrome, or when meta-mouse wheel is used (under review). The event argument is the mouse position as {zoom:float, local:vec2}
		mousezoom: Config({type:Event}),

		// fires when a key goes to up. The event argument is {repeat:int, code:int, name:String}
		keyup: Config({type:Event}),
		// fires when a key goes to down. The event argument is {repeat:int, code:int, name:String}
		keydown: Config({type:Event}),
		// fires when a key gets pressed. The event argument is {repeat:int, value:string, char:int}
		keypress: Config({type:Event}),
		// fires when someone pastes data into the view. The event argument is {text:string}
		keypaste: Config({type:Event}),
		// wether this view has focus
		miss: Config({type:Event}),

		
		// drop shadow size
		dropshadowradius:Config({type:float, value:20}),
		// drop shadow movement
		dropshadowoffset:Config({type:vec2, value:vec2(0,0)}),
		// drop shadow hardness
		dropshadowhardness:Config({type:float, value:0.5, minvalue: 0, maxvalue:1}),
		// drop shadow opacity
		dropshadowopacity:Config({type:float, value:0, minvalue: 0, maxvalue:1}),
		// drop shadow color
		dropshadowcolor:Config({type:vec4,meta:"color", value:vec4("black")}),

		focus: false,
		// tabstop, sorted by number
		tabstop: NaN,

		cursor: Config({type:Enum(
			'', 'arrow', 'none','wait','text','pointer',
			'zoom-in','zoom-out','grab','grabbing',
			'ns-resize','ew-resize','nwse-resize','nesw-resize',
			'w-resize','e-resize','n-resize','s-resize',
			'nw-resize','ne-resize','sw-resize','se-resize',
			'help','crosshair','move',
			'col-resize','row-resize',
			'vertical-text','context-menu','no-drop','not-allowed',
			'alias','cell','copy'
		), value:''}),
	}

	this.visible = this.camera = this.lookat = this.up = function(){this.redraw();};
	this.boundscheck = true
	// the local matrix	
	this.modelmatrix = mat4.identity()
	// the concatenation of all parent model matrices
	this.totalmatrix = mat4.identity()
	// the last view matrix used
	this.viewmatrix = mat4.identity()
	// the viewport matrix used to render the viewportblend
	this.viewportmatrix = mat4.identity()
	// the normal matrix contains the transform without translate (for normals)
	this.normalmatrix = mat4.identity()

	// forward references for shaders
	this.layout = {width:0, height:0, left:0, top:0, right:0, bottom:0}
	this.device = {size:vec2(), frame:{size:vec2()}}

	// turn off rpc proxy generation for this prototype level
	this.rpcproxy = false

	
	this.dropshadowradius= function(event){
		if (this.dropshadowopacity > 0){
			this.shadowrect = true;
		}else{
			this.shadowrect = false;
		}
	}

	// listen to switch the shaders when borderradius changes
	this.borderradius = function(event){
		var value = event.value
		if(typeof value === 'number' && value !== 0 || value[0] !== 0 || value[1] !== 0 || value[2] !== 0 || value[3] !== 0){
			// this switches the bg shader to the rounded one
			this.bg = this.roundedrect
			this.border = this.roundedborder
		}
		else {
			this.bg = this.hardrect
			this.border = this.hardborder
		}
		if(this._borderwidth[0] === 0 && this._borderwidth[1] === 0 && this._borderwidth[2] === 0 && this._borderwidth[3] === 0) this.border = false
	}

	// listen to switch shaders when border width changes
	this.borderwidth = function(event){
		var value = event.value
		if(typeof value === 'number' && value !== 0 || value[0] !== 0 || value[1] !== 0 || value[2] !== 0 || value[3] !== 0){
			// turn it on by assigning an order number
			this.border = true
		}
		else this.border = false
		this.relayout()
	}

	// listen to the viewport to turn off our background and border shaders when 3D
	this.viewport = function(event){
		if(event.value === '3d'){
			this.bg = false
			this.border = false
		}
	}

	// automatically turn a viewport:'2D' on when we  have an overflow (scrollbars) set
	this.overflow = function(){
		if(this._overflow){
			if(!this._viewport) this._viewport = '2d'
		}
	}

	// setting focus to true
	this.focus = function(event){
		if(!event.mark){ // someone set it to true that wasnt us
			this.screen.setFocus(this)
		}
	}

	// put a tablistener
	this.tabstop = function(event){
		if(isNaN(event.old) && !isNaN(event.value)){
			this.addListener('keydown', function(value){
				if(value.name === 'tab'){
					if(value.shift) this.screen.focusPrev(this)
					else this.screen.focusNext(this)
				}
			})
		}
	}

	// returns the mouse in local coordinates
	this.localMouse = function(){
		return vec2(this.screen.remapMouse(this))
	}

	// draw dirty is a bitmask of 2 bits, the guid-dirty and the color-dirty
	this.draw_dirty = 3
	// layout dirty causes a relayout to occur (only on viewports)
	this.layout_dirty = true
	// update dirty causes a shader update to occur
	this.update_dirty = true
	// update matrix stack
	this.matrix_dirty = true

	// initialization of a view
	this.init = function(prev){

		this.anims = {}
		//this.layout = {width:0, height:0, left:0, top:0, right:0, bottom:0}
		this.shader_list = []
		this.was_initialized = true
		if(prev){
			this.modelmatrix = prev.modelmatrix
			this.totalmatrix = prev.totalmatrix
			this.viewportmatrix = prev.viewportmatrix
		}
		else{
			this.modelmatrix = mat4()
			if(this._viewport) this.totalmatrix = prev? prev.totalmatrix: mat4.identity()
			else this.totalmatrix = prev? prev.totalmatrix: mat4()
			this.viewportmatrix = prev? prev.viewportmatrix: mat4()
		}

		if(this._bgimage){
			// set the bg shader
			this.bg = this.hardimage
		}
		// create shaders
	
		for(var key in this.shader_enable){
			var enable = this.shader_enable[key]
			if(!enable) continue
			var shader = this[key]
			if(shader){
				var shname = key + 'shader'
				var prevshader = prev && prev[shname]
				var shobj
				// ok so instead of comparing constructor, lets compare the computational result
//				if(prevshader && prevshader.constructor !== shader) console.log(shader)
				if(prevshader && (prevshader.constructor === shader || prevshader.isShaderEqual(shader.prototype, this, prev))){
					shobj = prevshader
					shobj.constructor = shader
					shobj.view = this
					shobj.outer = this
					// ok now check if we need to dirty it

					if(shobj._view_listeners) for(var shkey in shobj._view_listeners){

						this.addListener(shkey, shobj.reupdate.bind(shobj))
						var value = this[shkey]

						if(!(value && value.struct && value.struct.equals(value, prev[shkey]) || value === prev[shkey])){
							shobj.reupdate(shkey)
						}
					}
				}
				else{
					shobj = new shader(this)
				}
				this[shname] = shobj
				shobj.shadername = shname
				this.shader_list.push(shobj)
			}
		}

		if(this._bgimage){
			// Assume image was loaded via require (a Texture.Image object)
			var image = this._bgimage;
			if(typeof this._bgimage === 'string'){
				// Path to image was specified
				image = new Shader.Texture.Image(this._bgimage);
			}

			var img = this.bgshader.texture = Shader.Texture.fromImage(image);
			if(isNaN(this._size[0])){
				this._size = img.size
				this.relayout()
			}
			else this.redraw()
		}

		//if(this.debug !== undefined && this.debug.indexOf('shaderlist') !== -1){
		//	console.log(this.shader_order)
		//}

		if(this._viewport){
			if(this.bgshader) this.bgshader.noscroll = true
			if(this.bordershader) this.bordershader.noscroll = true
			this.viewportblendshader = new this.viewportblend(this)
		}

		this.sortShaders()
	}

	// emit an event upward (to all parents) untill a listener is hit
	this.emitUpward = function(key, msg){
		if(this['_listen_'+key] || this['on'+key]){
			this.emit(key, msg)
			return this
		}
		if(this.parent) return this.parent.emitUpward(key, msg)
	}
	
	this.findEmitUpward = function(key){
		if(this['_listen_'+key] || this['on'+key]){
			return this
		}
		if(this.parent) return this.parent.findEmitUpward(key)
	}

	this.computeCursor = function(){
		var node = this
		while(node){
			if(node._cursor !== ''){
				this.screen.mouse.cursor = node._cursor
				break
			}
			node = node.parent
		}
	}

	// called at every frame draw
	this.atDraw = function(){
		if(this.debug !== undefined && this.debug.indexOf('atdraw')!== -1) console.log(this)
	}

	// internal, sorts the shaders
	this.sortShaders = function(){
		
		this.shader_draw_list = this.shader_list.slice(0).sort(function(a, b){
			return this[a.shadername].draworder > this[b.shadername].draworder
		}.bind(this))

		this.shader_update_list = this.shader_list.slice(0).sort(function(a, b){
			return this[a.shadername].updateorder > this[b.shadername].updateorder
		}.bind(this))
		//console.log(this.shader_draw_list)
	}


	// custom hook in the inner class assignment to handle nested shaders specifically
	this.atInnerClassAssign = function(key, value){

		if(!this.hasOwnProperty('shader_enable')) this.shader_enable = Object.create(this.shader_enable || {})

		// set the shader order
		if(!value || typeof value === 'number' || typeof value === 'boolean'){
			this.shader_enable[key] = value? true: false
			return 
		}

		// its a class assignment
		if(typeof value === 'function' && Object.getPrototypeOf(value.prototype) !== Object.prototype){
			this['_' + key] = value
			return
		}

		// its inheritance
		var cls = this['_' + key]
		this['_' + key] = cls.extend(value, this)
	}

	// redraw our view and bubble up the viewport dirtiness to the root
	this.redraw = function(){
		if(!this.parent_viewport || this.parent_viewport.draw_dirty === 3) return
		var parent = this
		while(parent){
			var viewport = parent.parent_viewport
			if(!viewport) break
			if(viewport.draw_dirty === 3) return
			viewport.draw_dirty = 3
			parent = viewport.parent
		}
		if(this.device && this.device.redraw) this.device.redraw()
	}
	
	// updates all the shaders
	this.reupdate = function(){
		var shaders = this.shader_list
		if(shaders) for(var i = 0; i < shaders.length; i++){
			shaders[i].reupdate()
		}
	}

	this.getViewGuid = function(){
		if(this.viewguid) return this.viewguid
		if(this.pickguid){
			this.viewguid = '' +this.pickguid
		}
		var node = this, id = ''
		while(node){
			if(node.parent) id += node.parent.children.indexOf(node)
			node = node.parent
		}
		return this.viewguid = id
	}

	// this gets called by the render engine
	this.updateShaders = function(){
		if(!this.update_dirty) return
		this.update_dirty = false
		// we can wire up the shader 
		if(!this._shaderswired){
			this.atAttributeGet = function(attrname){
				//if(this.constructor.name === 'label')
				//console.log(this.constructor.name, attrname, this['_'+attrname])
				// monitor attribute wires for geometry
				// lets add a listener 
				if(!shader._view_listeners) shader._view_listeners = {}
				shader._view_listeners[attrname] = 1

				this.addListener(attrname,shader.reupdate.bind(shader, attrname))

			}.bind(this)
		}


		var shaders = this.shader_update_list
		for(var i = 0; i < shaders.length; i ++){
			var shader = shaders[i]
			if(shader.update && shader.update_dirty){
				shader.update_dirty = false				
				shader.update()
			}
		}
	
		if(!this._shaderswired) {
			this._shaderswired = true
			this.atAttributeGet = undefined
		}
	}


	// decide to inject scrollbars into our childarray
	this.atRender = function(){
		if(this._viewport === '2d' && (this._overflow === 'scroll'|| this._overflow === 'auto')){
			if(this.vscrollbar) this.vscrollbar.value = 0
			if(this.hscrollbar) this.hscrollbar.value = 0

			this.scroll = function(event){
				if(event.mark) return
				if(this.vscrollbar){
					this.vscrollbar.value = Mark(event.value[1]) 
				}
				if(this.hscrollbar){
					this.hscrollbar.value = Mark(event.value[0]) 
				}
			}

			this.children.push(
				this.vscrollbar = this.scrollbar({
					position:'absolute',
					vertical:true,
					noscroll:true,
					value:function(event){
						if(event.mark) return
						this.parent.scroll = Mark(vec2(this.parent._scroll[0],this._value))
					},
					layout:function(){
						var parent_layout = this.parent.layout
						var this_layout = this.layout
						this_layout.top = 0
						this_layout.width = 10
						this_layout.height = parent_layout.height
						this_layout.left = parent_layout.width - this_layout.width
					}
				}),
				this.hscrollbar = this.scrollbar({
					position: 'absolute',
					vertical: false,
					noscroll: true,
					value: function(event){
						if(event.mark) return
						this.parent.scroll = Mark(vec2(this._value,this.parent._scroll[1]))
					},
					layout: function(){
						var parent_layout = this.parent.layout
						var this_layout = this.layout
						this_layout.left = 0
						this_layout.height = 10
						this_layout.width = parent_layout.width
						this_layout.top = parent_layout.height - this_layout.height
					}
				})
			)
			
			if(this.hscrollbar) this.hscrollbar.value = Mark(this._scroll[0])
			if(this.vscrollbar) this.vscrollbar.value = Mark(this._scroll[1])

			this.mousewheelx = function(event){
				var wheel = event.wheel
				if(this.hscrollbar._visible){
					this.hscrollbar.value = clamp(this.hscrollbar._value + wheel, 0, this.hscrollbar._total - this.hscrollbar._page)
				}
			}

			this.mousewheely = function(event){
				var wheel = event.wheel
				if(this.vscrollbar._visible){
					this.vscrollbar.value = clamp(this.vscrollbar._value + wheel, 0, this.vscrollbar._total - this.vscrollbar._page)
				}
			}

			this.mousezoom = function(event){
				var zoom = event.zoom
				var lastzoom = this._zoom
				var newzoom = clamp(lastzoom * (1+0.03 * zoom),0.01,10)
				this.zoom = newzoom
				
				var pos = this.localMouse()

				var shiftx = pos[0] * lastzoom - pos[0] * this._zoom
				var shifty = pos[1] * lastzoom - pos[1] * this._zoom 
 				
				this.hscrollbar.value = clamp(this.hscrollbar._value + shiftx, 0, this.hscrollbar._total - this.hscrollbar._page)
				this.vscrollbar.value = clamp(this.vscrollbar._value + shifty, 0, this.vscrollbar._total - this.vscrollbar._page)

				this.updateScrollbars()
				this.redraw()
			}
		}
	}
	
	// show/hide scrollbars
	this.updateScrollbars = function(){

		if(this.vscrollbar){
			var scroll = this.vscrollbar
			var totalsize = Math.floor(this.layout.boundh), viewsize = Math.floor(this.layout.height * this.zoom)
			if(totalsize > viewsize+1){
				scroll._visible = true
				scroll._total = totalsize
				scroll._page = viewsize
				var off = clamp(scroll._value,0, scroll._total - scroll._page)
				if(off !== scroll._value) scroll.value = off
			}
			else{
				if(0 !== scroll._offset){
					scroll.value = 0
				}
				scroll._visible = false
			}
		}
		if(this.hscrollbar){
			var scroll = this.hscrollbar
			var totalsize = Math.floor(this.layout.boundw), viewsize = Math.floor(this.layout.width* this.zoom)
			if(totalsize > viewsize + 1){
				scroll._visible = true
				scroll._total = totalsize
				scroll._page = viewsize
				var off = clamp(scroll._value,0, scroll._total - scroll._page)
				if(off !== scroll._value) scroll.value = off
			}
			else{
				if(0 !== scroll._value) scroll.value = 0
				scroll._visible = false
			}
		}
	}

	// called by doLayout, to update the matrices to layout and parent matrix
	this.updateMatrices = function(parentmatrix, parentviewport, parent_changed, boundsinput){
		// allow pre-matrix gen hooking
		if(this.atMatrix) this.atMatrix()

		var boundsobj = boundsinput
		if(!boundsinput){
			boundsobj = this._layout
			boundsobj.absx = 0
			boundsobj.absy = 0
			boundsobj.boundw = 0
			boundsobj.boundh = 0
		}

		var layout = this._layout

		if(this.measured_width !== undefined || this.measured_height !== undefined){
			var width = layout.absx + max(layout.width ,this.measured_width)
			var height = layout.absy + max(layout.height, this.measured_height)
		}
		else{
			var width = layout.absx + layout.width
			var height = layout.absy + layout.height
		}
		if(width > boundsobj.boundw) boundsobj.boundw = width
		if(height > boundsobj.boundh) boundsobj.boundh = height
	

		var matrix_changed = parent_changed
		if (parentviewport == '3d'){// && !this._mode ){	
			matrix_changed = true
			mat4.TSRT2(this.anchor, this.scale, this.rotate, this.pos, this.modelmatrix);
		}
		else {
			
			// compute TSRT matrix
			if(layout){
				//console.log(this.matrix_dirty)
				var ml = this.matrix_layout
				if(!ml || ml.left != layout.left || ml.top !== layout.top || 
					ml.width !== layout.width || ml.height !== layout.height){
					this.matrix_layout = {
						left:layout.left,
						top:layout.top,
						width:layout.width,
						height:layout.height
					}

					matrix_changed = true
					var s = this._scale
					var r = this._rotate
					var t0 = layout.left, t1 = layout.top, t2 = 0
					//if(this.name === 'handle') console.log(this.constructor.name, layout.top)
					//var hw = (  this.layout.width !== undefined ? this.layout.width: this._size[0] ) / 2
					//var hh = ( this.layout.height !== undefined ? this.layout.height: this._size[1]) / 2
					var hw = layout.width / 2
					var hh = layout.height / 2
					mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], r[0], r[1], r[2], t0 + hw * s[0], t1 + hh * s[1], t2, this.modelmatrix);
				}
			}
			else {
				matrix_changed = true
				var s = this._scale
				var r = this._rotate
				var t = this._translate
				var hw = this._size[0] / 2
				var hh = this._size[1] / 2
				mat4.TSRT(-hw, -hh, 0, s[0], s[1], s[2], 0, 0, r[2], t[0] + hw * s[0], t[1] + hh * s[1], t[2], this.modelmatrix);
			}
		}

		if(this._viewport){

			if(parentmatrix) {
				mat4.mat4_mul_mat4(parentmatrix, this.modelmatrix, this.viewportmatrix)
			}
			else{
				this.viewportmatrix = this.modelmatrix
			}
			this.totalmatrix = mat4.identity();
			parentmode = this._viewport;
			parentmatrix = mat4.identity();
		}
		else{
			if(parentmatrix && matrix_changed) mat4.mat4_mul_mat4(parentmatrix, this.modelmatrix, this.totalmatrix)
		}
		
		var children = this.children
		if(children) for(var i = 0; i < children.length; i++){
			var child = children[i]
			if(child._viewport) continue // it will get its own pass
			
			var clayout = child.layout
			clayout.absx = layout.absx + clayout.left 
			clayout.absy = layout.absy + clayout.top

			child.updateMatrices(this.totalmatrix, parentmode, matrix_changed, boundsobj)
		}
		
		if(!boundsinput){
			this.updateScrollbars()
		}

		this.matrix_dirty = false
	}

	// emit post layout
	function emitPostLayout(node, nochild){
		var ref = node.ref
		var oldlayout = ref.oldlayout || {}
		var layout = ref._layout 

		if(!nochild){
			var children = node.children
			for(var i = 0; i < children.length; i++){
				var child = children[i]
				emitPostLayout(child, child.ref._viewport)
			}
			ref.layout_dirty = false
		}

		var oldlayout = ref.oldlayout || {}
		if((ref._listen_layout || ref.onlayout) && (layout.left !== oldlayout.left || layout.top !== oldlayout.top ||
			 layout.width !== oldlayout.width || layout.height !== oldlayout.height)){
			ref.emit('layout', {type:'setter', owner:ref, key:'layout', value:layout})
		}
		ref.oldlayout = layout
		ref.matrix_dirty = true
	}

	// cause this node, all childnodes and relevant parent nodes to relayout

	this.relayoutRecur = function(source){
		this.layout_dirty = true
		this.draw_dirty = 3 // bitmask, 2 = pick, 1= color
		for(var i = 0;i < this.child_viewport_list.length;i++){
			var child = this.child_viewport_list[i]
			//if(child._overflow) continue
			if(child !== source){
				child.relayoutRecur()
			}
		}
		if(this.parent_viewport !== this){
			if(this.parent_viewport._overflow) return
			this.parent_viewport.relayoutRecur(this)
		}
	}

	// ok so. what we need to do is
	// scan up towards overflow something
	// scan down and skip overflow something.

	this.relayout = function(shallow){
		this.layout_dirty = true
		this.redraw()
		if(this.parent_viewport) this.parent_viewport.relayoutRecur()
	}

	this.rematrix = function(){
		this.matrix_dirty = true
		if(this.parent_viewport){
			this.parent_viewport.matrix_dirty = true
			this.redraw()
		}
	}

	// moving a position in absolute should only trigger a matrix reload
	this.pos = function(){
		if(this._position === 'absolute'){
			this._layout.left = this._pos[0]
			this._layout.top = this._pos[1]
			this.rematrix()
		}
		else{
			this.relayout()
		}
	}

	this.corner =
	this.size =
	this.minsize =
	this.maxsize = 
	this.margin =
	this.padding =
	this.flex =
	this.flexwrap =
	this.flexdirection =
	this.justifycontent =
	this.alignitems =
	this.alignself =
	this.position =
	this.relayout

	// called by the render engine
	this.doLayout = function(){

		if(this.parent && !isNaN(this._flex)){ // means our layout has been externally defined
	
			var layout = this._layout
			var flex = this._flex
			var size = this._size
			var flexwrap = this._flexwrap
			this._flex = 1
			this._size = vec2(layout.width, layout.height)
			this._flexwrap = false

			if(this.measure) this.measure() // otherwise it doesnt get called

			var copynodes = FlexLayout.fillNodes(this)
			FlexLayout.computeLayout(copynodes)
			
			//this.sublayout = this.layout
			this._flex = flex
			this._size = size
			this._flexwrap = flexwrap
			this._layout = layout
			emitPostLayout(copynodes)
		}
		else{
			var copynodes = FlexLayout.fillNodes(this)
			FlexLayout.computeLayout(copynodes)
			emitPostLayout(copynodes)
		}
	}

	this.startAnimation = function(key, value, track, resolve){
		if(this.screen) return this.screen.startAnimationRoot(this, key, value, track, resolve)
		else{
			return false
	//		this['_' + key] = value
		}
	}

	this.stopAnimation = function(key){
		if(this.screen) this.screen.stopAnimationRoot(this, key)
	}

	this.playAnimation = function(key){
		if(this.screen) this.screen.playAnimationRoot(this, key)
	}

	this.pauseAnimation = function(key){
		if(this.screen) this.screen.pauseAnimationRoot(this, key)
	}

	this.bgcolorfn = function(pos){
		return bgcolor
	}

	// standard bg is undecided
	define.class(this, 'bg', this.Shader, function(){
		this.updateorder = 0
	})
	this.bg = true

	// standard border is undecided too
	define.class(this, 'border', this.Shader, function(){
		this.updateorder = 0
	})
	this.border = false

	define.class(this, 'hardrect', this.Shader, function(){
		this.updateorder = 0
		this.draworder = 0
		this.mesh = vec2.array()
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)
		this.position = function(){
			uv = mesh.xy
			pos = vec2(mesh.x * view.layout.width, mesh.y * view.layout.height)
			return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
		}
		this.color = function(){
			var col = view.bgcolorfn(mesh.xy)
			return vec4(col.rgb, col.a * view.opacity)
		}
	})
	this.hardrect = false


	this.bordercolorfn = function(pos){
		return bordercolor
	}

	define.class(this, 'hardborder', this.Shader, function(){
		this.updateorder = 0
		this.draworder = 1
		this.mesh = vec2.array();
		
		this.update = function(){
			var view = this.view
			var width = view.layout?view.layout.width:view.width
			var height = view.layout?view.layout.height:view.height
			var bw1 = view.borderwidth[0]/width;
			var bw2 = view.borderwidth[1]/width;
			var bw3 = view.borderwidth[2]/height;
			var bw4 = view.borderwidth[3]/height;

			var mesh = this.mesh = vec2.array();
//			console.log(bw, height);

			mesh.pushQuad(0,0, bw1,0,0,1,bw1,1);
			mesh.pushQuad(1-bw2,0, 1,0,1-bw2,1,1,1);
			mesh.pushQuad(0,0, 1,0,0,bw3,1,bw3);
			mesh.pushQuad(0,1-bw4, 1,1-bw4,0,1,1,1);
		}
		
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)
		this.mesh.pushQuad(0,0,1,0,0,1,1,1)

		this.position = function(){
			uv = mesh.xy
			pos = vec2(mesh.x * view.layout.width, mesh.y * view.layout.height)
			return vec4(pos, 0, 1) * view.totalmatrix * view.viewmatrix
		}
		this.color = function(){
			var col = view.bordercolorfn(uv.xy)
			return vec4(col.rgb, col.a * view.opacity);
		}
	})
	this.hardborder = false
	// make rect the default bg shader
	this.bg = this.hardrect

	// hard edged bgimage shader
	define.class(this, 'hardimage', this.hardrect, function(){
		this.updateorder = 0
		this.draworder = 0
		this.texture = Shader.Texture.fromType(Shader.Texture.RGBA)
		this.color = function(){
			var col = this.texture.sample(mesh.xy)
			return vec4(col.rgb, col.a * view.opacity)
		}
	})
	this.hardimage = false

	// rounded rect shader class
	define.class(this, 'roundedrect', this.Shader, function(){
		this.updateorder = 0
		this.draworder = 0
		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,
			uv:vec2
		})

		this.mesh = this.vertexstruct.array()
	
		this.depth_test = ""

		// matrix and viewmatrix should be referenced on view
		this.opacity = 0.0
		this.drawtype = this.TRIANGLE_FAN
		this.color_blend = 'src_alpha * src_color + (1 - src_alpha) * dst_color'
  
		this.update = function(){
			var view = this.view
			var width = view.layout?view.layout.width:view.width
			var height = view.layout?view.layout.height:view.height
			var radius = view.borderradius

			var mesh = this.mesh = this.vertexstruct.array()

			if (vec4.equals(radius, vec4(0,0,0,0))) {
				mesh.push([width/2,height/2], 0, [1,0,0,0], 0.5,0.5)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
				mesh.push([width,0], 0, [1,0,0,0], 1,0)
				mesh.push([width,height], 0, [1,0,0,0], 1,1)
				mesh.push([0,height], 0, [1,0,0,0], 0,1)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
			}
			else{
				
				var divbase = 0.45;
				var pidiv1 = Math.floor(Math.max(2, divbase* PI * radius[0]))
				var pidiv2 = Math.floor(Math.max(2, divbase* PI * radius[1]))
				var pidiv3 = Math.floor(Math.max(2, divbase* PI * radius[2]))
				var pidiv4 = Math.floor(Math.max(2, divbase* PI * radius[3]))
				
				var pimul1 = (PI*0.5)/(pidiv1-1)
				var pimul2 = (PI*0.5)/(pidiv2-1)
				var pimul3 = (PI*0.5)/(pidiv3-1)
				var pimul4 = (PI*0.5)/(pidiv4-1)

				this.mesh.push([width/2,height/2], 0, [0,0,0,0], 0.5,0.5)

				for(var p = 0;p<pidiv1;p++) this.mesh.push(vec2(radius[0] ,radius[0]), p*pimul1, vec4(1,0,0,0), 1,0)	
				for(var p = 0;p<pidiv2;p++) this.mesh.push(vec2(width - radius[1]-1, radius[1]), p*pimul2 + PI/2, vec4(0,1,0,0), 1,0)
				for(var p = 0;p<pidiv3;p++) this.mesh.push(vec2(width - radius[2]-1, height - radius[2]-1), p*pimul3+ PI, vec4(0,0,1,0), 1,1)
				for(var p = 0;p<pidiv4;p++) this.mesh.push(vec2(radius[3], height - radius[3]-1), p*pimul4 + PI + PI/2, vec4(0,0,0,1), 0,1)
				
				this.mesh.push(vec2( radius[0] ,radius[0]), 0, vec4(1,0,0,0), 1,0)
			}	
		}

		this.color = function(){
			var col = view.bgcolorfn(pos.xy)
			return vec4(col.rgb, col.a * view.opacity)
		}

		this.position = function(){
			pos = mesh.pos.xy
			var ca = cos(mesh.angle + PI)
			var sa = sin(mesh.angle + PI)
			
			var rad  = (mesh.radmult.x * view.borderradius.x + mesh.radmult.y * view.borderradius.y + mesh.radmult.z * view.borderradius.z + mesh.radmult.w * view.borderradius.w)
			pos.x += ca * rad
			pos.y += sa * rad
			
			uv = vec2(pos.x/view.layout.width,  pos.y/view.layout.height)
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * view.totalmatrix * view.viewmatrix
		}
	})
	this.roundedrect = false
	
	
	
	// rounded rect shader class
	define.class(this, 'shadowrect', this.Shader, function(){
		this.updateorder = 0
		this.draworder = 0
		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,
			uv:vec2,
			shadowradius: vec4
		})

		this.mesh = this.vertexstruct.array()
	
		this.depth_test = ""
		this.draworder = -1;

		// matrix and viewmatrix should be referenced on view
		this.opacity = 0.0
		this.drawtype = this.TRIANGLE_STRIP
		this.color_blend = 'src_alpha * src_color + (1 - src_alpha) * dst_color'
		this.update = function(){
			var view = this.view
			
			var width = (view.layout?view.layout.width:view.width) 
			//console.log(view.dropshadowradius, width);
			var height = (view.layout?view.layout.height:view.height)
			
			var radius = vec4(Math.max(1, view.borderradius[0] + view.dropshadowradius),Math.max(1, view.borderradius[1]+ view.dropshadowradius),Math.max(1, view.borderradius[2]+ view.dropshadowradius),Math.max(1, view.borderradius[3]+ view.dropshadowradius));
			console.log(radius)
			var mesh = this.mesh = this.vertexstruct.array()

			if (vec4.equals(radius, vec4(0,0,0,0))) {
				mesh.push([width/2,height/2], 0, [1,0,0,0], 0.5,0.5)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
				mesh.push([width,0], 0, [1,0,0,0], 1,0)
				mesh.push([width,height], 0, [1,0,0,0], 1,1)
				mesh.push([0,height], 0, [1,0,0,0], 0,1)
				mesh.push([0,0], 0, [1,0,0,0], 0,0)
			}
			else{
				
				var divbase = 0.45;
				var pidiv1 = Math.floor(Math.max(2, divbase* PI * radius[0]))
				var pidiv2 = Math.floor(Math.max(2, divbase* PI * radius[1]))
				var pidiv3 = Math.floor(Math.max(2, divbase* PI * radius[2]))
				var pidiv4 = Math.floor(Math.max(2, divbase* PI * radius[3]))
				
				var pimul1 = (PI*0.5)/(pidiv1-1)
				var pimul2 = (PI*0.5)/(pidiv2-1)
				var pimul3 = (PI*0.5)/(pidiv3-1)
				var pimul4 = (PI*0.5)/(pidiv4-1)

				
				for(var p = 0;p<pidiv1;p++){
					this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), p*pimul1, vec4(0,0,0,0), 0,0,radius)	
					this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), p*pimul1, vec4(1,0,0,0), 1,0,radius)	
				}
				for(var p = 0;p<pidiv2;p++)
				{
					this.mesh.push(vec2(width - radius[1]-1 + view.dropshadowradius, radius[1]- view.dropshadowradius), p*pimul2 + PI/2, vec4(0,0,0,0), 0,0,radius)
					this.mesh.push(vec2(width - radius[1]-1 + view.dropshadowradius, radius[1]- view.dropshadowradius), p*pimul2 + PI/2, vec4(0,1,0,0), 1,0,radius)
				}
				for(var p = 0;p<pidiv3;p++) {
					this.mesh.push(vec2(width - radius[2]-1 + view.dropshadowradius, height - radius[2]-1+ view.dropshadowradius), p*pimul3+ PI, vec4(0,0,0,0), 0,0,radius)
					this.mesh.push(vec2(width - radius[2]-1 + view.dropshadowradius, height - radius[2]-1+ view.dropshadowradius), p*pimul3+ PI, vec4(0,0,1,0), 1,0,radius)
				}
				for(var p = 0;p<pidiv4;p++){
					this.mesh.push(vec2(radius[3]- view.dropshadowradius, height - radius[3]-1+ view.dropshadowradius), p*pimul4 + PI + PI/2, vec4(0,0,0,0), 0,0,radius)
					this.mesh.push(vec2(radius[3]- view.dropshadowradius, height - radius[3]-1+ view.dropshadowradius), p*pimul4 + PI + PI/2, vec4(0,0,0,1), 1,0,radius)
				}
				this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), 0, vec4(0,0,0,0), 0,0,radius)	
				this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), 0, vec4(1,0,0,0), 1,0,radius)	
				this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), 0, vec4(0,0,0,0), 1,0,radius)	
				this.mesh.push(vec2(radius[0] - view.dropshadowradius,radius[0]- view.dropshadowradius), 0, vec4(0,0,0,0), 0,0,radius)	
				this.mesh.push(vec2(radius[3]- view.dropshadowradius, height - radius[3]-1+ view.dropshadowradius), p*pimul4 + PI + PI/2, vec4(0,0,0,0), 0,0,radius)
				this.mesh.push(vec2(width - radius[1]-1 + view.dropshadowradius, radius[1]- view.dropshadowradius), p*pimul2 + PI/2, vec4(0,0,0,0), 0,0,radius)
				this.mesh.push(vec2(width - radius[2]-1 + view.dropshadowradius, height - radius[2]-1+ view.dropshadowradius), p*pimul3+ PI, vec4(0,0,0,0), 0,0,radius)
			//this.mesh.push(vec2(radius[3]- view.dropshadowradius, height - radius[3]-1+ view.dropshadowradius), 0*pimul4 + PI + PI/2, vec4(0,0,0,0), 0,1,radius)
				
//				this.mesh.push(vec2( radius[0]- view.dropshadowradius ,radius[0]- view.dropshadowradius), 0, vec4(1,0,0,0), 0,0, radius)
			}	
		}

		this.color = function(){
			var col = view.dropshadowcolor;
			col.a *= view.dropshadowopacity;
			col.a *= 1.0- pow(mesh.uv.x,1. + view.dropshadowhardness*10.);
			
			return vec4(col.rgb, col.a * view.opacity)
		}

		this.position = function(){
			pos = mesh.pos.xy
			var ca = cos(mesh.angle + PI)
			var sa = sin(mesh.angle + PI)
			
			var rad  = (mesh.radmult.x * mesh.shadowradius.x + mesh.radmult.y * mesh.shadowradius.y + mesh.radmult.z * mesh.shadowradius.z + mesh.radmult.w * mesh.shadowradius.w)
			pos.x += ca * rad
			pos.y += sa * rad
			
			uv = vec2(pos.x/view.layout.width,  pos.y/view.layout.height)
			
			sized = vec2(pos.x, pos.y)
			sized += view.dropshadowoffset;
			return vec4(sized.x, sized.y, 0, 1) * view.totalmatrix * view.viewmatrix
		}
	})
	
	this.shadowrect = false
	
	this.dropshadowopacity = function(){
		if (this.dropshadowopacity> 0){
			this.shadowrect = true;
		}
		else{
			this.shadowrect =false;
		}
	}
	
	
	this.moveToFront = function(){
		if(!this.parent) return
		var idx = this.parent.children.indexOf(this)
		this.parent.children.splice(idx, 1)
		this.parent.children.push(this)
		this.parent.redraw()
	}

	this.moveToBack = function(){
		if(!this.parent) return
		var idx = this.parent.children.indexOf(this)
		this.parent.children.splice(idx, 1)
		this.parent.children.unshift(this)
		this.parent.redraw()
	}

	define.class(this, 'viewportblend', this.Shader, function(){
		this.draworder = 10
		this.updateorder = 10
		this.omit_from_shader_list = true
		this.texture = Shader.prototype.Texture.fromType('rgba_depth_stencil')
		this.mesh = vec2.array()
		this.mesh.pushQuad(0,0, 0,1, 1,0, 1,1)
		this.width = 0
		this.height = 0

		this.position = function(){
			return vec4( mesh.x * width, mesh.y * height, 0, 1) * view.viewportmatrix * view.viewmatrix
		}

		this.color = function(){
			var col = texture.sample(mesh.xy)
			return vec4(col.rgb, col.a * view.opacity)
		}
	})
	this.viewportblend = false

	// rounded corner border shader
	define.class(this, 'roundedborder', this.Shader, function(){
		this.draworder = 1
		this.updateorder = 1
		this.vertexstruct = define.struct({
			pos: vec2,
			angle: float,
			radmult: vec4,			
			uv:vec2
		})
		this.mesh = this.vertexstruct.array()
		this.drawtype = this.TRIANGLE_STRIP
		
		this.update = function(){

			var view = this.view
			var width = view.layout? view.layout.width: view.width
			var height = view.layout? view.layout.height: view.height

			var mesh = this.mesh = this.vertexstruct.array()
						
			var borderradius = view.borderradius
			var borderwidth = view.borderwidth

			var scale0 = ((borderradius[0]-borderwidth[0]))/Math.max(0.01, borderradius[0])
			var scale1 = ((borderradius[1]-borderwidth[0]))/Math.max(0.01, borderradius[1])
			var scale2 = ((borderradius[2]-borderwidth[0]))/Math.max(0.01, borderradius[2])
			var scale3 = ((borderradius[3]-borderwidth[0]))/Math.max(0.01, borderradius[3])
			
			var pidiv = 20
			
			var divbase = 0.45
			var pidiv1 = Math.floor(Math.max(2, divbase* PI * borderradius[0]))
			var pidiv2 = Math.floor(Math.max(2, divbase* PI * borderradius[1]))
			var pidiv3 = Math.floor(Math.max(2, divbase* PI * borderradius[2]))
			var pidiv4 = Math.floor(Math.max(2, divbase* PI * borderradius[3]))
			
			var pimul1 = (PI*0.5)/(pidiv1-1)
			var pimul2 = (PI*0.5)/(pidiv2-1)
			var pimul3 = (PI*0.5)/(pidiv3-1)
			var pimul4 = (PI*0.5)/(pidiv4-1)

			for(var p = 0; p < pidiv1; p ++){
				this.mesh.push(vec2( borderradius[0] ,borderradius[0]), p*pimul1, vec4(1,0,0,0), 1,0);
				this.mesh.push(vec2( borderradius[0] ,borderradius[0]), p*pimul1, vec4(scale0,0,0,0), 1,0);
			}
			
			for(var p = 0;p<pidiv2;p++){
				this.mesh.push(vec2(width-borderradius[1],borderradius[1]), p*pimul2 + PI/2, vec4(0,1,0,0), 1,0);
				this.mesh.push(vec2(width-borderradius[1],borderradius[1]), p*pimul2 + PI/2, vec4(0,scale1,0,0), 1,0);
			}
			for(var p = 0;p<pidiv3;p++){
				this.mesh.push(vec2(width-borderradius[2],height-borderradius[2]), p*pimul3 + PI, vec4(0,0,1,0), 1,1);
				this.mesh.push(vec2(width-borderradius[2],height-borderradius[2]), p*pimul3 + PI, vec4(0,0,scale2,0), 1,1);
			}
			for(var p = 0;p<pidiv4;p++){
				this.mesh.push(vec2(borderradius[3],height-borderradius[3]), p*pimul4 + PI + PI/2, vec4(0,0,0,1), 0,1);
				this.mesh.push(vec2(borderradius[3],height-borderradius[3]), p*pimul4 + PI + PI/2, vec4(0,0,0,scale3), 0,1);
			}				
			this.mesh.push(vec2( borderradius[0] ,borderradius[0]), 0, vec4(1,0,0,0), 1,0);
			this.mesh.push(vec2( borderradius[0] ,borderradius[0]), 0, vec4(scale0,0,0,0), 1,0);
		
		}
		
		this.color = function(){
			var col = view.bordercolorfn(pos.xy)
			return vec4(col.rgb, view.opacity * col.a)
		}
		
		this.position = function(){
			
			pos = mesh.pos.xy

			var ca = cos(mesh.angle + PI)
			var sa = sin(mesh.angle+PI)
			

			
			var rad  = dot(mesh.radmult, view.borderradius)
			pos.x += ca * rad
			pos.y += sa * rad
			
			uv = vec2(pos.x/view.width,  pos.y/view.height)
			
			sized = vec2(pos.x, pos.y)
			return vec4(sized.x, sized.y, 0, 1) * view.totalmatrix * view.viewmatrix
		}

	//	this.atExtend = function(){
	//		console.log("EXTENDING", this.constructor.outer.bordercolorfn)
			//Object.getPrototypeOf(this).atExtend.call(this)
	//	}
	})
	this.roundedborder = false

	// lets pull in the scrollbar on the view
	define.class(this, 'scrollbar', require('$ui/scrollbar'),function(){
		this.bg = {
			noscroll:true
		}
	})
})
