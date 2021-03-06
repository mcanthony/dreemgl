/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


define.class(function( $ui$, view, label, icon, $$, require){
	// Simple button: a rectangle with a textlabel and an icon
	
	this.attributes = {
		// The label for the button
		text: Config({type: String, value: ""}),

		// The icon for the button, see FontAwesome for the available icon-names.
		icon: Config({type: String, value: "", meta:"icon"}),

		// Font size in device-pixels.
		fontsize: Config({type: float, value: 14, meta:"fontsize"}),
		
		// Gradient color 1	
		col1: Config({meta:"color", value: vec4("#272727"), duration: 0.1, motion:"linear"}),
		
		// Gradient color 2
		col2: Config({meta:"color", type: vec4, value: vec4("#272727"), duration: 0.1, motion:"linear"}),

		// Color of the label text in neutral state	
		textcolor: Config({meta:"color", type: vec4, value: vec4("white")}),

		// Color of the label text in pressed-down state	
		textactivecolor: Config({meta:"color", type: vec4, value: vec4("white")}),
		
		// First gradient color for the button background in neutral state
		buttoncolor1: Config({meta:"color", type: vec4, value: vec4("#272727")}),
		
		// Second gradient color for the button background in neutral state	
		buttoncolor2: Config({meta:"color", type: vec4, value: vec4("#272727")}),
		
		// First gradient color for the button background in hovered state
		hovercolor1: Config({meta:"color", type: vec4, value: vec4("#505050")}),
		
		// Second gradient color for the button background in hovered state
		hovercolor2: Config({meta:"color", type: vec4, value: vec4("#505050")}),
		
		// First gradient color for the button background in pressed state
		pressedcolor1: Config({meta:"color", type: vec4, value: vec4("#707070")}),
		
		// Second gradient color for the button background in pressed state
		pressedcolor2: Config({meta:"color", type: vec4, value: vec4("#707070")}),

		// Second gradient color for the button background in pressed state
		internalmargin: Config({meta:"tlbr", type: vec4, value: vec4(0,0,0,0)}),

		// fires when button is clicked
		click: Config({type:Event}), 
		
		bold: true
	}

	var button = this.constructor

	this.font = require('$resources/fonts/opensans_bold_ascii.glf')
	
	this.bold = function(){
		if (this.bold) {
			this.font = require('$resources/fonts/opensans_bold_ascii.glf')
		}
		else{
			this.font = require('$resources/fonts/opensans_regular_ascii.glf')
		}
	}

	this.bgcolorfn = function(pos){
		return mix(col1, col2, pos.y/0.8)
	}

	this.bgcolor = '#272727'
	this.fgcolor = 'white'
	this.buttonres = {};
	this.padding = 2
	this.borderradius = 3
	this.borderwidth  = 2
	this.margin = 0
	this.bordercolor = vec4("#272727")
	this.alignitems = "flex-start"
	this.justifycontent ="flex-start" 

	this.style = {
		icon:{
			fgcolor:  Config({motion:'linear', duration:0.1})
		},
		label:{
			subpixel:false,
			bg: 0
		}
	}
	/*
	// The icon class used for the icon display. Exposed to allow overloading/replacing from the outside.
	define.class(this, 'iconclass', function(icon){
		this.fgcolor = Config({motion:'linear', duration:0.1})
	})

	// The icon class used for the icon display. Exposed to allow overloading/replacing from the outside.
	define.class(this, 'labelclass', function(label){
		this.subpixel = false
		this.bg = 0
	})
	*/
	// the hover state when someone hovers over the button
	this.statehover = function(){
		this.col1 = this.hovercolor1
		this.col2 = this.hovercolor2
		if(this.iconres)this.iconres.fgcolor = this.textactivecolor
		if(this.buttonres) this.buttonres.fgcolor = this.textactivecolor;

	}

	// the normal button state
	this.statenormal = function(first){
		this.col1 = Mark(this.buttoncolor1, first)
		this.col2 = Mark(this.buttoncolor2, first)
		if(this.iconres)this.iconres.fgcolor = this.textcolor
		if(this.buttonres) this.buttonres.fgcolor = this.textcolor;
	}

	// clicked state
	this.stateclick = function(){

		//this.animate({col1:{0:vec4('red'),3:vec4('green')}})
		this.col1 = this.pressedcolor1
		this.col2 = this.pressedcolor2
		if(this.iconres)this.iconres.fgcolor = this.textactivecolor
		if(this.buttonres) this.buttonres.fgcolor = this.textactivecolor;
	}

	this.init = function(){
		this.statenormal(true)
	}

	this.mouseover = function(){
		this.statehover()
	}
	this.mouseout = function(){this.statenormal()}
	this.mouseleftdown = function(){this.stateclick()}
	this.mouseleftup = function(event){
		// lets check if its over the button
		this.statenormal()
		if(event.isover){
			this.emit('click',event)
		}
	}

	this.render = function(){		
		var res = [];
		this.buttonres = undefined;
		this.iconres = undefined
		
		if (this.icon && this.icon.length > 0){
			this.iconres = icon({alignself:"center", fontsize: this.fontsize, nopick:true, fgcolor:this.textcolor, icon: this.icon}); 
			res.push(this.iconres);
		}

		if (this.text && this.text.length > 0){			
			this.buttonres = label({alignself:"center", font: this.font, bgcolor:this.bgcolor, fgcolor:this.textcolor, nopick:true,fontsize: this.fontsize, position: "relative", text: this.text})
			res.push(this.buttonres);
		}
		
		return view({bg:false,margin:this.internalmargin, alignitems:"center", flexdirection:"row",justifycontent:"center"},res);
	}

	// Basic usage of the button.	
	this.constructor.examples = {
		Usage:function(){
			return [
				button({text:"Press me!"})
				,button({text:"Colored!", buttoncolor1: "red", buttoncolor2: "blue", labelcolor: "white"  })
				,button({text:"With an icon!", icon:"flask" })
			]
		}
	}	
})