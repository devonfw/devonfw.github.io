import * as i3 from '@ngrx/store';
import { compose, ScannedActionsSubject, createAction } from '@ngrx/store';
import * as i1 from 'rxjs';
import { merge, Observable, Subject, defer, Notification, pipe, of } from 'rxjs';
import { ignoreElements, materialize, map, catchError, filter, groupBy, mergeMap, exhaustMap, dematerialize, take, concatMap, finalize, withLatestFrom } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { Injectable, Inject, InjectionToken, NgModule, Optional, Injector, SkipSelf, Self } from '@angular/core';

const DEFAULT_EFFECT_CONFIG = {
    dispatch: true,
    useEffectsErrorHandler: true,
};
const CREATE_EFFECT_METADATA_KEY = '__@ngrx/effects_create__';

/**
 * @description
 * Creates an effect from an `Observable` and an `EffectConfig`.
 *
 * @param source A function which returns an `Observable`.
 * @param config A `Partial<EffectConfig>` to configure the effect.  By default, `dispatch` is true and `useEffectsErrorHandler` is true.
 * @returns If `EffectConfig`#`dispatch` is true, returns `Observable<Action>`.  Else, returns `Observable<unknown>`.
 *
 * @usageNotes
 *
 * ** Mapping to a different action **
 * ```ts
 * effectName$ = createEffect(
 *   () => this.actions$.pipe(
 *     ofType(FeatureActions.actionOne),
 *     map(() => FeatureActions.actionTwo())
 *   )
 * );
 * ```
 *
 *  ** Non-dispatching effects **
 * ```ts
 * effectName$ = createEffect(
 *   () => this.actions$.pipe(
 *     ofType(FeatureActions.actionOne),
 *     tap(() => console.log('Action One Dispatched'))
 *   ),
 *   { dispatch: false }
 *   // FeatureActions.actionOne is not dispatched
 * );
 * ```
 */
function createEffect(source, config) {
    const effect = source();
    const value = {
        ...DEFAULT_EFFECT_CONFIG,
        ...config, // Overrides any defaults if values are provided
    };
    Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
        value,
    });
    return effect;
}
function getCreateEffectMetadata(instance) {
    const propertyNames = Object.getOwnPropertyNames(instance);
    const metadata = propertyNames
        .filter((propertyName) => {
        if (instance[propertyName] &&
            instance[propertyName].hasOwnProperty(CREATE_EFFECT_METADATA_KEY)) {
            // If the property type has overridden `hasOwnProperty` we need to ensure
            // that the metadata is valid (containing a `dispatch`property)
            // https://github.com/ngrx/platform/issues/2975
            const property = instance[propertyName];
            return property[CREATE_EFFECT_METADATA_KEY].hasOwnProperty('dispatch');
        }
        return false;
    })
        .map((propertyName) => {
        const metaData = instance[propertyName][CREATE_EFFECT_METADATA_KEY];
        return {
            propertyName,
            ...metaData,
        };
    });
    return metadata;
}

function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}

const METADATA_KEY = '__@ngrx/effects__';
/**
 * @deprecated The Effect decorator (`@Effect`) is deprecated in favor for the `createEffect` method.
 * See the docs for more info {@link https://ngrx.io/guide/migration/v11#the-effect-decorator}
 */
function Effect(config = {}) {
    return function (target, propertyName) {
        const metadata = {
            ...DEFAULT_EFFECT_CONFIG,
            ...config,
            propertyName,
        };
        addEffectMetadataEntry(target, metadata);
    };
}
function getEffectDecoratorMetadata(instance) {
    const effectsDecorators = compose(getEffectMetadataEntries, getSourceForInstance)(instance);
    return effectsDecorators;
}
/**
 * Type guard to detemine whether METADATA_KEY is already present on the Class
 * constructor
 */
function hasMetadataEntries(sourceProto) {
    return sourceProto.constructor.hasOwnProperty(METADATA_KEY);
}
/** Add Effect Metadata to the Effect Class constructor under specific key */
function addEffectMetadataEntry(sourceProto, metadata) {
    if (hasMetadataEntries(sourceProto)) {
        sourceProto.constructor[METADATA_KEY].push(metadata);
    }
    else {
        Object.defineProperty(sourceProto.constructor, METADATA_KEY, {
            value: [metadata],
        });
    }
}
function getEffectMetadataEntries(sourceProto) {
    return hasMetadataEntries(sourceProto)
        ? sourceProto.constructor[METADATA_KEY]
        : [];
}

function getEffectsMetadata(instance) {
    return getSourceMetadata(instance).reduce((acc, { propertyName, dispatch, useEffectsErrorHandler }) => {
        acc[propertyName] = { dispatch, useEffectsErrorHandler };
        return acc;
    }, {});
}
function getSourceMetadata(instance) {
    const effects = [
        getEffectDecoratorMetadata,
        getCreateEffectMetadata,
    ];
    return effects.reduce((sources, source) => sources.concat(source(instance)), []);
}

