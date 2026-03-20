// ==UserScript==
// @name         Hpoi Helper
// @namespace    https://github.com/blurSong/hpoi-helper
// @version      0.1.0
// @author       blurSong
// @description  Enhancements for www.hpoi.net
// @license      MIT
// @icon         https://www.hpoi.net/favicon.ico
// @match        *://www.hpoi.net/*
// @match        *://hpoi.net/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function() {
var __defProp = Object.defineProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
function defineComponent(metadata) {
		return metadata;
	}
	var componentTags = {
		display: {
			name: "display",
			displayName: "显示"
		},
		utility: {
			name: "utility",
			displayName: "工具"
		},
		style: {
			name: "style",
			displayName: "样式"
		},
		data: {
			name: "data",
			displayName: "数据"
		}
	};
	var injectedStyles = new Map();
function addStyle(css, id) {
		if (id && injectedStyles.has(id)) removeStyle(id);
		let el;
		if (typeof GM_addStyle !== "undefined") el = GM_addStyle(css);
		else {
			el = document.createElement("style");
			el.textContent = css;
			document.head.appendChild(el);
		}
		if (id) {
			el.setAttribute("data-hpoi-style", id);
			injectedStyles.set(id, el);
		}
		return el;
	}
function removeStyle(id) {
		const el = injectedStyles.get(id);
		if (el) {
			el.remove();
			injectedStyles.delete(id);
		}
	}
	var LOG_PREFIX = `[Hpoi Helper]`;
	var STORAGE_KEY_PREFIX = "hpoi-helper.";
	var VERSION = "0.1.0";
	var defaultSettings = {
		components: {},
		logLevel: "info"
	};
	var KEY = `${STORAGE_KEY_PREFIX}settings`;
	function isGMAvailable() {
		return typeof GM_getValue !== "undefined" && typeof GM_setValue !== "undefined";
	}
	function loadSettings() {
		if (isGMAvailable()) {
			const raw = GM_getValue(KEY, void 0);
			if (raw) try {
				return {
					...defaultSettings,
					...JSON.parse(raw)
				};
			} catch {}
		}
		return { ...defaultSettings };
	}
	function saveSettings(settings) {
		if (isGMAvailable()) GM_setValue(KEY, JSON.stringify(settings));
	}
	var _settings = loadSettings();
	var _listeners = new Map();
function getPath(obj, path) {
		return path.split(".").reduce((acc, key) => {
			if (acc !== null && typeof acc === "object") return acc[key];
		}, obj);
	}
function setPath(obj, path, value) {
		const keys = path.split(".");
		const root = { ...obj };
		let cur = root;
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			cur[key] = typeof cur[key] === "object" && cur[key] !== null ? { ...cur[key] } : {};
			cur = cur[key];
		}
		cur[keys[keys.length - 1]] = value;
		return root;
	}
	var settings = {
		get(path) {
			return getPath(_settings, path);
		},
		set(path, value) {
			const old = getPath(_settings, path);
			_settings = setPath(_settings, path, value);
			saveSettings(_settings);
			const listeners = _listeners.get(path);
			if (listeners) for (const fn of listeners) fn(value, old);
		},
		getComponent(name, defaultOptions = {}) {
			const existing = _settings.components[name];
			if (!existing) {
				const defaults = {
					enabled: false,
					options: Object.fromEntries(Object.entries(defaultOptions).map(([k, def]) => [k, def?.defaultValue]))
				};
				this.set(`components.${name}`, defaults);
				return defaults;
			}
			return existing;
		},
		onChange(path, listener, callNow = false) {
			if (!_listeners.has(path)) _listeners.set(path, new Set());
			_listeners.get(path).add(listener);
			if (callNow) {
				const current = getPath(_settings, path);
				listener(current, current);
			}
			return () => _listeners.get(path)?.delete(listener);
		},
		reload() {
			_settings = loadSettings();
		}
	};
