Next, you will create a sidenav. But before that lets create a couple of components to navigate between, the links of which you will add to the sidenav. You can use the `ng generate component` (or `ng g c` command for short) to create Home and Data components. But here, you will create them manually. You nest them in the `pages` sub-directory since they represent your pages. And you will also add the new components to your AppModule.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'home.component.html' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home/home.component.html">
&lt;h2&gt;Home Page&lt;/h2&gt;

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'home.component.scss' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home/home.component.scss">
h2 {
    text-align: center;
    margin-top: 50px;
}
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'home.component.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/home/home.component.ts">
import { Component, OnInit } from &#39;@angular/core&#39;;

@Component({
  selector: &#39;app-home&#39;,
  templateUrl: &#39;./home.component.html&#39;,
  styleUrls: [&#39;./home.component.scss&#39;]
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'data.component.html' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data/data.component.html">
&lt;h2&gt;Data Page&lt;/h2&gt;

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'data.component.scss' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data/data.component.scss">
h2 {
    text-align: center;
    margin-top: 50px;
}
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'data.component.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/pages/data/data.component.ts">
import { Component, OnInit } from &#39;@angular/core&#39;;

@Component({
  selector: &#39;app-data&#39;,
  templateUrl: &#39;./data.component.html&#39;,
  styleUrls: [&#39;./data.component.scss&#39;]
})
export class DataComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.module.ts'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.module.ts`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.module.ts" data-target="replace" data-marker="">
import { BrowserAnimationsModule } from &#39;@angular/platform-browser/animations&#39;;
import { MatIconModule } from &#39;@angular/material/icon&#39;;
import { MatButtonModule } from &#39;@angular/material/button&#39;;
import { MatMenuModule } from &#39;@angular/material/menu&#39;;
import { MatListModule } from &#39;@angular/material/list&#39;;
import { MatToolbarModule } from &#39;@angular/material/toolbar&#39;;
import { MatSidenavModule } from &#39;@angular/material/sidenav&#39;;
import { NgModule } from &#39;@angular/core&#39;;

import { AppRoutingModule } from &#39;./app-routing.module&#39;;
import { AppComponent } from &#39;./app.component&#39;;
import { HomeComponent } from &#39;./pages/home/home.component&#39;;
import { DataComponent } from &#39;./pages/data/data.component&#39;;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DataComponent
  ],
  imports: [
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
</pre>