function mergeEffects(sourceInstance, globalErrorHandler, effectsErrorHandler) {
    const sourceName = getSourceForInstance(sourceInstance).constructor.name;
    const observables$ = getSourceMetadata(sourceInstance).map(({ propertyName, dispatch, useEffectsErrorHandler, }) => {
        const observable$ = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        const effectAction$ = useEffectsErrorHandler
            ? effectsErrorHandler(observable$, globalErrorHandler)
            : observable$;
        if (dispatch === false) {
            return effectAction$.pipe(ignoreElements());
        }
        const materialized$ = effectAction$.pipe(materialize());
        return materialized$.pipe(map((notification) => ({
            effect: sourceInstance[propertyName],
            notification,
            propertyName,
            sourceName,
            sourceInstance,
        })));
    });
    return merge(...observables$);
}

const MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS) {
    return observable$.pipe(catchError((error) => {
        if (errorHandler)
            errorHandler.handleError(error);
        if (retryAttemptLeft <= 1) {
            return observable$; // last attempt
        }
        // Return observable that produces this particular effect
        return defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft - 1);
    }));
}

class Actions extends Observable {
    constructor(source) {
        super();
        if (source) {
            this.source = source;
        }
    }
    lift(operator) {
        const observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
}
/** @nocollapse */ /** @nocollapse */ Actions.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: Actions, deps: [{ token: ScannedActionsSubject }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ /** @nocollapse */ Actions.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: Actions });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: Actions, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Observable, decorators: [{
                    type: Inject,
                    args: [ScannedActionsSubject]
                }] }]; } });
/**
 * `ofType` filters an Observable of `Actions` into an Observable of the actions
 * whose type strings are passed to it.
 *
 * For example, if `actions` has type `Actions<AdditionAction|SubstractionAction>`, and
 * the type of the `Addition` action is `add`, then
 * `actions.pipe(ofType('add'))` returns an `Observable<AdditionAction>`.
 *
 * Properly typing this function is hard and requires some advanced TS tricks
 * below.
 *
 * Type narrowing automatically works, as long as your `actions` object
 * starts with a `Actions<SomeUnionOfActions>` instead of generic `Actions`.
 *
 * For backwards compatibility, when one passes a single type argument
 * `ofType<T>('something')` the result is an `Observable<T>`. Note, that `T`
 * completely overrides any possible inference from 'something'.
 *
 * Unfortunately, for unknown 'actions: Actions' these types will produce
 * 'Observable<never>'. In such cases one has to manually set the generic type
 * like `actions.ofType<AdditionAction>('add')`.
 *
 * @usageNotes
 *
 * Filter the Actions stream on the "customers page loaded" action
 *
 * ```ts
 * import { ofType } from '@ngrx/effects';
 * import * fromCustomers from '../customers';
 *
 * this.actions$.pipe(
 *  ofType(fromCustomers.pageLoaded)
 * )
 * ```
 */
function ofType(...allowedTypes) {
    return filter((action) => allowedTypes.some((typeOrActionCreator) => {
        if (typeof typeOrActionCreator === 'string') {
            // Comparing the string to type
            return typeOrActionCreator === action.type;
        }
        // We are filtering by ActionCreator
        return typeOrActionCreator.type === action.type;
    }));
}

function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        const action = output.notification.value;
        const isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error(`Effect ${getEffectName(output)} dispatched an invalid action: ${stringify(action)}`));
        }
    }
}
function isAction(action) {
    return (typeof action !== 'function' &&
        action &&
        action.type &&
        typeof action.type === 'string');
}
function getEffectName({ propertyName, sourceInstance, sourceName, }) {
    const isMethod = typeof sourceInstance[propertyName] === 'function';
    return `"${sourceName}.${String(propertyName)}${isMethod ? '()' : ''}"`;
}
function stringify(action) {
    try {
        return JSON.stringify(action);
    }
    catch {
        return action;
    }
}

const onIdentifyEffectsKey = 'ngrxOnIdentifyEffects';
function isOnIdentifyEffects(instance) {
    return isFunction(instance, onIdentifyEffectsKey);
}
const onRunEffectsKey = 'ngrxOnRunEffects';
function isOnRunEffects(instance) {
    return isFunction(instance, onRunEffectsKey);
}
const onInitEffects = 'ngrxOnInitEffects';
function isOnInitEffects(instance) {
    return isFunction(instance, onInitEffects);
}
function isFunction(instance, functionName) {
    return (instance &&
        functionName in instance &&
        typeof instance[functionName] === 'function');
}

