import { Injector, ModuleWithProviders, Type } from '@angular/core';
import { EffectsFeatureModule } from './effects_feature_module';
import { EffectsRootModule } from './effects_root_module';
import { EffectsRunner } from './effects_runner';
import * as i0 from "@angular/core";
export declare class EffectsModule {
    static forFeature(featureEffects?: Type<any>[]): ModuleWithProviders<EffectsFeatureModule>;
    static forRoot(rootEffects?: Type<any>[]): ModuleWithProviders<EffectsRootModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<EffectsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<EffectsModule>;
}
export declare function createEffects(injector: Injector, effectGroups: Type<any>[][], userProvidedEffectGroups: Type<any>[][]): any[];
export declare function createEffectInstances(injector: Injector, effects: Type<any>[]): any[];
export declare function _provideForRootGuard(runner: EffectsRunner, rootEffects: any[][]): any;
