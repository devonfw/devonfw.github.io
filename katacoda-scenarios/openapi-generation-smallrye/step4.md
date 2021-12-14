This was all to include the extension in the project. Now build and run the application.


Please change the folder to &#39;quarkus-quickstarts/rest-json-quickstart&#39;.

`cd quarkus-quickstarts/rest-json-quickstart`{{execute T1}}


Run `mvn clean package` with this command.
`mvn clean package `{{execute T1}} 







Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/target/quarkus-app&#39; in terminal 2 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/target/quarkus-app`{{execute T2}}


Run `java -jar quarkus-run.jar` with this command.
`java -jar quarkus-run.jar `{{execute T2}} 


After executing `java -jar quarkus-run.jar`, the application should be running. It provides a simple REST service that can be accessed by opening the following URL: https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com/fruits

You can access the OpenAPI specification of this REST API at https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com/q/openapi

The Swagger UI is accessible at https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com/q/swagger-ui


