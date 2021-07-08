Now, Let&#39;s build and start the service client application.
This might take some time for application to start.


Please change the folder to &#39;httprestclient&#39;.

`cd httprestclient`{{execute T1}}
 
Use the following devon command to build the Java project.

`devon mvn clean install -Dmaven.test.skip=true`{{execute T1}}

The maven command 'clean' will clear the target directory beforehand. 

We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=true'.

* Once, application builds successfully. Open new terminal by clicking &#34;+&#34; and wait for it to load.
* Now, Copy and execute below command to navigate into client server.
  `cd devonfw/workspaces/main/httprestclient/server`
* Now, Copy and execute below command to start the application.
  `devon mvn spring-boot:run`

To test Synchronous method, follow below steps.
* Click on &#34;+&#34; next to terminal tab
* Select &#34;select port to view host&#34;
* Enter the port number &#34;8081&#34; 
* In the url, append &#34;/httprestclient/services/rest/devon4jrestclient/response/&#34;
* Enter username as &#34;admin&#34; and password as &#34;admin&#34;
* You will be able to see response &#34;Welcome to rest api&#34;