var dq = (selector, root = document) => root.querySelector(selector);
var matchCurrentUrl = (patterns) => {
		const url = location.href;
		return patterns.some((p) => typeof p === "string" ? url.includes(p) : p.test(url));
	};
	var block_noise_exports = __exportAll({ component: () => component$1 });
	var schema$1 = {
		blockRightAdBanner: {
			defaultValue: false,
			displayName: "【首页】屏蔽右栏广告区",
			description: "隐藏右栏的广告轮播及快捷入口图片（相册/论坛/二手专区按钮）"
		},
		blockRightRanking: {
			defaultValue: false,
			displayName: "【首页】屏蔽右栏近期发售榜",
			description: "隐藏右栏的「近期发售」/「周边期待榜」列表"
		},
		blockRightHotRecommend: {
			defaultValue: false,
			displayName: "【首页】屏蔽右栏热门推荐",
			description: "隐藏右栏的热门推荐文章列表"
		},
		blockLeftShopRecommend: {
			defaultValue: false,
			displayName: "【首页】屏蔽左栏商品推荐",
			description: "隐藏左栏的淘宝自营商品推荐区"
		},
		blockLeftPraiseRanking: {
			defaultValue: false,
			displayName: "【首页】屏蔽左栏获赞排行榜",
			description: "隐藏左栏的获赞排行榜"
		},
		blockHobbyTopBanner: {
			defaultValue: false,
			displayName: "【手办页】屏蔽顶部广告区",
			description: "隐藏手办分区首页顶部的活动轮播和自营店广告图"
		},
		blockItemRelatedProducts: {
			defaultValue: false,
			displayName: "【条目页】屏蔽关联商品",
			description: "隐藏条目详情页底部的淘宝关联商品推荐区"
		},
		blockCharRelatedProducts: {
			defaultValue: false,
			displayName: "【角色页】屏蔽相关商品",
			description: "隐藏角色详情页底部的相关商品推荐区"
		},
		blockCompanyOfficialMerch: {
			defaultValue: false,
			displayName: "【厂商页】屏蔽自营周边",
			description: "隐藏厂商详情页顶部的淘宝自营周边推荐区"
		},
		blockSeriesOfficialMerch: {
			defaultValue: false,
			displayName: "【系列页】屏蔽自营周边",
			description: "隐藏系列详情页的淘宝自营周边推荐区"
		},
		blockWorksRelatedProducts: {
			defaultValue: false,
			displayName: "【作品页】屏蔽相关商品",
			description: "隐藏作品详情页的淘宝相关商品推荐区"
		}
	};
	var CSS_RULES = {
		blockRightAdBanner: {
			id: "bn-right-ad",
			css: `.swiper-container.swiper-home, .hpoi-home-img-box { display: none !important; }`
		},
		blockRightRanking: {
			id: "bn-right-ranking",
			css: `.hpoi-home-box-rt:not(.home-article) { display: none !important; }`
		},
		blockRightHotRecommend: {
			id: "bn-right-hot",
			css: `.hpoi-home-box-rt.home-article { display: none !important; }`
		},
		blockLeftPraiseRanking: {
			id: "bn-left-praise",
			css: `.hpoi-home-box-lt.top-praise { display: none !important; }`
		},
		blockHobbyTopBanner: {
			id: "bn-hobby-top",
			css: `.hpoi-topcarousel-box { display: none !important; }`
		},
		blockCompanyOfficialMerch: {
			id: "bn-company-shop",
			css: `.company-container-shop-hobby { display: none !important; }`
		},
		blockSeriesOfficialMerch: {
			id: "bn-series-shop",
			css: `.series-container-shop-hobby { display: none !important; }`
		},
		blockWorksRelatedProducts: {
			id: "bn-works-shop",
			css: `.works-ibox:has(.taobao-relate-swiper) { display: none !important; }`
		}
	};
	var ITEM_PAGE_RE = /\/hobby\/\d+$/;
	var CHAR_PAGE_RE = /\/charactar\/\d+$/;
	var EXPAND_ID = "bn-layout-expand";
	var EXPAND_CSS = `
  .home-right { display: none !important; }
  .container.user-home > .row > .col-sm-12 {
    width: 75% !important;
    flex: 0 0 75% !important;
    max-width: 75% !important;
  }
`;
function createDomHider(finder) {
		let cached = null;
		function find() {
			if (cached) return cached;
			cached = finder();
			return cached;
		}
		return {
			apply(hide) {
				const el = find();
				if (!el) return;
				if (hide) el.style.setProperty("display", "none", "important");
				else el.style.removeProperty("display");
			},
			reset() {
				cached = null;
			}
		};
	}
	var shopRecommendHider = createDomHider(() => dq("#taobao-more")?.closest(".hpoi-home-box-lt") ?? null);
	var itemRelatedHider = createDomHider(() => {
		if (!ITEM_PAGE_RE.test(location.pathname)) return null;
		return dq(".hpoi-taobao-box")?.closest(".hpoi-box") ?? null;
	});
	var charRelatedHider = createDomHider(() => {
		if (!CHAR_PAGE_RE.test(location.pathname)) return null;
		return dq(".taobao-relate-swiper")?.closest(".charactar-ibox") ?? null;
	});
	var domHiders = [
		shopRecommendHider,
		itemRelatedHider,
		charRelatedHider
	];
	function applyStyles(opts) {
		for (const key of Object.keys(CSS_RULES)) {
			const rule = CSS_RULES[key];
			if (opts[key]) addStyle(rule.css, rule.id);
			else removeStyle(rule.id);
		}
		shopRecommendHider.apply(opts.blockLeftShopRecommend);
		itemRelatedHider.apply(opts.blockItemRelatedProducts);
		charRelatedHider.apply(opts.blockCharRelatedProducts);
		if (opts.blockRightAdBanner && opts.blockRightRanking && opts.blockRightHotRecommend) addStyle(EXPAND_CSS, EXPAND_ID);
		else removeStyle(EXPAND_ID);
	}
	function removeAllStyles() {
		for (const rule of Object.values(CSS_RULES)) removeStyle(rule.id);
		removeStyle(EXPAND_ID);
		for (const hider of domHiders) {
			hider.apply(false);
			hider.reset();
		}
	}
	var cleanups$1 = [];
	var component$1 = defineComponent({
		name: "blockNoise",
		displayName: "屏蔽广告内容",
		description: "屏蔽hpoi各处的广告、推荐、排行榜等",
		tags: [componentTags.display],
		enabledByDefault: true,
		alwaysOn: true,
		urlInclude: [
			/hpoi\.net\/(index)?$/,
			/hpoi\.net\/user\/home/,
			/hpoi\.net\/hobby/,
			/hpoi\.net\/charactar/,
			/hpoi\.net\/company/,
			/hpoi\.net\/series/,
			/hpoi\.net\/works/
		],
		options: schema$1,
		entry: ({ options }) => {
			applyStyles(options);
			cleanups$1 = Object.keys(schema$1).map((key) => settings.onChange(`components.blockNoise.options.${key}`, () => {
				const { options: current } = settings.getComponent("blockNoise", schema$1);
				applyStyles(current);
			}));
		},
		reload: () => {
			const { options } = settings.getComponent("blockNoise", schema$1);
			applyStyles(options);
		},
		unload: () => {
			removeAllStyles();
			for (const fn of cleanups$1) fn();
			cleanups$1 = [];
		}
	});