const _ROOT_EFFECTS_GUARD = new InjectionToken('@ngrx/effects Internal Root Guard');
const USER_PROVIDED_EFFECTS = new InjectionToken('@ngrx/effects User Provided Effects');
const _ROOT_EFFECTS = new InjectionToken('@ngrx/effects Internal Root Effects');
const ROOT_EFFECTS = new InjectionToken('@ngrx/effects Root Effects');
const _FEATURE_EFFECTS = new InjectionToken('@ngrx/effects Internal Feature Effects');
const FEATURE_EFFECTS = new InjectionToken('@ngrx/effects Feature Effects');
const EFFECTS_ERROR_HANDLER = new InjectionToken('@ngrx/effects Effects Error Handler');

class EffectSources extends Subject {
    constructor(errorHandler, effectsErrorHandler) {
        super();
        this.errorHandler = errorHandler;
        this.effectsErrorHandler = effectsErrorHandler;
    }
    addEffects(effectSourceInstance) {
        this.next(effectSourceInstance);
    }
    /**
     * @internal
     */
    toActions() {
        return this.pipe(groupBy(getSourceForInstance), mergeMap((source$) => {
            return source$.pipe(groupBy(effectsInstance));
        }), mergeMap((source$) => {
            const effect$ = source$.pipe(exhaustMap((sourceInstance) => {
                return resolveEffectSource(this.errorHandler, this.effectsErrorHandler)(sourceInstance);
            }), map((output) => {
                reportInvalidActions(output, this.errorHandler);
                return output.notification;
            }), filter((notification) => notification.kind === 'N' && notification.value != null), dematerialize());
            // start the stream with an INIT action
            // do this only for the first Effect instance
            const init$ = source$.pipe(take(1), filter(isOnInitEffects), map((instance) => instance.ngrxOnInitEffects()));
            return merge(effect$, init$);
        }));
    }
}
/** @nocollapse */ /** @nocollapse */ EffectSources.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectSources, deps: [{ token: i0.ErrorHandler }, { token: EFFECTS_ERROR_HANDLER }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ /** @nocollapse */ EffectSources.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectSources });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectSources, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.ErrorHandler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EFFECTS_ERROR_HANDLER]
                }] }]; } });
function effectsInstance(sourceInstance) {
    if (isOnIdentifyEffects(sourceInstance)) {
        return sourceInstance.ngrxOnIdentifyEffects();
    }
    return '';
}
function resolveEffectSource(errorHandler, effectsErrorHandler) {
    return (sourceInstance) => {
        const mergedEffects$ = mergeEffects(sourceInstance, errorHandler, effectsErrorHandler);
        if (isOnRunEffects(sourceInstance)) {
            return sourceInstance.ngrxOnRunEffects(mergedEffects$);
        }
        return mergedEffects$;
    };
}

class EffectsRunner {
    constructor(effectSources, store) {
        this.effectSources = effectSources;
        this.store = store;
        this.effectsSubscription = null;
    }
    start() {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    }
    ngOnDestroy() {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    }
}
/** @nocollapse */ /** @nocollapse */ EffectsRunner.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRunner, deps: [{ token: EffectSources }, { token: i3.Store }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ /** @nocollapse */ EffectsRunner.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRunner });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRunner, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: EffectSources }, { type: i3.Store }]; } });

const ROOT_EFFECTS_INIT = '@ngrx/effects/init';
const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);
class EffectsRootModule {
    constructor(sources, runner, store, rootEffects, storeRootModule, storeFeatureModule, guard) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach((effectSourceInstance) => sources.addEffects(effectSourceInstance));
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    addEffects(effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    }
}
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule, deps: [{ token: EffectSources }, { token: EffectsRunner }, { token: i3.Store }, { token: ROOT_EFFECTS }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }, { token: _ROOT_EFFECTS_GUARD, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule });
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: function () { return [{ type: EffectSources }, { type: EffectsRunner }, { type: i3.Store }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [ROOT_EFFECTS]
                }] }, { type: i3.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i3.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ROOT_EFFECTS_GUARD]
                }] }]; } });

class EffectsFeatureModule {
    constructor(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        effectSourceGroups.forEach((group) => group.forEach((effectSourceInstance) => root.addEffects(effectSourceInstance)));
    }
}
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule, deps: [{ token: EffectsRootModule }, { token: FEATURE_EFFECTS }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule });
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: function () { return [{ type: EffectsRootModule }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [FEATURE_EFFECTS]
                }] }, { type: i3.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i3.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }]; } });

