

Please change the folder to &#39;jump-the-queue/java/jtqj&#39;.

`cd jump-the-queue/java/jtqj`{{execute T1}}
 
Use the following devon command to build the Java project.

`devon mvn clean install`{{execute T1}}

The maven command 'clean' will clear the target directory beforehand. 






Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/jump-the-queue/java/jtqj/server&#39; in terminal 2 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/jump-the-queue/java/jtqj/server`{{execute T2}}

Start the server in terminal 2 by running the 'maven' command 'mvn spring-boot:run'.

Because this terminal runs the server we will not use it for any other command.
 

`devon mvn spring-boot:run`{{execute T2 }}

This will take some time.

Now the Java Server should be running.
