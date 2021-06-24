You have successfully built the REST-server. Now, you have to start the build and then, start the server as mentioned below.


Please change the folder to &#39;httprestserver&#39;.

`cd httprestserver`{{execute T1}}
 
Use the following devon command to build the Java project.

`devon mvn clean install -Dmaven.test.skip=true`{{execute T1}}

The maven command 'clean' will clear the target directory beforehand. 

We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=true'.




Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/httprestserver/server&#39; in terminal 2 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/httprestserver/server`{{execute T2}}

Start the server in terminal 2 by running the 'maven' command 'mvn spring-boot:run'.

Because this terminal runs the server we will not use it for any other command.
 

`devon mvn spring-boot:run`{{execute T2 }}

This will take some time.



Once, Java server starts running. To test REST-server follow below steps:
* Click on &#34;+&#34; next to terminal tab
* Select &#34;select port to view host&#34;
* Enter the port number &#34;8080&#34; 
* Enter username as &#34;admin&#34; and password as &#34;admin&#34;
* In the url, append &#34;/httprestserver/services/rest/visitormanagement/clientrequest&#34;
* You will be able to see response &#34;Welcome to rest api&#34;



In next step, You have to create devon4j service Client.
