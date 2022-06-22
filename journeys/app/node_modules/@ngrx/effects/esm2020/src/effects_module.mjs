import { Injector, NgModule, Optional, Self, SkipSelf, } from '@angular/core';
import { Actions } from './actions';
import { EffectSources } from './effect_sources';
import { EffectsFeatureModule } from './effects_feature_module';
import { defaultEffectsErrorHandler } from './effects_error_handler';
import { EffectsRootModule } from './effects_root_module';
import { EffectsRunner } from './effects_runner';
import { _FEATURE_EFFECTS, _ROOT_EFFECTS, _ROOT_EFFECTS_GUARD, EFFECTS_ERROR_HANDLER, FEATURE_EFFECTS, ROOT_EFFECTS, USER_PROVIDED_EFFECTS, } from './tokens';
import * as i0 from "@angular/core";
export class EffectsModule {
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
export function createEffects(injector, effectGroups, userProvidedEffectGroups) {
    const mergedEffects = [];
    for (const effectGroup of effectGroups) {
        mergedEffects.push(...effectGroup);
    }
    for (const userProvidedEffectGroup of userProvidedEffectGroups) {
        mergedEffects.push(...userProvidedEffectGroup);
    }
    return createEffectInstances(injector, mergedEffects);
}
export function createEffectInstances(injector, effects) {
    return effects.map((effect) => injector.get(effect));
}
export function _provideForRootGuard(runner, rootEffects) {
    // check whether any effects are actually passed
    const hasEffects = !(rootEffects.length === 1 && rootEffects[0].length === 0);
    if (hasEffects && runner) {
        throw new TypeError(`EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.`);
    }
    return 'guarded';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdHNfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxRQUFRLEVBRVIsUUFBUSxFQUNSLFFBQVEsRUFDUixJQUFJLEVBQ0osUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLGVBQWUsRUFDZixZQUFZLEVBQ1oscUJBQXFCLEdBQ3RCLE1BQU0sVUFBVSxDQUFDOztBQUdsQixNQUFNLE9BQU8sYUFBYTtJQUN4QixNQUFNLENBQUMsVUFBVSxDQUNmLGlCQUE4QixFQUFFO1FBRWhDLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxjQUFjO2dCQUNkO29CQUNFLE9BQU8sRUFBRSxnQkFBZ0I7b0JBQ3pCLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxjQUFjO2lCQUN6QjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUUsRUFBRTtpQkFDYjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsS0FBSyxFQUFFLElBQUk7b0JBQ1gsVUFBVSxFQUFFLGFBQWE7b0JBQ3pCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQztpQkFDMUQ7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FDWixjQUEyQixFQUFFO1FBRTdCLE9BQU87WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixRQUFRLEVBQUUsMEJBQTBCO2lCQUNyQztnQkFDRCxhQUFhO2dCQUNiLGFBQWE7Z0JBQ2IsT0FBTztnQkFDUCxXQUFXO2dCQUNYO29CQUNFLE9BQU8sRUFBRSxhQUFhO29CQUN0QixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7aUJBQ3hCO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxtQkFBbUI7b0JBQzVCLFVBQVUsRUFBRSxvQkFBb0I7b0JBQ2hDLElBQUksRUFBRTt3QkFDSixDQUFDLGFBQWEsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLENBQUM7d0JBQy9DLENBQUMsYUFBYSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7cUJBQzVCO2lCQUNGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxFQUFFO2lCQUNiO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxZQUFZO29CQUNyQixVQUFVLEVBQUUsYUFBYTtvQkFDekIsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxxQkFBcUIsQ0FBQztpQkFDdkQ7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDOztnSkFsRVUsYUFBYTtpSkFBYixhQUFhO2lKQUFiLGFBQWE7MkZBQWIsYUFBYTtrQkFEekIsUUFBUTttQkFBQyxFQUFFOztBQXNFWixNQUFNLFVBQVUsYUFBYSxDQUMzQixRQUFrQixFQUNsQixZQUEyQixFQUMzQix3QkFBdUM7SUFFdkMsTUFBTSxhQUFhLEdBQWdCLEVBQUUsQ0FBQztJQUV0QyxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtRQUN0QyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7S0FDcEM7SUFFRCxLQUFLLE1BQU0sdUJBQXVCLElBQUksd0JBQXdCLEVBQUU7UUFDOUQsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLHVCQUF1QixDQUFDLENBQUM7S0FDaEQ7SUFFRCxPQUFPLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsTUFBTSxVQUFVLHFCQUFxQixDQUNuQyxRQUFrQixFQUNsQixPQUFvQjtJQUVwQixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUNsQyxNQUFxQixFQUNyQixXQUFvQjtJQUVwQixnREFBZ0Q7SUFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDOUUsSUFBSSxVQUFVLElBQUksTUFBTSxFQUFFO1FBQ3hCLE1BQU0sSUFBSSxTQUFTLENBQ2pCLHNHQUFzRyxDQUN2RyxDQUFDO0tBQ0g7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSW5qZWN0b3IsXG4gIE1vZHVsZVdpdGhQcm92aWRlcnMsXG4gIE5nTW9kdWxlLFxuICBPcHRpb25hbCxcbiAgU2VsZixcbiAgU2tpcFNlbGYsXG4gIFR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aW9ucyB9IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQgeyBFZmZlY3RTb3VyY2VzIH0gZnJvbSAnLi9lZmZlY3Rfc291cmNlcyc7XG5pbXBvcnQgeyBFZmZlY3RzRmVhdHVyZU1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19mZWF0dXJlX21vZHVsZSc7XG5pbXBvcnQgeyBkZWZhdWx0RWZmZWN0c0Vycm9ySGFuZGxlciB9IGZyb20gJy4vZWZmZWN0c19lcnJvcl9oYW5kbGVyJztcbmltcG9ydCB7IEVmZmVjdHNSb290TW9kdWxlIH0gZnJvbSAnLi9lZmZlY3RzX3Jvb3RfbW9kdWxlJztcbmltcG9ydCB7IEVmZmVjdHNSdW5uZXIgfSBmcm9tICcuL2VmZmVjdHNfcnVubmVyJztcbmltcG9ydCB7XG4gIF9GRUFUVVJFX0VGRkVDVFMsXG4gIF9ST09UX0VGRkVDVFMsXG4gIF9ST09UX0VGRkVDVFNfR1VBUkQsXG4gIEVGRkVDVFNfRVJST1JfSEFORExFUixcbiAgRkVBVFVSRV9FRkZFQ1RTLFxuICBST09UX0VGRkVDVFMsXG4gIFVTRVJfUFJPVklERURfRUZGRUNUUyxcbn0gZnJvbSAnLi90b2tlbnMnO1xuXG5ATmdNb2R1bGUoe30pXG5leHBvcnQgY2xhc3MgRWZmZWN0c01vZHVsZSB7XG4gIHN0YXRpYyBmb3JGZWF0dXJlKFxuICAgIGZlYXR1cmVFZmZlY3RzOiBUeXBlPGFueT5bXSA9IFtdXG4gICk6IE1vZHVsZVdpdGhQcm92aWRlcnM8RWZmZWN0c0ZlYXR1cmVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEVmZmVjdHNGZWF0dXJlTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIGZlYXR1cmVFZmZlY3RzLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogX0ZFQVRVUkVfRUZGRUNUUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICB1c2VWYWx1ZTogZmVhdHVyZUVmZmVjdHMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBVU0VSX1BST1ZJREVEX0VGRkVDVFMsXG4gICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgdXNlVmFsdWU6IFtdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogRkVBVFVSRV9FRkZFQ1RTLFxuICAgICAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZUVmZmVjdHMsXG4gICAgICAgICAgZGVwczogW0luamVjdG9yLCBfRkVBVFVSRV9FRkZFQ1RTLCBVU0VSX1BST1ZJREVEX0VGRkVDVFNdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZvclJvb3QoXG4gICAgcm9vdEVmZmVjdHM6IFR5cGU8YW55PltdID0gW11cbiAgKTogTW9kdWxlV2l0aFByb3ZpZGVyczxFZmZlY3RzUm9vdE1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogRWZmZWN0c1Jvb3RNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEVGRkVDVFNfRVJST1JfSEFORExFUixcbiAgICAgICAgICB1c2VWYWx1ZTogZGVmYXVsdEVmZmVjdHNFcnJvckhhbmRsZXIsXG4gICAgICAgIH0sXG4gICAgICAgIEVmZmVjdHNSdW5uZXIsXG4gICAgICAgIEVmZmVjdFNvdXJjZXMsXG4gICAgICAgIEFjdGlvbnMsXG4gICAgICAgIHJvb3RFZmZlY3RzLFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogX1JPT1RfRUZGRUNUUyxcbiAgICAgICAgICB1c2VWYWx1ZTogW3Jvb3RFZmZlY3RzXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IF9ST09UX0VGRkVDVFNfR1VBUkQsXG4gICAgICAgICAgdXNlRmFjdG9yeTogX3Byb3ZpZGVGb3JSb290R3VhcmQsXG4gICAgICAgICAgZGVwczogW1xuICAgICAgICAgICAgW0VmZmVjdHNSdW5uZXIsIG5ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKV0sXG4gICAgICAgICAgICBbX1JPT1RfRUZGRUNUUywgbmV3IFNlbGYoKV0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFVTRVJfUFJPVklERURfRUZGRUNUUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICB1c2VWYWx1ZTogW10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBST09UX0VGRkVDVFMsXG4gICAgICAgICAgdXNlRmFjdG9yeTogY3JlYXRlRWZmZWN0cyxcbiAgICAgICAgICBkZXBzOiBbSW5qZWN0b3IsIF9ST09UX0VGRkVDVFMsIFVTRVJfUFJPVklERURfRUZGRUNUU10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdHMoXG4gIGluamVjdG9yOiBJbmplY3RvcixcbiAgZWZmZWN0R3JvdXBzOiBUeXBlPGFueT5bXVtdLFxuICB1c2VyUHJvdmlkZWRFZmZlY3RHcm91cHM6IFR5cGU8YW55PltdW11cbik6IGFueVtdIHtcbiAgY29uc3QgbWVyZ2VkRWZmZWN0czogVHlwZTxhbnk+W10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGVmZmVjdEdyb3VwIG9mIGVmZmVjdEdyb3Vwcykge1xuICAgIG1lcmdlZEVmZmVjdHMucHVzaCguLi5lZmZlY3RHcm91cCk7XG4gIH1cblxuICBmb3IgKGNvbnN0IHVzZXJQcm92aWRlZEVmZmVjdEdyb3VwIG9mIHVzZXJQcm92aWRlZEVmZmVjdEdyb3Vwcykge1xuICAgIG1lcmdlZEVmZmVjdHMucHVzaCguLi51c2VyUHJvdmlkZWRFZmZlY3RHcm91cCk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRWZmZWN0SW5zdGFuY2VzKGluamVjdG9yLCBtZXJnZWRFZmZlY3RzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdEluc3RhbmNlcyhcbiAgaW5qZWN0b3I6IEluamVjdG9yLFxuICBlZmZlY3RzOiBUeXBlPGFueT5bXVxuKTogYW55W10ge1xuICByZXR1cm4gZWZmZWN0cy5tYXAoKGVmZmVjdCkgPT4gaW5qZWN0b3IuZ2V0KGVmZmVjdCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX3Byb3ZpZGVGb3JSb290R3VhcmQoXG4gIHJ1bm5lcjogRWZmZWN0c1J1bm5lcixcbiAgcm9vdEVmZmVjdHM6IGFueVtdW11cbik6IGFueSB7XG4gIC8vIGNoZWNrIHdoZXRoZXIgYW55IGVmZmVjdHMgYXJlIGFjdHVhbGx5IHBhc3NlZFxuICBjb25zdCBoYXNFZmZlY3RzID0gIShyb290RWZmZWN0cy5sZW5ndGggPT09IDEgJiYgcm9vdEVmZmVjdHNbMF0ubGVuZ3RoID09PSAwKTtcbiAgaWYgKGhhc0VmZmVjdHMgJiYgcnVubmVyKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIGBFZmZlY3RzTW9kdWxlLmZvclJvb3QoKSBjYWxsZWQgdHdpY2UuIEZlYXR1cmUgbW9kdWxlcyBzaG91bGQgdXNlIEVmZmVjdHNNb2R1bGUuZm9yRmVhdHVyZSgpIGluc3RlYWQuYFxuICAgICk7XG4gIH1cbiAgcmV0dXJuICdndWFyZGVkJztcbn1cbiJdfQ==