function onUrlChange(callback) {
		let last = location.href;
		const check = () => {
			const current = location.href;
			if (current !== last) {
				last = current;
				callback(current);
			}
		};
		const origPush = history.pushState.bind(history);
		const origReplace = history.replaceState.bind(history);
		history.pushState = (...args) => {
			origPush(...args);
			check();
		};
		history.replaceState = (...args) => {
			origReplace(...args);
			check();
		};
		window.addEventListener("popstate", check);
		return () => {
			history.pushState = origPush;
			history.replaceState = origReplace;
			window.removeEventListener("popstate", check);
		};
	}
	var custom_browse_exports = __exportAll({ component: () => component });
	var schema = {
		unlockR18: {
			defaultValue: false,
			displayName: "不限年龄",
			description: "进入资料库时自动添加 r18=-1，显示所有年龄段商品"
		},
		femaleOnly: {
			defaultValue: false,
			displayName: "只看妹子",
			description: "进入资料库时自动添加 sex=0，只显示女性角色商品"
		}
	};
	var ARCHIVE_RE = /^\/hobby\/all/;
	function applyArchiveParams(opts) {
		if (!ARCHIVE_RE.test(location.pathname)) return;
		const params = new URLSearchParams(location.search);
		let changed = false;
		if (opts.unlockR18 && params.get("r18") !== "-1") {
			params.set("r18", "-1");
			changed = true;
		}
		if (opts.femaleOnly && params.get("sex") !== "0") {
			params.set("sex", "0");
			changed = true;
		}
		if (changed) location.replace(`${location.pathname}?${params.toString()}`);
	}
	function getCurrentOpts() {
		const { options } = settings.getComponent("customBrowse", schema);
		return options;
	}
	var cleanups = [];
	var component = defineComponent({
		name: "customBrowse",
		displayName: "自动资料库筛选项",
		tags: [componentTags.utility],
		enabledByDefault: true,
		alwaysOn: true,
		options: schema,
		entry: ({ options }) => {
			applyArchiveParams(options);
			cleanups.push(onUrlChange(() => applyArchiveParams(getCurrentOpts())), ...Object.keys(schema).map((key) => settings.onChange(`components.customBrowse.options.${key}`, () => applyArchiveParams(getCurrentOpts()))));
		},
		unload: () => {
			for (const fn of cleanups) fn();
			cleanups = [];
		}
	});
	var levels = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3
	};
	var currentLevel = "info";
	var logger = {
		setLevel(level) {
			currentLevel = level;
		},
		debug(...args) {
			if (levels[currentLevel] <= levels.debug) console.debug(LOG_PREFIX, ...args);
		},
		info(...args) {
			if (levels[currentLevel] <= levels.info) console.log(LOG_PREFIX, ...args);
		},
		warn(...args) {
			if (levels[currentLevel] <= levels.warn) console.warn(LOG_PREFIX, ...args);
		},
		error(...args) {
			if (levels[currentLevel] <= levels.error) console.error(LOG_PREFIX, ...args);
		}
	};
	var LifecycleEvent = function(LifecycleEvent) {
		LifecycleEvent["Start"] = "Start";
		LifecycleEvent["ComponentsLoaded"] = "ComponentsLoaded";
		LifecycleEvent["End"] = "End";
		return LifecycleEvent;
	}({});
	function raiseLifecycleEvent(event) {
		logger.debug(`Lifecycle: ${event}`);
	}
	function matchesPattern(pattern) {
		return matchCurrentUrl((Array.isArray(pattern) ? pattern : [pattern]).map((p) => typeof p === "string" ? new RegExp(p) : p));
	}
	function shouldRunOnCurrentPage(meta) {
		if (meta.urlInclude && !matchesPattern(meta.urlInclude)) return false;
		if (meta.urlExclude && matchesPattern(meta.urlExclude)) return false;
		return true;
	}
	function buildOptions(meta) {
		const schema = meta.options ?? {};
		return settings.getComponent(meta.name, schema);
	}
