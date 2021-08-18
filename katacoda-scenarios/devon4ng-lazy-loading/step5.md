If you run the project at this point you can see in the terminal that just the main file is built.
![compile-eager](./assets/compile-eager.png)

Go to port 4200 and check the Network tab in the Developer Tools. We can see a document named &#34;first&#34; is loaded. If you click on [Go to right module] a second level module opens, but there is no &#39;second-right&#39; document.
![second-lvl-right-eager](./assets/second-lvl-right-eager.png)

Now we will modify the app to lazily load the modules. Modifying an angular application to load its modules lazily is easy, you have to change the routing configuration of the desired module (for example `FirstModule`). Instead of loading a component, you dynamically import it in a `loadChildren` attribute because modules acts as gates to access components &#34;inside&#34; them. Updating this app to load lazily has four consecuences: no component attribute, no import of `FirstComponent`, `FirstModule` import has to be removed from the imports array at `app.module.ts`, and change of context.

Also, in `first-routing.module.ts` you can change the path for the `ContentComponent`s from `first/second-left` and `first/second-right` to simply `second-left` and `second-right` respectively,  because it aquires the context set by AppRoutingModule.


Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/app-routing.module.ts'.

`devonfw/workspaces/main/level-app/src/app/app-routing.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/app-routing.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;

const routes: Routes = [
  {
    path: &#39;first&#39;,
    loadChildren: () =&gt; import(&#39;./first/first.module&#39;).then(m =&gt; m.FirstModule),
  },
  {
    path: &#39;&#39;,
    redirectTo: &#39;first&#39;,
    pathMatch: &#39;full&#39;,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/app.module.ts'.

`devonfw/workspaces/main/level-app/src/app/app.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/app.module.ts" data-target="replace" data-marker="">
import { BrowserModule } from &#39;@angular/platform-browser&#39;;
import { NgModule } from &#39;@angular/core&#39;;

import { AppRoutingModule } from &#39;./app-routing.module&#39;;
import { AppComponent } from &#39;./app.component&#39;;

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/first/first-routing.module.ts'.

`devonfw/workspaces/main/level-app/src/app/first/first-routing.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first-routing.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;
import { ContentComponent as ContentLeft} from &#39;./second-left/content/content.component&#39;;
import { ContentComponent as ContentRight} from &#39;./second-right/content/content.component&#39;;
import { FirstComponent } from &#39;./first/first.component&#39;;

const routes: Routes = [
  {
    path: &#39;&#39;,
    component: FirstComponent
  },
  {
    path: &#39;second-left&#39;,
    component: ContentLeft
  },
  {
    path: &#39;second-right&#39;,
    component: ContentRight
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FirstRoutingModule { }
</pre>

