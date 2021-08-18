To move between the components you will now configure the routes. You can refer the image in the first step to understand how you will configure the routes.
In `app-routing.module.ts` you will add a path &#39;first&#39; to `FirstComponent` and a redirection from &#39;&#39; to &#39;first&#39;. And then import the `FirstModule` in the main `app.module.ts`

Next, for the feature modules, you will add the routes &#39;first/second-left&#39; and &#39;first/second-right&#39; pointing to their respective `ContentComponent` in `first-routing.module.ts`. And then import `SecondLeftModule` and `SecondRightModule` in `first.module.ts`


Switch to the editor and open the file 'devonfw/workspaces/main/level-app/src/app/app-routing.module.ts'.

`devonfw/workspaces/main/level-app/src/app/app-routing.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/app-routing.module.ts" data-target="replace" data-marker="">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;
import { FirstComponent } from &#39;./first/first/first.component&#39;;

const routes: Routes = [
  {
    path: &#39;first&#39;,
    component: FirstComponent
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
import { FirstModule } from &#39;./first/first.module&#39;;

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FirstModule
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
    path: &#39;first/second-left&#39;,
    component: ContentLeft
  },
  {
    path: &#39;first/second-right&#39;,
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

import { SecondLeftModule } from &#39;./second-left/second-left.module&#39;;
import { SecondRightModule } from &#39;./second-right/second-right.module&#39;;

@NgModule({
  declarations: [FirstComponent],
  imports: [
    CommonModule,
    FirstRoutingModule,
    SecondLeftModule,
    SecondRightModule,
  ]
})
export class FirstModule { }
</pre>



Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/level-app&#39; in terminal 2 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/level-app`{{execute T2}}


Now build and start the app
 

`devon ng serve --host 0.0.0.0 --disable-host-check`{{execute T2 }}

For your local projects you wouldn't add '--host 0.0.0.0' and '--disable-host-check' to the 'ng' command.


Now you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-4200-[[KATACODA_HOST]].environments.katacoda.com/
 

