Let us finally create the sidenav. To implement the sidenav we need to use 3 Angular Material components: `mat-sidenav-container`, `mat-sidenav` and `mat-sidenav-content`. The `mat-sidenav-container`, as the name suggests, acts as a container for the `sidenav` and the associated content. So it is the parent element, and `mat-sidenav` and `mat-sidenav-content` are the children sibling elements. `mat-sidenav` represents the sidenav. We can put any content we want, though it is usually used to conatain a list of navigational links. The `mat-sidenav-content` element is for conataining our main page content. Since we need the `sidenav` application-wide, we will put it in the `app.component.html`


Switch to the IDE and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html'.

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
  &lt;mat-sidenav mode=&#34;over&#34; [disableClose]=&#34;false&#34; #sidenav&gt;
    Sidenav
  &lt;/mat-sidenav&gt;
  &lt;mat-sidenav-content&gt;
    &lt;router-outlet&gt;&lt;/router-outlet&gt;
  &lt;/mat-sidenav-content&gt;
&lt;/mat-sidenav-container&gt;</pre>



Switch to the IDE and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.scss'.

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
}</pre>

