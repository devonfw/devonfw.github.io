### devon4j layers explained



![jtqj_detailed_app_structure.jpg](./assets/jtqj_detailed_app_structure.jpg)



Above image display detailed structure of devon4j application. As shown above jump-the-queue application contains different components like queuemanagement, visitormanagement etc

Each component is divided into following layers:
* [client layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-client-layer.asciidoc) for the front-end (GUI).

* [service layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-service-layer.asciidoc) for the services used to expose functionality of the back-end to the client or other consumers. 
For example, in jtqj-api-&gt;queuemangement-&gt;service-&gt;api-&gt; rest contains interfaces for rest services. In core module jtqj-core-&gt;queuemanagement-&gt;service-&gt;impl-&gt; rest you will be able to see implementation of service.

* [batch layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-batch-layer.asciidoc) for exposing functionality in batch-processes (e.g. mass imports).

* [logic layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-logic-layer.asciidoc) for the business logic.
For example, in jtqj-api-&gt;queuemangement-&gt;logic-&gt;api contains ETO(Entity Transfer Object) , CTO(Composite Transfer object), some logic interfaces. In core module jtqj-core-&gt;queuemanagement-&gt;logic-&gt;impl you will be able to see usecase implementation.

* [data-access layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-dataaccess-layer.asciidoc) for the data access (esp. persistence).
For example, in jtqj-api-&gt;queuemangement-&gt;dataaccess-&gt;core contains entities, spring data repositories etc