class EffectsModule {
    static forFeature(featureEffects = []) {
        return {
            ngModule: EffectsFeatureModule,
            providers: [
                featureEffects,
                {
                    provide: _FEATURE_EFFECTS,
                    multi: true,
                    useValue: featureEffects,
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    useFactory: createEffects,
                    deps: [Injector, _FEATURE_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    }
    static forRoot(rootEffects = []) {
        return {
            ngModule: EffectsRootModule,
            providers: [
                {
                    provide: EFFECTS_ERROR_HANDLER,
                    useValue: defaultEffectsErrorHandler,
                },
                EffectsRunner,
                EffectSources,
                Actions,
                rootEffects,
                {
                    provide: _ROOT_EFFECTS,
                    useValue: [rootEffects],
                },
                {
                    provide: _ROOT_EFFECTS_GUARD,
                    useFactory: _provideForRootGuard,
                    deps: [
                        [EffectsRunner, new Optional(), new SkipSelf()],
                        [_ROOT_EFFECTS, new Self()],
                    ],
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: ROOT_EFFECTS,
                    useFactory: createEffects,
                    deps: [Injector, _ROOT_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    }
}
/** @nocollapse */ /** @nocollapse */ EffectsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ /** @nocollapse */ EffectsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsModule });
/** @nocollapse */ /** @nocollapse */ EffectsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
function createEffects(injector, effectGroups, userProvidedEffectGroups) {
    const mergedEffects = [];
    for (const effectGroup of effectGroups) {
        mergedEffects.push(...effectGroup);
    }
    for (const userProvidedEffectGroup of userProvidedEffectGroups) {
        mergedEffects.push(...userProvidedEffectGroup);
    }
    return createEffectInstances(injector, mergedEffects);
}
function createEffectInstances(injector, effects) {
    return effects.map((effect) => injector.get(effect));
}
function _provideForRootGuard(runner, rootEffects) {
    // check whether any effects are actually passed
    const hasEffects = !(rootEffects.length === 1 && rootEffects[0].length === 0);
    if (hasEffects && runner) {
        throw new TypeError(`EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.`);
    }
    return 'guarded';
}

/**
 * Wraps project fn with error handling making it safe to use in Effects.
 * Takes either a config with named properties that represent different possible
 * callbacks or project/error callbacks that are required.
 */
function act(
/** Allow to take either config object or project/error functions */
configOrProject, errorFn) {
    const { project, error, complete, operator, unsubscribe } = typeof configOrProject === 'function'
        ? {
            project: configOrProject,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            error: errorFn,
            operator: concatMap,
            complete: undefined,
            unsubscribe: undefined,
        }
        : { ...configOrProject, operator: configOrProject.operator || concatMap };
    return (source) => defer(() => {
        const subject = new Subject();
        return merge(source.pipe(operator((input, index) => defer(() => {
            let completed = false;
            let errored = false;
            let projectedCount = 0;
            return project(input, index).pipe(materialize(), map((notification) => {
                switch (notification.kind) {
                    case 'E':
                        errored = true;
                        return new Notification('N', error(notification.error, input));
                    case 'C':
                        completed = true;
                        return complete
                            ? new Notification('N', complete(projectedCount, input))
                            : undefined;
                    default:
                        ++projectedCount;
                        return notification;
                }
            }), filter((n) => n != null), dematerialize(), finalize(() => {
                if (!completed && !errored && unsubscribe) {
                    subject.next(unsubscribe(projectedCount, input));
                }
            }));
        }))), subject);
    });
}

/**
 * `concatLatestFrom` combines the source value
 * and the last available value from a lazily evaluated Observable
 * in a new array
 *
 * @usageNotes
 *
 * Select the active customer from the NgRx Store
 *
 * ```ts
 * import { concatLatestFrom } from '@ngrx/effects';
 * import * fromCustomers from '../customers';
 *
 * this.actions$.pipe(
 *  concatLatestFrom(() => this.store.select(fromCustomers.selectActiveCustomer))
 * )
 * ```
 *
 * Select a customer from the NgRx Store by its id that is available on the action
 *
 * ```ts
 * import { concatLatestFrom } from '@ngrx/effects';
 * import * fromCustomers from '../customers';
 *
 * this.actions$.pipe(
 *  concatLatestFrom((action) => this.store.select(fromCustomers.selectCustomer(action.customerId)))
 * )
 * ```
 */
function concatLatestFrom(observablesFactory) {
    return pipe(concatMap((value) => {
        const observables = observablesFactory(value);
        const observablesAsArray = Array.isArray(observables)
            ? observables
            : [observables];
        return of(value).pipe(withLatestFrom(...observablesAsArray));
    }));
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Actions, EFFECTS_ERROR_HANDLER, Effect, EffectSources, EffectsFeatureModule, EffectsModule, EffectsRootModule, EffectsRunner, ROOT_EFFECTS_INIT, USER_PROVIDED_EFFECTS, act, concatLatestFrom, createEffect, defaultEffectsErrorHandler, getEffectsMetadata, mergeEffects, ofType, rootEffectsInit };
//# sourceMappingURL=ngrx-effects.mjs.map
