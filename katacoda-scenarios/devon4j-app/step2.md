

![devon4j_proj_structure1.jpg](./assets/devon4j_proj_structure1.jpg)



As shown in above image,devon4j application follows [multilayered architecture](https://en.wikipedia.org/wiki/Multitier_architecture).

Each component is divided into following layers:
* [client layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-client-layer.asciidoc) for the front-end (GUI).

* [service layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-service-layer.asciidoc) for the services used to expose functionality of the back-end to the client or other consumers. For example, in sampleapp we generated com.example.application.sampleapp.&lt;componentname&gt;.service.impl will have all rest service implementation.

* [batch layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-batch-layer.asciidoc) for exposing functionality in batch-processes (e.g. mass imports).

* [logic layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-logic-layer.asciidoc) for the business logic. For example, in sampleapp we generated com.example.application.sampleapp.&lt;componentname&gt;.logic will contain business logic or usecase implementation.

* [data-access layer](https://github.com/devonfw/devon4j/blob/master/documentation/guide-dataaccess-layer.asciidoc) for the data access (esp. persistence).For example, in sampleapp we generated com.example.application.sampleapp.&lt;compoenntname&gt;.dataaccess will contain entity, repositories etc.
