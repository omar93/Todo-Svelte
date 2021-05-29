
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
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
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    const headerColorStore = persistStore('Header-Color', '#ff69b4');

    /* src\components\MenuButton.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\components\\MenuButton.svelte";

    function create_fragment$6(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let div3_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-excf63");
    			add_location(div0, file$6, 11, 2, 284);
    			attr_dev(div1, "class", "bar2 svelte-excf63");
    			add_location(div1, file$6, 12, 2, 312);
    			attr_dev(div2, "class", "bar3 svelte-excf63");
    			add_location(div2, file$6, 13, 2, 340);
    			attr_dev(div3, "class", div3_class_value = "" + ((/*active*/ ctx[0] ? "change" : "") + " container" + " svelte-excf63"));
    			add_location(div3, file$6, 10, 0, 214);
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
    				dispose = listen_dev(div3, "click", /*toggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1 && div3_class_value !== (div3_class_value = "" + ((/*active*/ ctx[0] ? "change" : "") + " container" + " svelte-excf63"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
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
    	validate_slots("MenuButton", slots, []);
    	const dispatch = createEventDispatcher();
    	let active = false;

    	const toggle = () => {
    		$$invalidate(0, active = !active);
    		dispatch("menu");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		active,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, toggle];
    }

    class MenuButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuButton",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.38.2 */
    const file$5 = "src\\components\\Header.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let div0;
    	let menubutton;
    	let current;
    	menubutton = new MenuButton({ $$inline: true });
    	menubutton.$on("menu", /*menu_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Svelte-Todo-App";
    			t2 = space();
    			div0 = element("div");
    			create_component(menubutton.$$.fragment);
    			attr_dev(img, "id", "img");
    			if (img.src !== (img_src_value = "./profile.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "profile");
    			attr_dev(img, "class", "svelte-8lce3g");
    			add_location(img, file$5, 8, 4, 257);
    			attr_dev(p, "class", "title svelte-8lce3g");
    			add_location(p, file$5, 9, 1, 308);
    			attr_dev(div0, "class", "menu svelte-8lce3g");
    			add_location(div0, file$5, 10, 1, 347);
    			attr_dev(div1, "class", "header svelte-8lce3g");
    			set_style(div1, "background-color", /*color*/ ctx[0]);
    			add_location(div1, file$5, 7, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(menubutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*color*/ 1) {
    				set_style(div1, "background-color", /*color*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menubutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menubutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(menubutton);
    		}
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
    	validate_slots("Header", slots, []);
    	let color;
    	headerColorStore.subscribe(col => $$invalidate(0, color = col));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function menu_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$capture_state = () => ({ headerColorStore, MenuButton, color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, menu_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
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

    const backgroundColorStore = persistStore('Background-Color', '#00ffff');

    const todoColorStore = persistStore('Todo-Color', '#eeff00');

    const textColorStore = persistStore('Text-Color', '#fffff');

    /* src\components\Menu.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\components\\Menu.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let label0;
    	let t2;
    	let input1;
    	let t3;
    	let label1;
    	let t5;
    	let input2;
    	let t6;
    	let label2;
    	let t8;
    	let input3;
    	let t9;
    	let label3;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Background Color";
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			label1 = element("label");
    			label1.textContent = "Header Background Color";
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			label2 = element("label");
    			label2.textContent = "Todo Background Color";
    			t8 = space();
    			input3 = element("input");
    			t9 = space();
    			label3 = element("label");
    			label3.textContent = "Todo Text Color";
    			attr_dev(input0, "type", "color");
    			add_location(input0, file$4, 10, 1, 412);
    			attr_dev(label0, "for", "head");
    			add_location(label0, file$4, 11, 1, 470);
    			attr_dev(input1, "type", "color");
    			add_location(input1, file$4, 13, 1, 517);
    			attr_dev(label1, "for", "head");
    			add_location(label1, file$4, 14, 1, 571);
    			attr_dev(input2, "type", "color");
    			add_location(input2, file$4, 16, 1, 625);
    			attr_dev(label2, "for", "head");
    			add_location(label2, file$4, 17, 1, 677);
    			attr_dev(input3, "type", "color");
    			add_location(input3, file$4, 19, 1, 729);
    			attr_dev(label3, "for", "head");
    			add_location(label3, file$4, 20, 1, 781);
    			attr_dev(div, "id", "menu");
    			attr_dev(div, "class", "svelte-1eoh9x8");
    			add_location(div, file$4, 8, 0, 317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*$backgroundColorStore*/ ctx[0]);
    			append_dev(div, t0);
    			append_dev(div, label0);
    			append_dev(div, t2);
    			append_dev(div, input1);
    			set_input_value(input1, /*$headerColorStore*/ ctx[1]);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(div, t5);
    			append_dev(div, input2);
    			set_input_value(input2, /*$todoColorStore*/ ctx[2]);
    			append_dev(div, t6);
    			append_dev(div, label2);
    			append_dev(div, t8);
    			append_dev(div, input3);
    			set_input_value(input3, /*$textColorStore*/ ctx[3]);
    			append_dev(div, t9);
    			append_dev(div, label3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$backgroundColorStore*/ 1) {
    				set_input_value(input0, /*$backgroundColorStore*/ ctx[0]);
    			}

    			if (dirty & /*$headerColorStore*/ 2) {
    				set_input_value(input1, /*$headerColorStore*/ ctx[1]);
    			}

    			if (dirty & /*$todoColorStore*/ 4) {
    				set_input_value(input2, /*$todoColorStore*/ ctx[2]);
    			}

    			if (dirty & /*$textColorStore*/ 8) {
    				set_input_value(input3, /*$textColorStore*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: 200, duration: 500 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			run_all(dispose);
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
    	let $backgroundColorStore;
    	let $headerColorStore;
    	let $todoColorStore;
    	let $textColorStore;
    	validate_store(backgroundColorStore, "backgroundColorStore");
    	component_subscribe($$self, backgroundColorStore, $$value => $$invalidate(0, $backgroundColorStore = $$value));
    	validate_store(headerColorStore, "headerColorStore");
    	component_subscribe($$self, headerColorStore, $$value => $$invalidate(1, $headerColorStore = $$value));
    	validate_store(todoColorStore, "todoColorStore");
    	component_subscribe($$self, todoColorStore, $$value => $$invalidate(2, $todoColorStore = $$value));
    	validate_store(textColorStore, "textColorStore");
    	component_subscribe($$self, textColorStore, $$value => $$invalidate(3, $textColorStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		$backgroundColorStore = this.value;
    		backgroundColorStore.set($backgroundColorStore);
    	}

    	function input1_input_handler() {
    		$headerColorStore = this.value;
    		headerColorStore.set($headerColorStore);
    	}

    	function input2_input_handler() {
    		$todoColorStore = this.value;
    		todoColorStore.set($todoColorStore);
    	}

    	function input3_input_handler() {
    		$textColorStore = this.value;
    		textColorStore.set($textColorStore);
    	}

    	$$self.$capture_state = () => ({
    		fly,
    		backgroundColorStore,
    		headerColorStore,
    		todoColorStore,
    		textColorStore,
    		$backgroundColorStore,
    		$headerColorStore,
    		$todoColorStore,
    		$textColorStore
    	});

    	return [
    		$backgroundColorStore,
    		$headerColorStore,
    		$todoColorStore,
    		$textColorStore,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Todo.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\components\\Todo.svelte";

    // (40:4) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*todo*/ ctx[0]);
    			attr_dev(span, "id", "text");
    			attr_dev(span, "type", "text");
    			attr_dev(span, "class", "center svelte-1r5eli8");
    			set_style(span, "color", /*textColor*/ ctx[3]);
    			add_location(span, file$3, 40, 8, 1318);
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
    		source: "(40:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if editable}
    function create_if_block$1(ctx) {
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
    			attr_dev(input, "class", "svelte-1r5eli8");
    			add_location(input, file$3, 37, 12, 1206);
    			attr_dev(form, "id", "form");
    			attr_dev(form, "class", "svelte-1r5eli8");
    			add_location(form, file$3, 36, 8, 1140);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(36:4) {#if editable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let li;
    	let span0;
    	let t0;
    	let span0_class_value;
    	let t1;
    	let t2;
    	let div;
    	let span1;
    	let t4;
    	let span2;
    	let li_intro;
    	let li_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editable*/ ctx[4]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			t0 = text("✅");
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div = element("div");
    			span1 = element("span");
    			span1.textContent = "✏️";
    			t4 = text("|\r\n        ");
    			span2 = element("span");
    			span2.textContent = "X";
    			attr_dev(span0, "id", "status");
    			attr_dev(span0, "class", span0_class_value = "" + (null_to_empty(/*done*/ ctx[1] ? "done" : "hidden") + " svelte-1r5eli8"));
    			add_location(span0, file$3, 34, 4, 1048);
    			attr_dev(span1, "id", "editButton");
    			attr_dev(span1, "class", "center svelte-1r5eli8");
    			add_location(span1, file$3, 43, 8, 1492);
    			attr_dev(span2, "id", "removeButton");
    			attr_dev(span2, "class", "center svelte-1r5eli8");
    			add_location(span2, file$3, 44, 8, 1585);
    			attr_dev(div, "id", "buttonContainer");
    			attr_dev(div, "class", "svelte-1r5eli8");
    			add_location(div, file$3, 42, 4, 1455);
    			set_style(li, "background-color", /*todoColor*/ ctx[2]);
    			attr_dev(li, "class", "svelte-1r5eli8");
    			add_location(li, file$3, 33, 0, 924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, t0);
    			append_dev(li, t1);
    			if_block.m(li, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, span1);
    			append_dev(div, t4);
    			append_dev(div, span2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span1, "click", stop_propagation(/*editTodo*/ ctx[7]), false, false, true),
    					listen_dev(span2, "click", stop_propagation(/*removeTodo*/ ctx[6]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*done*/ 2 && span0_class_value !== (span0_class_value = "" + (null_to_empty(/*done*/ ctx[1] ? "done" : "hidden") + " svelte-1r5eli8"))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t2);
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
    			if_block.d();
    			if (detaching && li_outro) li_outro.end();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Todo", slots, []);
    	let { todo } = $$props, { id } = $$props, { done } = $$props;
    	const dispatch = createEventDispatcher();
    	let todoColor, textColor;
    	let editable = false;
    	let newTodo = todo;

    	todoColorStore.subscribe(col => {
    		$$invalidate(2, todoColor = col);
    	});

    	textColorStore.subscribe(col => {
    		$$invalidate(3, textColor = col);
    	});

    	const removeTodo = () => dispatch("remove", id);

    	const editTodo = () => {
    		$$invalidate(4, editable = !editable);

    		if (todo != newTodo) {
    			$$invalidate(0, todo = newTodo);
    			dispatch("update", { id, done, todo, colorValue });
    		}
    	};

    	const updateTodo = () => {
    		$$invalidate(1, done = !done);
    		dispatch("update", { id, done, todo, colorValue });
    	};

    	const writable_props = ["todo", "id", "done"];

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
    		if ("done" in $$props) $$invalidate(1, done = $$props.done);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		createEventDispatcher,
    		todoColorStore,
    		textColorStore,
    		todo,
    		id,
    		done,
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
    		if ("done" in $$props) $$invalidate(1, done = $$props.done);
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
    		done,
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { todo: 0, id: 9, done: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<Todo> was created without expected prop 'todo'");
    		}

    		if (/*id*/ ctx[9] === undefined && !("id" in props)) {
    			console.warn("<Todo> was created without expected prop 'id'");
    		}

    		if (/*done*/ ctx[1] === undefined && !("done" in props)) {
    			console.warn("<Todo> was created without expected prop 'done'");
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

    	get done() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const todoStore = persistStore('Todos', []);

    /* src\components\TodoList.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\TodoList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:4) {#each $todoStore as todo}
    function create_each_block(ctx) {
    	let todo;
    	let current;
    	const todo_spread_levels = [/*todo*/ ctx[3]];
    	let todo_props = {};

    	for (let i = 0; i < todo_spread_levels.length; i += 1) {
    		todo_props = assign(todo_props, todo_spread_levels[i]);
    	}

    	todo = new Todo({ props: todo_props, $$inline: true });
    	todo.$on("remove", /*removeChild*/ ctx[1]);
    	todo.$on("update", /*updateChild*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(todo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todo_changes = (dirty & /*$todoStore*/ 1)
    			? get_spread_update(todo_spread_levels, [get_spread_object(/*todo*/ ctx[3])])
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:4) {#each $todoStore as todo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$todoStore*/ ctx[0];
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
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1188gtg");
    			add_location(ul, file$2, 14, 0, 390);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$todoStore, removeChild, updateChild*/ 7) {
    				each_value = /*$todoStore*/ ctx[0];
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
    			if (detaching) detach_dev(ul);
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
    	let $todoStore;
    	validate_store(todoStore, "todoStore");
    	component_subscribe($$self, todoStore, $$value => $$invalidate(0, $todoStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoList", slots, []);

    	const removeChild = ({ detail: id }) => {
    		set_store_value(todoStore, $todoStore = $todoStore.filter(todo => todo.id != id), $todoStore);
    	};

    	const updateChild = ({ detail }) => {
    		const index = $todoStore.findIndex(item => item.id === detail.id);
    		set_store_value(todoStore, $todoStore[index] = detail, $todoStore);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Todo,
    		todoStore,
    		removeChild,
    		updateChild,
    		$todoStore
    	});

    	return [$todoStore, removeChild, updateChild];
    }

    class TodoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoList",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var uuidV4 = createCommonjsModule(function (module, exports) {
    exports = module.exports = function() {
    	var ret = '', value;
    	for (var i = 0; i < 32; i++) {
    		value = exports.random() * 16 | 0;
    		// Insert the hypens
    		if (i > 4 && i < 21 && ! (i % 4)) {
    			ret += '-';
    		}
    		// Add the next random character
    		ret += (
    			(i === 12) ? 4 : (
    				(i === 16) ? (value & 3 | 8) : value
    			)
    		).toString(16);
    	}
    	return ret;
    };

    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    exports.isUUID = function(uuid) {
    	return uuidRegex.test(uuid);
    };

    exports.random = function() {
    	return Math.random();
    };
    });

    /* src\components\Form.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\Form.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button0_resize_listener;
    	let t1;
    	let form;
    	let input;
    	let t2;
    	let button1;
    	let t3;
    	let button1_resize_listener;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("CLEAR");
    			t1 = space();
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			button1 = element("button");
    			t3 = text("➕");
    			attr_dev(button0, "class", "clear svelte-1n68xhz");
    			set_style(button0, "height", /*height*/ ctx[1] + "px");
    			add_render_callback(() => /*button0_elementresize_handler*/ ctx[6].call(button0));
    			add_location(button0, file$1, 31, 4, 719);
    			attr_dev(input, "class", "input svelte-1n68xhz");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Todo");
    			set_style(input, "height", /*height*/ ctx[1] + "px");
    			add_location(input, file$1, 33, 8, 875);
    			add_location(form, file$1, 32, 4, 834);
    			attr_dev(button1, "class", "add svelte-1n68xhz");
    			set_style(button1, "width", /*width*/ ctx[2] + "px");
    			add_render_callback(() => /*button1_elementresize_handler*/ ctx[8].call(button1));
    			add_location(button1, file$1, 35, 4, 997);
    			attr_dev(div, "id", "parent");
    			attr_dev(div, "class", "svelte-1n68xhz");
    			add_location(div, file$1, 30, 0, 696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, t0);
    			button0_resize_listener = add_resize_listener(button0, /*button0_elementresize_handler*/ ctx[6].bind(button0));
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, input);
    			set_input_value(input, /*textField*/ ctx[0]);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, t3);
    			button1_resize_listener = add_resize_listener(button1, /*button1_elementresize_handler*/ ctx[8].bind(button1));

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*removeAll*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", self(/*addTodo*/ ctx[3]), false, false, false),
    					listen_dev(button1, "click", /*addTodo*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*height*/ 2) {
    				set_style(button0, "height", /*height*/ ctx[1] + "px");
    			}

    			if (dirty & /*height*/ 2) {
    				set_style(input, "height", /*height*/ ctx[1] + "px");
    			}

    			if (dirty & /*textField*/ 1 && input.value !== /*textField*/ ctx[0]) {
    				set_input_value(input, /*textField*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 4) {
    				set_style(button1, "width", /*width*/ ctx[2] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			button0_resize_listener();
    			button1_resize_listener();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Form", slots, []);
    	let { todoTextLength } = $$props;
    	let textField;
    	let height;
    	let width;

    	const addTodo = e => {
    		if (textField.length > todoTextLength) {
    			alert("Max 80 characters & needs to be bigger tha 0 character");
    			$$invalidate(0, textField = "");
    			return;
    		}

    		e.preventDefault();

    		textField
    		? todoStore.update(orignalArray => [
    				...orignalArray,
    				{
    					"todo": textField,
    					"id": new uuidV4(),
    					"done": false
    				}
    			])
    		: "";

    		$$invalidate(0, textField = "");
    	};

    	const removeAll = () => {
    		todoStore.set([]);
    	};

    	const writable_props = ["todoTextLength"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function button0_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(2, width);
    	}

    	function input_input_handler() {
    		textField = this.value;
    		$$invalidate(0, textField);
    	}

    	function button1_elementresize_handler() {
    		height = this.clientHeight;
    		$$invalidate(1, height);
    	}

    	$$self.$$set = $$props => {
    		if ("todoTextLength" in $$props) $$invalidate(5, todoTextLength = $$props.todoTextLength);
    	};

    	$$self.$capture_state = () => ({
    		todoStore,
    		uuid: uuidV4,
    		todoTextLength,
    		textField,
    		height,
    		width,
    		addTodo,
    		removeAll
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoTextLength" in $$props) $$invalidate(5, todoTextLength = $$props.todoTextLength);
    		if ("textField" in $$props) $$invalidate(0, textField = $$props.textField);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		textField,
    		height,
    		width,
    		addTodo,
    		removeAll,
    		todoTextLength,
    		button0_elementresize_handler,
    		input_input_handler,
    		button1_elementresize_handler
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { todoTextLength: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todoTextLength*/ ctx[5] === undefined && !("todoTextLength" in props)) {
    			console.warn("<Form> was created without expected prop 'todoTextLength'");
    		}
    	}

    	get todoTextLength() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoTextLength(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (19:1) {#if menuVisable}
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
    		source: "(19:1) {#if menuVisable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let t1;
    	let div4;
    	let div2;
    	let todolist;
    	let t2;
    	let div3;
    	let form;
    	let current;
    	let if_block = /*menuVisable*/ ctx[0] && create_if_block(ctx);
    	header = new Header({ $$inline: true });
    	header.$on("menu", /*toggleMenu*/ ctx[2]);
    	todolist = new TodoList({ $$inline: true });

    	form = new Form({
    			props: {
    				todoTextLength: /*todoTextLength*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			create_component(todolist.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(form.$$.fragment);
    			attr_dev(div0, "id", "menuContainer");
    			add_location(div0, file, 17, 0, 512);
    			attr_dev(div1, "id", "headerContainer");
    			attr_dev(div1, "class", "svelte-1yfjn8b");
    			add_location(div1, file, 22, 0, 586);
    			attr_dev(div2, "id", "listContainer");
    			attr_dev(div2, "class", "svelte-1yfjn8b");
    			add_location(div2, file, 26, 1, 679);
    			attr_dev(div3, "id", "formContainer");
    			attr_dev(div3, "class", "svelte-1yfjn8b");
    			add_location(div3, file, 30, 1, 738);
    			attr_dev(div4, "id", "parent");
    			attr_dev(div4, "class", "svelte-1yfjn8b");
    			add_location(div4, file, 25, 0, 660);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(header, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			mount_component(todolist, div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(form, div3, null);
    			current = true;
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
    					if_block.m(div0, null);
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
    			transition_in(if_block);
    			transition_in(header.$$.fragment, local);
    			transition_in(todolist.$$.fragment, local);
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(header.$$.fragment, local);
    			transition_out(todolist.$$.fragment, local);
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			destroy_component(todolist);
    			destroy_component(form);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let todoTextLength = 80;
    	let menuVisable = false;
    	const toggleMenu = () => $$invalidate(0, menuVisable = !menuVisable);
    	backgroundColorStore.subscribe(col => window.document.body.style.backgroundColor = col);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Menu,
    		TodoList,
    		Form,
    		backgroundColorStore,
    		todoTextLength,
    		menuVisable,
    		toggleMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoTextLength" in $$props) $$invalidate(1, todoTextLength = $$props.todoTextLength);
    		if ("menuVisable" in $$props) $$invalidate(0, menuVisable = $$props.menuVisable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuVisable, todoTextLength, toggleMenu];
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
