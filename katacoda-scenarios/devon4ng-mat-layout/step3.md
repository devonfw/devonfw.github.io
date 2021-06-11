Once the dependencies are installed, you need to import the BrowserAnimationsModule in your AppModule for animations support.
Also, Angular Material provides a host of components for designing your application. All the components are well structured into NgModules. For each component from the Angular Material library that you want to use, you have to import the respective NgModule.


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

@NgModule({
  declarations: [
    AppComponent
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

