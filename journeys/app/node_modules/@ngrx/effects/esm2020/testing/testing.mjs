import { Actions } from '@ngrx/effects';
import { defer } from 'rxjs';
/**
 * @description
 * Creates mock actions provider.
 *
 * @param factoryOrSource Actions' source or source creation function
 *
 * @usageNotes
 *
 * **With `TestBed.configureTestingModule`**
 *
 * ```ts
 * describe('Books Effects', () => {
 *   let actions$: Observable<any>;
 *   let effects: BooksEffects;
 *
 *   beforeEach(() => {
 *     TestBed.configureTestingModule({
 *       providers: [
 *         provideMockActions(() => actions$),
 *         BooksEffects,
 *       ],
 *     });
 *
 *     actions$ = TestBed.inject(Actions);
 *     effects = TestBed.inject(BooksEffects);
 *   });
 * });
 * ```
 *
 * **With `Injector.create`**
 *
 * ```ts
 * describe('Counter Effects', () => {
 *   let injector: Injector;
 *   let actions$: Observable<any>;
 *   let effects: CounterEffects;
 *
 *   beforeEach(() => {
 *     injector = Injector.create({
 *       providers: [
 *         provideMockActions(() => actions$),
 *         CounterEffects,
 *       ],
 *     });
 *
 *     actions$ = injector.get(Actions);
 *     effects = injector.get(CounterEffects);
 *   });
 * });
 * ```
 */
export function provideMockActions(factoryOrSource) {
    return {
        provide: Actions,
        useFactory: () => {
            if (typeof factoryOrSource === 'function') {
                return new Actions(defer(factoryOrSource));
            }
            return new Actions(factoryOrSource);
        },
        deps: [],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy90ZXN0aW5nL3NyYy90ZXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLEtBQUssRUFBYyxNQUFNLE1BQU0sQ0FBQztBQU16Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrREc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLGVBQTBEO0lBRTFELE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTztRQUNoQixVQUFVLEVBQUUsR0FBb0IsRUFBRTtZQUNoQyxJQUFJLE9BQU8sZUFBZSxLQUFLLFVBQVUsRUFBRTtnQkFDekMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzthQUM1QztZQUVELE9BQU8sSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELElBQUksRUFBRSxFQUFFO0tBQ1QsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGYWN0b3J5UHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbnMgfSBmcm9tICdAbmdyeC9lZmZlY3RzJztcbmltcG9ydCB7IGRlZmVyLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTW9ja0FjdGlvbnMoc291cmNlOiBPYnNlcnZhYmxlPGFueT4pOiBGYWN0b3J5UHJvdmlkZXI7XG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU1vY2tBY3Rpb25zKFxuICBmYWN0b3J5OiAoKSA9PiBPYnNlcnZhYmxlPGFueT5cbik6IEZhY3RvcnlQcm92aWRlcjtcbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDcmVhdGVzIG1vY2sgYWN0aW9ucyBwcm92aWRlci5cbiAqXG4gKiBAcGFyYW0gZmFjdG9yeU9yU291cmNlIEFjdGlvbnMnIHNvdXJjZSBvciBzb3VyY2UgY3JlYXRpb24gZnVuY3Rpb25cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICoqV2l0aCBgVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlYCoqXG4gKlxuICogYGBgdHNcbiAqIGRlc2NyaWJlKCdCb29rcyBFZmZlY3RzJywgKCkgPT4ge1xuICogICBsZXQgYWN0aW9ucyQ6IE9ic2VydmFibGU8YW55PjtcbiAqICAgbGV0IGVmZmVjdHM6IEJvb2tzRWZmZWN0cztcbiAqXG4gKiAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICogICAgIFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZSh7XG4gKiAgICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgICAgcHJvdmlkZU1vY2tBY3Rpb25zKCgpID0+IGFjdGlvbnMkKSxcbiAqICAgICAgICAgQm9va3NFZmZlY3RzLFxuICogICAgICAgXSxcbiAqICAgICB9KTtcbiAqXG4gKiAgICAgYWN0aW9ucyQgPSBUZXN0QmVkLmluamVjdChBY3Rpb25zKTtcbiAqICAgICBlZmZlY3RzID0gVGVzdEJlZC5pbmplY3QoQm9va3NFZmZlY3RzKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqICoqV2l0aCBgSW5qZWN0b3IuY3JlYXRlYCoqXG4gKlxuICogYGBgdHNcbiAqIGRlc2NyaWJlKCdDb3VudGVyIEVmZmVjdHMnLCAoKSA9PiB7XG4gKiAgIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XG4gKiAgIGxldCBhY3Rpb25zJDogT2JzZXJ2YWJsZTxhbnk+O1xuICogICBsZXQgZWZmZWN0czogQ291bnRlckVmZmVjdHM7XG4gKlxuICogICBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgICBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gKiAgICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgICAgcHJvdmlkZU1vY2tBY3Rpb25zKCgpID0+IGFjdGlvbnMkKSxcbiAqICAgICAgICAgQ291bnRlckVmZmVjdHMsXG4gKiAgICAgICBdLFxuICogICAgIH0pO1xuICpcbiAqICAgICBhY3Rpb25zJCA9IGluamVjdG9yLmdldChBY3Rpb25zKTtcbiAqICAgICBlZmZlY3RzID0gaW5qZWN0b3IuZ2V0KENvdW50ZXJFZmZlY3RzKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU1vY2tBY3Rpb25zKFxuICBmYWN0b3J5T3JTb3VyY2U6ICgoKSA9PiBPYnNlcnZhYmxlPGFueT4pIHwgT2JzZXJ2YWJsZTxhbnk+XG4pOiBGYWN0b3J5UHJvdmlkZXIge1xuICByZXR1cm4ge1xuICAgIHByb3ZpZGU6IEFjdGlvbnMsXG4gICAgdXNlRmFjdG9yeTogKCk6IE9ic2VydmFibGU8YW55PiA9PiB7XG4gICAgICBpZiAodHlwZW9mIGZhY3RvcnlPclNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbnMoZGVmZXIoZmFjdG9yeU9yU291cmNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgQWN0aW9ucyhmYWN0b3J5T3JTb3VyY2UpO1xuICAgIH0sXG4gICAgZGVwczogW10sXG4gIH07XG59XG4iXX0=