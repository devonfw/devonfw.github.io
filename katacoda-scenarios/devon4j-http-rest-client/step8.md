You have successfully built the devon4j rest client.
Let&#39;s build and start the service client application.
This might take some time for application to start.


Please change the folder to &#39;httprestclient&#39;.

`cd httprestclient`{{execute T1}}
 
Use the following devon command to build the Java project.

`devon mvn clean install -Dmaven.test.skip=true`{{execute T1}}

The maven command 'clean' will clear the target directory beforehand. 

We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=true'.



* Once, application builds successfully. Open new terminal by clicking &#34;+&#34;.
* Now, copy below command and paste it in terminal and press enter to navigate into client server.
&#34;cd devonfw/workspaces/main/httprestclient/server&#34; 
* Now, Copy below command and paste it in terminal and press enter to start the application.
&#34;devon mvn spring-boot:run&#34;








The server is already running. Rerun the command to stop and relaunch it automatically.
 

`devon mvn spring-boot:run`{{execute T2 interrupt}}

This will take some time.

To test Synchronous method, follow below steps.
* Click on &#34;+&#34; next to terminal tab
* Select &#34;select port to view host&#34;
* Enter the port number &#34;8081&#34; 
* Enter username as &#34;admin&#34; and password as &#34;admin&#34;
* In the url, append &#34;/httprestclient/services/rest/devon4jrestclient/response/&#34;
* You will be able to see response &#34;Welcome to rest api&#34;
