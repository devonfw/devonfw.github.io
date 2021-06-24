REST (REpresentational State Transfer) is an inter-operable protocol for services that is more lightweight than SOAP.


For implementing REST services we use the JAX-RS standard. As an implementation we recommend CXF. For JSON bindings we use Jackson while XML binding works out-of-the-box with JAXB. To implement a service you write an interface with JAX-RS annotations for the API and a regular implementation class annotated with @Named to make it a spring-bean.

The REST service implementation is a regular CDI bean that can use dependency injection. The separation of the API as a Java interface allows to use it for service client calls.

**Why** **Should** **you** **prefer** **devon4j** **client** **over** **other** **clients?**

devon4j supports flexible configuration, adding headers for authentication, mapping of errors from server, logging success/errors with duration for performance analysis, support for synchronous and asynchronous invocations. Easy invocation of service inside a micro-service.



For more details on REST visit https://devonfw.com/website/pages/docs/devon4j.asciidoc_guides.html#guide-rest.asciidoc

For more details on devon4j Service Client https://devonfw.com/website/pages/docs/devon4j.asciidoc_guides.html#guide-service-client.asciidoc