var allComponents = new Map();
var loadedComponents = new Map();
function registerComponents(components) {
		for (const meta of components) allComponents.set(meta.name, meta);
	}
function getAllComponents() {
		return Array.from(allComponents.values());
	}
	async function loadComponent(meta) {
		const componentSettings = buildOptions(meta);
		if (meta.enabledByDefault && !settings.get(`components.${meta.name}.enabled`)) {
			settings.set(`components.${meta.name}.enabled`, true);
			componentSettings.enabled = true;
		}
		if (!componentSettings.enabled) {
			logger.debug(`Skipping disabled component: ${meta.name}`);
			return false;
		}
		if (!shouldRunOnCurrentPage(meta)) {
			logger.debug(`Skipping component (URL mismatch): ${meta.name}`);
			return false;
		}
		for (const { id, style } of meta.instantStyles ?? []) addStyle(typeof style === "function" ? style() : style, `${meta.name}:${id}`);
		try {
			await meta.entry({
				options: componentSettings.options,
				enabled: true
			});
			loadedComponents.set(meta.name, meta);
			logger.debug(`Loaded: ${meta.name}`);
			return true;
		} catch (err) {
			logger.error(`Error in component "${meta.name}":`, err);
			return false;
		}
	}
	async function loadAllComponents(components) {
		let loaded = 0;
		for (const meta of components) if (await loadComponent(meta)) loaded++;
		logger.info(`${loaded}/${components.length} components active`);
	}
	async function enableComponent(name) {
		settings.set(`components.${name}.enabled`, true);
		const meta = loadedComponents.get(name);
		if (meta) {
			if (meta.reload) Promise.resolve(meta.reload()).catch((e) => logger.error(`reload error in "${name}":`, e));
		} else {
			const registered = allComponents.get(name);
			if (registered) await loadComponent(registered);
		}
	}
	function disableComponent(name) {
		settings.set(`components.${name}.enabled`, false);
		const meta = loadedComponents.get(name);
		if (meta) {
			for (const { id } of meta.instantStyles ?? []) removeStyle(`${name}:${id}`);
			if (meta.unload) Promise.resolve(meta.unload()).catch((e) => logger.error(`unload error in "${name}":`, e));
			loadedComponents.delete(name);
		}
	}
	var CSS = `
  :host {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  /* ── Floating button ── */
  .fab {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    background: #6366f1;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s, transform .1s;
    user-select: none;
  }
  .fab:hover  { background: #4f46e5; }
  .fab:active { transform: scale(.94); }

  /* ── Panel ── */
  .panel {
    position: absolute;
    bottom: 52px;
    right: 0;
    width: 300px;
    max-height: 480px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transition: opacity .15s, transform .15s;
  }
  .panel[hidden] {
    display: none;
  }

  /* ── Panel header ── */
  .panel-head {
    padding: 12px 14px;
    background: #6366f1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .panel-title {
    font-weight: 600;
    font-size: 14px;
    letter-spacing: .3px;
  }
  .btn-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    opacity: .75;
    transition: opacity .1s;
  }
  .btn-close:hover { opacity: 1; }

  /* ── Scrollable body ── */
  .panel-body {
    overflow-y: auto;
    flex: 1;
  }

  /* ── Component row ── */
  .comp-row {
    padding: 10px 14px;
    border-bottom: 1px solid #f0f0f0;
  }
  .comp-row:last-child { border-bottom: none; }

  .comp-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .comp-info { flex: 1; min-width: 0; }
  .comp-name {
    font-weight: 500;
    font-size: 13px;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .comp-desc {
    font-size: 11.5px;
    color: #999;
    margin-top: 2px;
  }

  /* ── Options ── */
  .opts {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f4f4f4;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .opt-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .opt-label {
    font-size: 12px;
    color: #555;
    flex: 1;
  }
  .opt-input {
    width: 58px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 5px;
    font-size: 12px;
    text-align: right;
    outline: none;
  }
  .opt-input:focus { border-color: #6366f1; }
  .opt-select {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 12px;
    outline: none;
  }
  .opt-select:focus { border-color: #6366f1; }

  /* ── Toggle switch ── */
  .switch {
    position: relative;
    width: 34px;
    height: 19px;
    flex-shrink: 0;
  }
  .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .track {
    position: absolute;
    inset: 0;
    background: #ccc;
    border-radius: 19px;
    cursor: pointer;
    transition: background .2s;
  }
  .track::before {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
    left: 3px;
    top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform .2s;
  }
  input:checked + .track              { background: #6366f1; }
  input:checked + .track::before      { transform: translateX(15px); }
  input:disabled + .track             { opacity: .45; cursor: not-allowed; }

  /* ── Empty state ── */
  .empty {
    padding: 24px;
    text-align: center;
    color: #aaa;
    font-size: 13px;
  }
`;
	function makeSwitch(checked, onChange, disabled = false) {
		const label = document.createElement("label");
		label.className = "switch";
		const input = document.createElement("input");
		input.type = "checkbox";
		input.checked = checked;
		input.disabled = disabled;
		input.addEventListener("change", () => onChange(input.checked));
		const track = document.createElement("span");
		track.className = "track";
		label.appendChild(input);
		label.appendChild(track);
		return label;
	}
	function renderComponentRow(meta, body) {
		const compSettings = settings.getComponent(meta.name, meta.options ?? {});
		const row = document.createElement("div");
		row.className = "comp-row";
		const header = document.createElement("div");
		header.className = "comp-header";
		const info = document.createElement("div");
		info.className = "comp-info";
		const name = document.createElement("div");
		name.className = "comp-name";
		name.textContent = meta.displayName;
		info.appendChild(name);
		if (meta.description) {
			const desc = document.createElement("div");
			desc.className = "comp-desc";
			desc.textContent = meta.description;
			info.appendChild(desc);
		}
		header.appendChild(info);
		if (!meta.alwaysOn) header.appendChild(makeSwitch(compSettings.enabled, async (enabled) => {
			if (enabled) await enableComponent(meta.name);
			else disableComponent(meta.name);
			const updated = body.querySelector(`[data-comp="${meta.name}"]`);
			if (updated) {
				const fresh = document.createElement("div");
				fresh.setAttribute("data-comp", meta.name);
				renderComponentRow(meta, fresh);
				updated.replaceWith(fresh.firstChild);
			}
		}));
		row.appendChild(header);
		const schema = meta.options;
		if ((meta.alwaysOn ? true : compSettings.enabled) && schema && Object.keys(schema).length > 0) {
			const opts = document.createElement("div");
			opts.className = "opts";
			for (const [key, def] of Object.entries(schema)) {
				const path = `components.${meta.name}.options.${key}`;
				const value = settings.get(path) ?? def.defaultValue;
				const optRow = document.createElement("div");
				optRow.className = "opt-row";
				const label = document.createElement("span");
				label.className = "opt-label";
				label.textContent = def.displayName;
				optRow.appendChild(label);
				if (typeof def.defaultValue === "boolean") optRow.appendChild(makeSwitch(value, (v) => settings.set(path, v)));
				else if (typeof def.defaultValue === "number") {
					const input = document.createElement("input");
					input.type = "number";
					input.className = "opt-input";
					input.value = String(value);
					input.addEventListener("change", () => settings.set(path, Number(input.value)));
					optRow.appendChild(input);
				} else if (Array.isArray(def.choices) && def.choices.length > 0) {
					const sel = document.createElement("select");
					sel.className = "opt-select";
					for (const choice of def.choices) {
						const opt = document.createElement("option");
						opt.value = String(choice);
						opt.textContent = String(choice);
						if (choice === value) opt.selected = true;
						sel.appendChild(opt);
					}
					sel.addEventListener("change", () => settings.set(path, sel.value));
					optRow.appendChild(sel);
				} else {
					const input = document.createElement("input");
					input.type = "text";
					input.className = "opt-input";
					input.style.width = "90px";
					input.value = String(value);
					input.addEventListener("change", () => settings.set(path, input.value));
					optRow.appendChild(input);
				}
				opts.appendChild(optRow);
			}
			row.appendChild(opts);
		}
		const wrapper = document.createElement("div");
		wrapper.setAttribute("data-comp", meta.name);
		wrapper.appendChild(row);
		body.appendChild(wrapper);
	}
	function renderBody(body) {
		body.innerHTML = "";
		const components = getAllComponents();
		if (components.length === 0) {
			const empty = document.createElement("div");
			empty.className = "empty";
			empty.textContent = "暂无可配置的功能";
			body.appendChild(empty);
			return;
		}
		for (const meta of components) renderComponentRow(meta, body);
	}
	function mountSettingsPanel() {
		const host = document.createElement("div");
		host.id = "hpoi-helper-settings";
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = CSS;
		shadow.appendChild(style);
		const fab = document.createElement("button");
		fab.className = "fab";
		fab.title = "Hpoi Helper 设置";
		fab.textContent = "⚙";
		shadow.appendChild(fab);
		const panel = document.createElement("div");
		panel.className = "panel";
		panel.hidden = true;
		shadow.appendChild(panel);
		const head = document.createElement("div");
		head.className = "panel-head";
		const title = document.createElement("span");
		title.className = "panel-title";
		title.textContent = "⚙ Hpoi Helper";
		const closeBtn = document.createElement("button");
		closeBtn.className = "btn-close";
		closeBtn.title = "关闭";
		closeBtn.textContent = "×";
		closeBtn.addEventListener("click", () => {
			panel.hidden = true;
		});
		head.appendChild(title);
		head.appendChild(closeBtn);
		panel.appendChild(head);
		const body = document.createElement("div");
		body.className = "panel-body";
		panel.appendChild(body);
		fab.addEventListener("click", () => {
			panel.hidden = !panel.hidden;
			if (!panel.hidden) renderBody(body);
		});
	}
	var featureModules = Object.assign({
		"./features/block-noise/index.ts": block_noise_exports,
		"./features/custom-browse/index.ts": custom_browse_exports
	});
	async function bootstrap() {
		raiseLifecycleEvent(LifecycleEvent.Start);
		logger.setLevel(settings.get("logLevel") ?? "info");
		logger.info(`v${VERSION} initializing…`);
		const components = [];
		for (const mod of Object.values(featureModules)) if (mod.component) components.push(mod.component);
		registerComponents(components);
		await loadAllComponents(components);
		raiseLifecycleEvent(LifecycleEvent.ComponentsLoaded);
		mountSettingsPanel();
		raiseLifecycleEvent(LifecycleEvent.End);
		logger.info("Ready.");
	}
	bootstrap().catch((e) => console.error("[Hpoi Helper] Bootstrap failed:", e));
})();