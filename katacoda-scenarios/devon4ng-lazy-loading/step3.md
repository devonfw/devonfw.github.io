Next you will create the feature modules and components for the app. You will follow the structure shown in the image in the first step. You can use the CLI command `devon ng generate module` along with the `--routing` flag to generate the modules, and `devon ng generate component` command to generate the components.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'first-routing.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first-routing.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FirstRoutingModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'first.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { CommonModule } from &#39;@angular/common&#39;;

import { FirstRoutingModule } from &#39;./first-routing.module&#39;;


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FirstRoutingModule
  ]
})
export class FirstModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-left`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'second-left-routing.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/second-left-routing.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecondLeftRoutingModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-left`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'second-left.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/second-left.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { CommonModule } from &#39;@angular/common&#39;;

import { SecondLeftRoutingModule } from &#39;./second-left-routing.module&#39;;
import { ContentComponent } from &#39;./content/content.component&#39;;


@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    SecondLeftRoutingModule
  ]
})
export class SecondLeftModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-right`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'second-right-routing.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-right/second-right-routing.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { Routes, RouterModule } from &#39;@angular/router&#39;;

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecondRightRoutingModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-right`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'second-right.module.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-right/second-right.module.ts">
import { NgModule } from &#39;@angular/core&#39;;
import { CommonModule } from &#39;@angular/common&#39;;

import { SecondRightRoutingModule } from &#39;./second-right-routing.module&#39;;
import { ContentComponent } from &#39;./content/content.component&#39;;


@NgModule({
  declarations: [ContentComponent],
  imports: [
    CommonModule,
    SecondRightRoutingModule
  ]
})
export class SecondRightModule { }

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/first`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'first.component.html' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first/first.component.html">
&lt;div style=&#34;text-align:center&#34;&gt;
  &lt;h1&gt;
    Welcome to 1st level module
  &lt;/h1&gt;
  &lt;img
    width=&#34;300&#34;
    alt=&#34;Angular Logo&#34;
    src=&#34;data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==&#34;
  /&gt;
&lt;/div&gt;
&lt;div style=&#34;display: flex; align-items: center; justify-content: center&#34;&gt;
  &lt;button routerLink=&#34;./second-left&#34;&gt;Go to left module&lt;/button&gt;
  &lt;button routerLink=&#34;./second-right&#34;&gt;Go to right module&lt;/button&gt;
&lt;/div&gt;
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/first`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'first.component.scss' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first/first.component.scss">
 
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/first`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'first.component.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/first/first.component.ts">
import { Component, OnInit } from &#39;@angular/core&#39;;

@Component({
  selector: &#39;app-first&#39;,
  templateUrl: &#39;./first.component.html&#39;,
  styleUrls: [&#39;./first.component.scss&#39;]
})
export class FirstComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-left/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.html' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/content/content.component.html">
&lt;div style=&#34;text-align:center&#34;&gt;
  &lt;h1&gt;
    Welcome to 2nd level module (left)
  &lt;/h1&gt;
  &lt;img
    width=&#34;300&#34;
    alt=&#34;Angular Logo&#34;
    src=&#34;data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==&#34;
  /&gt;
&lt;/div&gt;
&lt;div style=&#34;display: flex; align-items: center; justify-content: center&#34;&gt;
  &lt;button routerLink=&#34;/first&#34;&gt;Go back&lt;/button&gt;
&lt;/div&gt;
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-left/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.scss' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/content/content.component.scss">
 
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-left/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-left/content/content.component.ts">
import { Component, OnInit } from &#39;@angular/core&#39;;

@Component({
  selector: &#39;app-content&#39;,
  templateUrl: &#39;./content.component.html&#39;,
  styleUrls: [&#39;./content.component.scss&#39;]
})
export class ContentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-right/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.html' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-right/content/content.component.html">
&lt;div style=&#34;text-align: center&#34;&gt;
  &lt;h1&gt;Welcome to 2nd level module (right)&lt;/h1&gt;
  &lt;img
    width=&#34;300&#34;
    alt=&#34;Angular Logo&#34;
    src=&#34;data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==&#34;
  /&gt;
&lt;/div&gt;
&lt;div style=&#34;display: flex; align-items: center; justify-content: center&#34;&gt;
  &lt;button routerLink=&#34;/first&#34;&gt;Go back&lt;/button&gt;
&lt;/div&gt;

</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-right/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.scss' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-right/content/content.component.scss">
 
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/level-app/src/app/first/second-right/content`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'content.component.ts' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/level-app/src/app/first/second-right/content/content.component.ts">
import { Component, OnInit } from &#39;@angular/core&#39;;

@Component({
  selector: &#39;app-content&#39;,
  templateUrl: &#39;./content.component.html&#39;,
  styleUrls: [&#39;./content.component.scss&#39;]
})
export class ContentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

</pre>

