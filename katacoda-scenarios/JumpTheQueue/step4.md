Now build and run the Angular Server.
The following two steps are only needed in this tutorial. Normally you can simply execute &#34;ng serve&#34;, open the https://localhost:4200/ and start using the app.
In the next step you need to change the Base URL for the REST Services. 


Switch to the editor and open the file 'devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts'.

`devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts`{{open}}




Replace the content in the file as it is shown in the following segment of code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts" data-target="insert" data-marker="http://localhost:8081/jumpthequeue/services/rest">
https://[[HOST_SUBDOMAIN]]-8081-[[KATACODA_HOST]].environments.katacoda.com/jumpthequeue/services/rest</pre>

