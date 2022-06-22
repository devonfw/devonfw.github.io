import { Inject, Injectable } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { dematerialize, exhaustMap, filter, groupBy, map, mergeMap, take, } from 'rxjs/operators';
import { reportInvalidActions, } from './effect_notification';
import { mergeEffects } from './effects_resolver';
import { isOnIdentifyEffects, isOnRunEffects, isOnInitEffects, } from './lifecycle_hooks';
import { EFFECTS_ERROR_HANDLER } from './tokens';
import { getSourceForInstance } from './utils';
import * as i0 from "@angular/core";
export class EffectSources extends Subject {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X3NvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9zb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBZ0IsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQTRCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDaEUsT0FBTyxFQUNMLGFBQWEsRUFDYixVQUFVLEVBQ1YsTUFBTSxFQUNOLE9BQU8sRUFDUCxHQUFHLEVBQ0gsUUFBUSxFQUNSLElBQUksR0FDTCxNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFDTCxvQkFBb0IsR0FFckIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUtMLG1CQUFtQixFQUNuQixjQUFjLEVBQ2QsZUFBZSxHQUNoQixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNqRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7O0FBRy9DLE1BQU0sT0FBTyxhQUFjLFNBQVEsT0FBWTtJQUM3QyxZQUNVLFlBQTBCLEVBRTFCLG1CQUF3QztRQUVoRCxLQUFLLEVBQUUsQ0FBQztRQUpBLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRTFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7SUFHbEQsQ0FBQztJQUVELFVBQVUsQ0FBQyxvQkFBeUI7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQ2QsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQzdCLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ25CLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsRUFDRixRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNuQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUMxQixVQUFVLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDNUIsT0FBTyxtQkFBbUIsQ0FDeEIsSUFBSSxDQUFDLFlBQVksRUFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUN6QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxFQUNGLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNiLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2hELE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQztZQUM3QixDQUFDLENBQUMsRUFDRixNQUFNLENBQ0osQ0FDRSxZQUFZLEVBSVosRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUM3RCxFQUNELGFBQWEsRUFBRSxDQUNoQixDQUFDO1lBRUYsdUNBQXVDO1lBQ3ZDLDZDQUE2QztZQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUN4QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUN2QixHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQ2hELENBQUM7WUFFRixPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7O2dKQXhEVSxhQUFhLDhDQUdkLHFCQUFxQjtvSkFIcEIsYUFBYTsyRkFBYixhQUFhO2tCQUR6QixVQUFVOzswQkFJTixNQUFNOzJCQUFDLHFCQUFxQjs7QUF3RGpDLFNBQVMsZUFBZSxDQUFDLGNBQW1CO0lBQzFDLElBQUksbUJBQW1CLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDdkMsT0FBTyxjQUFjLENBQUMscUJBQXFCLEVBQUUsQ0FBQztLQUMvQztJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQzFCLFlBQTBCLEVBQzFCLG1CQUF3QztJQUV4QyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDeEIsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUNqQyxjQUFjLEVBQ2QsWUFBWSxFQUNaLG1CQUFtQixDQUNwQixDQUFDO1FBRUYsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDeEQ7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXJyb3JIYW5kbGVyLCBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvbiwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgbWVyZ2UgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGRlbWF0ZXJpYWxpemUsXG4gIGV4aGF1c3RNYXAsXG4gIGZpbHRlcixcbiAgZ3JvdXBCeSxcbiAgbWFwLFxuICBtZXJnZU1hcCxcbiAgdGFrZSxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1xuICByZXBvcnRJbnZhbGlkQWN0aW9ucyxcbiAgRWZmZWN0Tm90aWZpY2F0aW9uLFxufSBmcm9tICcuL2VmZmVjdF9ub3RpZmljYXRpb24nO1xuaW1wb3J0IHsgRWZmZWN0c0Vycm9ySGFuZGxlciB9IGZyb20gJy4vZWZmZWN0c19lcnJvcl9oYW5kbGVyJztcbmltcG9ydCB7IG1lcmdlRWZmZWN0cyB9IGZyb20gJy4vZWZmZWN0c19yZXNvbHZlcic7XG5pbXBvcnQge1xuICBvbklkZW50aWZ5RWZmZWN0c0tleSxcbiAgb25SdW5FZmZlY3RzS2V5LFxuICBPblJ1bkVmZmVjdHMsXG4gIG9uSW5pdEVmZmVjdHMsXG4gIGlzT25JZGVudGlmeUVmZmVjdHMsXG4gIGlzT25SdW5FZmZlY3RzLFxuICBpc09uSW5pdEVmZmVjdHMsXG59IGZyb20gJy4vbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7IEVGRkVDVFNfRVJST1JfSEFORExFUiB9IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7IGdldFNvdXJjZUZvckluc3RhbmNlIH0gZnJvbSAnLi91dGlscyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZmZlY3RTb3VyY2VzIGV4dGVuZHMgU3ViamVjdDxhbnk+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgICBASW5qZWN0KEVGRkVDVFNfRVJST1JfSEFORExFUilcbiAgICBwcml2YXRlIGVmZmVjdHNFcnJvckhhbmRsZXI6IEVmZmVjdHNFcnJvckhhbmRsZXJcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGFkZEVmZmVjdHMoZWZmZWN0U291cmNlSW5zdGFuY2U6IGFueSk6IHZvaWQge1xuICAgIHRoaXMubmV4dChlZmZlY3RTb3VyY2VJbnN0YW5jZSk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICB0b0FjdGlvbnMoKTogT2JzZXJ2YWJsZTxBY3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5waXBlKFxuICAgICAgZ3JvdXBCeShnZXRTb3VyY2VGb3JJbnN0YW5jZSksXG4gICAgICBtZXJnZU1hcCgoc291cmNlJCkgPT4ge1xuICAgICAgICByZXR1cm4gc291cmNlJC5waXBlKGdyb3VwQnkoZWZmZWN0c0luc3RhbmNlKSk7XG4gICAgICB9KSxcbiAgICAgIG1lcmdlTWFwKChzb3VyY2UkKSA9PiB7XG4gICAgICAgIGNvbnN0IGVmZmVjdCQgPSBzb3VyY2UkLnBpcGUoXG4gICAgICAgICAgZXhoYXVzdE1hcCgoc291cmNlSW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlRWZmZWN0U291cmNlKFxuICAgICAgICAgICAgICB0aGlzLmVycm9ySGFuZGxlcixcbiAgICAgICAgICAgICAgdGhpcy5lZmZlY3RzRXJyb3JIYW5kbGVyXG4gICAgICAgICAgICApKHNvdXJjZUluc3RhbmNlKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBtYXAoKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgcmVwb3J0SW52YWxpZEFjdGlvbnMob3V0cHV0LCB0aGlzLmVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0Lm5vdGlmaWNhdGlvbjtcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBmaWx0ZXIoXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgKTogbm90aWZpY2F0aW9uIGlzIE5vdGlmaWNhdGlvbjxBY3Rpb24+ICYge1xuICAgICAgICAgICAgICBraW5kOiAnTic7XG4gICAgICAgICAgICAgIHZhbHVlOiBBY3Rpb247XG4gICAgICAgICAgICB9ID0+IG5vdGlmaWNhdGlvbi5raW5kID09PSAnTicgJiYgbm90aWZpY2F0aW9uLnZhbHVlICE9IG51bGxcbiAgICAgICAgICApLFxuICAgICAgICAgIGRlbWF0ZXJpYWxpemUoKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBzdHJlYW0gd2l0aCBhbiBJTklUIGFjdGlvblxuICAgICAgICAvLyBkbyB0aGlzIG9ubHkgZm9yIHRoZSBmaXJzdCBFZmZlY3QgaW5zdGFuY2VcbiAgICAgICAgY29uc3QgaW5pdCQgPSBzb3VyY2UkLnBpcGUoXG4gICAgICAgICAgdGFrZSgxKSxcbiAgICAgICAgICBmaWx0ZXIoaXNPbkluaXRFZmZlY3RzKSxcbiAgICAgICAgICBtYXAoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5uZ3J4T25Jbml0RWZmZWN0cygpKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBtZXJnZShlZmZlY3QkLCBpbml0JCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZWZmZWN0c0luc3RhbmNlKHNvdXJjZUluc3RhbmNlOiBhbnkpIHtcbiAgaWYgKGlzT25JZGVudGlmeUVmZmVjdHMoc291cmNlSW5zdGFuY2UpKSB7XG4gICAgcmV0dXJuIHNvdXJjZUluc3RhbmNlLm5ncnhPbklkZW50aWZ5RWZmZWN0cygpO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRWZmZWN0U291cmNlKFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgZWZmZWN0c0Vycm9ySGFuZGxlcjogRWZmZWN0c0Vycm9ySGFuZGxlclxuKTogKHNvdXJjZUluc3RhbmNlOiBhbnkpID0+IE9ic2VydmFibGU8RWZmZWN0Tm90aWZpY2F0aW9uPiB7XG4gIHJldHVybiAoc291cmNlSW5zdGFuY2UpID0+IHtcbiAgICBjb25zdCBtZXJnZWRFZmZlY3RzJCA9IG1lcmdlRWZmZWN0cyhcbiAgICAgIHNvdXJjZUluc3RhbmNlLFxuICAgICAgZXJyb3JIYW5kbGVyLFxuICAgICAgZWZmZWN0c0Vycm9ySGFuZGxlclxuICAgICk7XG5cbiAgICBpZiAoaXNPblJ1bkVmZmVjdHMoc291cmNlSW5zdGFuY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlSW5zdGFuY2UubmdyeE9uUnVuRWZmZWN0cyhtZXJnZWRFZmZlY3RzJCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZEVmZmVjdHMkO1xuICB9O1xufVxuIl19