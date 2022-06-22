import { NgModule, Inject, Optional } from '@angular/core';
import { createAction, } from '@ngrx/store';
import { ROOT_EFFECTS, _ROOT_EFFECTS_GUARD } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./effect_sources";
import * as i2 from "./effects_runner";
import * as i3 from "@ngrx/store";
export const ROOT_EFFECTS_INIT = '@ngrx/effects/init';
export const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);
export class EffectsRootModule {
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
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule, deps: [{ token: i1.EffectSources }, { token: i2.EffectsRunner }, { token: i3.Store }, { token: ROOT_EFFECTS }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }, { token: _ROOT_EFFECTS_GUARD, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule });
/** @nocollapse */ /** @nocollapse */ EffectsRootModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsRootModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: function () { return [{ type: i1.EffectSources }, { type: i2.EffectsRunner }, { type: i3.Store }, { type: undefined, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yb290X21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yb290X21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0QsT0FBTyxFQUNMLFlBQVksR0FLYixNQUFNLGFBQWEsQ0FBQztBQUdyQixPQUFPLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDOzs7OztBQUU3RCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQztBQUN0RCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHL0QsTUFBTSxPQUFPLGlCQUFpQjtJQUM1QixZQUNVLE9BQXNCLEVBQzlCLE1BQXFCLEVBQ3JCLEtBQWlCLEVBQ0ssV0FBa0IsRUFDNUIsZUFBZ0MsRUFDaEMsa0JBQXNDLEVBR2xELEtBQVU7UUFSRixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBVTlCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVmLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQzNDLE9BQU8sQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FDekMsQ0FBQztRQUVGLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxVQUFVLENBQUMsb0JBQXlCO1FBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDaEQsQ0FBQzs7b0pBdkJVLGlCQUFpQixpR0FLbEIsWUFBWSw4R0FJWixtQkFBbUI7cUpBVGxCLGlCQUFpQjtxSkFBakIsaUJBQWlCOzJGQUFqQixpQkFBaUI7a0JBRDdCLFFBQVE7bUJBQUMsRUFBRTs7MEJBTVAsTUFBTTsyQkFBQyxZQUFZOzswQkFDbkIsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgSW5qZWN0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgY3JlYXRlQWN0aW9uLFxuICBTdG9yZU1vZHVsZSxcbiAgU3RvcmUsXG4gIFN0b3JlUm9vdE1vZHVsZSxcbiAgU3RvcmVGZWF0dXJlTW9kdWxlLFxufSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBFZmZlY3RzUnVubmVyIH0gZnJvbSAnLi9lZmZlY3RzX3J1bm5lcic7XG5pbXBvcnQgeyBFZmZlY3RTb3VyY2VzIH0gZnJvbSAnLi9lZmZlY3Rfc291cmNlcyc7XG5pbXBvcnQgeyBST09UX0VGRkVDVFMsIF9ST09UX0VGRkVDVFNfR1VBUkQgfSBmcm9tICcuL3Rva2Vucyc7XG5cbmV4cG9ydCBjb25zdCBST09UX0VGRkVDVFNfSU5JVCA9ICdAbmdyeC9lZmZlY3RzL2luaXQnO1xuZXhwb3J0IGNvbnN0IHJvb3RFZmZlY3RzSW5pdCA9IGNyZWF0ZUFjdGlvbihST09UX0VGRkVDVFNfSU5JVCk7XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBFZmZlY3RzUm9vdE1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgc291cmNlczogRWZmZWN0U291cmNlcyxcbiAgICBydW5uZXI6IEVmZmVjdHNSdW5uZXIsXG4gICAgc3RvcmU6IFN0b3JlPGFueT4sXG4gICAgQEluamVjdChST09UX0VGRkVDVFMpIHJvb3RFZmZlY3RzOiBhbnlbXSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZVJvb3RNb2R1bGU6IFN0b3JlUm9vdE1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZUZlYXR1cmVNb2R1bGU6IFN0b3JlRmVhdHVyZU1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoX1JPT1RfRUZGRUNUU19HVUFSRClcbiAgICBndWFyZDogYW55XG4gICkge1xuICAgIHJ1bm5lci5zdGFydCgpO1xuXG4gICAgcm9vdEVmZmVjdHMuZm9yRWFjaCgoZWZmZWN0U291cmNlSW5zdGFuY2UpID0+XG4gICAgICBzb3VyY2VzLmFkZEVmZmVjdHMoZWZmZWN0U291cmNlSW5zdGFuY2UpXG4gICAgKTtcblxuICAgIHN0b3JlLmRpc3BhdGNoKHsgdHlwZTogUk9PVF9FRkZFQ1RTX0lOSVQgfSk7XG4gIH1cblxuICBhZGRFZmZlY3RzKGVmZmVjdFNvdXJjZUluc3RhbmNlOiBhbnkpIHtcbiAgICB0aGlzLnNvdXJjZXMuYWRkRWZmZWN0cyhlZmZlY3RTb3VyY2VJbnN0YW5jZSk7XG4gIH1cbn1cbiJdfQ==