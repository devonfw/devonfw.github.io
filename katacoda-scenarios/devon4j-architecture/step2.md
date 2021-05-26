### devon4j application structure


![jtqj_app_structure.jpg](./assets/jtqj_app_structure.jpg)



As shown above, jump-the-queue contains 3 modules i.e api, core and server.

**api**: It contains API for sampleapp.The API contains the required artifacts to interact with your application via remote services. This can be REST service interfaces, transfer-objects with their interfaces and datatypes but also OpenAPI or gRPC contracts.

**core**: It is the core of the application.In this module you can write actual business logic with service implementation, as well as entire logic layer and dataaccess layer.

**batch**: optional module for batch layer. In this example we have not created it.

**server**: This module bundles the entire app (core with optional batch) typically as a bootified WAR file.

If you want to know more about modules and project structure refer [here](https://github.com/devonfw/devon4j/blob/master/documentation/guide-structure.asciidoc#project-structure).

devon4j application follows [multilayered architecture](https://en.wikipedia.org/wiki/Multitier_architecture). We will understand more about it in next step.

