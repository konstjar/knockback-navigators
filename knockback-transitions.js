/*
  knockback-transitions.js 0.1.1
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/knockback/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('knockback-transitions', factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {// Generated by CoffeeScript 1.6.2
var e, extractStyles, isElement, kb, wrapAnimCallback, _anim_fn;

try {
  this.kb = kb = !this.kb && (typeof require !== 'undefined') ? require('knockback') : this.kb;
} catch (_error) {
  e = _error;
  ({});
}

this.kb || (this.kb = kb || (kb = {}));

isElement = function(obj) {
  return obj && (obj.nodeType === 1);
};

kb.transitions || (kb.transitions = {});

kb.fallback_transitions || (kb.fallback_transitions = {});

kb.MAX_TRANSITION = 2000;

kb.transitions.END_EVENT = (function() {
  var END_EVENT_NAMES, el;

  el = document.createElement('knockback');
  END_EVENT_NAMES = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd otransitionend',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  };
  return 'kbTransitionEnd';
})();

kb.active_transitions = (kb.transitions.END_EVENT === 'kbTransitionEnd' ? kb.fallback_transitions : kb.transitions);

$.fn.startTransition = function(classes, callback) {
  var cleanupCallback, timeout,
    _this = this;

  if (typeof classes === 'function') {
    callback = classes;
    classes = null;
  }
  timeout = null;
  cleanupCallback = function() {
    _this.off(kb.transitions.END_EVENT, cleanupCallback);
    clearTimeout(timeout);
    return !callback || callback();
  };
  this.one(kb.transitions.END_EVENT, cleanupCallback);
  this.addClass(classes);
  timeout = setTimeout(cleanupCallback, kb.MAX_TRANSITION);
};

$.fn.stopTransition = function() {
  this.trigger(kb.transitions.END_EVENT);
};

extractStyles = function(el) {
  var name, style, styles, _ref;

  styles = {};
  _ref = el.style;
  for (name in _ref) {
    style = _ref[name];
    if (!style) {
      continue;
    }
    styles[name] = style;
  }
  return styles;
};

kb.TransitionSavedState = (function() {
  function TransitionSavedState(info) {
    var el, name;

    this.el_states = [];
    for (name in info) {
      el = info[name];
      !isElement(el) || this.el_states.push({
        el: el,
        className: el.className,
        cssText: el.style.cssText
      });
    }
    return;
  }

  TransitionSavedState.prototype.restore = function() {
    var el, state, _i, _len, _ref;

    _ref = this.el_states;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      state = _ref[_i];
      el = state.el;
      el.className = state.className;
      el.style.cssText = state.cssText;
    }
    this.el_states = null;
  };

  return TransitionSavedState;

})();

if (typeof exports !== 'undefined') {
  exports.TransitionSavedState = kb.TransitionSavedState;
}

kb.transitions.SlideUp = function(info, options) {
  if (!info.from) {
    info.callback();
    return;
  }
  $(info.to).css({
    'height': $(info.container).height()
  }).startTransition((options.forward ? 'on-top slideup in' : 'on-top slideup out reverse'), info.callback);
};

kb.transitions.FadeIn = function(info, options) {
  var $to, classes;

  $to = $(info.to).css({
    'min-height': $(info.container).height()
  });
  classes = 'on-top fade';
  classes += (options.forward ? ' in' : ' out');
  if (options.slow) {
    classes += ' slow';
  }
  $to.startTransition(classes, info.callback);
};

kb.transitions.Slide = function(info, options) {
  var $from, $to, width;

  if (!info.from) {
    info.callback();
    return;
  }
  width = $(info.container).width();
  $from = $(info.from).css({
    'width': width
  });
  $to = $(info.to).css({
    'width': width
  });
  if (options.forward) {
    $from.startTransition('slide out');
    $to.startTransition('slide in', info.callback);
  } else {
    $to.startTransition('slide out reverse');
    $from.startTransition('slide in reverse', info.callback);
  }
};

if (this.Zepto) {
  wrapAnimCallback = function(el, properties, callback) {
    el.__kb_zepto_endEvent = typeof properties === 'string' ? $.fx.animationEnd : $.fx.transitionEnd;
    el.__kb_zepto_callback = function() {
      if (!el.__kb_zepto_endEvent) {
        return;
      }
      delete el.__kb_zepto_endEvent;
      delete el.__kb_zepto_callback;
      return !callback || callback.call(this);
    };
    return el.__kb_zepto_callback;
  };
  _anim_fn = $.fn.anim;
  $.fn.anim = function(properties, duration, ease, callback) {
    var el, replacement_callback, _i, _len;

    for (_i = 0, _len = this.length; _i < _len; _i++) {
      el = this[_i];
      replacement_callback = wrapAnimCallback(el, properties, callback);
    }
    _anim_fn.call(this, properties, duration, ease, replacement_callback);
    return this;
  };
  $.fn.stop = function() {
    var el, _i, _len;

    for (_i = 0, _len = this.length; _i < _len; _i++) {
      el = this[_i];
      if (el.__kb_zepto_endEvent) {
        $(el).trigger(el.__kb_zepto_endEvent);
      }
    }
    return this;
  };
}

kb.SLIDE_UP_DURATION = 300;

kb.fallback_transitions.SlideUp = function(info, options) {
  var $to, callback, height, top;

  if (!info.from) {
    info.callback();
    return;
  }
  $to = $(info.to);
  callback = function() {
    $to.stop();
    $to.off(kb.transitions.END_EVENT, callback);
    return info.callback();
  };
  height = info.container.clientHeight;
  top = info.to.clientTop;
  if (options.forward) {
    $to.addClass('on-top').css({
      top: top + height
    }).animate({
      top: top
    }, kb.SLIDE_UP_DURATION, 'linear', callback);
  } else {
    $to.addClass('on-top').animate({
      top: top + height
    }, kb.SLIDE_UP_DURATION, 'linear', callback);
  }
  $to.one(kb.transitions.END_EVENT, callback);
};

kb.FADE_IN_DURATION = 300;

kb.fallback_transitions.FadeIn = function(info, options) {
  var $to, callback;

  $to = $(info.to);
  callback = function() {
    $to.stop();
    $to.off(kb.transitions.END_EVENT, callback);
    return info.callback();
  };
  $to.css({
    'min-height': $(info.container).height()
  });
  if (options.forward) {
    $to.css({
      'opacity': 0
    });
    $to.animate({
      'opacity': 1
    }, kb.FADE_IN_DURATION, 'swing', info.callback);
  } else {
    $to.css({
      'opacity': 1
    });
    $to.animate({
      'opacity': 0
    }, kb.FADE_IN_DURATION, 'swing', info.callback);
  }
  $to.one(kb.transitions.END_EVENT, callback);
};

kb.SLIDE_DURATION = 300;

kb.fallback_transitions.Slide = function(info, options) {
  var $from, $to, callback, duration, from_left, to_left, width;

  if (!info.from) {
    info.callback();
    return;
  }
  $to = $(info.to);
  $from = $(info.from);
  callback = function() {
    $to.stop();
    $from.stop();
    $to.off(kb.transitions.END_EVENT, callback);
    return info.callback();
  };
  width = $(info.container).width();
  duration = kb.SLIDE_DURATION;
  if (options.forward) {
    $from.animate({
      left: info.from.clientLeft - width
    }, duration, 'linear');
    to_left = info.to.clientLeft;
    $to.css({
      left: to_left + width
    }).animate({
      left: to_left
    }, duration, 'linear', callback);
  } else {
    from_left = info.from.clientLeft;
    $from.css({
      left: from_left - width
    }).animate({
      left: from_left
    }, duration, 'linear');
    $to.animate({
      left: info.to.clientLeft + width
    }, duration, 'linear', callback);
  }
  return $to.one(kb.transitions.END_EVENT, callback);
};

return;
; return kb;});
}).call(this);