Now that you have all the Angular Material related dependencies set up in your project, you can start coding. Let’s begin by adding a suitable `margin` and `font` to the body element of your single page application. You will add it in the `src/styles.scss` file to apply it globally.


Switch to the editor and open the file 'devonfw/workspaces/main/devon4ng-mat-layout/src/styles.scss'.

`devonfw/workspaces/main/devon4ng-mat-layout/src/styles.scss`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/devon4ng-mat-layout/src/styles.scss" data-target="replace" data-marker="">
@import &#34;~@angular/material/prebuilt-themes/indigo-pink.css&#34;;

body {
    margin: 0;
    font-family: &#34;Segoe UI&#34;, Roboto, sans-serif;
  }</pre>

