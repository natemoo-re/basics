export type Child = Node | Node[] | string | number | boolean | null | undefined | unknown;

const SVG_ELEMENTS = new Set([
	'altGlyph',
	'altGlyphDef',
	'altGlyphItem',
	'animate',
	'animateColor',
	'animateMotion',
	'animateTransform',
	'circle',
	'clipPath',
	'color-profile',
	'cursor',
	'defs',
	'desc',
	'ellipse',
	'feBlend',
	'feColorMatrix',
	'feComponentTransfer',
	'feComposite',
	'feConvolveMatrix',
	'feDiffuseLighting',
	'feDisplacementMap',
	'feDistantLight',
	'feFlood',
	'feFuncA',
	'feFuncB',
	'feFuncG',
	'feFuncR',
	'feGaussianBlur',
	'feImage',
	'feMerge',
	'feMergeNode',
	'feMorphology',
	'feOffset',
	'fePointLight',
	'feSpecularLighting',
	'feSpotLight',
	'feTile',
	'feTurbulence',
	'filter',
	'font',
	'font-face',
	'font-face-format',
	'font-face-name',
	'font-face-src',
	'font-face-uri',
	'foreignObject',
	'g',
	'glyph',
	'glyphRef',
	'hkern',
	'image',
	'line',
	'linearGradient',
	'marker',
	'mask',
	'metadata',
	'missing-glyph',
	'mpath',
	'path',
	'pattern',
	'polygon',
	'polyline',
	'radialGradient',
	'rect',
	'set',
	'stop',
	'svg',
	'switch',
	'symbol',
	'text',
	'textPath',
	'tref',
	'tspan',
	'use',
	'view',
	'vkern',
]);

function createElement(tag: string): HTMLElement | SVGElement {
	if (SVG_ELEMENTS.has(tag)) return document.createElementNS('http://www.w3.org/2000/svg', tag);
	return document.createElement(tag);
}

export function h<C extends (props: Props, ...children: Child[]) => any, Props extends Record<string, any>>(
	tag: C,
	props?: Props,
	...children: Child[]
): any;
export function h<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	props?: Record<string, any>,
	...children: Child[]
): HTMLElementTagNameMap[K];
export function h(tagName: string, props?: Record<string, any>, ...children: Child[]): HTMLElement;
export function h(tag: any, props: Record<string, any> = {}, ...children: Child[]) {
	if (typeof tag === "function") {
		props.children = !props.children ? children : props.children;
		return tag(props);
	} else {
		const element = createElement(tag);

		// Normalize children
		const normalized: Node[] = [];
		normalizeChildren(normalized, children);

		for (let i = 0; i < normalized.length; i++) {
			const child = normalized[i];
			element.appendChild(child);
		}

		for (const [key, value] of Object.entries(props)) {
			if (typeof value === 'function') {
				element.addEventListener(key.replace(/^on/, ''), value);
				continue;
			}
			if (key in element) {
				(element as any)[key] = value;
			} else {
				element.setAttribute(key, value);
			}
		}

		return element;
	}
}

function normalizeChildren(arr: any[], child: any) {
	// Ignore these
	if (child == null || typeof child === "boolean" || child === 0) {
		return;
	}

	if (Array.isArray(child)) {
		for (let i = 0; i < child.length; i++) {
			normalizeChildren(arr, child[i]);
		}
	} else if (typeof child === "object") {
		arr.push(child);
	} else {
		arr.push(new Text(child));
	}
}

export function action(
	name: string,
	handler: (event: Event) => void | Promise<void>,
	scope = document
) {
	const toRemove: Array<() => void> = [];
	for (const el of scope.querySelectorAll(`[data-action="${name}"]`)) {
		const {
			dataset: { trigger = 'click' },
		} = el as HTMLElement;
		el.addEventListener(trigger, handler);
		toRemove.push(() => el.removeEventListener(trigger, handler));
	}
	return () => {
		for (const remove of toRemove) {
			remove();
		}
	};
}
