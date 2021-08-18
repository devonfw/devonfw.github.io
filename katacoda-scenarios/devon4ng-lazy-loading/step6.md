Now when you check the terminal running the app, you could see the lazy loaded modules getting generated along with the main bundle. Also, if you check the Network tab in the developer tools, you could see the (lazy) modules getting loaded when needed. Since, `FirstModule` is the first path we visit, it is getting loaded at first only.
![compile-first-lazy](./assets/compile-first-lazy.png)
![first-lvl-lazy](./assets/first-lvl-lazy.png)

Now, lets make the SecondLeftModule load lazily. For this, you need to change `component` to `loadChildren` and refer `SecondLeftModule` in the file `first-routing.module.ts`. Next, you need to remove `SecondLeftModule` from the `imports` array of `first.module.ts`. After that you need to route the `ContentComponent` within the `second-left-routing.module.ts`.


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
    loadChildren: () =&gt; import(&#39;./second-left/second-left.module&#39;).then(m =&gt; m.SecondLeftModule),
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



Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/first/first.module.ts'.

`devonfw/workspaces/main/level-app/src/app/first/first.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { CommonModule } from &#39;@angular/common&#39;;

import { FirstRoutingModule } from &#39;./first-routing.module&#39;;
import { FirstComponent } from &#39;./first/first.component&#39;;

import { SecondRightModule } from &#39;./second-right/second-right.module&#39;;

@NgModule({
  declarations: [FirstComponent],
  imports: [
    CommonModule,
    FirstRoutingModule,
    SecondRightModule,
  ]
})
export class FirstModule { }
</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/first/second-left/second-left-routing.module.ts'.

`devonfw/workspaces/main/level-app/src/app/first/second-left/second-left-routing.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/second-left-routing.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;
import { ContentComponent } from &#39;./content/content.component&#39;;

const routes: Routes = [
  {
    path: &#39;&#39;,
    component: ContentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecondLeftRoutingModule { }
</pre>

If you now check the terminal, you could also see `second-left-second-left-module` along with the `first-first-module` and the `main` bundle getting generated. 
![second-lvl-lazy](./assets/second-lvl-lazy.png)

Also, in the Network tab of the developer tools, you could see the `second-left-second-left-module.js` is only loading when we click on the [Go to left module] button
![second-lvl-left-lazy](./assets/second-lvl-left-lazy.png)
