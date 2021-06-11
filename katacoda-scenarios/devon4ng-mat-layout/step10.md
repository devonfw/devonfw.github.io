You need to provide a hook where the components will be loaded when their respective URLs are loaded. You do that by using the `router-outlet` directive in the `app.component.html`:


Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html" data-target="replace" data-marker="">
&lt;mat-toolbar color=&#34;primary&#34;&gt;
  &lt;button mat-icon-button aria-label=&#34;menu&#34; class=&#34;menu&#34;&gt;
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
&lt;router-outlet&gt;&lt;/router-outlet&gt;</pre>

