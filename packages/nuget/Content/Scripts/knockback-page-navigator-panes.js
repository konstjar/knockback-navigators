// Generated by CoffeeScript 1.3.3

/*
  knockback-navigators.js 0.1.1
  (c) 2012 Kevin Malakoff.
  KnockbackNavigators.js is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback-navigators/blob/master/LICENSE
  Dependencies: None
*/


(function() {
  var bind, kb, ko, throwUnexpected, _;

  throwUnexpected = function(instance, message) {
    throw "" + instance.constructor.name + ": " + message + " is unexpected";
  };

  try {
    kb = typeof require !== 'undefined' ? require('knockback') : this.kb;
  } catch (e) {
    ({});
  }

  this.kb = kb || (kb = {});

  try {
    ko = typeof require !== 'undefined' ? require('knockout') : this.ko;
  } catch (e) {
    ({});
  }

  ko || (ko = {});

  if (!ko.observable) {
    ko.dataFor = function(el) {
      return null;
    };
    ko.removeNode = function(el) {
      return $(el).remove();
    };
    ko.observable = function(initial_value) {
      var value;
      value = initial_value;
      return function(new_value) {
        if (arguments.length) {
          return value = new_value;
        } else {
          return value;
        }
      };
    };
    ko.observableArray = function(initial_value) {
      var observable;
      observable = ko.observable(arguments.length ? initial_value : []);
      observable.push = function() {
        return observable().push.apply(observable(), arguments);
      };
      observable.pop = function() {
        return observable().pop.apply(observable(), arguments);
      };
      return observable;
    };
  }

  _ = this._ ? this._ : (kb._ ? kb._ : {});

  if (!_.bindAll) {
    bind = function(obj, fn_name) {
      var fn;
      fn = obj[fn_name];
      return obj[fn_name] = function() {
        return fn.apply(obj, arguments);
      };
    };
    _.bindAll = function(obj, fn_name1) {
      var fn_name, _i, _len, _ref;
      _ref = Array.prototype.slice.call(arguments, 1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fn_name = _ref[_i];
        bind(obj, fn_name);
      }
    };
  }

  if (!_.isElement) {
    _.isElement = function(obj) {
      return obj && (obj.nodeType === 1);
    };
  }

  if (this.x$) {
    this.$ = this.x$;
  }

  kb.PageNavigatorPanes = (function() {

    function PageNavigatorPanes(el, options) {
      if (options == null) {
        options = {};
      }
      el || throwMissing(this, 'el');
      _.bindAll(this, 'hasHistory', 'activePage', 'previousPage', 'activeUrl', 'loadPage', 'goBack', 'dispatcher');
      this.el = el.length ? el[0] : el;
      $(this.el).addClass('page');
      this.pane_navigator = new kb.PaneNavigator(el, options);
    }

    PageNavigatorPanes.prototype.destroy = function() {
      this.destroyed = true;
      this.el = null;
      this.pane_navigator.destroy();
      return this.pane_navigator = null;
    };

    PageNavigatorPanes.prototype.hasHistory = function() {
      return !this.pane_navigator.no_history;
    };

    PageNavigatorPanes.prototype.activePage = function() {
      return this.pane_navigator.activePane();
    };

    PageNavigatorPanes.prototype.activeUrl = function() {
      var active_page;
      if ((active_page = this.pane_navigator.activePane())) {
        return active_page.url;
      } else {
        return null;
      }
    };

    PageNavigatorPanes.prototype.previousPage = function() {
      return this.pane_navigator.previousPane();
    };

    PageNavigatorPanes.prototype.previousUrl = function() {
      var previous_page;
      if ((previous_page = this.pane_navigator.previousPage())) {
        return previous_page.url;
      } else {
        return null;
      }
    };

    PageNavigatorPanes.prototype.loadPage = function(info) {
      var active_page, transition;
      if (!info) {
        throw 'missing page info';
      }
      transition = kb.popOverrideTransition();
      if (this.activeUrl() === window.location.hash) {
        active_page = this.activePage();
        active_page.el || pane_navigator.ensureElement(active_page);
        if (active_page.el.parentNode !== this.el) {
          $(this.el).append(active_page.el);
        }
        return active_page;
      }
      return this.pane_navigator.push(new kb.Pane(info, window.location.hash), transition ? {
        transition: transition
      } : null);
    };

    PageNavigatorPanes.prototype.goBack = function() {
      var active_page, transition;
      transition = kb.popOverrideTransition();
      this.pane_navigator.pop();
      !(active_page = this.pane_navigator.activePane()) || kb.loadUrl(active_page.url);
      return active_page;
    };

    PageNavigatorPanes.prototype.dispatcher = function(callback) {
      var page_navigator;
      page_navigator = this;
      return function() {
        if (page_navigator.destroyed) {
          return;
        }
        return page_navigator.routeTriggered(this, callback, arguments);
      };
    };

    PageNavigatorPanes.prototype.routeTriggered = function(router, callback, args) {
      var active_page, previous_page, url;
      url = window.location.hash;
      if ((active_page = this.activePage()) && (active_page.url === window.location.hash)) {
        return this.loadPage(active_page);
      } else if ((previous_page = this.previousPage()) && (previous_page.url === url)) {
        return this.goBack();
      } else if (callback) {
        return callback.apply(router, args);
      }
    };

    return PageNavigatorPanes;

  })();

  if (typeof exports !== 'undefined') {
    exports.PageNavigatorPanes = kb.PageNavigatorPanes;
  }

  if (ko && ko.bindingHandlers) {
    ko.bindingHandlers['PageNavigatorPanes'] = {
      'init': function(element, value_accessor, all_bindings_accessor, view_model) {
        var options, page_navigator;
        options = ko.utils.unwrapObservable(value_accessor());
        if (!('no_remove' in options)) {
          options.no_remove = true;
        }
        page_navigator = new kb.PageNavigatorPanes(element, options);
        kb.utils.wrappedPageNavigator(element, page_navigator);
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
          if (typeof options.unloaded === "function") {
            options.unloaded(page_navigator);
          }
          return kb.utils.wrappedPageNavigator(element, null);
        });
        return typeof options.loaded === "function" ? options.loaded(page_navigator) : void 0;
      }
    };
  }

  kb.PaneNavigator = (function() {

    function PaneNavigator(el, options) {
      var key, value;
      el || throwMissing(this, 'el');
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
      this.panes = ko.observableArray();
      this.el = el && el.length ? el[0] : el;
      $(this.el).addClass('pane-navigator');
    }

    PaneNavigator.prototype.destroy = function() {
      this.el = null;
      return this.clear({
        silent: true
      });
    };

    PaneNavigator.prototype.clear = function(options) {
      var active_pane, array, pane, panes;
      if (options == null) {
        options = {};
      }
      this.cleanupTransition(true);
      if ((active_pane = this.activePane())) {
        active_pane.destroy(this);
      }
      array = this.panes();
      panes = array.slice();
      panes.pop();
      array.splice(0, array.length);
      while (pane = panes.pop()) {
        if (pane.el) {
          pane.destroy(this);
        }
      }
      if (!options.silent) {
        this.panes([]);
      }
      return this;
    };

    PaneNavigator.prototype.activePane = function() {
      return this.paneAt(-1);
    };

    PaneNavigator.prototype.previousPane = function() {
      return this.paneAt(-2);
    };

    PaneNavigator.prototype.paneAt = function(offset) {
      var index, panes;
      panes = this.panes();
      index = offset < 0 ? panes.length + offset : offset;
      if (index >= 0 && index < panes.length) {
        return panes[index];
      } else {
        return null;
      }
    };

    PaneNavigator.prototype.push = function(active_pane, options) {
      var clean_up_fn, cleaned_up, previous_pane,
        _this = this;
      if (options == null) {
        options = {};
      }
      if (!active_pane) {
        return;
      }
      this.cleanupTransition(true);
      if ('transition' in options) {
        active_pane.transition = options.transition;
      }
      active_pane.activate(this.el);
      if (options.silent) {
        this.panes().push(active_pane);
      } else {
        this.panes.push(active_pane);
      }
      previous_pane = this.previousPane();
      cleaned_up = false;
      clean_up_fn = function() {
        var panes;
        if (cleaned_up) {
          return;
        }
        cleaned_up = true;
        _this.cleanupTransition();
        if (previous_pane) {
          if (_this.no_history) {
            panes = _this.panes();
            panes.splice(_.indexOf(panes, previous_pane), 1);
            return previous_pane.destroy(_this);
          } else {
            return previous_pane.deactivate(_this);
          }
        }
      };
      if (active_pane && (active_pane.transition || this.transition)) {
        this.startTransition(active_pane, previous_pane, clean_up_fn, true);
      } else {
        clean_up_fn();
      }
      return active_pane;
    };

    PaneNavigator.prototype.pop = function(options) {
      var active_pane, clean_up_fn, cleaned_up, previous_pane,
        _this = this;
      if (options == null) {
        options = {};
      }
      previous_pane = this.previousPane();
      if (!previous_pane) {
        return null;
      }
      this.cleanupTransition(true);
      active_pane = this.activePane();
      if ('transition' in options) {
        active_pane.transition = options.transition;
      }
      this.panes.pop();
      cleaned_up = false;
      clean_up_fn = function() {
        if (cleaned_up) {
          return;
        }
        cleaned_up = true;
        _this.cleanupTransition();
        if (active_pane) {
          return active_pane.destroy(_this);
        }
      };
      if (active_pane && (active_pane.transition || this.transition)) {
        this.startTransition(active_pane, previous_pane, clean_up_fn, false);
      } else {
        clean_up_fn();
      }
      return previous_pane;
    };

    PaneNavigator.prototype.startTransition = function(active_pane, previous_pane, callback, forward) {
      var info, key, options, transition, use_previous, value, _ref, _ref1;
      if (!active_pane) {
        return;
      }
      if (active_pane.transition && active_pane.transition.options) {
        use_previous = active_pane.transition.options.use_previous;
      }
      if (use_previous) {
        _ref = [previous_pane, active_pane], active_pane = _ref[0], previous_pane = _ref[1];
        forward = !forward;
      }
      transition = active_pane.transition ? active_pane.transition : this.transition;
      if (!transition) {
        return null;
      }
      if (typeof transition === 'string') {
        transition = {
          name: transition
        };
      }
      if (!kb.transistions[transition.name]) {
        throw "transition " + transition.name + " not found";
      }
      options = {
        forward: forward
      };
      for (key in transition) {
        value = transition[key];
        options[key] = value;
      }
      if (options.inverse) {
        _ref1 = [previous_pane, active_pane], active_pane = _ref1[0], previous_pane = _ref1[1];
        options.forward = !options.forward;
      }
      delete options.inverse;
      if (active_pane) {
        active_pane.activate(this.el);
      }
      if (previous_pane) {
        previous_pane.activate(this.el);
      }
      info = {
        container_el: this.el,
        from_el: previous_pane ? previous_pane.el : null,
        to_el: active_pane ? active_pane.el : null,
        callback: callback
      };
      this.active_transition = {
        callback: callback,
        transition: new kb.transistions[transition.name](info, options)
      };
      return this.active_transition.transition.start();
    };

    PaneNavigator.prototype.cleanupTransition = function(cancel) {
      var transition;
      if (!this.active_transition) {
        return;
      }
      transition = this.active_transition;
      this.active_transition = null;
      if (cancel) {
        transition.transition.cancel();
      }
      return transition.callback();
    };

    return PaneNavigator;

  })();

  if (typeof exports !== 'undefined') {
    exports.PaneNavigator = kb.PaneNavigator;
  }

  kb.transistions || (kb.transistions = {});

  if (!_.indexOf) {
    _.indexOf = function(array, value) {
      var index, test;
      for (index in array) {
        test = array[index];
        if (test === value) {
          return index;
        }
      }
      return -1;
    };
  }

  kb.utils || (kb.utils = {});

  kb.utils.wrappedPaneNavigator = function(el, value) {
    if ((arguments.length === 1) || (el.__kb_pane_navigator === value)) {
      return el.__kb_pane_navigator;
    }
    if (el.__kb_pane_navigator) {
      el.__kb_pane_navigator.destroy();
    }
    el.__kb_pane_navigator = value;
    return value;
  };

  if ($.fn) {
    $.fn.findByPath = function(path) {
      var $current_el, component, components, current_el, el, results, _i, _j, _len, _len1;
      results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        el = this[_i];
        components = path.split('/');
        current_el = el;
        for (_j = 0, _len1 = components.length; _j < _len1; _j++) {
          component = components[_j];
          if (component[0] === '^') {
            path = component.substring(1);
            if (path) {
              $current_el = $(current_el).closest(path);
              current_el = $current_el.length ? $current_el[0] : null;
            } else {
              current_el = current_el.parentNode;
            }
          } else if (component === '..') {
            current_el = current_el.parentNode;
          } else {
            $current_el = $(current_el).find(component);
            current_el = $current_el.length ? $current_el[0] : null;
          }
          if (!current_el) {
            break;
          }
        }
        if (current_el) {
          results.push(current_el);
        }
      }
      return $(results);
    };
    $.fn.findPaneNavigator = function() {
      var $pane_navigator_el, $parent, el, pane_navigator, pane_navigator_el, path, _i, _j, _len, _len1, _ref;
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        el = this[_i];
        if (path = el.getAttribute('data-path')) {
          $pane_navigator_el = this.findByPath(path);
          if ($pane_navigator_el.length && (pane_navigator = kb.utils.wrappedPaneNavigator($pane_navigator_el[0]))) {
            return pane_navigator;
          } else {
            return null;
          }
        } else {
          $parent = $(el).parent();
          while ($parent.length && !$parent.is('div')) {
            $parent = $parent.parent();
          }
          _ref = $parent.parent().find('.pane-navigator');
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            pane_navigator_el = _ref[_j];
            if ((pane_navigator = kb.utils.wrappedPaneNavigator(pane_navigator_el))) {
              return pane_navigator;
            }
          }
          $pane_navigator_el = $(el).closest('.pane-navigator');
          if ($pane_navigator_el.length && (pane_navigator = kb.utils.wrappedPaneNavigator($pane_navigator_el[0]))) {
            return pane_navigator;
          }
        }
        return null;
      }
    };
  }

  kb.nextPane = function(obj, event) {
    var active_pane, el, next_el, pane_navigator;
    el = _.isElement(obj) ? obj : (obj.currentTarget ? obj.currentTarget : event.currentTarget);
    pane_navigator = $(el).findPaneNavigator();
    if (!(pane_navigator && (active_pane = pane_navigator.activePane()))) {
      return;
    }
    next_el = active_pane.el;
    while ((next_el = next_el.nextSibling)) {
      if (_.isElement(next_el) && $(next_el).hasClass('pane')) {
        break;
      }
    }
    if (next_el) {
      return pane_navigator.push(new kb.Pane(next_el));
    }
  };

  kb.previousPane = function(obj, event) {
    var el, pane_navigator;
    el = _.isElement(obj) ? obj : (obj.currentTarget ? obj.currentTarget : event.currentTarget);
    pane_navigator = $(el).findPaneNavigator();
    if (pane_navigator && pane_navigator.activePane()) {
      return pane_navigator.pop();
    }
  };

  if (ko.bindingHandlers) {
    ko.bindingHandlers['PaneNavigator'] = {
      'init': function(element, value_accessor, all_bindings_accessor, view_model) {
        var options, pane_navigator;
        options = ko.utils.unwrapObservable(value_accessor());
        if (!('no_remove' in options)) {
          options.no_remove = true;
        }
        pane_navigator = new kb.PaneNavigator(element, options);
        kb.utils.wrappedPaneNavigator(element, pane_navigator);
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
          return kb.utils.wrappedPaneNavigator(element, null);
        });
        return $(element).addClass('pane-navigator');
      },
      'update': function(element, value_accessor) {
        var checkPanesForActivate;
        checkPanesForActivate = function() {
          var $pane_els, pane_navigator;
          pane_navigator = kb.utils.wrappedPaneNavigator(element);
          if (pane_navigator.activePane()) {
            return;
          }
          $pane_els = $(pane_navigator.el).children().filter('.pane');
          if ($pane_els.length) {
            return pane_navigator.push(new kb.Pane($pane_els[0]));
          }
        };
        if (element.children.length) {
          return checkPanesForActivate();
        } else {
          return setTimeout(checkPanesForActivate, 0);
        }
      }
    };
  }

  kb.override_transitions = [];

  kb.popOverrideTransition = function() {
    if (kb.override_transitions.length) {
      return kb.override_transitions.pop();
    } else {
      return null;
    }
  };

  kb.loadUrl = function(url, transition) {
    kb.override_transitions.push(transition);
    return window.location.hash = url;
  };

  kb.loadUrlFn = function(url, transition) {
    return function(vm, event) {
      kb.loadUrl(url, transition);
      (!vm || !vm.stopPropagation) || (event = vm);
      if (event && event.stopPropagation) {
        event.stopPropagation();
        return event.preventDefault();
      }
    };
  };

  kb.utils || (kb.utils = {});

  kb.utils.wrappedPageNavigator = function(el, value) {
    if ((arguments.length === 1) || (el.__kb_page_navigator === value)) {
      return el.__kb_page_navigator;
    }
    if (el.__kb_page_navigator) {
      el.__kb_page_navigator.destroy();
    }
    el.__kb_page_navigator = value;
    return value;
  };

  kb.Pane = (function() {

    function Pane(info, url) {
      if (arguments.length) {
        this.url = url;
      }
      this.setInfo(info);
    }

    Pane.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      this.deactivate(options);
      this.removeElement(options, true);
      this.create = null;
      return this.el = null;
    };

    Pane.prototype.setInfo = function(info) {
      var key, value;
      if (_.isElement(info)) {
        this.el = info;
      } else {
        for (key in info) {
          value = info[key];
          this[key] = value;
        }
      }
      if (this.el) {
        $(this.el).addClass('pane');
      }
      return this;
    };

    Pane.prototype.ensureElement = function() {
      var info;
      if (this.el) {
        return this.el;
      }
      if (!this.create) {
        throw 'expecting create';
      }
      info = this.create.apply(this, this.args);
      if (info) {
        this.setInfo(info);
      }
      if (!this.el) {
        throw 'expecting el';
      }
      if (this.el) {
        $(this.el).addClass('pane');
      }
      return this;
    };

    Pane.prototype.removeElement = function(options, force) {
      if (options == null) {
        options = {};
      }
      if (!this.el) {
        return this;
      }
      if (options.no_remove) {
        return;
      }
      if (force || (this.create && !options.no_destroy)) {
        ko.removeNode(this.el);
        this.el = null;
      } else if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      return this;
    };

    Pane.prototype.activate = function(el) {
      var view_model;
      this.ensureElement();
      if ($(this.el).hasClass('active')) {
        return;
      }
      $(this.el).addClass('active');
      if (this.el.parentNode !== el) {
        $(el).append(this.el);
      }
      view_model = this.view_model ? this.view_model : ko.dataFor(this.el);
      if (view_model && view_model.activate) {
        view_model.activate(this);
      }
      return this;
    };

    Pane.prototype.deactivate = function(options) {
      var view_model;
      if (options == null) {
        options = {};
      }
      if (!(this.el && $(this.el).hasClass('active'))) {
        return;
      }
      $(this.el).removeClass('active');
      view_model = this.view_model ? this.view_model : ko.dataFor(this.el);
      if (view_model && view_model.deactivate) {
        view_model.deactivate(this);
      }
      this.removeElement(options);
      return this;
    };

    return Pane;

  })();

  if (typeof exports !== 'undefined') {
    exports.Pane = kb.Pane;
  }

  kb.TransitionSavedState = (function() {

    function TransitionSavedState(info, el_map) {
      var css_keys, el_key;
      this.el_states = [];
      if (!el_map) {
        return;
      }
      for (el_key in el_map) {
        css_keys = el_map[el_key];
        this.push(info[el_key], css_keys);
      }
    }

    TransitionSavedState.prototype.push = function(el, css_keys) {
      var key, state, _i, _len;
      if (!el) {
        return;
      }
      state = {
        className: '' + el.className,
        css: {}
      };
      if (css_keys) {
        for (_i = 0, _len = css_keys.length; _i < _len; _i++) {
          key = css_keys[_i];
          state.css[key] = el.style[key];
        }
      }
      this.el_states.push({
        el: el,
        state: state
      });
      return this;
    };

    TransitionSavedState.prototype.restore = function() {
      var el, entry, key, state, value, _i, _len, _ref, _ref1;
      _ref = this.el_states;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        el = entry.el;
        state = entry.state;
        if (!(el && state)) {
          continue;
        }
        if ('className' in state) {
          el.className = state.className;
        }
        _ref1 = state.css;
        for (key in _ref1) {
          value = _ref1[key];
          el.style[key] = value;
        }
      }
      this.el_states = null;
      return this;
    };

    return TransitionSavedState;

  })();

  if (typeof exports !== 'undefined') {
    exports.TransitionSavedState = kb.TransitionSavedState;
  }

}).call(this);
