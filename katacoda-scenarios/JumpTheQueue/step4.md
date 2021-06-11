Now build and run the Angular Server.
The following two steps are only needed in this tutorial. Normally you can simply execute &#34;ng serve&#34;, open the https://localhost:4200/ and start using the app.
In the next step you need to change the Base URL for the REST Services. 


Switch to the editor and open the file 'devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts'.

`devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts`{{open}}




Replace the content in the file as it is shown in the following segment of code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/jump-the-queue/angular/src/environments/environment.ts" data-target="insert" data-marker="http://localhost:8081/jumpthequeue/services/rest">
https://[[HOST_SUBDOMAIN]]-8081-[[KATACODA_HOST]].environments.katacoda.com/jumpthequeue/services/rest</pre>



Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/jump-the-queue/angular&#39; in terminal 3 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/jump-the-queue/angular`{{execute T3}}


Now build and start the app
 

`devon ng serve --host 0.0.0.0 --disable-host-check`{{execute T3 }}

For your local projects you wouldn't add '--host 0.0.0.0' and '--disable-host-check' to the 'ng' command.


Now you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-4200-[[KATACODA_HOST]].environments.katacoda.com/
 

Now the Angular Frontend Server should be running.
