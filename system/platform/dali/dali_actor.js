/* Copyright 2015 Teem2 LLC. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, 
   software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
   either express or implied. See the License for the specific language governing permissions and limitations under the License.*/


/**
 * @class DaliActor
 * Layer between DreemGL and Dali. Although Dali has a complete api, this
 * class is used to encapsulate the api to simplify how it is embedded into
 * the dreemgl dali platform.
 *
 * Each instance of DaliActor contains a dali.Actor object.
 */

/**
 * @property daliactor
 * dali.Actor object
 */

define.class(function(require, exports){
	// DaliApi is a static object to access the dali api
	DaliApi = require('./dali_api')

	// Assign an id to each daliactor object
	var DaliActor = exports
	DaliActor.GlobalId = 0

	/**
	 * @method constructor
	 * Create a dali.Actor object with default parameters
	 * You can access the dali.Actor object as this.daliactor
	 * @param {Object} view The view object the actor belongs to
	 */
	this.atConstructor = function(view) {
		this.object_type = 'DaliActor'

		var dali = DaliApi.dali;

		// Cache the property values
		this.property_cache = {};

		this.id = ++DaliActor.GlobalId;
		this.view = view;
		this.daliactor = new dali.Actor();
		this.onstage = false;
		
		var width = view.view.width || 100;
		var height = view.view.height || 100;
		this.daliactor.size = [width, height, 0];

		this.daliactor.parentOrigin = dali.TOP_LEFT;
		this.daliactor.anchorPoint = dali.TOP_LEFT;

		if (DaliApi.emitcode) {
			console.log('DALICODE: var ' + this.name() + ' = new dali.Actor();');
			console.log('DALICODE: ' + this.name() + '.size = [' + width + ', ' + height + ', 0];');
			console.log('DALICODE: ' + this.name() + '.parentOrigin = dali.TOP_LEFT;');
			console.log('DALICODE: ' + this.name() + '.anchorPoint = dali.TOP_LEFT;');
		}		
		
	}

	/**
	 * @method addRenderer
	 * Add a renderer to the actor.
	 * @param {Object} DaliRenderer object to add. Adding the first renderer
	 *                 also adds the object to the stage.
	 */
	this.addRenderer = function(renderer) {
		var dali = DaliApi.dali;

		this.dalirenderer = renderer;

		this.daliactor.addRenderer(this.dalirenderer.dalirenderer);

		if (DaliApi.emitcode) {
			console.log('DALICODE: ' + this.name() + '.addRenderer(' + this.dalirenderer.name() + ');');
		}		

		// Add the actor to the stage
		if (!this.onstage) {
			DaliApi.addActor(this);
			this.onstage = true;
		}


	}	


	/**
	 * @method setColor
	 * Specify the color of the actor
	 * @param {object} color 4 element array of [r,g,b,a]
	 */
	DaliApi.setColor = function(color) {
		//TODO Is it faster if I cache the last value
		this.daliactor.color = color;

		if (DaliApi.emitcode) {
			console.log('DALICODE: ' + this.name() + '.color = ' + JSON.stringify(color) + ';');
		}
	}


	// Internal method to format a single value
	this.formatSingle = function(value) {
		if (typeof value === 'undefined')
			return 0;

		//TODO I've seen NaN values. Dali doesn't accept them
		if (isNaN(value) || value === null) {
			return 0;
		}

		if (typeof value === 'string' || typeof value === 'boolean')
			return value;


		var ivalue = parseInt(value);
		if (value == ivalue)
			return ivalue;

		return value; // .toPrecision(3);
	}

	// Internal method to format a value for display
	this.formatValue = function(value) {
		if (!Array.isArray(value))
			return this.formatSingle(value);

		var str = [];
		for (var i in value) {
			str.push(this.formatSingle(value[i]));
		}

		return str.join(', ');
	}

	/**
	 * @method setUniformValue
	 * Sets a uniform value. If a value exists in the cache, the property
	 * is set directory. Otherwise, registerAnimatableProperty is called.
	 * @param {string} Name of uniform to set
	 * @param {Object} Compiled uniform structure
	 */
	this.setUniformValue = function(name, uni) {
		var val = DaliApi.getArrayValue(uni);
		var key = '_' + name;

		// Do nothing if the value has not changed
		var hash = DaliApi.getHash(val);
		var lasthash = this.property_cache[name];
		if (lasthash && (lasthash == hash))
			return;

		var fval = this.formatValue(val);
		//console.log('+++ set uniform', this.id, key, fval);

		if (lasthash) {
			// Existing value. Set the property directly
			this.daliactor[key] = val;
		}
		else {
			// New property. Register it
			this.daliactor.registerAnimatableProperty(key, val);
		}

		this.property_cache[name] = hash;

		if (DaliApi.emitcode) {
			if (lasthash) {
				console.log('DALICODE: ' + this.name() + '[\'' + key + '\'] = ' + JSON.stringify(val) + ';');
			}
			else {
				console.log('DALICODE: ' + this.name() + '.registerAnimatableProperty(\'' + key + '\', ' + JSON.stringify(val) + ');');
			}
		}		

	}


	this.name = function() {
		return 'daliactor' + this.id;
	}

	this.inspect = function(depth) {
		var obj = {daliActor:this.id, obj:[this.dalirenderer.inspect(depth)]};
		var util = require('util')
		return util.inspect(obj, {depth: null});
	}

});
