The sidenav’s width will be corrected when you add the navigational links to it. That is the only thing remaining to be done. Lets implement it now:


Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html" data-target="replace" data-marker="">
&lt;mat-toolbar color=&#34;primary&#34;&gt;
  &lt;button mat-icon-button aria-label=&#34;menu&#34; class=&#34;menu&#34; (click)=&#34;sidenav.toggle()&#34;&gt;
    &lt;mat-icon&gt;menu&lt;/mat-icon&gt;
  &lt;/button&gt;
  &lt;button mat-button [matMenuTriggerFor]=&#34;submenu&#34;&gt;Menu 1&lt;/button&gt;
  &lt;button mat-button&gt;Menu 2&lt;/button&gt;
  &lt;button mat-button&gt;Menu 3&lt;/button&gt;

  &lt;mat-menu #submenu=&#34;matMenu&#34;&gt;
    &lt;button mat-menu-item&gt;Sub-menu 1&lt;/button&gt;
    &lt;button mat-menu-item [matMenuTriggerFor]=&#34;submenu2&#34;&gt;Sub-menu 2&lt;/button&gt;
  &lt;/mat-menu&gt;

  &lt;mat-menu #submenu2=&#34;matMenu&#34;&gt;
    &lt;button mat-menu-item&gt;Menu Item 1&lt;/button&gt;
    &lt;button mat-menu-item&gt;Menu Item 2&lt;/button&gt;
    &lt;button mat-menu-item&gt;Menu Item 3&lt;/button&gt;
  &lt;/mat-menu&gt;

&lt;/mat-toolbar&gt;
&lt;mat-sidenav-container&gt;
  &lt;mat-sidenav [disableClose]=&#34;false&#34; mode=&#34;over&#34; #sidenav&gt;
    &lt;mat-nav-list&gt;
        &lt;a
          id=&#34;home&#34;
          mat-list-item
          [routerLink]=&#34;[&#39;./&#39;]&#34;
          (click)=&#34;sidenav.close()&#34;
          routerLinkActive=&#34;active&#34;
          [routerLinkActiveOptions]=&#34;{exact: true}&#34;
        &gt;
          &lt;mat-icon matListAvatar&gt;home&lt;/mat-icon&gt;
          &lt;h3 matLine&gt;Home&lt;/h3&gt;
          &lt;p matLine&gt;sample home page&lt;/p&gt;
        &lt;/a&gt;
        &lt;a
          id=&#34;sampleData&#34;
          mat-list-item
          [routerLink]=&#34;[&#39;./data&#39;]&#34;
          (click)=&#34;sidenav.close()&#34;
          routerLinkActive=&#34;active&#34;
        &gt;
          &lt;mat-icon matListAvatar&gt;grid_on&lt;/mat-icon&gt;
          &lt;h3 matLine&gt;Data&lt;/h3&gt;
          &lt;p matLine&gt;sample data page&lt;/p&gt;
        &lt;/a&gt;
      &lt;/mat-nav-list&gt;
    &lt;/mat-sidenav&gt;
  &lt;mat-sidenav-content&gt;
    &lt;router-outlet&gt;&lt;/router-outlet&gt;
  &lt;/mat-sidenav-content&gt;
&lt;/mat-sidenav-container&gt;</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.scss'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.scss`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.scss" data-target="replace" data-marker="">
.menu {
    margin-right: auto;
}
mat-sidenav-container {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    a.active {
        background: #8e8d8d;
        color: #fff;

        p {
            color: #4a4a4a;
        }
    }
}</pre>

