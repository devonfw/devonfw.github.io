import { Observable } from 'rxjs';
import { Action, ActionCreator } from '@ngrx/store';
import { EffectMetadata, EffectConfig, CreateEffectMetadata } from './models';
declare type DispatchType<T> = T extends {
    dispatch: infer U;
} ? U : true;
declare type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;
declare type EffectResult<OT> = Observable<OT> | ((...args: any[]) => Observable<OT>);
declare type ConditionallyDisallowActionCreator<DT, Result> = DT extends false ? unknown : Result extends EffectResult<infer OT> ? OT extends ActionCreator ? 'ActionCreator cannot be dispatched. Did you forget to call the action creator function?' : unknown : unknown;
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
export declare function createEffect<C extends EffectConfig, DT extends DispatchType<C>, OT extends ObservableType<DT, OT>, R extends EffectResult<OT>>(source: () => R & ConditionallyDisallowActionCreator<DT, R>, config?: Partial<C>): R & CreateEffectMetadata;
export declare function getCreateEffectMetadata<T extends {
    [props in keyof T]: Object;
}>(instance: T): EffectMetadata<T>[];
export {};
