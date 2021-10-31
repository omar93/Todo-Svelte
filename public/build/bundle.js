
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\MenuButton.svelte generated by Svelte v3.38.2 */
    const file$7 = "src\\components\\MenuButton.svelte";

    function create_fragment$9(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let div3_class_value;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-excf63");
    			add_location(div0, file$7, 26, 2, 657);
    			attr_dev(div1, "class", "bar2 svelte-excf63");
    			add_location(div1, file$7, 27, 2, 685);
    			attr_dev(div2, "class", "bar3 svelte-excf63");
    			add_location(div2, file$7, 28, 2, 713);
    			attr_dev(div3, "class", div3_class_value = "" + (/*showClass*/ ctx[0] + " container" + " svelte-excf63"));
    			add_location(div3, file$7, 25, 0, 600);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*handleResize*/ ctx[3], false, false, false),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[4]),
    					listen_dev(div3, "click", /*toggle*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showClass*/ 1 && div3_class_value !== (div3_class_value = "" + (/*showClass*/ ctx[0] + " container" + " svelte-excf63"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let innerWidth;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuButton", slots, []);
    	const dispatch = createEventDispatcher();
    	let { showClass = "" } = $$props;

    	const toggle = () => {
    		dispatch("menu");

    		if (innerWidth > 992) {
    			$$invalidate(0, showClass = "");
    		} else if (innerWidth < 992 && showClass === "change") {
    			$$invalidate(0, showClass = "");
    		} else if (innerWidth < 992 && showClass === "") {
    			$$invalidate(0, showClass = "change");
    		}
    	};

    	const handleResize = () => {
    		if (innerWidth > 992) {
    			$$invalidate(0, showClass = "");
    		}
    	};

    	const writable_props = ["showClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuButton> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, innerWidth = window.innerWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("showClass" in $$props) $$invalidate(0, showClass = $$props.showClass);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		showClass,
    		toggle,
    		handleResize,
    		innerWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("showClass" in $$props) $$invalidate(0, showClass = $$props.showClass);
    		if ("innerWidth" in $$props) $$invalidate(1, innerWidth = $$props.innerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, innerWidth = 0);
    	return [showClass, innerWidth, toggle, handleResize, onwindowresize];
    }

    class MenuButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { showClass: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuButton",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get showClass() {
    		throw new Error("<MenuButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClass(value) {
    		throw new Error("<MenuButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const persistStore = (key, initial) => {
      const persist = localStorage.getItem(key);
      const data = persist ? JSON.parse(persist) : initial;
      const store = writable(data, () => {
        const unsubscribe = store.subscribe(value => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        return unsubscribe
      });
      return store
    };

    const todoColorStore = persistStore('Todo-Color', '#eeff00');

    const textColorStore = persistStore('Text-Color', '#fffff');

    /* src\components\Todo.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\components\\Todo.svelte";

    // (33:8) {#if isDone}
    function create_if_block_1$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✔️";
    			add_location(span, file$6, 33, 12, 1090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(33:8) {#if isDone}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*todo*/ ctx[0]);
    			attr_dev(span, "id", "text");
    			attr_dev(span, "type", "text");
    			attr_dev(span, "class", span_class_value = " " + (/*isDone*/ ctx[1] ? "done" : "") + " center" + " svelte-mjjvw9");
    			set_style(span, "color", /*textColor*/ ctx[3]);
    			add_location(span, file$6, 41, 8, 1341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", stop_propagation(/*updateTodo*/ ctx[8]), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1) set_data_dev(t, /*todo*/ ctx[0]);

    			if (dirty & /*isDone*/ 2 && span_class_value !== (span_class_value = " " + (/*isDone*/ ctx[1] ? "done" : "") + " center" + " svelte-mjjvw9")) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*textColor*/ 8) {
    				set_style(span, "color", /*textColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if editable}
    function create_if_block$2(ctx) {
    	let form;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			attr_dev(input, "id", "altText");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*todo*/ ctx[0]);
    			attr_dev(input, "class", "svelte-mjjvw9");
    			add_location(input, file$6, 38, 12, 1229);
    			attr_dev(form, "id", "form");
    			attr_dev(form, "class", "svelte-mjjvw9");
    			add_location(form, file$6, 37, 8, 1163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*newTodo*/ ctx[5]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    					listen_dev(form, "submit", prevent_default(/*editTodo*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1) {
    				attr_dev(input, "placeholder", /*todo*/ ctx[0]);
    			}

    			if (dirty & /*newTodo*/ 32 && input.value !== /*newTodo*/ ctx[5]) {
    				set_input_value(input, /*newTodo*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:4) {#if editable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let li;
    	let span0;
    	let t0;
    	let t1;
    	let div;
    	let span1;
    	let t3;
    	let span2;
    	let li_intro;
    	let li_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isDone*/ ctx[1] && create_if_block_1$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editable*/ ctx[4]) return create_if_block$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			div = element("div");
    			span1 = element("span");
    			span1.textContent = "✏️";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "X";
    			attr_dev(span0, "id", "status");
    			attr_dev(span0, "class", "svelte-mjjvw9");
    			add_location(span0, file$6, 31, 4, 998);
    			attr_dev(span1, "id", "editButton");
    			attr_dev(span1, "class", "center svelte-mjjvw9");
    			add_location(span1, file$6, 44, 8, 1539);
    			attr_dev(span2, "id", "removeButton");
    			attr_dev(span2, "class", "center svelte-mjjvw9");
    			add_location(span2, file$6, 45, 8, 1631);
    			attr_dev(div, "id", "buttonContainer");
    			attr_dev(div, "class", "svelte-mjjvw9");
    			add_location(div, file$6, 43, 4, 1502);
    			set_style(li, "background-color", /*todoColor*/ ctx[2]);
    			attr_dev(li, "class", "svelte-mjjvw9");
    			add_location(li, file$6, 30, 0, 874);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			if (if_block0) if_block0.m(span0, null);
    			append_dev(li, t0);
    			if_block1.m(li, null);
    			append_dev(li, t1);
    			append_dev(li, div);
    			append_dev(div, span1);
    			append_dev(div, t3);
    			append_dev(div, span2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", stop_propagation(/*updateTodo*/ ctx[8]), false, false, true),
    					listen_dev(span1, "click", stop_propagation(/*editTodo*/ ctx[7]), false, false, true),
    					listen_dev(span2, "click", stop_propagation(/*removeTodo*/ ctx[6]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isDone*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(span0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(li, t1);
    				}
    			}

    			if (!current || dirty & /*todoColor*/ 4) {
    				set_style(li, "background-color", /*todoColor*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				if (!li_intro) li_intro = create_in_transition(li, fly, { x: 200, duration: 500 });
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fly, { x: -200, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (detaching && li_outro) li_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Todo", slots, []);
    	let { todo } = $$props, { id } = $$props, { isDone } = $$props;
    	const dispatch = createEventDispatcher();
    	let todoColor, textColor;
    	let editable = false;
    	let newTodo = todo;
    	todoColorStore.subscribe(col => $$invalidate(2, todoColor = col));
    	textColorStore.subscribe(col => $$invalidate(3, textColor = col));
    	const removeTodo = () => dispatch("remove", id);

    	const editTodo = () => {
    		$$invalidate(4, editable = !editable);

    		if (todo != newTodo) {
    			$$invalidate(0, todo = newTodo);
    			dispatch("update", { id, isDone, todo });
    		}
    	};

    	const updateTodo = () => {
    		$$invalidate(1, isDone = !isDone);
    		dispatch("update", { id, isDone, todo });
    	};

    	const writable_props = ["todo", "id", "isDone"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newTodo = this.value;
    		$$invalidate(5, newTodo);
    	}

    	$$self.$$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("id" in $$props) $$invalidate(9, id = $$props.id);
    		if ("isDone" in $$props) $$invalidate(1, isDone = $$props.isDone);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		todoColorStore,
    		textColorStore,
    		createEventDispatcher,
    		todo,
    		id,
    		isDone,
    		dispatch,
    		todoColor,
    		textColor,
    		editable,
    		newTodo,
    		removeTodo,
    		editTodo,
    		updateTodo
    	});

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("id" in $$props) $$invalidate(9, id = $$props.id);
    		if ("isDone" in $$props) $$invalidate(1, isDone = $$props.isDone);
    		if ("todoColor" in $$props) $$invalidate(2, todoColor = $$props.todoColor);
    		if ("textColor" in $$props) $$invalidate(3, textColor = $$props.textColor);
    		if ("editable" in $$props) $$invalidate(4, editable = $$props.editable);
    		if ("newTodo" in $$props) $$invalidate(5, newTodo = $$props.newTodo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todo,
    		isDone,
    		todoColor,
    		textColor,
    		editable,
    		newTodo,
    		removeTodo,
    		editTodo,
    		updateTodo,
    		id,
    		input_input_handler
    	];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { todo: 0, id: 9, isDone: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<Todo> was created without expected prop 'todo'");
    		}

    		if (/*id*/ ctx[9] === undefined && !("id" in props)) {
    			console.warn("<Todo> was created without expected prop 'id'");
    		}

    		if (/*isDone*/ ctx[1] === undefined && !("isDone" in props)) {
    			console.warn("<Todo> was created without expected prop 'isDone'");
    		}
    	}

    	get todo() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDone() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDone(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const idStore = persistStore('id', '0');

    const todoStore$1 = persistStore('Todos', []);

    /* src\components\TodoList.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$5 = "src\\components\\TodoList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (27:0) {#if todos.length != 0}
    function create_if_block_1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let hr;
    	let t2;
    	let ul;
    	let current;
    	let each_value_1 = /*todos*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Needs to be done";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$5, 28, 8, 773);
    			attr_dev(div, "class", "span-container svelte-311lcr");
    			add_location(div, file$5, 27, 4, 735);
    			add_location(hr, file$5, 30, 4, 820);
    			attr_dev(ul, "class", "svelte-311lcr");
    			add_location(ul, file$5, 31, 4, 830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todos, removeChild, updateChild*/ 13) {
    				each_value_1 = /*todos*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(27:0) {#if todos.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#each todos as todo}
    function create_each_block_1(ctx) {
    	let todo;
    	let current;
    	const todo_spread_levels = [/*todo*/ ctx[9]];
    	let todo_props = {};

    	for (let i = 0; i < todo_spread_levels.length; i += 1) {
    		todo_props = assign(todo_props, todo_spread_levels[i]);
    	}

    	todo = new Todo({ props: todo_props, $$inline: true });
    	todo.$on("remove", /*removeChild*/ ctx[2]);
    	todo.$on("update", /*updateChild*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(todo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todo_changes = (dirty & /*todos*/ 1)
    			? get_spread_update(todo_spread_levels, [get_spread_object(/*todo*/ ctx[9])])
    			: {};

    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(33:8) {#each todos as todo}",
    		ctx
    	});

    	return block;
    }

    // (39:0) {#if finishedTodos.length != 0}
    function create_if_block$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let hr;
    	let t2;
    	let ul;
    	let current;
    	let each_value = /*finishedTodos*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Finished";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$5, 40, 8, 1068);
    			attr_dev(div, "class", "span-container svelte-311lcr");
    			add_location(div, file$5, 39, 4, 1030);
    			add_location(hr, file$5, 43, 4, 1109);
    			attr_dev(ul, "class", "svelte-311lcr");
    			add_location(ul, file$5, 44, 4, 1119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*finishedTodos, removeChild, updateChild*/ 14) {
    				each_value = /*finishedTodos*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:0) {#if finishedTodos.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (46:8) {#each finishedTodos as finished}
    function create_each_block$1(ctx) {
    	let todo;
    	let current;
    	const todo_spread_levels = [/*finished*/ ctx[6]];
    	let todo_props = {};

    	for (let i = 0; i < todo_spread_levels.length; i += 1) {
    		todo_props = assign(todo_props, todo_spread_levels[i]);
    	}

    	todo = new Todo({ props: todo_props, $$inline: true });
    	todo.$on("remove", /*removeChild*/ ctx[2]);
    	todo.$on("update", /*updateChild*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(todo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todo_changes = (dirty & /*finishedTodos*/ 2)
    			? get_spread_update(todo_spread_levels, [get_spread_object(/*finished*/ ctx[6])])
    			: {};

    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(46:8) {#each finishedTodos as finished}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*todos*/ ctx[0].length != 0 && create_if_block_1(ctx);
    	let if_block1 = /*finishedTodos*/ ctx[1].length != 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(br, file$5, 37, 0, 987);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*todos*/ ctx[0].length != 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*todos*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*finishedTodos*/ ctx[1].length != 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*finishedTodos*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let todos;
    	let finishedTodos;
    	let $todoStore;
    	validate_store(todoStore$1, "todoStore");
    	component_subscribe($$self, todoStore$1, $$value => $$invalidate(4, $todoStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoList", slots, []);
    	let userID;
    	idStore.subscribe(data => userID = data);

    	const removeChild = ({ detail: id }) => {
    		set_store_value(todoStore$1, $todoStore = $todoStore.filter(todo => todo.id != id), $todoStore);
    	};

    	const updateChild = ({ detail }) => {
    		console.log("The one that was clicked:");
    		console.log(detail);
    		const index = $todoStore.findIndex(item => item.id === detail.id);
    		set_store_value(todoStore$1, $todoStore[index] = detail, $todoStore);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TodoList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Todo,
    		idStore,
    		todoStore: todoStore$1,
    		userID,
    		removeChild,
    		updateChild,
    		$todoStore,
    		todos,
    		finishedTodos
    	});

    	$$self.$inject_state = $$props => {
    		if ("userID" in $$props) userID = $$props.userID;
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("finishedTodos" in $$props) $$invalidate(1, finishedTodos = $$props.finishedTodos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$todoStore*/ 16) {
    			$$invalidate(0, todos = $todoStore.filter(todo => !todo.isDone));
    		}

    		if ($$self.$$.dirty & /*$todoStore*/ 16) {
    			$$invalidate(1, finishedTodos = $todoStore.filter(todo => todo.isDone));
    		}
    	};

    	return [todos, finishedTodos, removeChild, updateChild, $todoStore];
    }

    class TodoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoList",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\newTodoButton.svelte generated by Svelte v3.38.2 */

    const file$4 = "src\\components\\newTodoButton.svelte";

    function create_fragment$6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "+";
    			attr_dev(span, "id", "new-todo");
    			attr_dev(span, "class", "svelte-rcpk5t");
    			add_location(span, file$4, 19, 0, 524);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewTodoButton", slots, []);
    	let { todoTextLength } = $$props;
    	let visable = false;
    	let textField = "";

    	const addTodo = async e => {
    		if (textField.length > todoTextLength) {
    			alert("Max 80 characters & needs to be bigger tha 0 character");
    			textField = "";
    			return;
    		}

    		e.preventDefault();
    		let todo = { "todo": textField, "isDone": false };

    		textField
    		? todoStore.update(orignalArray => [...orignalArray, todo])
    		: "";

    		textField = "";
    	};

    	const writable_props = ["todoTextLength"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewTodoButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("todoTextLength" in $$props) $$invalidate(0, todoTextLength = $$props.todoTextLength);
    	};

    	$$self.$capture_state = () => ({
    		todoTextLength,
    		visable,
    		textField,
    		addTodo
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoTextLength" in $$props) $$invalidate(0, todoTextLength = $$props.todoTextLength);
    		if ("visable" in $$props) visable = $$props.visable;
    		if ("textField" in $$props) textField = $$props.textField;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todoTextLength];
    }

    class NewTodoButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { todoTextLength: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTodoButton",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todoTextLength*/ ctx[0] === undefined && !("todoTextLength" in props)) {
    			console.warn("<NewTodoButton> was created without expected prop 'todoTextLength'");
    		}
    	}

    	get todoTextLength() {
    		throw new Error("<NewTodoButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoTextLength(value) {
    		throw new Error("<NewTodoButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\newTodoForm.svelte generated by Svelte v3.38.2 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewTodoForm", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewTodoForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NewTodoButton });
    	return [];
    }

    class NewTodoForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTodoForm",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\newTodo.svelte generated by Svelte v3.38.2 */

    function create_fragment$4(ctx) {
    	let newtodobutton;
    	let current;
    	newtodobutton = new NewTodoButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(newtodobutton.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(newtodobutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newtodobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newtodobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newtodobutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewTodo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewTodo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NewTodoForm, NewTodoButton });
    	return [];
    }

    class NewTodo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTodo",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\ListItem.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\components\\ListItem.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let span;
    	let t_value = /*list*/ ctx[0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$3, 9, 4, 194);
    			attr_dev(div, "id", "list-container");
    			attr_dev(div, "class", "svelte-1ulpw57");
    			add_location(div, file$3, 8, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*list*/ 1 && t_value !== (t_value = /*list*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, []);

    	let { list = {
    		"name": "lista1",
    		"id": "abc123",
    		"todos": ["handla", "fiska", "äta"]
    	} } = $$props;

    	const writable_props = ["list"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    	};

    	$$self.$capture_state = () => ({ list });

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) $$invalidate(0, list = $$props.list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [list];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { list: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get list() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\List.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\List.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (19:8) {#each lists as list}
    function create_each_block(ctx) {
    	let li;
    	let listitem;
    	let t;
    	let current;

    	listitem = new ListItem({
    			props: { list: /*list*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(listitem.$$.fragment);
    			t = space();
    			add_location(li, file$2, 19, 12, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(listitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(listitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:8) {#each lists as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let ul;
    	let current;
    	let each_value = /*lists*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1m7cwek");
    			add_location(ul, file$2, 17, 4, 395);
    			attr_dev(div, "id", "list-container");
    			attr_dev(div, "class", "svelte-1m7cwek");
    			add_location(div, file$2, 16, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lists*/ 1) {
    				each_value = /*lists*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);

    	let lists = [
    		{
    			"name": "lista1",
    			"id": "abc123",
    			"todos": ["handla", "fiska", "äta"]
    		},
    		{
    			"name": "lista2",
    			"id": "xyz789",
    			"todos": ["handla", "fiska", "äta", "tvätta kläder"]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ListItem, lists });

    	$$self.$inject_state = $$props => {
    		if ("lists" in $$props) $$invalidate(0, lists = $$props.lists);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lists];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Menu.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\Menu.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let list;
    	let t;
    	let img;
    	let img_src_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	list = new List({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(list.$$.fragment);
    			t = space();
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/settings.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-12rzzae");
    			add_location(img, file$1, 7, 1, 202);
    			attr_dev(div, "id", "menu");
    			attr_dev(div, "class", "svelte-12rzzae");
    			add_location(div, file$1, 5, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(list, div, null);
    			append_dev(div, t);
    			append_dev(div, img);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { y: -100, duration: 500 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 0, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(list);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, List });
    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const backgroundColorStore = persistStore('Background-Color', '#00ffff');

    const appStore = persistStore('App-status', 'new');

    /* src\App.svelte generated by Svelte v3.38.2 */

    const { window: window_1 } = globals;
    const file = "src\\App.svelte";

    // (39:2) {#if menuVisable}
    function create_if_block(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:2) {#if menuVisable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div0;
    	let menubutton;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let todolist;
    	let t2;
    	let div3;
    	let newtodo;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	menubutton = new MenuButton({ $$inline: true });
    	menubutton.$on("menu", /*toggleMenu*/ ctx[2]);
    	let if_block = /*menuVisable*/ ctx[0] && create_if_block(ctx);
    	todolist = new TodoList({ $$inline: true });
    	newtodo = new NewTodo({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(menubutton.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			div2 = element("div");
    			create_component(todolist.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(newtodo.$$.fragment);
    			attr_dev(div0, "id", "headerContainer");
    			attr_dev(div0, "class", "svelte-1l00k8i");
    			add_location(div0, file, 33, 1, 912);
    			attr_dev(div1, "id", "menuContainer");
    			attr_dev(div1, "class", "svelte-1l00k8i");
    			add_location(div1, file, 37, 1, 990);
    			attr_dev(div2, "id", "listContainer");
    			attr_dev(div2, "class", "svelte-1l00k8i");
    			add_location(div2, file, 43, 1, 1076);
    			attr_dev(div3, "id", "inputContainer");
    			attr_dev(div3, "class", "svelte-1l00k8i");
    			add_location(div3, file, 47, 1, 1139);
    			attr_dev(div4, "id", "mainContainer");
    			attr_dev(div4, "class", "svelte-1l00k8i");
    			add_location(div4, file, 32, 0, 885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(menubutton, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			mount_component(todolist, div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(newtodo, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*handleResize*/ ctx[3], false, false, false),
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*menuVisable*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*menuVisable*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menubutton.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(todolist.$$.fragment, local);
    			transition_in(newtodo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menubutton.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(todolist.$$.fragment, local);
    			transition_out(newtodo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(menubutton);
    			if (if_block) if_block.d();
    			destroy_component(todolist);
    			destroy_component(newtodo);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let innerWidth;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		if (innerWidth > 992) $$invalidate(0, menuVisable = true);
    	});

    	let menuVisable = false;
    	let choice;
    	appStore.subscribe(data => choice = data);
    	const toggleMenu = () => $$invalidate(0, menuVisable = !menuVisable);
    	backgroundColorStore.subscribe(col => window.document.body.style.background = col);

    	const handleResize = () => {
    		if (innerWidth > 992) {
    			$$invalidate(0, menuVisable = true);
    		} else {
    			$$invalidate(0, menuVisable = false);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, innerWidth = window_1.innerWidth);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		MenuButton,
    		TodoList,
    		NewTodo,
    		Menu,
    		backgroundColorStore,
    		appStore,
    		menuVisable,
    		choice,
    		toggleMenu,
    		handleResize,
    		innerWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuVisable" in $$props) $$invalidate(0, menuVisable = $$props.menuVisable);
    		if ("choice" in $$props) choice = $$props.choice;
    		if ("innerWidth" in $$props) $$invalidate(1, innerWidth = $$props.innerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, innerWidth = 0);
    	return [menuVisable, innerWidth, toggleMenu, handleResize, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
