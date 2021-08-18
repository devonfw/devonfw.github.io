### A devon4j Sample Application

Note: Startup script will take some time for set up. After that you can proceed further.

If you want to create devon4j application on your local machine there are two ways to do it:

* In eclipse as shown [here](https://devonfw.com/website/pages/docs/devon4j.asciidoc_tutorials.html#tutorial-newapp.asciidoc_from-eclipse)

* Using command line as shown [here](https://devonfw.com/website/pages/docs/devon4j.asciidoc_tutorials.html#tutorial-newapp.asciidoc_from-command-line)

Now, you will create sample devon4j application with name *sampleapp*. This step will guide you on how to do it.




## Setting up your Java project

Please change the folder to &#39;devonfw/workspaces/main&#39;.

`cd devonfw/workspaces/main`{{execute T1}}

Now you can use devonfw to setup a Java project for you by executing the following 'devon' command.

`devon java create com.example.application.sampleapp`{{execute T1}}

Once sampleapp is created switch to next tab of IDE. In IDE explorer you can see folder structure like devonfw-&gt; workspaces-&gt;main-&gt;sampleapp . 

Sampleapp contains 3 modules i.e api, core and server.

**api**: It contains API for sampleapp.The API contains the required artifacts to interact with your application via remote services. This can be REST service interfaces, transfer-objects with their interfaces and datatypes but also OpenAPI or gRPC contracts.

**core**: It is the core of the application.In this module you can write actual business logic with service implementation, as well as entire logic layer and dataaccess layer.

**batch**: Optional module for batch layer. In this example we have not created it. To add batch module while generating from commandline use -Dbatch=batch parameter. And to generate it from eclipse using maven archetype, enter batch variable value as batch in project creation page.

**server**: This module bundles the entire app (core with optional batch) typically as a bootified WAR file.

If you want to know more about modules and project structure refer [here](#https://github.com/devonfw/devon4j/blob/master/documentation/guide-structure.asciidoc#project-structure).
