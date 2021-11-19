/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 4562:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = __webpack_require__(9539),
Classifier = __webpack_require__(1258);

var BayesClassifier = function(smoothing) {
    Classifier.call(this);
    this.classFeatures = {};
    this.classTotals = {};
    this.totalExamples = 1; // start at one to smooth
    this.smoothing = smoothing === undefined ? 1.0 : smoothing;
};

util.inherits(BayesClassifier, Classifier);

function addExample(observation, label) {
    if(!this.classFeatures[label]) {
        this.classFeatures[label] = {};
        this.classTotals[label] = 1; // give an extra for smoothing
    }

    if(observation instanceof Array) {
        var i = observation.length;
        this.totalExamples++;
        this.classTotals[label]++;

        while(i--) {
            if(observation[i]) {
                if(this.classFeatures[label][i]) {
                    this.classFeatures[label][i]++;
                } else {
                    // give an extra for smoothing
                    this.classFeatures[label][i] = 1 + this.smoothing;
                }
            }
        }
    } else {
        // sparse observation
        for(var key in observation){
            value = observation[key];

            if(this.classFeatures[label][value]) {
               this.classFeatures[label][value]++;
            } else {
                // give an extra for smoothing
               this.classFeatures[label][value] = 1 + this.smoothing;
            }
        }
    }
}

function train() {

}

function probabilityOfClass(observation, label) {
    var prob = 0;

    if(observation instanceof Array){
        var i = observation.length;

        while(i--) {
            if(observation[i]) {
                var count = this.classFeatures[label][i] || this.smoothing;
                // numbers are tiny, add logs rather than take product
                prob += Math.log(count / this.classTotals[label]);
            }
        }
    } else {
        // sparse observation
        for(var key in observation){
            var count = this.classFeatures[label][observation[key]] || this.smoothing;
            // numbers are tiny, add logs rather than take product
            prob += Math.log(count / this.classTotals[label]);
        }
    }

    // p(C) * unlogging the above calculation P(X|C)
    prob = (this.classTotals[label] / this.totalExamples) * Math.exp(prob);

    return prob;
}

function getClassifications(observation) {
    var classifier = this;
    var labels = [];

    for(var className in this.classFeatures) {
        labels.push({label: className,
        value: classifier.probabilityOfClass(observation, className)});
    }

    return labels.sort(function(x, y) {
        return y.value - x.value;
    });
}

function restore(classifier) {
     classifier = Classifier.restore(classifier);
     classifier.__proto__ = BayesClassifier.prototype;

     return classifier;
}

BayesClassifier.prototype.addExample = addExample;
BayesClassifier.prototype.train = train;
BayesClassifier.prototype.getClassifications = getClassifications;
BayesClassifier.prototype.probabilityOfClass = probabilityOfClass;

BayesClassifier.restore = restore;

module.exports = BayesClassifier;

/***/ }),

/***/ 1258:
/***/ ((module) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function Classifier() {
}

function restore(classifier) {
    classifier = typeof classifier == 'string' ?  JSON.parse(classifier) : classifier;

    return classifier;
}

function addExample(observation, classification) {
    throw 'Not implemented';
}

function classify(observation) {
	var classifications = this.getClassifications(observation);
	if(!classifications || classifications.length === 0) {
		throw "Not Trained";
	} 
    return classifications[0].label;
}

function train() {
    throw 'Not implemented';
}

Classifier.prototype.addExample = addExample;
Classifier.prototype.train = train;
Classifier.prototype.classify = classify;

Classifier.restore = restore;

module.exports = Classifier;


/***/ }),

/***/ 6648:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = __webpack_require__(9539),
     Classifier = __webpack_require__(1258);

var sylvester = __webpack_require__(3116),
Matrix = sylvester.Matrix,
Vector = sylvester.Vector;

function sigmoid(z) {
    return 1 / (1 + Math.exp(0 - z));
}

function hypothesis(theta, Observations) {
    return Observations.x(theta).map(sigmoid);
}

function cost(theta, Examples, classifications) {
    var hypothesisResult = hypothesis(theta, Examples);

    var ones = Vector.One(Examples.rows());
    var cost_1 = Vector.Zero(Examples.rows()).subtract(classifications).elementMultiply(hypothesisResult.log());
    var cost_0 = ones.subtract(classifications).elementMultiply(ones.subtract(hypothesisResult).log());

    return (1 / Examples.rows()) * cost_1.subtract(cost_0).sum();
}

function descendGradient(theta, Examples, classifications) {
    var maxIt = 500 * Examples.rows();
    var last;
    var current;
    var learningRate = 3;
    var learningRateFound = false;

    Examples = Matrix.One(Examples.rows(), 1).augment(Examples);
    theta = theta.augment([0]);

    while(!learningRateFound && learningRate !== 0) {
        var i = 0;
        last = null;

        while(true) {
            var hypothesisResult = hypothesis(theta, Examples);
            theta = theta.subtract(Examples.transpose().x(
            hypothesisResult.subtract(classifications)).x(1 / Examples.rows()).x(learningRate));
            current = cost(theta, Examples, classifications);

            i++;

            if(last) {
            if(current < last)
                learningRateFound = true;
            else
                break;

            if(last - current < 0.0001)
                break;
            }

            if(i >= maxIt) {
                throw 'unable to find minimum';
            }

            last = current;
        }

        learningRate /= 3;
    }

    return theta.chomp(1);
}

var LogisticRegressionClassifier = function() {
    Classifier.call(this);
    this.examples = {};
    this.features = [];
    this.featurePositions = {};
    this.maxFeaturePosition = 0;
    this.classifications = [];
    this.exampleCount = 0;
};

util.inherits(LogisticRegressionClassifier, Classifier);

function createClassifications() {
    var classifications = [];

    for(var i = 0; i < this.exampleCount; i++) {
        var classification = [];

        for(var _ in this.examples) {
            classification.push(0);
        }

       classifications.push(classification);
    }

    return classifications;
}

function computeThetas(Examples, Classifications) {
    this.theta = [];

    // each class will have it's own theta.
    var zero = function() { return 0; };
    for(var i = 1; i <= this.classifications.length; i++) {
        var theta = Examples.row(1).map(zero);
        this.theta.push(descendGradient(theta, Examples, Classifications.column(i)));
    }
}

function train() {
    var examples = [];
    var classifications = this.createClassifications();
    var d = 0, c = 0;

    for(var classification in this.examples) {
        for(var i = 0; i < this.examples[classification].length; i++) {
            var doc = this.examples[classification][i];
            var example = doc;

            examples.push(example);
            classifications[d][c] = 1;
            d++;
        }

        c++;
    }

    this.computeThetas($M(examples), $M(classifications));
}

function addExample(data, classification) {
    if(!this.examples[classification]) {
	this.examples[classification] = [];
	this.classifications.push(classification);
    }

    this.examples[classification].push(data);
    this.exampleCount++;
}

function getClassifications(observation) {
    observation = $V(observation);
    var classifications = [];

    for(var i = 0; i < this.theta.length; i++) {
        classifications.push({label: this.classifications[i], value: sigmoid(observation.dot(this.theta[i])) });
    }

    return classifications.sort(function(x, y) {
        return y.value - x.value;
    });
}

function restore(classifier) {
    classifier = Classifier.restore(classifier);
    classifier.__proto__ = LogisticRegressionClassifier.prototype;

    return classifier;
}

LogisticRegressionClassifier.prototype.addExample = addExample;
LogisticRegressionClassifier.prototype.restore = restore;
LogisticRegressionClassifier.prototype.train = train;
LogisticRegressionClassifier.prototype.createClassifications = createClassifications;
LogisticRegressionClassifier.prototype.computeThetas = computeThetas;
LogisticRegressionClassifier.prototype.getClassifications = getClassifications;

LogisticRegressionClassifier.restore = restore;

module.exports = LogisticRegressionClassifier;


/***/ }),

/***/ 8627:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Sylvester = __webpack_require__(3116),
Matrix = Sylvester.Matrix,
Vector = Sylvester.Vector;

function KMeans(Observations) {
    if(!Observations.elements)
    Observations = $M(Observations);

    this.Observations = Observations;
}

// create an initial centroid matrix with initial values between
// 0 and the max of feature data X.
function createCentroids(k) {
    var Centroid = [];
    var maxes = this.Observations.maxColumns();
    //console.log(maxes);

    for(var i = 1; i <= k; i++) {
        var centroid = [];
        for(var j = 1; j <= this.Observations.cols(); j++) {
            centroid.push(Math.random() * maxes.e(j));
        }

        Centroid.push(centroid);
    }

    //console.log(centroid)

    return $M(Centroid);
}

// get the euclidian distance between the feature data X and
// a given centroid matrix C.
function distanceFrom(Centroids) {
    var distances = [];

    for(var i = 1; i <= this.Observations.rows(); i++) {
        var distance = [];

        for(var j = 1; j <= Centroids.rows(); j++) {
            distance.push(this.Observations.row(i).distanceFrom(Centroids.row(j)));
        }

        distances.push(distance);
    }

    return $M(distances);
}

// categorize the feature data X into k clusters. return a vector
// containing the results.
function cluster(k) {
    var Centroids = this.createCentroids(k);
    var LastDistances = Matrix.Zero(this.Observations.rows(), this.Observations.cols());
    var Distances = this.distanceFrom(Centroids);
    var Groups;

    while(!(LastDistances.eql(Distances))) {
    Groups = Distances.minColumnIndexes();
    LastDistances = Distances;

    var newCentroids = [];

    for(var i = 1; i <= Centroids.rows(); i++) {
        var centroid = [];

        for(var j = 1; j <= Centroids.cols(); j++) {
        var sum = 0;
        var count = 0;

        for(var l = 1; l <= this.Observations.rows(); l++) {
            if(Groups.e(l) == i) {
            count++;
            sum += this.Observations.e(l, j);
            }
        }

        centroid.push(sum / count);
        }

        newCentroids.push(centroid);
    }

    Centroids = $M(newCentroids);
    Distances = this.distanceFrom(Centroids);
    }

    return Groups;
}

KMeans.prototype.createCentroids = createCentroids;
KMeans.prototype.distanceFrom = distanceFrom;
KMeans.prototype.cluster = cluster;

module.exports = KMeans;


/***/ }),

/***/ 9824:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.BayesClassifier = __webpack_require__(4562);
exports.LogisticRegressionClassifier = __webpack_require__(6648);
/* unused reexport */ __webpack_require__(8627);


/***/ }),

/***/ 1924:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(210);

var callBind = __webpack_require__(5559);

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};


/***/ }),

/***/ 5559:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(8612);
var GetIntrinsic = __webpack_require__(210);

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}


/***/ }),

/***/ 7187:
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ 9804:
/***/ ((module) => {


var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};



/***/ }),

/***/ 7648:
/***/ ((module) => {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),

/***/ 8612:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(7648);

module.exports = Function.prototype.bind || implementation;


/***/ }),

/***/ 210:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = __webpack_require__(1405)();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(8612);
var hasOwn = __webpack_require__(7642);
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};


/***/ }),

/***/ 1405:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(5419);

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};


/***/ }),

/***/ 5419:
/***/ ((module) => {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),

/***/ 6410:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hasSymbols = __webpack_require__(5419);

module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};


/***/ }),

/***/ 7642:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(8612);

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);


/***/ }),

/***/ 5717:
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ 2584:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hasToStringTag = __webpack_require__(6410)();
var callBound = __webpack_require__(1924);

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;


/***/ }),

/***/ 8662:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = __webpack_require__(6410)();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};


/***/ }),

/***/ 5692:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var forEach = __webpack_require__(9804);
var availableTypedArrays = __webpack_require__(3083);
var callBound = __webpack_require__(1924);

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = __webpack_require__(6410)();

var g = typeof globalThis === 'undefined' ? __webpack_require__.g : globalThis;
var typedArrays = availableTypedArrays();

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = __webpack_require__(882);
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};


/***/ }),

/***/ 7266:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var json = typeof JSON !== 'undefined' ? JSON : __webpack_require__(8418);

module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) { return value; };

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (parent, key, node, level) {
        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
        var colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return json.stringify(node);
        }
        if (isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                out.push(indent + space + item);
            }
            return '[' + out.join(',') + indent + ']';
        }
        else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return json.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            else seen.push(node);

            var keys = objectKeys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node, key, node[key], level+1);

                if(!value) continue;

                var keyValue = json.stringify(key)
                    + colonSeparator
                    + value;
                ;
                out.push(indent + space + keyValue);
            }
            seen.splice(seen.indexOf(node), 1);
            return '{' + out.join(',') + indent + '}';
        }
    })({ '': obj }, '', obj, 0);
};

var isArray = Array.isArray || function (x) {
    return {}.toString.call(x) === '[object Array]';
};

var objectKeys = Object.keys || function (obj) {
    var has = Object.prototype.hasOwnProperty || function () { return true };
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};


/***/ }),

/***/ 8418:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.parse = __webpack_require__(1396);
exports.stringify = __webpack_require__(6177);


/***/ }),

/***/ 1396:
/***/ ((module) => {

var at, // The index of the current character
    ch, // The current character
    escapee = {
        '"':  '"',
        '\\': '\\',
        '/':  '/',
        b:    '\b',
        f:    '\f',
        n:    '\n',
        r:    '\r',
        t:    '\t'
    },
    text,

    error = function (m) {
        // Call error when something is wrong.
        throw {
            name:    'SyntaxError',
            message: m,
            at:      at,
            text:    text
        };
    },
    
    next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
            error("Expected '" + c + "' instead of '" + ch + "'");
        }
        
        // Get the next character. When there are no more characters,
        // return the empty string.
        
        ch = text.charAt(at);
        at += 1;
        return ch;
    },
    
    number = function () {
        // Parse a number value.
        var number,
            string = '';
        
        if (ch === '-') {
            string = '-';
            next('-');
        }
        while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
        }
        if (ch === '.') {
            string += '.';
            while (next() && ch >= '0' && ch <= '9') {
                string += ch;
            }
        }
        if (ch === 'e' || ch === 'E') {
            string += ch;
            next();
            if (ch === '-' || ch === '+') {
                string += ch;
                next();
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
        }
        number = +string;
        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    },
    
    string = function () {
        // Parse a string value.
        var hex,
            i,
            string = '',
            uffff;
        
        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
            while (next()) {
                if (ch === '"') {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    },

    white = function () {

// Skip whitespace.

        while (ch && ch <= ' ') {
            next();
        }
    },

    word = function () {

// true, false, or null.

        switch (ch) {
        case 't':
            next('t');
            next('r');
            next('u');
            next('e');
            return true;
        case 'f':
            next('f');
            next('a');
            next('l');
            next('s');
            next('e');
            return false;
        case 'n':
            next('n');
            next('u');
            next('l');
            next('l');
            return null;
        }
        error("Unexpected '" + ch + "'");
    },

    value,  // Place holder for the value function.

    array = function () {

// Parse an array value.

        var array = [];

        if (ch === '[') {
            next('[');
            white();
            if (ch === ']') {
                next(']');
                return array;   // empty array
            }
            while (ch) {
                array.push(value());
                white();
                if (ch === ']') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    },

    object = function () {

// Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            if (ch === '}') {
                next('}');
                return object;   // empty object
            }
            while (ch) {
                key = string();
                white();
                next(':');
                if (Object.hasOwnProperty.call(object, key)) {
                    error('Duplicate key "' + key + '"');
                }
                object[key] = value();
                white();
                if (ch === '}') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

    white();
    switch (ch) {
    case '{':
        return object();
    case '[':
        return array();
    case '"':
        return string();
    case '-':
        return number();
    default:
        return ch >= '0' && ch <= '9' ? number() : word();
    }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

module.exports = function (source, reviver) {
    var result;
    
    text = source;
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
        error("Syntax error");
    }

    // If there is a reviver function, we recursively walk the new structure,
    // passing each name/value pair to the reviver function for possible
    // transformation, starting with a temporary root object that holds the result
    // in an empty key. If there is not a reviver function, we simply return the
    // result.

    return typeof reviver === 'function' ? (function walk(holder, key) {
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = walk(value, k);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }
        return reviver.call(holder, key, value);
    }({'': result}, '')) : result;
};


/***/ }),

/***/ 6177:
/***/ ((module) => {

var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}

function str(key, holder) {
    // Produce a string from holder[key].
    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];
    
    // If the value has a toJSON method, call it to obtain a replacement value.
    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }
    
    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.
    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }
    
    // What happens next depends on the value's type.
    switch (typeof value) {
        case 'string':
            return quote(value);
        
        case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        
        case 'boolean':
        case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
            
        case 'object':
            if (!value) return 'null';
            gap += indent;
            partial = [];
            
            // Array.isArray
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                // Join all of the elements together, separated with commas, and
                // wrap them in brackets.
                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            
            // If the replacer is an array, use it to select the members to be
            // stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            else {
                // Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            
        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ? '{}' : gap ?
            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
            '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}

module.exports = function (value, replacer, space) {
    var i;
    gap = '';
    indent = '';
    
    // If the space parameter is a number, make an indent string containing that
    // many spaces.
    if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
            indent += ' ';
        }
    }
    // If the space parameter is a string, it will be used as the indent string.
    else if (typeof space === 'string') {
        indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.
    rep = replacer;
    if (replacer && typeof replacer !== 'function'
    && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
    }
    
    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {'': value});
};


/***/ }),

/***/ 4784:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.SentenceAnalyzer = __webpack_require__(3240)


/***/ }),

/***/ 3240:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const _ = __webpack_require__(6419)

/*
 Sentences Analizer Class
 From http://www.writingcentre.uottawa.ca/hypergrammar/sntpurps.html

 Take a POS input and analyse it for
  - Type of Sentense
     - Interrogative
       - Tag Questions
       -
     - Declarative
     - Exclamatory
     - Imperative

  - Parts of a Sentense
     - Subject
     - Predicate

  - Show Preposition Phrases
*/

const Sentences = function (pos, callbackFunction) {
  this.posObj = pos
  this.senType = null
  callbackFunction(this)
}

Sentences.prototype.part = function (callbackFunction) {
  const subject = []
  const predicat = []
  let verbFound = false

  this.prepositionPhrases()

  for (let i = 0; i < this.posObj.tags.length; i++) {
    if (this.posObj.tags[i].pos === 'VB') {
      if (i === 0) {
        verbFound = true
      } else {
        // We need to Test for any EX before the VB
        if (this.posObj.tags[i - 1].pos !== 'EX') {
          verbFound = true
        } else {
          predicat.push(this.posObj.tags[i].token)
        }
      }
    }

    // Add Pronoun Phrase (pp) Or Subject Phrase (sp)
    if (!verbFound) {
      if (this.posObj.tags[i].pp !== true) { this.posObj.tags[i].spos = 'SP' }

      subject.push(this.posObj.tags[i].token)
    } else {
      if (this.posObj.tags[i].pp !== true) { this.posObj.tags[i].spos = 'PP' }

      predicat.push(this.posObj.tags[i].token)
    }
  }

  if (subject.length === 0) {
    this.posObj.tags.push({ token: 'You', spos: 'SP', pos: 'PRP', added: true })
  }

  callbackFunction(this)
}

// Takes POS and removes IN to NN or NNS
// Adds a PP for each prepositionPhrases
Sentences.prototype.prepositionPhrases = function () {
  let remove = false

  for (let i = 0; i < this.posObj.tags.length; i++) {
    if (this.posObj.tags[i].pos.match('IN')) {
      remove = true
    }

    if (remove) {
      this.posObj.tags[i].pp = true
    }

    if (this.posObj.tags[i].pos.match('NN')) {
      remove = false
    }
  }
}

Sentences.prototype.subjectToString = function () {
  return this.posObj.tags.map(function (t) {
    if (t.spos === 'SP' || t.spos === 'S') {
      return t.token
    } else return null
  }).join(' ')
}

Sentences.prototype.predicateToString = function () {
  return this.posObj.tags.map(function (t) {
    if (t.spos === 'PP' || t.spos === 'P') {
      return t.token
    } else return null
  }).join(' ')
}

Sentences.prototype.implicitYou = function () {
  for (let i = 0; i < this.posObj.tags.length; i++) {
    if (this.posObj.tags[i].added) {
      return true
    }
  }

  return false
}

Sentences.prototype.toString = function () {
  return this.posObj.tags.map(function (t) { return t.token }).join(' ')
}

// This is quick and incomplete.
Sentences.prototype.type = function (cbf) {
  const callbackFunction = cbf || false

  // Check for implicit you before popping a tag.
  const implicitYou = this.implicitYou()

  // FIXME - punct seems useless
  let lastElement = this.posObj.punct()
  lastElement = (lastElement.length !== 0) ? lastElement.pop() : this.posObj.tags.pop()

  if (lastElement.pos !== '.') {
    if (implicitYou) {
      this.senType = 'COMMAND'
    } else if (_(['WDT', 'WP', 'WP$', 'WRB']).contains(this.posObj.tags[0].pos)) {
      // Sentences that start with: who, what where when why and how, then they are questions
      this.senType = 'INTERROGATIVE'
    } else if (_(['PRP']).contains(lastElement.pos)) {
      // Sentences that end in a Personal pronoun are most likely questions
      // eg. We should run away, should we [?]
      // eg. You want to see that again, do you [?]
      this.senType = 'INTERROGATIVE'
    } else {
      this.senType = 'UNKNOWN'
    }
  } else {
    switch (lastElement.token) {
      case '?':
        this.senType = 'INTERROGATIVE'
        break
      case '!':
        this.senType = (implicitYou) ? 'COMMAND' : 'EXCLAMATORY'
        break
      case '.':
        this.senType = (implicitYou) ? 'COMMAND' : 'DECLARATIVE'
        break
    }
  }

  if (callbackFunction && _(callbackFunction).isFunction()) {
    callbackFunction(this)
  } else {
    return this.senType
  }
}

module.exports = Sentences


/***/ }),

/***/ 2634:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.BrillPOSTagger = __webpack_require__(6997)
exports.BrillPOSTrainer = __webpack_require__(7303)
exports.BrillPOSTester = __webpack_require__(1880)
exports.Lexicon = __webpack_require__(8251)
exports.RuleSet = __webpack_require__(9385)
exports.RuleTemplates = __webpack_require__(7937)
exports.RuleTemplate = __webpack_require__(218)
exports.Corpus = __webpack_require__(1280)
exports.Sentence = __webpack_require__(782)


/***/ }),

/***/ 6997:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Brill's POS Tagger
  Copyright (C) 2019 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



const Sentence = __webpack_require__(782)

const DEBUG = false

function BrillPOSTagger (lexicon, ruleSet) {
  this.lexicon = lexicon
  this.ruleSet = ruleSet
}

// Tags a sentence, sentence is an array of words
// Returns an array of tagged words; a tagged words is an array consisting of
// the word itself followed by its lexical category
BrillPOSTagger.prototype.tag = function (sentence) {
  const taggedSentence = this.tagWithLexicon(sentence)
  DEBUG && console.log(taggedSentence)
  return this.applyRules(taggedSentence)
}

BrillPOSTagger.prototype.tagWithLexicon = function (sentence) {
  const taggedSentence = new Sentence()

  const that = this
  sentence.forEach(function (word, index) {
    const categories = that.lexicon.tagWord(word)
    taggedSentence.addTaggedWord(word, categories[0])
  })
  return (taggedSentence)
}

// Applies the transformation rules to an initially tagged sentence.
// taggedSentence is an array of tagged words.
// A tagged word is an array consisting of the word itself followed by its lexical category.
// Returns an array of tagged words as well
BrillPOSTagger.prototype.applyRules = function (sentence) {
  for (let i = 0, size = sentence.taggedWords.length; i < size; i++) {
    this.ruleSet.getRules().forEach(function (rule) {
      rule.apply(sentence, i)
    })
  }
  return sentence
}

module.exports = BrillPOSTagger


/***/ }),

/***/ 1880:
/***/ ((module) => {

"use strict";
/*
  Brill's POS Testing class
  Copyright (C) 2017 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



function BrillPOSTester () {

}

BrillPOSTester.prototype.test = function (corpus, tagger) {
  let totalWords = 0
  let correctTagsLexicon = 0
  let correctTagsAfterRules = 0

  // Tag the corpus using the tagger
  corpus.sentences.forEach(function (sentence) {
    const s = sentence.taggedWords.map(function (token) {
      return token.token
    })

    // Use the lexicon to tag the sentence
    const taggedSentence = tagger.tagWithLexicon(s)
    // Count the right tags
    sentence.taggedWords.forEach(function (token, i) {
      totalWords++
      if (token.tag === taggedSentence.taggedWords[i].tag) {
        correctTagsLexicon++
      }
    })

    // Use the rule set to tag the sentence
    const taggedSentenceAfterRules = tagger.applyRules(taggedSentence)
    // Count the right tags
    sentence.taggedWords.forEach(function (token, i) {
      if (token.tag === taggedSentenceAfterRules.taggedWords[i].tag) {
        correctTagsAfterRules++
      }
    })
  })

  // Return percentage right
  return [100 * correctTagsLexicon / totalWords, 100 * correctTagsAfterRules / totalWords]
}

module.exports = BrillPOSTester


/***/ }),

/***/ 7303:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Brill POS Trainer class
  Copyright (C) 2017 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Algorithm is based on:
// Exploring the Statistical Derivation of Transformational Rule Sequences
// for Part-of-Speech Tagging, Lance A. Ramshaw and Mitchell P. Marcus
// http://acl-arc.comp.nus.edu.sg/archives/acl-arc-090501d4/data/pdf/anthology-PDF/W/W94/W94-0111.pdf



const TransformationRule = __webpack_require__(3275)
const RuleSet = __webpack_require__(9385)
const Sentence = __webpack_require__(782)

// Training continues as long as there are rules with a positive score
// that have not been selected before
const minScore = 0

// After training rules with a score below scoreThreshold are pruned
function BrillPOSTrainer (ruleScoreThreshold) {
  if (ruleScoreThreshold) {
    this.ruleScoreThreshold = ruleScoreThreshold
  } else {
    this.ruleScoreThreshold = 1
  }
}

// Return the highest scoring rule from the rule set
BrillPOSTrainer.prototype.selectHighRule = function () {
  let highestRule = null

  // Walk through the map and find the rule with highest score
  this.positiveRules.getRules().forEach(function (rule) {
    if (highestRule === null) {
      if (!rule.hasBeenSelectedAsHighRuleBefore) {
        highestRule = rule
      }
    } else {
      if ((rule.score() > highestRule.score()) &&
        !rule.hasBeenSelectedAsHighRuleBefore) {
        highestRule = rule
      }
    }
  })

  if (highestRule !== null) {
    highestRule.hasBeenSelectedAsHighRuleBefore = true
  }
  // Return the rule with the highest score
  return highestRule
}

BrillPOSTrainer.prototype.mapRuleToSite = function (rule, i, j) {
  if (!this.mapRuleToSites[rule.key()]) {
    this.mapRuleToSites[rule.key()] = {}
  }
  if (!this.mapRuleToSites[rule.key()][i]) {
    this.mapRuleToSites[rule.key()][i] = {}
  }
  this.mapRuleToSites[rule.key()][i][j] = true
}

BrillPOSTrainer.prototype.mapSiteToRule = function (i, j, rule) {
  if (!this.mapSiteToRules[i]) {
    this.mapSiteToRules[i] = {}
  }
  if (!this.mapSiteToRules[i][j]) {
    this.mapSiteToRules[i][j] = {}
  }
  this.mapSiteToRules[i][j][rule.key()] = rule
}

BrillPOSTrainer.prototype.associateSiteWithRule = function (i, j, rule) {
  this.mapRuleToSite(rule, i, j)
  this.mapSiteToRule(i, j, rule)
}

BrillPOSTrainer.prototype.siteIsAssociatedWithRule = function (i, j, rule) {
  if (this.mapSiteToRules[i]) {
    if (this.mapSiteToRules[i][j]) {
      if (this.mapSiteToRules[i][j][rule.key()]) {
        return true
      }
    }
  }
  return false
}

// Returns an array of all sites associated with rule
BrillPOSTrainer.prototype.getSites = function (rule) {
  const that = this
  const result = []
  Object.keys(this.mapRuleToSites[rule.key()]).forEach(function (i) {
    Object.keys(that.mapRuleToSites[rule.key()][i]).forEach(function (j) {
      // Unary plus the convert hash keys i and j to integer
      result.push([+i, +j])
    })
  })
  // logger.debug("BrillPOSTrainer.prototype.getSites: sites " + JSON.stringify(result));
  return (result)
}

// Returns an array of all rules associated with the site
BrillPOSTrainer.prototype.getRules = function (i, j) {
  let result = []
  const that = this

  if (this.mapSiteToRules[i]) {
    if (this.mapSiteToRules[i][j]) {
      result = Object.keys(this.mapSiteToRules[i][j]).map(function (key) {
        return that.mapSiteToRules[i][j][key]
      })
    }
  }
  return result
}

BrillPOSTrainer.prototype.disconnectSiteFromRule = function (i, j, rule) {
  // mapRuleToSites
  if (this.mapRuleToSites[rule.key()]) {
    if (this.mapRuleToSites[rule.key()][i]) {
      if (this.mapRuleToSites[rule.key()][i][j]) {
        delete this.mapRuleToSites[rule.key()][i][j]
      }
    }
  }

  // mapSiteToRules
  if (this.mapSiteToRules[i]) {
    if (this.mapSiteToRules[i][j]) {
      if (this.mapSiteToRules[i][j][rule.key()]) {
        delete this.mapSiteToRules[i][j][rule.key()]
      }
    }
  }
}

// Adjusts the score of the rule at position i, j of the corpus
BrillPOSTrainer.prototype.scoreRule = function (rule, i, j) {
  // logger.debug("BrillPOSTrainer.prototype.scoreRule: entry");
  const token = this.corpus.sentences[i].taggedWords[j]
  const rightTag = token.tag
  const oldTag = token.testTag
  const newTag = token.newTag
  if (rightTag !== oldTag) {
    // Old tag is wrong
    if (newTag === rightTag) {
      // New tag is right
      rule.positive++
      // If the score changes, it may be selected again as highest scoring rule
      rule.hasBeenSelectedAsHighRuleBefore = false
      // logger.debug("BrillPOSTrainer.prototype.scoreRule: positive: " + rule.key() + "\t score: " + rule.positive);
    } else {
      // New tag is wrong as well --> neutral
      rule.neutral++
      // logger.debug("BrillPOSTrainer.prototype.scoreRule: neutral: " + rule.key() + "\t score: " + rule.neutral);
    }
  } else {
    // Old tag is right
    if (newTag === rightTag) {
      // New tag is right --> neutral
      rule.neutral++
      // logger.debug("BrillPOSTrainer.prototype.scoreRule: neutral: " + rule.key() + "\t score: " + rule.neutral);
    } else {
      // New tag is false
      rule.negative++
      // If the score changes, it may be selected again as highest scoring rule
      rule.hasBeenSelectedAsHighRuleBefore = false
      // logger.debug("BrillPOSTrainer.prototype.scoreRule: negative: " + rule.key() + "\t score: " + rule.negative);
    }
  }
  // logger.debug("BrillPOSTrainer.prototype.scoreRule: exit");
}

// Generate positive rules for this given site using templates
BrillPOSTrainer.prototype.generatePositiveRules = function (i, j) {
  const sentence = this.corpus.sentences[i]
  const token = sentence.taggedWords[j]
  // A positive rule should trigger on the currently assigned testTag
  const oldTag = token.testTag
  // logger.debug("BrillPOSTrainer.prototype.generatePositiveRules: oldTag " + oldTag);
  // It should assign the right tag as given by the corpus
  const newTag = token.tag
  // logger.debug("BrillPOSTrainer.prototype.generatePositiveRules: newTag " + newTag);

  const newRules = new RuleSet()
  // Exit if testTag already is the right tag --> will not result in positive rules
  if (oldTag === newTag) {
    return newRules
  }

  this.templates.forEach(function (template) {
    if (template.windowFitsSite(sentence, j)) {
      if (template.meta.nrParameters === 1) {
        template.meta.parameter1Values(sentence, j).forEach(function (value) {
          newRules.addRule(new TransformationRule(oldTag, newTag, template.predicateName, value))
        })
      } else {
        if (template.meta.nrParameters === 2) {
          template.meta.parameter1Values(sentence, j).forEach(function (value1) {
            template.meta.parameter2Values(sentence, j).forEach(function (value2) {
              newRules.addRule(new TransformationRule(oldTag, newTag, template.predicateName, value1, value2))
            })
          })
        } else {
          // 0 paramaters
          newRules.addRule(new TransformationRule(oldTag, newTag, template.predicateName))
        }
      }
    }
  })
  return newRules
}

// Finds all rules that are applicable at some site
BrillPOSTrainer.prototype.scanForPositiveRules = function () {
  // logger.debug("BrillPOSTrainer.prototype.scanForPositiveRules: entry");
  const that = this
  this.corpus.sentences.forEach(function (sentence, i) {
    sentence.taggedWords.forEach(function (token, j) {
      // logger.debug("BrillPOSTrainer.prototype.scanForPositiveRules: sentence no " + i);
      const newRules = that.generatePositiveRules(i, j)
      newRules.getRules().forEach(function (rule) {
        that.positiveRules.addRule(rule)
        // logger.debug("BrillPOSTrainer.prototype.scanForPositiveRules: nrRules " + that.positiveRules.nrRules());
      })
    })
  })
  // logger.debug("BrillPOSTrainer.prototype.scanForPositiveRules: exit, number of rules: " + this.positiveRules.nrRules());
}

// Find all sites where the rules can be applied, register these sites and
// update the scores
BrillPOSTrainer.prototype.scanForSites = function () {
  // logger.debug("BrillPOSTrainer.prototype.scanForSites: entry");
  const that = this

  // Scan the corpus
  this.corpus.sentences.forEach(function (sentence, i) {
    if (i % 100 === 0) {
      // logger.info("BrillPOSTrainer.prototype.scanForSites: sentence " + i);
    }

    const taggedSentence = new Sentence()
    sentence.taggedWords.forEach(function (wordObject) {
      taggedSentence.addTaggedWord(wordObject.token, wordObject.testTag)
    })

    sentence.taggedWords.forEach(function (token, j) {
      that.positiveRules.getRules().forEach(function (rule) {
        if (rule.isApplicableAt(sentence, taggedSentence, j)) {
          that.associateSiteWithRule(i, j, rule)
          that.scoreRule(rule, i, j)
          // logger.debug("BrillPOSTrainer.prototype.scanForSites: (sentence, token, rule): (" + i + ", " + j + ", " + rule.prettyPrint() + ")");
        }
      })
    })
  })

  // logger.debug("BrillPOSTrainer.prototype.scanForSites: exit");
}

// Returns a list of sites that may have been touched by a changing tag
BrillPOSTrainer.prototype.neighbourhood = function (i, j) {
  const sentenceLength = this.corpus.sentences[i].length
  const list = []

  if (this.index > 2) {
    list.push([i, j - 3])
  }
  if (this.index > 1) {
    list.push([i, j - 2])
  }
  if (this.index > 0) {
    list.push([i, j - 1])
  }
  if (this.index < sentenceLength - 1) {
    list.push([i, j + 1])
  }
  if (this.index < sentenceLength - 2) {
    list.push([i, j + 2])
  }
  if (this.index > sentenceLength - 3) {
    list.push([i, j + 3])
  }
  return list
}

// corpus: an array of token arrays
// templates: an array of rule templates
// lexicon: lexicon that provides method tagWord(word)
BrillPOSTrainer.prototype.train = function (corpus, templates, lexicon) {
  this.corpus = corpus
  this.templates = templates
  this.positiveRules = new RuleSet()
  this.mapRuleToSites = {}
  this.mapSiteToRules = {}

  // logger.debug("BrillPOSTrainer.prototype.train: entry");
  this.corpus.tag(lexicon)
  this.scanForPositiveRules()
  // logger.info("BrillPOSTrainer.prototype.train: initial number of rules: " + this.positiveRules.nrRules());
  this.scanForSites()

  let highRule = this.selectHighRule()
  let iterationNumber = 0
  const that = this
  while ((highRule !== null) && (highRule.score() > minScore)) {
    if ((iterationNumber % 5) === 0) {
      // logger.info("BrillPOSTrainer.prototype.train: training iteration: " + iterationNumber);
    }
    // logger.debug("BrillPOSTrainer.prototype.train: highRule selected: " + highRule.key());
    // logger.debug("BrillPOSTrainer.prototype.train: number of rules: " + this.positiveRules.nrRules());
    // logger.debug("BrillPOSTrainer.prototype.train: score of highRule: " + highRule.score());

    // Apply the high rule to each change site on its site list
    this.getSites(highRule).forEach(function (site) {
      // logger.debug("BrillPOSTrainer.prototype.train: apply highRule to: " + site);
      // logger.debug("BrillPOSTrainer.prototype.train: sentence length: " + that.corpus.sentences[site[0]].length);
      highRule.applyAt(that.corpus.sentences[site[0]], site[1])
    })

    const unseenRules = new RuleSet()
    this.getSites(highRule).forEach(function (site) {
      that.neighbourhood(site[0], site[1]).forEach(function (testSite) {
        // Generate positive rules for testSite
        const newRules = that.generatePositiveRules(testSite[0], testSite[1])

        // Disconnect test site from its rules
        // because highrule has been applied
        that.getRules(testSite[0], testSite[1]).forEach(function (rule) {
          if (!newRules.hasRule(rule)) {
            that.disconnectSiteFromRule(testSite[0], testSite[1], rule)
          }
        })

        // Connect new rules not already connected to the test site
        newRules.getRules().forEach(function (rule) {
          if (!that.siteIsAssociatedWithRule(testSite[0].testSite[1], rule)) {
            if (that.positiveRules.hasRule(rule)) {
              that.associateSiteWithRule(testSite[0], testSite[1], rule)
            } else {
              unseenRules.addRule(rule)
            }
          }
        })

        // Process unseen rules
        if (unseenRules.nrRules() > 0) {
          unseenRules.getRules().forEach(function (rule) {
            that.positiveRules.addRule(rule)
          })
          that.corpus.sentences.forEach(function (sentence, i) {
            const taggedSentence = sentence.map(function (token) {
              return [token.token, token.testTag]
            })
            sentence.forEach(function (token, j) {
              unseenRules.getRules().forEach(function (rule) {
                if (rule.isApplicableAt(sentence, taggedSentence, j)) {
                  that.associateSiteWithRule(i, j, rule)
                  that.scoreRule(rule, i, j)
                }
              })
            })
          })
        }
      })
    })

    // Select next highest scoring rule
    highRule = this.selectHighRule()
    iterationNumber++
  }
  // logger.info("BrillPOSTrainer.prototype.train: number of iterations: " + iterationNumber);
  // logger.info("BrillPOSTrainer.prototype.train: number of rules: " + this.positiveRules.nrRules());

  // Remove rules having a non-positive score
  this.positiveRules.getRules().forEach(function (rule) {
    if (rule.score() < that.ruleScoreThreshold) {
      that.positiveRules.removeRule(rule)
    }
  })

  // logger.info("BrillPOSTrainer.prototype.train: number of rules after pruning: " + this.positiveRules.nrRules());
  // logger.debug("BrillPOSTrainer.prototype.train: exit");
  return this.positiveRules
}

BrillPOSTrainer.prototype.printRulesWithScores = function () {
  let result = ''

  function compareRules (a, b) {
    if (a.score() > b.score()) {
      return -1
    } else {
      if (a.score() < b.score()) {
        return 1
      } else {
        return 0
      }
    }
  }

  const rules = this.positiveRules.getRules()
  const sortedRules = rules.sort(compareRules)

  sortedRules.forEach(function (rule) {
    // if (rule.score() > 0) {
    result += rule.score() + '\t' + rule.positive + '\t' + rule.negative + '\t' + rule.neutral + '\t' + rule.prettyPrint() + '\n'
    // }
  })
  return result
}

module.exports = BrillPOSTrainer


/***/ }),

/***/ 1280:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Corpus class for parsing and analysing corpora
  Copyright (C) 2019 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



const Lexicon = __webpack_require__(8251)

const BROWN = 1
const JSON = 2

// sentences: an array of annotated sentences
// A sentence is an array of annotated tokens
// A token is an object with (token, tag, testTag, ruleList)
function Corpus (data, typeOfCorpus, SentenceClass) {
  this.wordCount = 0
  this.sentences = []
  const that = this
  if (data) {
    // For other types of corpora add a case here and supply a parsing method
    switch (typeOfCorpus) {
      case BROWN:
        this.parseBrownCorpus(data, SentenceClass)
        break
      case JSON:
        // Assume it is a JSON object of a corpus
        data.sentences.forEach(function (s) {
          const taggedSentence = new SentenceClass(s.taggedWords)
          that.sentences.push(taggedSentence)
          that.wordCount += s.taggedWords.length
        })
        break
    }
  }
}

// data is raw text
// A corpus parsing method should split the corpus in sentences each of which
// consist of an array of tokens.
Corpus.prototype.parseBrownCorpus = function (data, SentenceClass) {
  const that = this

  const lines = data.split('\n')
  lines.forEach(function (line) {
    const trimmedLine = line.trim()
    // Only parse lines that contain characters
    if (trimmedLine !== '') {
      const taggedSentence = new SentenceClass()
      const tokens = line.trim().split(/\s+/)
      tokens.forEach(function (token) {
        that.wordCount++
        // Create a tagged sentences consisting of tokens
        const wordPlusTag = token.split('_')
        taggedSentence.addTaggedWord(wordPlusTag[0], wordPlusTag[1])
      })

      // Add the sentence to the corpus
      that.sentences.push(taggedSentence)
    }
  })
}

// Returns an array of all POS tags used in the corpus
Corpus.prototype.getTags = function () {
  return Object.keys(this.posTags)
}

// Splits the corpus in a training and testing set.
// percentageTrain is the size of the training corpus in percent
// Returns an array with two elements: training corpus, testing corpus
Corpus.prototype.splitInTrainAndTest = function (percentageTrain) {
  const corpusTrain = new Corpus()
  const corpusTest = new Corpus()

  const p = percentageTrain / 100
  this.sentences.forEach(function (sentence, i) {
    if (Math.random() < p) {
      corpusTrain.sentences.push(sentence)
    } else {
      corpusTest.sentences.push(sentence)
    }
  })
  return [corpusTrain, corpusTest]
}

// Analyses the corpus:
// - registers used POS tags
// - records the frequency of POS tag for each word
Corpus.prototype.analyse = function () {
  this.tagFrequencies = {}
  this.posTags = {}
  this.wordCount = 0

  const that = this
  this.sentences.forEach(function (sentence) {
    sentence.taggedWords.forEach(function (token) {
      that.wordCount++

      // Register the tags used in the corpus
      that.posTags[token.tag] = true

      // Register the frequency of the tag
      if (!that.tagFrequencies[token.token]) {
        that.tagFrequencies[token.token] = {}
      }
      if (!that.tagFrequencies[token.token][token.tag]) {
        that.tagFrequencies[token.token][token.tag] = 0
      }
      that.tagFrequencies[token.token][token.tag]++
    })
  })
}

// Creates a lexicon by taking the most frequently occurring tag of a word
// as the right tag
Corpus.prototype.buildLexicon = function () {
  const lexicon = new Lexicon()
  const that = this

  this.analyse()
  Object.keys(this.tagFrequencies).forEach(function (token) {
    const catToFreq = that.tagFrequencies[token]
    const categories = Object.keys(catToFreq)

    function compareByFrequency (a, b) {
      if (catToFreq[a] > catToFreq[b]) {
        return -1
      } else {
        if (catToFreq[a] < catToFreq[b]) {
          return 1
        } else {
          return 0
        }
      }
    }

    const sortedCategories = categories.sort(compareByFrequency)
    lexicon.addWord(token, sortedCategories)
  })
  return lexicon
}

Corpus.prototype.tag = function (lexicon) {
  this.sentences.forEach(function (sentence) {
    sentence.taggedWords.forEach(function (token) {
      // tagWord returns a list of categories, take the first category
      token.testTag = lexicon.tagWord(token.token)[0]
    })
  })
}

Corpus.prototype.nrSentences = function () {
  return this.sentences.length
}

Corpus.prototype.nrWords = function () {
  return this.wordCount
}

Corpus.prototype.generateFeatures = function () {
  let features = []
  this.sentences.forEach(function (sentence) {
    features = sentence.generateFeatures(features)
  })
  // console.log(JSON.stringify(features));
  return features
}

Corpus.prototype.prettyPrint = function () {
  this.sentences.forEach(function (sentence, index) {
    // logger.debug("sentence no " + index + "\n" +
    //  JSON.stringify(sentence, null, 2));
  })
}

module.exports = Corpus


/***/ }),

/***/ 2640:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Predicates for the Brill tagger
  Copyright (C) 2019 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



const DEBUG = false

const predicates = __webpack_require__(7937)
DEBUG && console.log('RuleSet loaded predicates: ' + predicates)

function Predicate (name, parameter1, parameter2) {
  this.name = name
  this.meta = predicates[name]
  if (!this.meta) {
    this.meta = predicates.DEFAULT
  }
  // if (this.meta.nrParameters > 0) {
  this.parameter1 = parameter1
  // }
  // if (this.meta.nrParameters > 1) {
  this.parameter2 = parameter2
  // }
  DEBUG && console.log('Predicate\n' + JSON.toString(this.meta, null, 2))
}

Predicate.prototype.evaluate = function (sentence, position) {
  DEBUG && console.log('Predicate.evalute: ' + this.name)
  const predicate = this.meta.function
  return (predicate(sentence, position, this.parameter1, this.parameter2))
}

module.exports = Predicate


/***/ }),

/***/ 9385:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
   Set of transformation rules
   Copyright (C) 2019 Hugo W.L. ter Doest

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict '

const TFParser = __webpack_require__(4404)

const dutchRuleSet = __webpack_require__(5704)
const englishRuleSet = __webpack_require__(1970)

const DEBUG = false

// Constructor takes a language abbreviation and loads the right rule set
function RuleSet (language) {
  let data = englishRuleSet
  DEBUG && console.log(data)
  switch (language) {
    case 'EN':
      data = englishRuleSet
      break
    case 'DU':
      data = dutchRuleSet
      break
  }
  if (data.rules) {
    this.rules = {}
    const that = this
    data.rules.forEach(function (ruleString) {
      that.addRule(TFParser.parse(ruleString))
    })
  }
  DEBUG && console.log(this.rules)
  DEBUG && console.log('Brill_POS_Tagger.read_transformation_rules: number of transformation rules read: ' + Object.keys(this.rules).length)
}

RuleSet.prototype.addRule = function (rule) {
  // this.rules.push(rule);
  if (!this.rules[rule.key()]) {
    this.rules[rule.key()] = rule
    return true
  } else {
    return false
  }
}

RuleSet.prototype.removeRule = function (rule) {
  if (this.rules[rule.key()]) {
    delete this.rules[rule.key()]
  }
}

RuleSet.prototype.getRules = function () {
  const that = this
  return Object.keys(this.rules).map(function (key) {
    return that.rules[key]
  })
}

RuleSet.prototype.nrRules = function () {
  return Object.keys(this.rules).length
}

RuleSet.prototype.hasRule = function (rule) {
  if (this.rules[rule.key()]) {
    return true
  } else {
    return false
  }
}

RuleSet.prototype.prettyPrint = function () {
  let result = ''
  const that = this
  Object.keys(this.rules).forEach(function (key) {
    const rule = that.rules[key]
    result += rule.prettyPrint() + '\n'
  })
  return result
}

module.exports = RuleSet


/***/ }),

/***/ 218:
/***/ ((module) => {

/*
  Rule Template class for deriving transformation rules.
  Copyright (C) 2017 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function RuleTemplate (templateName, metadata) {
  this.predicateName = templateName
  this.meta = metadata
}

RuleTemplate.prototype.windowFitsSite = function (sentence, i) {
  return ((i + this.meta.window[0] >= 0) &&
    (i + this.meta.window[0] < sentence.taggedWords.length) &&
    (i + this.meta.window[1] >= 0) &&
    (i + this.meta.window[1] < sentence.taggedWords.length))
}

module.exports = RuleTemplate


/***/ }),

/***/ 7937:
/***/ ((module) => {

"use strict";
/*
  Rule templates that provide metadata for generating transformation rules
  Copyright (C) 2017 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



const ruleTemplates = {
  // Predicates as used in the English rules in data/English/tr_from_posjs.txt
  'NEXT-TAG': {
    // maps to the predicate function
    function: nextTagIs,
    // Minimum required space before or after current position to be a relevant predicate
    window: [0, 1],
    // The number of parameters the predicate takes
    nrParameters: 1,
    // Function that returns relevant values for parameter 1
    parameter1Values: nextTagParameterValues
  },
  'NEXT-WORD-IS-CAP': {
    function: nextWordIsCap,
    window: [0, 1],
    nrParameters: 0
  },
  'PREV-1-OR-2-OR-3-TAG': {
    function: prev1Or2Or3Tag,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prev1Or2Or3TagParameterValues
  },
  'PREV-1-OR-2-TAG': {
    function: prev1Or2Tag,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prev1Or2TagParameterValues
  },
  'NEXT-WORD-IS-TAG': {
    function: nextTagIs,
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: nextTagParameterValues
  },
  'PREV-TAG': {
    function: prevTagIs,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prevTagParameterValues
  },
  /*
 "CURRENT-WORD-IS-TAG": {
   "function": current_word_is_tag,
   "window": [0],
   "nrParameter": 1,
   "parameter1Values": currentTagParameterValues
   },
  */
  'PREV-WORD-IS-CAP': {
    function: prevWordIsCap,
    window: [-1, 0],
    nrParameters: 0
  },
  'CURRENT-WORD-IS-CAP': {
    function: currentWordIsCap,
    window: [0, 0],
    nrParameters: 0
  },
  'CURRENT-WORD-IS-NUMBER': {
    function: currentWordIsNumber,
    window: [0, 0],
    nrParameters: 0
  },
  'CURRENT-WORD-IS-URL': {
    function: currentWordIsURL,
    window: [0, 0],
    nrParameters: 0
  },
  'CURRENT-WORD-ENDS-WITH': {
    function: currentWordEndsWith,
    window: [0, 0],
    nrParameters: 1,
    parameter1Values: currentWordEndsWithParameterValues
  },
  'PREV-WORD-IS': {
    function: prevWordIs,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prevWordParameterValues
  },

  // Predicates as used in the Dutch rules in data/Dutch/brill_CONTEXTRULES.jg
  PREVTAG: {
    function: prevTagIs,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prevTagParameterValues
  },
  NEXT1OR2TAG: {
    function: next1Or2TagIs,
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: next1Or2TagIsParameterValues
  },
  NEXTTAG: {
    function: nextTagIs,
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: nextTagParameterValues
  },
  PREV1OR2TAG: {
    function: prev1Or2Tag,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prev1Or2TagParameterValues
  },
  WDAND2TAGAFT: {
    function: currentWordAnd2TagAfterAre,
    window: [0, 2],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: twoTagAfterParameterValues
  },
  NEXT1OR2OR3TAG: {
    function: next1Or2Or3Tag,
    // Minimum required window to apply this template is one tag to the right
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: next1Or2Or3TagParameterValues
  },
  CURWD: {
    function: currentWordIs,
    window: [0, 0],
    nrParameters: 1,
    parameter1Values: currentWordParameterValues
  },
  SURROUNDTAG: {
    function: surroundedByTags,
    window: [-1, 1],
    nrParameters: 2,
    parameter1Values: prevTagParameterValues,
    parameter2Values: nextTagParameterValues
  },
  PREV1OR2OR3TAG: {
    function: prev1Or2Or3Tag,
    // Minimum required window to apply this template is one tag to the left
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prev1Or2Or3TagParameterValues
  },
  WDNEXTTAG: {
    function: currentWordAndNextTagAre,
    window: [0, 1],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: nextTagParameterValues
  },
  PREV1OR2WD: {
    function: prev1Or2WordIs,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prev1Or2WordParameterValues
  },
  NEXTWD: {
    function: nextWordIs,
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: nextWordParameterValues
  },
  PREVWD: {
    function: prevWordIs,
    window: [-1, 0],
    nrParameters: 1,
    parameter1Values: prevWordParameterValues
  },
  NEXT2TAG: {
    function: next2TagIs,
    window: [0, 2],
    nrParameters: 1,
    parameter1Values: next2TagParameterValues
  },
  WDAND2TAGBFR: {
    function: currentWordAnd2TagBeforeAre,
    window: [-2, 0],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: twoTagBeforeParameterValues
  },
  WDAND2AFT: {
    function: currentWordAnd2AfterAre,
    window: [0, 2],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: twoTagAfterParameterValues
  },
  WDPREVTAG: {
    function: currentWordAndPrevTagAre,
    window: [-1, 0],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: prevTagParameterValues
  },
  RBIGRAM: {
    function: rightBigramIs,
    window: [0, 1],
    nrParameters: 2,
    parameter1Values: currentWordParameterValues,
    parameter2Values: nextWordParameterValues
  },
  LBIGRAM: {
    function: leftBigramIs,
    window: [-1, 0],
    nrParameters: 2,
    parameter1Values: prevWordParameterValues,
    parameter2Values: currentWordParameterValues
  },
  NEXTBIGRAM: {
    function: nextBigramIs,
    window: [0, 2],
    nrParameters: 2,
    parameter1Values: nextWordParameterValues,
    parameter2Values: twoWordAfterParameterValues
  },
  PREVBIGRAM: {
    function: prevBigramIs,
    window: [-2, 0],
    nrParameters: 2,
    parameter1Values: twoWordBeforeParameterValues,
    parameter2Values: prevWordParameterValues
  },
  PREV2TAG: {
    function: prev2TagIs,
    window: [-2, 0],
    nrParameters: 2,
    parameter1Values: twoTagBeforeParameterValues,
    parameter2Values: prevTagParameterValues
  },
  NEXT1OR2WD: {
    function: next1Or2WordIs,
    window: [0, 1],
    nrParameters: 1,
    parameter1Values: next1Or2WordParameterValues
  },
  DEFAULT: {
    function: defaultPredicate,
    window: [0, 0],
    nrParameters: 0
  }
}

// ==================================
// Predicates that start with words
// ==================================
function nextWordIsCap (sentence, i, parameter) {
  if (i < sentence.taggedWords.length - 1) {
    const nextWord = sentence.taggedWords[i + 1].token
    return (nextWord[0] === nextWord[0].toUpperCase())
  }
  return (false)
}

function nextWordIs (sentence, i, parameter) {
  if (i < sentence.taggedWords.length - 1) {
    return (sentence.taggedWords[i + 1].token === parameter)
  }
}

function nextWordParameterValues (sentence, i) {
  if (i < sentence.taggedWords.length - 1) {
    return [sentence.taggedWords[i + 1].token]
  } else {
    return []
  }
}

function prevWordIsCap (sentence, i, parameter) {
  let prevWord = null
  if (i > 0) {
    prevWord = sentence.taggedWords[i - 1].token
    return (prevWord[0] === prevWord[0].toUpperCase())
  }
  return (false)
}

function currentWordIsCap (sentence, i, parameter) {
  const currentWord = sentence.taggedWords[i].token
  return (currentWord[0] === currentWord[0].toUpperCase())
}

function currentWordParameterValues (sentence, i) {
  return [sentence[i].token]
}

function currentWordIs (sentence, i, parameter) {
  return (sentence.taggedWords[i].token === parameter)
}

function isNumeric (num) {
  return (!isNaN(num))
}

function currentWordIsNumber (sentence, i, parameter) {
  let isNumber = isNumeric(sentence.taggedWords[i].token)
  // Attempt to parse it as a float
  if (!isNumber) {
    isNumber = parseFloat(sentence.taggedWords[i].token)
  }
  return ((parameter === 'YES') ? isNumber : !isNumber)
}

// Checks if the current word is a url
// Adapted from the original Javascript Brill tagger
function currentWordIsURL (sentence, i, parameter) {
  let isURL = false
  if (sentence.taggedWords[i].token.indexOf('.') > -1) {
    // url if there are two contiguous alpha characters
    if (/[a-zA-Z]{2}/.test(sentence.taggedWords[i].token)) {
      isURL = true
    }
  }
  return ((parameter === 'YES') ? isURL : !isURL)
}

function currentWordAnd2TagAfterAre (sentence, i, parameter1, parameter2) {
  if (i < sentence.taggedWords.length - 2) {
    if (sentence.taggedWords[i + 2][1] === parameter2) {
      return (sentence.taggedWords[i].token === parameter1)
    } else {
      return (false)
    }
  } else {
    return (false)
  }
}

function twoTagAfterParameterValues (sentence, i) {
  if (i < sentence.taggedWords.length - 2) {
    return [sentence.taggedWords[i + 2].tag]
  } else {
    return []
  }
}

function currentWordAndNextTagAre (sentence, i, parameter1, parameter2) {
  let nextTag = false
  // check current word
  const currentWord = (sentence.taggedWords[i].token === parameter1)
  // check next tag
  if (i < sentence.taggedWords.length - 1) {
    nextTag = (sentence.taggedWords[i + 1].tag === parameter2)
  }
  return (currentWord && nextTag)
}

function currentWordAndPrevTagAre (sentence, i, parameter1, parameter2) {
  let prevTag = false
  // check current word
  const currentWord = (sentence.taggedWords[i].token === parameter2)
  // check prev tag
  if (i > 0) {
    prevTag = (sentence.taggedWords[i - 1].tag === parameter1)
  }
  return (currentWord && prevTag)
}

function currentWordAnd2TagBeforeAre (sentence, i, parameter1, parameter2) {
  let twoTagsBefore = false
  // check current word
  const currentWord = (sentence.taggedWords[i].token === parameter2)
  if (i > 1) {
    // check two tags before
    twoTagsBefore = (sentence.taggedWords[i - 2].tag === parameter1)
  }
  return (currentWord && twoTagsBefore)
}

function twoTagBeforeParameterValues (sentence, i) {
  if (i > 1) {
    return [sentence.taggedWords[i - 2].tag]
  } else {
    return []
  }
}

function currentWordAnd2AfterAre (sentence, i, parameter1, parameter2) {
  let twoWordsAfter = false
  // check current word
  const currentWord = (sentence.taggedWords[i].token === parameter1)
  if (i < sentence.taggedWords.length - 2) {
    twoWordsAfter = (sentence.taggedWords[i + 2].token === parameter2)
  }
  return (currentWord && twoWordsAfter)
}

function prevWordIs (sentence, i, parameter) {
  if (i > 0) {
    return (sentence.taggedWords[i - 1].token.toLowerCase() === parameter.toLowerCase())
  } else {
    return (false)
  }
}

// Returns the right value for parameter 1 of prevWordIs
function prevWordParameterValues (sentence, i) {
  if (i > 0) {
    return [sentence.taggedWords[i - 1].token]
  } else {
    return []
  }
}

function prev1Or2WordIs (sentence, i, parameter) {
  let prev1 = false
  let prev2 = false
  if (i > 0) {
    prev1 = (sentence.taggedWords[i - 1].token.toLowerCase() === parameter.toLowerCase())
  }
  if (i > 1) {
    prev2 = (sentence.taggedWords[i - 2].token.toLowerCase() === parameter.toLowerCase())
  }
  return (prev1 || prev2)
}

function prev1Or2WordParameterValues (sentence, i) {
  const values = []
  if (i > 0) {
    values.push(sentence[i - 1].token)
  }
  if (i > 1) {
    values.push(sentence[i - 2].token)
  }
  return values
}

// Indicates whether or not this string ends with the specified string.
// Adapted from the original Javascript Brill tagger
function currentWordEndsWith (sentence, i, parameter) {
  const word = sentence.taggedWords[i].token
  if (!parameter || (parameter.length > word.length)) {
    return false
  }
  return (word.indexOf(parameter) === (word.length - parameter.length))
}

// sentence is an array of token records
function currentWordEndsWithParameterValues (sentence, i) {
  const values = ['ing']

  return values
}

function rightBigramIs (sentence, i, parameter1, parameter2) {
  const word1 = (sentence.taggedWords[i].token === parameter1)
  let word2 = false
  if (i < sentence.taggedWords.length - 1) {
    word2 = (sentence.taggedWords[i + 1].token === parameter2)
  }
  return (word1 && word2)
}

function leftBigramIs (sentence, i, parameter1, parameter2) {
  let word1 = false
  const word2 = (sentence.taggedWords[i].token === parameter2)
  if (i > 0) {
    word1 = (sentence.taggedWords[i - 1].token === parameter1)
  }
  return (word1 && word2)
}

function nextBigramIs (sentence, i, parameter1, parameter2) {
  let word1 = false
  let word2 = false
  if (i < sentence.taggedWords.length - 1) {
    word1 = (sentence.taggedWords[i + 1].token === parameter1)
  }
  if (i < sentence.taggedWords.length - 2) {
    word2 = (sentence.taggedWords[i + 2].token === parameter2)
  }
  return (word1 && word2)
}

function twoWordAfterParameterValues (sentence, i) {
  if (i < sentence.taggedWords.length - 2) {
    return [sentence.taggedWords[i + 2].token]
  } else {
    return []
  }
}

function prevBigramIs (sentence, i, parameter1, parameter2) {
  let word1 = false
  let word2 = false
  if (i > 1) {
    word1 = (sentence.taggedWords[i - 2].token === parameter1)
  }
  if (i > 0) {
    word2 = (sentence.taggedWords[i - 1].token === parameter2)
  }
  return (word1 && word2)
}

function twoWordBeforeParameterValues (sentence, i) {
  if (i > 1) {
    return [sentence.taggedWords[i - 2].token]
  } else {
    return []
  }
}

function next1Or2WordIs (sentence, i, parameter1, parameter2) {
  let next1 = false
  let next2 = false
  if (i < sentence.taggedWords.length - 1) {
    next1 = (sentence.taggedWords[i + 1].token === parameter1)
  }
  if (i < sentence.taggedWords.length - 2) {
    next2 = (sentence.taggedWords[i + 2].token === parameter2)
  }
  return (next1 || next2)
}

function next1Or2WordParameterValues (sentence, i) {
  const values = []
  if (i < sentence.taggedWords.length - 1) {
    values.push(sentence.taggedWords[i + 1].token)
  }
  if (i < sentence.taggedWords.length - 2) {
    values.push(sentence.taggedWords[i + 2].token)
  }
  return values
}

// ==================================
// Predicates about tags
// ==================================
function nextTagIs (sentence, i, parameter) {
  if (i < sentence.taggedWords.length - 1) {
    return (sentence.taggedWords[i + 1].tag === parameter)
  } else {
    return (false)
  }
}

function nextTagParameterValues (sentence, i) {
  if (i < sentence.taggedWords.length - 1) {
    return [sentence.taggedWords[i + 1].tag]
  } else {
    return []
  }
}

function next2TagIs (sentence, i, parameter) {
  if (i < sentence.taggedWords.length - 2) {
    return (sentence.taggedWords[i + 2].tag === parameter)
  } else {
    return (false)
  }
}

function next2TagParameterValues (sentence, i) {
  if (i < sentence.taggedWords.length - 2) {
    return [sentence.taggedWords[i + 2].tag]
  } else {
    return []
  }
}

function next1Or2TagIs (sentence, i, parameter) {
  let next1 = false
  let next2 = false
  if (i < sentence.taggedWords.length - 1) {
    next1 = (sentence.taggedWords[i + 1].tag === parameter)
  }
  if (i < sentence.taggedWords.length - 2) {
    next2 = (sentence.taggedWords[i + 2].tag === parameter)
  }
  return (next1 || next2)
}

function next1Or2TagIsParameterValues (sentence, i) {
  const values = []
  if (i < sentence.taggedWords.length - 1) {
    values.push(sentence.taggedWords[i + 1].tag)
  }
  if (i < sentence.taggedWords.length - 2) {
    values.push(sentence.taggedWords[i + 2].tag)
  }
  return values
}

function next1Or2Or3Tag (sentence, i, parameter) {
  let next3 = false
  if (i < sentence.taggedWords.length - 3) {
    next3 = (sentence.taggedWords[i + 3].tag === parameter)
  }
  return (next1Or2TagIs(sentence, i, parameter) || next3)
}

function next1Or2Or3TagParameterValues (sentence, i) {
  const values = next1Or2TagIsParameterValues(sentence, i)
  if (i < sentence.taggedWords.length - 3) {
    values.push(sentence.taggedWords[i + 3].tag)
  }
  return values
}

function surroundedByTags (sentence, i, parameter1, parameter2) {
  if (i < sentence.taggedWords.length - 1) {
    // check next tag
    if (sentence.taggedWords[i + 1].tag === parameter2) {
      // check previous tag
      if (i > 0) {
        return (sentence.taggedWords[i - 1].tag === parameter1)
      } else {
        return (false)
      }
    } else {
      return (false)
    }
  } else {
    return (false)
  }
}

function prev1Or2Or3Tag (sentence, i, parameter) {
  let prev3 = null
  if (i > 2) {
    prev3 = sentence.taggedWords[i - 3].tag
  }
  return (prev1Or2Tag(sentence, i, parameter) || (prev3 === parameter))
}

function prev1Or2Or3TagParameterValues (sentence, i) {
  const values = prev1Or2TagParameterValues(sentence, i)
  if (i > 2) {
    values.push(sentence.taggedWords[i - 3].tag)
  }
  return values
}

function prev1Or2Tag (sentence, i, parameter) {
  let prev1 = null
  if (i > 0) {
    prev1 = sentence.taggedWords[i - 1].tag
  }
  let prev2 = null
  if (i > 1) {
    prev2 = sentence.taggedWords[i - 2].tag
  }
  return ((prev1 === parameter) || (prev2 === parameter))
}

function prev1Or2TagParameterValues (sentence, i) {
  const values = []
  if (i > 0) {
    values.push(sentence.taggedWords[i - 1].tag)
  }
  if (i > 1) {
    values.push(sentence.taggedWords[i - 2].tag)
  }
  return values
}

function prevTagIs (sentence, i, parameter) {
  let prev = false
  if (i > 0) {
    prev = (sentence.taggedWords[i - 1].tag === parameter)
  }
  return (prev)
}

function prevTagParameterValues (sentence, i) {
  if (i > 0) {
    return [sentence.taggedWords[i - 1].tag]
  } else {
    return []
  }
}

// Looks like a useless predicate because transformation already take the
// current tag into account
/*
function currentWordIsTag (sentence, i, parameter) {
  return (sentence.taggedWords[i].tag === parameter)
}
*/

function prev2TagIs (sentence, i, parameter) {
  let prev2 = false
  if (i > 1) {
    prev2 = (sentence.taggedWords[i - 2].tag === parameter)
  }
  return (prev2)
}

function defaultPredicate (sentence, i, parameter) {
  return (false)
}

module.exports = ruleTemplates


/***/ }),

/***/ 782:
/***/ ((module) => {

/*
  Sentence class that generates sample elements from sentences
  Copyright (C) 2018 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'úse strict'

function Sentence (data) {
  this.taggedWords = []
  if (data) {
    this.taggedWords = data
  }
}

Sentence.prototype.addTaggedWord = function (token, tag) {
  this.taggedWords.push({
    token: token,
    tag: tag
  })
}

Sentence.prototype.clone = function () {
  const s = new Sentence()
  this.taggedWords.forEach(function (wordObject) {
    s.addTaggedWord(wordObject.token, wordObject.tag)
  })
  return s
}

module.exports = Sentence


/***/ }),

/***/ 4404:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* jscpd:ignore-start */

/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */


function peg$subclass (child, parent) {
  function ctor () { this.constructor = child }
  ctor.prototype = parent.prototype
  child.prototype = new ctor()
}

function peg$SyntaxError (message, expected, found, location) {
  this.message = message
  this.expected = expected
  this.found = found
  this.location = location
  this.name = 'SyntaxError'

  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, peg$SyntaxError)
  }
}

peg$subclass(peg$SyntaxError, Error)

peg$SyntaxError.buildMessage = function (expected, found) {
  const DESCRIBE_EXPECTATION_FNS = {
    literal: function (expectation) {
      return '"' + literalEscape(expectation.text) + '"'
    },

    class: function (expectation) {
      let escapedParts = ''
      let i

      for (i = 0; i < expectation.parts.length; i++) {
        escapedParts += expectation.parts[i] instanceof Array
          ? classEscape(expectation.parts[i][0]) + '-' + classEscape(expectation.parts[i][1])
          : classEscape(expectation.parts[i])
      }

      return '[' + (expectation.inverted ? '^' : '') + escapedParts + ']'
    },

    any: function (expectation) {
      return 'any character'
    },

    end: function (expectation) {
      return 'end of input'
    },

    other: function (expectation) {
      return expectation.description
    }
  }

  function hex (ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase()
  }

  function literalEscape (s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g, function (ch) { return '\\x0' + hex(ch) })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return '\\x' + hex(ch) })
  }

  function classEscape (s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g, '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g, function (ch) { return '\\x0' + hex(ch) })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return '\\x' + hex(ch) })
  }

  function describeExpectation (expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation)
  }

  function describeExpected (expected) {
    const descriptions = new Array(expected.length)
    let i; let j

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i])
    }

    descriptions.sort()

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i]
          j++
        }
      }
      descriptions.length = j
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0]

      case 2:
        return descriptions[0] + ' or ' + descriptions[1]

      default:
        return descriptions.slice(0, -1).join(', ') +
          ', or ' +
          descriptions[descriptions.length - 1]
    }
  }

  function describeFound (found) {
    return found ? '"' + literalEscape(found) + '"' : 'end of input'
  }

  return 'Expected ' + describeExpected(expected) + ' but ' + describeFound(found) + ' found.'
}

function peg$parse (input, options) {
  options = options !== void 0 ? options : {}

  const peg$FAILED = {}

  const peg$startRuleFunctions = { transformation_rule: peg$parsetransformation_rule }
  let peg$startRuleFunction = peg$parsetransformation_rule

  const peg$c0 = function (c1, c2, pred, pars) {
    let result = null

    // Construct rule
    if (pars.length === 1) {
      result = new TransformationRule(c1, c2, pred, pars[0])
    } else {
      if (pars.length === 2) {
        result = new TransformationRule(c1, c2, pred, pars[0], pars[1])
      } else {
        result = new TransformationRule(c1, c2, pred)
      }
    }
    return (result)
  }
  const peg$c1 = /^[!-~\xA1-\xFF]/
  const peg$c2 = peg$classExpectation([['!', '~'], ['\xA1', '\xFF']], false, false)
  const peg$c3 = function (characters) {
    let s = ''
    for (let i = 0; i < characters.length; i++) {
      s += characters[i]
    }
    return (s)
  }
  const peg$c4 = '*'
  const peg$c5 = peg$literalExpectation('*', false)
  const peg$c6 = function (wc) {
    return (wc)
  }
  const peg$c7 = '\r\n'
  const peg$c8 = peg$literalExpectation('\r\n', false)
  const peg$c9 = '\n'
  const peg$c10 = peg$literalExpectation('\n', false)
  const peg$c11 = '\r'
  const peg$c12 = peg$literalExpectation('\r', false)
  const peg$c13 = '//'
  const peg$c14 = peg$literalExpectation('//', false)
  const peg$c15 = peg$anyExpectation()
  const peg$c16 = ' '
  const peg$c17 = peg$literalExpectation(' ', false)
  const peg$c18 = '\t'
  const peg$c19 = peg$literalExpectation('\t', false)

  let peg$currPos = 0
  let peg$savedPos = 0
  const peg$posDetailsCache = [{ line: 1, column: 1 }]
  let peg$maxFailPos = 0
  let peg$maxFailExpected = []
  let peg$silentFails = 0

  let peg$result

  if ('startRule' in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + '".')
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule]
  }

  function text () {
    return input.substring(peg$savedPos, peg$currPos)
  }

  function location () {
    return peg$computeLocation(peg$savedPos, peg$currPos)
  }

  function expected (description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    )
  }

  function error (message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location)
  }

  function peg$literalExpectation (text, ignoreCase) {
    return { type: 'literal', text: text, ignoreCase: ignoreCase }
  }

  function peg$classExpectation (parts, inverted, ignoreCase) {
    return { type: 'class', parts: parts, inverted: inverted, ignoreCase: ignoreCase }
  }

  function peg$anyExpectation () {
    return { type: 'any' }
  }

  function peg$endExpectation () {
    return { type: 'end' }
  }

  function peg$otherExpectation (description) {
    return { type: 'other', description: description }
  }

  function peg$computePosDetails (pos) {
    let details = peg$posDetailsCache[pos]; let p

    if (details) {
      return details
    } else {
      p = pos - 1
      while (!peg$posDetailsCache[p]) {
        p--
      }

      details = peg$posDetailsCache[p]
      details = {
        line: details.line,
        column: details.column
      }

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++
          details.column = 1
        } else {
          details.column++
        }

        p++
      }

      peg$posDetailsCache[pos] = details
      return details
    }
  }

  function peg$computeLocation (startPos, endPos) {
    const startPosDetails = peg$computePosDetails(startPos)
    const endPosDetails = peg$computePosDetails(endPos)

    return {
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    }
  }

  function peg$fail (expected) {
    if (peg$currPos < peg$maxFailPos) { return }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos
      peg$maxFailExpected = []
    }

    peg$maxFailExpected.push(expected)
  }

  function peg$buildSimpleError (message, location) {
    return new peg$SyntaxError(message, null, null, location)
  }

  function peg$buildStructuredError (expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    )
  }

  function peg$parsetransformation_rule () {
    let s0, s1, s2, s3, s4, s5

    s0 = peg$currPos
    s1 = peg$parsecategory1()
    if (s1 !== peg$FAILED) {
      s2 = peg$parseidentifier()
      if (s2 !== peg$FAILED) {
        s3 = peg$parseidentifier()
        if (s3 !== peg$FAILED) {
          s4 = []
          s5 = peg$parseidentifier()
          while (s5 !== peg$FAILED) {
            s4.push(s5)
            s5 = peg$parseidentifier()
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0
            s1 = peg$c0(s1, s2, s3, s4)
            s0 = s1
          } else {
            peg$currPos = s0
            s0 = peg$FAILED
          }
        } else {
          peg$currPos = s0
          s0 = peg$FAILED
        }
      } else {
        peg$currPos = s0
        s0 = peg$FAILED
      }
    } else {
      peg$currPos = s0
      s0 = peg$FAILED
    }

    return s0
  }

  function peg$parsecategory1 () {
    let s0

    s0 = peg$parsewild_card()
    if (s0 === peg$FAILED) {
      s0 = peg$parseidentifier()
    }

    return s0
  }

  function peg$parseidentifier () {
    let s0, s1, s2

    s0 = peg$currPos
    s1 = []
    if (peg$c1.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos)
      peg$currPos++
    } else {
      s2 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c2) }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2)
        if (peg$c1.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos)
          peg$currPos++
        } else {
          s2 = peg$FAILED
          if (peg$silentFails === 0) { peg$fail(peg$c2) }
        }
      }
    } else {
      s1 = peg$FAILED
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseS_no_eol()
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0
        s1 = peg$c3(s1)
        s0 = s1
      } else {
        peg$currPos = s0
        s0 = peg$FAILED
      }
    } else {
      peg$currPos = s0
      s0 = peg$FAILED
    }

    return s0
  }

  function peg$parsewild_card () {
    let s0, s1, s2

    s0 = peg$currPos
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c4
      peg$currPos++
    } else {
      s1 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c5) }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseS_no_eol()
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0
        s1 = peg$c6(s1)
        s0 = s1
      } else {
        peg$currPos = s0
        s0 = peg$FAILED
      }
    } else {
      peg$currPos = s0
      s0 = peg$FAILED
    }

    return s0
  }

  function peg$parseEOL () {
    let s0

    if (input.substr(peg$currPos, 2) === peg$c7) {
      s0 = peg$c7
      peg$currPos += 2
    } else {
      s0 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c8) }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c9
        peg$currPos++
      } else {
        s0 = peg$FAILED
        if (peg$silentFails === 0) { peg$fail(peg$c10) }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 13) {
          s0 = peg$c11
          peg$currPos++
        } else {
          s0 = peg$FAILED
          if (peg$silentFails === 0) { peg$fail(peg$c12) }
        }
      }
    }

    return s0
  }

  function peg$parseComment () {
    let s0, s1, s2, s3, s4, s5

    s0 = peg$currPos
    if (input.substr(peg$currPos, 2) === peg$c13) {
      s1 = peg$c13
      peg$currPos += 2
    } else {
      s1 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c14) }
    }
    if (s1 !== peg$FAILED) {
      s2 = []
      s3 = peg$currPos
      s4 = peg$currPos
      peg$silentFails++
      s5 = peg$parseEOL()
      peg$silentFails--
      if (s5 === peg$FAILED) {
        s4 = void 0
      } else {
        peg$currPos = s4
        s4 = peg$FAILED
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos)
          peg$currPos++
        } else {
          s5 = peg$FAILED
          if (peg$silentFails === 0) { peg$fail(peg$c15) }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5]
          s3 = s4
        } else {
          peg$currPos = s3
          s3 = peg$FAILED
        }
      } else {
        peg$currPos = s3
        s3 = peg$FAILED
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3)
        s3 = peg$currPos
        s4 = peg$currPos
        peg$silentFails++
        s5 = peg$parseEOL()
        peg$silentFails--
        if (s5 === peg$FAILED) {
          s4 = void 0
        } else {
          peg$currPos = s4
          s4 = peg$FAILED
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos)
            peg$currPos++
          } else {
            s5 = peg$FAILED
            if (peg$silentFails === 0) { peg$fail(peg$c15) }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5]
            s3 = s4
          } else {
            peg$currPos = s3
            s3 = peg$FAILED
          }
        } else {
          peg$currPos = s3
          s3 = peg$FAILED
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseEOL()
        if (s3 === peg$FAILED) {
          s3 = peg$parseEOI()
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3]
          s0 = s1
        } else {
          peg$currPos = s0
          s0 = peg$FAILED
        }
      } else {
        peg$currPos = s0
        s0 = peg$FAILED
      }
    } else {
      peg$currPos = s0
      s0 = peg$FAILED
    }

    return s0
  }

  function peg$parseS () {
    let s0, s1

    s0 = []
    if (input.charCodeAt(peg$currPos) === 32) {
      s1 = peg$c16
      peg$currPos++
    } else {
      s1 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c17) }
    }
    if (s1 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 9) {
        s1 = peg$c18
        peg$currPos++
      } else {
        s1 = peg$FAILED
        if (peg$silentFails === 0) { peg$fail(peg$c19) }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseEOL()
        if (s1 === peg$FAILED) {
          s1 = peg$parseComment()
        }
      }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1)
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c16
        peg$currPos++
      } else {
        s1 = peg$FAILED
        if (peg$silentFails === 0) { peg$fail(peg$c17) }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s1 = peg$c18
          peg$currPos++
        } else {
          s1 = peg$FAILED
          if (peg$silentFails === 0) { peg$fail(peg$c19) }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$parseEOL()
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment()
          }
        }
      }
    }

    return s0
  }

  function peg$parseS_no_eol () {
    let s0, s1

    s0 = []
    if (input.charCodeAt(peg$currPos) === 32) {
      s1 = peg$c16
      peg$currPos++
    } else {
      s1 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c17) }
    }
    if (s1 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 9) {
        s1 = peg$c18
        peg$currPos++
      } else {
        s1 = peg$FAILED
        if (peg$silentFails === 0) { peg$fail(peg$c19) }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseComment()
      }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1)
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c16
        peg$currPos++
      } else {
        s1 = peg$FAILED
        if (peg$silentFails === 0) { peg$fail(peg$c17) }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s1 = peg$c18
          peg$currPos++
        } else {
          s1 = peg$FAILED
          if (peg$silentFails === 0) { peg$fail(peg$c19) }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$parseComment()
        }
      }
    }

    return s0
  }

  function peg$parseEOI () {
    let s0, s1

    s0 = peg$currPos
    peg$silentFails++
    if (input.length > peg$currPos) {
      s1 = input.charAt(peg$currPos)
      peg$currPos++
    } else {
      s1 = peg$FAILED
      if (peg$silentFails === 0) { peg$fail(peg$c15) }
    }
    peg$silentFails--
    if (s1 === peg$FAILED) {
      s0 = void 0
    } else {
      peg$currPos = s0
      s0 = peg$FAILED
    }

    return s0
  }

  var TransformationRule = __webpack_require__(3275)

  peg$result = peg$startRuleFunction()

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation())
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    )
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse: peg$parse
}
/* jscpd:ignore-end */


/***/ }),

/***/ 3275:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Transformation rules for the Brill tagger
  Copyright (C) 2017 Hugo W.L. ter Doest

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



const Predicate = __webpack_require__(2640)

// logger.setLevel('INFO');

const categoryWildCard = '*'

function TransformationRule (c1, c2, predicate, parameter1, parameter2) {
  this.literal = [c1, c2, predicate, parameter1, parameter2]
  this.predicate = new Predicate(predicate, parameter1, parameter2)
  this.oldCategory = c1
  this.newCategory = c2
  // These members are for the learning algorithm
  this.neutral = 0
  this.negative = 0
  this.positive = 0
  this.hasBeenSelectedAsHighRuleBefore = false
}

TransformationRule.prototype.key = function () {
  return (this.literal.toString())
}

TransformationRule.prototype.apply = function (sentence, position) {
  if ((sentence.taggedWords[position].tag === this.oldCategory) ||
      (this.oldCategory === categoryWildCard)) {
    if (this.predicate.evaluate(sentence, position)) {
      sentence.taggedWords[position].tag = this.newCategory
    }
  }
}

//
// Methods for processing sentences from a corpus that consist of an array of tokens
//

// Returns true if the rule applies at site. As a side effect it assigns the new
// category to newTag
TransformationRule.prototype.isApplicableAt = function (sentence, taggedSentence, i) {
  const applies = (taggedSentence.taggedWords[i].tag === this.oldCategory) &&
    this.predicate.evaluate(taggedSentence, i)

  // Set newTag to let the trainer know what the new tag would become
  if (applies) {
    sentence.taggedWords[i].newTag = this.newCategory
  }
  return (applies)
}

TransformationRule.prototype.prettyPrint = function () {
  let result = ''
  // Old category and new category
  result += this.oldCategory + ' ' + this.newCategory
  // Predicate name
  result += ' ' + this.predicate.name
  // Parameter 1 and 2
  if (this.predicate.parameter1) {
    result += ' ' + this.predicate.parameter1
    if (this.predicate.parameter2) {
      result += ' ' + this.predicate.parameter2
    }
  }
  return result
}

// Applies the rule the given location (if it applies)
TransformationRule.prototype.applyAt = function (sentence, i) {
  const taggedSentence = sentence.clone()

  this.apply(sentence, i)
  // Assign the new tag to the corpus site
  sentence.taggedWords[i].testTag = taggedSentence.taggedWords[i].tag
}

// Calculate the net score of this rule
TransformationRule.prototype.score = function () {
  return (this.positive - this.negative)
}

module.exports = TransformationRule


/***/ }),

/***/ 2143:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Classifier = __webpack_require__(7579)
const ApparatusBayesClassifier = __webpack_require__(9824).BayesClassifier

const BayesClassifier = function (stemmer, smoothing) {
  let abc = new ApparatusBayesClassifier()
  if (smoothing && isFinite(smoothing)) {
    abc = new ApparatusBayesClassifier(smoothing)
  }
  Classifier.call(this, abc, stemmer)
}

util.inherits(BayesClassifier, Classifier)

function restore (classifier, stemmer) {
  classifier = Classifier.restore(classifier, stemmer)
  // __proto__ is deprecated
  // classifier.__proto__ = BayesClassifier.prototype
  Object.setPrototypeOf(classifier, BayesClassifier.prototype)
  classifier.classifier = ApparatusBayesClassifier.restore(classifier.classifier)

  return classifier
}

function load (filename, stemmer, callback) {
  Classifier.load(filename, function (err, classifier) {
    if (err) {
      return callback(err)
    } else {
      callback(err, restore(classifier, stemmer))
    }
  })
}

BayesClassifier.restore = restore
BayesClassifier.load = load

module.exports = BayesClassifier


/***/ }),

/***/ 7579:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const PorterStemmer = __webpack_require__(7558)
const events = __webpack_require__(7187)

const parallelTrainer = __webpack_require__(6478)

const Classifier = function (classifier, stemmer) {
  this.classifier = classifier
  this.docs = []
  this.features = {}
  this.stemmer = stemmer || PorterStemmer
  this.lastAdded = 0
  this.events = new events.EventEmitter()
}

function addDocument (text, classification) {
  // Ignore further processing if classification is undefined
  if (typeof classification === 'undefined') return

  // If classification is type of string then make sure it's dosen't have blank space at both end
  if (typeof classification === 'string') {
    classification = classification.trim()
  }

  if (typeof text === 'string') { text = this.stemmer.tokenizeAndStem(text, this.keepStops) }

  if (text.length === 0) {
    // ignore empty documents
    return
  }

  this.docs.push({
    label: classification,
    text: text
  })

  for (let i = 0; i < text.length; i++) {
    const token = text[i]
    this.features[token] = (this.features[token] || 0) + 1
  }
}

function removeDocument (text, classification) {
  const docs = this.docs
  let doc
  let pos

  if (typeof text === 'string') {
    text = this.stemmer.tokenizeAndStem(text, this.keepStops)
  }

  for (let i = 0, ii = docs.length; i < ii; i++) {
    doc = docs[i]
    if (doc.text.join(' ') === text.join(' ') &&
        doc.label === classification) {
      pos = i
    }
  }

  // Remove if there's a match
  if (!isNaN(pos)) {
    this.docs.splice(pos, 1)

    for (let i = 0, ii = text.length; i < ii; i++) {
      delete this.features[text[i]]
    }
  }
}

function textToFeatures (observation) {
  const features = []

  if (typeof observation === 'string') { observation = this.stemmer.tokenizeAndStem(observation, this.keepStops) }

  for (const feature in this.features) {
    if (observation.indexOf(feature) > -1) { features.push(1) } else { features.push(0) }
  }

  return features
}

function train () {
  const totalDocs = this.docs.length
  for (let i = this.lastAdded; i < totalDocs; i++) {
    const features = this.textToFeatures(this.docs[i].text)
    this.classifier.addExample(features, this.docs[i].label)
    this.events.emit('trainedWithDocument', { index: i, total: totalDocs, doc: this.docs[i] })
    this.lastAdded++
  }
  this.events.emit('doneTraining', true)
  this.classifier.train()
}

function retrain () {
  this.classifier = new (this.classifier.constructor)()
  this.lastAdded = 0
  this.train()
}

function getClassifications (observation) {
  return this.classifier.getClassifications(this.textToFeatures(observation))
}

function classify (observation) {
  return this.classifier.classify(this.textToFeatures(observation))
}

function restore (classifier, stemmer) {
  classifier.stemmer = stemmer || PorterStemmer
  classifier.events = new events.EventEmitter()
  return classifier
}

function save (filename, callback) {
  const data = JSON.stringify(this)
  const fs = __webpack_require__(9603)
  const classifier = this
  fs.writeFile(filename, data, 'utf8', function (err) {
    if (callback) {
      callback(err, err ? null : classifier)
    }
  })
}

function load (filename, callback) {
  const fs = __webpack_require__(9603)

  if (!callback) {
    return
  }
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
      callback(err, null)
    } else {
      const classifier = JSON.parse(data)
      callback(err, classifier)
    }
  })
}

function setOptions (options) {
  this.keepStops = !!(options.keepStops)
}

Classifier.prototype.addDocument = addDocument
Classifier.prototype.removeDocument = removeDocument
Classifier.prototype.train = train
if (parallelTrainer.Threads) {
  Classifier.prototype.trainParallel = parallelTrainer.trainParallel
  Classifier.prototype.trainParallelBatches = parallelTrainer.trainParallelBatches
  Classifier.prototype.retrainParallel = parallelTrainer.retrainParallel
}
Classifier.prototype.retrain = retrain
Classifier.prototype.classify = classify
Classifier.prototype.textToFeatures = textToFeatures
Classifier.prototype.save = save
Classifier.prototype.getClassifications = getClassifications
Classifier.prototype.setOptions = setOptions
Classifier.restore = restore
Classifier.load = load

module.exports = Classifier


/***/ }),

/***/ 6478:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const os = __webpack_require__(8340)

let Threads = null

try {
  Threads = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'webworker-threads'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
} catch (e) {
  // Since webworker-threads are optional, only thow if the module is found
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}

function checkThreadSupport () {
  if (typeof Threads === 'undefined') {
    throw new Error('parallel classification requires the optional dependency webworker-threads')
  }
}

function docsToFeatures (docs) {
  const parsedDocs = []

  for (let i = 0; i < docs.length; i++) {
    const features = []

    for (const feature in FEATURES) { // eslint-disable-line
      if (docs[i].observation.indexOf(feature) > -1) { features.push(1) } else { features.push(0) }
    }

    parsedDocs.push({
      index: docs[i].index,
      features: features
    })
  }

  return JSON.stringify(parsedDocs)
}

// Convert docs to observation objects
function docsToObs (docs, lastAdded, stemmer, keepStops) {
  const obsDocs = []
  for (let i = lastAdded; i < docs.length; i++) {
    let observation = this.docs[i].text
    if (typeof observation === 'string') {
      observation = stemmer.tokenizeAndStem(observation, keepStops)
    }
    obsDocs.push({
      index: i,
      observation: observation
    })
  }
  return obsDocs
}

function emitEvents (self, docFeatures, totalDocs) {
  for (let j = self.lastAdded; j < totalDocs; j++) {
    self.classifier.addExample(docFeatures[j], self.docs[j].label)
    self.events.emit('trainedWithDocument', {
      index: j,
      total: totalDocs,
      doc: self.docs[j]
    })
    self.lastAdded++
  }
}

function trainParallel (numThreads, callback) {
  checkThreadSupport()

  if (!callback) {
    callback = numThreads
    numThreads = undefined
  }

  if (isNaN(numThreads)) {
    numThreads = os.cpus().length
  }

  const totalDocs = this.docs.length
  const threadPool = Threads.createPool(numThreads)
  const docFeatures = {}
  let finished = 0
  const self = this

  // Init pool; send the features array and the parsing function
  threadPool.all.eval('var FEATURES = ' + JSON.stringify(this.features))
  threadPool.all.eval(docsToFeatures)

  const obsDocs = docsToObs(this.docs, this.lastAdded, this.stemmer, this.keepStops)

  // Called when a batch completes processing
  const onFeaturesResult = function (docs) {
    setTimeout(function () {
      self.events.emit('processedBatch', {
        size: docs.length,
        docs: totalDocs,
        batches: numThreads,
        index: finished
      })
    })

    for (let j = 0; j < docs.length; j++) {
      docFeatures[docs[j].index] = docs[j].features
    }
  }

  // Called when all batches finish processing
  const onFinished = function (err) {
    if (err) {
      threadPool.destroy()
      return callback(err)
    }

    emitEvents(self, docFeatures, totalDocs)
    self.events.emit('doneTraining', true)
    self.classifier.train()

    threadPool.destroy()
    callback(null)
  }

  // Split the docs and start processing
  const batchSize = Math.ceil(obsDocs.length / numThreads)
  let lastError

  for (let i = 0; i < numThreads; i++) {
    const batchDocs = obsDocs.slice(i * batchSize, (i + 1) * batchSize)
    const batchJson = JSON.stringify(batchDocs)

    threadPool.any.eval('docsToFeatures(' + batchJson + ')', function (err, docs) {
      lastError = err || lastError
      finished++

      if (docs) {
        docs = JSON.parse(docs)
        onFeaturesResult(docs)
      }

      if (finished >= numThreads) {
        onFinished(lastError)
      }
    })
  }
}

function trainParallelBatches (options) {
  checkThreadSupport()

  let numThreads = options && options.numThreads
  let batchSize = options && options.batchSize

  if (isNaN(numThreads)) {
    numThreads = os.cpus().length
  }

  if (isNaN(batchSize)) {
    batchSize = 2500
  }

  const totalDocs = this.docs.length
  const threadPool = Threads.createPool(numThreads)
  const docFeatures = {}
  let finished = 0
  const self = this

  let abort = false
  const onError = function (err) {
    if (!err || abort) return
    abort = true
    threadPool.destroy(true)
    self.events.emit('doneTrainingError', err)
  }

  // Init pool; send the features array and the parsing function
  const str = JSON.stringify(this.features)
  threadPool.all.eval('var FEATURES = ' + str + ';', onError)
  threadPool.all.eval(docsToFeatures, onError)

  // Convert docs to observation objects
  let obsDocs = []
  for (let i = this.lastAdded; i < totalDocs; i++) {
    let observation = this.docs[i].text
    if (typeof observation === 'string') { observation = this.stemmer.tokenizeAndStem(observation, this.keepStops) }
    obsDocs.push({
      index: i,
      observation: observation
    })
  }

  // Split the docs in batches
  const obsBatches = []
  let i = 0
  while (true) {
    const batch = obsDocs.slice(i * batchSize, (i + 1) * batchSize)
    if (!batch || !batch.length) break
    obsBatches.push(batch)
    i++
  }
  obsDocs = null
  self.events.emit('startedTraining', {
    docs: totalDocs,
    batches: obsBatches.length
  })

  // Called when a batch completes processing
  const onFeaturesResult = function (docs) {
    self.events.emit('processedBatch', {
      size: docs.length,
      docs: totalDocs,
      batches: obsBatches.length,
      index: finished
    })

    for (let j = 0; j < docs.length; j++) {
      docFeatures[docs[j].index] = docs[j].features
    }
  }

  // Called when all batches finish processing
  const onFinished = function () {
    threadPool.destroy(true)
    abort = true

    emitEvents(self, docFeatures, totalDocs)
    self.events.emit('doneTraining', true)
    self.classifier.train()
  }

  // Called to send the next batch to be processed
  let batchIndex = 0
  const sendNext = function () {
    if (abort) return
    if (batchIndex >= obsBatches.length) {
      return
    }

    sendBatch(JSON.stringify(obsBatches[batchIndex]))
    batchIndex++
  }

  // Called to send a batch of docs to the threads
  const sendBatch = function (batchJson) {
    if (abort) return
    threadPool.any.eval('docsToFeatures(' + batchJson + ');', function (err, docs) {
      if (err) {
        return onError(err)
      }

      finished++

      if (docs) {
        docs = JSON.parse(docs)
        setTimeout(onFeaturesResult.bind(null, docs))
      }

      if (finished >= obsBatches.length) {
        setTimeout(onFinished)
      }

      setTimeout(sendNext)
    })
  }

  // Start processing
  for (let i = 0; i < numThreads; i++) {
    sendNext()
  }
}

function retrainParallel (numThreads, callback) {
  this.classifier = new (this.classifier.constructor)()
  this.lastAdded = 0
  this.trainParallel(numThreads, callback)
}

module.exports = {
  Threads,
  trainParallel,
  trainParallelBatches,
  retrainParallel
}


/***/ }),

/***/ 1386:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.BayesClassifier = __webpack_require__(2143)
exports.LogisticRegressionClassifier = __webpack_require__(7366)

exports.MaxEntClassifier = __webpack_require__(5034)
exports.Context = __webpack_require__(4639)
exports.Feature = __webpack_require__(3001)
exports.FeatureSet = __webpack_require__(1372)
exports.Sample = __webpack_require__(3671)
exports.Element = __webpack_require__(8898)
exports.SEElement = __webpack_require__(7967)
exports.GISScaler = __webpack_require__(3819)
exports.POSElement = __webpack_require__(3346)
exports.MESentence = __webpack_require__(2541)
exports.MECorpus = __webpack_require__(2781)


/***/ }),

/***/ 7366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Classifier = __webpack_require__(7579)
const ApparatusLogisticRegressionClassifier = __webpack_require__(9824).LogisticRegressionClassifier

const LogisticRegressionClassifier = function (stemmer) {
  Classifier.call(this, new ApparatusLogisticRegressionClassifier(), stemmer)
}

util.inherits(LogisticRegressionClassifier, Classifier)

function restore (classifier, stemmer) {
  classifier = Classifier.restore(classifier, stemmer)
  // Using ___proto__ is deprecated
  // classifier.__proto__ = LogisticRegressionClassifier.prototype
  Object.setPrototypeOf(classifier, LogisticRegressionClassifier.prototype)
  classifier.classifier = ApparatusLogisticRegressionClassifier.restore(classifier.classifier)

  return classifier
}

function load (filename, stemmer, callback) {
  Classifier.load(filename, function (err, classifier) {
    if (err) {
      callback(err)
    } else {
      callback(err, restore(classifier, stemmer))
    }
  })
}

function train () {
  // we need to reset the traning state because logistic regression
  // needs its matricies to have their widths synced, etc.
  this.lastAdded = 0
  this.classifier = new ApparatusLogisticRegressionClassifier()
  Classifier.prototype.train.call(this)
}

LogisticRegressionClassifier.prototype.train = train
LogisticRegressionClassifier.restore = restore
LogisticRegressionClassifier.load = load

module.exports = LogisticRegressionClassifier


/***/ }),

/***/ 5034:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Classifier class that provides functionality for training and
classification
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const fs = __webpack_require__(4195)

const Context = __webpack_require__(4639)
const Element = __webpack_require__(8898)
const Sample = __webpack_require__(3671)
const Scaler = __webpack_require__(3819)
const FeatureSet = __webpack_require__(1372)

function Classifier (features, sample) {
  if (features) {
    this.features = features
  } else {
    this.features = new FeatureSet()
  }
  this.features = features
  if (sample) {
    this.sample = sample
  } else {
    this.sample = new Sample()
  }
}

// Loads a classifier from file.
// Caveat: feature functions are generated from the sample elements. You need
// to create your own specialisation of the Element class that can generate
// your own specific feature functions
Classifier.prototype.load = function (filename, ElementClass, callback) {
  fs.readFile(filename, 'utf8', function (err, data) {
    if (!err) {
      const classifierData = JSON.parse(data)
      const sample = new Sample()
      classifierData.sample.elements.forEach(function (elementData) {
        const elt = new ElementClass(elementData.a, new Context(elementData.b.data))
        sample.addElement(elt)
      })
      const featureSet = new FeatureSet()
      sample.generateFeatures(featureSet)
      const classifier = new Classifier(featureSet, sample)
      callback(err, classifier)
    } else {
      if (callback) {
        callback(err)
      }
    }
  })
}

Classifier.prototype.save = function (filename, callback) {
  const data = JSON.stringify(this, null, 2)
  const classifier = this
  fs.writeFile(filename, data, 'utf8', function (err) {
    if (callback) {
      callback(err, err ? null : classifier)
    }
  })
}

Classifier.prototype.addElement = function (x) {
  this.sample.addElement(x)
}

Classifier.prototype.addDocument = function (context, classification, ElementClass) {
  Classifier.prototype.addElement(new ElementClass(classification, context))
}

Classifier.prototype.train = function (maxIterations, minImprovement, approxExpectation) {
  this.scaler = new Scaler(this.features, this.sample)
  this.p = this.scaler.run(maxIterations, minImprovement, approxExpectation)
}

Classifier.prototype.getClassifications = function (b) {
  const scores = []
  const that = this
  this.sample.getClasses().forEach(function (a) {
    const x = new Element(a, b)
    scores.push({
      label: a,
      value: that.p.calculateAPriori(x)
    })
  })
  return scores
}

Classifier.prototype.classify = function (b) {
  const scores = this.getClassifications(b)
  // Sort the scores in an array
  scores.sort(function (a, b) {
    return b.value - a.value
  })
  // Check if the classifier discriminates
  const min = scores[scores.length - 1].value
  const max = scores[0].value
  if (min === max) {
    return ''
  } else {
    // Return the highest scoring classes
    return scores[0].label
  }
}

module.exports = Classifier


/***/ }),

/***/ 4639:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Context class
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stringify = __webpack_require__(7266)

function Context (data) {
  this.data = data
}

// Create a predictable key string for looking up in a hash
Context.prototype.toString = function () {
  if (!this.key) {
    this.key = stringify(this.data)
  }
  return this.key
}

module.exports = Context


/***/ }),

/***/ 1586:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Distribution class for probability distributions
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Element = __webpack_require__(8898)

function Distribution (alpha, featureSet, sample) {
  this.alpha = alpha
  this.featureSet = featureSet
  this.sample = sample
}

// Returns the distribution as a string that can be stored for later usage
Distribution.prototype.toString = function () {

}

Distribution.prototype.weight = function (x) {
  let product = 1
  const that = this

  this.alpha.forEach(function (alphaj, j) {
    product *= Math.pow(alphaj, that.featureSet.getFeatures()[j].apply(x))
  })
  return product
}

Distribution.prototype.calculateAPriori = function (x) {
  if (!this.aPriorisBeforeNormalisation[x.toString()]) {
    this.aPriorisBeforeNormalisation[x.toString()] = this.weight(x)
  }
  return this.aPriorisBeforeNormalisation[x.toString()]// / this.aPrioriNormalisationConstant;
}

// Memoize a priori probabilities of sample elements
Distribution.prototype.prepareWeights = function () {
  this.aPriorisBeforeNormalisation = {}
  this.aPrioriNormalisationConstant = 0
  let sum = 0
  const that = this
  this.sample.elements.forEach(function (x) {
    that.aPriorisBeforeNormalisation[x.toString()] = that.weight(x)
    sum += that.aPriorisBeforeNormalisation[x.toString()]
  })
  this.aPrioriNormalisationConstant = sum
}

Distribution.prototype.calculateAPosteriori = function (x) {
  if (!this.aPriorisBeforeNormalisation[x.toString()]) {
    this.aPriorisBeforeNormalisation[x.toString()] = this.weight(x)
  }
  if (!this.aPosterioriNormalisationConstants[x.b.toString()]) {
    this.aPosterioriNormalisationConstants[x.b.toString()] = this.aPosterioriNormalisation(x.b)
  }
  return this.aPriorisBeforeNormalisation[x] / this.aPosterioriNormalisationConstants[x.b.toString()]
}

Distribution.prototype.aPosterioriNormalisation = function (b) {
  let sum = 0

  const that = this
  this.sample.getClasses().forEach(function (a) {
    sum += that.weight(new Element(a, b))
  })

  return (sum)
}

// Memoize a posteriori probabilities of sample elements
Distribution.prototype.prepareAPosterioris = function () {
  this.aPosterioriNormalisationConstants = {}

  const contextSeen = {}
  const that = this
  this.sample.elements.forEach(function (sampleElement) {
    const context = sampleElement.b
    if (!contextSeen[context]) {
      contextSeen[context] = true
      that.aPosterioriNormalisationConstants[context] =
        that.aPosterioriNormalisation(context)
    }
  })
}

// Memoize all probabilities of sample elements
Distribution.prototype.prepare = function () {
  this.prepareWeights()
  // console.log("Weights prepared");
  this.prepareAPosterioris()
}

// Relative entropy between observered distribution and derived distribution
Distribution.prototype.KullbackLieblerDistance = function () {
  let sum = 0
  const that = this
  this.sample.elements.forEach(function (x) {
    sum += that.sample.observedProbability(x) * Math.log(that.sample.observedProbability(x) / that.calculateAPriori(x))
  })
  return sum
}

Distribution.prototype.logLikelihood = function () {
  let sum = 0
  const that = this
  this.sample.elements.forEach(function (x) {
    sum += that.sample.observedProbability(x) * Math.log(that.calculateAPriori(x))
  })
  return sum
}

Distribution.prototype.entropy = function () {
  let sum = 0
  const that = this
  this.sample.elements.forEach(function (x) {
    const p = that.calculateAPriori(x)
    sum += p * Math.log(p)
  })
  return sum
}

Distribution.prototype.checkSum = function () {
  let sum = 0
  const that = this
  this.sample.elements.forEach(function (x) {
    sum += that.calculateAPriori(x)
  })
  // console.log("Distribution.checkSum is " + sum);
  return sum
}

module.exports = Distribution


/***/ }),

/***/ 8898:
/***/ ((module) => {

"use strict";
/*
Element class for elements in the event space
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a is class and b is context
function Element (a, b) {
  this.a = a
  this.b = b
}

Element.prototype.toString = function () {
  if (!this.key) {
    this.key = this.a + this.b.toString()
  }
  return this.key
}

module.exports = Element


/***/ }),

/***/ 3001:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Feature class for features that fire (or don't) on combinations of context
and class
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Element = __webpack_require__(8898)

function Feature (f, name, parameters) {
  this.evaluate = f
  this.name = name
  this.parameters = parameters

  let tmp = ''
  parameters.forEach(function (par) {
    tmp += par + '|'
  })
  this.parametersKey = tmp.substr(0, tmp.length - 1)
}

Feature.prototype.apply = function (x) {
  return this.evaluate(x)
}

Feature.prototype.expectationApprox = function (p, sample) {
  const that = this
  let sum = 0
  const seen = {}
  const A = sample.getClasses()
  sample.elements.forEach(function (sampleElement) {
    const bi = sampleElement.b

    if (!seen[bi.toString()]) {
      seen[bi.toString()] = true

      A.forEach(function (a) {
        const x = new Element(a, bi)
        sum += sample.observedProbabilityOfContext(bi) * p.calculateAPosteriori(x) * that.apply(x)
      })
    }
  })
  return sum
}

// Diect calculation of expected value of this feature according to distribution p
// In real-life applications with a lot of features this is not tractable
Feature.prototype.expectation = function (p, A, B) {
  let sum = 0
  const that = this
  A.forEach(function (a) {
    B.forEach(function (b) {
      const x = new Element(a, b)
      sum += (p.calculateAPriori(x) * that.apply(x))
    })
  })
  return sum
}

// Observed expectation of this feature in the sample
Feature.prototype.observedExpectation = function (sample) {
  if (this.observedExpect) {
    return this.observedExpect
  }
  const N = sample.size()
  let sum = 0
  const that = this
  sample.elements.forEach(function (x) {
    sum += that.apply(x)
  })
  this.observedExpect = sum / N
  return this.observedExpect
}

module.exports = Feature


/***/ }),

/***/ 1372:
/***/ ((module) => {

"use strict";
/*
Feature set class for administrating a set of unique feature
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



function FeatureSet () {
  this.features = []
  this.map = {}
}

// Returns true if the feature did not exist and was added
FeatureSet.prototype.addFeature = function (feature) {
  if (!this.featureExists(feature)) {
    this.map[feature.name + ' | ' + feature.parametersKey] = true
    this.features.push(feature)
    // console.log("FeatureSet.addFeature: feature added: " + feature.name + " - " + feature.parametersKey);
    return true
  } else {
    return false
  }
}

FeatureSet.prototype.featureExists = function (feature) {
  if (this.map[feature.name + ' | ' + feature.parametersKey]) {
    // console.log("FeatureSet.featureExists: feature already exists: " +
    //  feature.name + " - " + feature.parameters);
    return true
  } else {
    return false
  }
}

// Returns an array of features
// If the available array this.features is up to date it is returned immediately
FeatureSet.prototype.getFeatures = function () {
  return this.features
}

FeatureSet.prototype.size = function () {
  return this.features.length
}

FeatureSet.prototype.prettyPrint = function () {
  let s = ''
  Object.keys(this.map).forEach(function (key) {
    s += key + '\n'
  })
  return s
}

module.exports = FeatureSet


/***/ }),

/***/ 3819:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
GISScaler class that finds parameters of features
Copyright (C) 2017 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Feature = __webpack_require__(3001)
const Distribution = __webpack_require__(1586)

// classes is an array of classes
// features is an array of feature functions
function GISScaler (featureSet, sample) {
  this.featureSet = featureSet
  this.sample = sample
}

// Returns true if a correction feature is necessary
GISScaler.prototype.calculateMaxSumOfFeatures = function () {
  const that = this
  this.C = 0
  this.featureSums = {}
  const listOfSumValues = []

  // Since feature functions are derived from the sample
  // we can use the sample to calculate the max sum
  // We look at each sample element only once
  this.sample.elements.forEach(function (x) {
    if (!that.featureSums[x.toString()]) {
      let sum = 0
      that.featureSet.getFeatures().forEach(function (f) {
        sum += f.apply(x)
      })
      if (sum > that.C) {
        that.C = sum
      }
      that.featureSums[x.toString()] = sum
      listOfSumValues.push(sum)
    }
  })
  // console.log("GISScaler:calculateMaxSumOfFeatures:maxSum is " + this.C);

  // Check if a correction feature is necessary
  listOfSumValues.sort(function (a, b) {
    return a - b
  })
  return (listOfSumValues[0] !== listOfSumValues[listOfSumValues.length - 1])
}

GISScaler.prototype.addCorrectionFeature = function () {
  if (this.calculateMaxSumOfFeatures()) {
    // console.log("GISScaler:addCorrectionFeature:C is " + this.C);
    const that = this

    function f (x) {
      if (that.featureSums[x.toString()] !== undefined) {
        return that.C - that.featureSums[x.toString()]
      }
      return 0
    }

    const correctionFeature = new Feature(f, 'Correction feature', [])
    // console.log("GISScaler:addCorrectionFeature:correctionFeature " + JSON.stringify(correctionFeature));
    this.featureSet.addFeature(correctionFeature)
  } else {
    // console.log("Correction feature not needed");
  }
}

// This is the Generalised Iterative Scaling algorithm
// It ends if the improvement in likelihood of the distribution does not
// improve more than minImprovement or if the maximum number of iterations is
// reached.
GISScaler.prototype.run = function (maxIterations, minImprovement) {
  this.iteration = 0
  this.improvement = 0

  this.addCorrectionFeature()
  // Build up the distribution p
  const alpha = new Array(this.featureSet.size())
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = 1
  }
  const p = new Distribution(alpha, this.featureSet, this.sample)
  // console.log("Distribution created");
  p.prepare()
  // console.log("Distribution prepared");
  let KLDistance = p.KullbackLieblerDistance()

  const newAlpha = new Array(this.featureSet.size())
  let observedExpectation = 0
  let expectationApprox = 0
  do {
    // console.log("Iteration " + this.iteration + " - Log likelihood of sample: " + likelihood + " - Entropy: " + p.entropy());
    for (let i = 0; i < this.featureSet.size(); i++) {
      observedExpectation = this.featureSet.getFeatures()[i].observedExpectation(this.sample)
      expectationApprox = this.featureSet.getFeatures()[i].expectationApprox(p, this.sample)
      // console.log("Iteration " + this.iteration + " - Feature " + i);
      newAlpha[i] = p.alpha[i] * Math.pow(observedExpectation / expectationApprox, 1 / this.C)

      // console.log("GISScaler.run: old alpha[" + i + "]: " + p.alpha[i]);
      // console.log("GISScaler.run: new alpha[" + i + "]: " + newAlpha[i]);
    }

    // Make the newly calculated parameters current parameters
    newAlpha.forEach(function (newAlphaj, j) {
      p.alpha[j] = newAlphaj
    })
    // Recalculate a priori and a posteriori probabilities
    p.prepare()

    this.iteration++
    const newKLDistance = p.KullbackLieblerDistance()
    this.improvement = KLDistance - newKLDistance
    // console.log("Iteration " + this.iteration + " - Old likelihood: " + likelihood + " - New likelihood: " + newLikelihood);
    // console.log("Iteration " + this.iteration + " - Old KL: " + KLDistance + " - New KL: " + newKLDistance);

    KLDistance = newKLDistance
  } while ((this.iteration < maxIterations) && (this.improvement > minImprovement))
  // } while (iteration < maxIterations);
  /*
  var that = this;
  this.featureSet.getFeatures().forEach(function(f, j) {
    console.log("Observed expectation of feature " + j + ": " + f.observedExpectation(that.sample) +
      " - Expection of feature according to p: " + f.expectationApprox(p, that.sample));
  });
  */

  return p
}

module.exports = GISScaler


/***/ }),

/***/ 2781:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Corpus class specific for MaxEnt modeling
Copyright (C) 2018 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Sample = __webpack_require__(3671)
const Corpus = __webpack_require__(1280)

function MECorpus (data, BROWN, SentenceClass) {
  MECorpus.super_.call(this, data, BROWN, SentenceClass)
}

util.inherits(MECorpus, Corpus)

MECorpus.prototype.generateSample = function () {
  const sample = new Sample([])
  this.sentences.forEach(function (sentence) {
    sentence.generateSampleElements(sample)
  })
  return sample
}

// Splits the corpus in a training and testing set.
// percentageTrain is the size of the training corpus in percent
// Returns an array with two elements: training corpus, testing corpus
MECorpus.prototype.splitInTrainAndTest = function (percentageTrain) {
  const corpusTrain = new MECorpus()
  const corpusTest = new MECorpus()

  const p = percentageTrain / 100
  this.sentences.forEach(function (sentence, i) {
    if (Math.random() < p) {
      corpusTrain.sentences.push(sentence)
    } else {
      corpusTest.sentences.push(sentence)
    }
  })
  return [corpusTrain, corpusTest]
}

module.exports = MECorpus


/***/ }),

/***/ 2541:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Sentence class specific for MaxEnt modeling
Copyright (C) 2019 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Context = __webpack_require__(4639)
const Sentence = __webpack_require__(782)
const Element = __webpack_require__(3346)

function MESentence (data) {
  MESentence.super_.call(this, data)
}

util.inherits(MESentence, Sentence)

MESentence.prototype.generateSampleElements = function (sample) {
  const sentence = this.taggedWords
  sentence.forEach(function (token, index) {
    const x = new Element(
      token.tag,
      new Context({
        wordWindow: {},
        tagWindow: {}
      })
    )

    // Current word and tag
    x.b.data.wordWindow['0'] = token.token
    x.b.data.tagWindow['0'] = sentence[index].tag

    // Previous bigram
    if (index > 1) {
      x.b.data.tagWindow['-2'] = sentence[index - 2].tag
      x.b.data.wordWindow['-2'] = sentence[index - 2].token
    }

    // Left bigram
    if (index > 0) {
      x.b.data.tagWindow['-1'] = sentence[index - 1].tag
      x.b.data.wordWindow['-1'] = sentence[index - 1].token
    }

    // Right bigram
    if (index < sentence.length - 1) {
      x.b.data.tagWindow['1'] = sentence[index + 1].tag
      x.b.data.wordWindow['1'] = sentence[index + 1].token
    }

    // Next bigram
    if (index < sentence.length - 2) {
      x.b.data.tagWindow['2'] = sentence[index + 2].tag
      x.b.data.wordWindow['2'] = sentence[index + 2].token
    }

    sample.addElement(x)
  })
}

module.exports = MESentence


/***/ }),

/***/ 3346:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Element class for POS tagging
Copyright (C) 2018 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Element = __webpack_require__(8898)
const Feature = __webpack_require__(3001)

function POSElement (a, b) {
  POSElement.super_.call(this, a, b)
}

util.inherits(POSElement, Element)

POSElement.prototype.generateFeatures = function (featureSet) {
  const context = this.b.data
  const tag = this.a
  const token = context.wordWindow['0']

  // Feature for the current word
  function currentWord (x) {
    if ((x.b.data.wordWindow['0'] === token) &&
        (x.a === tag)) {
      return 1
    }
    return 0
  }
  featureSet.addFeature(new Feature(currentWord, 'wordFeature', ['0', token, '0', tag]))

  // Feature for previous bigram (previous two tags), positions -2, -1
  if (context.tagWindow['-2']) {
    const prevPrevTag = context.tagWindow['-2']
    const prevTag = context.tagWindow['-1']
    function prevBigram (x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow['-2'] === prevPrevTag) &&
          (x.b.data.tagWindow['-1'] === prevTag)) {
        return 1
      }
      return 0
    }
    featureSet.addFeature(new Feature(prevBigram, 'prevBigram', ['0', tag, '-2', prevPrevTag, '-1', prevTag]))
  }

  /*
  // Feature for left bigram, positions -1, 0
  if (context.tagWindow["-1"]) {
    var prevTag = context.tagWindow["-1"];
    function leftBigram(x) {
      if ((x.b.data.tagWindow["-1"] === prevTag) &&
          (x.a === tag)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(leftBigram, "leftBigram", ["0", tag, "-1", prevTag]));
  }
*/

  /*

  // Feature for right bigram, positions 0, 1
  if (context.tagWindow["1"]) {
    var nextTag = context.tagWindow["1"];
    function rightBigram(x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow["1"] === nextTag)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(rightBigram, "rightBigram", ["0", tag, "1", nextTag]));
  }
*/
  /*
  // Feature for next bigram (next two tags), positions 1 and 2
  if (context.tagWindow["2"]) {
    var nextTag = context.tagWindow["1"];
    var nextNextTag = context.tagWindow["2"];
    function nextBigram(x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow["1"] === nextTag) &&
          (x.b.data.tagWindow["2"] === nextNextTag)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(nextBigram, "nextBigram", ["0", tag, "1", nextTag, "2", nextNextTag]));
  }

  // Feature that looks at the left bigram words
  if (context.wordWindow["-1"]) {
    var prevWord = context.wordWindow["-1"];
    function leftBigramWords(x) {
      if ((x.a === tag) &&
          (x.b.data.wordWindow["0"] === token) &&
          (x.b.data.wordWindow["-1"] === prevWord)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(leftBigramWords, "leftBigramWords", ["0", tag, "0", token, "-1", prevWord]));
  }

  // Feature that looks at the right bigram words
  if (context.wordWindow["1"]) {
    var nextWord = context.wordWindow["1"];
    function rightBigramWords(x) {
      if ((x.a === tag) &&
          (x.b.data.wordWindow["0"] === token) &&
          (x.b.data.wordWindow["1"] === nextWord)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(rightBigramWords, "rightBigramWords", ["0", tag, "0", token, "1", nextWord]));
  }
*/

  // Feature that looks at the previous word and its category
  if (context.wordWindow['-1']) {
    const prevWord = context.wordWindow['-1']
    const prevTag = context.tagWindow['-1']
    function prevWordAndCat (x) {
      if ((x.a === tag) &&
          (x.b.data.wordWindow['-1'] === prevWord) &&
          (x.b.data.tagWindow['-1'] === prevTag)) {
        return 1
      }
      return 0
    }
    featureSet.addFeature(new Feature(prevWordAndCat, 'prevWordAndCat', ['0', tag, '-1', prevWord, '-1', prevTag]))
  }

/*
  // Feature that looks at the next word and its category
  if (context.wordWindow["1"]) {
    var nextWord = context.wordWindow["1"];
    var nextTag = context.tagWindow["1"];
    function nextWordAndCat(x) {
      if ((x.a === tag) &&
          (x.b.data.wordWindow["1"] === nextWord) &&
          (x.b.data.tagWindow["1"] === nextTag)) {
          return 1;
        }
      return 0;
    }
    featureSet.addFeature(new Feature(nextWordAndCat, "nextWordAndCat", ["0", tag, "1", nextWord, "1", nextTag]));
  }
*/
}

module.exports = POSElement


/***/ }),

/***/ 3671:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Sample space of observed events
Copyright (C) 2018 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Context = __webpack_require__(4639)

const fs = __webpack_require__(4195)

function Sample (elements) {
  this.frequencyOfContext = {}
  this.frequency = {}
  this.classes = []
  if (elements) {
    this.elements = elements
    this.analyse()
  } else {
    this.elements = []
  }
}

// Extracts classes and frequencies
Sample.prototype.analyse = function () {
  const that = this
  this.elements.forEach(function (x) {
    if (this.classes.indexOf(x.a) === -1) {
      this.classes.push(x.a)
    }
    if (!that.frequencyOfContext[x.b.toString()]) {
      that.frequencyOfContext[x.b.toString()] = 0
    }
    that.frequencyOfContext[x.b.toString()]++
    if (!that.frequency[x.toString()]) {
      that.frequency[x.toString()] = 0
    }
    that.frequency[x.toString()]++
  })
}

Sample.prototype.addElement = function (x) {
  this.elements.push(x)
  // Update frequencies
  if (!this.frequencyOfContext[x.b.toString()]) {
    this.frequencyOfContext[x.b.toString()] = 0
  }
  this.frequencyOfContext[x.b.toString()]++
  if (!this.frequency[x.toString()]) {
    this.frequency[x.toString()] = 0
  }
  this.frequency[x.toString()]++
  // Update classes
  if (this.classes.indexOf(x.a) === -1) {
    this.classes.push(x.a)
  }
}

Sample.prototype.observedProbabilityOfContext = function (context) {
  if (this.frequencyOfContext[context.toString()]) {
    return this.frequencyOfContext[context.toString()] / this.elements.length
  } else {
    return 0
  }
}

Sample.prototype.observedProbability = function (x) {
  if (this.frequency[x.toString()]) {
    return this.frequency[x.toString()] / this.elements.length
  } else {
    return 0
  }
}

Sample.prototype.size = function () {
  return this.elements.length
}

Sample.prototype.getClasses = function () {
  return this.classes
}

Sample.prototype.generateFeatures = function (featureSet) {
  this.elements.forEach(function (x) {
    x.generateFeatures(featureSet)
  })
}

Sample.prototype.save = function (filename, callback) {
  const sample = this
  const data = JSON.stringify(this, null, 2)
  fs.writeFile(filename, data, 'utf8', function (err) {
    // console.log('Sample written')
    if (callback) {
      callback(err, err ? null : sample)
    }
  })
}

// Loads a sample from file and revives the right classes, i.e. Sample and
// Element classes.
Sample.prototype.load = function (filename, ElementClass, callback) {
  fs.readFile(filename, 'utf8', function (err, data) {
    if (!err) {
      const sampleData = JSON.parse(data)
      const sample = new Sample()
      sampleData.elements.forEach(function (elementData) {
        const elt = new ElementClass(elementData.a, new Context(elementData.b.data))
        sample.addElement(elt)
      })
      if (!sample.frequency || !sample.frequencyOfContext) {
        sample.analyse()
      }
      if (callback) {
        callback(err, sample)
      }
    } else {
      if (callback) {
        callback(err)
      }
    }
  })
}

module.exports = Sample


/***/ }),

/***/ 7967:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Simple Example Element class
Copyright (C) 2018 Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)

const Element = __webpack_require__(8898)
const Feature = __webpack_require__(3001)

function SEElement (a, b) {
  SEElement.super_.call(this, a, b)
}

util.inherits(SEElement, Element)

SEElement.prototype.generateFeatures = function (featureSet) {
  function isZero (x) {
    if ((x.a === 'x') && (x.b.data === '0')) {
      return 1
    }
    return 0
  }
  featureSet.addFeature(new Feature(isZero, 'isZero', ['0']))

  function isOne (x) {
    if ((x.a === 'y') && (x.b.data === '1')) {
      return 1
    }
    return 0
  }
  featureSet.addFeature(new Feature(isOne, 'isOne', ['1']))
}

module.exports = SEElement


/***/ }),

/***/ 8180:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2021, Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



function getBigrams (str) {
  let str1 = str
  // pad with a space if str consists of one character
  if (str.length === 1) {
    str1 = str + ' '
  }
  const bigrams = new Set()
  const length = str1.length
  for (let i = 0; i < length - 1; i++) {
    const bigram = str1.slice(i, i + 2)
    bigrams.add(bigram)
  }
  return bigrams
}

function intersect (set1, set2) {
  const intersection = new Set()
  set1.forEach(value => {
    if (set2.has(value)) {
      intersection.add(value)
    }
  })
  return intersection
}

// Perform some sanitization steps
function sanitize (str) {
  // Turn characters to lower string, remove space at the beginning and end,
  // replace multiple spaces in the middle by single spaces
  return str.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/s+/g, ' ')
}

function diceCoefficient (str1, str2) {
  const sanitizedStr1 = sanitize(str1)
  const sanitizedStr2 = sanitize(str2)
  const bigrams1 = getBigrams(sanitizedStr1)
  const bigrams2 = getBigrams(sanitizedStr2)
  return (2 * intersect(bigrams1, bigrams2).size) / (bigrams1.size + bigrams2.size)
}

module.exports = diceCoefficient


/***/ }),

/***/ 1750:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2018, Shane Caldwell, Hugo ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// Computes the Hamming distance between two string -- intrepreted from:
// https://en.wikipedia.org/wiki/Hamming_distance
// s1 is the first string to compare
// s2 is the second string to compare
// Strings should have equal length
function HammingDistance (s1, s2, ignoreCase) {
  // Return -1 if one of the parameters is not a string
  if (typeof (s1) !== 'string' || typeof (s2) !== 'string') {
    return -1
  }
  // Return -1 the lengths of the strings differ
  if (s1.length !== s2.length) {
    return -1
  }

  if (ignoreCase) {
    s1 = s1.toLowerCase()
    s2 = s2.toLowerCase()
  }

  let diffs = 0
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) {
      diffs++
    }
  }
  return diffs
}

module.exports = HammingDistance


/***/ }),

/***/ 9266:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.JaroWinklerDistance = __webpack_require__(2063)
exports.LevenshteinDistance = __webpack_require__(1415).LevenshteinDistance
exports.DamerauLevenshteinDistance = __webpack_require__(1415).DamerauLevenshteinDistance
exports.LevenshteinDistanceSearch = __webpack_require__(1415).LevenshteinDistanceSearch
exports.DamerauLevenshteinDistanceSearch = __webpack_require__(1415).DamerauLevenshteinDistanceSearch
exports.DiceCoefficient = __webpack_require__(8180)
exports.HammingDistance = __webpack_require__(1750)


/***/ }),

/***/ 2063:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2012, Adam Phillabaum, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

Unless otherwise stated by a specific section of code

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// Computes the Jaro distance between two string -- intrepreted from:
// http://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
// s1 is the first string to compare
// s2 is the second string to compare
function distance (s1, s2) {
  if (typeof (s1) !== 'string' || typeof (s2) !== 'string') {
    return 0
  }

  if (s1.length === 0 || s2.length === 0) {
    return 0
  }

  const matchWindow = (Math.floor(Math.max(s1.length, s2.length) / 2.0)) - 1
  const matches1 = new Array(s1.length)
  const matches2 = new Array(s2.length)
  let m = 0 // number of matches
  let t = 0 // number of transpositions
  let i = 0 // index for string 1
  let k = 0 // index for string 2

  // debug helpers
  // console.log("s1: " + s1 + "; s2: " + s2);
  // console.log(" - matchWindow: " + matchWindow);

  for (i = 0; i < s1.length; i++) { // loop to find matched characters
    const start = Math.max(0, (i - matchWindow)) // use the higher of the window diff
    const end = Math.min((i + matchWindow + 1), s2.length) // use the min of the window and string 2 length

    for (k = start; k < end; k++) { // iterate second string index
      if (matches2[k]) { // if second string character already matched
        continue
      }
      if (s1[i] !== s2[k]) { // characters don't match
        continue
      }

      // assume match if the above 2 checks don't continue
      matches1[i] = true
      matches2[k] = true
      m++
      break
    }
  }

  // nothing matched
  if (m === 0) {
    return 0.0
  }

  k = 0 // reset string 2 index
  for (i = 0; i < s1.length; i++) { // loop to find transpositions
    if (!matches1[i]) { // non-matching character
      continue
    }
    while (!matches2[k]) { // move k index to the next match
      k++
    }
    if (s1[i] !== s2[k]) { // if the characters don't match, increase transposition
      // HtD: t is always less than the number of matches m, because transpositions are a subset of matches
      t++
    }
    k++ // iterate k index normally
  }

  // transpositions divided by 2
  t = t / 2.0

  return ((m / s1.length) + (m / s2.length) + ((m - t) / m)) / 3.0 // HtD: therefore, m - t > 0, and m - t < m
  // HtD: => return value is between 0 and 1
}

// Computes the Winkler distance between two string -- intrepreted from:
// http://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
// s1 is the first string to compare
// s2 is the second string to compare
// dj is the Jaro Distance (if you've already computed it), leave blank and the method handles it
// ignoreCase: if true strings are first converted to lower case before comparison
function JaroWinklerDistance (s1, s2, dj, ignoreCase) {
  if (s1 === s2) {
    return 1
  } else {
    if (ignoreCase) {
      s1 = s1.toLowerCase()
      s2 = s2.toLowerCase()
    }

    // console.log(news1);
    // console.log(news2);

    const jaro = (typeof (dj) === 'undefined') ? distance(s1, s2) : dj
    const p = 0.1 // default scaling factor
    let l = 0 // length of the matching prefix
    while (s1[l] === s2[l] && l < 4) {
      l++
    }

    // HtD: 1 - jaro >= 0
    return jaro + l * p * (1 - jaro)
  }
}

module.exports = JaroWinklerDistance


/***/ }),

/***/ 1415:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, Sid Nallu, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



/*
 * contribution by sidred123
 */

/*
 * Compute the Levenshtein distance between two strings.
 * Algorithm based from Speech and Language Processing - Daniel Jurafsky and James H. Martin.
 */

const _ = __webpack_require__(6419)

// Walk the path back from the matchEnd to the beginning of the match.
// Do this by traversing the distanceMatrix as you would a linked list,
// following going from cell child to parent until reach row 0.
function _getMatchStart (distanceMatrix, matchEnd, sourceLength) {
  let row = sourceLength
  let column = matchEnd
  let tmpRow
  let tmpColumn

  // match will be empty string
  if (matchEnd === 0) { return 0 }

  while (row > 1 && column > 1) {
    tmpRow = row
    tmpColumn = column
    row = distanceMatrix[tmpRow][tmpColumn].parentCell.row
    column = distanceMatrix[tmpRow][tmpColumn].parentCell.column
  }

  return column - 1
}

function getMinCostSubstring (distanceMatrix, source, target) {
  const sourceLength = source.length
  const targetLength = target.length
  let minDistance = sourceLength + targetLength
  let matchEnd = targetLength

  // Find minimum value in last row of the cost matrix. This cell marks the
  // end of the match string.
  for (let column = 0; column <= targetLength; column++) {
    if (minDistance > distanceMatrix[sourceLength][column].cost) {
      minDistance = distanceMatrix[sourceLength][column].cost
      matchEnd = column
    }
  }

  const matchStart = _getMatchStart(distanceMatrix, matchEnd, sourceLength)
  return { substring: target.slice(matchStart, matchEnd), distance: minDistance, offset: matchStart }
}

/*
* Returns the Damerau-Levenshtein distance between strings. Counts the distance
* between two strings by returning the number of edit operations required to
* convert `source` into `target`.
*
* Valid edit operations are:
*  - transposition, insertion, deletion, and substitution
*
* Options:
*  insertion_cost: (default: 1)
*  deletion_cost: number (default: 1)
*  substitution_cost: number (default: 1)
*  transposition_cost: number (default: 1)
*  search: boolean (default: false)
*  restricted: boolean (default: false)
*/
function DamerauLevenshteinDistance (source, target, options) {
  const damLevOptions = _.extend(
    { transposition_cost: 1, restricted: false },
    options || {},
    { damerau: true, search: false }
  )
  return levenshteinDistance(source, target, damLevOptions)
}

function DamerauLevenshteinDistanceSearch (source, target, options) {
  const damLevOptions = _.extend(
    { transposition_cost: 1, restricted: false },
    options || {},
    { damerau: true, search: true }
  )
  return levenshteinDistance(source, target, damLevOptions)
}

function LevenshteinDistanceSearch (source, target, options) {
  const levOptions = _.extend({}, options || {}, { damerau: false, search: true })
  return levenshteinDistance(source, target, levOptions)
}

function LevenshteinDistance (source, target, options) {
  const levOptions = _.extend({}, options || {}, { damerau: false, search: false })
  return levenshteinDistance(source, target, levOptions)
}

function levenshteinDistance (source, target, options) {
  if (isNaN(options.insertion_cost)) options.insertion_cost = 1
  if (isNaN(options.deletion_cost)) options.deletion_cost = 1
  if (isNaN(options.substitution_cost)) options.substitution_cost = 1

  if (typeof options.search !== 'boolean') options.search = false

  const isUnrestrictedDamerau = options.damerau && !options.restricted
  const isRestrictedDamerau = options.damerau && options.restricted

  let lastRowMap = null
  if (isUnrestrictedDamerau) {
    lastRowMap = {}
  }

  const sourceLength = source.length
  const targetLength = target.length
  const distanceMatrix = [[{ cost: 0 }]] // the root, has no parent cell

  for (let row = 1; row <= sourceLength; row++) {
    distanceMatrix[row] = []
    distanceMatrix[row][0] = { cost: distanceMatrix[row - 1][0].cost + options.deletion_cost, parentCell: { row: row - 1, column: 0 } }
  }

  for (let column = 1; column <= targetLength; column++) {
    if (options.search) {
      distanceMatrix[0][column] = { cost: 0 }
    } else {
      distanceMatrix[0][column] = { cost: distanceMatrix[0][column - 1].cost + options.insertion_cost, parentCell: { row: 0, column: column - 1 } }
    }
  }

  let lastColMatch = null
  for (let row = 1; row <= sourceLength; row++) {
    if (isUnrestrictedDamerau) {
      lastColMatch = null
    }
    for (let column = 1; column <= targetLength; column++) {
      const costToInsert = distanceMatrix[row][column - 1].cost + options.insertion_cost
      const costToDelete = distanceMatrix[row - 1][column].cost + options.deletion_cost

      const sourceElement = source[row - 1]
      const targetElement = target[column - 1]
      let costToSubstitute = distanceMatrix[row - 1][column - 1].cost
      if (sourceElement !== targetElement) {
        costToSubstitute = costToSubstitute + options.substitution_cost
      }

      const possibleParents = [
        { cost: costToInsert, coordinates: { row: row, column: column - 1 } },
        { cost: costToDelete, coordinates: { row: row - 1, column: column } },
        { cost: costToSubstitute, coordinates: { row: row - 1, column: column - 1 } }
      ]

      // We can add damerau to the possibleParents if the current
      // target-letter has been encountered in our lastRowMap,
      // and if there exists a previous column in this row where the
      // row & column letters matched
      const canDamerau = isUnrestrictedDamerau &&
                row > 1 && column > 1 &&
                lastColMatch &&
                targetElement in lastRowMap

      let costBeforeTransposition = null
      if (canDamerau) {
        const lastRowMatch = lastRowMap[targetElement]
        costBeforeTransposition =
                    distanceMatrix[lastRowMatch - 1][lastColMatch - 1].cost
        const costToTranspose = costBeforeTransposition +
                    ((row - lastRowMatch - 1) * options.deletion_cost) +
                    ((column - lastColMatch - 1) * options.insertion_cost) +
                    options.transposition_cost
        possibleParents.push({
          cost: costToTranspose,
          coordinates: {
            row: lastRowMatch - 1,
            column: lastColMatch - 1
          }
        })
      }
      // Source and target chars are 1-indexed in the distanceMatrix so previous
      // source/target element is (col/row - 2)
      const canDoRestrictedDamerau = isRestrictedDamerau &&
                row > 1 && column > 1 &&
                sourceElement === target[column - 2] &&
                source[row - 2] === targetElement

      if (canDoRestrictedDamerau) {
        costBeforeTransposition = distanceMatrix[row - 2][column - 2].cost
        possibleParents.push({
          cost: costBeforeTransposition + options.transposition_cost,
          coordinates: { row: row - 2, column: column - 2 }
        })
      }

      const minCostParent = _.min(possibleParents, function (p) { return p.cost })

      distanceMatrix[row][column] = { cost: minCostParent.cost, parentCell: minCostParent.coordinates }

      if (isUnrestrictedDamerau) {
        lastRowMap[sourceElement] = row
        if (sourceElement === targetElement) {
          lastColMatch = column
        }
      }
    }
  }

  if (!options.search) {
    return distanceMatrix[sourceLength][targetLength].cost
  }

  return getMinCostSubstring(distanceMatrix, source, target)
}

module.exports = {
  LevenshteinDistance: LevenshteinDistance,
  LevenshteinDistanceSearch: LevenshteinDistanceSearch,
  DamerauLevenshteinDistance: DamerauLevenshteinDistance,
  DamerauLevenshteinDistanceSearch: DamerauLevenshteinDistanceSearch
}


/***/ }),

/***/ 1478:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2021, Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



function buildExportMap (modules) {
  const result = {}
  modules.forEach(module => {
    Object.keys(module).forEach(key => {
      result[key] = module[key]
    })
  })
  return result
}

module.exports = buildExportMap([
  __webpack_require__(2634),
  __webpack_require__(1386),
  __webpack_require__(9266),
  __webpack_require__(855),
  __webpack_require__(5674),
  __webpack_require__(5313),
  __webpack_require__(1947),
  __webpack_require__(4784),
  __webpack_require__(2914),
  __webpack_require__(4899),
  __webpack_require__(4321),
  __webpack_require__(2565),
  __webpack_require__(3680),
  __webpack_require__(4045),
  __webpack_require__(75),
  __webpack_require__(6374),
  __webpack_require__(1095)
])


/***/ }),

/***/ 2771:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



function nthForm (i) {
  const teenth = (i % 100)

  if (teenth > 10 && teenth < 14) { return 'th' } else {
    switch (i % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }
}

function nth (i) {
  return i.toString() + nthForm(i)
}

const CountInflector = function () {
}

CountInflector.nth = nth

module.exports = CountInflector


/***/ }),

/***/ 9936:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const FormSet = function () {
  this.regularForms = []
  this.irregularForms = Object.create(null)
}

module.exports = FormSet


/***/ }),

/***/ 3282:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A noun inflector for French.
 * Compiled from:
 * \@see http://fr.wiktionary.org/wiki/Annexe:Pluriels_irr%C3%A9guliers_en_fran%C3%A7ais
 * \@see http://fr.wikipedia.org/wiki/Pluriels_irr%C3%A9guliers_en_fran%C3%A7ais
 *
 * \@todo Take compounded noun into account (eaux-fortes, pique-nique...).
 * \@todo General note: French also requires AdjectiveInflector (femininize...).
 */

const SingularPluralInflector = __webpack_require__(9154)
const util = __webpack_require__(9539)
const FormSet = __webpack_require__(9936)

/*
function attach () {
  const inflector = this

  String.prototype.singularizeNoun = function () {
    return inflector.singularize(this)
  }

  String.prototype.pluralizeNoun = function () {
    return inflector.pluralize(this)
  }
}
*/

/**
 * @constructor
 */
const NounInflector = function () {
  // Ambiguous a.k.a. invariant.
  // \@todo Expand this list to be as comprehensive as possible.
  this.ambiguous = [
    // Nouns ending by -s
    'à-peu-près', 'à-propos', 'abattis', 'abcès', 'abois', 'abribus', 'abus',
    'accès', 'acquis', 'adénovirus', 'adonis', 'ados', 'agrès', 'aguets',
    'ailleurs', 'ais', 'albatros', 'albinos', 'alias', 'aloès', 'amaryllis',
    'amas', 'ampélopsis', 'ananas', 'anchois', 'angélus', 'anis', 'anticorps',
    'antihéros', 'antirides', 'anus', 'appas', 'appentis', 'appui-bras',
    'appuie-bras', 'arcanes', 'argus', 'arrérages', 'arrière-pays', 'as',
    'ascaris', 'asparagus', 'atlas', 'atours', 'aurochs', 'autobus',
    'autofocus', 'avant-bras', 'avant-corps', 'avant-propos', 'avers', 'avis',
    'axis', 'barbouillis', 'bas', 'beaujolais', 'beaux-arts', 'biais',
    'bibliobus', 'biceps', 'bicross', 'bien-fonds', 'bloc-notes', 'blockhaus',
    'blocus', 'blues', 'bois', 'bonus', 'bout-dehors', 'bouts-rimés',
    'branle-bas', 'bras', 'brebis', 'bris', 'brise-lames', 'brise-mottes',
    'brûlis', 'buis', 'burnous', 'bus', 'business', 'cabas', 'cacatoès',
    'cacatois', 'cactus', 'cadenas', 'cafouillis', 'caillebotis', 'calvados',
    'cambouis', 'campus', 'canevas', 'cannabis', 'carquois', 'cas',
    'casse-noisettes', 'casse-pieds', 'cassis', 'caucus', 'cens', 'cervelas',
    'chablis', 'chamois', 'chaos', 'chas', 'chasselas', 'châssis',
    'chatouillis', 'chauffe-assiettes', 'chauve-souris', 'chorus', 'choucas',
    'circoncis', 'cirrus', 'clafoutis', 'clapotis', 'cliquetis', 'clos',
    'cochylis', 'colis', 'coloris', 'commis', 'compas', 'compromis',
    'compte-chèques', 'compte-gouttes', 'compte-tours', 'concours', 'confins',
    'congrès', 'consensus', 'contrepoids', 'contresens', 'contretemps',
    'corn flakes', 'corps', 'corps-à-corps', 'corpus', 'cosinus', 'cosmos',
    'coulis', 'coupe-ongles', 'cours', 'court-jus', 'couscous', 'coutelas',
    'crocus', 'croquis', 'cross', 'cubitus', 'cumulus', 'cure-dents',
    'cure-ongles', 'cure-pipes', 'cursus', 'cyclo-cross', 'cyprès', 'dais',
    'damas', 'débarras', 'débours', 'débris', 'décès', 'dedans', 'dehors',
    'delirium tremens', 'demi-gros', 'dépens', 'dessous', 'dessus', 'détritus',
    'deux-mâts', 'deux-pièces', 'deux-points', 'deux-roues', 'deux-temps',
    'dévers', 'devis', 'diplodocus', 'discours', 'dos', 'ébats', 'éboulis',
    'échalas', 'edelweiss', 'élaeis', 'éleis', 'éléphantiasis', 'embarras',
    'empois', 'en-cas', 'encens', 'enclos', 'endos', 'engrais', 'entrelacs',
    'entremets', 'envers', 'épluche-légumes', 'ers', 'espace-temps',
    'essuie-mains', 'eucalyptus', 'ex-libris', 'excès', 'express', 'extrados',
    'faciès', 'fait-divers', 'fatras', 'faux-sens', 'favoris', 'ficus',
    'fier-à-bras', 'finnois', 'florès', 'focus', 'fœtus', 'fois', 'forceps',
    'fouillis', 'fracas', 'frais', 'français', 'franglais', 'frimas',
    'friselis', 'frisottis', 'froncis', 'frottis', 'fucus', 'gâchis', 'galetas',
    'galimatias', 'garde-à-vous', 'garde-corps', 'gargouillis', 'gars',
    'gâte-bois', 'gazouillis', 'génois', 'gibus', 'glacis', 'glas', 'gneiss',
    'gobe-mouches', 'grès', 'gribouillis', 'guet-apens', 'habeas corpus',
    'hachis', 'haras', 'hardes', 'harnais', 'haut-le-corps', 'hautbois',
    'herbe-aux-chats', 'héros', 'herpès', 'hiatus', 'hibiscus', 'hors-concours',
    'hors-pistes', 'hourdis', 'huis-clos', 'humérus', 'humus', 'ibis', 'iléus',
    'indique-fuites', 'infarctus', 'inlandsis', 'insuccès', 'intercours',
    'intrados', 'intrus', 'iris', 'isatis', 'jais', 'jars', 'jeans',
    'jeuconcours', 'judas', 'juliénas', 'jus', 'justaucorps', 'kakatoès',
    'kermès', 'kriss', 'lacis', 'laïus', 'lambris', 'lapis', 'laps', 'lapsus',
    'laquais', 'las', 'lattis', 'lave-mains', 'lavis', 'lèche-bottes',
    'lèche-vitrines', 'legs', 'lias', 'liégeois', 'lilas', 'lis', 'lœss',
    'logis', 'loris', 'lotus', 'louis', 'lupus', 'lys', 'mâchicoulis', 'madras',
    'maïs', 'malappris', 'malus', 'mânes', 'maquis', 'marais', 'maroilles',
    'marquis', 'mas', 'mass-médias', 'matelas', 'matois', 'médius', 'mépris',
    'mérinos', 'mess', 'mets', 'mi-bas', 'micro-ondes', 'mille-pattes',
    'millepertuis', 'minibus', 'minois', 'minus', 'mirabilis', 'mois',
    'monocorps', 'monte-plats', 'mors', 'motocross', 'mots-croisés', 'motus',
    'mouchetis', 'mucus', 'myosotis', 'nævus', 'négus', 'niais',
    'nimbo-stratus', 'nimbus', 'norois', 'nounours', 'nu-pieds', 'oasis',
    'obus', 'olibrius', 'omnibus', 'opus', 'os', 'ours', 'ouvre-boîtes',
    'ouvre-bouteilles', 'palais', 'palis', 'palmarès', 'palus', 'panais',
    'panaris', 'pancréas', 'papyrus', 'par-dehors', 'paradis', 'parcours',
    'pardessus', 'pare-balles', 'pare-chocs', 'parvis', 'pas', 'passe-temps',
    'pataquès', 'pathos', 'patois', 'pavois', 'pays', 'permis',
    'petit-bourgeois', 'petit-gris', 'petit-pois', 'phallus', 'phimosis',
    'pickles', 'pilotis', 'pique-fleurs', 'pis', 'pithiviers', 'pityriasis',
    'plateau-repas', 'plâtras', 'plein-temps', 'plexiglas', 'plexus', 'plus',
    'poids', 'pois', 'pont-levis', 'porte-avions', 'porte-bagages',
    'porte-billets', 'porte-bouteilles', 'porte-clés', 'porte-hélicoptères',
    'porte-jarretelles', 'porte-revues', 'pouls', 'préavis', 'presse-fruits',
    'presse-papiers', 'princeps', 'printemps', 'procès', 'processus', 'progrès',
    'propos', 'prospectus', 'protège-dents', 'psoriasis', 'pubis', 'puits',
    'pus', 'putois', 'quatre-épices', 'quatre-feuilles', 'quatre-heures',
    'quatre-mâts', 'quatre-quarts', 'quatre-temps', 'quitus', 'rabais',
    'rachis', 'radis', 'radius', 'raïs', 'ramassis', 'rébus', 'reclus',
    'recours', 'refus', 'relais', 'remords', 'remous', 'remue-méninges',
    'rendez-vous', 'repas', 'répons', 'repos', 'repris', 'reps', 'rétrovirus',
    'revers', 'rhinocéros', 'rictus', 'rince-doigts', 'ris', 'rollmops',
    'rosé-des-prés', 'roulis', 'rubis', 'salmigondis', 'salsifis', 'sans-logis',
    'sas', 'sassafras', 'sauternes', 'schnaps', 'schuss', 'secours', 'semis',
    'sens', 'serre-fils', 'serre-livres', 'sévices', 'sinus', 'skunks',
    'souris', 'sournois', 'sous-bois', 'stradivarius', 'stras', 'strass',
    'strato-cumulus', 'stratus', 'stress', 'succès', 'surdos', 'surplus',
    'surpoids', 'sursis', 'suspens', 'synopsis', 'syphilis', 'taffetas',
    'taillis', 'talus', 'tamaris', 'tamis', 'tapis', 'tas', 'taudis', 'temps',
    'tennis', 'terminus', 'terre-neuvas', 'tétanos', 'tétras', 'thalamus',
    'thermos', 'thesaurus', 'thésaurus', 'thymus', 'tire-fesses', 'tonus',
    'torchis', 'torticolis', 'tournedos', 'tournevis', 'tournis', 'tracas',
    'traîne-savates', 'travers', 'tréfonds', 'treillis', 'trépas', 'trias',
    'triceps', 'trichomonas', 'trois-étoiles', 'trois-mâts', 'trois-quarts',
    'trolleybus', 'tumulus', 'typhus', 'univers', 'us', 'utérus', 'vasistas',
    'vélocross', 'velours', 'verglas', 'verjus', 'vernis', 'vers',
    'vert-de-gris', 'vide-ordures', 'vide-poches', 'villageois', 'virus',
    'vis-à-vis', 'volubilis', 'vulgum pecus', 'waters', 'williams', 'xérès',

    // Nouns ending by -x
    'abat-voix', 'afflux', 'alpax', 'anthrax', 'apex', 'aptéryx',
    'archéoptéryx', 'arrière-faix', 'bombyx', 'borax', 'bordeaux', 'bouseux',
    'box', 'carex', 'casse-noix', 'cedex', 'céphalothorax', 'cérambyx', 'chaux',
    'choix', 'coccyx', 'codex', 'contumax', 'coqueleux', 'cortex', 'courroux',
    'croix', 'crucifix', 'culex', 'demodex', 'duplex', 'entre-deux', 'époux',
    'équivaux', 'eux', 'ex', 'faix', 'faucheux', 'faux', 'fax', 'ferreux',
    'flux', 'fox', 'freux', 'furax', 'hapax', 'harengueux', 'hélix',
    'horse-pox', 'houx', 'index', 'influx', 'inox', 'juke-box', 'kleenex',
    'lagothrix', 'larynx', 'lastex', 'latex', 'lux', 'lynx', 'macareux', 'max',
    'mésothorax', 'mi-voix', 'mirepoix', 'motteux', 'multiplex', 'murex',
    'narthex', 'noix', 'onyx', 'opopanax', 'oropharynx', 'paix', 'panax',
    'perdrix', 'pharynx', 'phénix', 'phlox', 'phoenix', 'pneumothorax', 'poix',
    'portefaix', 'pousse-cailloux', 'preux', 'prix', 'prothorax', 'pucheux',
    'pyrex', 'pyroligneux', 'quadruplex', 'queux', 'redoux', 'reflex', 'reflux',
    'relax', 'rhinopharynx', 'rose-croix', 'rouvieux', 'roux', 'rumex',
    'saindoux', 'sardonyx', 'scolex', 'sèche-cheveux', 'silex', 'simplex',
    'sioux', 'sirex', 'smilax', 'solex', 'songe-creux', 'spalax', 'sphex',
    'sphinx', 'storax', 'strix', 'styrax', 'surfaix', 'surtaux', 'syrinx',
    'tamarix', 'taux', 'télex', 'thorax', 'tord-boyaux', 'toux', 'trionyx',
    'tripoux', 'tubifex', 'vertex', 'vidéotex', 'vielleux', 'vieux',
    'violoneux', 'voix', 'volvox', 'vortex',

    // Nouns ending by -z
    'allume-gaz', 'assez', 'biogaz', 'cache-nez', 'camping-gaz', 'chez',
    'chintz', 'ersatz', 'fez', 'free-jazz', 'fritz', 'gaz', 'gin-fizz', 'hertz',
    'jazz', 'jerez', 'kibboutz', 'kilohertz', 'kolkhoz', 'kronprinz', 'lapiaz',
    'lez', 'mégahertz', 'merguez', 'nez', 'pince-nez', 'quartz', 'quiz', 'ranz',
    'raz', 'recez', 'rémiz', 'rez', 'riz', 'ruolz', 'seltz', 'serre-nez'
  ]

  this.customPluralForms = []
  this.customSingularForms = []
  this.singularForms = new FormSet()
  this.pluralForms = new FormSet()

  // this.attach = attach

  this.addIrregular('ail', 'aulx')
  this.addIrregular('bétail', 'bestiaux')
  this.addIrregular('bonhomme', 'bonshommes')
  this.addIrregular('ciel', 'cieux')
  this.addIrregular('monsieur', 'messieurs')
  this.addIrregular('mafioso', 'mafiosi')
  this.addIrregular('œil', 'yeux')
  this.addIrregular('putto', 'putti')
  this.addIrregular('targui', 'touareg') // touareg -> touaregs is also OK.

  // Pluralize
  this.pluralForms.regularForms.push([/^(av|b|c|carnav|cérémoni|chac|corr|emment|emmenth|festiv|fut|gavi|gra|narv|p|récit|rég|rit|rorqu|st)al$/i, '$1als'])
  this.pluralForms.regularForms.push([/^(aspir|b|cor|ém|ferm|gemm|soupir|trav|vant|vent|vitr)ail$/i, '$1aux'])
  this.pluralForms.regularForms.push([/^(bij|caill|ch|gen|hib|jouj|p|rip|chouch)ou$/i, '$1oux'])
  this.pluralForms.regularForms.push([/^(gr|berimb|don|karb|land|pil|rest|sarr|un)au$/i, '$1aus'])
  this.pluralForms.regularForms.push([/^(bl|ém|enf|pn)eu$/i, '$1eus'])
  this.pluralForms.regularForms.push([/(au|eau|eu|œu)$/i, '$1x'])
  this.pluralForms.regularForms.push([/al$/i, 'aux'])
  this.pluralForms.regularForms.push([/(s|x)$/i, '$1'])
  this.pluralForms.regularForms.push([/(.*)$/i, '$1s'])

  // Singularize
  this.singularForms.regularForms.push([/^(aspir|b|cor|ém|ferm|gemm|soupir|trav|vant|vent|vitr)aux$/i, '$1ail'])
  this.singularForms.regularForms.push([/^(aloy|b|bouc|boy|burg|conoy|coy|cr|esquim|ét|fabli|flé|flûti|glu|gr|gru|hoy|joy|kérab|matéri|nobli|noy|pré|sen|sén|t|touch|tuss|tuy|v|ypré)aux$/i, '$1au'])
  this.singularForms.regularForms.push([/^(bij|caill|ch|gen|hib|jouj|p|rip|chouch)oux$/i, '$1ou'])
  this.singularForms.regularForms.push([/^(bis)?aïeux$/i, '$1aïeul'])
  this.singularForms.regularForms.push([/^apparaux$/i, 'appareil']) // One way transform, don't put on irregular list.
  this.singularForms.regularForms.push([/^ciels$/i, 'ciel'])
  this.singularForms.regularForms.push([/^œils$/i, 'œil'])
  this.singularForms.regularForms.push([/(eau|eu|œu)x$/i, '$1'])
  this.singularForms.regularForms.push([/aux$/i, 'al'])
  this.singularForms.regularForms.push([/(.*)s$/i, '$1'])

  this.pluralize = function (token) {
    return this.ize(token, this.pluralForms, this.customPluralForms)
  }

  this.singularize = function (token) {
    return this.ize(token, this.singularForms, this.customSingularForms)
  }
}

util.inherits(NounInflector, SingularPluralInflector)

module.exports = NounInflector


/***/ }),

/***/ 855:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.NounInflector = __webpack_require__(3634)
exports.NounInflectorFr = __webpack_require__(3282)
exports.NounInflectorJa = __webpack_require__(183)
exports.PresentVerbInflector = __webpack_require__(5966)
exports.CountInflector = __webpack_require__(2771)


/***/ }),

/***/ 183:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A noun inflector for Japanese.
 * Compiled from several sources including:
 * \@see http://answers.yahoo.com/question/index?qid=20080528201740AASBWy6
 * \@see http://www.excite.co.jp/dictionary/english_japanese/
 *
 * This script assumes input is normalized using normalizer_ja().
 * Pluralizing Japanese has a very limited interest.
 * Japanese don't usually distinct plural from singular, so even a word looking
 * like a singular might actually be a plural.
 *
 * Singularization of nouns ending by -tachi or -ra is achieved using a
 * comprehensive black list, while nouns ending by -domo or -gata use a white
 * list because there are too many exceptions.
 *
 * \@todo Singularize nouns ending by -ら, but there are too many exceptions.
 * \@todo Expand the list of common plurals ending by -domo and -gata.
 */

const SingularPluralInflector = __webpack_require__(9154)
const util = __webpack_require__(9539)
const FormSet = __webpack_require__(9936)

/*
function attach () {
  const inflector = this

  String.prototype.singularizeNoun = function () {
    return inflector.singularize(this)
  }

  String.prototype.pluralizeNoun = function () {
    return inflector.pluralize(this)
  }
}
*/

/**
 * @constructor
 */
const NounInflector = function () {
  // Ambiguous a.k.a. invariant.
  this.ambiguous = [
    'ともだち', '友だち', '友達', '遊び友達', '飲み友達', '酒飲み友達', '茶飲み友達',
    '学校友達', '女友達', '男友達', '幼友達'
  ]

  this.customPluralForms = []
  this.customSingularForms = []
  this.singularForms = new FormSet()
  this.pluralForms = new FormSet()

  // this.attach = attach

  this.addIrregular('神', '神神')
  this.addIrregular('人', '人人')
  this.addIrregular('年', '年年')
  this.addIrregular('月', '月月')
  this.addIrregular('日', '日日')
  this.addIrregular('星', '星星')
  this.addIrregular('島', '島島')
  this.addIrregular('我', '我我')
  this.addIrregular('山', '山山')
  this.addIrregular('国', '国国')
  this.addIrregular('所', '所所')
  this.addIrregular('隅', '隅隅')

  /**
   * Notes:
   * -たち exceptions: いたち, おいたち, ついたち, かたち, かおかたち, なりかたち, いでたち, はたち, からたち, なりたち
   * -達 exceptions: 伊達, 男伊達, 栄達, 上意下達, 熟達, 上達, 下意上達, 先達, 送達, 速達, 即日速達, 書留速達, 調達, 通達, 伝達, 到達, 配達, 牛乳配達, 新聞配達, 無料配達, 四通八達, 発達, 未発達, 御用達, 宮内庁御用達, 練達, 闊達
   * -等 exceptions: 一等, 下等, 何等, 均等, 勲等, 高等, 三等, 初等, 上等, 親等, 二親等, 数等, 対等, 中等, 同等, 特等, 二等, 品等, 不等, 平等, 悪平等, 男女平等, 不平等, 優等, 劣等
   */

  // Pluralize
  this.pluralForms.regularForms.push([/^(.+)$/i, '$1たち'])

  // Singularize
  this.singularForms.regularForms.push([/^(.+)たち$/i, function (a, mask) {
    if (['い', 'おい', 'つい', 'か', 'かおか', 'なりか', 'いで', 'は', 'から',
      'なり'].indexOf(mask) >= 0) { return mask + 'たち' }
    return mask
  }])
  this.singularForms.regularForms.push([/^(.+)達$/i, function (a, mask) {
    if (['伊', '伊', '栄', '上意下', '熟', '上', '下意上', '先', '送', '速',
      '即日速', '書留速', '調', '通', '伝', '到', '配', '牛乳配', '新聞配', '無料配',
      '四通八', '発', '未発', '御用', '宮内庁御用', '練', '闊'].indexOf(mask) >= 0) { return mask + '達' }
    return mask
  }]) // Singularize nouns ending by -等, but not exceptions.
  this.singularForms.regularForms.push([/^(.+)等$/i, function (a, mask) {
    if (['一', '下', '何', '均', '勲', '高', '三', '初', '親', '二親', '数', '対',
      '中', '同', '特', '二', '品', '不', '平', '悪平', '男女平', '不平', '優',
      '劣'].indexOf(mask) >= 0) { return mask + '等' }
    return mask
  }])
  this.singularForms.regularForms.push([/^(人間|わたくし|私|てまえ|手前|野郎|やろう|勇者|がき|ガキ|餓鬼|あくとう|悪党|猫|家来)(共|ども)$/i, '$1'])
  this.singularForms.regularForms.push([/^(神様|先生|あなた|大名|女中|奥様)(方|がた)$/i, '$1'])

  this.pluralize = function (token) {
    return this.ize(token, this.pluralForms, this.customPluralForms)
  }

  this.singularize = function (token) {
    return this.ize(token, this.singularForms, this.customSingularForms)
  }
}

util.inherits(NounInflector, SingularPluralInflector)

module.exports = NounInflector


/***/ }),

/***/ 3634:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const SingularPluralInflector = __webpack_require__(9154)
const util = __webpack_require__(9539)
const FormSet = __webpack_require__(9936)

// Changing the prototype of a native type is bad practice
/*
function attach () {
  const inflector = this

  String.prototype.singularizeNoun = function () {
    return inflector.singularize(this)
  }

  String.prototype.pluralizeNoun = function () {
    return inflector.pluralize(this)
  }
}
*/

const NounInflector = function () {
  this.ambiguous = [
    'bison', 'bream', 'carp', 'chassis', 'christmas', 'cod', 'corps', 'debris', 'deer',
    'diabetes', 'equipment', 'elk', 'fish', 'flounder', 'gallows', 'graffiti',
    'headquarters', 'herpes', 'highjinks', 'homework', 'information',
    'mackerel', 'mews', 'money', 'news', 'rice', 'rabies', 'salmon', 'series',
    'sheep', 'shrimp', 'species', 'swine', 'tennis', 'trout', 'tuna', 'whiting', 'wildebeest'
  ]

  this.customPluralForms = []
  this.customSingularForms = []
  this.singularForms = new FormSet()
  this.pluralForms = new FormSet()

  // this.attach = attach

  this.addIrregular('child', 'children')
  this.addIrregular('man', 'men')
  this.addIrregular('person', 'people')
  this.addIrregular('sex', 'sexes')
  this.addIrregular('mouse', 'mice')
  this.addIrregular('ox', 'oxen')
  this.addIrregular('foot', 'feet')
  this.addIrregular('tooth', 'teeth')
  this.addIrregular('goose', 'geese')
  this.addIrregular('ephemeris', 'ephemerides')
  this.addIrregular('cloth', 'clothes')
  this.addIrregular('hero', 'heroes')
  this.addIrregular('torso', 'torsi')

  // see if it is possible to unify the creation of both the singular and
  // plural regexes or maybe even just have one list. with a complete list
  // of rules it may only be possible for some regular forms, but worth a shot
  this.pluralForms.regularForms.push([/([aeiou]y)$/i, '$1s'])
  this.pluralForms.regularForms.push([/y$/i, 'ies'])
  this.pluralForms.regularForms.push([/ife$/i, 'ives'])
  this.pluralForms.regularForms.push([/(antenn|formul|nebul|vertebr|vit)a$/i, '$1ae'])
  this.pluralForms.regularForms.push([/(octop|vir|radi|nucle|fung|cact|stimul|alumn|calcul|hippopotam|macrofung|phoet|syllab|troph)us$/i, '$1i'])
  this.pluralForms.regularForms.push([/(buffal|tomat|tornad)o$/i, '$1oes'])
  this.pluralForms.regularForms.push([/(sis)$/i, 'ses'])
  this.pluralForms.regularForms.push([/(matr|vert|ind|cort)(ix|ex)$/i, '$1ices'])
  this.pluralForms.regularForms.push([/sses$/i, 'sses'])
  this.pluralForms.regularForms.push([/(x|ch|ss|sh|s|z)$/i, '$1es'])
  this.pluralForms.regularForms.push([/^(?!talis|.*hu)(.*)man$/i, '$1men'])
  this.pluralForms.regularForms.push([/(.*)/i, '$1s'])

  // Words ending in -ff or -ffe you just add s to make the plural.
  // Sheriffs | Giraffes
  // this.pluralForms.regularForms.push([/(.+ffe?)$/i, '$1s'])

  // words ending in f that just add s:
  // roof - roofs
  // chief - chiefs
  // oaf -oafs
  // this.pluralForms.regularForms.push([/([^f]+f)$/i, '$1s'])

  // Example of words using the -f / -fe to -ves rule
  // leaf - leaves
  // wolf - wolves
  // calf - calves
  // half - halves
  // knife - knives
  // loaf - loaves
  // life - lives
  // wife - wives
  // shelf - shelves
  // thief - thieves
  // yourself - yourselves
  this.addIrregular('leaf', 'leaves')
  this.addIrregular('wolf', 'wolves')
  this.addIrregular('calf', 'calves')
  this.addIrregular('half', 'halves')
  this.addIrregular('knife', 'knives')
  this.addIrregular('loaf', 'loaves')
  this.addIrregular('life', 'lives')
  this.addIrregular('wife', 'wives')
  this.addIrregular('shelf', 'shelves')
  this.addIrregular('thief', 'thieves')
  this.addIrregular('yourself', 'yourselves')

  // Some words have multiple valid plural forms endings with -ves or -s:
  // scarf - scarfs/scarves
  // dwarf - dwarfs / dwarves
  // wharf - wharfs / wharves
  // handkerchief - handkerchiefs / handkerchieves
  // this.pluralForms.regularForms.push([/(.*r)f/i, '$1ves'])

  // Singular inflections

  // Some words have multiple valid plural forms endings with -ves or -s:
  // scarf - scarfs/scarves
  // dwarf - dwarfs / dwarves
  // wharf - wharfs / wharves
  // handkerchief - handkerchiefs / handkerchieves
  this.singularForms.regularForms.push([/(.*)ves$/i, '$1f'])

  // expenses - expense
  // defenses - defense
  this.singularForms.regularForms.push([/(.*)nses$/i, '$1nse'])

  this.singularForms.regularForms.push([/([^v])ies$/i, '$1y'])
  this.singularForms.regularForms.push([/ives$/i, 'ife'])
  this.singularForms.regularForms.push([/(antenn|formul|nebul|vertebr|vit)ae$/i, '$1a'])
  this.singularForms.regularForms.push([/(octop|vir|radi|nucle|fung|cact|stimul|alumn|calcul|hippopotam|macrofung|phoet|syllab|troph)(i)$/i, '$1us'])
  this.singularForms.regularForms.push([/(buffal|tomat|tornad)(oes)$/i, '$1o'])
  this.singularForms.regularForms.push([/(analy|naly|synop|parenthe|diagno|the)ses$/i, '$1sis'])
  this.singularForms.regularForms.push([/(vert|ind|cort)(ices)$/i, '$1ex'])
  // our pluralizer won''t cause this form of appendix (appendicies)
  // but we should handle it
  this.singularForms.regularForms.push([/(matr|append)(ices)$/i, '$1ix'])
  this.singularForms.regularForms.push([/(x|ch|ss|sh|s|z)es$/i, '$1'])
  this.singularForms.regularForms.push([/men$/i, 'man'])
  this.singularForms.regularForms.push([/ss$/i, 'ss'])
  this.singularForms.regularForms.push([/s$/i, ''])

  this.pluralize = function (token) {
    return this.ize(token, this.pluralForms, this.customPluralForms)
  }

  this.singularize = function (token) {
    return this.ize(token, this.singularForms, this.customSingularForms)
  }
}

util.inherits(NounInflector, SingularPluralInflector)

module.exports = NounInflector


/***/ }),

/***/ 5966:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const util = __webpack_require__(9539)
const SingularPluralInflector = __webpack_require__(9154)
const FormSet = __webpack_require__(9936)

/*
function attach () {
  const inflector = this

  String.prototype.singularizePresentVerb = function () {
    return inflector.singularize(this)
  }

  String.prototype.pluralizePresentVerb = function () {
    return inflector.pluralize(this)
  }
}
*/

const VerbInflector = function () {
  this.ambiguous = [
    'will'
  ]

  // this.attach = attach

  this.customPluralForms = []
  this.customSingularForms = []
  this.singularForms = new FormSet()
  this.pluralForms = new FormSet()

  this.addIrregular('am', 'are')
  this.addIrregular('is', 'are')
  this.addIrregular('was', 'were')
  this.addIrregular('has', 'have')

  this.singularForms.regularForms.push([/ed$/i, 'ed'])
  this.singularForms.regularForms.push([/ss$/i, 'sses'])
  this.singularForms.regularForms.push([/x$/i, 'xes'])
  this.singularForms.regularForms.push([/(h|z|o)$/i, '$1es'])
  this.singularForms.regularForms.push([/$zz/i, 'zzes'])
  this.singularForms.regularForms.push([/([^a|e|i|o|u])y$/i, '$1ies'])
  this.singularForms.regularForms.push([/$/i, 's'])

  this.pluralForms.regularForms.push([/sses$/i, 'ss'])
  this.pluralForms.regularForms.push([/xes$/i, 'x'])
  this.pluralForms.regularForms.push([/([cs])hes$/i, '$1h'])
  this.pluralForms.regularForms.push([/zzes$/i, 'zz'])
  this.pluralForms.regularForms.push([/([^h|z|o|i])es$/i, '$1e'])
  this.pluralForms.regularForms.push([/ies$/i, 'y'])// flies->fly
  this.pluralForms.regularForms.push([/e?s$/i, ''])
}

util.inherits(VerbInflector, SingularPluralInflector)

module.exports = VerbInflector


/***/ }),

/***/ 9154:
/***/ ((module) => {

/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const TenseInflector = function () {
}

TenseInflector.prototype.addSingular = function (pattern, replacement) {
  this.customSingularForms.push([pattern, replacement])
}

TenseInflector.prototype.addPlural = function (pattern, replacement) {
  this.customPluralForms.push([pattern, replacement])
}

TenseInflector.prototype.ize = function (token, formSet, customForms) {
  const restoreCase = this.restoreCase(token)
  return restoreCase(this.izeRegExps(token, customForms) || this.izeAbiguous(token) ||
        this.izeRegulars(token, formSet) || this.izeRegExps(token, formSet.regularForms) ||
        token)
}

TenseInflector.prototype.izeAbiguous = function (token) {
  if (this.ambiguous.indexOf(token.toLowerCase()) > -1) { return token.toLowerCase() }

  return false
}

TenseInflector.prototype.pluralize = function (token) {
  return this.ize(token, this.pluralForms, this.customPluralForms)
}

TenseInflector.prototype.singularize = function (token) {
  return this.ize(token, this.singularForms, this.customSingularForms)
}

const uppercaseify = function (token) {
  return token.toUpperCase()
}
const capitalize = function (token) {
  return token[0].toUpperCase() + token.slice(1)
}
const lowercaseify = function (token) {
  return token.toLowerCase()
}

TenseInflector.prototype.restoreCase = function (token) {
  if (token[0] === token[0].toUpperCase()) {
    if (token[1] && token[1] === token[1].toLowerCase()) {
      return capitalize
    } else {
      return uppercaseify
    }
  } else {
    return lowercaseify
  }
}

TenseInflector.prototype.izeRegulars = function (token, formSet) {
  token = token.toLowerCase()
  // if (formSet.irregularForms.hasOwnProperty(token) && formSet.irregularForms[token]) {
  if (formSet.irregularForms[token]) {
    return formSet.irregularForms[token]
  }

  return false
}

TenseInflector.prototype.addForm = function (singularTable, pluralTable, singular, plural) {
  singular = singular.toLowerCase()
  plural = plural.toLowerCase()
  pluralTable[singular] = plural
  singularTable[plural] = singular
}

TenseInflector.prototype.addIrregular = function (singular, plural) {
  this.addForm(this.singularForms.irregularForms, this.pluralForms.irregularForms, singular, plural)
}

TenseInflector.prototype.izeRegExps = function (token, forms) {
  let i, form
  for (i = 0; i < forms.length; i++) {
    form = forms[i]

    if (token.match(form[0])) { return token.replace(form[0], form[1]) }
  }

  return false
}

module.exports = TenseInflector


/***/ }),

/***/ 5674:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.NGrams = __webpack_require__(9615)
exports.NGramsZH = __webpack_require__(985)


/***/ }),

/***/ 9615:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, 2018 Rob Ellis, Chris Umbel, Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const _ = __webpack_require__(6419)
const Tokenizer = __webpack_require__(723).WordTokenizer
let tokenizer = new Tokenizer()
let frequencies = {}
let nrOfNgrams = 0

exports.setTokenizer = function (t) {
  if (!_.isFunction(t.tokenize)) { throw new Error('Expected a valid Tokenizer') }
  tokenizer = t
}

exports.ngrams = function (sequence, n, startSymbol, endSymbol, stats) {
  return ngrams(sequence, n, startSymbol, endSymbol, stats)
}

exports.bigrams = function (sequence, startSymbol, endSymbol, stats) {
  return ngrams(sequence, 2, startSymbol, endSymbol, stats)
}

exports.trigrams = function (sequence, startSymbol, endSymbol, stats) {
  return ngrams(sequence, 3, startSymbol, endSymbol, stats)
}

exports.multrigrams = function (sequence, n, startSymbol, endSymbol, stats) {
  return ngrams(sequence, n, startSymbol, endSymbol, stats)
}

// Calculates a key (string) that can be used for a map
function arrayToKey (arr) {
  let result = '('
  arr.forEach(function (x) {
    result += x + ', '
  })
  result = result.substr(0, result.length - 2) + ')'
  return result
};

// Updates the statistics for the new ngram
function countNgrams (ngram) {
  nrOfNgrams++
  const key = arrayToKey(ngram)
  if (!frequencies[key]) {
    frequencies[key] = 0
  }
  frequencies[key]++
}

// If stats is true, statistics will be returned
const ngrams = function (sequence, n, startSymbol, endSymbol, stats) {
  const result = []
  frequencies = {}
  nrOfNgrams = 0

  if (!_.isArray(sequence)) {
    sequence = tokenizer.tokenize(sequence)
  }

  const count = _.max([0, sequence.length - n + 1])

  // Check for left padding
  if (typeof startSymbol !== 'undefined' && startSymbol !== null) {
    // Create an array of (n) start symbols
    const blanks = []
    for (let i = 0; i < n; i++) {
      blanks.push(startSymbol)
    }

    // Create the left padding
    for (let p = n - 1; p > 0; p--) {
      // Create a tuple of (p) start symbols and (n - p) words
      const ngram = blanks.slice(0, p).concat(sequence.slice(0, n - p))
      result.push(ngram)
      if (stats) {
        countNgrams(ngram)
      }
    }
  }

  // Build the complete ngrams
  for (let i = 0; i < count; i++) {
    const ngram = sequence.slice(i, i + n)
    result.push(ngram)
    if (stats) {
      countNgrams(ngram)
    }
  }

  // Check for right padding
  if (typeof endSymbol !== 'undefined' && endSymbol !== null) {
    // Create an array of (n) end symbols
    const blanks = []
    for (let i = 0; i < n; i++) {
      blanks.push(endSymbol)
    }

    // create the right padding
    for (let p = n - 1; p > 0; p--) {
      // Create a tuple of (p) start symbols and (n - p) words
      const ngram = sequence.slice(sequence.length - p, sequence.length).concat(blanks.slice(0, n - p))
      result.push(ngram)
      if (stats) {
        countNgrams(ngram)
      }
    }
  }

  if (stats) {
    // Count frequencies
    const Nr = {}
    Object.keys(frequencies).forEach(function (key) {
      if (!Nr[frequencies[key]]) {
        Nr[frequencies[key]] = 0
      }
      Nr[frequencies[key]]++
    })

    // Return the ngrams AND statistics
    return {
      ngrams: result,
      frequencies: frequencies,
      Nr: Nr,
      numberOfNgrams: nrOfNgrams
    }
  } else { // Do not break existing API of this module
    return result
  }
}


/***/ }),

/***/ 985:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const _ = __webpack_require__(6419)

exports.ngrams = function (sequence, n, startSymbol, endSymbol) {
  return ngrams(sequence, n, startSymbol, endSymbol)
}

exports.bigrams = function (sequence, startSymbol, endSymbol) {
  return ngrams(sequence, 2, startSymbol, endSymbol)
}

exports.trigrams = function (sequence, startSymbol, endSymbol) {
  return ngrams(sequence, 3, startSymbol, endSymbol)
}

const ngrams = function (sequence, n, startSymbol, endSymbol) {
  const result = []

  if (!_(sequence).isArray()) {
    sequence = sequence.split('')
  }

  const count = _.max([0, sequence.length - n + 1])

  // Check for left padding
  if (typeof startSymbol !== 'undefined' && startSymbol !== null) {
    // Create an array of (n) start symbols
    const blanks = []
    for (let i = 0; i < n; i++) {
      blanks.push(startSymbol)
    }

    // Create the left padding
    for (let p = n - 1; p > 0; p--) {
      // Create a tuple of (p) start symbols and (n - p) words
      result.push(blanks.slice(0, p).concat(sequence.slice(0, n - p)))
    }
  }

  // Build the complete ngrams
  for (let i = 0; i < count; i++) {
    result.push(sequence.slice(i, i + n))
  }

  // Check for right padding
  if (typeof endSymbol !== 'undefined' && endSymbol !== null) {
    // Create an array of (n) end symbols
    const blanks = []
    for (let i = 0; i < n; i++) {
      blanks.push(endSymbol)
    }

    // create the right padding
    for (let p = n - 1; p > 0; p--) {
      // Create a tuple of (p) start symbols and (n - p) words
      result.push(sequence.slice(sequence.length - p, sequence.length).concat(blanks.slice(0, n - p)))
    }
  }

  return result
}


/***/ }),

/***/ 5313:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.normalize = __webpack_require__(400).normalizeTokens
exports.normalize_ja = __webpack_require__(4555).normalizeJa
exports.removeDiacritics = __webpack_require__(8736)


/***/ }),

/***/ 400:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 Copyright (c) 2013, Kenneth Koch

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */



/**
 * The english normalizer will create a string in which all contractions are expanded to their
 * full meaning (i.e. "we'll" becomes "we will").
 *
 * It currently works off a conversion table and falls back to a set of rules.
 * Since it is applied first, the conversion table provides an "override" for the rules.
 **/
// const replacer = require('../util/utils').replacer

const conversionTable = {
  "can't": 'can not',
  "won't": 'will not',
  "couldn't've": 'could not have',
  "i'm": 'I am',
  "how'd": 'how did'
}

const rules = [
  { regex: /([azAZ]*)n'[tT]/g, output: '$1 not' },
  { regex: /([azAZ]*)'[sS]/g, output: '$1 is' },
  { regex: /([azAZ]*)'[lL][lL]/g, output: '$1 will' },
  { regex: /([azAZ]*)'[rR][eE]/g, output: '$1 are' },
  { regex: /([azAZ]*)'[vV][eE]/g, output: '$1 have' },
  { regex: /([azAZ]*)'[dD]/g, output: '$1 would' }
]

// Accepts a list of tokens to expand.
const normalizeTokens = function (tokens) {
  if (typeof tokens === 'string') {
    tokens = [tokens]
  }
  let results = []
  const ruleCount = rules.length
  const numTokens = tokens.length
  let i, token, r, rule

  for (i = 0; i < numTokens; i++) {
    token = tokens[i]
    // Check the conversion table
    if (conversionTable[token.toLowerCase()]) {
      results = results.concat(conversionTable[token.toLowerCase()].split(/\W+/))
    } else { // Apply the rules
      let matched = false
      for (r = 0; r < ruleCount; r++) {
        rule = rules[r]
        if (token.match(rule.regex)) {
          results = results.concat(token.replace(rule.regex, rule.output).split(/\W+/))
          matched = true
          break
        }
      }
      if (!matched) {
        results.push(token)
      }
    }
  }

  return results
}

// export the relevant stuff.
exports.normalizeTokens = normalizeTokens


/***/ }),

/***/ 8790:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 Copyright (c) 2014, Kristoffer Brabrand

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */



/**
 * Remove commonly used diacritic marks from a string as these
 * are not used in a consistent manner. Leave only ä, ö, ü.
 */
const removeDiacritics = function (text) {
  text = text.replace('à', 'a')
  text = text.replace('À', 'A')
  text = text.replace('á', 'a')
  text = text.replace('Á', 'A')
  text = text.replace('â', 'a')
  text = text.replace('Â', 'A')
  text = text.replace('ç', 'c')
  text = text.replace('Ç', 'C')
  text = text.replace('è', 'e')
  text = text.replace('È', 'E')
  text = text.replace('é', 'e')
  text = text.replace('É', 'E')
  text = text.replace('ê', 'e')
  text = text.replace('Ê', 'E')
  text = text.replace('î', 'i')
  text = text.replace('Î', 'I')
  text = text.replace('ñ', 'n')
  text = text.replace('Ñ', 'N')
  text = text.replace('ó', 'o')
  text = text.replace('Ó', 'O')
  text = text.replace('ô', 'o')
  text = text.replace('Ô', 'O')
  text = text.replace('û', 'u')
  text = text.replace('Û', 'U')
  text = text.replace('š', 's')
  text = text.replace('Š', 'S')

  return text
}

// export the relevant stuff.
exports.removeDiacritics = removeDiacritics


/***/ }),

/***/ 1745:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 Copyright (c) 2017, Dogan Yazar

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */



/**
 * Remove commonly used diacritic marks from a string as these
 * are not used in a consistent manner. Leave only ä, ö, å.
 */
const removeDiacritics = function (text) {
  text = text.replace('à', 'a')
  text = text.replace('À', 'A')
  text = text.replace('á', 'a')
  text = text.replace('Á', 'A')
  text = text.replace('è', 'e')
  text = text.replace('È', 'E')
  text = text.replace('é', 'e')
  text = text.replace('É', 'E')

  return text
}

// export the relevant stuff.
exports.removeDiacritics = removeDiacritics


/***/ }),

/***/ 8736:
/***/ ((module) => {

"use strict";
/*
 Copyright (c) 2012, Alexy Maslennikov

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */



/**
 * Script to remove diacritics. Original source was taken from
 * http://lehelk.com/2011/05/06/script-to-remove-diacritics/
 */
const diacriticsRemovalMap = [
  { base: 'A', letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
  { base: 'AA', letters: /[\uA732]/g },
  { base: 'AE', letters: /[\u00C6\u01FC\u01E2]/g },
  { base: 'AO', letters: /[\uA734]/g },
  { base: 'AU', letters: /[\uA736]/g },
  { base: 'AV', letters: /[\uA738\uA73A]/g },
  { base: 'AY', letters: /[\uA73C]/g },
  { base: 'B', letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
  { base: 'C', letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
  { base: 'D', letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
  { base: 'DZ', letters: /[\u01F1\u01C4]/g },
  { base: 'Dz', letters: /[\u01F2\u01C5]/g },
  { base: 'E', letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
  { base: 'F', letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
  { base: 'G', letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
  { base: 'H', letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
  { base: 'I', letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
  { base: 'J', letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
  { base: 'K', letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
  { base: 'L', letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
  { base: 'LJ', letters: /[\u01C7]/g },
  { base: 'Lj', letters: /[\u01C8]/g },
  { base: 'M', letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
  { base: 'N', letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
  { base: 'NJ', letters: /[\u01CA]/g },
  { base: 'Nj', letters: /[\u01CB]/g },
  { base: 'O', letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
  { base: 'OE', letters: /[\u0152]/g },
  { base: 'OI', letters: /[\u01A2]/g },
  { base: 'OO', letters: /[\uA74E]/g },
  { base: 'OU', letters: /[\u0222]/g },
  { base: 'P', letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
  { base: 'Q', letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
  { base: 'R', letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
  { base: 'S', letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
  { base: 'T', letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
  { base: 'TZ', letters: /[\uA728]/g },
  { base: 'U', letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
  { base: 'V', letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
  { base: 'VY', letters: /[\uA760]/g },
  { base: 'W', letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
  { base: 'X', letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
  { base: 'Y', letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
  { base: 'Z', letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
  { base: 'a', letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
  { base: 'aa', letters: /[\uA733]/g },
  { base: 'ae', letters: /[\u00E6\u01FD\u01E3]/g },
  { base: 'ao', letters: /[\uA735]/g },
  { base: 'au', letters: /[\uA737]/g },
  { base: 'av', letters: /[\uA739\uA73B]/g },
  { base: 'ay', letters: /[\uA73D]/g },
  { base: 'b', letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
  { base: 'c', letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
  { base: 'd', letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
  { base: 'dz', letters: /[\u01F3\u01C6]/g },
  { base: 'e', letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
  { base: 'f', letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
  { base: 'g', letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
  { base: 'h', letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
  { base: 'hv', letters: /[\u0195]/g },
  { base: 'i', letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
  { base: 'j', letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
  { base: 'k', letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
  { base: 'l', letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
  { base: 'lj', letters: /[\u01C9]/g },
  { base: 'm', letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
  { base: 'n', letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
  { base: 'nj', letters: /[\u01CC]/g },
  { base: 'o', letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
  { base: 'oe', letters: /[\u0153]/g },
  { base: 'oi', letters: /[\u01A3]/g },
  { base: 'ou', letters: /[\u0223]/g },
  { base: 'oo', letters: /[\uA74F]/g },
  { base: 'p', letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
  { base: 'q', letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
  { base: 'r', letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
  { base: 's', letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
  { base: 't', letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
  { base: 'tz', letters: /[\uA729]/g },
  { base: 'u', letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
  { base: 'v', letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
  { base: 'vy', letters: /[\uA761]/g },
  { base: 'w', letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
  { base: 'x', letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
  { base: 'y', letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g },
  { base: 'z', letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g }
]

module.exports = function (str) {
  const rules = diacriticsRemovalMap
  for (let i = 0; i < rules.length; i++) {
    str = str.replace(rules[i].letters, rules[i].base)
  }
  return str
}


/***/ }),

/***/ 1150:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, Alexy Maslenninkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



/*
 * Daitch-Mokotoff Soundex Coding
 *
 * The Daitch-Mokotoff Soundex System was created by Randy Daitch and Gary
 * Mokotoff of the Jewish Genealogical Society because they concluded the system
 * developed by Robert Russell in 1918, and in use today by the U.S. National
 * Archives and Records Administration (NARA) does not apply well to many Slavic
 * and Yiddish surnames.  It also includes refinements that are independent of
 * ethnic considerations.
 *
 * The rules for converting surnames into D-M Code numbers are listed below.
 * They are followed by the coding chart.
 *
 * 1. Names are coded to six digits, each digit representing a sound listed in
 * the coding chart (below).
 *
 * 2. When a name lacks enough coded sounds for six digits, use zeros to fill to
 * six digits. GOLDEN which has only four coded sounds [G-L-D-N] is coded as
 * 583600.
 *
 * 3. The letters A, E, I, O, U, J, and Y are always coded at the beginning of a
 * name as in Alpert 087930. In any other situation, they are ignored except
 * when two of them form a pair and the pair comes before a vowel, as in Breuer
 * 791900 but not Freud.
 *
 * 4. The letter H is coded at the beginning of a name, as in Haber 579000, or
 * preceding a vowel, as in Manheim 665600, otherwise it is not coded.
 *
 * 5. When adjacent sounds can combine to form a larger sound, they are given
 * the code number of the larger sound.  Mintz which is not coded MIN-T-Z but
 * MIN-TZ 664000.
 *
 * 6. When adjacent letters have the same code number, they are coded as one
 * sound, as in TOPF, which is not coded TO-P-F 377000 but TO-PF 370000.
 * Exceptions to this rule are the letter combinations MN and NM, whose letters
 * are coded separately, as in Kleinman, which is coded 586660 not 586600.
 *
 * 7. When a surname consists or more than one word, it is coded as if one word,
 * such as Ben Aron which is treated as Benaron.
 *
 * 8. Several letter and letter combinations pose the problem that they may
 * sound in one of two ways.  The letter and letter combinations CH, CK, C, J,
 * and RS are assigned two possible code numbers.
 *
 * For more info, see http://www.jewishgen.org/InfoFiles/soundex.html
 */

/**
 * D-M transformation table in the form of finite-state machine.
 * Every element of the table having member with zero index represents
 * legal FSM state; every non-zero key is the transition rule.
 *
 * Every legal state comprises tree values chosen according to the position
 * of the letter combination in the word:
 *   0: start of a word;
 *   1: before a vowel;
 *   2: any other situation.
 */

/* jscpd:ignore-start */
const codes = {
  A: {
    0: [0, -1, -1],
    I: [[0, 1, -1]],
    J: [[0, 1, -1]],
    Y: [[0, 1, -1]],
    U: [[0, 7, -1]]
  },
  B: [[7, 7, 7]],
  C: {
    0: [5, 5, 5],
    Z: { 0: [4, 4, 4], S: [[4, 4, 4]] },
    S: { 0: [4, 4, 4], Z: [[4, 4, 4]] },
    K: [[5, 5, 5], [45, 45, 45]],
    H: { 0: [5, 5, 5], S: [[5, 54, 54]] }
  },
  D: {
    0: [3, 3, 3],
    T: [[3, 3, 3]],
    Z: { 0: [4, 4, 4], H: [[4, 4, 4]], S: [[4, 4, 4]] },
    S: { 0: [4, 4, 4], H: [[4, 4, 4]], Z: [[4, 4, 4]] },
    R: { S: [[4, 4, 4]], Z: [[4, 4, 4]] }
  },
  E: {
    0: [0, -1, -1],
    I: [[0, 1, -1]],
    J: [[0, 1, -1]],
    Y: [[0, 1, -1]],
    U: [[1, 1, -1]],
    W: [[1, 1, -1]]
  },
  F: {
    0: [7, 7, 7],
    B: [[7, 7, 7]]
  },
  G: [[5, 5, 5]],
  H: [[5, 5, -1]],
  I: {
    0: [0, -1, -1],
    A: [[1, -1, -1]],
    E: [[1, -1, -1]],
    O: [[1, -1, -1]],
    U: [[1, -1, -1]]
  },
  J: [[4, 4, 4]],
  K: {
    0: [5, 5, 5],
    H: [[5, 5, 5]],
    S: [[5, 54, 54]]
  },
  L: [[8, 8, 8]],
  M: {
    0: [6, 6, 6],
    N: [[66, 66, 66]]
  },
  N: {
    0: [6, 6, 6],
    M: [[66, 66, 66]]
  },
  O: {
    0: [0, -1, -1],
    I: [[0, 1, -1]],
    J: [[0, 1, -1]],
    Y: [[0, 1, -1]]
  },
  P: {
    0: [7, 7, 7],
    F: [[7, 7, 7]],
    H: [[7, 7, 7]]
  },
  Q: [[5, 5, 5]],
  R: {
    0: [9, 9, 9],
    Z: [[94, 94, 94], [94, 94, 94]],
    S: [[94, 94, 94], [94, 94, 94]]
  },
  S: {
    0: [4, 4, 4],
    Z: { 0: [4, 4, 4], T: [[2, 43, 43]], C: { Z: [[2, 4, 4]], S: [[2, 4, 4]] }, D: [[2, 43, 43]] },
    D: [[2, 43, 43]],
    T: { 0: [2, 43, 43], R: { Z: [[2, 4, 4]], S: [[2, 4, 4]] }, C: { H: [[2, 4, 4]] }, S: { H: [[2, 4, 4]], C: { H: [[2, 4, 4]] } } },
    C: { 0: [2, 4, 4], H: { 0: [4, 4, 4], T: { 0: [2, 43, 43], S: { C: { H: [[2, 4, 4]] }, H: [[2, 4, 4]] }, C: { H: [[2, 4, 4]] } }, D: [[2, 43, 43]] } },
    H: { 0: [4, 4, 4], T: { 0: [2, 43, 43], C: { H: [[2, 4, 4]] }, S: { H: [[2, 4, 4]] } }, C: { H: [[2, 4, 4]] }, D: [[2, 43, 43]] }
  },
  T: {
    0: [3, 3, 3],
    C: { 0: [4, 4, 4], H: [[4, 4, 4]] },
    Z: { 0: [4, 4, 4], S: [[4, 4, 4]] },
    S: { 0: [4, 4, 4], Z: [[4, 4, 4]], H: [[4, 4, 4]], C: { H: [[4, 4, 4]] } },
    T: { S: { 0: [4, 4, 4], Z: [[4, 4, 4]], C: { H: [[4, 4, 4]] } }, C: { H: [[4, 4, 4]] }, Z: [[4, 4, 4]] },
    H: [[3, 3, 3]],
    R: { Z: [[4, 4, 4]], S: [[4, 4, 4]] }
  },
  U: {
    0: [0, -1, -1],
    E: [[0, -1, -1]],
    I: [[0, 1, -1]],
    J: [[0, 1, -1]],
    Y: [[0, 1, -1]]
  },
  V: [[7, 7, 7]],
  W: [[7, 7, 7]],
  X: [[5, 54, 54]],
  Y: [[1, -1, -1]],
  Z: {
    0: [4, 4, 4],
    D: { 0: [2, 43, 43], Z: { 0: [2, 4, 4], H: [[2, 4, 4]] } },
    H: { 0: [4, 4, 4], D: { 0: [2, 43, 43], Z: { H: [[2, 4, 4]] } } },
    S: { 0: [4, 4, 4], H: [[4, 4, 4]], C: { H: [[4, 4, 4]] } }
  }
}
/* jscpd:ignore-end */

function process (word, codeLength) {
  codeLength = codeLength || 6
  word = word.toUpperCase()
  let output = ''

  let pos = 0; let lastCode = -1
  while (pos < word.length) {
    const substr = word.slice(pos)
    const rules = findRules(substr)

    let code
    if (pos === 0) {
      // at the beginning of the word
      code = rules.mapping[0]
    } else if (substr[rules.length] && findRules(substr[rules.length]).mapping[0] === 0) {
      // before a vowel
      code = rules.mapping[1]
    } else {
      // any other situation
      code = rules.mapping[2]
    }

    if ((code !== -1) && (code !== lastCode)) output += code
    lastCode = code
    pos += rules.length
  }

  return normalizeLength(output, codeLength)
}

function findRules (str) {
  let state = codes[str[0]]
  let legalState = state || [[-1, -1, -1]]
  let charsInvolved = 1

  for (let offs = 1; offs < str.length; offs++) {
    if (!state || !state[str[offs]]) break

    state = state[str[offs]]
    if (state[0]) {
      legalState = state
      charsInvolved = offs + 1
    }
  }

  return {
    length: charsInvolved,
    mapping: legalState[0]
  }
}

/**
 * Pad right with zeroes or cut excess symbols to fit length
 */
function normalizeLength (token, length) {
  length = length || 6
  if (token.length < length) {
    token += (new Array(length - token.length + 1)).join('0')
  }
  return token.slice(0, length)
}

const Phonetic = __webpack_require__(6432)
const soundex = new Phonetic()
soundex.process = process
module.exports = soundex


/***/ }),

/***/ 3994:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Phonetic = __webpack_require__(6432)

const DoubleMetaphone = new Phonetic()
module.exports = DoubleMetaphone

function isVowel (c) {
  return c && c.match(/[aeiouy]/i)
}

function truncate (string, length) {
  if (string.length >= length) { string = string.substring(0, length) }

  return string
}

function process (token, maxLength) {
  token = token.toUpperCase()
  let primary = ''; let secondary = ''
  let pos = 0
  maxLength = maxLength || 32

  function subMatch (startOffset, stopOffset, terms) {
    return subMatchAbsolute(pos + startOffset, pos + stopOffset, terms)
  }

  function subMatchAbsolute (startOffset, stopOffset, terms) {
    return terms.indexOf(token.substring(startOffset, stopOffset)) > -1
  }

  function addSecondary (primaryAppendage, secondaryAppendage) {
    primary += primaryAppendage
    secondary += secondaryAppendage
  }

  function add (primaryAppendage) {
    addSecondary(primaryAppendage, primaryAppendage)
  }

  function addCompressedDouble (c, encoded) {
    if (token[pos + 1] === c) {
      pos++
    }
    add(encoded || c)
  }

  function handleC () {
    if ((pos >= 1 && !isVowel(token[pos - 2]) &&
      token[pos - 1] === 'A' && token[pos + 1] === 'H' &&
      token[pos + 2] !== 'I') ||
      subMatch(-2, 4, ['BACHER', 'MACHER'])) {
      add('K')
      pos++
    } else if (pos === 0 && token.substring(1, 6) === 'EASAR') {
      add('S')
      add('S')
      add('R')
      pos += 6
    } else if (token.substring(pos + 1, pos + 4) === 'HIA') {
      add('K')
      pos++
    } else if (token[pos + 1] === 'H') {
      if (pos > 0 && token.substring(pos + 2, pos + 4) === 'AE') {
        addSecondary('K', 'X')
        pos++
      } else if (pos === 0 &&
                        (subMatch(1, 6, ['HARAC', 'HARIS']) ||
                            subMatch(1, 4, ['HOR', 'HUM', 'HIA', 'HEM'])) &&
                        token.substring(pos + 1, pos + 5) !== 'HORE') {
        add('K')
        pos++
      } else {
        if ((subMatchAbsolute(0, 3, ['VAN', 'VON']) || token.substring(0, 3) === 'SCH') ||
                    subMatch(-2, 4, ['ORCHES', 'ARCHIT', 'ORCHID']) ||
                    subMatch(2, 3, ['T', 'S']) ||
                    ((subMatch(-1, 0, ['A', 'O', 'U', 'E']) || pos === 0) &&
                        subMatch(2, 3, ['B', 'F', 'H', 'L', 'M', 'N', 'R', 'V', 'W']))) {
          add('K')
        } else if (pos > 0) {
          if (token.substring(0, 2) === 'MC') {
            add('K')
          } else {
            addSecondary('X', 'K')
          }
        } else {
          add('X')
        }

        pos++
      }
    } else if (token.substring(pos, pos + 2) === 'CZ' &&
                token.substring(pos - 2, pos + 1) !== 'WICZ') {
      addSecondary('S', 'X')
      pos++
    } else if (token.substring(pos, pos + 3) === 'CIA') {
      add('X')
      pos += 2
    } else if (token[pos + 1] === 'C' && pos !== 1 && token[0] !== 'M') {
      if (['I', 'E', 'H'].indexOf(token[pos + 2]) > -1 &&
                    token.substring(pos + 2, pos + 4) !== 'HU') {
        if ((pos === 1 && token[pos - 1] === 'A') ||
              subMatch(-1, 4, ['UCCEE', 'UCCES'])) {
          add('KS')
        } else {
          add('X')
        }

        pos += 2
      } else {
        add('K')
        pos++
      }
    } else if (['K', 'G', 'Q'].indexOf(token[pos + 1]) > -1) {
      add('K')
      pos++
    } else if (['E', 'I', 'Y'].indexOf(token[pos + 1]) > -1) {
      if (subMatch(1, 3, ['IA', 'IE', 'IO'])) {
        addSecondary('S', 'X')
      } else {
        add('S')
      }
      pos++
    } else {
      add('K')
      if (token[pos + 1] === ' ' && ['C', 'Q', 'G'].indexOf(token[pos + 2])) {
        pos += 2
      } else if (['C', 'K', 'Q'].indexOf(token[pos + 1]) > -1 &&
                    !subMatch(1, 3, ['CE', 'CI'])) {
        pos++
      }
    }
  }

  function handleD () {
    if (token[pos + 1] === 'G') {
      if (['I', 'E', 'Y'].indexOf(token[pos + 2]) > -1) {
        add('J')
        pos += 2
      } else {
        add('TK')
        pos++
      }
    } else if (token[pos + 1] === 'T') {
      add('T')
      pos++
    } else { addCompressedDouble('D', 'T') }
  }

  function handleG () {
    if (token[pos + 1] === 'H') {
      if (pos > 0 && !isVowel(token[pos - 1])) {
        add('K')
        pos++
      } else if (pos === 0) {
        if (token[pos + 2] === 'I') {
          add('J')
        } else {
          add('K')
        }
        pos++
      } else if (pos > 1 &&
                (['B', 'H', 'D'].indexOf(token[pos - 2]) > -1 ||
                    ['B', 'H', 'D'].indexOf(token[pos - 3]) > -1 ||
                    ['B', 'H'].indexOf(token[pos - 4]) > -1)) {
        pos++
      } else {
        if (pos > 2 &&
                        token[pos - 1] === 'U' &&
                        ['C', 'G', 'L', 'R', 'T'].indexOf(token[pos - 3]) > -1) {
          add('F')
        } else if (token[pos - 1] !== 'I') {
          add('K')
        }

        pos++
      }
    } else if (token[pos + 1] === 'N') {
      if (pos === 1 && startsWithVowel && !slavoGermanic) {
        addSecondary('KN', 'N')
      } else {
        if (token.substring(pos + 2, pos + 4) !== 'EY' &&
                        (token[pos + 1] !== 'Y' &&
                            !slavoGermanic)) {
          addSecondary('N', 'KN')
        } else { add('KN') }
      }
      pos++
    } else if (token.substring(pos + 1, pos + 3) === 'LI' && !slavoGermanic) {
      addSecondary('KL', 'L')
      pos++
    } else if (pos === 0 && (token[pos + 1] === 'Y' ||
                subMatch(1, 3, ['ES', 'EP', 'EB', 'EL', 'EY', 'IB', 'IL', 'IN', 'IE', 'EI', 'ER']))) {
      addSecondary('K', 'J')
    } else {
      addCompressedDouble('G', 'K')
    }
  }

  function handleH () {
    // keep if starts a word or is surrounded by vowels
    if ((pos === 0 || isVowel(token[pos - 1])) && isVowel(token[pos + 1])) {
      add('H')
      pos++
    }
  }

  function handleJ () {
    const jose = (token.substring(pos + 1, pos + 4) === 'OSE')

    if (san || jose) {
      if ((pos === 0 && token[pos + 4] === ' ') ||
                    san) {
        add('H')
      } else { add('J', 'H') }
    } else {
      if (pos === 0/* && !jose */) {
        addSecondary('J', 'A')
      } else if (isVowel(token[pos - 1]) && !slavoGermanic &&
                    (token[pos + 1] === 'A' || token[pos + 1] === 'O')) {
        addSecondary('J', 'H')
      } else if (pos === token.length - 1) {
        addSecondary('J', ' ')
      } else { addCompressedDouble('J') }
    }
  }

  function handleL () {
    if (token[pos + 1] === 'L') {
      if (pos === token.length - 3 && (
        subMatch(-1, 3, ['ILLO', 'ILLA', 'ALLE']) || (
          token.substring(pos - 1, pos + 3) === 'ALLE' &&
          (subMatch(-2, -1, ['AS', 'OS']) > -1 ||
          ['A', 'O'].indexOf(token[token.length - 1]) > -1)))) {
        addSecondary('L', '')
        pos++
        return
      }
      pos++
    }
    add('L')
  }

  function handleM () {
    addCompressedDouble('M')
    if (token[pos - 1] === 'U' && token[pos + 1] === 'B' &&
      ((pos === token.length - 2 || token.substring(pos + 2, pos + 4) === 'ER'))) { pos++ }
  }

  function handleP () {
    if (token[pos + 1] === 'H') {
      add('F')
      pos++
    } else {
      addCompressedDouble('P')
      if (token[pos + 1] === 'B') {
        pos++
      }
    }
  }

  function handleR () {
    if (pos === token.length - 1 && !slavoGermanic &&
      token.substring(pos - 2, pos) === 'IE' &&
      !subMatch(-4, -3, ['ME', 'MA'])) {
      addSecondary('', 'R')
    } else {
      addCompressedDouble('R')
    }
  }

  function handleS () {
    if (pos === 0 && token.substring(0, 5) === 'SUGAR') {
      addSecondary('X', 'S')
    } else if (token[pos + 1] === 'H') {
      if (subMatch(2, 5, ['EIM', 'OEK', 'OLM', 'OLZ'])) {
        add('S')
      } else {
        add('X')
      }
      pos++
    } else if (subMatch(1, 3, ['IO', 'IA'])) {
      if (slavoGermanic) {
        add('S')
      } else {
        addSecondary('S', 'X')
      }
      pos++
    } else if ((pos === 0 && ['M', 'N', 'L', 'W'].indexOf(token[pos + 1]) > -1) ||
                token[pos + 1] === 'Z') {
      addSecondary('S', 'X')
      if (token[pos + 1] === 'Z') { pos++ }
    } else if (token.substring(pos, pos + 2) === 'SC') {
      if (token[pos + 2] === 'H') {
        if (subMatch(3, 5, ['ER', 'EN'])) {
          addSecondary('X', 'SK')
        } else if (subMatch(3, 5, ['OO', 'UY', 'ED', 'EM'])) {
          add('SK')
        } else if (pos === 0 && !isVowel(token[3]) && token[3] !== 'W') {
          addSecondary('X', 'S')
        } else {
          add('X')
        }
      } else if (['I', 'E', 'Y'].indexOf(token[pos + 2]) > -1) {
        add('S')
      } else {
        add('SK')
      }

      pos += 2
    } else if (pos === token.length - 1 &&
                subMatch(-2, 0, ['AI', 'OI'])) {
      addSecondary('', 'S')
    } else if (token[pos + 1] !== 'L' && (
      token[pos - 1] !== 'A' && token[pos - 1] !== 'I')) {
      addCompressedDouble('S')
      if (token[pos + 1] === 'Z') { pos++ }
    }
  }

  function handleT () {
    if (token.substring(pos + 1, pos + 4) === 'ION') {
      add('XN')
      pos += 3
    } else if (subMatch(1, 3, ['IA', 'CH'])) {
      add('X')
      pos += 2
    } else if (token[pos + 1] === 'H' ||
                token.substring(1, 2) === 'TH') {
      if (subMatch(2, 4, ['OM', 'AM']) ||
                    ['VAN ', 'VON '].indexOf(token.substring(0, 4)) > -1 ||
                    token.substring(0, 3) === 'SCH') {
        add('T')
      } else { addSecondary('0', 'T') }
      pos++
    } else {
      addCompressedDouble('T')

      if (token[pos + 1] === 'D') { pos++ }
    }
  }

  function handleX () {
    if (pos === 0) {
      add('S')
    } else if (!(pos === token.length - 1 &&
      (['IAU', 'EAU', 'IEU'].indexOf(token.substring(pos - 3, pos)) > -1 ||
      ['AU', 'OU'].indexOf(token.substring(pos - 2, pos)) > -1))) {
      add('KS')
    }
  }

  function handleW () {
    if (pos === 0) {
      if (token[1] === 'H') {
        add('A')
      } else if (isVowel(token[1])) {
        addSecondary('A', 'F')
      }
    } else if (subMatch(-1, 4, ['EWSKI', 'EWSKY', 'OWSKI', 'OWSKY']) ||
      token.substring(0, 3) === 'SCH' ||
      (pos === token.length - 1 && isVowel(token[pos - 1]))) {
      addSecondary('', 'F')
      pos++
    } else if (['ICZ', 'ITZ'].indexOf(token.substring(pos + 1, pos + 4)) > -1) {
      addSecondary('TS', 'FX')
      pos += 3
    }
  }

  function handleZ () {
    if (token[pos + 1] === 'H') {
      add('J')
      pos++
    } else if (subMatch(1, 3, ['ZO', 'ZI', 'ZA']) ||
      (slavoGermanic && pos > 0 && token[pos - 1] !== 'T')) {
      addSecondary('S', 'TS')
      pos++
    } else { addCompressedDouble('Z', 'S') }
  }

  const san = (token.substring(0, 3) === 'SAN')
  const startsWithVowel = isVowel(token[0])
  const slavoGermanic = token.match(/(W|K|CZ|WITZ)/)

  if (subMatch(0, 2, ['GN', 'KN', 'PN', 'WR', 'PS'])) {
    pos++
  }

  while (pos < token.length) {
    switch (token[pos]) {
      case 'A': case 'E': case 'I': case 'O': case 'U': case 'Y':
      case 'Ê': case 'É': case 'À':
        if (pos === 0) { add('A') }
        break
      case 'B':
        addCompressedDouble('B', 'P')
        break
      case 'C':
        handleC()
        break
      case 'Ç':
        add('S')
        break
      case 'D':
        handleD()
        break
      case 'F': case 'K': case 'N':
        addCompressedDouble(token[pos])
        break
      case 'G':
        handleG()
        break
      case 'H':
        handleH()
        break
      case 'J':
        handleJ()
        break
      case 'L':
        handleL()
        break
      case 'M':
        handleM()
        break
      case 'Ñ':
        add('N')
        break
      case 'P':
        handleP()
        break
      case 'Q':
        addCompressedDouble('Q', 'K')
        break
      case 'R':
        handleR()
        break
      case 'S':
        handleS()
        break
      case 'T':
        handleT()
        break
      case 'V':
        addCompressedDouble('V', 'F')
        break
      case 'W':
        handleW()
        break
      case 'X':
        handleX()
        break
      case 'Z':
        handleZ()
        break
    }

    if (primary.length >= maxLength && secondary.length >= maxLength) {
      break
    }

    pos++
  }

  return [truncate(primary, maxLength), truncate(secondary, maxLength)]
}

function compare (stringA, stringB) {
  const encodingsA = process(stringA)
  const encodingsB = process(stringB)

  return encodingsA[0] === encodingsB[0] ||
    encodingsA[1] === encodingsB[1]
};

DoubleMetaphone.compare = compare
DoubleMetaphone.process = process
DoubleMetaphone.isVowel = isVowel


/***/ }),

/***/ 1947:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.SoundEx = __webpack_require__(8263)
exports.Metaphone = __webpack_require__(6681)
exports.DoubleMetaphone = __webpack_require__(3994)
exports.SoundExDM = __webpack_require__(1150)


/***/ }),

/***/ 6681:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



'use strict'

const Phonetic = __webpack_require__(6432)

function dedup (token) {
  return token.replace(/([^c])\1/g, '$1')
}

function dropInitialLetters (token) {
  if (token.match(/^(kn|gn|pn|ae|wr)/)) { return token.substr(1, token.length - 1) }

  return token
}

function dropBafterMAtEnd (token) {
  return token.replace(/mb$/, 'm')
}

function cTransform (token) {
  token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim()

  token = token.replace(/cia/g, 'xia')
  token = token.replace(/c(i|e|y)/g, 's$1')
  token = token.replace(/c/g, 'k')

  return token
}

function dTransform (token) {
  token = token.replace(/d(ge|gy|gi)/g, 'j$1')
  token = token.replace(/d/g, 't')

  return token
}

function dropG (token) {
  token = token.replace(/gh(^$|[^aeiou])/g, 'h$1')
  token = token.replace(/g(n|ned)$/g, '$1')

  return token
}

function transformG (token) {
  token = token.replace(/gh/g, 'f')
  token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3')
  token = token.replace(/gg/g, 'g')
  token = token.replace(/g/g, 'k')

  return token
}

function dropH (token) {
  return token.replace(/([aeiou])h([^aeiou]|$)/g, '$1$2')
}

function transformCK (token) {
  return token.replace(/ck/g, 'k')
}
function transformPH (token) {
  return token.replace(/ph/g, 'f')
}

function transformQ (token) {
  return token.replace(/q/g, 'k')
}

function transformS (token) {
  return token.replace(/s(h|io|ia)/g, 'x$1')
}

function transformT (token) {
  token = token.replace(/t(ia|io)/g, 'x$1')
  token = token.replace(/th/, '0')

  return token
}

function dropT (token) {
  return token.replace(/tch/g, 'ch')
}

function transformV (token) {
  return token.replace(/v/g, 'f')
}

function transformWH (token) {
  return token.replace(/^wh/, 'w')
}

function dropW (token) {
  return token.replace(/w([^aeiou]|$)/g, '$1')
}

function transformX (token) {
  token = token.replace(/^x/, 's')
  token = token.replace(/x/g, 'ks')
  return token
}

function dropY (token) {
  return token.replace(/y([^aeiou]|$)/g, '$1')
}

function transformZ (token) {
  return token.replace(/z/, 's')
}

function dropVowels (token) {
  return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '')
}

const Metaphone = new Phonetic()
module.exports = Metaphone

Metaphone.process = function (token, maxLength) {
  const maxLengthNew = maxLength || 32
  token = token.toLowerCase()
  token = dedup(token)
  token = dropInitialLetters(token)
  token = dropBafterMAtEnd(token)
  token = transformCK(token)
  token = cTransform(token)
  token = dTransform(token)
  token = dropG(token)
  token = transformG(token)
  token = dropH(token)
  token = transformPH(token)
  token = transformQ(token)
  token = transformS(token)
  token = transformX(token)
  token = transformT(token)
  token = dropT(token)
  token = transformV(token)
  token = transformWH(token)
  token = dropW(token)
  token = dropY(token)
  token = transformZ(token)
  token = dropVowels(token)

  token.toUpperCase()
  if (token.length >= maxLengthNew) { token = token.substring(0, maxLengthNew) }

  return token.toUpperCase()
}

// expose functions for testing
Metaphone.dedup = dedup
Metaphone.dropInitialLetters = dropInitialLetters
Metaphone.dropBafterMAtEnd = dropBafterMAtEnd
Metaphone.cTransform = cTransform
Metaphone.dTransform = dTransform
Metaphone.dropG = dropG
Metaphone.transformG = transformG
Metaphone.dropH = dropH
Metaphone.transformCK = transformCK
Metaphone.transformPH = transformPH
Metaphone.transformQ = transformQ
Metaphone.transformS = transformS
Metaphone.transformT = transformT
Metaphone.dropT = dropT
Metaphone.transformV = transformV
Metaphone.transformWH = transformWH
Metaphone.dropW = dropW
Metaphone.transformX = transformX
Metaphone.dropY = dropY
Metaphone.transformZ = transformZ
Metaphone.dropVowels = dropVowels


/***/ }),

/***/ 6432:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(8918)
const Tokenizer = __webpack_require__(3968)
const tokenizer = new Tokenizer()

module.exports = function () {
  this.compare = function (stringA, stringB) {
    return this.process(stringA) === this.process(stringB)
  }

  this.tokenizeAndPhoneticize = function (str, phoneticsProcessor, keepStops) {
    const phoneticizedTokens = []

    tokenizer.tokenize(str).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token) < 0) {
        phoneticizedTokens.push(phoneticsProcessor.process(token))
      }
    })

    return phoneticizedTokens
  }

/*
  this.attach = function () {
    const phonetic = this

    String.prototype.soundsLike = function (compareTo) {
      return phonetic.compare(this, compareTo)
    }

    String.prototype.phonetics = function () {
      return phonetic.process(this)
    }

    String.prototype.tokenizeAndPhoneticize = function (keepStops) {
      const phoneticizedTokens = []

      tokenizer.tokenize(this).forEach(function (token) {
        if (keepStops || stopwords.words.indexOf(token) < 0) {
          phoneticizedTokens.push(token.phonetics())
        }
      })

      return phoneticizedTokens
    }
  }
  */
}


/***/ }),

/***/ 8263:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Phonetic = __webpack_require__(6432)

function transformLipps (token) {
  return token.replace(/[bfpv]/g, '1')
}

function transformThroats (token) {
  return token.replace(/[cgjkqsxz]/g, '2')
}

function transformToungue (token) {
  return token.replace(/[dt]/g, '3')
}

function transformL (token) {
  return token.replace(/l/g, '4')
}

function transformHum (token) {
  return token.replace(/[mn]/g, '5')
}

function transformR (token) {
  return token.replace(/r/g, '6')
}

function condense (token) {
  return token.replace(/(\d)?\1+/g, '$1')
}

function padRight0 (token) {
  if (token.length < 4) { return token + Array(4 - token.length).join('0') } else { return token }
}

function transform (token) {
  return transformLipps(transformThroats(
    transformToungue(transformL(transformHum(transformR(token))))))
}

const SoundEx = new Phonetic()
module.exports = SoundEx

SoundEx.process = function (token, maxLength) {
  token = token.toLowerCase()
  let transformed = condense(transform(token.substr(1, token.length - 1))) // anything that isn't a digit goes
  // deal with duplicate INITIAL consonant SOUNDS
  transformed = transformed.replace(new RegExp('^' + transform(token.charAt(0))), '')
  return token.charAt(0).toUpperCase() + padRight0(transformed.replace(/\D/g, '')).substr(0, (maxLength && maxLength - 1) || 3)
}

// export for tests;
SoundEx.transformLipps = transformLipps
SoundEx.transformThroats = transformThroats
SoundEx.transformToungue = transformToungue
SoundEx.transformL = transformL
SoundEx.transformHum = transformHum
SoundEx.transformR = transformR
SoundEx.condense = condense
SoundEx.padRight0 = padRight0


/***/ }),

/***/ 4899:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.Spellcheck = __webpack_require__(1603)


/***/ }),

/***/ 1603:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Trie = __webpack_require__(2225)

// Probabilistic spellchecker based on http://norvig.com/spell-correct.html
// The general idea is simple. Given a word, the spellchecker calculates all strings that are some user-defined edit distance away. Of those many candidates, it filters the ones that are not words and then returns an array of possible corrections in order of decreasing probability, based on the edit distance and the candidate's frequency in the input corpus
// Words that are an edit distance of n away from the mispelled word are considered infinitely more probable than words that are of an edit distance >n

// wordlist is a corpus (an array) from which word probabilities are calculated (so something like /usr/share/dict/words (on OSX) will work okay, but real world text will work better)
function Spellcheck (wordlist) {
  this.trie = new Trie()
  this.trie.addStrings(wordlist)
  this.word2frequency = {}
  for (const i in wordlist) {
    if (!this.word2frequency[wordlist[i]]) {
      this.word2frequency[wordlist[i]] = 0
    }
    this.word2frequency[wordlist[i]]++
  }
}

Spellcheck.prototype.isCorrect = function (word) {
  return this.trie.contains(word)
}

// Returns a list of suggested corrections, from highest to lowest probability
// maxDistance is the maximum edit distance
// According to Norvig, literature suggests that 80% to 95% of spelling errors are an edit distance of 1 away from the correct word. This is good, because there are roughly 54n+25 strings 1 edit distance away from any given string of length n. So after maxDistance = 2, this becomes very slow.
Spellcheck.prototype.getCorrections = function (word, maxDistance) {
  const self = this
  if (!maxDistance) maxDistance = 1
  let edits = this.editsWithMaxDistance(word, maxDistance)
  edits = edits.slice(1, edits.length)
  edits = edits.map(function (editList) {
    return editList.filter(function (word) { return self.isCorrect(word) })
      .map(function (word) { return [word, self.word2frequency[word]] })
      .sort(function (a, b) { return a[1] > b[1] ? -1 : 1 })
      .map(function (wordscore) { return wordscore[0] })
  })
  let flattened = []
  for (const i in edits) {
    if (edits[i].length) {
      flattened = flattened.concat(edits[i])
    }
  }
  return flattened.filter(function (v, i, a) {
    return a.indexOf(v) === i
  })
}

// Returns all edits that are 1 edit-distance away from the input word
Spellcheck.prototype.edits = function (word) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  let edits = []
  for (let i = 0; i < word.length + 1; i++) {
    if (i > 0) edits.push(word.slice(0, i - 1) + word.slice(i, word.length)) // deletes
    if (i > 0 && i < word.length + 1) edits.push(word.slice(0, i - 1) + word.slice(i, i + 1) + word.slice(i - 1, i) + word.slice(i + 1, word.length)) // transposes
    for (let k = 0; k < alphabet.length; k++) {
      if (i > 0) edits.push(word.slice(0, i - 1) + alphabet[k] + word.slice(i, word.length)) // replaces
      edits.push(word.slice(0, i) + alphabet[k] + word.slice(i, word.length)) // inserts
    }
  }
  // Deduplicate edits
  edits = edits.filter(function (v, i, a) { return a.indexOf(v) === i })
  return edits
}

// Returns all edits that are up to "distance" edit distance away from the input word
Spellcheck.prototype.editsWithMaxDistance = function (word, distance) {
  return this.editsWithMaxDistanceHelper(distance, [[word]])
}

Spellcheck.prototype.editsWithMaxDistanceHelper = function (distanceCounter, distance2edits) {
  if (distanceCounter === 0) return distance2edits
  const currentDepth = distance2edits.length - 1
  const words = distance2edits[currentDepth]
  // const edits = this.edits(words[0])
  distance2edits[currentDepth + 1] = []
  for (const i in words) {
    distance2edits[currentDepth + 1] = distance2edits[currentDepth + 1].concat(this.edits(words[i]))
  }
  return this.editsWithMaxDistanceHelper(distanceCounter - 1, distance2edits)
}

module.exports = Spellcheck


/***/ }),

/***/ 4321:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.PorterStemmer = __webpack_require__(7558)
exports.PorterStemmerFa = __webpack_require__(2524)
exports.PorterStemmerFr = __webpack_require__(2357)
exports.CarryStemmerFr = __webpack_require__(5373)
exports.PorterStemmerRu = __webpack_require__(9028)
exports.PorterStemmerEs = __webpack_require__(6108)
exports.PorterStemmerIt = __webpack_require__(6679)
exports.PorterStemmerNo = __webpack_require__(1331)
exports.PorterStemmerSv = __webpack_require__(8388)
exports.PorterStemmerPt = __webpack_require__(2017)
exports.PorterStemmerNl = __webpack_require__(3309)
exports.LancasterStemmer = __webpack_require__(6394)
exports.StemmerJa = __webpack_require__(9968)
exports.StemmerId = __webpack_require__(8288)


/***/ }),

/***/ 2458:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.j = {
  a: [
    {
      continuation: false,
      intact: true,
      pattern: 'ia',
      size: '2'
    },
    {
      continuation: false,
      intact: true,
      pattern: 'a',
      size: '1'
    }
  ],
  b: [
    {
      continuation: false,
      intact: false,
      pattern: 'bb',
      size: '1'
    }
  ],
  c: [
    {
      appendage: 's',
      continuation: false,
      intact: false,
      pattern: 'ytic',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ic',
      size: '2'
    },
    {
      appendage: 't',
      continuation: true,
      intact: false,
      pattern: 'nc',
      size: '1'
    }
  ],
  d: [
    {
      continuation: false,
      intact: false,
      pattern: 'dd',
      size: '1'
    },
    {
      appendage: 'y',
      continuation: true,
      intact: false,
      pattern: 'ied',
      size: '3'
    },
    {
      appendage: 'ss',
      continuation: false,
      intact: false,
      pattern: 'ceed',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'eed',
      size: '1'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ed',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'hood',
      size: '4'
    }
  ],
  e: [
    {
      continuation: true,
      intact: false,
      pattern: 'e',
      size: '1'
    }
  ],
  f: [
    {
      appendage: 'v',
      continuation: false,
      intact: false,
      pattern: 'lief',
      size: '1'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'if',
      size: '2'
    }
  ],
  g: [
    {
      continuation: true,
      intact: false,
      pattern: 'ing',
      size: '3'
    },
    {
      appendage: 'y',
      continuation: false,
      intact: false,
      pattern: 'iag',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ag',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'gg',
      size: '1'
    }
  ],
  h: [
    {
      continuation: false,
      intact: true,
      pattern: 'th',
      size: '2'
    },
    {
      appendage: 'ct',
      continuation: false,
      intact: false,
      pattern: 'guish',
      size: '5'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ish',
      size: '3'
    }
  ],
  i: [
    {
      continuation: false,
      intact: true,
      pattern: 'i',
      size: '1'
    },
    {
      appendage: 'y',
      continuation: true,
      intact: false,
      pattern: 'i',
      size: '1'
    }
  ],
  j: [
    {
      appendage: 'd',
      continuation: false,
      intact: false,
      pattern: 'ij',
      size: '1'
    },
    {
      appendage: 's',
      continuation: false,
      intact: false,
      pattern: 'fuj',
      size: '1'
    },
    {
      appendage: 'd',
      continuation: false,
      intact: false,
      pattern: 'uj',
      size: '1'
    },
    {
      appendage: 'd',
      continuation: false,
      intact: false,
      pattern: 'oj',
      size: '1'
    },
    {
      appendage: 'r',
      continuation: false,
      intact: false,
      pattern: 'hej',
      size: '1'
    },
    {
      appendage: 't',
      continuation: false,
      intact: false,
      pattern: 'verj',
      size: '1'
    },
    {
      appendage: 't',
      continuation: false,
      intact: false,
      pattern: 'misj',
      size: '2'
    },
    {
      appendage: 'd',
      continuation: false,
      intact: false,
      pattern: 'nj',
      size: '1'
    },
    {
      appendage: 's',
      continuation: false,
      intact: false,
      pattern: 'j',
      size: '1'
    }
  ],
  l: [
    {
      continuation: false,
      intact: false,
      pattern: 'ifiabl',
      size: '6'
    },
    {
      appendage: 'y',
      continuation: false,
      intact: false,
      pattern: 'iabl',
      size: '4'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'abl',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ibl',
      size: '3'
    },
    {
      appendage: 'l',
      continuation: true,
      intact: false,
      pattern: 'bil',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'cl',
      size: '1'
    },
    {
      appendage: 'y',
      continuation: false,
      intact: false,
      pattern: 'iful',
      size: '4'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ful',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ul',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ial',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ual',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'al',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'll',
      size: '1'
    }
  ],
  m: [
    {
      continuation: false,
      intact: false,
      pattern: 'ium',
      size: '3'
    },
    {
      continuation: false,
      intact: true,
      pattern: 'um',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ism',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'mm',
      size: '1'
    }
  ],
  n: [
    {
      appendage: 'j',
      continuation: true,
      intact: false,
      pattern: 'sion',
      size: '4'
    },
    {
      appendage: 'ct',
      continuation: false,
      intact: false,
      pattern: 'xion',
      size: '4'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ion',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ian',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'an',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'een',
      size: '0'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'en',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'nn',
      size: '1'
    }
  ],
  p: [
    {
      continuation: true,
      intact: false,
      pattern: 'ship',
      size: '4'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'pp',
      size: '1'
    }
  ],
  r: [
    {
      continuation: true,
      intact: false,
      pattern: 'er',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ear',
      size: '0'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ar',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'or',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ur',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'rr',
      size: '1'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'tr',
      size: '1'
    },
    {
      appendage: 'y',
      continuation: true,
      intact: false,
      pattern: 'ier',
      size: '3'
    }
  ],
  s: [
    {
      appendage: 'y',
      continuation: true,
      intact: false,
      pattern: 'ies',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'sis',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'is',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ness',
      size: '4'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ss',
      size: '0'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ous',
      size: '3'
    },
    {
      continuation: false,
      intact: true,
      pattern: 'us',
      size: '2'
    },
    {
      continuation: true,
      intact: true,
      pattern: 's',
      size: '1'
    },
    {
      continuation: false,
      intact: false,
      pattern: 's',
      size: '0'
    }
  ],
  t: [
    {
      appendage: 'y',
      continuation: false,
      intact: false,
      pattern: 'plicat',
      size: '4'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'at',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ment',
      size: '4'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ent',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ant',
      size: '3'
    },
    {
      appendage: 'b',
      continuation: false,
      intact: false,
      pattern: 'ript',
      size: '2'
    },
    {
      appendage: 'b',
      continuation: false,
      intact: false,
      pattern: 'orpt',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'duct',
      size: '1'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'sumpt',
      size: '2'
    },
    {
      appendage: 'iv',
      continuation: false,
      intact: false,
      pattern: 'cept',
      size: '2'
    },
    {
      appendage: 'v',
      continuation: false,
      intact: false,
      pattern: 'olut',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'sist',
      size: '0'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ist',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'tt',
      size: '1'
    }
  ],
  u: [
    {
      continuation: false,
      intact: false,
      pattern: 'iqu',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ogu',
      size: '1'
    }
  ],
  v: [
    {
      appendage: 'j',
      continuation: true,
      intact: false,
      pattern: 'siv',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'eiv',
      size: '0'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'iv',
      size: '2'
    }
  ],
  y: [
    {
      continuation: true,
      intact: false,
      pattern: 'bly',
      size: '1'
    },
    {
      appendage: 'y',
      continuation: true,
      intact: false,
      pattern: 'ily',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ply',
      size: '0'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ly',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ogy',
      size: '1'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'phy',
      size: '1'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'omy',
      size: '1'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'opy',
      size: '1'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ity',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ety',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'lty',
      size: '2'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'istry',
      size: '5'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ary',
      size: '3'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'ory',
      size: '3'
    },
    {
      continuation: false,
      intact: false,
      pattern: 'ify',
      size: '3'
    },
    {
      appendage: 't',
      continuation: true,
      intact: false,
      pattern: 'ncy',
      size: '2'
    },
    {
      continuation: true,
      intact: false,
      pattern: 'acy',
      size: '3'
    }
  ],
  z: [
    {
      continuation: true,
      intact: false,
      pattern: 'iz',
      size: '2'
    },
    {
      appendage: 's',
      continuation: false,
      intact: false,
      pattern: 'yz',
      size: '1'
    }
  ]
}


/***/ }),

/***/ 6394:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(7993)
const ruleTable = __webpack_require__(2458)/* .rules */ .j

function acceptable (candidate) {
  if (candidate.match(/^[aeiou]/)) { return (candidate.length > 1) } else { return (candidate.length > 2 && candidate.match(/[aeiouy]/)) }
}

// take a token, look up the applicatble rule section and attempt some stemming!
function applyRuleSection (token, intact) {
  const section = token.substr(-1)
  const rules = ruleTable[section]

  if (rules) {
    for (let i = 0; i < rules.length; i++) {
      if ((intact || !rules[i].intact) &&
            // only apply intact rules to intact tokens
            token.substr(0 - rules[i].pattern.length) === rules[i].pattern) {
        // hack off only as much as the rule indicates
        let result = token.substr(0, token.length - rules[i].size)

        // if the rules wants us to apply an appendage do so
        if (rules[i].appendage) { result += rules[i].appendage }

        if (acceptable(result)) {
          token = result

          // see what the rules wants to do next
          if (rules[i].continuation) {
            // this rule thinks there still might be stem left. keep at it.
            // since we've applied a change we'll pass false in for intact
            return applyRuleSection(result, false)
          } else {
            // the rule thinks we're done stemming. drop out.
            return result
          }
        }
      }
    }
  }

  return token
}

const LancasterStemmer = new Stemmer()
module.exports = LancasterStemmer

LancasterStemmer.stem = function (token) {
  return applyRuleSection(token.toLowerCase(), true)
}


/***/ }),

/***/ 7558:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(7993)

// denote groups of consecutive consonants with a C and consecutive vowels
// with a V.
function categorizeGroups (token) {
  return token.replace(/[^aeiouy]+y/g, 'CV').replace(/[aeiou]+/g, 'V').replace(/[^V]+/g, 'C')
}

// denote single consonants with a C and single vowels with a V
function categorizeChars (token) {
  return token.replace(/[^aeiouy]y/g, 'CV').replace(/[aeiou]/g, 'V').replace(/[^V]/g, 'C')
}

// calculate the "measure" M of a word. M is the count of VC sequences dropping
// an initial C if it exists and a trailing V if it exists.
function measure (token) {
  if (!token) { return -1 }

  return categorizeGroups(token).replace(/^C/, '').replace(/V$/, '').length / 2
}

// determine if a token end with a double consonant i.e. happ
function endsWithDoublCons (token) {
  return token.match(/([^aeiou])\1$/)
}

// replace a pattern in a word. if a replacement occurs an optional callback
// can be called to post-process the result. if no match is made NULL is
// returned.
function attemptReplace (token, pattern, replacement, callback) {
  let result = null

  if ((typeof pattern === 'string') && token.substr(0 - pattern.length) === pattern) { result = token.replace(new RegExp(pattern + '$'), replacement) } else if ((pattern instanceof RegExp) && token.match(pattern)) { result = token.replace(pattern, replacement) }

  if (result && callback) { return callback(result) } else { return result }
}

// attempt to replace a list of patterns/replacements on a token for a minimum
// measure M.
function attemptReplacePatterns (token, replacements, measureThreshold) {
  let replacement = token

  for (let i = 0; i < replacements.length; i++) {
    if (measureThreshold == null || measure(attemptReplace(token, replacements[i][0], replacements[i][1])) > measureThreshold) {
      replacement = attemptReplace(replacement, replacements[i][0], replacements[i][2]) || replacement
    }
  }

  return replacement
}

// replace a list of patterns/replacements on a word. if no match is made return
// the original token.
function replacePatterns (token, replacements, measureThreshold) {
  return attemptReplacePatterns(token, replacements, measureThreshold) || token
}

// TODO: this should replace all of the messy replacement stuff above
function replaceRegex (token, regex, includeParts, minimumMeasure) {
  let parts
  let result = ''

  if (regex.test(token)) {
    parts = regex.exec(token)

    includeParts.forEach(function (i) {
      result += parts[i]
    })
  }

  if (measure(result) > minimumMeasure) {
    return result
  }

  return null
}

// step 1a as defined for the porter stemmer algorithm.
function step1a (token) {
  if (token.match(/(ss|i)es$/)) {
    return token.replace(/(ss|i)es$/, '$1')
  }

  if (token.substr(-1) === 's' && token.substr(-2, 1) !== 's' && token.length > 2) {
    return token.replace(/s?$/, '')
  }

  return token
}

// step 1b as defined for the porter stemmer algorithm.
function step1b (token) {
  let result
  if (token.substr(-3) === 'eed') {
    if (measure(token.substr(0, token.length - 3)) > 0) { return token.replace(/eed$/, 'ee') }
  } else {
    result = attemptReplace(token, /(ed|ing)$/, '', function (token) {
      if (categorizeGroups(token).indexOf('V') >= 0) {
        result = attemptReplacePatterns(token, [['at', '', 'ate'], ['bl', '', 'ble'], ['iz', '', 'ize']])

        if (result !== token) {
          return result
        } else {
          if (endsWithDoublCons(token) && token.match(/[^lsz]$/)) {
            return token.replace(/([^aeiou])\1$/, '$1')
          }

          if (measure(token) === 1 && categorizeChars(token).substr(-3) === 'CVC' && token.match(/[^wxy]$/)) {
            return token + 'e'
          }
        }

        return token
      }

      return null
    })

    if (result) {
      return result
    }
  }

  return token
}

// step 1c as defined for the porter stemmer algorithm.
function step1c (token) {
  const categorizedGroups = categorizeGroups(token)

  if (token.substr(-1) === 'y' && categorizedGroups.substr(0, categorizedGroups.length - 1).indexOf('V') > -1) {
    return token.replace(/y$/, 'i')
  }

  return token
}

// step 2 as defined for the porter stemmer algorithm.
function step2 (token) {
  token = replacePatterns(token, [['ational', '', 'ate'], ['tional', '', 'tion'], ['enci', '', 'ence'], ['anci', '', 'ance'],
    ['izer', '', 'ize'], ['abli', '', 'able'], ['bli', '', 'ble'], ['alli', '', 'al'], ['entli', '', 'ent'], ['eli', '', 'e'],
    ['ousli', '', 'ous'], ['ization', '', 'ize'], ['ation', '', 'ate'], ['ator', '', 'ate'], ['alism', '', 'al'],
    ['iveness', '', 'ive'], ['fulness', '', 'ful'], ['ousness', '', 'ous'], ['aliti', '', 'al'],
    ['iviti', '', 'ive'], ['biliti', '', 'ble'], ['logi', '', 'log']], 0)

  return token
}

// step 3 as defined for the porter stemmer algorithm.
function step3 (token) {
  return replacePatterns(token, [['icate', '', 'ic'], ['ative', '', ''], ['alize', '', 'al'],
    ['iciti', '', 'ic'], ['ical', '', 'ic'], ['ful', '', ''], ['ness', '', '']], 0)
}

// step 4 as defined for the porter stemmer algorithm.
function step4 (token) {
  return replaceRegex(token, /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/, [1], 1) ||
        replaceRegex(token, /^(.+?)(s|t)(ion)$/, [1, 2], 1) ||
        token
}

// step 5a as defined for the porter stemmer algorithm.
function step5a (token) {
  const m = measure(token.replace(/e$/, ''))

  if (m > 1 || (m === 1 && !(categorizeChars(token).substr(-4, 3) === 'CVC' && token.match(/[^wxy].$/)))) {
    token = token.replace(/e$/, '')
  }

  return token
}

// step 5b as defined for the porter stemmer algorithm.
function step5b (token) {
  if (measure(token) > 1) {
    return token.replace(/ll$/, 'l')
  }

  return token
}

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

// perform full stemming algorithm on a single word
PorterStemmer.stem = function (token) {
  if (token.length < 3) return token.toString()
  return step5b(step5a(step4(step3(step2(step1c(step1b(step1a(token.toLowerCase())))))))).toString()
}

// exports for tests
PorterStemmer.categorizeGroups = categorizeGroups
PorterStemmer.measure = measure
PorterStemmer.step1a = step1a
PorterStemmer.step1b = step1b
PorterStemmer.step1c = step1c
PorterStemmer.step2 = step2
PorterStemmer.step3 = step3
PorterStemmer.step4 = step4
PorterStemmer.step5a = step5a
PorterStemmer.step5b = step5b


/***/ }),

/***/ 6108:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
  Copyright (c) 2018, Domingo Martín Mancera

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/



const Stemmer = __webpack_require__(4456)

// Inherit from the utility class in stemmer_es
class PorterStemmer extends Stemmer {
  isVowel (c) {
    const regex = /[aeiouáéíóú]/gi

    return regex.test(c)
  }

  nextVowelPosition (word, start = 0) {
    const length = word.length

    for (let position = start; position < length; position++) {
      if (this.isVowel(word[position])) {
        return position
      }
    }

    return length
  }

  nextConsonantPosition (word, start = 0) {
    const length = word.length

    for (let position = start; position < length; position++) {
      if (!this.isVowel(word[position])) {
        return position
      }
    }

    return length
  }

  endsIn (word, suffix) {
    if (word.length < suffix.length) {
      return false
    }

    return (word.slice(-suffix.length) === suffix)
  }

  endsInArr (word, suffixes) {
    const matches = []
    for (const i in suffixes) {
      if (this.endsIn(word, suffixes[i])) {
        matches.push(suffixes[i])
      }
    }
    const longest = matches.sort(function (a, b) {
      return b.length - a.length
    })[0]

    if (longest) {
      return longest
    } else {
      return ''
    }
  }

  removeAccent (word) {
    const accentedVowels = ['á', 'é', 'í', 'ó', 'ú']
    const vowels = ['a', 'e', 'i', 'o', 'u']

    for (const i in accentedVowels) {
      word = word.replace(accentedVowels[i], vowels[i])
    }

    return word
  }

  stem (word) {
    const length = word.length

    word.toLowerCase()

    if (length < 2) {
      return this.removeAccent(word)
    }

    let r1, r2, rv
    r1 = length
    r2 = length
    rv = length

    // R1 is the region after the first non-vowel following a vowel, or is the null region
    // at the end of the word if there is no such non-vowel.
    for (let i = 0; i < (length - 1) && r1 === length; i++) {
      if (this.isVowel(word[i]) && !this.isVowel(word[i + 1])) {
        r1 = i + 2
      }
    }

    // R2 is the region after the first non-vowel following a vowel in R1,
    // or is the null region at the end of the word if there is no such non-vowel.
    for (let i = r1; i < (length - 1) && r2 === length; i++) {
      if (this.isVowel(word[i]) && !this.isVowel(word[i + 1])) {
        r2 = i + 2
      }
    }

    if (length > 3) {
      if (!this.isVowel(word[1])) {
        rv = this.nextVowelPosition(word, 2) + 1
      } else if (this.isVowel(word[0]) && this.isVowel(word[1])) {
        rv = this.nextConsonantPosition(word, 2) + 1
      } else {
        rv = 3
      }
    }

    let r1Text = word.slice(r1)
    let r2Text = word.slice(r2)
    let rvText = word.slice(rv)
    const originalWord = word

    // Step 0: Attached pronoun
    const pronounSuffix = ['me', 'se', 'sela', 'selo', 'selas', 'selos', 'la', 'le', 'lo', 'las', 'les', 'los', 'nos']
    const pronounSuffixPre1 = ['iéndo', 'ándo', 'ár', 'ér', 'ír']
    const pronounSuffixPre2 = ['iendo', 'ando', 'ar', 'er', 'ir']

    const suffix = this.endsInArr(word, pronounSuffix)

    if (suffix !== '') {
      let preSuffix = this.endsInArr(rvText.slice(0, -suffix.length), pronounSuffixPre1)

      if (preSuffix !== '') {
        word = this.removeAccent(word.slice(0, -suffix.length))
      } else {
        preSuffix = this.endsInArr(rvText.slice(0, -suffix.length), pronounSuffixPre2)

        if (preSuffix !== '' || (this.endsIn(word.slice(0, -suffix.length), 'uyendo'))) {
          word = word.slice(0, -suffix.length)
        }
      }
    }

    if (word !== originalWord) {
      r1Text = word.slice(r1)
      r2Text = word.slice(r2)
      rvText = word.slice(rv)
    }

    const wordAfter0 = word
    let suf = null

    if ((suf = this.endsInArr(r2Text, ['anza', 'anzas', 'ico', 'ica', 'icos', 'icas', 'ismo', 'ismos',
      'able', 'ables', 'ible', 'ibles', 'ista', 'istas', 'oso', 'osa',
      'osos', 'osas', 'amiento', 'amientos', 'imiento', 'imientos'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r2Text, ['icadora', 'icador', 'icación', 'icadoras', 'icadores', 'icaciones',
      'icante', 'icantes', 'icancia', 'icancias', 'adora', 'ador', 'ación',
      'adoras', 'adores', 'aciones', 'ante', 'antes', 'ancia', 'ancias'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r2Text, ['logía', 'logías'])) !== '') {
      word = word.slice(0, -suf.length) + 'log'
    } else if ((suf = this.endsInArr(r2Text, ['ución', 'uciones'])) !== '') {
      word = word.slice(0, -suf.length) + 'u'
    } else if ((suf = this.endsInArr(r2Text, ['encia', 'encias'])) !== '') {
      word = word.slice(0, -suf.length) + 'ente'
    } else if ((suf = this.endsInArr(r2Text, ['ativamente', 'ivamente', 'osamente', 'icamente', 'adamente'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r1Text, ['amente'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r2Text, ['antemente', 'ablemente', 'iblemente', 'mente'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r2Text, ['abilidad', 'abilidades', 'icidad', 'icidades', 'ividad', 'ividades', 'idad', 'idades'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((suf = this.endsInArr(r2Text, ['ativa', 'ativo', 'ativas', 'ativos', 'iva', 'ivo', 'ivas', 'ivos'])) !== '') {
      word = word.slice(0, -suf.length)
    }

    if (word !== wordAfter0) {
      r1Text = word.slice(r1)
      r2Text = word.slice(r2)
      rvText = word.slice(rv)
    }
    const wordAfter1 = word

    if (wordAfter0 === wordAfter1) {
      // Do step 2a if no ending was removed by step 1.
      suf = this.endsInArr(rvText, ['ya', 'ye', 'yan', 'yen', 'yeron', 'yendo', 'yo', 'yó', 'yas', 'yes', 'yais', 'yamos'])

      if (suf !== '' && (word.slice(-suf.length - 1, -suf.length) === 'u')) {
        word = word.slice(0, -suf.length)
      }

      if (word !== wordAfter1) {
        r1Text = word.slice(r1)
        r2Text = word.slice(r2)
        rvText = word.slice(rv)
      }

      const wordAfter2a = word
      // Do Step 2b if step 2a was done, but failed to remove a suffix.
      if (wordAfter2a === wordAfter1) {
        if ((suf = this.endsInArr(rvText, ['arían', 'arías', 'arán', 'arás', 'aríais', 'aría', 'aréis',
          'aríamos', 'aremos', 'ará', 'aré', 'erían', 'erías', 'erán',
          'erás', 'eríais', 'ería', 'eréis', 'eríamos', 'eremos', 'erá',
          'eré', 'irían', 'irías', 'irán', 'irás', 'iríais', 'iría', 'iréis',
          'iríamos', 'iremos', 'irá', 'iré', 'aba', 'ada', 'ida', 'ía', 'ara',
          'iera', 'ad', 'ed', 'id', 'ase', 'iese', 'aste', 'iste', 'an',
          'aban', 'ían', 'aran', 'ieran', 'asen', 'iesen', 'aron', 'ieron',
          'ado', 'ido', 'ando', 'iendo', 'ió', 'ar', 'er', 'ir', 'as', 'abas',
          'adas', 'idas', 'ías', 'aras', 'ieras', 'ases', 'ieses', 'ís', 'áis',
          'abais', 'íais', 'arais', 'ierais', '  aseis', 'ieseis', 'asteis',
          'isteis', 'ados', 'idos', 'amos', 'ábamos', 'íamos', 'imos', 'áramos',
          'iéramos', 'iésemos', 'ásemos'])) !== '') {
          word = word.slice(0, -suf.length)
        } else if ((suf = this.endsInArr(rvText, ['en', 'es', 'éis', 'emos'])) !== '') {
          word = word.slice(0, -suf.length)
          if (this.endsIn(word, 'gu')) {
            word = word.slice(0, -1)
          }
        }
      }
    }

    r1Text = word.slice(r1)
    r2Text = word.slice(r2)
    rvText = word.slice(rv)

    if ((suf = this.endsInArr(rvText, ['os', 'a', 'o', 'á', 'í', 'ó'])) !== '') {
      word = word.slice(0, -suf.length)
    } else if ((this.endsInArr(rvText, ['e', 'é'])) !== '') {
      word = word.slice(0, -1)
      rvText = word.slice(rv)
      if (this.endsIn(rvText, 'u') && this.endsIn(word, 'gu')) {
        word = word.slice(0, -1)
      }
    }

    return this.removeAccent(word)
  }
}

module.exports = new PorterStemmer()


/***/ }),

/***/ 2524:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel
Farsi Porter Stemmer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(2655)

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

// disabled stemming for Farsi
// Farsi stemming will be supported soon
PorterStemmer.stem = function (token) {
  return token
}


/***/ }),

/***/ 2357:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
 * Spec for the French Porter Stemmer can be found at:
 * http://snowball.tartarus.org/algorithms/french/stemmer.html
 */



const Stemmer = __webpack_require__(1091)

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

// Export
PorterStemmer.stem = stem

// Exports for test purpose
PorterStemmer.prelude = prelude
PorterStemmer.regions = regions
PorterStemmer.endsinArr = endsinArr

/**
 * Stem a word thanks to Porter Stemmer rules
 * @param  {String} token Word to be stemmed
 * @return {String}       Stemmed word
 */
function stem (token) {
  token = prelude(token.toLowerCase())

  if (token.length === 1) { return token }

  const regs = regions(token)

  let r1txt, r2txt, rvtxt
  r1txt = token.substring(regs.r1)
  r2txt = token.substring(regs.r2)
  rvtxt = token.substring(regs.rv)

  // Step 1
  const beforeStep1 = token
  let suf, letterBefore, letter2Before, i
  let doStep2a = false

  if ((suf = endsinArr(r2txt, ['ance', 'iqUe', 'isme', 'able', 'iste', 'eux', 'ances', 'iqUes', 'ismes', 'ables', 'istes'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(token, ['icatrice', 'icateur', 'ication', 'icatrices', 'icateurs', 'ications'])) !== '') {
    if (endsinArr(r2txt, ['icatrice', 'icateur', 'ication', 'icatrices', 'icateurs', 'ications']) !== '') {
      token = token.slice(0, -suf.length) // delete
    } else {
      token = token.slice(0, -suf.length) + 'iqU' // replace by iqU
    }
  } else if ((suf = endsinArr(r2txt, ['atrice', 'ateur', 'ation', 'atrices', 'ateurs', 'ations'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['logie', 'logies'])) !== '') {
    token = token.slice(0, -suf.length) + 'log' // replace with log
  } else if ((suf = endsinArr(r2txt, ['usion', 'ution', 'usions', 'utions'])) !== '') {
    token = token.slice(0, -suf.length) + 'u' // replace with u
  } else if ((suf = endsinArr(r2txt, ['ence', 'ences'])) !== '') {
    token = token.slice(0, -suf.length) + 'ent' // replace with ent
  } else if ((suf = endsinArr(r1txt, ['issement', 'issements'])) !== '') {
    if (!isVowel(token[token.length - suf.length - 1])) {
      token = token.slice(0, -suf.length) // delete
      r1txt = token.substring(regs.r1)
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
  } else if ((suf = endsinArr(r2txt, ['ativement', 'ativements'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['ivement', 'ivements'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(token, ['eusement', 'eusements'])) !== '') {
    if ((suf = endsinArr(r2txt, ['eusement', 'eusements'])) !== '') {
      token = token.slice(0, -suf.length)
    } else if ((suf = endsinArr(r1txt, ['eusement', 'eusements'])) !== '') {
      token = token.slice(0, -suf.length) + 'eux'
    } else if ((suf = endsinArr(rvtxt, ['ement', 'ements'])) !== '') {
      token = token.slice(0, -suf.length)
    } // delete
  } else if ((suf = endsinArr(r2txt, ['ablement', 'ablements', 'iqUement', 'iqUements'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(rvtxt, ['ièrement', 'ièrements', 'Ièrement', 'Ièrements'])) !== '') {
    token = token.slice(0, -suf.length) + 'i' // replace by i
  } else if ((suf = endsinArr(rvtxt, ['ement', 'ements'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(token, ['icité', 'icités'])) !== '') {
    if (endsinArr(r2txt, ['icité', 'icités']) !== '') {
      token = token.slice(0, -suf.length)
    } else {
      token = token.slice(0, -suf.length) + 'iqU'
    }
  } else if ((suf = endsinArr(token, ['abilité', 'abilités'])) !== '') {
    if (endsinArr(r2txt, ['abilité', 'abilités']) !== '') {
      token = token.slice(0, -suf.length)
    } else {
      token = token.slice(0, -suf.length) + 'abl'
    }
  } else if ((suf = endsinArr(r2txt, ['ité', 'ités'])) !== '') {
    token = token.slice(0, -suf.length) // delete if in R2
  } else if ((suf = endsinArr(token, ['icatif', 'icative', 'icatifs', 'icatives'])) !== '') {
    if ((suf = endsinArr(r2txt, ['icatif', 'icative', 'icatifs', 'icatives'])) !== '') {
      token = token.slice(0, -suf.length) // delete
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
    if ((suf = endsinArr(r2txt, ['atif', 'ative', 'atifs', 'atives'])) !== '') {
      token = token.slice(0, -suf.length - 2) + 'iqU' // replace with iqU
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
  } else if ((suf = endsinArr(r2txt, ['atif', 'ative', 'atifs', 'atives'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['if', 'ive', 'ifs', 'ives'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(token, ['eaux'])) !== '') {
    token = token.slice(0, -suf.length) + 'eau' // replace by eau
  } else if ((suf = endsinArr(r1txt, ['aux'])) !== '') {
    token = token.slice(0, -suf.length) + 'al' // replace by al
  } else if ((suf = endsinArr(r2txt, ['euse', 'euses'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r1txt, ['euse', 'euses'])) !== '') {
    token = token.slice(0, -suf.length) + 'eux' // replace by eux
  } else if ((suf = endsinArr(rvtxt, ['amment'])) !== '') {
    token = token.slice(0, -suf.length) + 'ant' // replace by ant
    doStep2a = true
  } else if ((suf = endsinArr(rvtxt, ['emment'])) !== '') {
    token = token.slice(0, -suf.length) + 'ent' // replace by ent
    doStep2a = true
  } else if ((suf = endsinArr(rvtxt, ['ment', 'ments'])) !== '') {
    // letter before must be a vowel in RV
    letterBefore = token[token.length - suf.length - 1]
    if (isVowel(letterBefore) && endsin(rvtxt, letterBefore + suf)) {
      token = token.slice(0, -suf.length) // delete
      doStep2a = true
    }
  }

  // re compute regions
  r1txt = token.substring(regs.r1)
  r2txt = token.substring(regs.r2)
  rvtxt = token.substring(regs.rv)

  // Step 2a
  const beforeStep2a = token
  let step2aDone = false
  if (beforeStep1 === token || doStep2a) {
    step2aDone = true
    if ((suf = endsinArr(rvtxt, ['îmes', 'ît', 'îtes', 'i', 'ie', 'Ie', 'ies', 'ir', 'ira', 'irai', 'iraIent', 'irais', 'irait', 'iras', 'irent', 'irez', 'iriez', 'irions', 'irons', 'iront', 'is', 'issaIent', 'issais', 'issait', 'issant', 'issante', 'issantes', 'issants', 'isse', 'issent', 'isses', 'issez', 'issiez', 'issions', 'issons', 'it'])) !== '') {
      letterBefore = token[token.length - suf.length - 1]
      if (!isVowel(letterBefore) && endsin(rvtxt, letterBefore + suf)) { token = token.slice(0, -suf.length) } // delete
    }
  }

  // Step 2b
  if (step2aDone && token === beforeStep2a) {
    if ((suf = endsinArr(rvtxt, ['é', 'ée', 'ées', 'és', 'èrent', 'er', 'era', 'erai', 'eraIent', 'erais', 'erait', 'eras', 'erez', 'eriez', 'erions', 'erons', 'eront', 'ez', 'iez', 'Iez'])) !== '') {
      token = token.slice(0, -suf.length) // delete
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    } else if ((suf = endsinArr(rvtxt, ['ions'])) !== '' && endsinArr(r2txt, ['ions'])) {
      token = token.slice(0, -suf.length) // delete
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    } else if ((suf = endsinArr(rvtxt, ['âmes', 'ât', 'âtes', 'a', 'ai', 'aIent', 'ais', 'ait', 'ant', 'ante', 'antes', 'ants', 'as', 'asse', 'assent', 'asses', 'assiez', 'assions'])) !== '') {
      token = token.slice(0, -suf.length) // delete

      letterBefore = token[token.length - 1]
      if (letterBefore === 'e' && endsin(rvtxt, 'e' + suf)) { token = token.slice(0, -1) }

      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
  }

  // Step 3
  if (!(token === beforeStep1)) {
    if (token[token.length - 1] === 'Y') { token = token.slice(0, -1) + 'i' }
    if (token[token.length - 1] === 'ç') { token = token.slice(0, -1) + 'c' }
  } else {
    // Step 4
    letterBefore = token[token.length - 1]
    letter2Before = token[token.length - 2]

    if (letterBefore === 's' && ['a', 'i', 'o', 'u', 'è', 's'].indexOf(letter2Before) === -1) {
      token = token.slice(0, -1)
      r1txt = token.substring(regs.r1)
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }

    if ((suf = endsinArr(r2txt, ['ion'])) !== '') {
      letterBefore = token[token.length - suf.length - 1]
      if (letterBefore === 's' || letterBefore === 't') {
        token = token.slice(0, -suf.length) // delete
        r1txt = token.substring(regs.r1)
        r2txt = token.substring(regs.r2)
        rvtxt = token.substring(regs.rv)
      }
    }

    if ((suf = endsinArr(rvtxt, ['ier', 'ière', 'Ier', 'Ière'])) !== '') {
      token = token.slice(0, -suf.length) + 'i' // replace by i
      r1txt = token.substring(regs.r1)
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
    if ((suf = endsinArr(rvtxt, 'e')) !== '') {
      token = token.slice(0, -suf.length) // delete
      r1txt = token.substring(regs.r1)
      r2txt = token.substring(regs.r2)
      rvtxt = token.substring(regs.rv)
    }
    if ((suf = endsinArr(rvtxt, 'ë')) !== '') {
      if (token.slice(token.length - 3, -1) === 'gu') { token = token.slice(0, -suf.length) } // delete
    }
  }

  // Step 5
  if ((suf = endsinArr(token, ['enn', 'onn', 'ett', 'ell', 'eill'])) !== '') {
    token = token.slice(0, -1) // delete last letter
  }

  // Step 6
  i = token.length - 1
  while (i > 0) {
    if (!isVowel(token[i])) {
      i--
    } else if (i !== token.length - 1 && (token[i] === 'é' || token[i] === 'è')) {
      token = token.substring(0, i) + 'e' + token.substring(i + 1, token.length)
      break
    } else {
      break
    }
  }

  return token.toLowerCase()
};

/**
 * Compute r1, r2, rv regions as required by french porter stemmer algorithm
 * @param  {String} token Word to compute regions on
 * @return {Object}       Regions r1, r2, rv as offsets from the begining of the word
 */
function regions (token) {
  let r1, r2, rv, len
  // var i

  r1 = r2 = rv = len = token.length

  // R1 is the region after the first non-vowel following a vowel,
  for (let i = 0; i < len - 1 && r1 === len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r1 = i + 2
    }
  }
  // Or is the null region at the end of the word if there is no such non-vowel.

  // R2 is the region after the first non-vowel following a vowel in R1
  for (let i = r1; i < len - 1 && r2 === len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r2 = i + 2
    }
  }
  // Or is the null region at the end of the word if there is no such non-vowel.

  // RV region
  const three = token.slice(0, 3)
  if (isVowel(token[0]) && isVowel(token[1])) {
    rv = 3
  }
  if (three === 'par' || three === 'col' || three === 'tap') {
    rv = 3
  } else {
  // the region after the first vowel not at the beginning of the word or null
    for (let i = 1; i < len - 1 && rv === len; i++) {
      if (isVowel(token[i])) {
        rv = i + 1
      }
    }
  }

  return {
    r1: r1,
    r2: r2,
    rv: rv
  }
};

/**
 * Pre-process/prepare words as required by french porter stemmer algorithm
 * @param  {String} token Word to be prepared
 * @return {String}       Prepared word
 */
function prelude (token) {
  token = token.toLowerCase()

  let result = ''
  let i = 0

  // special case for i = 0 to avoid '-1' index
  if (token[i] === 'y' && isVowel(token[i + 1])) {
    result += token[i].toUpperCase()
  } else {
    result += token[i]
  }

  for (i = 1; i < token.length; i++) {
    if ((token[i] === 'u' || token[i] === 'i') && isVowel(token[i - 1]) && isVowel(token[i + 1])) {
      result += token[i].toUpperCase()
    } else if (token[i] === 'y' && (isVowel(token[i - 1]) || isVowel(token[i + 1]))) {
      result += token[i].toUpperCase()
    } else if (token[i] === 'u' && token[i - 1] === 'q') {
      result += token[i].toUpperCase()
    } else {
      result += token[i]
    }
  }

  return result
};

/**
 * Return longest matching suffixes for a token or '' if no suffix match
 * @param  {String} token    Word to find matching suffix
 * @param  {Array} suffixes  Array of suffixes to test matching
 * @return {String}          Longest found matching suffix or ''
 */
function endsinArr (token, suffixes) {
  let i; let longest = ''
  for (i = 0; i < suffixes.length; i++) {
    if (endsin(token, suffixes[i]) && suffixes[i].length > longest.length) { longest = suffixes[i] }
  }

  return longest
};

function isVowel (letter) {
  return (letter === 'a' || letter === 'e' || letter === 'i' || letter === 'o' || letter === 'u' || letter === 'y' || letter === 'â' || letter === 'à' || letter === 'ë' ||
    letter === 'é' || letter === 'ê' || letter === 'è' || letter === 'ï' || letter === 'î' || letter === 'ô' || letter === 'û' || letter === 'ù')
};

function endsin (token, suffix) {
  if (token.length < suffix.length) return false
  return (token.slice(-suffix.length) === suffix)
};


/***/ }),

/***/ 6679:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, Leonardo Fenu, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(795)

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

function isVowel (letter) {
  return (letter === 'a' || letter === 'e' || letter === 'i' || letter === 'o' || letter === 'u' || letter === 'à' ||
    letter === 'è' || letter === 'ì' || letter === 'ò' || letter === 'ù')
}

function getNextVowelPos (token, start) {
  start = start + 1
  const length = token.length
  for (let i = start; i < length; i++) {
    if (isVowel(token[i])) {
      return i
    }
  }
  return length
}

function getNextConsonantPos (token, start) {
  const length = token.length
  for (let i = start; i < length; i++) { if (!isVowel(token[i])) return i }
  return length
}

function endsin (token, suffix) {
  if (token.length < suffix.length) return false
  return (token.slice(-suffix.length) === suffix)
}

function endsinArr (token, suffixes) {
  for (let i = 0; i < suffixes.length; i++) {
    if (endsin(token, suffixes[i])) return suffixes[i]
  }
  return ''
}

function replaceAcute (token) {
  let str = token.replace(/á/gi, 'à')
  str = str.replace(/é/gi, 'è')
  str = str.replace(/í/gi, 'ì')
  str = str.replace(/ó/gi, 'ò')
  str = str.replace(/ú/gi, 'ù')
  return str
}

function vowelMarking (token) {
  function replacer (match, p1, p2, p3) {
    return p1 + p2.toUpperCase() + p3
  }
  const str = token.replace(/([aeiou])(i|u)([aeiou])/g, replacer)
  return str
}

// perform full stemming algorithm on a single word
PorterStemmer.stem = function (token) {
  token = token.toLowerCase()
  token = replaceAcute(token)
  token = token.replace(/qu/g, 'qU')
  token = vowelMarking(token)

  if (token.length < 3) {
    return token
  }

  let r1 = token.length
  let r2 = token.length
  let rv = token.length
  const len = token.length
  // R1 is the region after the first non-vowel following a vowel,
  for (let i = 0; i < token.length - 1 && r1 === len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r1 = i + 2
    }
  }
  // Or is the null region at the end of the word if there is no such non-vowel.

  // R2 is the region after the first non-vowel following a vowel in R1
  for (let i = r1; i < token.length - 1 && r2 === len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r2 = i + 2
    }
  }

  // Or is the null region at the end of the word if there is no such non-vowel.

  // If the second letter is a consonant, RV is the region after the next following vowel,

  // RV as follow

  if (len > 3) {
    if (!isVowel(token[1])) {
      // If the second letter is a consonant, RV is the region after the next following vowel
      rv = getNextVowelPos(token, 1) + 1
    } else if (isVowel(token[0]) && isVowel(token[1])) {
      // or if the first two letters are vowels, RV is the region after the next consonant
      rv = getNextConsonantPos(token, 2) + 1
    } else {
      // otherwise (consonant-vowel case) RV is the region after the third letter. But RV is the end of the word if these positions cannot be found.
      rv = 3
    }
  }

  let r1txt = token.substring(r1)
  let r2txt = token.substring(r2)
  let rvtxt = token.substring(rv)

  const tokenOrig = token

  // Step 0: Attached pronoun

  const pronounSuf = ['glieli', 'glielo', 'gliene', 'gliela', 'gliele', 'sene', 'tene', 'cela', 'cele', 'celi', 'celo', 'cene', 'vela', 'vele', 'veli', 'velo', 'vene', 'mela', 'mele', 'meli', 'melo', 'mene', 'tela', 'tele', 'teli', 'telo', 'gli', 'ci', 'la', 'le', 'li', 'lo', 'mi', 'ne', 'si', 'ti', 'vi']
  const pronounSufPre1 = ['ando', 'endo']
  const pronounSufPre2 = ['ar', 'er', 'ir']
  let suf = endsinArr(token, pronounSuf)

  if (suf !== '') {
    const preSuff1 = endsinArr(rvtxt.slice(0, -suf.length), pronounSufPre1)
    const preSuff2 = endsinArr(rvtxt.slice(0, -suf.length), pronounSufPre2)

    if (preSuff1 !== '') {
      token = token.slice(0, -suf.length)
    }
    if (preSuff2 !== '') {
      token = token.slice(0, -suf.length) + 'e'
    }
  }

  if (token !== tokenOrig) {
    r1txt = token.substring(r1)
    r2txt = token.substring(r2)
    rvtxt = token.substring(rv)
  }

  const tokenAfter0 = token

  // Step 1:  Standard suffix removal

  if ((suf = endsinArr(r2txt, ['ativamente', 'abilamente', 'ivamente', 'osamente', 'icamente'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['icazione', 'icazioni', 'icatore', 'icatori', 'azione', 'azioni', 'atore', 'atori'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['logia', 'logie'])) !== '') {
    token = token.slice(0, -suf.length) + 'log' // replace with log
  } else if ((suf = endsinArr(r2txt, ['uzione', 'uzioni', 'usione', 'usioni'])) !== '') {
    token = token.slice(0, -suf.length) + 'u' // replace with u
  } else if ((suf = endsinArr(r2txt, ['enza', 'enze'])) !== '') {
    token = token.slice(0, -suf.length) + 'ente' // replace with ente
  } else if ((suf = endsinArr(rvtxt, ['amento', 'amenti', 'imento', 'imenti'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r1txt, ['amente'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['atrice', 'atrici', 'abile', 'abili', 'ibile', 'ibili', 'mente', 'ante', 'anti', 'anza', 'anze', 'iche', 'ichi', 'ismo', 'ismi', 'ista', 'iste', 'isti', 'istà', 'istè', 'istì', 'ico', 'ici', 'ica', 'ice', 'oso', 'osi', 'osa', 'ose'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['abilità', 'icità', 'ività', 'ità'])) !== '') {
    token = token.slice(0, -suf.length) // delete
  } else if ((suf = endsinArr(r2txt, ['icativa', 'icativo', 'icativi', 'icative', 'ativa', 'ativo', 'ativi', 'ative', 'iva', 'ivo', 'ivi', 'ive'])) !== '') {
    token = token.slice(0, -suf.length)
  }

  if (token !== tokenAfter0) {
    r1txt = token.substring(r1)
    r2txt = token.substring(r2)
    rvtxt = token.substring(rv)
  }

  const tokenAfter1 = token

  // Step 2:  Verb suffixes

  if (tokenAfter0 === tokenAfter1) {
    if ((suf = endsinArr(rvtxt, ['erebbero', 'irebbero', 'assero', 'assimo', 'eranno', 'erebbe', 'eremmo', 'ereste', 'eresti', 'essero', 'iranno', 'irebbe', 'iremmo', 'ireste', 'iresti', 'iscano', 'iscono', 'issero', 'arono', 'avamo', 'avano', 'avate', 'eremo', 'erete', 'erono', 'evamo', 'evano', 'evate', 'iremo', 'irete', 'irono', 'ivamo', 'ivano', 'ivate', 'ammo', 'ando', 'asse', 'assi', 'emmo', 'enda', 'ende', 'endi', 'endo', 'erai', 'Yamo', 'iamo', 'immo', 'irai', 'irei', 'isca', 'isce', 'isci', 'isco', 'erei', 'uti', 'uto', 'ita', 'ite', 'iti', 'ito', 'iva', 'ivi', 'ivo', 'ono', 'uta', 'ute', 'ano', 'are', 'ata', 'ate', 'ati', 'ato', 'ava', 'avi', 'avo', 'erà', 'ere', 'erò', 'ete', 'eva', 'evi', 'evo', 'irà', 'ire', 'irò', 'ar', 'ir'])) !== '') {
      token = token.slice(0, -suf.length)
    }
  }

  r1txt = token.substring(r1)
  r2txt = token.substring(r2)
  rvtxt = token.substring(rv)

  // Always do step 3.

  if ((suf = endsinArr(rvtxt, ['ia', 'ie', 'ii', 'io', 'ià', 'iè', 'iì', 'iò', 'a', 'e', 'i', 'o', 'à', 'è', 'ì', 'ò'])) !== '') {
    token = token.slice(0, -suf.length)
  }

  r1txt = token.substring(r1)
  r2txt = token.substring(r2)
  rvtxt = token.substring(rv)

  if ((suf = endsinArr(rvtxt, ['ch'])) !== '') {
    token = token.slice(0, -suf.length) + 'c' // replace with c
  } else if ((suf = endsinArr(rvtxt, ['gh'])) !== '') {
    token = token.slice(0, -suf.length) + 'g' // replace with g
  }

  r1txt = token.substring(r1)
  r2txt = token.substring(r2)
  rvtxt = token.substring(rv)

  return token.toLowerCase()
}


/***/ }),

/***/ 1331:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(647)

// Get the part of the token after the first non-vowel following a vowel
function getR1 (token) {
  const match = token.match(/[aeiouyæåø]{1}[^aeiouyæåø]([A-Za-z0-9_æøåÆØÅäÄöÖüÜ]+)/)

  if (match) {
    const preR1Length = match.index + 2

    if (preR1Length < 3 && preR1Length > 0) {
      return token.slice(3)
    } else if (preR1Length >= 3) {
      return match[1]
    } else {
      return token
    }
  }

  return null
}

function step1 (token) {
  // Perform step 1a-c
  const step1aResult = step1a(token)
  const step1bResult = step1b(token)
  const step1cResult = step1c(token)

  // Returne the shortest result string (from 1a, 1b and 1c)
  if (step1aResult.length < step1bResult.length) {
    return (step1aResult.length < step1cResult.length) ? step1aResult : step1cResult
  } else {
    return (step1bResult.length < step1cResult.length) ? step1bResult : step1cResult
  }
}

// step 1a as defined for the porter stemmer algorithm.
function step1a (token) {
  const r1 = getR1(token)

  if (!r1) {
    return token
  }

  const r1Match = r1.match(/(a|e|ede|ande|ende|ane|ene|hetene|en|heten|ar|er|heter|as|es|edes|endes|enes|hetenes|ens|hetens|ers|ets|et|het|ast)$/)

  if (r1Match) {
    return token.replace(new RegExp(r1Match[1] + '$'), '')
  }

  return token
}

// step 1b as defined for the porter stemmer algorithm.
function step1b (token) {
  const r1 = getR1(token)

  if (!r1) {
    return token
  }

  if (token.match(/(b|c|d|f|g|h|j|l|m|n|o|p|r|t|v|y|z)s$/)) {
    return token.slice(0, -1)
  }

  if (token.match(/([^aeiouyæåø]k)s$/)) {
    return token.slice(0, -1)
  }

  return token
}

// step 1c as defined for the porter stemmer algorithm.
function step1c (token) {
  const r1 = getR1(token)

  if (!r1) {
    return token
  }

  if (r1.match(/(erte|ert)$/)) {
    return token.replace(/(erte|ert)$/, 'er')
  }

  return token
}

// step 2 as defined for the porter stemmer algorithm.
function step2 (token) {
  const r1 = getR1(token)

  if (!r1) {
    return token
  }

  if (r1.match(/(d|v)t$/)) {
    return token.slice(0, -1)
  }

  return token
}

// step 3 as defined for the porter stemmer algorithm.
function step3 (token) {
  const r1 = getR1(token)

  if (!r1) { return token }

  const r1Match = r1.match(/(leg|eleg|ig|eig|lig|elig|els|lov|elov|slov|hetslov)$/)

  if (r1Match) {
    return token.replace(new RegExp(r1Match[1] + '$'), '')
  }

  return token
}

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

// perform full stemming algorithm on a single word
PorterStemmer.stem = function (token) {
  return step3(step2(step1(token.toLowerCase()))).toString()
}

// exports for tests
PorterStemmer.getR1 = getR1
PorterStemmer.step1 = step1
PorterStemmer.step1a = step1a
PorterStemmer.step1b = step1b
PorterStemmer.step1c = step1c
PorterStemmer.step2 = step2
PorterStemmer.step3 = step3


/***/ }),

/***/ 2017:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2015, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



module.exports = (function () {
  const Stemmer = __webpack_require__(4938)
  const Token = __webpack_require__(2070)
  const PorterStemmer = new Stemmer()

  /**
   * Marks a region after the first non-vowel following a vowel, or the
   * null region at the end of the word if there is no such non-vowel.
   *
   * @param {Object} token Token to stem.
   * @param {Number} start Start index (defaults to 0).
   * @param {Number}       Region start index.
   */
  const markRegionN = function (start) {
    let index = start || 0
    const length = this.string.length
    let region = length

    while (index < length - 1 && region === length) {
      if (this.hasVowelAtIndex(index) && !this.hasVowelAtIndex(index + 1)) {
        region = index + 2
      }
      index++
    }

    return region
  }

  /**
   * Mark RV.
   *
   * @param  {Object} token Token to stem.
   * @return {Number}       Region start index.
   */
  const markRegionV = function () {
    let rv = this.string.length

    if (rv > 3) {
      if (!this.hasVowelAtIndex(1)) {
        rv = this.nextVowelIndex(2) + 1
      } else if (this.hasVowelAtIndex(0) && this.hasVowelAtIndex(1)) {
        rv = this.nextConsonantIndex(2) + 1
      } else {
        rv = 3
      }
    }

    return rv
  }

  /**
   * Prelude.
   *
   * Nasalised vowel forms should be treated as a vowel followed by a consonant.
   *
   * @param  {String} token Word to stem.
   * @return {String}       Stemmed token.
   */
  function prelude (token) {
    return token
      .replaceAll('ã', 'a~')
      .replaceAll('õ', 'o~')
  }

  /**
   * Step 1: Standard suffix removal.
   *
   * This step should always be performed.
   *
   * @param  {Token} token Word to stem.
   * @return {Token}       Stemmed token.
   */
  function standardSuffix (token) {
    token.replaceSuffixInRegion([
      'amentos', 'imentos', 'aço~es', 'adoras', 'adores', 'amento', 'imento',

      'aça~o', 'adora', 'ância', 'antes', 'ismos', 'istas',

      'ador', 'ante', 'ável', 'ezas', 'icas', 'icos', 'ismo', 'ista', 'ível',
      'osas', 'osos',

      'eza', 'ica', 'ico', 'osa', 'oso'

    ], '', 'r2')

    token.replaceSuffixInRegion(['logias', 'logia'], 'log', 'r2')

    // token.replaceSuffixInRegion(['uço~es', 'uça~o'], 'u', 'r1');

    token.replaceSuffixInRegion(['ências', 'ência'], 'ente', 'r2')

    token.replaceSuffixInRegion([
      'ativamente', 'icamente', 'ivamente', 'osamente', 'adamente'
    ], '', 'r2')

    token.replaceSuffixInRegion('amente', '', 'r1')

    token.replaceSuffixInRegion([
      'antemente', 'avelmente', 'ivelmente', 'mente'
    ], '', 'r2')

    token.replaceSuffixInRegion([
      'abilidades', 'abilidade',
      'icidades', 'icidade',
      'ividades', 'ividade',
      'idades', 'idade'
    ], '', 'r2')

    token.replaceSuffixInRegion([
      'ativas', 'ativos', 'ativa', 'ativo',
      'ivas', 'ivos', 'iva', 'ivo'
    ], '', 'r2')

    if (token.hasSuffix('eiras') || token.hasSuffix('eira')) {
      token.replaceSuffixInRegion(['iras', 'ira'], 'ir', 'rv')
    }

    return token
  }

  /**
   * Step 2: Verb suffix removal.
   *
   * Perform this step if no ending was removed in step 1.
   *
   * @param  {Token} token   Token to stem.
   * @return {Token}         Stemmed token.
   */
  function verbSuffix (token) {
    token.replaceSuffixInRegion([
      'aríamos', 'ássemos', 'eríamos', 'êssemos', 'iríamos', 'íssemos',

      'áramos', 'aremos', 'aríeis', 'ásseis', 'ávamos', 'éramos', 'eremos',
      'eríeis', 'ésseis', 'íramos', 'iremos', 'iríeis', 'ísseis',

      'ara~o', 'ardes', 'areis', 'áreis', 'ariam', 'arias', 'armos', 'assem',
      'asses', 'astes', 'áveis', 'era~o', 'erdes', 'ereis', 'éreis', 'eriam',
      'erias', 'ermos', 'essem', 'esses', 'estes', 'íamos', 'ira~o', 'irdes',
      'ireis', 'íreis', 'iriam', 'irias', 'irmos', 'issem', 'isses', 'istes',

      'adas', 'ados', 'amos', 'ámos', 'ando', 'aram', 'aras', 'arás', 'arei',
      'arem', 'ares', 'aria', 'asse', 'aste', 'avam', 'avas', 'emos', 'endo',
      'eram', 'eras', 'erás', 'erei', 'erem', 'eres', 'eria', 'esse', 'este',
      'idas', 'idos', 'íeis', 'imos', 'indo', 'iram', 'iras', 'irás', 'irei',
      'irem', 'ires', 'iria', 'isse', 'iste',

      'ada', 'ado', 'ais', 'ara', 'ará', 'ava', 'eis', 'era', 'erá', 'iam',
      'ias', 'ida', 'ido', 'ira', 'irá',

      'am', 'ar', 'as', 'ei', 'em', 'er', 'es', 'eu', 'ia', 'ir', 'is', 'iu', 'ou'

    ], '', 'rv')

    return token
  }

  /**
   * Step 3: Delete suffix i.
   *
   * Perform this step if the word was changed, in RV and preceded by c.
   *
   * @param  {Token} token   Token to stem.
   * @return {Token}         Stemmed token.
   */
  function iPrecededByCSuffix (token) {
    if (token.hasSuffix('ci')) {
      token.replaceSuffixInRegion('i', '', 'rv')
    }

    return token
  }

  /**
   * Step 4: Residual suffix.
   *
   * Perform this step if steps 1 and 2 did not alter the word.
   *
   * @param  {Token} token Token to stem.
   * @return {Token}       Stemmed token.
   */
  function residualSuffix (token) {
    token.replaceSuffixInRegion(['os', 'a', 'i', 'o', 'á', 'í', 'ó'], '', 'rv')

    return token
  }

  /**
   * Step 5: Residual form.
   *
   * This step should always be performed.
   *
   * @param  {Token} token Token to stem.
   * @return {Token}       Stemmed token.
   */
  function residualForm (token) {
    const tokenString = token.string

    if (token.hasSuffix('gue') || token.hasSuffix('gué') || token.hasSuffix('guê')) {
      token.replaceSuffixInRegion(['ue', 'ué', 'uê'], '', 'rv')
    }

    if (token.hasSuffix('cie') || token.hasSuffix('cié') || token.hasSuffix('ciê')) {
      token.replaceSuffixInRegion(['ie', 'ié', 'iê'], '', 'rv')
    }

    if (tokenString === token.string) {
      token.replaceSuffixInRegion(['e', 'é', 'ê'], '', 'rv')
    }

    token.replaceSuffixInRegion('ç', 'c', 'all')

    return token
  }

  /**
   * Postlude.
   *
   * Turns a~, o~ back into ã, õ.
   *
   * @param  {String} token Word to stem.
   * @return {String}       Stemmed token.
   */
  function postlude (token) {
    return token
      .replaceAll('a~', 'ã')
      .replaceAll('o~', 'õ')
  }

  /**
   * Stems a word using a Porter stemmer algorithm.
   *
   * @param  {String} word Word to stem.
   * @return {String}      Stemmed token.
   */
  PorterStemmer.stem = function (word) {
    let token = new Token(word.toLowerCase())

    token = prelude(token)

    token.usingVowels('aeiouáéíóúâêôàãõ')
      .markRegion('all', 0)
      .markRegion('r1', null, markRegionN)
      .markRegion('r2', token.regions.r1, markRegionN)
      .markRegion('rv', null, markRegionV)

    const original = token.string

    // Always do step 1.
    token = standardSuffix(token)

    // Do step 2 if no ending was removed by step 1.
    if (token.string === original) {
      token = verbSuffix(token)
    }

    // If the last step to be obeyed — either step 1 or 2 — altered the word,
    // do step 3. Alternatively, if neither steps 1 nor 2 altered the word, do
    // step 4.
    token = token.string !== original ? iPrecededByCSuffix(token) : residualSuffix(token)

    // Always do step 5.
    token = residualForm(token)

    token = postlude(token)

    return token.string
  }

  return PorterStemmer
})()


/***/ }),

/***/ 9028:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(8043)

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

function attemptReplacePatterns (token, patterns) {
  let replacement = null
  let i = 0; let isReplaced = false
  while ((i < patterns.length) && !isReplaced) {
    if (patterns[i][0].test(token)) {
      replacement = token.replace(patterns[i][0], patterns[i][1])
      isReplaced = true
    }
    i++
  }
  return replacement
}

function perfectiveGerund (token) {
  const result = attemptReplacePatterns(token, [
    [/[ая]в(ши|шись)$/g, ''],
    [/(ив|ивши|ившись|ывши|ывшись|ыв)$/g, '']
  ])
  return result
}

function adjectival (token) {
  let result = adjective(token)
  if (result != null) {
    const pariticipleResult = participle(result)
    result = pariticipleResult || result
  }
  return result
}

function adjective (token) {
  const result = attemptReplacePatterns(token, [
    [/(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/g, '']
  ])
  return result
}

function participle (token) {
  const result = attemptReplacePatterns(token, [
    [/([ая])(ем|нн|вш|ющ|щ)$/g, '$1'],
    [/(ивш|ывш|ующ)$/g, '']
  ])
  return result
}

function reflexive (token) {
  const result = attemptReplacePatterns(token, [
    [/(ся|сь)$/g, '']
  ])
  return result
}

function verb (token) {
  const result = attemptReplacePatterns(token, [
    [/([ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/g, '$1'],
    [/(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/g, '']
  ])
  return result
}

function noun (token) {
  const result = attemptReplacePatterns(token, [
    [/(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/g, '']
  ])
  return result
}

function superlative (token) {
  const result = attemptReplacePatterns(token, [
    [/(ейш|ейше)$/g, '']
  ])
  return result
}

function derivational (token) {
  const result = attemptReplacePatterns(token, [
    [/(ост|ость)$/g, '']
  ])
  return result
}

// perform full stemming algorithm on a single word
PorterStemmer.stem = function (token) {
  token = token.toLowerCase().replace(/ё/g, 'е')
  const volwesRegexp = /^(.*?[аеиоюяуыиэ])(.*)$/g
  let RV = volwesRegexp.exec(token)
  if (!RV || RV.length < 3) {
    return token
  }
  const head = RV[1]
  RV = RV[2]
  volwesRegexp.lastIndex = 0
  const R2 = volwesRegexp.exec(RV)
  let result = perfectiveGerund(RV)
  if (result === null) {
    const resultReflexive = reflexive(RV) || RV
    result = adjectival(resultReflexive)
    if (result === null) {
      result = verb(resultReflexive)
      if (result === null) {
        result = noun(resultReflexive)
        if (result === null) {
          result = resultReflexive
        }
      }
    }
  }
  result = result.replace(/и$/g, '')
  let derivationalResult = result
  if (R2 && R2[2]) {
    derivationalResult = derivational(R2[2])
    if (derivationalResult != null) {
      derivationalResult = derivational(result)
    } else {
      derivationalResult = result
    }
  }

  let superlativeResult = superlative(derivationalResult) || derivationalResult

  superlativeResult = superlativeResult.replace(/(н)н/g, '$1')
  superlativeResult = superlativeResult.replace(/ь$/g, '')
  return head + superlativeResult
}


/***/ }),

/***/ 8388:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2017, Dogan Yazar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Stemmer = __webpack_require__(3790)

// Get R1 region
function getRegions (str) {
  const match = str.match(/[aeiouyäåö][^aeiouyäåö]([a-zåäö]+)/)
  let r1 = ''
  if (match && match[1]) {
    r1 = match[1]
    if (match.index + 2 < 3) { // Not clear why we need this! Algorithm does not describe this part!
      r1 = str.slice(3)
    }
  }
  return {
    r1,
    rest: str.slice(0, str.length - r1.length)
  }
}

function step1a (str, regions = getRegions(str)) {
  const r1 = regions.r1
  if (!r1) {
    return str
  }

  const regEx = /(heterna|hetens|anden|andes|andet|arens|arnas|ernas|heten|heter|ornas|ande|ades|aren|arna|arne|aste|erna|erns|orna|ade|are|ast|ens|ern|het|ad|ar|as|at|en|er|es|or|a|e)$/
  const match = r1.match(regEx)
  return match ? regions.rest + r1.slice(0, match.index) : str
}

function step1b (str, regions = getRegions(str)) {
  if (regions.r1 && str.match(/(b|c|d|f|g|h|j|k|l|m|n|o|p|r|t|v|y)s$/)) {
    return str.slice(0, -1)
  }

  return str
}

function step1 (str) {
  const regions = getRegions(str)
  const resA = step1a(str, regions)
  const resB = step1b(str, regions)

  return resA.length < resB.length ? resA : resB
}

function step2 (str, regions = getRegions(str)) {
  const r1 = regions.r1
  if (r1 && r1.match(/(dd|gd|nn|dt|gt|kt|tt)$/)) {
    return str.slice(0, -1)
  }
  return str
}

function step3 (str, regions = getRegions(str)) {
  const r1 = regions.r1
  if (r1) {
    if (r1.match(/(lös|full)t$/)) {
      return str.slice(0, -1)
    }

    const match = r1.match(/(lig|ig|els)$/)
    return match ? regions.rest + r1.slice(0, match.index) : str
  }

  return str
}

function stem (_str) {
  const str = _str.toLowerCase()
  return step3(step2(step1(str)))
}

const PorterStemmer = new Stemmer()
module.exports = PorterStemmer

// perform full stemming algorithm on a single word
PorterStemmer.stem = stem


/***/ }),

/***/ 7993:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(8918)
const Tokenizer = __webpack_require__(3968)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.addStopWord = function (stopWord) {
    stopwords.words.push(stopWord)
  }

  stemmer.addStopWords = function (moreStopWords) {
    stopwords.words = stopwords.words.concat(moreStopWords)
  }

  stemmer.removeStopWord = function (stopWord) {
    this.removeStopWords([stopWord])
  }

  stemmer.removeStopWords = function (moreStopWords) {
    moreStopWords.forEach(function (stopWord) {
      const idx = stopwords.words.indexOf(stopWord)
      if (idx >= 0) {
        stopwords.words.splice(idx, 1)
      }
    })
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []
    const lowercaseText = text.toLowerCase()
    const tokens = new Tokenizer().tokenize(lowercaseText)

    if (keepStops) {
      tokens.forEach(function (token) {
        stemmedTokens.push(stemmer.stem(token))
      })
    } else {
      tokens.forEach(function (token) {
        if (stopwords.words.indexOf(token) === -1) { stemmedTokens.push(stemmer.stem(token)) }
      })
    }

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 4456:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, 2018 David Przybilla, Chris Umbel, Hugo W.L. ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(5934)
const Tokenizer = __webpack_require__(3188)

class Stemmer {
  stem (token) {
    return token
  }

  tokenizeAndStem (text, keepStops) {
    const stemmedTokens = []

    const that = this
    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token) === -1) {
        let resultToken = token.toLowerCase()
        // if (resultToken.match(new RegExp('[a-záéíóúüñ0-9]+', 'gi'))) {
        if (resultToken.match(/[a-záéíóúüñ0-9]+/gi)) {
          resultToken = that.stem(resultToken)
        }
        stemmedTokens.push(resultToken)
      }
    })

    return stemmedTokens
  }

  /*
  attach () {
    const that = this
    String.prototype.stem = function () {
      return that.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return that.tokenizeAndStem(this, keepStops)
    }
  }
  */
}

module.exports = Stemmer


/***/ }),

/***/ 2655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel
Farsi Stemmer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(9023)
const Tokenizer = __webpack_require__(5932)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token) === -1) { stemmedTokens.push(stemmer.stem(token)) }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 1091:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(6621)
const Tokenizer = __webpack_require__(1630)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      let resultToken = token.toLowerCase()
      if (keepStops || stopwords.words.indexOf(resultToken) === -1) {
        // var resultToken = token.toLowerCase();
        if (resultToken.match(/[a-zâàëéêèïîôûùç0-9]/gi)) {
          resultToken = stemmer.stem(resultToken)
        }
        stemmedTokens.push(resultToken)
      }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 795:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(7078)
const Tokenizer = __webpack_require__(757)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token) === -1) {
        let resultToken = token.toLowerCase()
        if (resultToken.match(/[a-zàèìòù0-9]/gi)) {
          resultToken = stemmer.stem(resultToken)
        }
        stemmedTokens.push(resultToken)
      }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 9968:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */



/**
 * A very basic stemmer that performs the following steps:
 * * Stem katakana.
 * Inspired by:
 * http://svn.apache.org/repos/asf/lucene/dev/trunk/lucene/analysis/kuromoji/src/java/org/apache/lucene/analysis/ja/JapaneseKatakanaStemFilter.java
 *
 * This script assumes input is normalized using normalizer_ja().
 *
 * \@todo Use .bind() in StemmerJa.prototype.attach().
 */

const Tokenizer = __webpack_require__(3906)
const stopwords = __webpack_require__(6655)/* .words */ .z

/**
 * @constructor
 */
const StemmerJa = function () {
}

/**
 * Tokenize and stem a text.
 * Stop words are excluded except if the second argument is true.
 *
 * @param {string} text
 * @param {boolean} keepStops Whether to keep stop words from the output or not.
 * @return {Array.<string>}
 */
StemmerJa.prototype.tokenizeAndStem = function (text, keepStops) {
  const self = this
  const stemmedTokens = []
  const tokens = new Tokenizer().tokenize(text)

  // This is probably faster than an if at each iteration.
  if (keepStops) {
    tokens.forEach(function (token) {
      let resultToken = token.toLowerCase()
      resultToken = self.stem(resultToken)
      stemmedTokens.push(resultToken)
    })
  } else {
    tokens.forEach(function (token) {
      if (stopwords.indexOf(token) === -1) {
        let resultToken = token.toLowerCase()
        resultToken = self.stem(resultToken)
        stemmedTokens.push(resultToken)
      }
    })
  }

  return stemmedTokens
}

/**
 * Stem a term.
 *
 * @param {string} token
 * @return {string}
 */
StemmerJa.prototype.stem = function (token) {
  token = this.stemKatakana(token)

  return token
}

/**
 * Remove the final prolonged sound mark on katakana if length is superior to
 * a threshold.
 *
 * @param {string} token A katakana string to stem.
 * @return {string} A katakana string stemmed.
 */
StemmerJa.prototype.stemKatakana = function (token) {
  const HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK = 'ー'
  const DEFAULT_MINIMUM_LENGTH = 4

  if (token.length >= DEFAULT_MINIMUM_LENGTH &&
      token.slice(-1) === HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK &&
      this.isKatakana(token)) {
    token = token.slice(0, token.length - 1)
  }
  return token
}

/**
 * Is a string made of fullwidth katakana only?
 * This implementation is the fastest I know:
 * http://jsperf.com/string-contain-katakana-only/2
 *
 * @param {string} str A string.
 * @return {boolean} True if the string has katakana only.
 */
StemmerJa.prototype.isKatakana = function (str) {
  return !!str.match(/^[゠-ヿ]+$/)
}

/*
// Expose an attach function that will patch String with new methods.
StemmerJa.prototype.attach = function () {
  const self = this

  String.prototype.stem = function () {
    return self.stem(this)
  }

  String.prototype.tokenizeAndStem = function (keepStops) {
    return self.tokenizeAndStem(this, keepStops)
  }
}
*/

module.exports = new StemmerJa()


/***/ }),

/***/ 647:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(1490)
const Tokenizer = __webpack_require__(8109)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.addStopWord = function (stopWord) {
    stopwords.words.push(stopWord)
  }

  stemmer.addStopWords = function (moreStopWords) {
    stopwords.words = stopwords.words.concat(moreStopWords)
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token.toLowerCase()) === -1) { stemmedTokens.push(stemmer.stem(token)) }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 4938:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



module.exports = function () {
  const Stemmer = this
  const stopwords = __webpack_require__(2512)
  const Tokenizer = __webpack_require__(6778)

  Stemmer.stem = function (token) {
    return token
  }

  Stemmer.addStopWords = function (word) {
    stopwords.words.push(word)
  }

  Stemmer.addStopWords = function (words) {
    stopwords.words = stopwords.words.concat(words)
  }

  Stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    const tokenStemmer = function (token) {
      if (keepStops || stopwords.words.indexOf(token.toLowerCase()) === -1) {
        stemmedTokens.push(Stemmer.stem(token))
      }
    }

    new Tokenizer().tokenize(text).forEach(tokenStemmer)

    return stemmedTokens
  }

  /*
  Stemmer.attach = function () {
    String.prototype.stem = function () {
      return Stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return Stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 8043:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2012, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(7139)
const Tokenizer = __webpack_require__(8136)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token) === -1) {
        let resultToken = token.toLowerCase()
        // if (resultToken.match(new RegExp('[а-яё0-9]+', 'gi'))) {
        if (resultToken.match(/[а-яё0-9]+/gi)) {
          resultToken = stemmer.stem(resultToken)
        }
        stemmedTokens.push(resultToken)
      }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 3790:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2017, Dogan Yazar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const stopwords = __webpack_require__(4236)
const Tokenizer = __webpack_require__(8864)

module.exports = function () {
  const stemmer = this

  stemmer.stem = function (token) {
    return token
  }

  stemmer.addStopWord = function (stopWord) {
    stopwords.words.push(stopWord)
  }

  stemmer.addStopWords = function (moreStopWords) {
    stopwords.words = stopwords.words.concat(moreStopWords)
  }

  stemmer.tokenizeAndStem = function (text, keepStops) {
    const stemmedTokens = []

    new Tokenizer().tokenize(text).forEach(function (token) {
      if (keepStops || stopwords.words.indexOf(token.toLowerCase()) === -1) { stemmedTokens.push(stemmer.stem(token)) }
    })

    return stemmedTokens
  }

  /*
  stemmer.attach = function () {
    String.prototype.stem = function () {
      return stemmer.stem(this)
    }

    String.prototype.tokenizeAndStem = function (keepStops) {
      return stemmer.tokenizeAndStem(this, keepStops)
    }
  }
  */
}


/***/ }),

/***/ 2070:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2015, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



module.exports = (function () {
  /**
   * Stemmer token constructor.
   *
   * @param {String} string Token string.
   */
  const Token = function (string) {
    this.vowels = ''
    this.regions = {}
    this.string = string
    this.original = string
  }

  /**
   * Set vowels.
   *
   * @param  {String|Array} vowels List of vowels.
   * @return {Token}               Token instance.
   */
  Token.prototype.usingVowels = function (vowels) {
    this.vowels = vowels
    return this
  }

  /**
   * Marks a region by defining its starting index or providing a callback
   * function that does.
   *
   * @param  {String}       region   Region name.
   * @param  {Array|Number} args     Callback arguments or region start index.
   * @param  {Function}     callback Function that determines the start index (optional).
   * @param  {Object}       context  Callback context (optional, defaults to this).
   * @return {Token}                 Token instance.
   */
  Token.prototype.markRegion = function (region, args, callback, context) {
    if (typeof callback === 'function') {
      this.regions[region] = callback.apply(context || this, [].concat(args))
    } else if (!isNaN(args)) {
      this.regions[region] = args
    }

    return this
  }

  /**
   * Replaces all instances of a string with another.
   *
   * @param  {String} find    String to be replaced.
   * @param  {String} replace Replacement string.
   * @return {Token}          Token instance.
   */
  Token.prototype.replaceAll = function (find, replace) {
    this.string = this.string.split(find).join(replace)
    return this
  }

  /**
   * Replaces the token suffix if in a region.
   *
   * @param  {String} suffix  Suffix to replace.
   * @param  {String} replace Replacement string.
   * @param  {String} region  Region name.
   * @return {Token}          Token instance.
   */
  Token.prototype.replaceSuffixInRegion = function (suffix, replace, region) {
    const suffixes = [].concat(suffix)
    for (let i = 0; i < suffixes.length; i++) {
      if (this.hasSuffixInRegion(suffixes[i], region)) {
        this.string = this.string.slice(0, -suffixes[i].length) + replace
        return this
      }
    }
    return this
  }

  /**
   * Determines whether the token has a vowel at the provided index.
   *
   * @param  {Integer} index Character index.
   * @return {Boolean}       Whether the token has a vowel at the provided index.
   */
  Token.prototype.hasVowelAtIndex = function (index) {
    return this.vowels.indexOf(this.string[index]) !== -1
  }

  /**
   * Finds the next vowel in the token.
   *
   * @param  {Integer} start Starting index offset.
   * @return {Integer}       Vowel index, or the end of the string.
   */
  Token.prototype.nextVowelIndex = function (start) {
    let index = (start >= 0 && start < this.string.length) ? start : this.string.length
    while (index < this.string.length && !this.hasVowelAtIndex(index)) {
      index++
    }
    return index
  }

  /**
   * Finds the next consonant in the token.
   *
   * @param  {Integer} start Starting index offset.
   * @return {Integer}       Consonant index, or the end of the string.
   */
  Token.prototype.nextConsonantIndex = function (start) {
    let index = (start >= 0 && start < this.string.length) ? start : this.string.length
    while (index < this.string.length && this.hasVowelAtIndex(index)) {
      index++
    }
    return index
  }

  /**
   * Determines whether the token has the provided suffix.
   * @param  {String}  suffix Suffix to match.
   * @return {Boolean}        Whether the token string ends in suffix.
   */
  Token.prototype.hasSuffix = function (suffix) {
    return this.string.slice(-suffix.length) === suffix
  }

  /**
   * Determines whether the token has the provided suffix within the specified
   * region.
   *
   * @param {String} suffix Suffix to match.
   * @param {String} region Region name.
   * @return {Boolean} Whether the token string ends in suffix.
   */
  Token.prototype.hasSuffixInRegion = function (suffix, region) {
    const regionStart = this.regions[region] || 0
    const suffixStart = this.string.length - suffix.length
    return this.hasSuffix(suffix) && suffixStart >= regionStart
  }

  return Token
})()


/***/ }),

/***/ 2565:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.TfIdf = __webpack_require__(8494)


/***/ }),

/***/ 8494:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const _ = __webpack_require__(6419)
const Tokenizer = __webpack_require__(723).WordTokenizer
let tokenizer = new Tokenizer()
let stopwords = __webpack_require__(8918).words
const fs = __webpack_require__(8493)

function buildDocument (text, key) {
  let stopOut

  if (typeof text === 'string') {
    text = tokenizer.tokenize(text.toLowerCase())
    stopOut = true
  } else if (!_.isArray(text)) {
    stopOut = false
    return text
  }

  return text.reduce(function (document, term) {
    // next line solves https://github.com/NaturalNode/natural/issues/119
    if (typeof document[term] === 'function') {
      document[term] = 0
    }
    if (!stopOut || stopwords.indexOf(term) < 0) {
      document[term] = (document[term] ? document[term] + 1 : 1)
    }
    return document
  }, { __key: key })
}

function tf (term, document) {
  return document[term] ? document[term] : 0
}

function documentHasTerm (term, document) {
  return document[term] && document[term] > 0
}

function TfIdf (deserialized) {
  if (deserialized) { this.documents = deserialized.documents } else { this.documents = [] }

  this._idfCache = {}
}

// backwards compatibility for < node 0.10
function isEncoding (encoding) {
  if (typeof Buffer.isEncoding !== 'undefined') { return Buffer.isEncoding(encoding) }
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true
  }
  return false
}

module.exports = TfIdf
TfIdf.tf = tf

TfIdf.prototype.idf = function (term, force) {
  // Lookup the term in the New term-IDF caching,
  // this will cut search times down exponentially on large document sets.
  // if (this._idfCache[term] && this._idfCache.hasOwnProperty(term) && force !== true) { return this._idfCache[term] }
  if (this._idfCache[term] && force !== true) {
    return this._idfCache[term]
  }

  const docsWithTerm = this.documents.reduce(function (count, document) {
    return count + (documentHasTerm(term, document) ? 1 : 0)
  }, 0)

  const idf = 1 + Math.log((this.documents.length) / (1 + docsWithTerm))

  // Add the idf to the term cache and return it
  this._idfCache[term] = idf
  return idf
}

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addDocument = function (document, key, restoreCache) {
  this.documents.push(buildDocument(document, key))

  // make sure the cache is invalidated when new documents arrive
  if (restoreCache === true) {
    for (const term in this._idfCache) {
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
      this.idf(term, true)
    }
  } else {
    // this._idfCache = {}
    // so that we do not have trouble with terms that match property names
    this._idfCache = Object.create(null)
  }
}

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addFileSync = function (path, encoding, key, restoreCache) {
  if (!encoding) { encoding = 'utf8' }
  if (!isEncoding(encoding)) { throw new Error('Invalid encoding: ' + encoding) }

  const document = fs.readFileSync(path, encoding)
  this.documents.push(buildDocument(document, key))

  // make sure the cache is invalidated when new documents arrive
  if (restoreCache === true) {
    for (const term in this._idfCache) {
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
      this.idf(term, true)
    }
  } else {
    this._idfCache = {}
  }
}

TfIdf.prototype.tfidf = function (terms, d) {
  const _this = this

  if (!_.isArray(terms)) {
    terms = tokenizer.tokenize(terms.toString().toLowerCase())
  }

  return terms.reduce(function (value, term) {
    let idf = _this.idf(term)
    idf = idf === Infinity ? 0 : idf
    return value + (tf(term, _this.documents[d]) * idf)
  }, 0.0)
}

TfIdf.prototype.listTerms = function (d) {
  const terms = []
  const _this = this
  for (const term in this.documents[d]) {
    if (this.documents[d]) {
      if (term !== '__key') {
        terms.push({
          term: term,
          tf: tf(term, _this.documents[d]),
          idf: _this.idf(term),
          tfidf: _this.tfidf(term, d)
        })
      }
    }
  }

  return terms.sort(function (x, y) { return y.tfidf - x.tfidf })
}

TfIdf.prototype.tfidfs = function (terms, callback) {
  const tfidfs = new Array(this.documents.length)

  for (let i = 0; i < this.documents.length; i++) {
    tfidfs[i] = this.tfidf(terms, i)

    if (callback) { callback(i, tfidfs[i], this.documents[i].__key) }
  }

  return tfidfs
}

// Define a tokenizer other than the default "WordTokenizer"
TfIdf.prototype.setTokenizer = function (t) {
  if (!_.isFunction(t.tokenize)) { throw new Error('Expected a valid Tokenizer') }
  tokenizer = t
}

// Define a stopwords other than the default
TfIdf.prototype.setStopwords = function (customStopwords) {
  if (!Array.isArray(customStopwords)) { return false }

  let wrongElement = false
  customStopwords.forEach(stopword => {
    if ((typeof stopword) !== 'string') {
      wrongElement = true
    }
  })
  if (wrongElement) {
    return false
  }

  stopwords = customStopwords
  return true
}


/***/ }),

/***/ 3968:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  // underscore is considered to be non word character
  return this.trim(text.split(/[\W|_]+/))
}


/***/ }),

/***/ 3188:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.trim(text.split(/[^a-zA-Zá-úÁ-ÚñÑüÜ]+/))
}


/***/ }),

/***/ 5932:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel
Farsi Aggressive Tokenizer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.clearEmptyString = function (array) {
  return array.filter(function (a) {
    return a !== ''
  })
}

AggressiveTokenizer.prototype.clearText = function (text) {
  return text.replace(/.:\+-=\(\)"'!\?،,؛;/g, ' ')
}

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  text = this.clearText(text)
  return this.clearEmptyString(text.split(/\s+/))
}


/***/ }),

/***/ 1630:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.trim(text.split(/[^a-z0-9äâàéèëêïîöôùüûœç-]+/i))
}


/***/ }),

/***/ 1421:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2017, Alif Bhaskoro, Andy Librian, R. Kukuh (Reimplemented from https://github.com/sastrawi/sastrawi)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

// Remove all non alphanumeric characters except '-'
// Replace more than one space character to ' '
function normalizeText (text) {
  const result = text.replace(/[^a-z0-9 -]/g, ' ').replace(/( +)/g, ' ')
  return result
}

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by space
  text = normalizeText(text)
  return this.trim(text.split(' '))
}


/***/ }),

/***/ 757:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.trim(text.split(/\W+/))
}


/***/ }),

/***/ 4768:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel, Martijn de Boer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.trim(text.split(/[^a-zA-Z0-9_'-]+/))
}


/***/ }),

/***/ 8109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const normalizer = __webpack_require__(8790)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  text = normalizer.removeDiacritics(text)

  // break a string up into an array of tokens by anything non-word
  return this.trim(text.split(/[^A-Za-z0-9_æøåÆØÅäÄöÖüÜ]+/))
}


/***/ }),

/***/ 1249:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2013, Paweł Łaskarzewski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}

util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.withoutEmpty = function (array) {
  return array.filter(function (a) { return a })
}

AggressiveTokenizer.prototype.clearText = function (text) {
  return text.replace(/[^a-zążśźęćńół0-9]/gi, ' ').replace(/[\s\n]+/g, ' ').trim()
}

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.withoutEmpty(this.clearText(text).split(' '))
}


/***/ }),

/***/ 6778:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.withoutEmpty = function (array) {
  return array.filter(function (a) { return a })
}

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.withoutEmpty(this.trim(text.split(/[^a-zA-Zà-úÀ-Ú]/)))
}


/***/ }),

/***/ 8136:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}

util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.withoutEmpty = function (array) {
  return array.filter(function (a) { return a })
}

AggressiveTokenizer.prototype.clearText = function (text) {
  return text.replace(/[^a-zа-яё0-9]/gi, ' ').replace(/[\s\n]+/g, ' ').trim()
}

AggressiveTokenizer.prototype.tokenize = function (text) {
  // break a string up into an array of tokens by anything non-word
  return this.withoutEmpty(this.clearText(text).split(' '))
}


/***/ }),

/***/ 8864:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2017, Dogan Yazar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const normalizer = __webpack_require__(1745)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(AggressiveTokenizer, Tokenizer)

module.exports = AggressiveTokenizer

AggressiveTokenizer.prototype.tokenize = function (text) {
  text = normalizer.removeDiacritics(text)

  // break a string up into an array of tokens by anything non-word
  // Ü is not part of swedish alphabet but there are words using it like müsli and München
  return this.trim(text.split(/[^A-Za-z0-9_åÅäÄöÖüÜ-]+/))
}


/***/ }),

/***/ 9439:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2018, Javis1205 (Github account name)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const AggressiveTokenizer = function () {
  Tokenizer.call(this)
}

util.inherits(AggressiveTokenizer, Tokenizer)

// break a string up into an array of tokens by anything non-word
AggressiveTokenizer.prototype.tokenize = function (text) {
  return this.trim(text.split(/[^a-z0-9àáảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]+/i))
}

module.exports = AggressiveTokenizer


/***/ }),

/***/ 3680:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.AggressiveTokenizerNl = __webpack_require__(4768)
exports.AggressiveTokenizerFa = __webpack_require__(5932)
exports.AggressiveTokenizerFr = __webpack_require__(1630)
exports.AggressiveTokenizerRu = __webpack_require__(8136)
exports.AggressiveTokenizerEs = __webpack_require__(3188)
exports.AggressiveTokenizerIt = __webpack_require__(757)
exports.AggressiveTokenizerPl = __webpack_require__(1249)
exports.AggressiveTokenizerPt = __webpack_require__(6778)
exports.AggressiveTokenizerNo = __webpack_require__(8109)
exports.AggressiveTokenizerSv = __webpack_require__(8864)
exports.AggressiveTokenizerVi = __webpack_require__(9439)
exports.AggressiveTokenizerId = __webpack_require__(1421)
exports.AggressiveTokenizer = __webpack_require__(3968)
exports.CaseTokenizer = __webpack_require__(7592)
exports.RegexpTokenizer = __webpack_require__(723).RegexpTokenizer
exports.OrthographyTokenizer = __webpack_require__(723).OrthographyTokenizer
exports.WordTokenizer = __webpack_require__(723).WordTokenizer
exports.WordPunctTokenizer = __webpack_require__(723).WordPunctTokenizer
exports.TreebankWordTokenizer = __webpack_require__(5637)
exports.TokenizerJa = __webpack_require__(3906)
exports.SentenceTokenizer = __webpack_require__(7595)
exports.SentenceTokenizerNew = __webpack_require__(7113)


/***/ }),

/***/ 7343:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/***
 * RegExp definitions for tokenizing text in a specific language based
 * on its alphabet. Each language is keyed by the two-letter code per
 * ISO 639-1, and defines a RegExp that excludes alphabetic characters.
 */



const matchers = {
  fi: /[^A-Za-zÅåÄäÖö]/
}

module.exports = matchers


/***/ }),

/***/ 7768:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */



function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { Sentences: peg$parseSentences },
      peg$startRuleFunction  = peg$parseSentences,

      peg$c0 = function(sentences) {
            //return sentences
            return(
                sentences.map(sent => {
                	//if (sent[1]) {
                	  sent[0].push(sent[1])
                  //}
                  return sent[0].reduce((accu, str) =>  accu + str).trim()
                })
            )
          },
      peg$c1 = function(seqs, end) {
            let res = seqs.reduce((accu, seq) => accu.concat(seq))
            res.push(end)
            return res
          },
      peg$c2 = function(tokens) {
             let result = tokens.map(pair => pair[0] + pair[1])
             return result
           },
      peg$c3 = function(open, tokens, end, close) {
        	  let result = tokens.map(pair => pair[0] + pair[1])
            result.unshift(open)
            result.push(end)
            result.push(close)
            return result
          },
      peg$c4 = /^[ \t\n\r.?!]/,
      peg$c5 = peg$classExpectation([" ", "\t", "\n", "\r", ".", "?", "!"], false, false),
      peg$c6 = function() {
            return text()
          },
      peg$c7 = /^[ \t\n\r]/,
      peg$c8 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
      peg$c9 = function(t) {
            return t
          },
      peg$c10 = /^[^ \t\n\r!?([}"`)\]}"`0-9@]/,
      peg$c11 = peg$classExpectation([" ", "\t", "\n", "\r", "!", "?", "(", "[", "}", "\"", "`", ")", "]", "}", "\"", "`", ["0", "9"], "@"], true, false),
      peg$c12 = function(word) {
              const tmp = word.reduce((accu, elt) => accu + elt)
              return knownAbbreviations.indexOf(tmp) > -1},
      peg$c13 = function(word) {
          	return text()
          },
      peg$c14 = /^[^ \t\n\r!?.([}"`)\]}"`0-9@]/,
      peg$c15 = peg$classExpectation([" ", "\t", "\n", "\r", "!", "?", ".", "(", "[", "}", "\"", "`", ")", "]", "}", "\"", "`", ["0", "9"], "@"], true, false),
      peg$c16 = function() {
        	  return text()
          },
      peg$c17 = /^[0-9]/,
      peg$c18 = peg$classExpectation([["0", "9"]], false, false),
      peg$c19 = peg$anyExpectation(),
      peg$c20 = /^[a-z]/,
      peg$c21 = peg$classExpectation([["a", "z"]], false, false),
      peg$c22 = /^[@]/,
      peg$c23 = peg$classExpectation(["@"], false, false),
      peg$c24 = /^[.]/,
      peg$c25 = peg$classExpectation(["."], false, false),
      peg$c26 = "http://",
      peg$c27 = peg$literalExpectation("http://", false),
      peg$c28 = "https://",
      peg$c29 = peg$literalExpectation("https://", false),
      peg$c30 = /^[a-z0-9]/,
      peg$c31 = peg$classExpectation([["a", "z"], ["0", "9"]], false, false),
      peg$c32 = /^[\/]/,
      peg$c33 = peg$classExpectation(["/"], false, false),
      peg$c34 = function() {
          return text()
        },
      peg$c35 = /^[([}"'`\u2018]/,
      peg$c36 = peg$classExpectation(["(", "[", "}", "\"", "'", "`", "\u2018"], false, false),
      peg$c37 = /^[)\]}"'`\u2019]/,
      peg$c38 = peg$classExpectation([")", "]", "}", "\"", "'", "`", "\u2019"], false, false),

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$silentFails      = 0,

      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseSentences() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parseSentence();
    if (s3 !== peg$FAILED) {
      s4 = peg$parseWhitespace();
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$currPos;
      s3 = peg$parseSentence();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseWhitespace();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c0(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseSentence() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseTokenSeq();
    if (s2 === peg$FAILED) {
      s2 = peg$parseQuotedTokenSeq();
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseTokenSeq();
        if (s2 === peg$FAILED) {
          s2 = peg$parseQuotedTokenSeq();
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEndOfSentence();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTokenSeq() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parseToken();
    if (s3 !== peg$FAILED) {
      s4 = peg$parseWhitespace();
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$parseToken();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseWhitespace();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c2(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseQuotedTokenSeq() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseOpenSymbol();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parseToken();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseWhitespace();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parseToken();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseWhitespace();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseEndOfSentence();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseCloseSymbol();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c3(s1, s2, s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEndOfSentence() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c4.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c5); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (peg$c4.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c6();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseWhitespace() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c7.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c8); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (peg$c7.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c6();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseToken() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseURI();
    if (s1 === peg$FAILED) {
      s1 = peg$parseEmail();
      if (s1 === peg$FAILED) {
        s1 = peg$parseNumber();
        if (s1 === peg$FAILED) {
          s1 = peg$parseAbbreviation();
          if (s1 === peg$FAILED) {
            s1 = peg$parseWord();
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c9(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseAbbreviation() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c10.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c11); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c10.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c11); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c12(s1);
      if (s2) {
        s2 = void 0;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c13(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWord() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c14.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c15); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c14.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c16();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseNumber() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c17.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c18); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c17.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      if (input.length > peg$currPos) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        if (peg$c17.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c17.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c18); }
            }
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseCloseSymbol();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c6();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEmail() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c20.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c21); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c20.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      if (peg$c22.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c20.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c20.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c21); }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          if (peg$c24.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c25); }
          }
          if (s4 !== peg$FAILED) {
            s5 = [];
            if (peg$c20.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c21); }
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (peg$c20.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c21); }
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c6();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseURI() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c26) {
      s1 = peg$c26;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c27); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 8) === peg$c28) {
        s1 = peg$c28;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c30.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c30.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c31); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (peg$c24.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c25); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = [];
          if (peg$c30.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c31); }
          }
          if (s6 !== peg$FAILED) {
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              if (peg$c30.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c31); }
              }
            }
          } else {
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            if (peg$c24.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c25); }
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = [];
            if (peg$c30.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c31); }
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (peg$c30.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c31); }
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$currPos;
              s8 = [];
              if (peg$c30.test(input.charAt(peg$currPos))) {
                s9 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c31); }
              }
              if (s9 !== peg$FAILED) {
                while (s9 !== peg$FAILED) {
                  s8.push(s9);
                  if (peg$c30.test(input.charAt(peg$currPos))) {
                    s9 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c31); }
                  }
                }
              } else {
                s8 = peg$FAILED;
              }
              if (s8 !== peg$FAILED) {
                if (peg$c32.test(input.charAt(peg$currPos))) {
                  s9 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c33); }
                }
                if (s9 !== peg$FAILED) {
                  s8 = [s8, s9];
                  s7 = s8;
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$currPos;
                s8 = [];
                if (peg$c30.test(input.charAt(peg$currPos))) {
                  s9 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c31); }
                }
                if (s9 !== peg$FAILED) {
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    if (peg$c30.test(input.charAt(peg$currPos))) {
                      s9 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c31); }
                    }
                  }
                } else {
                  s8 = peg$FAILED;
                }
                if (s8 !== peg$FAILED) {
                  if (peg$c32.test(input.charAt(peg$currPos))) {
                    s9 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c33); }
                  }
                  if (s9 !== peg$FAILED) {
                    s8 = [s8, s9];
                    s7 = s8;
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c34();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseOpenSymbol() {
    var s0, s1;

    s0 = peg$currPos;
    if (peg$c35.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c36); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c6();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseCloseSymbol() {
    var s0, s1;

    s0 = peg$currPos;
    if (peg$c37.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c38); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c6();
    }
    s0 = s1;

    return s0;
  }


  	const knownAbbreviations = __webpack_require__(8656)/* .knownAbbreviations */ .c


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};


/***/ }),

/***/ 723:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)
const _ = __webpack_require__(6419)

// Base Class for RegExp Matching
const RegexpTokenizer = function (opts) {
  const options = opts || {}
  this._pattern = options.pattern || this._pattern
  this.discardEmpty = options.discardEmpty || true

  // Match and split on GAPS not the actual WORDS
  this._gaps = options.gaps

  if (this._gaps === undefined) {
    this._gaps = true
  }
}

util.inherits(RegexpTokenizer, Tokenizer)

RegexpTokenizer.prototype.tokenize = function (s) {
  let results

  if (this._gaps) {
    results = s.split(this._pattern)
    return (this.discardEmpty) ? _.without(results, '', ' ') : results
  } else {
    return s.match(this._pattern)
  }
}

exports.RegexpTokenizer = RegexpTokenizer

const orthographyMatchers = __webpack_require__(7343)

/***
 * A tokenizer that accepts an alphabet definition.
 * @param {string} options.language ISO 639-1 for the language, e.g. 'en'
 */
const OrthographyTokenizer = function (options) {
  const pattern = orthographyMatchers[options.language]
  if (!pattern) {
    WordTokenizer.call(this, options)
  } else {
    this._pattern = pattern
    RegexpTokenizer.call(this, options)
  }
}

util.inherits(OrthographyTokenizer, RegexpTokenizer)

exports.OrthographyTokenizer = OrthographyTokenizer

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordTokenizer().tokenize("She said 'hello'.")
 *      ['She', 'said', 'hello']
 *
 */
const WordTokenizer = function (options) {
  this._pattern = /[^A-Za-zА-Яа-я0-9_]+/
  RegexpTokenizer.call(this, options)
}

util.inherits(WordTokenizer, RegexpTokenizer)
exports.WordTokenizer = WordTokenizer

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordPunctTokenizer().tokenize("She said 'hello'.")
 *      ["She","said","'","hello","'","."]
 *
 */
const WordPunctTokenizer = function (options) {
  this._pattern = /([A-zÀ-ÿ-]+|[0-9._]+|.|!|\?|'|"|:|;|,|-)/i
  RegexpTokenizer.call(this, options)
}

util.inherits(WordPunctTokenizer, RegexpTokenizer)
exports.WordPunctTokenizer = WordPunctTokenizer


/***/ }),

/***/ 7595:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const DEBUG = false

const SentenceTokenizer = function () {
  Tokenizer.call(this)
}
util.inherits(SentenceTokenizer, Tokenizer)

SentenceTokenizer.prototype.tokenize = function (text) {
  // break string up in to sentences based on punctation and quotation marks
  let tokens = text.match(/(?<=\s+|^)["'‘“'"[({⟨]?(.*?[.?!])(\s[.?!])*["'’”'"\])}⟩]?(?=\s+|$)|(?<=\s+|^)\S(.*?[.?!])(\s[.?!])*(?=\s+|$)/g)

  DEBUG && console.log('SentenceTokenizer.tokenize: ' + tokens)

  if (!tokens) {
    return [text]
  }

  // remove unecessary white space
  tokens = tokens.map(Function.prototype.call, String.prototype.trim)

  DEBUG && console.log('SentenceTokenizer.tokenize: tokens after removing whitespace ' + tokens)

  return this.trim(tokens)
}

module.exports = SentenceTokenizer


/***/ }),

/***/ 7113:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2020, Hugo ter Doest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const parser = __webpack_require__(7768)

const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)

const SentenceTokenizer = function () {
  Tokenizer.call(this)
}

util.inherits(SentenceTokenizer, Tokenizer)

SentenceTokenizer.prototype.tokenize = function (text) {
  return (parser.parse(text))
}

module.exports = SentenceTokenizer


/***/ }),

/***/ 1471:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * \@todo Use .bind() in Tokenizer.prototype.attach().
 */



const Tokenizer = function () {
}

Tokenizer.prototype.trim = function (array) {
  while (array[array.length - 1] === '') { array.pop() }

  while (array[0] === '') { array.shift() }

  return array
}

// Expose an attach function that will patch String with new methods.
// Changing the prototype of a native type is bad practice
/*
Tokenizer.prototype.attach = function () {
  const self = this

  String.prototype.tokenize = function () {
    return self.tokenize(this)
  }
}
*/

Tokenizer.prototype.tokenize = function () {}

module.exports = Tokenizer


/***/ }),

/***/ 7592:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 Copyright (c) 2011, Chris Umbel, Alex Langberg

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)
const CaseTokenizer = function () {
  Tokenizer.call(this)
}

util.inherits(CaseTokenizer, Tokenizer)

// Changing the prototype of a native type is bad practice
/*
CaseTokenizer.prototype.attach = function () {
  const self = this

  String.prototype.tokenize = function (preserveApostrophe) {
    return self.tokenize(this, preserveApostrophe)
  }
}
*/

// Idea from Seagull: http://stackoverflow.com/a/26482650
CaseTokenizer.prototype.tokenize = function (text, preserveApostrophe) {
  const whitelist = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const lower = text.toLowerCase()
  const upper = text.toUpperCase()
  let result = ''
  let i

  for (i = 0; i < lower.length; ++i) {
    if (lower[i] !== upper[i] || whitelist.indexOf(lower[i]) > -1 || (text[i] === '\'' && preserveApostrophe)) {
      result += text[i]
    } else {
      result += ' '
    }
  }

  return this.trim(result.replace(/\s+/g, ' ').split(' '))
}

module.exports = CaseTokenizer


/***/ }),

/***/ 5637:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const Tokenizer = __webpack_require__(1471)
const util = __webpack_require__(9539)
const _ = __webpack_require__(6419)

const contractions2 = [
  /(.)('ll|'re|'ve|n't|'s|'m|'d)\b/ig,
  /\b(can)(not)\b/ig,
  /\b(D)('ye)\b/ig,
  /\b(Gim)(me)\b/ig,
  /\b(Gon)(na)\b/ig,
  /\b(Got)(ta)\b/ig,
  /\b(Lem)(me)\b/ig,
  /\b(Mor)('n)\b/ig,
  /\b(T)(is)\b/ig,
  /\b(T)(was)\b/ig,
  /\b(Wan)(na)\b/ig]

const contractions3 = [
  /\b(Whad)(dd)(ya)\b/ig,
  /\b(Wha)(t)(cha)\b/ig
]

const TreebankWordTokenizer = function () {
}

util.inherits(TreebankWordTokenizer, Tokenizer)

TreebankWordTokenizer.prototype.tokenize = function (text) {
  contractions2.forEach(function (regexp) {
    text = text.replace(regexp, '$1 $2')
  })

  contractions3.forEach(function (regexp) {
    text = text.replace(regexp, '$1 $2 $3')
  })

  // most punctuation
  text = text.replace(/([^\w.'\-/+<>,&])/g, ' $1 ')

  // commas if followed by space
  text = text.replace(/(,\s)/g, ' $1')

  // single quotes if followed by a space
  text = text.replace(/('\s)/g, ' $1')

  // periods before newline or end of string
  text = text.replace(/\. *(\n|$)/g, ' . ')

  return _.without(text.split(/\s+/), '')
}

module.exports = TreebankWordTokenizer


/***/ }),

/***/ 75:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.Trie = __webpack_require__(2225)


/***/ }),

/***/ 2225:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2014 Ken Koch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



/**
 * The basis of the TRIE structure.
 **/
function Trie (caseSensitive) {
  this.dictionary = Object.create(null) // {}
  this.$ = false

  if (typeof caseSensitive === 'undefined') {
    caseSensitive = true
  }

  this.cs = caseSensitive
}

/**
 * Add a single string to the TRIE, returns true if the word was already in the
 * trie.
 **/
Trie.prototype.addString = function (string) {
  if (this.cs === false) {
    string = string.toLowerCase()
  }

  // If the string has only one letter, mark this as a word.
  if (string.length === 0) {
    const wasWord = this.$
    this.$ = true
    return wasWord
  }

  // Make sure theres a Trie node in our dictionary
  let next = this.dictionary[string[0]]

  if (!next) {
    this.dictionary[string[0]] = new Trie(this.cs)
    next = this.dictionary[string[0]]
  }

  // Continue adding the string
  return next.addString(string.substring(1))
}

/**
 * Add multiple strings to the TRIE
 **/
Trie.prototype.addStrings = function (list) {
  for (const i in list) {
    this.addString(list[i])
  }
}

/**
 * A function to search the TRIE and return an array of
 * words which have same prefix <prefix>
 * for example if we had the following words in our database:
 * a, ab, bc, cd, abc, abd
 * and we search the string: a
 * we will get :
 * [a, ab, abc, abd]
 **/
Trie.prototype.keysWithPrefix = function (prefix) {
  if (this.caseSensitive === false) {
    prefix = prefix.toLowerCase()
  }

  function isEmpty (object) {
    for (const key in object) if (object[key]) return false
    return true
  }

  function get (node, word) {
    if (!node) return null
    if (word.length === 0) return node
    return get(node.dictionary[word[0]], word.substring(1))
  }

  function recurse (node, stringAgg, resultsAgg) {
    if (!node) return

    // Check if this is a word
    if (node.$) {
      resultsAgg.push(stringAgg)
    }

    if (isEmpty(node.dictionary)) {
      return
    }

    for (const c in node.dictionary) {
      recurse(node.dictionary[c], stringAgg + c, resultsAgg)
    }
  }

  const results = []
  recurse(get(this, prefix), prefix, results)
  return results
}

/**
 * A function to search the given string and return true if it lands
 * on on a word. Essentially testing if the word exists in the database.
 **/
Trie.prototype.contains = function (string) {
  if (this.cs === false) {
    string = string.toLowerCase()
  }

  if (string.length === 0) {
    return this.$
  }

  // Otherwise, we need to continue searching
  const firstLetter = string[0]
  const next = this.dictionary[firstLetter]

  // If we don't have a node, this isn't a word
  if (!next) {
    return false
  }

  // Otherwise continue the search at the next node
  return next.contains(string.substring(1))
}

/**
 * A function to search the TRIE and return an array of words which were encountered along the way.
 * This will only return words with full prefix matches.
 * for example if we had the following words in our database:
 * a, ab, bc, cd, abc
 * and we searched the string: abcd
 * we would get only:
 * [a, ab, abc]
 **/
Trie.prototype.findMatchesOnPath = function (search) {
  if (this.cs === false) {
    search = search.toLowerCase()
  }

  function recurse (node, search, stringAgg, resultsAgg) {
    // Check if this is a word.
    if (node.$) {
      resultsAgg.push(stringAgg)
    }

    // Check if the have completed the seearch
    if (search.length === 0) {
      return resultsAgg
    }

    // Otherwise, continue searching
    const next = node.dictionary[search[0]]
    if (!next) {
      return resultsAgg
    }
    return recurse(next, search.substring(1), stringAgg + search[0], resultsAgg)
  };

  return recurse(this, search, '', [])
}

/**
 * Returns the longest match and the remaining part that could not be matched.
 * inspired by [NLTK containers.trie.find_prefix](http://nltk.googlecode.com/svn-/trunk/doc/api/nltk.containers.Trie-class.html).
 **/
Trie.prototype.findPrefix = function (search) {
  if (this.cs === false) {
    search = search.toLowerCase()
  }

  function recurse (node, search, stringAgg, lastWord) {
    // Check if this is a word
    if (node.$) {
      lastWord = stringAgg
    }

    // Check if we have no more to search
    if (search.length === 0) {
      return [lastWord, search]
    }

    // Continue searching
    const next = node.dictionary[search[0]]
    if (!next) {
      return [lastWord, search]
    }
    return recurse(next, search.substring(1), stringAgg + search[0], lastWord)
  };

  return recurse(this, search, '', null)
}

/**
 * Computes the number of actual nodes from this node to the end.
 * Note: This involves traversing the entire structure and may not be
 * good for frequent use.
 **/
Trie.prototype.getSize = function () {
  let total = 1
  for (const c in this.dictionary) {
    total += this.dictionary[c].getSize()
  }
  return total
}

/**
 * EXPORT THE TRIE
 **/
module.exports = Trie


/***/ }),

/***/ 8656:
/***/ ((__unused_webpack_module, exports) => {

const knownAbbreviations = [
  'approx.',
  'appt.',
  'apt.',
  'A.S.A.P.',
  'B.Y.O.B.',
  'c/o',
  'dept.',
  'D.I.Y.',
  'est.',
  'E.T.A.',
  'Inc.',
  'min.',
  'misc.',
  'Mr.',
  'Mrs.',
  'no.',
  'R.S.V.P.',
  'tel.',
  'temp.',
  'vet.',
  'vs.'
]

exports.c = knownAbbreviations


/***/ }),

/***/ 8257:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



function Bag () {
  this.dictionary = []
  this.nElement = 0
};

Bag.prototype.add = function (element) {
  this.dictionary.push(element)
  this.nElement++
  return this
}

Bag.prototype.isEmpty = function () {
  return this.nElement > 0
}

Bag.prototype.contains = function (item) {
  return this.dictionary.indexOf(item) >= 0
}

/**
 * unpack the bag , and get all items
 */
Bag.prototype.unpack = function () {
  // return a copy is better than original
  return this.dictionary.slice()
}

module.exports = Bag


/***/ }),

/***/ 1702:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const util = __webpack_require__(9539)
const Bag = __webpack_require__(8257)

const DirectedEdge = function (start, end, weight) {
  this.start = start
  this.end = end
  this.weight = weight
}

DirectedEdge.prototype.weight = function () {
  return this.weight
}

DirectedEdge.prototype.from = function () {
  return this.start
}

DirectedEdge.prototype.to = function () {
  return this.end
}

DirectedEdge.prototype.toString = function () {
  return util.format('%s -> %s, %s', this.start, this.end, this.weight)
}

const EdgeWeightedDigraph = function () {
  this.edgesNum = 0
  this.adj = [] // adjacency list
}

/**
 * the number of vertexs saved.
 */
EdgeWeightedDigraph.prototype.v = function () {
  return this.adj.length
}

/**
 * the number of edges saved.
 */
EdgeWeightedDigraph.prototype.e = function () {
  return this.edgesNum
}

EdgeWeightedDigraph.prototype.add = function (start, end, weight) {
  const e = new DirectedEdge(start, end, weight)
  this.addEdge(e)
}

EdgeWeightedDigraph.prototype.addEdge = function (e) {
  if (!this.adj[e.from()]) {
    this.adj[e.from()] = new Bag()
  }
  this.adj[e.from()].add(e)
  this.edgesNum++
}

/**
 * use callback on all edges from v.
 */
EdgeWeightedDigraph.prototype.getAdj = function (v) {
  if (!this.adj[v]) return []
  return this.adj[v].unpack()
}

/**
 * use callback on all edges.
 */
EdgeWeightedDigraph.prototype.edges = function () {
  const adj = this.adj
  const list = new Bag()
  for (const i in adj) {
    adj[i].unpack().forEach(function (item) {
      list.add(item)
    })
  }
  return list.unpack()
}

EdgeWeightedDigraph.prototype.toString = function () {
  const result = []
  const list = this.edges()
  list.forEach(function (edge) {
    result.push(edge.toString())
  })
  return result.join('\n')
}

module.exports = EdgeWeightedDigraph


/***/ }),

/***/ 6374:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.stopwords = __webpack_require__(8918).words
exports.ShortestPathTree = __webpack_require__(4986)
exports.LongestPathTree = __webpack_require__(9832)
exports.EdgeWeightedDigraph = __webpack_require__(1702)


/***/ }),

/***/ 9832:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// const EdgeWeightedDigraph = require('./edge_weighted_digraph')
const Topological = __webpack_require__(3785)

/**
  *  The LongestPathTree represents a data type for solving the
  *  single-source longest paths problem in edge-weighted directed
  *  acyclic graphs (DAGs). The edge weights can be positive, negative, or zero.
  *  This implementation uses a topological-sort based algorithm.
  *  the distTo() and hasPathTo() methods take
  *  constant time and the pathTo() method takes time proportional to the
  *  number of edges in the longest path returned.
  */
const LongestPathTree = function (digraph, start) {
  const _this = this
  this.edgeTo = []
  this.distTo = []
  this.distTo[start] = 0.0
  this.start = start
  this.top = new Topological(digraph)
  this.top.order().forEach(function (vertex) {
    _this.relaxVertex(digraph, vertex, _this)
  })
}

LongestPathTree.prototype.relaxEdge = function (e) {
  const distTo = this.distTo
  const edgeTo = this.edgeTo
  const v = e.from(); const w = e.to()
  if (distTo[w] < distTo[v] + e.weight) {
    distTo[w] = distTo[v] + e.weight
    edgeTo[w] = e
  }
}

/**
 * relax a vertex v in the specified digraph g
 * @param {EdgeWeightedDigraph} the apecified digraph
 * @param {Vertex} v vertex to be relaxed
 */
LongestPathTree.prototype.relaxVertex = function (digraph, vertex, tree) {
  const distTo = tree.distTo
  const edgeTo = tree.edgeTo

  digraph.getAdj(vertex).forEach(function (edge) {
    const w = edge.to()
    distTo[w] = distTo[w] || 0.0
    distTo[vertex] = distTo[vertex] || 0.0
    if (distTo[w] < distTo[vertex] + edge.weight) {
      // in case of the result of 0.28+0.34 is 0.62000001
      distTo[w] = parseFloat((distTo[vertex] + edge.weight).toFixed(2))
      edgeTo[w] = edge
    }
  })
}

LongestPathTree.prototype.getDistTo = function (v) {
  return this.distTo[v]
}

LongestPathTree.prototype.hasPathTo = function (v) {
  return !!this.distTo[v]
}

LongestPathTree.prototype.pathTo = function (v) {
  if (!this.hasPathTo(v)) return []
  const path = []
  const edgeTo = this.edgeTo
  for (let e = edgeTo[v]; e; e = edgeTo[e.from()]) {
    path.push(e.to())
  }
  path.push(this.start)
  return path.reverse()
}

module.exports = LongestPathTree


/***/ }),

/***/ 4986:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// const EdgeWeightedDigraph = require('./edge_weighted_digraph')
const Topological = __webpack_require__(3785)

/**
  *  The ShortestPathTree represents a data type for solving the
  *  single-source shortest paths problem in edge-weighted directed
  *  acyclic graphs (DAGs). The edge weights can be positive, negative, or zero.
  *  This implementation uses a topological-sort based algorithm.
  *  the distTo() and hasPathTo() methods take
  *  constant time and the pathTo() method takes time proportional to the
  *  number of edges in the longest path returned.
  */
const ShortestPathTree = function (digraph, start) {
  const _this = this
  this.edgeTo = []
  this.distTo = []
  this.distTo[start] = 0.0
  this.start = start
  this.top = new Topological(digraph)
  this.top.order().forEach(function (vertex) {
    _this.relaxVertex(digraph, vertex, _this)
  })
}

ShortestPathTree.prototype.relaxEdge = function (e) {
  const distTo = this.distTo
  const edgeTo = this.edgeTo
  const v = e.from(); const w = e.to()
  if (distTo[w] > distTo[v] + e.weight) {
    distTo[w] = distTo[v] + e.weight
    edgeTo[w] = e
  }
}

/**
 * relax a vertex v in the specified digraph g
 * @param {EdgeWeightedDigraph} the apecified digraph
 * @param {Vertex} v vertex to be relaxed
 */
ShortestPathTree.prototype.relaxVertex = function (digraph, vertex, tree) {
  const distTo = tree.distTo
  const edgeTo = tree.edgeTo
  digraph.getAdj(vertex).forEach(function (edge) {
    const w = edge.to()
    distTo[w] = /\d/.test(distTo[w]) ? distTo[w] : Number.MAX_VALUE
    distTo[vertex] = distTo[vertex] || 0
    if (distTo[w] > distTo[vertex] + edge.weight) {
      // in case of the result of 0.28+0.34 is 0.62000001
      distTo[w] = parseFloat((distTo[vertex] + edge.weight).toFixed(2))
      edgeTo[w] = edge
    }
  })
}

ShortestPathTree.prototype.getDistTo = function (v) {
  return this.distTo[v]
}

ShortestPathTree.prototype.hasPathTo = function (v) {
  const dist = this.distTo[v]
  if (v === this.start) return false
  return /\d/.test(dist) ? dist !== Number.MAX_VALUE : false
}

ShortestPathTree.prototype.pathTo = function (v) {
  if (!this.hasPathTo(v) || v === this.start) return []
  const path = []
  const edgeTo = this.edgeTo
  for (let e = edgeTo[v]; e; e = edgeTo[e.from()]) {
    path.push(e.to())
  }
  path.push(this.start)
  return path.reverse()
}

module.exports = ShortestPathTree


/***/ }),

/***/ 8918:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
  'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
  'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
  'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
  'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'said', 'same', 'see', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
  'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 5934:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'a', 'un', 'el', 'ella', 'y', 'sobre', 'de', 'la', 'que', 'en',
  'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no',
  'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le',
  'ya', 'o', 'porque', 'cuando', 'muy', 'sin', 'sobre', 'también',
  'me', 'hasta', 'donde', 'quien', 'desde', 'nos', 'durante', 'uno',
  'ni', 'contra', 'ese', 'eso', 'mí', 'qué', 'otro', 'él', 'cual',
  'poco', 'mi', 'tú', 'te', 'ti', 'sí',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 9023:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel
Farsi Stop Words by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  // Words
  'از', 'با', 'یه', 'برای', 'و', 'باید', 'شاید',

  // Symbols
  '؟', '!', '٪', '.', '،', '؛', ':', ';', ',',

  // Numbers
  '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'
]

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 6621:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 Copyright (c) 2014, Ismaël Héry

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// A list of commonly used french words that have little meaning and can be excluded
// from analysis.



const words = ['être', 'avoir', 'faire',
  'a',
  'au',
  'aux',
  'avec',
  'ce',
  'ces',
  'dans',
  'de',
  'des',
  'du',
  'elle',
  'en',
  'et',
  'eux',
  'il',
  'je',
  'la',
  'le',
  'leur',
  'lui',
  'ma',
  'mais',
  'me',
  'même',
  'mes',
  'moi',
  'mon',
  'ne',
  'nos',
  'notre',
  'nous',
  'on',
  'ou',
  'où',
  'par',
  'pas',
  'pour',
  'qu',
  'que',
  'qui',
  'sa',
  'se',
  'ses',
  'son',
  'sur',
  'ta',
  'te',
  'tes',
  'toi',
  'ton',
  'tu',
  'un',
  'une',
  'vos',
  'votre',
  'vous',
  'c',
  'd',
  'j',
  'l',
  'à',
  'm',
  'n',
  's',
  't',
  'y',
  'été',
  'étée',
  'étées',
  'étés',
  'étant',
  'suis',
  'es',
  'est',
  'sommes',
  'êtes',
  'sont',
  'serai',
  'seras',
  'sera',
  'serons',
  'serez',
  'seront',
  'serais',
  'serait',
  'serions',
  'seriez',
  'seraient',
  'étais',
  'était',
  'étions',
  'étiez',
  'étaient',
  'fus',
  'fut',
  'fûmes',
  'fûtes',
  'furent',
  'sois',
  'soit',
  'soyons',
  'soyez',
  'soient',
  'fusse',
  'fusses',
  'fût',
  'fussions',
  'fussiez',
  'fussent',
  'ayant',
  'eu',
  'eue',
  'eues',
  'eus',
  'ai',
  'as',
  'avons',
  'avez',
  'ont',
  'aurai',
  'auras',
  'aura',
  'aurons',
  'aurez',
  'auront',
  'aurais',
  'aurait',
  'aurions',
  'auriez',
  'auraient',
  'avais',
  'avait',
  'avions',
  'aviez',
  'avaient',
  'eut',
  'eûmes',
  'eûtes',
  'eurent',
  'aie',
  'aies',
  'ait',
  'ayons',
  'ayez',
  'aient',
  'eusse',
  'eusses',
  'eût',
  'eussions',
  'eussiez',
  'eussent',
  'ceci',
  'cela',
  'cet',
  'cette',
  'ici',
  'ils',
  'les',
  'leurs',
  'quel',
  'quels',
  'quelle',
  'quelles',
  'sans',
  'soi'
]

exports.words = words


/***/ }),

/***/ 7078:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'ad', 'al', 'allo', 'ai', 'agli', 'all', 'agl', 'alla', 'alle', 'con', 'col', 'coi', 'da', 'dal', 'dallo',
  'dai', 'dagli', 'dall', 'dagl', 'dalla', 'dalle', 'di', 'del', 'dello', 'dei', 'degli', 'dell', 'degl',
  'della', 'delle', 'in', 'nel', 'nello', 'nei', 'negli', 'nell', 'negl', 'nella', 'nelle', 'su', 'sul',
  'sullo', 'sui', 'sugli', 'sull', 'sugl', 'sulla', 'sulle', 'per', 'tra', 'contro', 'io', 'tu', 'lui',
  'lei', 'noi', 'voi', 'loro', 'mio', 'mia', 'miei', 'mie', 'tuo', 'tua', 'tuoi', 'tue', 'suo', 'sua', 'suoi',
  'sue', 'nostro', 'nostra', 'nostri', 'nostre', 'vostro', 'vostra', 'vostri', 'vostre', 'mi', 'ti', 'ci',
  'vi', 'lo', 'la', 'li', 'le', 'gli', 'ne', 'il', 'un', 'uno', 'una', 'ma', 'ed', 'se', 'perché', 'anche', 'come',
  'dov', 'dove', 'che', 'chi', 'cui', 'non', 'più', 'quale', 'quanto', 'quanti', 'quanta', 'quante', 'quello',
  'quelli', 'quella', 'quelle', 'questo', 'questi', 'questa', 'queste', 'si', 'tutto', 'tutti', 'a', 'c', 'e',
  'i', 'l', 'o', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'abbia', 'abbiate', 'abbiano', 'avrò', 'avrai',
  'avrà', 'avremo', 'avrete', 'avranno', 'avrei', 'avresti', 'avrebbe', 'avremmo', 'avreste', 'avrebbero',
  'avevo', 'avevi', 'aveva', 'avevamo', 'avevate', 'avevano', 'ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste',
  'ebbero', 'avessi', 'avesse', 'avessimo', 'avessero', 'avendo', 'avuto', 'avuta', 'avuti', 'avute', 'sono',
  'sei', 'è', 'siamo', 'siete', 'sia', 'siate', 'siano', 'sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno',
  'sarei', 'saresti', 'sarebbe', 'saremmo', 'sareste', 'sarebbero', 'ero', 'eri', 'era', 'eravamo', 'eravate',
  'erano', 'fui', 'fosti', 'fu', 'fummo', 'foste', 'furono', 'fossi', 'fosse', 'fossimo', 'fossero', 'essendo',
  'faccio', 'fai', 'facciamo', 'fanno', 'faccia', 'facciate', 'facciano', 'farò', 'farai', 'farà', 'faremo',
  'farete', 'faranno', 'farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero', 'facevo', 'facevi',
  'faceva', 'facevamo', 'facevate', 'facevano', 'feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero',
  'facessi', 'facesse', 'facessimo', 'facessero', 'facendo', 'sto', 'stai', 'sta', 'stiamo', 'stanno', 'stia',
  'stiate', 'stiano', 'starò', 'starai', 'starà', 'staremo', 'starete', 'staranno', 'starei', 'staresti',
  'starebbe', 'staremmo', 'stareste', 'starebbero', 'stavo', 'stavi', 'stava', 'stavamo', 'stavate', 'stavano',
  'stetti', 'stesti', 'stette', 'stemmo', 'steste', 'stettero', 'stessi', 'stesse', 'stessimo', 'stessero', 'stando',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 6655:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// Original copyright:
/*
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// This version:
/*
Copyright (c) 2012, Guillaume Marty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
// Original location:
// http://svn.apache.org/repos/asf/lucene/dev/trunk/lucene/analysis/kuromoji/src/resources/org/apache/lucene/analysis/ja/stopwords.txt
const words = ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
  'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる',
  'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの',
  'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ', 'によって',
  'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる', 'において', 'ば', 'なかっ',
  'なく', 'しかし', 'について', 'せ', 'だっ', 'その後', 'できる', 'それ', 'う', 'ので',
  'なお', 'のみ', 'でき', 'き', 'つ', 'における', 'および', 'いう', 'さらに', 'でも',
  'ら', 'たり', 'その他', 'に関する', 'たち', 'ます', 'ん', 'なら', 'に対して', '特に',
  'せる', '及び', 'これら', 'とき', 'では', 'にて', 'ほか', 'ながら', 'うち', 'そして',
  'とともに', 'ただし', 'かつて', 'それぞれ', 'または', 'お', 'ほど', 'ものの', 'に対する',
  'ほとんど', 'と共に', 'といった', 'です', 'とも', 'ところ', 'ここ']

// tell the world about the noise words.
exports.z = words


/***/ }),

/***/ 1490:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'og', 'i', 'jeg', 'det', 'at', 'en', 'et', 'den', 'til', 'er', 'som',
  'på', 'de', 'med', 'han', 'av', 'ikke', 'der', 'så', 'var', 'meg',
  'seg', 'men', 'ett', 'har', 'om', 'vi', 'min', 'mitt', 'ha', 'hadde',
  'hun', 'nå', 'over', 'da', 'ved', 'fra', 'du', 'ut', 'sin', 'dem',
  'oss', 'opp', 'man', 'kan', 'hans', 'hvor', 'eller', 'hva', 'skal',
  'selv', 'sjøl', 'her', 'alle', 'vil', 'bli', 'ble', 'blitt', 'kunne',
  'inn', 'når', 'være', 'kom', 'noen', 'noe', 'ville', 'dere', 'som',
  'deres', 'kun', 'ja', 'etter', 'ned', 'skulle', 'denne', 'for', 'deg',
  'si', 'sine', 'sitt', 'mot', 'å', 'meget', 'hvorfor', 'dette', 'disse',
  'uten', 'hvordan', 'ingen', 'din', 'ditt', 'blir', 'samme', 'hvilken',
  'hvilke', 'sånn', 'inni', 'mellom', 'vår', 'hver', 'hvem', 'vors',
  'hvis', 'både', 'bare', 'enn', 'fordi', 'før', 'mange', 'også', 'slik',
  'vært', 'være', 'begge', 'siden', 'henne', 'hennar', 'hennes',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 2512:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'a',
  'à',
  'ao',
  'aos',
  'aquela',
  'aquelas',
  'aquele',
  'aqueles',
  'aquilo',
  'as',
  'às',
  'até',
  'com',
  'como',
  'da',
  'das',
  'de',
  'dela',
  'delas',
  'dele',
  'deles',
  'depois',
  'do',
  'dos',
  'e',
  'ela',
  'elas',
  'ele',
  'eles',
  'em',
  'entre',
  'essa',
  'essas',
  'esse',
  'esses',
  'esta',
  'estas',
  'este',
  'estes',
  'eu',
  'isso',
  'isto',
  'já',
  'lhe',
  'lhes',
  'mais',
  'mas',
  'me',
  'mesmo',
  'meu',
  'meus',
  'minha',
  'minhas',
  'muito',
  'muitos',
  'na',
  'não',
  'nas',
  'nem',
  'no',
  'nos',
  'nós',
  'nossa',
  'nossas',
  'nosso',
  'nossos',
  'num',
  'nuns',
  'numa',
  'numas',
  'o',
  'os',
  'ou',
  'para',
  'pela',
  'pelas',
  'pelo',
  'pelos',
  'por',
  'quais',
  'qual',
  'quando',
  'que',
  'quem',
  'se',
  'sem',
  'seu',
  'seus',
  'só',
  'sua',
  'suas',
  'também',
  'te',
  'teu',
  'teus',
  'tu',
  'tua',
  'tuas',
  'um',
  'uma',
  'umas',
  'você',
  'vocês',
  'vos',
  'vosso',
  'vossos',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'
]

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 7139:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2011, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = [
  'о', 'после', 'все', 'также', 'и', 'другие', 'все', 'как', 'во', 'быть',
  'потому', 'был', 'до', 'являюсь', 'между', 'все', 'но', 'от', 'иди', 'могу',
  'подойди', 'мог', 'делал', 'делаю', 'каждый', 'для', 'откуда', 'иметь', 'имел',
  'он', 'имеет', 'её', 'здесь', 'его', 'как', 'если', 'в', 'оно', 'за',
  'делать', 'много', 'я', 'может быть', 'более', 'самый', 'должен',
  'мой', 'никогда', 'сейчас', 'из', 'на', 'только', 'или', 'другой', 'другая',
  'другое', 'наше', 'вне', 'конец', 'сказал', 'сказала', 'также', 'видел', 'c',
  'немного', 'все еще', 'так', 'затем', 'тот', 'их', 'там', 'этот', 'они', 'те',
  'через', 'тоже', 'под', 'над', 'очень', 'был', 'путь', 'мы', 'хорошо',
  'что', 'где', 'который', 'пока', 'кто', 'с кем', 'хотел бы', 'ты', 'твои',
  'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н',
  'o', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь',
  'э', 'ю', 'я', '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 4236:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
Copyright (c) 2017, Dogan Yazar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const words = ['aderton', 'adertonde', 'adjö', 'aldrig', 'alla', 'allas', 'allt', 'alltid',
  'alltså', 'andra', 'andras', 'annan', 'annat', 'artonde', 'artonn', 'att', 'av', 'bakom',
  'bara', 'behöva', 'behövas', 'behövde', 'behövt', 'beslut', 'beslutat', 'beslutit', 'bland',
  'blev', 'bli', 'blir', 'blivit', 'bort', 'borta', 'bra', 'bäst', 'bättre', 'båda', 'bådas',
  'dag', 'dagar', 'dagarna', 'dagen', 'de', 'del', 'delen', 'dem', 'den', 'denna', 'deras',
  'dess', 'dessa', 'det', 'detta', 'dig', 'din', 'dina', 'dit', 'ditt', 'dock', 'dom', 'du',
  'där', 'därför', 'då', 'e', 'efter', 'eftersom', 'ej', 'elfte', 'eller', 'elva', 'emot', 'en',
  'enkel', 'enkelt', 'enkla', 'enligt', 'ens', 'er', 'era', 'ers', 'ert', 'ett', 'ettusen',
  'fanns', 'fem', 'femte', 'femtio', 'femtionde', 'femton', 'femtonde', 'fick', 'fin',
  'finnas', 'finns', 'fjorton', 'fjortonde', 'fjärde', 'fler', 'flera', 'flesta', 'fram',
  'framför', 'från', 'fyra', 'fyrtio', 'fyrtionde', 'få', 'får', 'fått', 'följande', 'för',
  'före', 'förlåt', 'förra', 'första', 'genast', 'genom', 'gick', 'gjorde', 'gjort', 'god',
  'goda', 'godare', 'godast', 'gott', 'gälla', 'gäller', 'gällt', 'gärna', 'gå', 'går', 'gått',
  'gör', 'göra', 'ha', 'hade', 'haft', 'han', 'hans', 'har', 'heller', 'hellre', 'helst', 'helt',
  'henne', 'hennes', 'hit', 'hon', 'honom', 'hundra', 'hundraen', 'hundraett', 'hur', 'här',
  'hög', 'höger', 'högre', 'högst', 'i', 'ibland', 'icke', 'idag', 'igen', 'igår', 'imorgon',
  'in', 'inför', 'inga', 'ingen', 'ingenting', 'inget', 'innan', 'inne', 'inom', 'inte',
  'inuti', 'ja', 'jag', 'jo', 'ju', 'just', 'jämfört', 'kan', 'kanske', 'knappast', 'kom',
  'komma', 'kommer', 'kommit', 'kr', 'kunde', 'kunna', 'kunnat', 'kvar', 'legat', 'ligga',
  'ligger', 'lika', 'likställd', 'likställda', 'lilla', 'lite', 'liten', 'litet', 'länge',
  'längre', 'längst', 'lätt', 'lättare', 'lättast', 'långsam', 'långsammare', 'långsammast',
  'långsamt', 'långt', 'låt', 'man', 'med', 'mej', 'mellan', 'men', 'mer', 'mera', 'mest', 'mig',
  'min', 'mina', 'mindre', 'minst', 'mitt', 'mittemot', 'mot', 'mycket', 'många', 'måste',
  'möjlig', 'möjligen', 'möjligt', 'möjligtvis', 'ned', 'nederst', 'nedersta', 'nedre',
  'nej', 'ner', 'ni', 'nio', 'nionde', 'nittio', 'nittionde', 'nitton', 'nittonde', 'nog',
  'noll', 'nr', 'nu', 'nummer', 'när', 'nästa', 'någon', 'någonting', 'något', 'några', 'nån',
  'nånting', 'nåt', 'nödvändig', 'nödvändiga', 'nödvändigt', 'nödvändigtvis', 'och', 'också',
  'ofta', 'oftast', 'olika', 'olikt', 'om', 'oss', 'på', 'rakt', 'redan', 'rätt', 'sa', 'sade',
  'sagt', 'samma', 'sedan', 'senare', 'senast', 'sent', 'sex', 'sextio', 'sextionde', 'sexton',
  'sextonde', 'sig', 'sin', 'sina', 'sist', 'sista', 'siste', 'sitt', 'sitta', 'sju', 'sjunde',
  'sjuttio', 'sjuttionde', 'sjutton', 'sjuttonde', 'själv', 'sjätte', 'ska', 'skall', 'skulle',
  'slutligen', 'små', 'smått', 'snart', 'som', 'stor', 'stora', 'stort', 'större', 'störst',
  'säga', 'säger', 'sämre', 'sämst', 'så', 'sådan', 'sådana', 'sådant', 'ta', 'tack', 'tar',
  'tidig', 'tidigare', 'tidigast', 'tidigt', 'till', 'tills', 'tillsammans', 'tio', 'tionde',
  'tjugo', 'tjugoen', 'tjugoett', 'tjugonde', 'tjugotre', 'tjugotvå', 'tjungo', 'tolfte',
  'tolv', 'tre', 'tredje', 'trettio', 'trettionde', 'tretton', 'trettonde', 'två', 'tvåhundra',
  'under', 'upp', 'ur', 'ursäkt', 'ut', 'utan', 'utanför', 'ute', 'va', 'vad', 'var', 'vara',
  'varför', 'varifrån', 'varit', 'varje', 'varken', 'vars', 'varsågod', 'vart', 'vem', 'vems',
  'verkligen', 'vi', 'vid', 'vidare', 'viktig', 'viktigare', 'viktigast', 'viktigt', 'vilka',
  'vilkas', 'vilken', 'vilket', 'vill', 'väl', 'vänster', 'vänstra', 'värre', 'vår', 'våra',
  'vårt', 'än', 'ännu', 'är', 'även', 'åt', 'åtminstone', 'åtta', 'åttio', 'åttionde',
  'åttonde', 'över', 'övermorgon', 'överst', 'övre', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', '0']

// tell the world about the noise words.
exports.words = words


/***/ }),

/***/ 3785:
/***/ ((module) => {

"use strict";
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



/**
 * a topo sort for a digraph
 * @param {Digraph}
 */
const Topological = function (g) {
  this.isDag = true
  this.sorted = topoSort(uniqueVertexs(g.edges()), g.edges())
}

Topological.prototype.isDAG = function () {
  return this.isDag
}

/**
 * get ordered vertexs of digraph
 */
Topological.prototype.order = function () {
  return this.sorted.slice()
}

/**
 * @param {Array} all vertex in digraph
 * @param {Object} all edges in the digraph
 */
function topoSort (vertexs, edges) {
  const sorted = []
  let cursor = vertexs.length
  const visited = {}
  let i = cursor
  while (i--) {
    if (!visited[i]) visit(vertexs[i], i, [])
  }

  return sorted.reverse()

  function visit (vertex, i, predecessors) {
    if (predecessors.indexOf(vertex) >= 0) {
      throw new Error('Cyclic dependency:' + JSON.stringify(vertex))
    }

    if (visited[i]) return
    visited[i] = true

    const outgoing = edges.filter(function (edge) {
      return edge.to() === vertex
    })

    let preds = []
    if (outgoing.length > 0) {
      preds = predecessors.concat(vertex)
    }
    let from
    outgoing.forEach(function (edge) {
      from = edge.from()
      visit(from, vertexs.indexOf(from), preds)
    })

    sorted[--cursor] = vertex
  };
};

function uniqueVertexs (edges) {
  const vertexs = []
  let from, to
  edges.forEach(function (edge) {
    from = edge.from()
    to = edge.to()
    if (vertexs.indexOf(from) < 0) vertexs.push(from)
    if (vertexs.indexOf(to) < 0) vertexs.push(to)
  })
  return vertexs
};

module.exports = Topological


/***/ }),

/***/ 3117:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const WordNetFile = __webpack_require__(5009)
const util = __webpack_require__(9539)

function get (location, callbackFunction) {
  const buff = Buffer.alloc(4096)

  this.open(function (err, fd, done) {
    if (err) {
      console.log(err)
      return
    }
    WordNetFile.appendLineChar(fd, location, 0, buff, function (line) {
      done()
      const data = line.split('| ')
      const tokens = data[0].split(/\s+/)
      const ptrs = []
      const wCnt = parseInt(tokens[3], 16)
      const synonyms = []

      for (let i = 0; i < wCnt; i++) {
        synonyms.push(tokens[4 + i * 2])
      }

      const ptrOffset = (wCnt - 1) * 2 + 6
      for (let i = 0; i < parseInt(tokens[ptrOffset], 10); i++) {
        ptrs.push({
          pointerSymbol: tokens[ptrOffset + 1 + i * 4],
          synsetOffset: parseInt(tokens[ptrOffset + 2 + i * 4], 10),
          pos: tokens[ptrOffset + 3 + i * 4],
          sourceTarget: tokens[ptrOffset + 4 + i * 4]
        })
      }

      // break "gloss" into definition vs. examples
      const glossArray = data[1].split('; ')
      const definition = glossArray[0]
      const examples = glossArray.slice(1)

      for (let k = 0; k < examples.length; k++) {
        examples[k] = examples[k].replace(/"/g, '').replace(/\s\s+/g, '')
      }

      callbackFunction({
        synsetOffset: parseInt(tokens[0], 10),
        lexFilenum: parseInt(tokens[1], 10),
        pos: tokens[2],
        wCnt: wCnt,
        lemma: tokens[4],
        synonyms: synonyms,
        lexId: tokens[5],
        ptrs: ptrs,
        gloss: data[1],
        def: definition,
        exp: examples
      })
    })
  })
}

const DataFile = function (dataDir, name) {
  WordNetFile.call(this, dataDir, 'data.' + name)
}

util.inherits(DataFile, WordNetFile)
DataFile.prototype.get = get

module.exports = DataFile


/***/ }),

/***/ 1095:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



exports.WordNet = __webpack_require__(596)


/***/ }),

/***/ 5546:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const WordNetFile = __webpack_require__(5009)
const fs = __webpack_require__(403)
const util = __webpack_require__(9539)

function getFileSize (path) {
  const stat = fs.statSync(path)
  return stat.size
}

function findPrevEOL (fd, pos, callbackFunction) {
  const buff = Buffer.alloc(1024)
  if (pos === 0) { callbackFunction(0) } else {
    fs.read(fd, buff, 0, 1, pos, function (err, count) {
      if (err) {
        console.log(err)
        return
      }
      if (buff[0] === 10) {
        callbackFunction(pos + 1)
      } else {
        findPrevEOL(fd, pos - 1, callbackFunction)
      }
    })
  }
}

function readLine (fd, pos, callback) {
  const buff = Buffer.alloc(1024)
  findPrevEOL(fd, pos, function (pos) {
    WordNetFile.appendLineChar(fd, pos, 0, buff, callback)
  })
}

function miss (callbackFunction) {
  callbackFunction({ status: 'miss' })
}

function findAt (fd, size, pos, lastPos, adjustment, searchKey, callbackFunction, lastKey) {
  if (lastPos === pos || pos >= size) {
    miss(callbackFunction)
  } else {
    readLine(fd, pos, function (line) {
      const tokens = line.split(/\s+/)
      const key = tokens[0]

      if (key === searchKey) {
        callbackFunction({ status: 'hit', key: key, line: line, tokens: tokens })
      } else if (adjustment === 1 || key === lastKey) {
        miss(callbackFunction)
      } else {
        adjustment = Math.ceil(adjustment * 0.5)

        if (key < searchKey) {
          findAt(fd, size, pos + adjustment, pos, adjustment, searchKey, callbackFunction, key)
        } else {
          findAt(fd, size, pos - adjustment, pos, adjustment, searchKey, callbackFunction, key)
        }
      }
    })
  }
}

function find (searchKey, callback) {
  const indexFile = this

  indexFile.open(function (err, fd, done) {
    if (err) {
      console.log(err)
    } else {
      const size = getFileSize(indexFile.filePath) - 1
      const pos = Math.ceil(size / 2)
      findAt(fd, size, pos, null, pos, searchKey,
        function (result) { callback(result); done() })
    }
  })
}

function lookupFromFile (word, callback) {
  this.find(word, function (record) {
    let indexRecord = null

    if (record.status === 'hit') {
      const ptrs = []; const offsets = []

      for (let i = 0; i < parseInt(record.tokens[3]); i++) { ptrs.push(record.tokens[i]) }

      for (let i = 0; i < parseInt(record.tokens[2]); i++) { offsets.push(parseInt(record.tokens[ptrs.length + 6 + i], 10)) }

      indexRecord = {
        lemma: record.tokens[0],
        pos: record.tokens[1],
        ptrSymbol: ptrs,
        senseCnt: parseInt(record.tokens[ptrs.length + 4], 10),
        tagsenseCnt: parseInt(record.tokens[ptrs.length + 5], 10),
        synsetOffset: offsets
      }
    }

    callback(indexRecord)
  })
}

function lookup (word, callback) {
  this.lookupFromFile(word, callback)
}

const IndexFile = function (dataDir, name) {
  WordNetFile.call(this, dataDir, 'index.' + name)
}

util.inherits(IndexFile, WordNetFile)

IndexFile.prototype.lookupFromFile = lookupFromFile
IndexFile.prototype.lookup = lookup
IndexFile.prototype.find = find

IndexFile.prototype._findAt = findAt

module.exports = IndexFile


/***/ }),

/***/ 596:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const IndexFile = __webpack_require__(5546)
const DataFile = __webpack_require__(3117)

function pushResults (data, results, offsets, callback) {
  const wordnet = this

  if (offsets.length === 0) {
    callback(results)
  } else {
    data.get(offsets.pop(), function (record) {
      results.push(record)
      wordnet.pushResults(data, results, offsets, callback)
    })
  }
}

function lookupFromFiles (files, results, word, callback) {
  const wordnet = this

  if (files.length === 0) { callback(results) } else {
    const file = files.pop()

    file.index.lookup(word, function (record) {
      if (record) {
        wordnet.pushResults(file.data, results, record.synsetOffset, function () {
          wordnet.lookupFromFiles(files, results, word, callback)
        })
      } else {
        wordnet.lookupFromFiles(files, results, word, callback)
      }
    })
  }
}

function lookup (word, callback) {
  word = word.toLowerCase().replace(/\s+/g, '_')

  this.lookupFromFiles([
    { index: this.nounIndex, data: this.nounData },
    { index: this.verbIndex, data: this.verbData },
    { index: this.adjIndex, data: this.adjData },
    { index: this.advIndex, data: this.advData }
  ], [], word, callback)
}

function get (synsetOffset, pos, callback) {
  const dataFile = this.getDataFile(pos)

  dataFile.get(synsetOffset, function (result) {
    callback(result)
  })
}

function getDataFile (pos) {
  switch (pos) {
    case 'n':
      return this.nounData
    case 'v':
      return this.verbData
    case 'a': case 's':
      return this.adjData
    case 'r':
      return this.advData
  }
}

function loadSynonyms (synonyms, results, ptrs, callback) {
  const wordnet = this

  if (ptrs.length > 0) {
    const ptr = ptrs.pop()

    this.get(ptr.synsetOffset, ptr.pos, function (result) {
      synonyms.push(result)
      wordnet.loadSynonyms(synonyms, results, ptrs, callback)
    })
  } else {
    wordnet.loadResultSynonyms(synonyms, results, callback)
  }
}

function loadResultSynonyms (synonyms, results, callback) {
  const wordnet = this

  if (results.length > 0) {
    const result = results.pop()
    wordnet.loadSynonyms(synonyms, results, result.ptrs, callback)
  } else { callback(synonyms) }
}

function lookupSynonyms (word, callback) {
  const wordnet = this

  wordnet.lookup(word, function (results) {
    wordnet.loadResultSynonyms([], results, callback)
  })
}

function getSynonyms () {
  const wordnet = this
  const callback = arguments[2] ? arguments[2] : arguments[1]
  const pos = arguments[0].pos ? arguments[0].pos : arguments[1]
  const synsetOffset = arguments[0].synsetOffset ? arguments[0].synsetOffset : arguments[0]

  this.get(synsetOffset, pos, function (result) {
    wordnet.loadSynonyms([], [], result.ptrs, callback)
  })
}

function WordNet (dataDir) {
  let WNdb = null
  if (!dataDir) {
    try {
      WNdb = __webpack_require__(2453)
    } catch (e) {
      console.error("Please 'npm install wordnet-db' before using WordNet module or specify a dict directory.")
      throw e
    }
    dataDir = WNdb.path
  }

  this.nounIndex = new IndexFile(dataDir, 'noun')
  this.verbIndex = new IndexFile(dataDir, 'verb')
  this.adjIndex = new IndexFile(dataDir, 'adj')
  this.advIndex = new IndexFile(dataDir, 'adv')

  this.nounData = new DataFile(dataDir, 'noun')
  this.verbData = new DataFile(dataDir, 'verb')
  this.adjData = new DataFile(dataDir, 'adj')
  this.advData = new DataFile(dataDir, 'adv')

  this.get = get
  this.lookup = lookup
  this.lookupFromFiles = lookupFromFiles
  this.pushResults = pushResults
  this.loadResultSynonyms = loadResultSynonyms
  this.loadSynonyms = loadSynonyms
  this.lookupSynonyms = lookupSynonyms
  this.getSynonyms = getSynonyms
  this.getDataFile = getDataFile
}

module.exports = WordNet


/***/ }),

/***/ 5009:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/



const fs = __webpack_require__(403)

function appendLineChar (fd, pos, buffPos, buff, callbackFunction) {
  if (buffPos >= buff.length) {
    const newBuff = Buffer.alloc(buff.length * 2)
    buff.copy(newBuff, 0, 0, buff.length)
    buff = newBuff
  }

  fs.read(fd, buff, buffPos, 1, pos, function (err, count) {
    if (err) { console.log(err) } else {
      if (buff[buffPos] === 10 || buffPos === buff.length) {
        callbackFunction(buff.slice(0, buffPos).toString('UTF-8'))
      } else {
        appendLineChar(fd, pos + 1, buffPos + 1, buff, callbackFunction)
      }
    }
  })
}

function open (callback) {
  const filePath = this.filePath

  fs.open(filePath, 'r', null, function (err, fd) {
    if (err) {
      console.log('Unable to open %s', filePath)
      return
    }
    callback(err, fd, function () {
      fs.close(fd, function (error) {
        if (error) {
          throw error
        }
      })
    })
  })
}

const WordNetFile = function (dataDir, fileName) {
  this.dataDir = dataDir
  this.fileName = fileName
  this.filePath = __webpack_require__(6470).join(this.dataDir, this.fileName)
}

WordNetFile.prototype.open = open
WordNetFile.appendLineChar = appendLineChar

module.exports = WordNetFile


/***/ }),

/***/ 8251:
/***/ (() => {



/***/ }),

/***/ 4555:
/***/ (() => {



/***/ }),

/***/ 2914:
/***/ (() => {



/***/ }),

/***/ 5373:
/***/ (() => {



/***/ }),

/***/ 8288:
/***/ (() => {



/***/ }),

/***/ 3309:
/***/ (() => {



/***/ }),

/***/ 3906:
/***/ (() => {



/***/ }),

/***/ 4045:
/***/ (() => {



/***/ }),

/***/ 6470:
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ }),

/***/ 3116:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel

exports.Vector = __webpack_require__(7013);
__webpack_require__.g.$V = exports.Vector.create;
exports.Matrix = __webpack_require__(6976);
__webpack_require__.g.$M = exports.Matrix.create;
exports.Line = __webpack_require__(4165);
__webpack_require__.g.$L = exports.Line.create;
exports.Plane = __webpack_require__(5467);
__webpack_require__.g.$P = exports.Plane.create;
exports.Line.Segment = __webpack_require__(8733);
exports.Sylvester = __webpack_require__(7951);


/***/ }),

/***/ 4165:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
var Vector = __webpack_require__(7013);
var Matrix = __webpack_require__(6976);
var Plane = __webpack_require__(5467);
var Sylvester = __webpack_require__(7951);

// Line class - depends on Vector, and some methods require Matrix and Plane.

function Line() {}
Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function() {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. A line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  // Returns true iff the argument is a point on the line, or if the argument
  // is a line segment lying within the receiver
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var dist = this.distanceFrom(obj);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns the distance from the anchor of the given point. Negative values are
  // returned for points that are in the opposite direction to the line's direction from
  // the line's anchor point.
  positionOf: function(point) {
    if (!this.contains(point)) { return null; }
    var P = point.elements || point;
    var A = this.anchor.elements, D = this.direction.elements;
    return (P[0] - A[0]) * D[0] + (P[1] - A[1]) * D[1] + ((P[2] || 0) - A[2]) * D[2];
  },

  // Returns true iff the line lies in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  // Returns the point on the line that is closest to the given point or line/line segment
  pointClosestTo: function(obj) {
    if (obj.start && obj.end) {
      // obj is a line segment
      var P = obj.pointClosestTo(this);
      return (P === null) ? null : this.pointClosestTo(P);
    } else if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = [x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1];
      var P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  // Returns a copy of the line with its direction vector reversed.
  // Useful when using lines for rotations.
  reverse: function() {
    return Line.create(this.anchor, this.direction.x(-1));
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  // Set the line's anchor point and direction.
  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(anchor);
    direction = Vector.create(direction);
    if (anchor.elements.length == 2) {anchor.elements.push(0); }
    if (direction.elements.length == 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

// Constructor function
Line.create = function(anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);

module.exports = Line;


/***/ }),

/***/ 8733:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
// Line.Segment class - depends on Line and its dependencies.

var Line = __webpack_require__(4165);
var Vector = __webpack_require__(7013);

Line.Segment = function() {};
Line.Segment.prototype = {

  // Returns true iff the line segment is equal to the argument
  eql: function(segment) {
    return (this.start.eql(segment.start) && this.end.eql(segment.end)) ||
        (this.start.eql(segment.end) && this.end.eql(segment.start));
  },

  // Returns a copy of the line segment
  dup: function() {
    return Line.Segment.create(this.start, this.end);
  },

  // Returns the length of the line segment
  length: function() {
    var A = this.start.elements, B = this.end.elements;
    var C1 = B[0] - A[0], C2 = B[1] - A[1], C3 = B[2] - A[2];
    return Math.sqrt(C1*C1 + C2*C2 + C3*C3);
  },

  // Returns the line segment as a vector equal to its
  // end point relative to its endpoint
  toVector: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
  },

  // Returns the segment's midpoint as a vector
  midpoint: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([(B[0] + A[0])/2, (B[1] + A[1])/2, (B[2] + A[2])/2]);
  },

  // Returns the plane that bisects the segment
  bisectingPlane: function() {
    return Plane.create(this.midpoint(), this.toVector());
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    var S = this.start.elements, E = this.end.elements;
    return Line.Segment.create(
      [S[0] + V[0], S[1] + V[1], S[2] + (V[2] || 0)],
      [E[0] + V[0], E[1] + V[1], E[2] + (V[2] || 0)]
    );
  },

  // Returns true iff the line segment is parallel to the argument. It simply forwards
  // the method call onto its line property.
  isParallelTo: function(obj) {
    return this.line.isParallelTo(obj);
  },

  // Returns the distance between the argument and the line segment's closest point to the argument
  distanceFrom: function(obj) {
    var P = this.pointClosestTo(obj);
    return (P === null) ? null : P.distanceFrom(obj);
  },

  // Returns true iff the given point lies on the segment
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var P = (obj.elements || obj).slice();
    if (P.length == 2) { P.push(0); }
    if (this.start.eql(P)) { return true; }
    var S = this.start.elements;
    var V = Vector.create([S[0] - P[0], S[1] - P[1], S[2] - (P[2] || 0)]);
    var vect = this.toVector();
    return V.isAntiparallelTo(vect) && V.modulus() <= vect.modulus();
  },

  // Returns true iff the line segment intersects the argument
  intersects: function(obj) {
    return (this.intersectionWith(obj) !== null);
  },

  // Returns the unique point of intersection with the argument
  intersectionWith: function(obj) {
    if (!this.line.intersects(obj)) { return null; }
    var P = this.line.intersectionWith(obj);
    return (this.contains(P) ? P : null);
  },

  // Returns the point on the line segment closest to the given object
  pointClosestTo: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var V = this.line.intersectionWith(obj);
      if (V === null) { return null; }
      return this.pointClosestTo(V);
    } else {
      // obj is a line (segment) or point
      var P = this.line.pointClosestTo(obj);
      if (P === null) { return null; }
      if (this.contains(P)) { return P; }
      return (this.line.positionOf(P) < 0 ? this.start : this.end).dup();
    }
  },

  // Set the start and end-points of the segment
  setPoints: function(startPoint, endPoint) {
    startPoint = Vector.create(startPoint).to3D();
    endPoint = Vector.create(endPoint).to3D();
    if (startPoint === null || endPoint === null) { return null; }
    this.line = Line.create(startPoint, endPoint.subtract(startPoint));
    this.start = startPoint;
    this.end = endPoint;
    return this;
  }
};

// Constructor function
Line.Segment.create = function(v1, v2) {
  var S = new Line.Segment();
  return S.setPoints(v1, v2);
};

module.exports = Line.Segment;


/***/ }),

/***/ 6976:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
// Matrix class - depends on Vector.

var fs = __webpack_require__(5375);
var Sylvester = __webpack_require__(7951);
var Vector = __webpack_require__(7013);

// augment a matrix M with identity rows/cols
function identSize(M, m, n, k) {
    var e = M.elements;
    var i = k - 1;

    while(i--) {
	var row = [];
	
	for(var j = 0; j < n; j++)
	    row.push(j == i ? 1 : 0);
	
        e.unshift(row);
    }
    
    for(var i = k - 1; i < m; i++) {
        while(e[i].length < n)
            e[i].unshift(0);
    }

    return $M(e);
}

function pca(X) {
    var Sigma = X.transpose().x(X).x(1 / X.rows());
    var svd = Sigma.svd();
    return {U: svd.U, S: svd.S};
}

function Matrix() {}
Matrix.prototype = {
    pcaProject: function(k, U) {
	var U = U || pca(this).U;
	var Ureduce= U.slice(1, U.rows(), 1, k);
	return {Z: this.x(Ureduce), U: U};
    },

    pcaRecover: function(U) {
	var k = this.cols();
	var Ureduce = U.slice(1, U.rows(), 1, k);
	return this.x(Ureduce.transpose());
    },    

    triu: function(k) {
	if(!k)
	    k = 0;
	
	return this.map(function(x, i, j) {
	    return j - i >= k ? x : 0;
	});
    },

    svd: function() {
	var A = this;
	var U = Matrix.I(A.rows());
	var S = A.transpose();
	var V = Matrix.I(A.cols());
	var err = Number.MAX_VALUE;
	var i = 0;
	var maxLoop = 100;

	while(err > 2.2737e-13 && i < maxLoop) {
	    var qr = S.transpose().qr();
	    S = qr.R;
	    U = U.x(qr.Q);
	    qr = S.transpose().qr();
	    V = V.x(qr.Q);
	    S = qr.R;

	    var e = S.triu(1).unroll().norm();
	    var f = S.diagonal().norm();

	    if(f == 0)
		f = 1;

	    err = e / f;

	    i++;
	}

	var ss = S.diagonal();
	var s = [];

	for(var i = 1; i <= ss.cols(); i++) {
	    var ssn = ss.e(i);
	    s.push(Math.abs(ssn));

	    if(ssn < 0) {
		for(var j = 0; j < U.rows(); j++) {
		    U.elements[j][i - 1] = -(U.elements[j][i - 1]);
		}
	    }
	}

	return {U: U, S: $V(s).toDiagonalMatrix(), V: V};
    },

    unroll: function() {
	var v = [];
	
	for(var i = 1; i <= this.cols(); i++) {
	    for(var j = 1; j <= this.rows(); j++) {
		v.push(this.e(j, i));
	    }
	}

	return $V(v);
    },

    qr: function() {
	var m = this.rows();
	var n = this.cols();
	var Q = Matrix.I(m);
	var A = this;
	
	for(var k = 1; k < Math.min(m, n); k++) {
	    var ak = A.slice(k, 0, k, k).col(1);
	    var oneZero = [1];
	    
	    while(oneZero.length <=  m - k)
		oneZero.push(0);
	    
	    oneZero = $V(oneZero);
	    var vk = ak.add(oneZero.x(ak.norm() * Math.sign(ak.e(1))));
	    var Vk = $M(vk);
	    var Hk = Matrix.I(m - k + 1).subtract(Vk.x(2).x(Vk.transpose()).div(Vk.transpose().x(Vk).e(1, 1)));
	    var Qk = identSize(Hk, m, n, k);
	    A = Qk.x(A);
	    Q = Q.x(Qk);
	}

	return {Q: Q, R: A};
    },


    slice: function(startRow, endRow, startCol, endCol) {
	var x = [];
	
	if(endRow == 0)
	    endRow = this.rows();
	
	if(endCol == 0)
	    endCol = this.cols();

	for(i = startRow; i <= endRow; i++) {
	    var row = [];

	    for(j = startCol; j <= endCol; j++) {
		row.push(this.e(i, j));
	    }

	    x.push(row);
	}

	return $M(x);
    },

    // Returns element (i,j) of the matrix
    e: function(i,j) {
	if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
	return this.elements[i - 1][j - 1];
    },

    // Returns row k of the matrix as a vector
    row: function(i) {
	if (i > this.elements.length) { return null; }
	return $V(this.elements[i - 1]);
    },

    // Returns column k of the matrix as a vector
    col: function(j) {
	if (j > this.elements[0].length) { return null; }
	var col = [], n = this.elements.length;
	for (var i = 0; i < n; i++) { col.push(this.elements[i][j - 1]); }
	return $V(col);
    },

    // Returns the number of rows/columns the matrix has
    dimensions: function() {
	return {rows: this.elements.length, cols: this.elements[0].length};
    },

    // Returns the number of rows in the matrix
    rows: function() {
	return this.elements.length;
    },

    // Returns the number of columns in the matrix
    cols: function() {
	return this.elements[0].length;
    },

    // Returns true iff the matrix is equal to the argument. You can supply
    // a vector as the argument, in which case the receiver must be a
    // one-column matrix equal to the vector.
    eql: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	if (this.elements.length != M.length ||
            this.elements[0].length != M[0].length) { return false; }
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      while (j--) {
			  if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
		      }
		    }
	return true;
    },

    // Returns a copy of the matrix
    dup: function() {
	return Matrix.create(this.elements);
    },

    // Maps the matrix to another matrix (of the same dimensions) according to the given function
    map: function(fn) {
    var els = [], i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      els[i] = [];
		      while (j--) {
			  els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
		      }
		    }
	return Matrix.create(els);
    },

    // Returns true iff the argument has the same dimensions as the matrix
    isSameSizeAs: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	return (this.elements.length == M.length &&
		this.elements[0].length == M[0].length);
    },

    // Returns the result of adding the argument to the matrix
    add: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x + matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x + M[i - 1][j - 1]; });
	}
    },

    // Returns the result of subtracting the argument from the matrix
    subtract: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x - matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x - M[i - 1][j - 1]; });
	}
    },

    // Returns true iff the matrix can multiply the argument from the left
    canMultiplyFromLeft: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	// this.columns should equal matrix.rows
	return (this.elements[0].length == M.length);
    },

    // Returns the result of a multiplication-style operation the matrix from the right by the argument.
    // If the argument is a scalar then just operate on all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    mulOp: function(matrix, op) {
	if (!matrix.elements) {
	    return this.map(function(x) { return op(x, matrix); });
	}

	var returnVector = matrix.modulus ? true : false;
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') 
	    M = Matrix.create(M).elements;
	if (!this.canMultiplyFromLeft(M)) 
	    return null; 
	var e = this.elements, rowThis, rowElem, elements = [],
        sum, m = e.length, n = M[0].length, o = e[0].length, i = m, j, k;

	while (i--) {
            rowElem = [];
            rowThis = e[i];
            j = n;

            while (j--) {
		sum = 0;
		k = o;

		while (k--) {
                    sum += op(rowThis[k], M[k][j]);
		}

		rowElem[j] = sum;
            }

            elements[i] = rowElem;
	}

	var M = Matrix.create(elements);
	return returnVector ? M.col(1) : M;
    },

    // Returns the result of dividing the matrix from the right by the argument.
    // If the argument is a scalar then just divide all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    div: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x / y});
    },

    // Returns the result of multiplying the matrix from the right by the argument.
    // If the argument is a scalar then just multiply all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    multiply: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x * y});
    },

    x: function(matrix) { return this.multiply(matrix); },

    elementMultiply: function(v) {
        return this.map(function(k, i, j) {
            return v.e(i, j) * k;
        });
    },

    sum: function() {
        var sum = 0;

        this.map(function(x) { sum += x;});

        return sum;
    },

    // Returns a Vector of each colum averaged.
    mean: function() {
      var dim = this.dimensions();
      var r = [];
      for (var i = 1; i <= dim.cols; i++) {
        r.push(this.col(i).sum() / dim.rows);
      }
      return $V(r);
    },

    column: function(n) {
	return this.col(n);
    },

    log: function() {
	return this.map(function(x) { return Math.log(x); });
    },

    // Returns a submatrix taken from the matrix
    // Argument order is: start row, start col, nrows, ncols
    // Element selection wraps if the required index is outside the matrix's bounds, so you could
    // use this to perform row/column cycling or copy-augmenting.
    minor: function(a, b, c, d) {
	var elements = [], ni = c, i, nj, j;
	var rows = this.elements.length, cols = this.elements[0].length;
	while (ni--) {
	    i = c - ni - 1;
	    elements[i] = [];
	    nj = d;
	    while (nj--) {
		j = d - nj - 1;
		elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns the transpose of the matrix
    transpose: function() {
    var rows = this.elements.length, i, cols = this.elements[0].length, j;
	var elements = [], i = cols;
	while (i--) {
	    j = rows;
	    elements[i] = [];
	    while (j--) {
		elements[i][j] = this.elements[j][i];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns true iff the matrix is square
    isSquare: function() {
	return (this.elements.length == this.elements[0].length);
    },

    // Returns the (absolute) largest element of the matrix
    max: function() {
	var m = 0, i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
	    }
	}
	return m;
    },

    // Returns the indeces of the first match found by reading row-by-row from left to right
    indexOf: function(x) {
	var index = null, ni = this.elements.length, i, nj = this.elements[0].length, j;
	for (i = 0; i < ni; i++) {
	    for (j = 0; j < nj; j++) {
		if (this.elements[i][j] == x) { return {i: i + 1, j: j + 1}; }
	    }
	}
	return null;
    },

    // If the matrix is square, returns the diagonal elements as a vector.
    // Otherwise, returns null.
    diagonal: function() {
	if (!this.isSquare) { return null; }
	var els = [], n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    els.push(this.elements[i][i]);
	}
	return $V(els);
    },

    // Make the matrix upper (right) triangular by Gaussian elimination.
    // This method only adds multiples of rows to other rows. No rows are
    // scaled up or switched, and the determinant is preserved.
    toRightTriangular: function() {
	var M = this.dup(), els;
	var n = this.elements.length, i, j, np = this.elements[0].length, p;
	for (i = 0; i < n; i++) {
	    if (M.elements[i][i] == 0) {
		for (j = i + 1; j < n; j++) {
		    if (M.elements[j][i] != 0) {
			els = [];
			for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
			M.elements[i] = els;
			break;
		    }
		}
	    }
	    if (M.elements[i][i] != 0) {
		for (j = i + 1; j < n; j++) {
		    var multiplier = M.elements[j][i] / M.elements[i][i];
		    els = [];
		    for (p = 0; p < np; p++) {
			// Elements with column numbers up to an including the number
			// of the row that we're subtracting can safely be set straight to
			// zero, since that's the point of this routine and it avoids having
			// to loop over and correct rounding errors later
			els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
		    }
		    M.elements[j] = els;
		}
	    }
	}
	return M;
    },

    toUpperTriangular: function() { return this.toRightTriangular(); },

    // Returns the determinant for square matrices
    determinant: function() {
	if (!this.isSquare()) { return null; }
	if (this.cols == 1 && this.rows == 1) { return this.row(1); }
	if (this.cols == 0 && this.rows == 0) { return 1; }
	var M = this.toRightTriangular();
	var det = M.elements[0][0], n = M.elements.length;
	for (var i = 1; i < n; i++) {
	    det = det * M.elements[i][i];
	}
	return det;
    },
    det: function() { return this.determinant(); },

    // Returns true iff the matrix is singular
    isSingular: function() {
	return (this.isSquare() && this.determinant() === 0);
    },

    // Returns the trace for square matrices
    trace: function() {
	if (!this.isSquare()) { return null; }
	var tr = this.elements[0][0], n = this.elements.length;
	for (var i = 1; i < n; i++) {
	    tr += this.elements[i][i];
	}
	return tr;
    },

    tr: function() { return this.trace(); },

    // Returns the rank of the matrix
    rank: function() {
	var M = this.toRightTriangular(), rank = 0;
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
	    }
	}
	return rank;
    },

    rk: function() { return this.rank(); },

    // Returns the result of attaching the given argument to the right-hand side of the matrix
    augment: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	var T = this.dup(), cols = T.elements[0].length;
	var i = T.elements.length, nj = M[0].length, j;
	if (i != M.length) { return null; }
	while (i--) {
	    j = nj;
	    while (j--) {
		T.elements[i][cols + j] = M[i][j];
	    }
	}
	return T;
    },

    // Returns the inverse (if one exists) using Gauss-Jordan
    inverse: function() {
	if (!this.isSquare() || this.isSingular()) { return null; }
	var n = this.elements.length, i = n, j;
	var M = this.augment(Matrix.I(n)).toRightTriangular();
	var np = M.elements[0].length, p, els, divisor;
	var inverse_elements = [], new_element;
	// Matrix is non-singular so there will be no zeros on the diagonal
	// Cycle through rows from last to first
	while (i--) {
	    // First, normalise diagonal elements to 1
	    els = [];
	    inverse_elements[i] = [];
	    divisor = M.elements[i][i];
	    for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
		els.push(new_element);
		// Shuffle off the current row of the right hand side into the results
		// array as it will not be modified by later runs through this loop
		if (p >= n) { inverse_elements[i].push(new_element); }
	    }
	    M.elements[i] = els;
	    // Then, subtract this row from those above it to
	    // give the identity matrix on the left hand side
	    j = i;
	    while (j--) {
		els = [];
		for (p = 0; p < np; p++) {
		    els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
		}
		M.elements[j] = els;
	    }
	}
	return Matrix.create(inverse_elements);
    },

    inv: function() { return this.inverse(); },

    // Returns the result of rounding all the elements
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Returns a copy of the matrix with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(p) {
	    return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
	});
    },

    // Returns a string representation of the matrix
    inspect: function() {
	var matrix_rows = [];
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    matrix_rows.push($V(this.elements[i]).inspect());
	}
	return matrix_rows.join('\n');
    },

    // Returns a array representation of the matrix
    toArray: function() {
    	var matrix_rows = [];
    	var n = this.elements.length;
    	for (var i = 0; i < n; i++) {
        matrix_rows.push(this.elements[i]);
    	}
      return matrix_rows;
    },


    // Set the matrix's elements from an array. If the argument passed
    // is a vector, the resulting matrix will be a single column.
    setElements: function(els) {
	var i, j, elements = els.elements || els;
	if (typeof(elements[0][0]) != 'undefined') {
	    i = elements.length;
	    this.elements = [];
	    while (i--) {
		j = elements[i].length;
		this.elements[i] = [];
		while (j--) {
		    this.elements[i][j] = elements[i][j];
		}
	    }
	    return this;
	}
	var n = elements.length;
	this.elements = [];
	for (i = 0; i < n; i++) {
	    this.elements.push([elements[i]]);
	}
	return this;
    },

    maxColumnIndexes: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;
	    var maxIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		    maxIndex = j;
		}
	    }

	    maxes.push(maxIndex);
	}

	return $V(maxes);
    },

    maxColumns: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		}
	    }

	    maxes.push(max);
	}

	return $V(maxes);
    },

    minColumnIndexes: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;
	    var minIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		    minIndex = j;
		}
	    }

	    mins.push(minIndex);
	}

	return $V(mins);
    },

    minColumns: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		}
	    }

	    mins.push(min);
	}

	return $V(mins);
    }
};

// Constructor function
Matrix.create = function(elements) {
    var M = new Matrix();
    return M.setElements(elements);
};

// Identity matrix of size n
Matrix.I = function(n) {
    var els = [], i = n, j;
    while (i--) {
	j = n;
	els[i] = [];
	while (j--) {
	    els[i][j] = (i == j) ? 1 : 0;
	}
    }
    return Matrix.create(els);
};

Matrix.loadFile = function(file) {
    var contents = fs.readFileSync(file, 'utf-8');
    var matrix = [];

    var rowArray = contents.split('\n');
    for (var i = 0; i < rowArray.length; i++) {
	var d = rowArray[i].split(',');
	if (d.length > 1) {
	    matrix.push(d);
	}
    }

    var M = new Matrix();
    return M.setElements(matrix);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.Diagonal = function(elements) {
    var i = elements.length;
    var M = Matrix.I(i);
    while (i--) {
	M.elements[i][i] = elements[i];
    }
    return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.Rotation = function(theta, a) {
    if (!a) {
	return Matrix.create([
	    [Math.cos(theta), -Math.sin(theta)],
	    [Math.sin(theta), Math.cos(theta)]
	]);
  }
    var axis = a.dup();
    if (axis.elements.length != 3) { return null; }
    var mod = axis.modulus();
    var x = axis.elements[0] / mod, y = axis.elements[1] / mod, z = axis.elements[2] / mod;
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
    // That proof rotates the co-ordinate system so theta
    // becomes -theta and sin becomes -sin here.
    return Matrix.create([
	[t * x * x + c, t * x * y - s * z, t * x * z + s * y],
	[t * x * y + s * z, t * y * y + c, t * y * z - s * x],
	[t * x * z - s * y, t * y * z + s * x, t * z * z + c]
    ]);
};

// Special case rotations
Matrix.RotationX = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[1, 0, 0],
	[0, c, -s],
	[0, s, c]
    ]);
};

Matrix.RotationY = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, 0, s],
	[0, 1, 0],
	[-s, 0, c]
    ]);
};

Matrix.RotationZ = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, -s, 0],
	[s, c, 0],
	[0, 0, 1]
    ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function(n, m) {
    if (arguments.length === 1) m = n;
    return Matrix.Zero(n, m).map(
	function() { return Math.random(); }
  );
};

Matrix.Fill = function(n, m, v) {
    if (arguments.length === 2) {
	v = m;
	m = n;
    }

    var els = [], i = n, j;

    while (i--) {
	j = m;
	els[i] = [];

	while (j--) {
	    els[i][j] = v;
	}
    }

    return Matrix.create(els);
};

// Matrix filled with zeros
Matrix.Zero = function(n, m) {
    return Matrix.Fill(n, m, 0);
};

// Matrix filled with zeros
Matrix.Zeros = function(n, m) {
    return Matrix.Zero(n, m);
};

// Matrix filled with ones
Matrix.One = function(n, m) {
    return Matrix.Fill(n, m, 1);
};

// Matrix filled with ones
Matrix.Ones = function(n, m) {
    return Matrix.One(n, m);
};

module.exports = Matrix;


/***/ }),

/***/ 5467:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
// Plane class - depends on Vector. Some methods require Matrix and Line.
var Vector = __webpack_require__(7013);
var Matrix = __webpack_require__(6976);
var Line = __webpack_require__(4165);

var Sylvester = __webpack_require__(7951);

function Plane() {}
Plane.prototype = {

  // Returns true iff the plane occupies the same space as the argument
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function() {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function(vector) {
    var V = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },

  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  // Returns true iff the plane contains the given point or line
  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Line.create(anchor, direction);
    }
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function(t, line) {
    var R = t.determinant ? t.elements : Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function(anchor, v1, v2) {
    anchor = Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) == 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function(anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

// Returns the plane containing the given points (can be arrays as
// well as vectors). If the points are not coplanar, returns null.
Plane.fromPoints = function(points) {
  var np = points.length, list = [], i, P, n, N, A, B, C, D, theta, prevN, totalN = Vector.Zero(3);
  for (i = 0; i < np; i++) {
    P = Vector.create(points[i]).to3D();
    if (P === null) { return null; }
    list.push(P);
    n = list.length;
    if (n > 2) {
      // Compute plane normal for the latest three points
      A = list[n-1].elements; B = list[n-2].elements; C = list[n-3].elements;
      N = Vector.create([
        (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
        (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
        (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
      ]).toUnitVector();
      if (n > 3) {
        // If the latest normal is not (anti)parallel to the previous one, we've strayed off the plane.
        // This might be a slightly long-winded way of doing things, but we need the sum of all the normals
        // to find which way the plane normal should point so that the points form an anticlockwise list.
        theta = N.angleFrom(prevN);
        if (theta !== null) {
          if (!(Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision)) { return null; }
        }
      }
      totalN = totalN.add(N);
      prevN = N;
    }
  }
  // We need to add in the normals at the start and end points, which the above misses out
  A = list[1].elements; B = list[0].elements; C = list[n-1].elements; D = list[n-2].elements;
  totalN = totalN.add(Vector.create([
    (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
    (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
    (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
  ]).toUnitVector()).add(Vector.create([
    (B[1] - C[1]) * (D[2] - C[2]) - (B[2] - C[2]) * (D[1] - C[1]),
    (B[2] - C[2]) * (D[0] - C[0]) - (B[0] - C[0]) * (D[2] - C[2]),
    (B[0] - C[0]) * (D[1] - C[1]) - (B[1] - C[1]) * (D[0] - C[0])
  ]).toUnitVector());
  return Plane.create(list[0], totalN);
};

module.exports = Plane;


/***/ }),

/***/ 7951:
/***/ ((module) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.           

Math.sign = function(x) {
    return x < 0 ? -1: 1;
}
                                              
var Sylvester = {
    precision: 1e-6
};

module.exports = Sylvester;


/***/ }),

/***/ 7013:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.

var Sylvester = __webpack_require__(7951),
Matrix = __webpack_require__(6976);

function Vector() {}
Vector.prototype = {

    norm: function() {
	var n = this.elements.length;
	var sum = 0;

	while (n--) {
	    sum += Math.pow(this.elements[n], 2);
	}

	return Math.sqrt(sum);
    },

    // Returns element i of the vector
    e: function(i) {
      return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
    },

    // Returns the number of rows/columns the vector has
    dimensions: function() {
      return {rows: 1, cols: this.elements.length};
    },

    // Returns the number of rows in the vector
    rows: function() {
      return 1;
    },

    // Returns the number of columns in the vector
    cols: function() {
      return this.elements.length;
    },

    // Returns the modulus ('length') of the vector
    modulus: function() {
      return Math.sqrt(this.dot(this));
    },

    // Returns true iff the vector is equal to the argument
    eql: function(vector) {
    	var n = this.elements.length;
    	var V = vector.elements || vector;
    	if (n != V.length) { return false; }
    	while (n--) {
    	    if (Math.abs(this.elements[n] - V[n]) > Sylvester.precision) { return false; }
    	}
    	return true;
    },

    // Returns a copy of the vector
    dup: function() {
	    return Vector.create(this.elements);
    },

    // Maps the vector to another vector according to the given function
    map: function(fn) {
	var elements = [];
	this.each(function(x, i) {
	    elements.push(fn(x, i));
	});
	return Vector.create(elements);
    },

    // Calls the iterator for each element of the vector in turn
    each: function(fn) {
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    fn(this.elements[i], i + 1);
	}
    },

    // Returns a new vector created by normalizing the receiver
    toUnitVector: function() {
	var r = this.modulus();
	if (r === 0) { return this.dup(); }
	return this.map(function(x) { return x / r; });
    },

    // Returns the angle between the vector and the argument (also a vector)
    angleFrom: function(vector) {
	var V = vector.elements || vector;
	var n = this.elements.length, k = n, i;
	if (n != V.length) { return null; }
	var dot = 0, mod1 = 0, mod2 = 0;
	// Work things out in parallel to save time
	this.each(function(x, i) {
	    dot += x * V[i - 1];
	    mod1 += x * x;
	    mod2 += V[i - 1] * V[i - 1];
	});
	mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
	if (mod1 * mod2 === 0) { return null; }
	var theta = dot / (mod1 * mod2);
	if (theta < -1) { theta = -1; }
	if (theta > 1) { theta = 1; }
	return Math.acos(theta);
    },

    // Returns true iff the vector is parallel to the argument
    isParallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (angle <= Sylvester.precision);
    },

    // Returns true iff the vector is antiparallel to the argument
    isAntiparallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
    },

    // Returns true iff the vector is perpendicular to the argument
    isPerpendicularTo: function(vector) {
	var dot = this.dot(vector);
	return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
    },

    // Returns the result of adding the argument to the vector
    add: function(value) {
	var V = value.elements || value;

	if (this.elements.length != V.length) 
	    return this.map(function(v) { return v + value });
	else
	    return this.map(function(x, i) { return x + V[i - 1]; });
    },

    // Returns the result of subtracting the argument from the vector
    subtract: function(v) {
	if (typeof(v) == 'number')
	    return this.map(function(k) { return k - v; });

	var V = v.elements || v;
	if (this.elements.length != V.length) { return null; }
	return this.map(function(x, i) { return x - V[i - 1]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    multiply: function(k) {
	return this.map(function(x) { return x * k; });
    },

    elementMultiply: function(v) {
	return this.map(function(k, i) {
	    return v.e(i) * k;
	});
    },

    sum: function() {
	var sum = 0;
	this.map(function(x) { sum += x;});
	return sum;
    },

    chomp: function(n) {
	var elements = [];

	for (var i = n; i < this.elements.length; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    top: function(n) {
	var elements = [];

	for (var i = 0; i < n; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    augment: function(elements) {
	var newElements = this.elements;

	for (var i = 0; i < elements.length; i++) {
	    newElements.push(elements[i]);
	}

	return Vector.create(newElements);
    },

    x: function(k) { return this.multiply(k); },

    log: function() {
	return Vector.log(this);
    },

    elementDivide: function(vector) {
	return this.map(function(v, i) {
	    return v / vector.e(i);
	});
    },

    product: function() {
	var p = 1;

	this.map(function(v) {
	    p *= v;
	});

	return p;
    },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot: function(vector) {
	var V = vector.elements || vector;
	var i, product = 0, n = this.elements.length;	
	if (n != V.length) { return null; }
	while (n--) { product += this.elements[n] * V[n]; }
	return product;
    },

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    cross: function(vector) {
	var B = vector.elements || vector;
	if (this.elements.length != 3 || B.length != 3) { return null; }
	var A = this.elements;
	return Vector.create([
	    (A[1] * B[2]) - (A[2] * B[1]),
	    (A[2] * B[0]) - (A[0] * B[2]),
	    (A[0] * B[1]) - (A[1] * B[0])
	]);
    },

    // Returns the (absolute) largest element of the vector
    max: function() {
	var m = 0, i = this.elements.length;
	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
	}
	return m;
    },


    maxIndex: function() {
	var m = 0, i = this.elements.length;
	var maxIndex = -1;

	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { 
		m = this.elements[i]; 
		maxIndex = i + 1;
	    }
	}

	return maxIndex;
    },


    // Returns the index of the first match found
    indexOf: function(x) {
	var index = null, n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    if (index === null && this.elements[i] == x) {
		index = i + 1;
	    }
	}
	return index;
    },

    // Returns a diagonal matrix with the vector's elements as its diagonal elements
    toDiagonalMatrix: function() {
	return Matrix.Diagonal(this.elements);
    },

    // Returns the result of rounding the elements of the vector
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Transpose a Vector, return a 1xn Matrix
    transpose: function() {
	var rows = this.elements.length;
	var elements = [];

	for (var i = 0; i < rows; i++) {
	    elements.push([this.elements[i]]);
	}
	return Matrix.create(elements);
    },

    // Returns a copy of the vector with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(y) {
	    return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
	});
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceFrom: function(obj) {
	if (obj.anchor || (obj.start && obj.end)) { return obj.distanceFrom(this); }
	var V = obj.elements || obj;
	if (V.length != this.elements.length) { return null; }
	var sum = 0, part;
	this.each(function(x, i) {
	    part = x - V[i - 1];
	    sum += part * part;
	});
	return Math.sqrt(sum);
    },

    // Returns true if the vector is point on the given line
    liesOn: function(line) {
	return line.contains(this);
    },

    // Return true iff the vector is a point in the given plane
    liesIn: function(plane) {
	return plane.contains(this);
    },

    // Rotates the vector about the given object. The object should be a
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    rotate: function(t, obj) {
	var V, R = null, x, y, z;
	if (t.determinant) { R = t.elements; }
	switch (this.elements.length) {
	case 2:
            V = obj.elements || obj;
            if (V.length != 2) { return null; }
            if (!R) { R = Matrix.Rotation(t).elements; }
            x = this.elements[0] - V[0];
            y = this.elements[1] - V[1];
            return Vector.create([
		V[0] + R[0][0] * x + R[0][1] * y,
		V[1] + R[1][0] * x + R[1][1] * y
            ]);
            break;
	case 3:
            if (!obj.direction) { return null; }
            var C = obj.pointClosestTo(this).elements;
            if (!R) { R = Matrix.Rotation(t, obj.direction).elements; }
            x = this.elements[0] - C[0];
            y = this.elements[1] - C[1];
            z = this.elements[2] - C[2];
            return Vector.create([
		C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
		C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
		C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
            ]);
            break;
	default:
            return null;
	}
    },

    // Returns the result of reflecting the point in the given point, line or plane
    reflectionIn: function(obj) {
	if (obj.anchor) {
	    // obj is a plane or line
	    var P = this.elements.slice();
	    var C = obj.pointClosestTo(P).elements;
	    return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
	} else {
	    // obj is a point
	    var Q = obj.elements || obj;
	    if (this.elements.length != Q.length) { return null; }
	    return this.map(function(x, i) { return Q[i - 1] + (Q[i - 1] - x); });
	}
    },

    // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
    to3D: function() {
	var V = this.dup();
	switch (V.elements.length) {
	case 3: break;
	case 2: V.elements.push(0); break;
	default: return null;
	}
	return V;
    },

    // Returns a string representation of the vector
    inspect: function() {
	return '[' + this.elements.join(', ') + ']';
    },

    // Set vector's elements from an array
    setElements: function(els) {
	this.elements = (els.elements || els).slice();
	return this;
    }
};

// Constructor function
Vector.create = function(elements) {
    var V = new Vector();
    return V.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1, 0, 0]);
Vector.j = Vector.create([0, 1, 0]);
Vector.k = Vector.create([0, 0, 1]);

// Random vector of size n
Vector.Random = function(n) {
    var elements = [];
    while (n--) { elements.push(Math.random()); }
    return Vector.create(elements);
};

Vector.Fill = function(n, v) {
    var elements = [];
    while (n--) { elements.push(v); }
    return Vector.create(elements);
};

// Vector filled with zeros
Vector.Zero = function(n) {
    return Vector.Fill(n, 0);
};

Vector.One = function(n) {
    return Vector.Fill(n, 1);
};

Vector.log = function(v) {
    return v.map(function(x) {
	return Math.log(x);
    });
};

module.exports = Vector;


/***/ }),

/***/ 384:
/***/ ((module) => {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ 5955:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9



var isArgumentsObject = __webpack_require__(2584);
var isGeneratorFunction = __webpack_require__(8662);
var whichTypedArray = __webpack_require__(6430);
var isTypedArray = __webpack_require__(5692);

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});


/***/ }),

/***/ 9539:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (undefined) {
  var debugEnv = undefined;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = __webpack_require__(5955);

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(384);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(5717);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;


/***/ }),

/***/ 6430:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var forEach = __webpack_require__(9804);
var availableTypedArrays = __webpack_require__(3083);
var callBound = __webpack_require__(1924);

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = __webpack_require__(6410)();

var g = typeof globalThis === 'undefined' ? __webpack_require__.g : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = __webpack_require__(882);
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof g[typedArray] === 'function') {
			var arr = new g[typedArray]();
			if (Symbol.toStringTag in arr) {
				var proto = getPrototypeOf(arr);
				var descriptor = gOPD(proto, Symbol.toStringTag);
				if (!descriptor) {
					var superProto = getPrototypeOf(proto);
					descriptor = gOPD(superProto, Symbol.toStringTag);
				}
				toStrTags[typedArray] = descriptor.get;
			}
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = __webpack_require__(5692);

module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};


/***/ }),

/***/ 2453:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __dirname = "/";

exports.libVersion = __webpack_require__(7097).version;
exports.version = '3.1';	// this is the WordNet DB version
exports.path = __webpack_require__(6470).join(__dirname, 'dict');
try{
exports.files = __webpack_require__(9495).readdirSync(exports.path);
} catch(e) {
  console.log(e.message);
}


/***/ }),

/***/ 4195:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 9603:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 8340:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 8493:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 403:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 5375:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 9495:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 3083:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g = typeof globalThis === 'undefined' ? __webpack_require__.g : globalThis;

module.exports = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};


/***/ }),

/***/ 882:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(210);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;


/***/ }),

/***/ 6419:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

!function(n,r){ true?module.exports=r():0}(this,(function(){
//     Underscore.js 1.13.1
//     https://underscorejs.org
//     (c) 2009-2021 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
var n="1.13.1",r="object"==typeof self&&self.self===self&&self||"object"==typeof __webpack_require__.g&&__webpack_require__.g.global===__webpack_require__.g&&__webpack_require__.g||Function("return this")()||{},t=Array.prototype,e=Object.prototype,u="undefined"!=typeof Symbol?Symbol.prototype:null,o=t.push,i=t.slice,a=e.toString,f=e.hasOwnProperty,c="undefined"!=typeof ArrayBuffer,l="undefined"!=typeof DataView,s=Array.isArray,p=Object.keys,v=Object.create,h=c&&ArrayBuffer.isView,y=isNaN,d=isFinite,g=!{toString:null}.propertyIsEnumerable("toString"),b=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],m=Math.pow(2,53)-1;function j(n,r){return r=null==r?n.length-1:+r,function(){for(var t=Math.max(arguments.length-r,0),e=Array(t),u=0;u<t;u++)e[u]=arguments[u+r];switch(r){case 0:return n.call(this,e);case 1:return n.call(this,arguments[0],e);case 2:return n.call(this,arguments[0],arguments[1],e)}var o=Array(r+1);for(u=0;u<r;u++)o[u]=arguments[u];return o[r]=e,n.apply(this,o)}}function _(n){var r=typeof n;return"function"===r||"object"===r&&!!n}function w(n){return void 0===n}function A(n){return!0===n||!1===n||"[object Boolean]"===a.call(n)}function x(n){var r="[object "+n+"]";return function(n){return a.call(n)===r}}var S=x("String"),O=x("Number"),M=x("Date"),E=x("RegExp"),B=x("Error"),N=x("Symbol"),I=x("ArrayBuffer"),T=x("Function"),k=r.document&&r.document.childNodes; true&&"object"!=typeof Int8Array&&"function"!=typeof k&&(T=function(n){return"function"==typeof n||!1});var D=T,R=x("Object"),F=l&&R(new DataView(new ArrayBuffer(8))),V="undefined"!=typeof Map&&R(new Map),P=x("DataView");var q=F?function(n){return null!=n&&D(n.getInt8)&&I(n.buffer)}:P,U=s||x("Array");function W(n,r){return null!=n&&f.call(n,r)}var z=x("Arguments");!function(){z(arguments)||(z=function(n){return W(n,"callee")})}();var L=z;function $(n){return O(n)&&y(n)}function C(n){return function(){return n}}function K(n){return function(r){var t=n(r);return"number"==typeof t&&t>=0&&t<=m}}function J(n){return function(r){return null==r?void 0:r[n]}}var G=J("byteLength"),H=K(G),Q=/\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;var X=c?function(n){return h?h(n)&&!q(n):H(n)&&Q.test(a.call(n))}:C(!1),Y=J("length");function Z(n,r){r=function(n){for(var r={},t=n.length,e=0;e<t;++e)r[n[e]]=!0;return{contains:function(n){return r[n]},push:function(t){return r[t]=!0,n.push(t)}}}(r);var t=b.length,u=n.constructor,o=D(u)&&u.prototype||e,i="constructor";for(W(n,i)&&!r.contains(i)&&r.push(i);t--;)(i=b[t])in n&&n[i]!==o[i]&&!r.contains(i)&&r.push(i)}function nn(n){if(!_(n))return[];if(p)return p(n);var r=[];for(var t in n)W(n,t)&&r.push(t);return g&&Z(n,r),r}function rn(n,r){var t=nn(r),e=t.length;if(null==n)return!e;for(var u=Object(n),o=0;o<e;o++){var i=t[o];if(r[i]!==u[i]||!(i in u))return!1}return!0}function tn(n){return n instanceof tn?n:this instanceof tn?void(this._wrapped=n):new tn(n)}function en(n){return new Uint8Array(n.buffer||n,n.byteOffset||0,G(n))}tn.VERSION=n,tn.prototype.value=function(){return this._wrapped},tn.prototype.valueOf=tn.prototype.toJSON=tn.prototype.value,tn.prototype.toString=function(){return String(this._wrapped)};var un="[object DataView]";function on(n,r,t,e){if(n===r)return 0!==n||1/n==1/r;if(null==n||null==r)return!1;if(n!=n)return r!=r;var o=typeof n;return("function"===o||"object"===o||"object"==typeof r)&&function n(r,t,e,o){r instanceof tn&&(r=r._wrapped);t instanceof tn&&(t=t._wrapped);var i=a.call(r);if(i!==a.call(t))return!1;if(F&&"[object Object]"==i&&q(r)){if(!q(t))return!1;i=un}switch(i){case"[object RegExp]":case"[object String]":return""+r==""+t;case"[object Number]":return+r!=+r?+t!=+t:0==+r?1/+r==1/t:+r==+t;case"[object Date]":case"[object Boolean]":return+r==+t;case"[object Symbol]":return u.valueOf.call(r)===u.valueOf.call(t);case"[object ArrayBuffer]":case un:return n(en(r),en(t),e,o)}var f="[object Array]"===i;if(!f&&X(r)){if(G(r)!==G(t))return!1;if(r.buffer===t.buffer&&r.byteOffset===t.byteOffset)return!0;f=!0}if(!f){if("object"!=typeof r||"object"!=typeof t)return!1;var c=r.constructor,l=t.constructor;if(c!==l&&!(D(c)&&c instanceof c&&D(l)&&l instanceof l)&&"constructor"in r&&"constructor"in t)return!1}o=o||[];var s=(e=e||[]).length;for(;s--;)if(e[s]===r)return o[s]===t;if(e.push(r),o.push(t),f){if((s=r.length)!==t.length)return!1;for(;s--;)if(!on(r[s],t[s],e,o))return!1}else{var p,v=nn(r);if(s=v.length,nn(t).length!==s)return!1;for(;s--;)if(p=v[s],!W(t,p)||!on(r[p],t[p],e,o))return!1}return e.pop(),o.pop(),!0}(n,r,t,e)}function an(n){if(!_(n))return[];var r=[];for(var t in n)r.push(t);return g&&Z(n,r),r}function fn(n){var r=Y(n);return function(t){if(null==t)return!1;var e=an(t);if(Y(e))return!1;for(var u=0;u<r;u++)if(!D(t[n[u]]))return!1;return n!==hn||!D(t[cn])}}var cn="forEach",ln="has",sn=["clear","delete"],pn=["get",ln,"set"],vn=sn.concat(cn,pn),hn=sn.concat(pn),yn=["add"].concat(sn,cn,ln),dn=V?fn(vn):x("Map"),gn=V?fn(hn):x("WeakMap"),bn=V?fn(yn):x("Set"),mn=x("WeakSet");function jn(n){for(var r=nn(n),t=r.length,e=Array(t),u=0;u<t;u++)e[u]=n[r[u]];return e}function _n(n){for(var r={},t=nn(n),e=0,u=t.length;e<u;e++)r[n[t[e]]]=t[e];return r}function wn(n){var r=[];for(var t in n)D(n[t])&&r.push(t);return r.sort()}function An(n,r){return function(t){var e=arguments.length;if(r&&(t=Object(t)),e<2||null==t)return t;for(var u=1;u<e;u++)for(var o=arguments[u],i=n(o),a=i.length,f=0;f<a;f++){var c=i[f];r&&void 0!==t[c]||(t[c]=o[c])}return t}}var xn=An(an),Sn=An(nn),On=An(an,!0);function Mn(n){if(!_(n))return{};if(v)return v(n);var r=function(){};r.prototype=n;var t=new r;return r.prototype=null,t}function En(n){return _(n)?U(n)?n.slice():xn({},n):n}function Bn(n){return U(n)?n:[n]}function Nn(n){return tn.toPath(n)}function In(n,r){for(var t=r.length,e=0;e<t;e++){if(null==n)return;n=n[r[e]]}return t?n:void 0}function Tn(n,r,t){var e=In(n,Nn(r));return w(e)?t:e}function kn(n){return n}function Dn(n){return n=Sn({},n),function(r){return rn(r,n)}}function Rn(n){return n=Nn(n),function(r){return In(r,n)}}function Fn(n,r,t){if(void 0===r)return n;switch(null==t?3:t){case 1:return function(t){return n.call(r,t)};case 3:return function(t,e,u){return n.call(r,t,e,u)};case 4:return function(t,e,u,o){return n.call(r,t,e,u,o)}}return function(){return n.apply(r,arguments)}}function Vn(n,r,t){return null==n?kn:D(n)?Fn(n,r,t):_(n)&&!U(n)?Dn(n):Rn(n)}function Pn(n,r){return Vn(n,r,1/0)}function qn(n,r,t){return tn.iteratee!==Pn?tn.iteratee(n,r):Vn(n,r,t)}function Un(){}function Wn(n,r){return null==r&&(r=n,n=0),n+Math.floor(Math.random()*(r-n+1))}tn.toPath=Bn,tn.iteratee=Pn;var zn=Date.now||function(){return(new Date).getTime()};function Ln(n){var r=function(r){return n[r]},t="(?:"+nn(n).join("|")+")",e=RegExp(t),u=RegExp(t,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,r):n}}var $n={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},Cn=Ln($n),Kn=Ln(_n($n)),Jn=tn.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g},Gn=/(.)^/,Hn={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},Qn=/\\|'|\r|\n|\u2028|\u2029/g;function Xn(n){return"\\"+Hn[n]}var Yn=/^\s*(\w|\$)+\s*$/;var Zn=0;function nr(n,r,t,e,u){if(!(e instanceof r))return n.apply(t,u);var o=Mn(n.prototype),i=n.apply(o,u);return _(i)?i:o}var rr=j((function(n,r){var t=rr.placeholder,e=function(){for(var u=0,o=r.length,i=Array(o),a=0;a<o;a++)i[a]=r[a]===t?arguments[u++]:r[a];for(;u<arguments.length;)i.push(arguments[u++]);return nr(n,e,this,this,i)};return e}));rr.placeholder=tn;var tr=j((function(n,r,t){if(!D(n))throw new TypeError("Bind must be called on a function");var e=j((function(u){return nr(n,e,r,this,t.concat(u))}));return e})),er=K(Y);function ur(n,r,t,e){if(e=e||[],r||0===r){if(r<=0)return e.concat(n)}else r=1/0;for(var u=e.length,o=0,i=Y(n);o<i;o++){var a=n[o];if(er(a)&&(U(a)||L(a)))if(r>1)ur(a,r-1,t,e),u=e.length;else for(var f=0,c=a.length;f<c;)e[u++]=a[f++];else t||(e[u++]=a)}return e}var or=j((function(n,r){var t=(r=ur(r,!1,!1)).length;if(t<1)throw new Error("bindAll must be passed function names");for(;t--;){var e=r[t];n[e]=tr(n[e],n)}return n}));var ir=j((function(n,r,t){return setTimeout((function(){return n.apply(null,t)}),r)})),ar=rr(ir,tn,1);function fr(n){return function(){return!n.apply(this,arguments)}}function cr(n,r){var t;return function(){return--n>0&&(t=r.apply(this,arguments)),n<=1&&(r=null),t}}var lr=rr(cr,2);function sr(n,r,t){r=qn(r,t);for(var e,u=nn(n),o=0,i=u.length;o<i;o++)if(r(n[e=u[o]],e,n))return e}function pr(n){return function(r,t,e){t=qn(t,e);for(var u=Y(r),o=n>0?0:u-1;o>=0&&o<u;o+=n)if(t(r[o],o,r))return o;return-1}}var vr=pr(1),hr=pr(-1);function yr(n,r,t,e){for(var u=(t=qn(t,e,1))(r),o=0,i=Y(n);o<i;){var a=Math.floor((o+i)/2);t(n[a])<u?o=a+1:i=a}return o}function dr(n,r,t){return function(e,u,o){var a=0,f=Y(e);if("number"==typeof o)n>0?a=o>=0?o:Math.max(o+f,a):f=o>=0?Math.min(o+1,f):o+f+1;else if(t&&o&&f)return e[o=t(e,u)]===u?o:-1;if(u!=u)return(o=r(i.call(e,a,f),$))>=0?o+a:-1;for(o=n>0?a:f-1;o>=0&&o<f;o+=n)if(e[o]===u)return o;return-1}}var gr=dr(1,vr,yr),br=dr(-1,hr);function mr(n,r,t){var e=(er(n)?vr:sr)(n,r,t);if(void 0!==e&&-1!==e)return n[e]}function jr(n,r,t){var e,u;if(r=Fn(r,t),er(n))for(e=0,u=n.length;e<u;e++)r(n[e],e,n);else{var o=nn(n);for(e=0,u=o.length;e<u;e++)r(n[o[e]],o[e],n)}return n}function _r(n,r,t){r=qn(r,t);for(var e=!er(n)&&nn(n),u=(e||n).length,o=Array(u),i=0;i<u;i++){var a=e?e[i]:i;o[i]=r(n[a],a,n)}return o}function wr(n){var r=function(r,t,e,u){var o=!er(r)&&nn(r),i=(o||r).length,a=n>0?0:i-1;for(u||(e=r[o?o[a]:a],a+=n);a>=0&&a<i;a+=n){var f=o?o[a]:a;e=t(e,r[f],f,r)}return e};return function(n,t,e,u){var o=arguments.length>=3;return r(n,Fn(t,u,4),e,o)}}var Ar=wr(1),xr=wr(-1);function Sr(n,r,t){var e=[];return r=qn(r,t),jr(n,(function(n,t,u){r(n,t,u)&&e.push(n)})),e}function Or(n,r,t){r=qn(r,t);for(var e=!er(n)&&nn(n),u=(e||n).length,o=0;o<u;o++){var i=e?e[o]:o;if(!r(n[i],i,n))return!1}return!0}function Mr(n,r,t){r=qn(r,t);for(var e=!er(n)&&nn(n),u=(e||n).length,o=0;o<u;o++){var i=e?e[o]:o;if(r(n[i],i,n))return!0}return!1}function Er(n,r,t,e){return er(n)||(n=jn(n)),("number"!=typeof t||e)&&(t=0),gr(n,r,t)>=0}var Br=j((function(n,r,t){var e,u;return D(r)?u=r:(r=Nn(r),e=r.slice(0,-1),r=r[r.length-1]),_r(n,(function(n){var o=u;if(!o){if(e&&e.length&&(n=In(n,e)),null==n)return;o=n[r]}return null==o?o:o.apply(n,t)}))}));function Nr(n,r){return _r(n,Rn(r))}function Ir(n,r,t){var e,u,o=-1/0,i=-1/0;if(null==r||"number"==typeof r&&"object"!=typeof n[0]&&null!=n)for(var a=0,f=(n=er(n)?n:jn(n)).length;a<f;a++)null!=(e=n[a])&&e>o&&(o=e);else r=qn(r,t),jr(n,(function(n,t,e){((u=r(n,t,e))>i||u===-1/0&&o===-1/0)&&(o=n,i=u)}));return o}function Tr(n,r,t){if(null==r||t)return er(n)||(n=jn(n)),n[Wn(n.length-1)];var e=er(n)?En(n):jn(n),u=Y(e);r=Math.max(Math.min(r,u),0);for(var o=u-1,i=0;i<r;i++){var a=Wn(i,o),f=e[i];e[i]=e[a],e[a]=f}return e.slice(0,r)}function kr(n,r){return function(t,e,u){var o=r?[[],[]]:{};return e=qn(e,u),jr(t,(function(r,u){var i=e(r,u,t);n(o,r,i)})),o}}var Dr=kr((function(n,r,t){W(n,t)?n[t].push(r):n[t]=[r]})),Rr=kr((function(n,r,t){n[t]=r})),Fr=kr((function(n,r,t){W(n,t)?n[t]++:n[t]=1})),Vr=kr((function(n,r,t){n[t?0:1].push(r)}),!0),Pr=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;function qr(n,r,t){return r in t}var Ur=j((function(n,r){var t={},e=r[0];if(null==n)return t;D(e)?(r.length>1&&(e=Fn(e,r[1])),r=an(n)):(e=qr,r=ur(r,!1,!1),n=Object(n));for(var u=0,o=r.length;u<o;u++){var i=r[u],a=n[i];e(a,i,n)&&(t[i]=a)}return t})),Wr=j((function(n,r){var t,e=r[0];return D(e)?(e=fr(e),r.length>1&&(t=r[1])):(r=_r(ur(r,!1,!1),String),e=function(n,t){return!Er(r,t)}),Ur(n,e,t)}));function zr(n,r,t){return i.call(n,0,Math.max(0,n.length-(null==r||t?1:r)))}function Lr(n,r,t){return null==n||n.length<1?null==r||t?void 0:[]:null==r||t?n[0]:zr(n,n.length-r)}function $r(n,r,t){return i.call(n,null==r||t?1:r)}var Cr=j((function(n,r){return r=ur(r,!0,!0),Sr(n,(function(n){return!Er(r,n)}))})),Kr=j((function(n,r){return Cr(n,r)}));function Jr(n,r,t,e){A(r)||(e=t,t=r,r=!1),null!=t&&(t=qn(t,e));for(var u=[],o=[],i=0,a=Y(n);i<a;i++){var f=n[i],c=t?t(f,i,n):f;r&&!t?(i&&o===c||u.push(f),o=c):t?Er(o,c)||(o.push(c),u.push(f)):Er(u,f)||u.push(f)}return u}var Gr=j((function(n){return Jr(ur(n,!0,!0))}));function Hr(n){for(var r=n&&Ir(n,Y).length||0,t=Array(r),e=0;e<r;e++)t[e]=Nr(n,e);return t}var Qr=j(Hr);function Xr(n,r){return n._chain?tn(r).chain():r}function Yr(n){return jr(wn(n),(function(r){var t=tn[r]=n[r];tn.prototype[r]=function(){var n=[this._wrapped];return o.apply(n,arguments),Xr(this,t.apply(tn,n))}})),tn}jr(["pop","push","reverse","shift","sort","splice","unshift"],(function(n){var r=t[n];tn.prototype[n]=function(){var t=this._wrapped;return null!=t&&(r.apply(t,arguments),"shift"!==n&&"splice"!==n||0!==t.length||delete t[0]),Xr(this,t)}})),jr(["concat","join","slice"],(function(n){var r=t[n];tn.prototype[n]=function(){var n=this._wrapped;return null!=n&&(n=r.apply(n,arguments)),Xr(this,n)}}));var Zr=Yr({__proto__:null,VERSION:n,restArguments:j,isObject:_,isNull:function(n){return null===n},isUndefined:w,isBoolean:A,isElement:function(n){return!(!n||1!==n.nodeType)},isString:S,isNumber:O,isDate:M,isRegExp:E,isError:B,isSymbol:N,isArrayBuffer:I,isDataView:q,isArray:U,isFunction:D,isArguments:L,isFinite:function(n){return!N(n)&&d(n)&&!isNaN(parseFloat(n))},isNaN:$,isTypedArray:X,isEmpty:function(n){if(null==n)return!0;var r=Y(n);return"number"==typeof r&&(U(n)||S(n)||L(n))?0===r:0===Y(nn(n))},isMatch:rn,isEqual:function(n,r){return on(n,r)},isMap:dn,isWeakMap:gn,isSet:bn,isWeakSet:mn,keys:nn,allKeys:an,values:jn,pairs:function(n){for(var r=nn(n),t=r.length,e=Array(t),u=0;u<t;u++)e[u]=[r[u],n[r[u]]];return e},invert:_n,functions:wn,methods:wn,extend:xn,extendOwn:Sn,assign:Sn,defaults:On,create:function(n,r){var t=Mn(n);return r&&Sn(t,r),t},clone:En,tap:function(n,r){return r(n),n},get:Tn,has:function(n,r){for(var t=(r=Nn(r)).length,e=0;e<t;e++){var u=r[e];if(!W(n,u))return!1;n=n[u]}return!!t},mapObject:function(n,r,t){r=qn(r,t);for(var e=nn(n),u=e.length,o={},i=0;i<u;i++){var a=e[i];o[a]=r(n[a],a,n)}return o},identity:kn,constant:C,noop:Un,toPath:Bn,property:Rn,propertyOf:function(n){return null==n?Un:function(r){return Tn(n,r)}},matcher:Dn,matches:Dn,times:function(n,r,t){var e=Array(Math.max(0,n));r=Fn(r,t,1);for(var u=0;u<n;u++)e[u]=r(u);return e},random:Wn,now:zn,escape:Cn,unescape:Kn,templateSettings:Jn,template:function(n,r,t){!r&&t&&(r=t),r=On({},r,tn.templateSettings);var e=RegExp([(r.escape||Gn).source,(r.interpolate||Gn).source,(r.evaluate||Gn).source].join("|")+"|$","g"),u=0,o="__p+='";n.replace(e,(function(r,t,e,i,a){return o+=n.slice(u,a).replace(Qn,Xn),u=a+r.length,t?o+="'+\n((__t=("+t+"))==null?'':_.escape(__t))+\n'":e?o+="'+\n((__t=("+e+"))==null?'':__t)+\n'":i&&(o+="';\n"+i+"\n__p+='"),r})),o+="';\n";var i,a=r.variable;if(a){if(!Yn.test(a))throw new Error("variable is not a bare identifier: "+a)}else o="with(obj||{}){\n"+o+"}\n",a="obj";o="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+o+"return __p;\n";try{i=new Function(a,"_",o)}catch(n){throw n.source=o,n}var f=function(n){return i.call(this,n,tn)};return f.source="function("+a+"){\n"+o+"}",f},result:function(n,r,t){var e=(r=Nn(r)).length;if(!e)return D(t)?t.call(n):t;for(var u=0;u<e;u++){var o=null==n?void 0:n[r[u]];void 0===o&&(o=t,u=e),n=D(o)?o.call(n):o}return n},uniqueId:function(n){var r=++Zn+"";return n?n+r:r},chain:function(n){var r=tn(n);return r._chain=!0,r},iteratee:Pn,partial:rr,bind:tr,bindAll:or,memoize:function(n,r){var t=function(e){var u=t.cache,o=""+(r?r.apply(this,arguments):e);return W(u,o)||(u[o]=n.apply(this,arguments)),u[o]};return t.cache={},t},delay:ir,defer:ar,throttle:function(n,r,t){var e,u,o,i,a=0;t||(t={});var f=function(){a=!1===t.leading?0:zn(),e=null,i=n.apply(u,o),e||(u=o=null)},c=function(){var c=zn();a||!1!==t.leading||(a=c);var l=r-(c-a);return u=this,o=arguments,l<=0||l>r?(e&&(clearTimeout(e),e=null),a=c,i=n.apply(u,o),e||(u=o=null)):e||!1===t.trailing||(e=setTimeout(f,l)),i};return c.cancel=function(){clearTimeout(e),a=0,e=u=o=null},c},debounce:function(n,r,t){var e,u,o,i,a,f=function(){var c=zn()-u;r>c?e=setTimeout(f,r-c):(e=null,t||(i=n.apply(a,o)),e||(o=a=null))},c=j((function(c){return a=this,o=c,u=zn(),e||(e=setTimeout(f,r),t&&(i=n.apply(a,o))),i}));return c.cancel=function(){clearTimeout(e),e=o=a=null},c},wrap:function(n,r){return rr(r,n)},negate:fr,compose:function(){var n=arguments,r=n.length-1;return function(){for(var t=r,e=n[r].apply(this,arguments);t--;)e=n[t].call(this,e);return e}},after:function(n,r){return function(){if(--n<1)return r.apply(this,arguments)}},before:cr,once:lr,findKey:sr,findIndex:vr,findLastIndex:hr,sortedIndex:yr,indexOf:gr,lastIndexOf:br,find:mr,detect:mr,findWhere:function(n,r){return mr(n,Dn(r))},each:jr,forEach:jr,map:_r,collect:_r,reduce:Ar,foldl:Ar,inject:Ar,reduceRight:xr,foldr:xr,filter:Sr,select:Sr,reject:function(n,r,t){return Sr(n,fr(qn(r)),t)},every:Or,all:Or,some:Mr,any:Mr,contains:Er,includes:Er,include:Er,invoke:Br,pluck:Nr,where:function(n,r){return Sr(n,Dn(r))},max:Ir,min:function(n,r,t){var e,u,o=1/0,i=1/0;if(null==r||"number"==typeof r&&"object"!=typeof n[0]&&null!=n)for(var a=0,f=(n=er(n)?n:jn(n)).length;a<f;a++)null!=(e=n[a])&&e<o&&(o=e);else r=qn(r,t),jr(n,(function(n,t,e){((u=r(n,t,e))<i||u===1/0&&o===1/0)&&(o=n,i=u)}));return o},shuffle:function(n){return Tr(n,1/0)},sample:Tr,sortBy:function(n,r,t){var e=0;return r=qn(r,t),Nr(_r(n,(function(n,t,u){return{value:n,index:e++,criteria:r(n,t,u)}})).sort((function(n,r){var t=n.criteria,e=r.criteria;if(t!==e){if(t>e||void 0===t)return 1;if(t<e||void 0===e)return-1}return n.index-r.index})),"value")},groupBy:Dr,indexBy:Rr,countBy:Fr,partition:Vr,toArray:function(n){return n?U(n)?i.call(n):S(n)?n.match(Pr):er(n)?_r(n,kn):jn(n):[]},size:function(n){return null==n?0:er(n)?n.length:nn(n).length},pick:Ur,omit:Wr,first:Lr,head:Lr,take:Lr,initial:zr,last:function(n,r,t){return null==n||n.length<1?null==r||t?void 0:[]:null==r||t?n[n.length-1]:$r(n,Math.max(0,n.length-r))},rest:$r,tail:$r,drop:$r,compact:function(n){return Sr(n,Boolean)},flatten:function(n,r){return ur(n,r,!1)},without:Kr,uniq:Jr,unique:Jr,union:Gr,intersection:function(n){for(var r=[],t=arguments.length,e=0,u=Y(n);e<u;e++){var o=n[e];if(!Er(r,o)){var i;for(i=1;i<t&&Er(arguments[i],o);i++);i===t&&r.push(o)}}return r},difference:Cr,unzip:Hr,transpose:Hr,zip:Qr,object:function(n,r){for(var t={},e=0,u=Y(n);e<u;e++)r?t[n[e]]=r[e]:t[n[e][0]]=n[e][1];return t},range:function(n,r,t){null==r&&(r=n||0,n=0),t||(t=r<n?-1:1);for(var e=Math.max(Math.ceil((r-n)/t),0),u=Array(e),o=0;o<e;o++,n+=t)u[o]=n;return u},chunk:function(n,r){if(null==r||r<1)return[];for(var t=[],e=0,u=n.length;e<u;)t.push(i.call(n,e,e+=r));return t},mixin:Yr,default:tn});return Zr._=Zr,Zr}));

/***/ }),

/***/ 5704:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"rules":["Pron(betr,neut,zelfst) Pron(aanw,neut,attr) PREVTAG Prep(voor)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXT1OR2TAG Adv(gew,geen_func,stell,onverv)","Pron(onbep,neut,zelfst) Art(bep,onzijd,neut) NEXT1OR2TAG N(soort,ev,neut)","Prep(voor) Adv(deel_v) NEXT1OR2TAG STAART","Prep(voor) Adv(deel_v) NEXTTAG Prep(voor_inf)","Adj(adv,stell,onverv) Adj(attr,stell,onverv) PREV1OR2TAG Art(onbep,zijd_of_onzijd,neut)","Pron(betr,neut,zelfst) Pron(aanw,neut,attr) NEXTTAG N(soort,ev,neut)","Prep(voor) Adv(deel_v) NEXTTAG Prep(voor)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXTTAG Adv(gew,geen_func,stell,onverv)","Conj(onder,met_fin) Pron(aanw,neut,attr) NEXTTAG N(soort,ev,neut)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) PREVTAG N(soort,mv,neut)","Adv(gew,er) Adv(pron,er) WDAND2TAGAFT er Prep(voor)","Prep(voor) Adv(deel_v) NEXTTAG Punc(komma)","Conj(neven) Adv(gew,geen_func,stell,onverv) PREVTAG Adv(gew,geen_func,stell,onverv)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXTTAG V(hulp_of_kopp,ott,3,ev)","Pron(onbep,neut,zelfst) Pron(bez,2,ev,neut,attr) NEXTTAG N(soort,ev,neut)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXT1OR2TAG Art(bep,zijd_of_mv,neut)","V(hulp,ott,1_of_2_of_3,mv) V(hulp,inf) NEXTTAG V(trans,inf)","Pron(vrag,neut,attr) Pron(betr,neut,zelfst) PREV1OR2TAG Prep(voor)","V(hulp,ott,3,ev) V(hulp,ott,1,ev) NEXT1OR2OR3TAG Pron(per,1,ev,nom)","Pron(betr,neut,zelfst) Pron(aanw,neut,zelfst) PREVTAG Conj(neven)","Pron(onbep,gen,attr) Adv(gew,geen_func,stell,onverv) CURWD anders","Adj(attr,stell,onverv) Adj(adv,stell,onverv) PREV1OR2OR3TAG N(soort,mv,neut)","Adv(gew,aanw) Conj(onder,met_fin) PREV1OR2OR3TAG Adv(gew,geen_func,vergr,onverv)","Adv(gew,geen_func,vergr,onverv) Num(hoofd,onbep,zelfst,vergr,onverv) NEXT1OR2OR3TAG Conj(onder,met_fin)","Adv(gew,er) Adv(pron,er) NEXT1OR2OR3TAG Adv(deel_v)","Adv(deel_v) Adv(deel_adv) PREV1OR2OR3TAG Adv(pron,er)","Prep(voor) Adv(deel_adv) NEXTTAG Punc(punt)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXT1OR2OR3TAG Adv(gew,aanw)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,inf) NEXTTAG Punc(punt)","Prep(voor_inf) Adv(gew,geen_func,stell,onverv) NEXTTAG Adj(attr,stell,onverv)","Pron(onbep,neut,zelfst) Art(bep,onzijd,neut) PREV1OR2OR3TAG Prep(voor)","V(hulp,ott,3,ev) V(hulp,ott,1,ev) PREV1OR2OR3TAG Pron(per,1,ev,nom)","Adj(attr,stell,onverv) Adj(adv,stell,onverv) CURWD werkelijk","Adv(gew,aanw) Conj(onder,met_fin) PREV1OR2TAG Adj(adv,vergr,onverv)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,inf) NEXTTAG Punc(komma)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) PREVTAG Conj(neven)","N(soort,ev,neut) Adj(attr,stell,onverv) SURROUNDTAG Art(onbep,zijd_of_onzijd,neut) N(soort,ev,neut)","V(trans,inf) V(trans,ott,1_of_2_of_3,mv) PREV1OR2OR3TAG Punc(komma)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXTTAG Prep(voor)","V(intrans,inf) V(intrans,ott,1_of_2_of_3,mv) PREV1OR2TAG STAART","Adj(attr,stell,verv_neut) N(soort,ev,neut) NEXTTAG Prep(voor)","N(soort,ev,neut) V(trans,ott,1,ev) PREVTAG Pron(per,1,ev,nom)","Pron(per,1,ev,dat_of_acc) Pron(ref,1,ev) PREV1OR2TAG Pron(per,1,ev,nom)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) PREVTAG V(hulp_of_kopp,ott,3,ev)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXT1OR2TAG Adv(gew,aanw)","Adv(gew,aanw) Conj(onder,met_fin) NEXTTAG Pron(per,3,ev,nom)","Conj(neven) Adv(gew,geen_func,stell,onverv) WDNEXTTAG maar Art(onbep,zijd_of_onzijd,neut)","Prep(voor_inf) Adv(gew,geen_func,stell,onverv) NEXT1OR2TAG Adj(adv,stell,onverv)","V(intrans,ovt,1_of_2_of_3,ev) V(trans,ovt,1_of_2_of_3,ev) CURWD dacht","V(trans,inf) V(trans,ott,1_of_2_of_3,mv) PREV1OR2TAG STAART","N(soort,mv,neut) V(trans,inf) PREVTAG V(hulp,ovt,1_of_2_of_3,ev)","Num(hoofd,bep,attr,onverv) Num(hoofd,bep,zelfst,onverv) NEXTTAG Punc(haak_sluit)","V(trans,inf) V(trans,ott,1_of_2_of_3,mv) PREV1OR2WD en","Pron(onbep,neut,zelfst) Pron(per,2,ev,nom) NEXT1OR2TAG Adj(adv,stell,onverv)","V(hulp_of_kopp,inf) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXT2TAG N(soort,mv,neut)","V(hulp,ott,1_of_2_of_3,mv) V(trans,ott,1_of_2_of_3,mv) NEXT1OR2TAG Adv(gew,geen_func,stell,onverv)","Pron(onbep,neut,zelfst) Art(bep,onzijd,neut) NEXTTAG Adj(attr,stell,verv_neut)","Adv(gew,er) Adv(pron,er) PREV1OR2WD ik","Adv(gew,aanw) Conj(onder,met_fin) PREV1OR2OR3TAG Adj(attr,vergr,onverv)","Pron(onbep,neut,zelfst) Art(bep,onzijd,neut) NEXTTAG N(soort,ev,neut)","Adv(gew,geen_func,stell,onverv) N(soort,ev,neut) PREVTAG Art(bep,zijd_of_mv,neut)","V(intrans,inf) V(hulp,inf) NEXTTAG N(soort,mv,neut)","Pron(onbep,neut,zelfst) Pron(per,2,ev,dat_of_acc) PREVTAG Prep(voor)","V(intrans,teg_dw,onverv) Adv(gew,geen_func,stell,onverv) CURWD voortdurend","Pron(onbep,neut,zelfst) Pron(onbep,neut,attr) WDNEXTTAG ander N(soort,ev,neut)","N(eigen,ev,neut) N(soort,ev,neut) NEXTWD aan","Adj(attr,stell,onverv) Adj(adv,stell,onverv) NEXTTAG Adj(attr,stell,onverv)","Adj(attr,stell,onverv) N(soort,ev,neut) PREV1OR2TAG Art(bep,onzijd,neut)","Adj(adv,stell,onverv) Adj(attr,stell,onverv) CURWD hard","Adj(attr,stell,onverv) Adj(adv,stell,onverv) CURWD ruim","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXT1OR2TAG Pron(aanw,neut,attr)","N(soort,mv,neut) V(intrans,inf) PREVTAG V(hulp,inf)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXT1OR2OR3TAG Punc(punt)","V(hulp,ott,3,ev) V(trans,ott,3,ev) RBIGRAM heeft een","Prep(voor) N(eigen,ev,neut) WDNEXTTAG Van N(eigen,ev,neut)","V(hulp,ott,1_of_2_of_3,mv) V(hulp,inf) PREV1OR2TAG V(hulp,ovt,1_of_2_of_3,ev)","Conj(neven) Adv(gew,geen_func,stell,onverv) PREV1OR2OR3TAG Pron(per,2,ev,nom)","V(hulp,ovt,1_of_2_of_3,ev) V(trans,ovt,1_of_2_of_3,ev) NEXT1OR2OR3TAG Conj(onder,met_fin)","Pron(vrag,neut,attr) Pron(betr,neut,zelfst) PREVTAG Pron(onbep,neut,zelfst)","Adv(gew,geen_func,vergr,onverv) Num(hoofd,onbep,zelfst,vergr,onverv) PREV1OR2OR3TAG Conj(neven)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,inf) PREV1OR2TAG Prep(voor_inf)","Pron(bez,1,mv,neut,attr) Pron(per,1,mv,dat_of_acc) PREV1OR2OR3TAG Punc(komma)","Pron(betr,neut,zelfst) Pron(aanw,neut,attr) NEXTTAG Adj(attr,stell,verv_neut)","Pron(vrag,neut,attr) Pron(onbep,neut,attr) PREVTAG Adv(gew,geen_func,stell,onverv)","Pron(onbep,neut,attr) Pron(onbep,neut,zelfst) NEXTWD van","V(intrans,verl_dw,onverv) V(trans,verl_dw,onverv) PREV1OR2OR3TAG N(soort,ev,neut)","Pron(aanw,neut,zelfst) Pron(betr,neut,zelfst) PREVTAG N(soort,ev,neut)","V(hulp,imp) V(hulp,ott,3,ev) CURWD laat","Adj(attr,stell,onverv) Adv(gew,geen_func,stell,onverv) CURWD opeens","Adj(adv,stell,onverv) Adj(attr,stell,onverv) NEXTTAG V(hulp_of_kopp,ott,3,ev)","Adj(attr,stell,onverv) Adj(adv,stell,onverv) CURWD haastig","Adj(adv,stell,onverv) Adj(attr,stell,onverv) SURROUNDTAG Adv(gew,geen_func,stell,onverv) Punc(punt)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXTTAG V(hulp_of_kopp,ott,3,ev)","N(soort,ev,neut) Adj(adv,stell,onverv) PREVTAG Adv(gew,aanw)","N(soort,mv,neut) V(trans,inf) PREVWD moeten","Num(hoofd,bep,attr,onverv) Num(hoofd,bep,zelfst,onverv) NEXTTAG V(hulp_of_kopp,ovt,1_of_2_of_3,ev)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXT2TAG Pron(per,1,ev,nom)","N(soort,ev,neut) N(eigen,ev,neut) CURWD februari","V(hulp,ott,3,ev) V(trans,ott,3,ev) NEXTTAG Punc(komma)","V(hulp_of_kopp,inf) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXTTAG Adv(gew,geen_func,stell,onverv)","V(hulp,ott,3,ev) V(trans,ott,3,ev) WDNEXTTAG heeft Prep(voor)","Pron(onbep,neut,zelfst) Pron(per,2,ev,nom) PREV1OR2OR3TAG Punc(aanhaal_dubb)","V(trans,ott,3,ev) V(trans,ott,2,ev) PREV1OR2OR3TAG Pron(per,2,ev,nom)","Adj(attr,stell,onverv) Adj(adv,stell,onverv) PREV1OR2OR3TAG Pron(per,2,ev,nom)","Prep(voor) Adv(deel_v) NEXTTAG Conj(onder,met_fin)","N(soort,mv,neut) V(trans,verl_dw,onverv) CURWD verloren","Adj(attr,stell,onverv) N(soort,ev,neut) WDAND2TAGBFR Prep(voor) dood","Pron(aanw,neut,attr) Pron(aanw,neut,zelfst) NEXTTAG Prep(voor)","Prep(voor) N(eigen,ev,neut) SURROUNDTAG N(eigen,ev,neut) N(eigen,ev,neut)","Adv(gew,aanw) Adv(pron,aanw) NEXT1OR2TAG Pron(per,1,ev,nom)","Pron(bez,3,ev,neut,attr) Pron(per,3,ev,dat_of_acc) NEXTTAG Adv(gew,geen_func,stell,onverv)","N(soort,ev,neut) V(trans,ovt,1_of_2_of_3,ev) PREVTAG Pron(per,3,ev,nom)","V(hulp,ott,1_of_2_of_3,mv) V(hulp,inf) PREV1OR2TAG Prep(voor)","Adv(gew,er) Adv(pron,er) PREV2TAG Conj(onder,met_fin)","Prep(voor) Adv(deel_adv) PREV1OR2OR3TAG Adv(pron,er)","Pron(bez,3,ev,neut,attr) Pron(per,3,ev,dat_of_acc) NEXT1OR2TAG Art(onbep,zijd_of_onzijd,neut)","Num(hoofd,bep,zelfst,onverv) Num(hoofd,bep,attr,onverv) NEXTTAG N(soort,ev,neut)","Adv(gew,aanw) Conj(onder,met_fin) PREV1OR2TAG Adj(attr,stell,onverv)","V(hulp,ott,1_of_2_of_3,mv) V(trans,ott,1_of_2_of_3,mv) PREV1OR2TAG Pron(bez,3,mv,neut,attr)","Conj(neven) Adv(gew,geen_func,stell,onverv) PREV1OR2WD ik","Conj(neven) Conj(onder,met_fin) PREV1OR2WD net","Pron(vrag,neut,attr) Pron(betr,neut,zelfst) NEXTTAG N(eigen,ev,neut)","Num(hoofd,bep,zelfst,onverv) Num(hoofd,bep,attr,onverv) NEXT1OR2OR3TAG Num(hoofd,bep,zelfst,onverv)","Art(bep,onzijd,neut) Pron(per,3,ev,nom) NEXTTAG Art(onbep,zijd_of_onzijd,neut)","V(intrans,ovt,1_of_2_of_3,ev) V(hulp,ovt,1_of_2_of_3,ev) CURWD begon","Adv(gew,geen_func,stell,onverv) N(soort,ev,neut) PREV1OR2WD op","N(soort,ev,neut) Num(hoofd,bep,attr,onverv) CURWD 7","Adv(gew,geen_func,vergr,onverv) Num(hoofd,onbep,zelfst,vergr,onverv) PREV1OR2TAG Prep(voor)","V(trans,inf) V(intrans,ott,1_of_2_of_3,mv) PREV1OR2OR3TAG STAART","V(intrans,ott,1_of_2_of_3,mv) V(intrans,inf) NEXT1OR2OR3TAG Conj(neven)","V(intrans,inf) V(hulp,inf) NEXTTAG V(trans,inf)","Adv(gew,geen_func,stell,onverv) Conj(onder,met_fin) PREVTAG Punc(komma)","Adv(gew,geen_func,stell,onverv) Adj(attr,stell,onverv) CURWD tevreden","V(trans,ott,1_of_2_of_3,mv) V(intrans,inf) CURWD beginnen","V(trans,ott,1,ev) V(trans,ott,2,ev) NEXTTAG Pron(per,2,ev,nom)","V(intrans,teg_dw,verv_neut) N(soort,ev,neut) CURWD schande","V(intrans,ott,3,ev) N(soort,ev,neut) NEXT1OR2OR3TAG Prep(voor_inf)","N(soort,ev,neut) Adj(attr,vergr,onverv) PREVWD steeds","N(soort,ev,neut) V(intrans,ott,3,ev) WDNEXTTAG sterft Prep(voor)","N(eigen,ev,neut) Adj(attr,stell,verv_neut) SURROUNDTAG STAART N(soort,mv,neut)","V(trans,ovt,1_of_2_of_3,ev) Adj(attr,stell,verv_neut) PREV1OR2TAG Prep(voor)","V(intrans,inf) V(hulp,inf) NEXTTAG V(intrans,inf)","V(hulp,inf) V(trans,inf) NEXTTAG Punc(punt)","V(refl,ott,3,ev) V(trans,ott,3,ev) CURWD voelt","Pron(bez,3,ev,neut,attr) V(intrans,ott,1_of_2_of_3,mv) PREVTAG Adv(gew,er)","V(hulp,ott,2,ev) V(hulp,ott,3,ev) CURWD hoeft","Pron(onbep,neut,zelfst) Pron(ref,2,ev) PREV1OR2WD je","V(intrans,teg_dw,verv_neut) Pron(onbep,neut,attr) WDNEXTTAG verschillende N(soort,mv,neut)","Adv(gew,vrag) Adj(attr,stell,onverv) PREV1OR2OR3TAG V(hulp_of_kopp,ott,3,ev)","Adj(attr,vergr,verv_neut) Adj(attr,stell,verv_neut) CURWD nare","V(trans,ott,1,ev) Int CURWD hoor","V(intrans,ovt,1_of_2_of_3,mv) V(intrans,verl_dw,onverv) CURWD verdwenen","Adv(pron,vrag) Adv(pron,betr) CURWD waardoor","N(eigen,ev,neut) N(soort,ev,neut) PREVTAG Art(onbep,zijd_of_onzijd,neut)","N(eigen,ev,neut) N(soort,ev,neut) NEXT1OR2WD worden","N(eigen,ev,neut) N(soort,ev,neut) NEXTBIGRAM Conj(neven) N(soort,ev,neut)","N(eigen,ev,neut) N(soort,ev,neut) SURROUNDTAG STAART Prep(voor)","N(eigen,ev,neut) N(soort,ev,neut) CURWD Koningin","Adj(adv,stell,onverv) Adj(attr,stell,onverv) PREV1OR2TAG V(hulp_of_kopp,ott,1_of_2_of_3,mv)","Adj(attr,stell,onverv) Adj(adv,stell,onverv) PREVTAG STAART","Adj(adv,stell,onverv) Adj(attr,stell,onverv) WDPREVTAG N(soort,mv,neut) nodig","Adj(attr,stell,onverv) Adj(adv,stell,onverv) NEXTTAG Prep(voor_inf)","Adj(adv,stell,onverv) Adj(attr,stell,onverv) CURWD eenzaam","Adj(attr,stell,onverv) Adj(adv,stell,onverv) CURWD regelmatig","Adj(attr,stell,onverv) Adj(adv,stell,onverv) CURWD geestelijk","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) PREVTAG Pron(per,2,ev,nom)","V(trans,inf) V(intrans,inf) NEXT1OR2TAG N(eigen,ev,neut)","V(intrans,ovt,1_of_2_of_3,ev) V(hulp,ovt,1_of_2_of_3,ev) NEXT1OR2TAG V(intrans,inf)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXTTAG Punc(komma)","V(trans,inf) V(intrans,inf) PREV1OR2OR3TAG Adj(adv,vergr,onverv)","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXT1OR2TAG Pron(onbep,neut,zelfst)","V(trans,inf) V(intrans,inf) CURWD wennen","Art(bep,onzijd,neut) Pron(onbep,neut,zelfst) NEXT1OR2TAG Conj(onder,met_inf)","N(soort,ev,neut) V(trans,verl_dw,onverv) PREV1OR2TAG V(hulp_of_kopp,ovt,1_of_2_of_3,mv)","N(soort,ev,neut) Adj(adv,stell,onverv) NEXTTAG V(trans,verl_dw,verv_neut)","Prep(voor) Adv(deel_adv) NEXTTAG V(trans,inf)","N(soort,ev,neut) Adj(adv,stell,onverv) NEXTBIGRAM Adj(attr,stell,onverv) N(soort,ev,neut)","N(soort,mv,neut) V(trans,inf) PREV1OR2TAG Pron(per,3,ev,dat_of_acc)","Prep(voor) Adv(deel_adv) NEXTBIGRAM V(intrans,ott,3,ev) Punc(punt)","V(intrans,inf) V(intrans,ott,1_of_2_of_3,mv) PREV1OR2TAG Conj(neven)","N(soort,mv,neut) V(trans,inf) PREV1OR2OR3TAG V(hulp,ott,2,ev)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXTTAG V(intrans,ott,3,ev)","V(intrans,inf) V(intrans,ott,1_of_2_of_3,mv) PREV1OR2OR3TAG Punc(komma)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) PREVTAG Pron(per,1,mv,nom)","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXT1OR2TAG V(trans,ott,3,ev)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXTTAG Prep(voor)","Conj(onder,met_inf) Prep(voor) NEXTTAG N(soort,mv,neut)","V(hulp_of_kopp,inf) V(hulp_of_kopp,ott,1_of_2_of_3,mv) PREVTAG V(trans,verl_dw,onverv)","V(hulp,ott,3,ev) V(trans,ott,3,ev) WDPREVTAG Pron(per,3,ev,nom) heeft","Conj(onder,met_fin) Pron(aanw,neut,zelfst) NEXT1OR2WD doen","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXTTAG V(trans,verl_dw,onverv)","V(hulp_of_kopp,ott,1_of_2_of_3,mv) V(hulp_of_kopp,inf) PREV1OR2TAG V(hulp,ott,3,ev)","N(soort,ev,neut) Adj(attr,stell,verv_neut) PREVBIGRAM Adj(attr,stell,verv_neut) Punc(komma)","N(soort,mv,neut) V(trans,verl_dw,onverv) CURWD ingenomen","Conj(onder,met_inf) Prep(voor) NEXTTAG N(soort,ev,neut)","V(trans,ovt,1_of_2_of_3,ev) V(intrans,ovt,1_of_2_of_3,ev) PREVTAG N(eigen,ev,neut)","Pron(bez,3,ev,neut,attr) V(hulp_of_kopp,ott,1_of_2_of_3,mv) NEXTWD het","Pron(aanw,neut,attr) Pron(aanw,neut,zelfst) NEXTTAG V(hulp_of_kopp,ott,3,ev)","Adv(gew,aanw) Adv(pron,aanw) PREVTAG Punc(punt_komma)","Adv(deel_v) Adv(deel_adv) RBIGRAM bij ,","V(intrans,inf) V(trans,inf) CURWD schrijven","Pron(onbep,neut,zelfst) Pron(per,2,ev,nom) PREV1OR2OR3TAG N(eigen,ev,neut)","Prep(voor) Adv(deel_v) NEXTTAG V(hulp,inf)","N(soort,mv,neut) V(trans,verl_dw,onverv) CURWD betrokken","V(hulp_of_kopp,inf) V(hulp_of_kopp,ott,1_of_2_of_3,mv) PREV1OR2WD en","Pron(aanw,neut,zelfst) Conj(onder,met_fin) WDAND2TAGAFT Dat N(soort,ev,neut)","Adv(deel_v) Adv(deel_adv) PREV1OR2OR3TAG Adv(gew,er)","Adv(gew,er) Adv(pron,er) NEXT1OR2OR3TAG Adv(deel_adv)","N(soort,ev,neut) N(soort,mv,neut) WDNEXTTAG dll Num(hoofd,bep,attr,onverv)","N(eigen,ev,neut) N(eigen,mv,neut) NEXTWD Staten","Adj(attr,stell,verv_neut) N(soort,ev,neut) NEXTTAG Punc(punt)","V(hulp_of_kopp,inf) V(hulp_of_kopp,ott,1_of_2_of_3,mv) PREV1OR2OR3TAG Adj(attr,stell,verv_neut)","V(hulp,ovt,1_of_2_of_3,ev) V(trans,ovt,1_of_2_of_3,ev) SURROUNDTAG N(soort,ev,neut) Punc(komma)","Pron(bez,3,ev,neut,attr) Pron(per,3,ev,dat_of_acc) NEXTTAG Prep(voor)","Prep(voor) N(eigen,ev,neut) NEXTTAG Art(bep,zijd_of_mv,gen)","Art(bep,zijd_of_mv,neut) N(eigen,ev,neut) WDNEXTTAG De N(eigen,ev,neut)","Adj(attr,stell,verv_neut) Adj(zelfst,stell,verv_neut) PREVWD Het","N(eigen,ev,neut) V(trans,imp) SURROUNDTAG STAART Adv(gew,aanw)","N(eigen,ev,neut) N(eigen,mv,neut) PREVTAG N(eigen,mv,neut)","Adv(gew,aanw) Conj(onder,met_fin) LBIGRAM , toen","V(hulp,ott,1_of_2_of_3,mv) V(trans,ott,1_of_2_of_3,mv) RBIGRAM hebben ,","V(trans,ott,1_of_2_of_3,mv) V(hulp,ott,1_of_2_of_3,mv) PREV1OR2TAG STAART","V(hulp,inf) V(hulp,ott,1_of_2_of_3,mv) NEXTTAG Pron(per,1,mv,nom)","Pron(bez,3,ev,neut,attr) Pron(per,3,ev,dat_of_acc) NEXTTAG V(trans,verl_dw,onverv)","Pron(aanw,neut,attr) Pron(betr,neut,zelfst) WDPREVTAG N(soort,mv,neut) die","V(hulp,ott,3,ev) V(hulp,ott,2,ev) PREVTAG Pron(per,2,ev,nom)","Pron(bez,1,mv,neut,attr) Pron(per,1,mv,dat_of_acc) NEXTTAG Punc(punt)","N(eigen,ev,neut) Prep(voor) SURROUNDTAG STAART Art(bep,zijd_of_mv,neut)","Conj(neven) Adv(gew,geen_func,stell,onverv) PREVTAG Adv(gew,aanw)","Pron(betr,neut,zelfst) Pron(aanw,neut,zelfst) PREV1OR2TAG Conj(onder,met_fin)","Pron(aanw,neut,zelfst) Pron(aanw,neut,attr) NEXTBIGRAM Adj(attr,stell,verv_neut) N(soort,ev,neut)","Prep(voor_inf) Adv(gew,geen_func,stell,onverv) NEXTTAG Adj(attr,stell,verv_neut)","Num(hoofd,bep,zelfst,onverv) Num(hoofd,bep,attr,onverv) PREV1OR2OR3TAG Num(hoofd,bep,attr,onverv)","N(soort,ev,neut) V(intrans,inf) PREVTAG Prep(voor_inf)","Prep(voor_inf) Prep(voor) NEXTTAG N(soort,ev,neut)","Adj(adv,stell,onverv) N(soort,ev,neut) WDAND2AFT geheel .","V(trans,ott,3,ev) N(soort,ev,neut) PREVTAG Art(onbep,zijd_of_onzijd,neut)","V(trans,inf) V(trans,inf,subst) PREV1OR2TAG Art(bep,onzijd,neut)","V(hulp,ott,3,ev) V(hulp,ott,2,ev) NEXTWD u","Adv(gew,geen_func,stell,onverv) N(soort,ev,neut) PREVTAG Adj(attr,stell,verv_neut)","Adv(deel_v) Prep(voor) WDNEXTTAG tot Prep(voor)","V(hulp,ovt,1_of_2_of_3,mv) V(trans,ovt,1_of_2_of_3,mv) CURWD hadden","Adv(gew,geen_func,stell,onverv) Pron(onbep,neut,attr) NEXTWD die","V(trans,inf) V(refl,inf) PREV1OR2OR3TAG Pron(ref,3,ev_of_mv)","V(hulp,inf) V(hulp,ott,1_of_2_of_3,mv) WDNEXTTAG moeten V(trans,inf)","V(hulp,ott,1_of_2_of_3,mv) V(hulp,inf) NEXTBIGRAM V(trans,inf) Punc(komma)","Pron(aanw,neut,zelfst) Pron(betr,neut,zelfst) SURROUNDTAG Punc(komma) Prep(voor)","N(eigen,ev,neut) Int SURROUNDTAG Punc(aanhaal_dubb) Punc(komma)","N(eigen,ev,neut) Art(bep,zijd_of_mv,neut) LBIGRAM STAART De","Conj(onder,met_fin) Conj(neven) PREV1OR2WD zowel","Adv(gew,geen_func,stell,onverv) Adj(attr,stell,onverv) NEXTTAG Conj(neven)","Adj(attr,stell,verv_neut) Pron(onbep,neut,attr) WDNEXTTAG Elke N(soort,ev,neut)","Adj(adv,vergr,onverv) Adj(attr,vergr,onverv) PREV1OR2TAG Adv(gew,geen_func,stell,onverv)","V(trans,ovt,1_of_2_of_3,ev) N(soort,ev,neut) PREVTAG Adj(attr,stell,verv_neut)","V(intrans,teg_dw,verv_neut) N(soort,ev,neut) CURWD bende","V(hulp,inf) V(hulp,ott,1_of_2_of_3,mv) WDPREVTAG N(soort,ev,neut) kunnen","Pron(vrag,neut,attr) Pron(onbep,neut,attr) NEXTTAG N(soort,mv,neut)","Pron(betr,neut,zelfst) Pron(vrag,neut,attr) NEXT1OR2OR3TAG Adv(gew,aanw)","Adv(gew,vrag) Adv(pron,vrag) PREVTAG Pron(onbep,neut,zelfst)","Adv(gew,geen_func,vergr,onverv) Num(hoofd,onbep,attr,vergr,onverv) NEXT1OR2TAG N(soort,mv,neut)","V(trans,ott,1,ev) V(trans,ott,3,ev) PREVTAG Pron(onbep,neut,zelfst)","V(hulp_of_kopp,ovt,1_of_2_of_3,mv) V(intrans,ovt,1_of_2_of_3,mv) NEXTTAG Adv(gew,er)","Pron(onbep,neut,zelfst) Pron(per,2,ev,dat_of_acc) PREV1OR2TAG Pron(per,1,ev,nom)","Num(hoofd,bep,attr,onverv) Num(rang,bep,attr,onverv) PREVTAG Art(bep,onzijd,neut)","N(soort,ev,neut) Int CURWD oh","V(intrans,ott,1,ev) N(soort,ev,neut) NEXT1OR2OR3TAG Prep(voor)","Pron(aanw,neut,zelfst) Pron(betr,neut,zelfst) SURROUNDTAG Punc(komma) Adv(gew,geen_func,stell,onverv)","Adj(zelfst,stell,verv_mv) N(soort,mv,neut) CURWD armen","V(trans,ott,1,ev) V(intrans,ovt,1_of_2_of_3,ev) NEXT1OR2WD in","V(intrans,inf) N(soort,mv,neut) WDNEXTTAG verschillen Prep(voor)","Prep(voor) V(trans,imp) NEXTTAG Pron(aanw,neut,attr)","N(eigen,ev,neut) Art(bep,zijd_of_mv,neut) WDNEXTTAG DE N(eigen,ev,neut)","Adv(gew,aanw) Conj(onder,met_fin) WDAND2TAGBFR Art(bep,zijd_of_mv,neut) toen","V(trans,ovt,1_of_2_of_3,mv) V(trans,ott,1_of_2_of_3,mv) NEXTTAG Pron(per,3,ev_of_mv,nom)","V(trans,ovt,1_of_2_of_3,ev) Conj(onder,met_fin) CURWD zodra","V(intrans,verl_dw,verv_neut) V(intrans,ovt,1_of_2_of_3,ev) CURWD gebeurde","V(intrans,teg_dw,onverv) Adv(gew,geen_func,stell,onverv) CURWD dringend","V(hulp,ovt,1_of_2_of_3,ev) Adj(attr,stell,verv_neut) PREV1OR2TAG Prep(voor)","V(intrans,ott,3,ev) N(soort,ev,neut) PREVTAG Adj(attr,stell,verv_neut)","V(hulp,inf) Num(hoofd,bep,attr,onverv) CURWD veertien","Prep(voor) N(soort,mv,neut) NEXTWD zijn","Num(hoofd,onbep,zelfst,stell,onverv) Num(hoofd,onbep,attr,stell,onverv) NEXTTAG N(soort,mv,neut)","Art(bep,zijd_of_mv,gen) N(eigen,ev,neut) PREVTAG N(eigen,ev,neut)","N(eigen,ev,neut) N(soort,ev,neut) PREVTAG Adj(attr,overtr,verv_neut)"]}');

/***/ }),

/***/ 1970:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"rules":["VBD NN PREV-TAG DT","VBP NN PREV-TAG DT","VB NN PREV-TAG DT","NN CD CURRENT-WORD-IS-NUMBER YES","NNP CD CURRENT-WORD-IS-NUMBER YES","NNS CD CURRENT-WORD-IS-NUMBER YES","NNPS CD CURRENT-WORD-IS-NUMBER YES","NN URL CURRENT-WORD-IS-URL YES","NNS URL CURRENT-WORD-IS-URL YES","NNP URL CURRENT-WORD-IS-URL YES","NNPS URL CURRENT-WORD-IS-URL YES","NN VBN CURRENT-WORD-ENDS-WITH ed","* RB CURRENT-WORD-ENDS-WITH ly","NN JJ CURRENT-WORD-ENDS-WITH al","NNS JJ CURRENT-WORD-ENDS-WITH al","NN VB PREV-WORD-IS would","NN NNS CURRENT-WORD-ENDS-WITH s","NN VBG CURRENT-WORD-ENDS-WITH ing"]}');

/***/ }),

/***/ 7097:
/***/ ((module) => {

"use strict";
module.exports = {"version":"3.1.14"};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/natural/lib/natural/index.js
var natural = __webpack_require__(1478);
;// CONCATENATED MODULE: ./src/search-engine.ts

//let natural = require("natural");
//let TfIdf = natural.TfIdf;
// let PorterStemmer = natural.PorterStemmer;
// let WordTokenizer = natural.WordTokenizer;
// let LevenshteinDistance = natural.LevenshteinDistance;
var Term = /** @class */ (function () {
    function Term() {
        this.term = "";
        this.count = 0;
    }
    return Term;
}());
var Result = /** @class */ (function () {
    function Result() {
        this.documentKey = "";
        this.measure = 0;
    }
    return Result;
}());

var SearchEngine = /** @class */ (function () {
    function SearchEngine() {
        this.recommendationCallback = function (tokens, recommendations) { };
        this.resultCallback = function (results) { };
        this.tokenizer = null;
        this.documents = [];
        this.stemmedWords = new Map();
        this.tokenizer = new natural.WordTokenizer();
    }
    SearchEngine.prototype.setTfidf = function (json) {
        var data;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        else {
            data = json;
        }
        this.documents = data.documents;
        for (var i = 0; i < this.documents.length; i++) {
            for (var key in this.documents[i]) {
                if (key != "__key") {
                    var stemmed = natural.PorterStemmer.stem(key);
                    if (!this.stemmedWords.has(stemmed)) {
                        this.stemmedWords.set(stemmed, []);
                    }
                    var mapEntry = this.stemmedWords.get(stemmed) || [];
                    mapEntry.push(key);
                    this.stemmedWords.set(stemmed, mapEntry);
                }
            }
        }
        this.tfidf = new natural.TfIdf(data);
    };
    SearchEngine.prototype.setRecommendationCallback = function (fkt) {
        this.recommendationCallback = fkt;
    };
    SearchEngine.prototype.setResultCallback = function (fkt) {
        this.resultCallback = fkt;
    };
    SearchEngine.prototype.setQuery = function (query) {
        var _this = this;
        var results = [];
        var recommendations = [];
        var tokens = [];
        var isForCurrentToken = false;
        if (this.tfidf) {
            if (query) {
                tokens = this.tokenizer.tokenize(query.toLowerCase());
                if (tokens.length > 0) {
                    var stemmedTokens = [];
                    for (var i = 0; i < tokens.length; i++) {
                        stemmedTokens.push(natural.PorterStemmer.stem(tokens[i]));
                    }
                    var lastStemmedToken = stemmedTokens[stemmedTokens.length - 1];
                    var notFoundStemmedTokens = [];
                    for (var i = 0; i < stemmedTokens.length; i++) {
                        if (!this.stemmedWords.has(stemmedTokens[i])) {
                            notFoundStemmedTokens.push(stemmedTokens[i]);
                        }
                    }
                    if (notFoundStemmedTokens.length > 0
                        && notFoundStemmedTokens[notFoundStemmedTokens.length - 1] == lastStemmedToken) {
                        recommendations = this.recommentForIncompleteLastToken(tokens, lastStemmedToken, recommendations);
                        isForCurrentToken = true;
                    }
                }
                var possibleResults_1 = [];
                this.tfidf.tfidfs(query, function (i, measure) {
                    if (measure != 0) {
                        var result = {
                            documentKey: _this.documents[i]["__key"],
                            measure: measure
                        };
                        var terms = _this.tfidf.listTerms(i);
                        possibleResults_1.push({ terms: terms, result: result });
                    }
                });
                if (possibleResults_1.length == 0) {
                    recommendations = this.recommentForIncompleteLastToken(tokens, query, recommendations);
                    isForCurrentToken = true;
                }
                else {
                    possibleResults_1.sort(function (a, b) { return b.result.measure - a.result.measure; });
                    results = possibleResults_1.map(function (value) { return value.result; });
                    if (recommendations.length == 0) {
                        var possibleRecommendations_1 = [];
                        possibleResults_1.forEach(function (value) {
                            var terms = value.terms;
                            for (var i = 0; i < terms.length; i++) {
                                possibleRecommendations_1.push({ term: terms[i].term, count: terms[i].tfidf });
                            }
                        });
                        possibleRecommendations_1.sort(function (a, b) { return b.count - a.count; });
                        for (var i = 0; i < possibleRecommendations_1.length; i++) {
                            if (recommendations.length < 100
                                && !tokens.includes(possibleRecommendations_1[i].term)
                                && !recommendations.includes(possibleRecommendations_1[i].term)) {
                                recommendations.push(possibleRecommendations_1[i].term);
                            }
                        }
                        isForCurrentToken = false;
                    }
                }
            }
        }
        this.recommendationCallback(tokens, recommendations, isForCurrentToken);
        this.resultCallback(results);
    };
    SearchEngine.prototype.recommentForIncompleteLastToken = function (tokens, lastStemmedToken, recommendations) {
        var possibleRecommendations = [];
        this.stemmedWords.forEach(function (originalWords, stemmedWord) {
            var distance = (0,natural.LevenshteinDistance)(lastStemmedToken, stemmedWord);
            if (distance < 5) {
                if (possibleRecommendations.length <= distance
                    || possibleRecommendations[distance] == undefined) {
                    possibleRecommendations[distance] = [];
                }
                for (var i = 0; i < Math.min(originalWords.length, 100); i++) {
                    if (!possibleRecommendations[distance].includes(originalWords[i])
                        && !tokens.includes(originalWords[i])) {
                        possibleRecommendations[distance].push(originalWords[i]);
                    }
                }
            }
        });
        for (var i = 0; i < possibleRecommendations.length; i++) {
            if (possibleRecommendations[i]) {
                var documentCounts = [];
                var _loop_1 = function (j) {
                    var term = new Term();
                    term.term = possibleRecommendations[i][j];
                    this_1.tfidf.tfidfs(possibleRecommendations[i][j], function (i, measure) {
                        if (measure != 0) {
                            term.count++;
                        }
                    });
                    documentCounts.push(term);
                };
                var this_1 = this;
                for (var j = 0; j < possibleRecommendations[i].length; j++) {
                    _loop_1(j);
                }
                documentCounts.sort(function (a, b) { return b.count - a.count; });
                for (var j = 0; j < documentCounts.length; j++) {
                    recommendations.push(documentCounts[j].term);
                }
            }
        }
        return recommendations;
    };
    return SearchEngine;
}());


;// CONCATENATED MODULE: ./src/render.ts

var maxRecommendations = 10;
var maxResults = 10;
var model = {
    prefixRecommendations: [],
    recommendations: [],
    results: [],
    currentQuery: "",
    tokens: [],
    currentRecommendationIndex: -1,
    isForCurrentToken: false
};
var engine = new SearchEngine();
$(window).on('load', function () {
    $.get("/website/components/header/search-engine/meta.json?d=" + new Date(), function (metadata, status) {
        console.log(status, metadata);
        if (status == "success") {
            var load = true;
            if (window.localStorage) {
                if (window.localStorage.meta) {
                    var meta = JSON.parse(window.localStorage.meta);
                    if (meta.date == metadata.date) {
                        load = false;
                    }
                    else {
                        window.localStorage.clear();
                    }
                }
                window.localStorage.meta = JSON.stringify(metadata);
            }
            if (load || !window.localStorage.tfidf) {
                $.get("/website/components/header/search-engine/tfidf.json?d=" + new Date(), function (data, status) {
                    console.log(status, data);
                    if (status == "success") {
                        setTimeout(function () {
                            engine.setTfidf(data);
                            window.localStorage.tfidf = JSON.stringify(data);
                            console.log("done");
                        }, 50);
                    }
                });
            }
            else {
                setTimeout(function () {
                    engine.setTfidf(window.localStorage.tfidf);
                    console.log("done");
                }, 50);
            }
        }
    });
    registerSearchEvents();
    engine.setRecommendationCallback(function (tokens, recommendations, isForCurrentToken) {
        model.tokens = tokens;
        model.prefixRecommendations = [];
        model.recommendations = [];
        model.currentRecommendationIndex = -1;
        model.isForCurrentToken = isForCurrentToken;
        for (var i = 0; i < recommendations.length; i++) {
            if (isForCurrentToken && recommendations[i].startsWith(model.tokens[model.tokens.length - 1])) {
                model.prefixRecommendations.push(recommendations[i]);
            }
        }
        for (var i = 0; i < recommendations.length; i++) {
            if (!model.prefixRecommendations.includes(recommendations[i])) {
                model.recommendations.push(recommendations[i]);
            }
        }
        render();
    });
    engine.setResultCallback(function (results) {
        model.results = results;
        render();
    });
});
function render() {
    console.log("model", model);
    ensureDivs();
    if (model.results.length > 0 || model.recommendations.length > 0 || model.prefixRecommendations.length > 0) {
        renderRecommendations();
        renderResults();
    }
    else {
        renderNoResults();
    }
    showResultPanel();
}
function renderRecommendations() {
    $('#recommendations').html('');
    var addedRecommendationsCount = 0;
    var _loop_1 = function (i) {
        var postfix = model.prefixRecommendations[i].substring(model.tokens[model.tokens.length - 1].length);
        if (addedRecommendationsCount < maxRecommendations) {
            var highlightClass = (addedRecommendationsCount == model.currentRecommendationIndex) ? "highlight" : "";
            var div = $("<div class=\"recommendation " + highlightClass + "\">" + model.currentQuery + "<span class=\"highlightText\">" + postfix + "</span></div>");
            var id_1 = addedRecommendationsCount;
            div.on("click", function () {
                clickRecommendation(id_1);
            });
            $('#recommendations').append(div);
            addedRecommendationsCount++;
        }
    };
    for (var i = 0; i < model.prefixRecommendations.length; i++) {
        _loop_1(i);
    }
    var prefix = "";
    var highlightTextClass = "";
    if (!model.isForCurrentToken) {
        prefix = model.currentQuery + " ";
        highlightTextClass = "highlightText";
    }
    var _loop_2 = function (i) {
        if (addedRecommendationsCount < maxRecommendations) {
            var highlightClass = (addedRecommendationsCount == model.currentRecommendationIndex) ? "highlight" : "";
            var div = $("<div class=\"recommendation " + highlightClass + "\">" + prefix + "<span class=\"" + highlightTextClass + "\">" + model.recommendations[i] + "</span></div>");
            var id_2 = addedRecommendationsCount;
            div.on("click", function () {
                clickRecommendation(id_2);
            });
            $('#recommendations').append(div);
            addedRecommendationsCount++;
        }
    };
    for (var i = 0; i < model.recommendations.length; i++) {
        _loop_2(i);
    }
}
function clickRecommendation(id) {
    var searchField = document.getElementById("search-field");
    if (searchField) {
        takeOverRecommendationToSearchField(id);
        model.currentQuery = searchField.value;
        setTimeout(triggerSearch, 1);
    }
}
function takeOverRecommendationToSearchField(id) {
    var searchField = document.getElementById("search-field");
    if (searchField) {
        model.currentRecommendationIndex = id;
        if (model.currentRecommendationIndex >= 0) {
            if (model.currentRecommendationIndex < model.prefixRecommendations.length) {
                var postfix = model.prefixRecommendations[model.currentRecommendationIndex].substring(model.tokens[model.tokens.length - 1].length);
                searchField.value = model.currentQuery + postfix;
            }
            else if (model.currentRecommendationIndex < model.prefixRecommendations.length + model.recommendations.length) {
                if (model.isForCurrentToken) {
                    searchField.value = model.currentQuery.substring(0, model.currentQuery.length - model.tokens[model.tokens.length - 1].length) + model.recommendations[model.currentRecommendationIndex - model.prefixRecommendations.length];
                }
                else {
                    searchField.value = model.currentQuery + ' ' + model.recommendations[model.currentRecommendationIndex - model.prefixRecommendations.length];
                }
            }
            else {
                searchField.value = model.currentQuery;
            }
        }
        renderRecommendations();
    }
}
function renderResults() {
    $('#results').html('');
    var addedResultsCount = 0;
    var _loop_3 = function (i) {
        if (addedResultsCount < 10) {
            if (window.localStorage && window.localStorage["result_" + model.results[i].documentKey]) {
                var data = JSON.parse(window.localStorage["result_" + model.results[i].documentKey]);
                $('#results').append("<div class=\"result\" id=\"result_" + model.results[i].documentKey + "\">" + searchResultHtml(data) + "</div>");
            }
            else {
                $('#results').append("<div class=\"result\" id=\"result_" + model.results[i].documentKey + "\">\n            " + createResultDummy() + "\n          </div>");
                $.get("/website/components/header/search-engine/results/" + model.results[i].documentKey + ".json?d=" + new Date(), function (data, status) {
                    console.log(status, data);
                    if (status == "success") {
                        $("#result_" + model.results[i].documentKey).html(searchResultHtml(data));
                        if (window.localStorage) {
                            try {
                                window.localStorage["result_" + model.results[i].documentKey] = JSON.stringify(data);
                            }
                            catch (e) { }
                        }
                    }
                });
            }
        }
        addedResultsCount++;
    };
    for (var i = 0; i < model.results.length; i++) {
        _loop_3(i);
    }
}
function searchResultHtml(data) {
    if (data.type == "doc") {
        var breadcrumbs = data.breadcrumbs.join(" > ");
        for (var i = 0; i < model.tokens.length; i++) {
            var regex = new RegExp('\\b' + model.tokens[i] + '\\b', 'igm');
            breadcrumbs = breadcrumbs.replace(regex, '<span class="highlightText">$&</span>');
        }
        return "<a href=\"/website/pages/docs/" + data.filename + "#" + data.anchor + "\">" + data.title + "</a>\n            <span class=\"breadcrumbs\">" + breadcrumbs + "</span>\n            <div class=\"snippet\">" + getSnippet(data.text) + "</div>";
    }
    else if (data.type == "solution") {
        return "<a href=\"/website/pages/architectures/solutions/" + data.filename.replace(/[\/\\]index\.asciidoc$/, '') + "\">" + data.title + "</a>\n            <span class=\"breadcrumbs\">Solution</span>\n            <div class=\"snippet\">" + getSnippet(data.text) + "</div>";
    }
    return "";
}
function getSnippet(text) {
    var possibleResults = [];
    for (var i = 0; i < model.tokens.length; i++) {
        var regex = new RegExp('\\b.{0,50}\\b' + model.tokens[i] + '\\b.{0,50}\\b', 'igm');
        var regexMatch = null;
        while ((regexMatch = regex.exec(text)) !== null) {
            possibleResults.push({ result: regexMatch[0], count: 0 });
        }
    }
    for (var i = 0; i < possibleResults.length; i++) {
        for (var j = 0; j < model.tokens.length; j++) {
            var regex = new RegExp('\\b' + model.tokens[j] + '\\b', 'igm');
            if (regex.test(possibleResults[i].result)) {
                possibleResults[i].result = possibleResults[i].result.replace(regex, '<span class="highlightText">$&</span>');
                possibleResults[i].count++;
            }
        }
    }
    possibleResults.sort(function (a, b) {
        var result = b.count - a.count;
        if (result == 0) {
            result = b.result.length - a.result.length;
        }
        return result;
    });
    if (possibleResults.length > 0) {
        return possibleResults[0].result;
    }
    return text.substr(0, 100);
}
function renderLoadingResults() {
    ensureDivs();
    if ($('#recommendations .ssc-head-line').length != 7) {
        $('#recommendations').html(createRecommendationDummy() +
            createRecommendationDummy() +
            createRecommendationDummy() +
            createRecommendationDummy() +
            createRecommendationDummy() +
            createRecommendationDummy() +
            createRecommendationDummy());
    }
    if ($('#results .ssc-head-line').length != 9) {
        $('#results').html(createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy() +
            createResultDummy());
    }
}
function createRecommendationDummy() {
    return "<div class=\"ssc-head-line w-" + getRandomInt(2, 8) + "0 mbs\"></div>";
}
function createResultDummy() {
    return "\n    <div class=\"flex align-center\">\n      <div class=\"ssc-head-line w-" + getRandomInt(3, 8) + "0 mrs mbs\"></div>\n      <div class=\"ssc-line w-" + getRandomInt(2, 8) + "0\"></div>\n    </div>\n    <div class=\"ssc-line w-" + getRandomInt(3, 8) + "0 mb\"></div>";
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function renderNoResults() {
    $('#recommendations').html("No results");
    $('#results').html("");
}
function ensureDivs() {
    if ($('#recommendations').length == 0) {
        $("#search-results-box").html('<div id="recommendations" class="ssc ssc-wrapper"></div><div id="results" class="ssc ssc-wrapper"></div>');
    }
}
function showResultPanel() {
    $("#search-results-box").removeClass("hidden");
    $("#click-outside").removeClass("hidden");
    registerOnClickOutside();
}
function hideResultPanel() {
    $("#search-results-box").addClass("hidden");
    $("#click-outside").addClass("hidden");
}
function triggerSearch() {
    engine.setQuery(model.currentQuery);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'search',
        'searchTerm': model.currentQuery
    });
}
function registerSearchEvents() {
    var searchField = document.getElementById("search-field");
    if (searchField) {
        var timer_1 = null;
        searchField.onkeydown = function (e) {
            if (e.key == "Enter") {
                e.preventDefault();
            }
        };
        searchField.onkeyup = function (e) {
            if (e.key == "Enter" || e.key == "ArrowRight") {
                renderLoadingResults();
                model.currentQuery = searchField.value;
                e.preventDefault();
                if (timer_1) {
                    clearTimeout(timer_1);
                }
                timer_1 = setTimeout(triggerSearch, 1);
            }
            else if (e.key == "Backspace") {
                renderLoadingResults();
                //model.currentQuery = model.currentQuery.slice(0, Math.max(1, searchField.selectionStart || 1) - 1) + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
                model.currentQuery = searchField.value;
                if (timer_1) {
                    clearTimeout(timer_1);
                }
                timer_1 = setTimeout(triggerSearch, 1000);
            }
            else if (e.key == "Clear" || e.key == "Esc" || e.key == "Escape") {
                renderLoadingResults();
                model.currentQuery = "";
                if (timer_1) {
                    clearTimeout(timer_1);
                }
                timer_1 = setTimeout(triggerSearch, 1);
            }
            else if (e.key == "ArrowUp" || e.key == "Up") {
                e.preventDefault();
                takeOverRecommendationToSearchField(Math.max(-1, model.currentRecommendationIndex - 1));
            }
            else if (e.key == "ArrowDown" || e.key == "Down") {
                e.preventDefault();
                takeOverRecommendationToSearchField(Math.min(maxRecommendations - 1, model.currentRecommendationIndex + 1, model.prefixRecommendations.length + model.recommendations.length));
            }
            /*else if (e.key == "ArrowRight") {
              let postfix = model.recommendations[model.currentRecommendationIndex].substring(model.tokens[model.tokens.length - 1].length);
              model.currentQuery = model.currentQuery + postfix;
              renderInlineRecommendation();
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(triggerSearch, 1);
            }*/
            else {
                renderLoadingResults();
                showResultPanel();
                //model.currentQuery = model.currentQuery.slice(0, searchField.selectionStart || 0) + e.key + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
                model.currentQuery = searchField.value;
                if (timer_1) {
                    clearTimeout(timer_1);
                }
                timer_1 = setTimeout(triggerSearch, 1000);
            }
        };
        /*searchField.addEventListener("selectionchange", () => {
          if (timer) {
            clearTimeout(timer);
          }
    
          timer = setTimeout(triggerSearch, 500);
        });*/
        searchField.onpaste = function (e) {
            if (timer_1) {
                clearTimeout(timer_1);
            }
            //model.currentQuery = model.currentQuery.slice(0, searchField.selectionStart || 0) + e.clipboardData?.getData("text") || "" + model.currentQuery.slice(searchField.selectionEnd || model.currentQuery.length);
            model.currentQuery = searchField.value;
            timer_1 = setTimeout(triggerSearch, 100);
        };
        /*$("#search-field").change(function () {
          if (timer) {
            clearTimeout(timer);
          }
    
          timer = setTimeout(triggerSearch, 1000);
        });*/
    }
}
function registerOnClickOutside() {
    var element = document.getElementById("click-outside");
    if (element) {
        element.addEventListener("click", function (event) {
            hideResultPanel();
            event.stopPropagation();
        });
    }
}

})();

/******/ })()
;