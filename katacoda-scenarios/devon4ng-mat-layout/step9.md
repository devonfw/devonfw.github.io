Let us set up the routing such that when you visit the root url you see the `HomeComponent` and when you visit `/data` url you see the `DataComponent`. You had opted for routing while creating the application, so you have the routing module `app-routing.module.ts` setup for us. In this file, you have the empty routes array where you set up your routes:


Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app-routing.module.ts'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/app/app-routing.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/app-routing.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;
import { HomeComponent } from &#39;./pages/home/home.component&#39;;
import { DataComponent } from &#39;./pages/data/data.component&#39;;

const routes: Routes = [
  { path: &#39;&#39;, component: HomeComponent },
  { path: &#39;data&#39;, component: DataComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
</pre>

