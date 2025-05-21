import {type stop} from '../core/constants.js';
import type {Input, Options} from './options.js';
import type {ResponsePromise} from './ResponsePromise.js';

type ReturnTypeOfLastSafe<T extends unknown[]> = T extends [...infer _, infer F extends (...arguments_: unknown[]) => unknown] ? ReturnType<F> : never;
type GetBeforeReturnHookType<T extends Partial<Options>> = T extends {hooks: {beforeReturn: [...infer Q]}} ? Q : never;

export type GetKyReturnType<T extends Partial<Options>> = [GetBeforeReturnHookType<T>] extends [never] ? ResponsePromise : Promise<ReturnTypeOfLastSafe<GetBeforeReturnHookType<T>>>;
export type GetTypedReturnKyInstance<T extends Partial<Options> | undefined> = T extends undefined
	? KyInstance<unknown>
	: [T] extends [never]
		? KyInstance<unknown>
		: [GetBeforeReturnHookType<Exclude<T, undefined>>] extends [never]
			? KyInstance<unknown>
			: KyInstance<GetKyReturnType<Exclude<T, undefined>>>;

export type KyMethodReturn<OverrideOptions extends Partial<Options> | never = never, DefaultReturn = unknown> = [OverrideOptions] extends [never]
		? DefaultReturn extends unknown
		? ResponsePromise<unknown>
			: Promise<DefaultReturn>
			: [GetBeforeReturnHookType<Exclude<OverrideOptions, never>>] extends [never]
				? ResponsePromise<DefaultReturn>
				: GetKyReturnType<Exclude<OverrideOptions, never>>;

// returns true if types are compatible, false otherwise
// ? Type ky return as never when ReturnValue is diffirent from return value from Options
type CheckReturnTypes<ReturnValue, Opts extends Partial<Options>> = unknown extends ReturnValue ? true : GetBeforeReturnHookType<Opts> extends never ? true : Exclude<Promise<ReturnValue>, GetKyReturnType<Opts>> extends never ? true : false;

export type CallableInstance<DefaultReturn> = unknown extends DefaultReturn
	?
	/**
	Fetch the given `url`.

	@param url - `Request` object, `URL` object, or URL string.

	@returns A promise with `Body` method added.

	@example
	```
	import ky from 'ky';
	const json = await ky('https://example.com', {json: {foo: true}}).json();
	console.log(json);
	//=> `{data: '🦄'}`
	```
	*/
	<K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
	:
	/**
	Fetch the given `url`.

	@param url - `Request` object, `URL` object, or URL string.

	@returns A promise with `Body` method added.

	@example
	```
	import ky from 'ky';
	const json = await ky('https://example.com', {json: {foo: true}}).json();
	console.log(json);
	//=> `{data: '🦄'}`
	```
	*/
	(url: Input, options: Partial<Options>) => Promise<DefaultReturn>;
	// <K extends Partial<Options>>(url: Input, options?: K): KyMethodReturn<K, DefaultReturn>;

export type KyInstance<DefaultReturn = unknown> = CallableInstance<DefaultReturn> & {
	/**
	Fetch the given `url` using the option `{method: 'get'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	get: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Fetch the given `url` using the option `{method: 'post'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	post: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Fetch the given `url` using the option `{method: 'put'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	put: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Fetch the given `url` using the option `{method: 'delete'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	delete: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Fetch the given `url` using the option `{method: 'patch'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	patch: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Fetch the given `url` using the option `{method: 'head'}`.

	@param url - `Request` object, `URL` object, or URL string.
	@returns A promise with `Body` methods added.
	*/
	head: DefaultReturn extends unknown
		? <K, Q extends Partial<Options> = Partial<Options>>(url: Input, options?: Q) => KyMethodReturn<Q extends Options ? Q : never, K>
		: (url: Input, options?: Options) => Promise<DefaultReturn>;

	/**
	Create a new Ky instance with complete new defaults.

	@returns A new Ky instance.
	*/
	create: <K extends Partial<Options>>(defaultOptions?: K) => GetTypedReturnKyInstance<K>;

	/**
	Create a new Ky instance with some defaults overridden with your own.

	In contrast to `ky.create()`, `ky.extend()` inherits defaults from its parent.

	You can also refer to parent defaults by providing a function to `.extend()`.

	@example
	```
	import ky from 'ky';

	const api = ky.create({prefixUrl: 'https://example.com/api'});

	const usersApi = api.extend((options) => ({prefixUrl: `${options.prefixUrl}/users`}));

	const response = await usersApi.get('123');
	//=> 'https://example.com/api/users/123'

	const response = await api.get('version');
	//=> 'https://example.com/api/version'
	```

	@returns A new Ky instance.
	*/
	extend: <K extends Partial<Options>>(
		defaultOptions: K | ((parentOptions: DefaultReturn | Record<string | number | symbol, unknown >
		) => K),
	) => GetTypedReturnKyInstance<K>;

	/**
	A `Symbol` that can be returned by a `beforeRetry` hook to stop the retry. This will also short circuit the remaining `beforeRetry` hooks.

	Note: Returning this symbol makes Ky abort and return with an `undefined` response. Be sure to check for a response before accessing any properties on it or use [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining). It is also incompatible with body methods, such as `.json()` or `.text()`, because there is no response to parse. In general, we recommend throwing an error instead of returning this symbol, as that will cause Ky to abort and then throw, which avoids these limitations.

	A valid use-case for `ky.stop` is to prevent retries when making requests for side effects, where the returned data is not important. For example, logging client activity to the server.

	@example
	```
	import ky from 'ky';

	const options = {
		hooks: {
			beforeRetry: [
				async ({request, options, error, retryCount}) => {
					const shouldStopRetry = await ky('https://example.com/api');
					if (shouldStopRetry) {
						return ky.stop;
					}
				}
			]
		}
	};

	// Note that response will be `undefined` in case `ky.stop` is returned.
	const response = await ky.post('https://example.com', options);

	// Using `.text()` or other body methods is not supported.
	const text = await ky('https://example.com', options).text();
	```
	*/
	readonly stop: typeof stop;
};
