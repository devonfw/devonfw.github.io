We will clear the `app.component.html` file and setup a header with a menu button and some navigational links. We will use `mat-toolbar`, `mat-button`, `mat-menu`, `mat-icon` and `mat-icon-button` for this:


Switch to the IDE and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/app/app.component.html'.

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

&lt;/mat-toolbar&gt;</pre>

The color attribute on the mat-toolbar element will give it the primary (indigo) color as defined by our theme. The color attribute works with most Angular Material components; the possible values are `primary`, `accent` and `warn`. The `mat-toolbar` is a suitable component to represent a header. It serves as a placeholder for elements we want in our header. Inside the `mat-toolbar`, we start with a button having `mat-icon-button` attribute, which itself contains a `mat-icon` element having the value `menu`. This will serve as a menu button which we can use to toggle the `sidenav`. We follow it with some sample buttons having the `mat-button` attribute. Notice the first button has a property `matMenuTriggerFor` binded to a local reference submenu. As the property name suggests, the click of this button will display the mat-menu element with the specified local reference as a drop-down menu. The rest of the code is self explanatory.
