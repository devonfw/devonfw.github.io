The next step is to add the Smallrye OpenAPI extension to the project. Open the `pom.xml` file of project in the folder `rest-json-quickstart`. Add the extension `quarkus-smallrye-openapi` to the list of dependencies.


Switch to the editor and open the file 'devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/pom.xml'.

`devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/pom.xml`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/quarkus-quickstarts/rest-json-quickstart/pom.xml" data-target="replace" data-marker="">
&lt;?xml version=&#34;1.0&#34;?&gt;
&lt;project xsi:schemaLocation=&#34;http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd&#34; 
  xmlns=&#34;http://maven.apache.org/POM/4.0.0&#34; 
  xmlns:xsi=&#34;http://www.w3.org/2001/XMLSchema-instance&#34;&gt;
  &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
  &lt;groupId&gt;org.acme&lt;/groupId&gt;
  &lt;artifactId&gt;rest-json-quickstart&lt;/artifactId&gt;
  &lt;version&gt;1.0.0-SNAPSHOT&lt;/version&gt;
  &lt;properties&gt;
    &lt;quarkus.platform.artifact-id&gt;quarkus-bom&lt;/quarkus.platform.artifact-id&gt;
    &lt;quarkus.platform.group-id&gt;io.quarkus&lt;/quarkus.platform.group-id&gt;
    &lt;quarkus.platform.version&gt;2.5.1.Final&lt;/quarkus.platform.version&gt;
    &lt;surefire-plugin.version&gt;3.0.0-M5&lt;/surefire-plugin.version&gt;
    &lt;project.build.sourceEncoding&gt;UTF-8&lt;/project.build.sourceEncoding&gt;
    &lt;maven.compiler.source&gt;11&lt;/maven.compiler.source&gt;
    &lt;maven.compiler.target&gt;11&lt;/maven.compiler.target&gt;
  &lt;/properties&gt;

  &lt;dependencyManagement&gt;
    &lt;dependencies&gt;
      &lt;dependency&gt;
        &lt;groupId&gt;${quarkus.platform.group-id}&lt;/groupId&gt;
        &lt;artifactId&gt;${quarkus.platform.artifact-id}&lt;/artifactId&gt;
        &lt;version&gt;${quarkus.platform.version}&lt;/version&gt;
        &lt;type&gt;pom&lt;/type&gt;
        &lt;scope&gt;import&lt;/scope&gt;
      &lt;/dependency&gt;
    &lt;/dependencies&gt;
  &lt;/dependencyManagement&gt;

  &lt;dependencies&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;io.quarkus&lt;/groupId&gt;
      &lt;artifactId&gt;quarkus-resteasy-jackson&lt;/artifactId&gt;
    &lt;/dependency&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;io.quarkus&lt;/groupId&gt;
      &lt;artifactId&gt;quarkus-smallrye-openapi&lt;/artifactId&gt;
    &lt;/dependency&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;io.quarkus&lt;/groupId&gt;
      &lt;artifactId&gt;quarkus-junit5&lt;/artifactId&gt;
      &lt;scope&gt;test&lt;/scope&gt;
    &lt;/dependency&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;io.rest-assured&lt;/groupId&gt;
      &lt;artifactId&gt;rest-assured&lt;/artifactId&gt;
      &lt;scope&gt;test&lt;/scope&gt;
    &lt;/dependency&gt;
  &lt;/dependencies&gt;
  &lt;build&gt;
    &lt;plugins&gt;
      &lt;plugin&gt;
        &lt;artifactId&gt;maven-surefire-plugin&lt;/artifactId&gt;
        &lt;version&gt;${surefire-plugin.version}&lt;/version&gt;
        &lt;configuration&gt;
          &lt;systemPropertyVariables&gt;
            &lt;java.util.logging.manager&gt;org.jboss.logmanager.LogManager&lt;/java.util.logging.manager&gt;
            &lt;maven.home&gt;${maven.home}&lt;/maven.home&gt;
          &lt;/systemPropertyVariables&gt;
        &lt;/configuration&gt;
      &lt;/plugin&gt;
      &lt;plugin&gt;
        &lt;groupId&gt;${quarkus.platform.group-id}&lt;/groupId&gt;
        &lt;artifactId&gt;quarkus-maven-plugin&lt;/artifactId&gt;
        &lt;version&gt;${quarkus.platform.version}&lt;/version&gt;
        &lt;executions&gt;
          &lt;execution&gt;
            &lt;goals&gt;
              &lt;goal&gt;build&lt;/goal&gt;
            &lt;/goals&gt;
          &lt;/execution&gt;
        &lt;/executions&gt;
      &lt;/plugin&gt;
    &lt;/plugins&gt;
  &lt;/build&gt;
  &lt;profiles&gt;
    &lt;profile&gt;
      &lt;id&gt;native&lt;/id&gt;
      &lt;activation&gt;
        &lt;property&gt;
          &lt;name&gt;native&lt;/name&gt;
        &lt;/property&gt;
      &lt;/activation&gt;
      &lt;properties&gt;
        &lt;quarkus.package.type&gt;native&lt;/quarkus.package.type&gt;
      &lt;/properties&gt;
      &lt;build&gt;
        &lt;plugins&gt;
          &lt;plugin&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;artifactId&gt;maven-failsafe-plugin&lt;/artifactId&gt;
            &lt;version&gt;${surefire-plugin.version}&lt;/version&gt;
            &lt;executions&gt;
              &lt;execution&gt;
                &lt;goals&gt;
                  &lt;goal&gt;integration-test&lt;/goal&gt;
                  &lt;goal&gt;verify&lt;/goal&gt;
                &lt;/goals&gt;
                &lt;configuration&gt;
                  &lt;systemPropertyVariables&gt;
                    &lt;native.image.path&gt;${project.build.directory}/${project.build.finalName}-runner&lt;/native.image.path&gt;
                    &lt;java.util.logging.manager&gt;org.jboss.logmanager.LogManager&lt;/java.util.logging.manager&gt;
                    &lt;maven.home&gt;${maven.home}&lt;/maven.home&gt;
                  &lt;/systemPropertyVariables&gt;
                &lt;/configuration&gt;
              &lt;/execution&gt;
            &lt;/executions&gt;
          &lt;/plugin&gt;
        &lt;/plugins&gt;
      &lt;/build&gt;
    &lt;/profile&gt;
  &lt;/profiles&gt;
&lt;/project&gt;</pre>

