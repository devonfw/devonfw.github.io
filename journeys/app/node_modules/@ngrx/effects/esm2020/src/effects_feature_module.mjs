import { NgModule, Inject, Optional } from '@angular/core';
import { FEATURE_EFFECTS } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./effects_root_module";
import * as i2 from "@ngrx/store";
export class EffectsFeatureModule {
    constructor(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        effectSourceGroups.forEach((group) => group.forEach((effectSourceInstance) => root.addEffects(effectSourceInstance)));
    }
}
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule, deps: [{ token: i1.EffectsRootModule }, { token: FEATURE_EFFECTS }, { token: i2.StoreRootModule, optional: true }, { token: i2.StoreFeatureModule, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule });
/** @nocollapse */ /** @nocollapse */ EffectsFeatureModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: EffectsFeatureModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: function () { return [{ type: i1.EffectsRootModule }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [FEATURE_EFFECTS]
                }] }, { type: i2.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i2.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19mZWF0dXJlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19mZWF0dXJlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7OztBQUczQyxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLFlBQ0UsSUFBdUIsRUFDRSxrQkFBMkIsRUFDeEMsZUFBZ0MsRUFDaEMsa0JBQXNDO1FBRWxELGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ25DLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FDdEMsQ0FDRixDQUFDO0lBQ0osQ0FBQzs7dUpBWlUsb0JBQW9CLG1EQUdyQixlQUFlO3dKQUhkLG9CQUFvQjt3SkFBcEIsb0JBQW9COzJGQUFwQixvQkFBb0I7a0JBRGhDLFFBQVE7bUJBQUMsRUFBRTs7MEJBSVAsTUFBTTsyQkFBQyxlQUFlOzswQkFDdEIsUUFBUTs7MEJBQ1IsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBJbmplY3QsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdG9yZVJvb3RNb2R1bGUsIFN0b3JlRmVhdHVyZU1vZHVsZSB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IEVmZmVjdHNSb290TW9kdWxlIH0gZnJvbSAnLi9lZmZlY3RzX3Jvb3RfbW9kdWxlJztcbmltcG9ydCB7IEZFQVRVUkVfRUZGRUNUUyB9IGZyb20gJy4vdG9rZW5zJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIEVmZmVjdHNGZWF0dXJlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcm9vdDogRWZmZWN0c1Jvb3RNb2R1bGUsXG4gICAgQEluamVjdChGRUFUVVJFX0VGRkVDVFMpIGVmZmVjdFNvdXJjZUdyb3VwczogYW55W11bXSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZVJvb3RNb2R1bGU6IFN0b3JlUm9vdE1vZHVsZSxcbiAgICBAT3B0aW9uYWwoKSBzdG9yZUZlYXR1cmVNb2R1bGU6IFN0b3JlRmVhdHVyZU1vZHVsZVxuICApIHtcbiAgICBlZmZlY3RTb3VyY2VHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+XG4gICAgICBncm91cC5mb3JFYWNoKChlZmZlY3RTb3VyY2VJbnN0YW5jZSkgPT5cbiAgICAgICAgcm9vdC5hZGRFZmZlY3RzKGVmZmVjdFNvdXJjZUluc3RhbmNlKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==