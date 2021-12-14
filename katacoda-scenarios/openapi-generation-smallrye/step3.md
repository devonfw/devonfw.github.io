By default, the Swagger UI is enabled only in development mode. To enable it in all cases, set the property `quarkus.swagger-ui.always-include=true` in the application.properties file of the Quarkus project.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/src/main/resources`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'application.properties' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/src/main/resources/application.properties">
quarkus.swagger-ui.always-include=true
</pre>

