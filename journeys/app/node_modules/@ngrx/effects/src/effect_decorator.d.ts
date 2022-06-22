import { EffectConfig, EffectMetadata } from './models';
/**
 * @deprecated The Effect decorator (`@Effect`) is deprecated in favor for the `createEffect` method.
 * See the docs for more info {@link https://ngrx.io/guide/migration/v11#the-effect-decorator}
 */
export declare function Effect(config?: EffectConfig): <T extends Object, K extends Exclude<keyof T, keyof Object>>(target: T, propertyName: K) => void;
export declare function getEffectDecoratorMetadata<T>(instance: T): EffectMetadata<T>[];
