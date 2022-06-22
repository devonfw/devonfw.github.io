import { Store, StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { EffectsRunner } from './effects_runner';
import { EffectSources } from './effect_sources';
import * as i0 from "@angular/core";
export declare const ROOT_EFFECTS_INIT = "@ngrx/effects/init";
export declare const rootEffectsInit: import("@ngrx/store").ActionCreator<"@ngrx/effects/init", () => import("@ngrx/store/src/models").TypedAction<"@ngrx/effects/init">>;
export declare class EffectsRootModule {
    private sources;
    constructor(sources: EffectSources, runner: EffectsRunner, store: Store<any>, rootEffects: any[], storeRootModule: StoreRootModule, storeFeatureModule: StoreFeatureModule, guard: any);
    addEffects(effectSourceInstance: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EffectsRootModule, [null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<EffectsRootModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<EffectsRootModule>;
}
