const fs = require("fs");
const path = require("path");
let journeyDir = process.argv[2];
fs.mkdirSync(path.join(journeyDir,"dummy"), {recursive:true});

fs.writeFileSync(path.join(journeyDir,"dummy","journey.json"), JSON.stringify({
    title: "Architecture", //webseiten titel
    sections: [{
        id: 1,
        title: "Architecture", //h1
        sections: [{
            id: 2,
            title: "Key Principles", //h2
            sections:[{
                id: 21,
                title: "dummy title h3",
                sections: [{
                    id: 211,
                    title:"dummy title h5",
                    sections:[]

                }]
            }]
        },{
            id: 3,
            title: "Architecture Principles", //h2
            sections: []
        },
            {
                id: 4,
                title: "Application Architecture", //h2
                sections: []
            }

        ]
    }]
}));


fs.writeFileSync(path.join(journeyDir,"dummy","1.json"), JSON.stringify({
    title: "Architecture",
    htmlContent: '<div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>There are many different views that are summarized by the term <em>architecture</em>. First, we will introduce the <a href="#key-principles">key principles</a> and <a href="#architecture-principles">architecture principles</a> of devonfw. Then, we will go into details of the the <a href="#application-architecture">architecture of an application</a>.</p>\n' +
        '</div>\n' +
        '</div>'
}));


fs.writeFileSync(path.join(journeyDir,"dummy","2.json"), JSON.stringify({
    title: "Key Principles",
    htmlContent: '<div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>For devonfw we follow these fundamental key principles for all decisions about architecture, design, or choosing standards, libraries, and frameworks:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><strong>KISS</strong><br>\n' +
        'Keep it small and simple</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>Open</strong><br>\n' +
        'Commitment to open standards and solutions (no required dependencies to commercial or vendor-specific standards or solutions)</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>Patterns</strong><br>\n' +
        'We concentrate on providing patterns, best-practices and examples rather than writing framework code.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>Solid</strong><br>\n' +
        'We pick solutions that are established and have been proven to be solid and robust in real-live (business) projects.</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '</div>'
}));

fs.writeFileSync(path.join(journeyDir,"dummy","3.json"), JSON.stringify({
    title: "Architecture Principles",
    htmlContent: ' <div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>Additionally we define the following principles that our architecture is based on:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><strong>Component Oriented Design</strong><br>\n' +
        'We follow a strictly component oriented design to address the following sub-principles:</p>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><a href="http://en.wikipedia.org/wiki/Separation_of_concerns">Separation of Concerns</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="http://en.wikipedia.org/wiki/Reusability">Reusability</a> and avoiding <a href="http://en.wikipedia.org/wiki/Redundant_code">redundant code</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="http://en.wikipedia.org/wiki/Information_hiding">Information Hiding</a> via component API and its exchangeable implementation treated as secret.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><em>Design by Contract</em> for self-contained, descriptive, and stable component APIs.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="#technical-architecture">Layering</a> as well as separation of business logic from technical code for better maintenance.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><em>Data Sovereignty</em> (and <em>high cohesion with low coupling</em>) says that a component is responsible for its data and changes to this data shall only happen via the component. Otherwise, maintenance problems will arise to ensure that data remains consistent. Therefore, interfaces of a component that may be used by other components are designed <em>call-by-value</em> and not <em>call-by-reference</em>.</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>Homogeneity</strong><br>\n' +
        'Solve similar problems in similar ways and establish a uniform <a href="coding-conventions.asciidoc">code-style</a>.</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>As an architect you should be prepared for the future by reading the <a href="https://www.capgemini.com/de-de/wp-content/uploads/sites/5/2020/07/TechnoVision-2020-Report.pdf">TechnoVision</a>.</p>\n' +
        '</div>\n' +
        '</div> '
}));

fs.writeFileSync(path.join(journeyDir,"dummy","4.json"), JSON.stringify({
    title: "Application Architecture",
    htmlContent: '  <div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>For the architecture of an application we distinguish the following views:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p>The <a href="#business-architecture">Business Architecture</a> describes an application from the business perspective. It divides the application into business components and with full abstraction of technical aspects.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p>The <a href="#technical-architecture">Technical Architecture</a> describes an application from the technical implementation perspective. It divides the application into technical layers and defines which technical products and frameworks are used to support these layers.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p>The Infrastructure Architecture describes an application from the operational infrastructure perspective. It defines the nodes used to run the application including clustering, load-balancing and networking. This view is not explored further in this guide.</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '<div class="sect2">\n' +
        '<h3 id="_business_architecture">Business Architecture</h3>\n' +
        '<div class="paragraph">\n' +
        '<p>The <em>business architecture</em> divides the application into <em>business components</em>. A business component has a well-defined responsibility that it encapsulates. All aspects related to that responsibility have to be implemented within that business component. Further, the business architecture defines the dependencies between the business components. These dependencies need to be free of cycles. A business component exports its functionality via well-defined interfaces as a self-contained API. A business component may use another business component via its API and compliant with the dependencies defined by the business architecture.</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>As the business domain and logic of an application can be totally different, the devonfw can not define a standardized business architecture. Depending on the business domain it has to be defined from scratch or from a domain reference architecture template. For very small systems it may be suitable to define just a single business component containing all the code.</p>\n' +
        '</div>\n' +
        '</div>\n' +
        '<div class="sect2">\n' +
        '<h3 id="_technical_architecture">Technical Architecture</h3>\n' +
        '<div class="paragraph">\n' +
        '<p>The <em>technical architecture</em> divides the application into technical <em>layers</em> based on the <a href="http://en.wikipedia.org/wiki/Multilayered_architecture">multilayered architecture</a>. A layer is a unit of code with the same category such as a service or presentation logic. So, a layer is often supported by a technical framework. Each business component can therefore be split into <em>component parts</em> for each layer. However, a business component may not have component parts for every layer (e.g. only a presentation part that utilized logic from other components).</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>An overview of the technical reference architecture of the devonfw is given by <a href="#img-t-architecture">figure "Technical Reference Architecture"</a>.\n' +
        'It defines the following layers visualized as horizontal boxes:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><a href="guide-client-layer.asciidoc">client layer</a> for the front-end (GUI).</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-service-layer.asciidoc">service layer</a> for the services used to expose functionality of the\n' +
        'back-end to the client or other consumers.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-batch-layer.asciidoc">batch layer</a> for exposing functionality in batch-processes (e.g. mass imports).</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-logic-layer.asciidoc">logic layer</a> for the business logic.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-domain-layer.asciidoc">domain layer</a> for the data access, especially persistence (in the <a href="guide-structure-classic.asciidoc">classic project structure</a> this layer is named <a href="guide-dataaccess-layer.asciidoc">data-access layer</a>).</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>Also, you can see the (business) components as vertical boxes (e.g. <em>A</em> and <em>X</em>) and how they are composed out of component parts each one assigned to one of the technical layers.</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>Further, there are technical components for cross-cutting aspects grouped by the gray box on the left. Here is a complete list:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><a href="guide-security.asciidoc">Security</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-logging.asciidoc">Logging</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-monitoring.asciidoc">Monitoring</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-transactions.asciidoc">Transaction-Handling</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-exceptions.asciidoc">Exception-Handling</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-i18n.asciidoc">Internationalization</a></p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><a href="guide-dependency-injection.asciidoc">Dependency-Injection</a></p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '<div id="img-t-architecture" class="imageblock text-center">\n' +
        '<div class="content">\n' +
        '<a class="image" href="https://devonfw.com/website/pages/docs/images/T-Architecture.svg"><img src="images/T-Architecture.png" alt="devonfw architecture blueprint"></a>\n' +
        '</div>\n' +
        '<div class="title">Figure 1. Technical Reference Architecture</div>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>Please click on the architecture image to open it as SVG and click on the layers and cross-cutting topics to open the according documentation guide.</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>We reflect this architecture in our code as described in our <a href="coding-conventions.asciidoc#packages">coding conventions</a> allowing a traceability of business components, use-cases, layers, etc. into the code and giving\n' +
        'developers a sound orientation within the project.</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>Further, the architecture diagram shows the allowed dependencies illustrated by the dark green connectors.\n' +
        'Within a business component a component part can call the next component part on the layer directly below via a dependency on its API (vertical connectors).\n' +
        'While this is natural and obvious, it is generally forbidden to have dependencies upwards the layers\n' +
        'or to skip a layer by a direct dependency on a component part two or more layers below.\n' +
        'The general dependencies allowed between business components are defined by the <a href="#business-architecture">business architecture</a>.\n' +
        'In our reference architecture diagram we assume that the business component <code>A1</code> is allowed to depend\n' +
        'on component <code>A2</code>. Therefore, a use-case within the logic component part of <code>A1</code> is allowed to call a\n' +
        'use-case from <code>A2</code> via a dependency on the component API. The same applies for dialogs on the client layer.\n' +
        'This is illustrated by the horizontal connectors. Please note that <a href="guide-jpa.asciidoc#entity">persistence entities</a> are part of the API of the data-access component part so only the logic component part of the same\n' +
        'business component may depend on them.</p>\n' +
        '</div>\n' +
        '<div class="paragraph">\n' +
        '<p>The technical architecture has to address non-functional requirements:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p><strong>scalability</strong><br>\n' +
        'is established by keeping state in the client and making the server state-less (except for login session). Via load-balancers new server nodes can be added to improve performance (horizontal scaling).</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>availability</strong> and <strong>reliability</strong><br>\n' +
        'are addressed by clustering with redundant nodes avoiding any single-point-of failure. If one node fails the system is still available. Further, the software has to be robust so there are no dead-locks or other bad effects that can make the system unavailable or not reliable.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>security</strong><br>\n' +
        'is archived in the devonfw by the right templates and best-practices that avoid vulnerabilities. See <a href="guide-security.asciidoc">security guidelines</a> for further details.</p>\n' +
        '</li>\n' +
        '<li>\n' +
        '<p><strong>performance</strong><br>\n' +
        'is obtained by choosing the right products and proper configurations. While the actual implementation of the application matters for performance a proper design is important as it is the key to allow performance-optimizations (see e.g. <a href="guide-caching.asciidoc">caching</a>).</p>\n' +
        '</li>\n' +
        '</ul>\n' +
        '</div>\n' +
        '<div class="sect3">\n' +
        '<h4 id="_technology_stack">Technology Stack</h4>\n' +
        '<div class="paragraph">\n' +
        '<p>The technology stack of the devonfw is illustrated by the following table.</p>\n' +
        '</div>\n' +
        '<table class="tableblock frame-all grid-all stretch">\n' +
        '<caption class="title">Table 1. Technology Stack of devonfw</caption>\n' +
        '<colgroup>\n' +
        '<col style="width: 25%;">\n' +
        '<col style="width: 25%;">\n' +
        '<col style="width: 25%;">\n' +
        '<col style="width: 25%;">\n' +
        '</colgroup>\n' +
        '<thead>\n' +
        '<tr>\n' +
        '<th class="tableblock halign-left valign-top"><strong>Topic</strong></th>\n' +
        '<th class="tableblock halign-left valign-top"><strong>Detail</strong></th>\n' +
        '<th class="tableblock halign-left valign-top"><strong>Standard</strong></th>\n' +
        '<th class="tableblock halign-left valign-top"><strong>Suggested implementation</strong></th>\n' +
        '</tr>\n' +
        '</thead>\n' +
        '<tbody>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">runtime</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">language &amp; VM</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">Java</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">Oracle JDK</p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">runtime</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">servlet-container</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">JEE</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://tomcat.apache.org/">tomcat</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-dependency-injection.asciidoc">component management</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">dependency injection</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="https://jcp.org/en/jsr/detail?id=330">JSR330</a> &amp; <a href="https://jcp.org/en/jsr/detail?id=250">JSR250</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://spring.io/">spring</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-configuration.asciidoc">configuration</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">-</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://projects.spring.io/spring-boot/">spring-boot</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-domain-layer.asciidoc">persistence</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">OR-mapper</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://www.oracle.com/technetwork/java/javaee/tech/persistence-jsp-140049.html">JPA</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://hibernate.org/orm/">hibernate</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-batch-layer.asciidoc">batch</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="https://jcp.org/en/jsr/detail?id=352">JSR352</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://projects.spring.io/spring-batch/">spring-batch</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-service-layer.asciidoc">service</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-soap">SOAP services</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="https://jcp.org/en/jsr/detail?id=224">JAX-WS</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://cxf.apache.org/">CXF</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-service-layer.asciidoc">service</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-rest">REST services</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="https://jax-rs-spec.java.net/">JAX-RS</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://cxf.apache.org/">CXF</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-logging.asciidoc">logging</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://www.slf4j.org/">slf4j</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://logback.qos.ch/">logback</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-validation.asciidoc">validation</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://beanvalidation.org/">beanvalidation/JSR303</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://hibernate.org/validator/">hibernate-validator</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-security.asciidoc">security</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">Authentication &amp; Authorization</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://www.oracle.com/technetwork/java/javase/jaas/index.html">JAAS</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://projects.spring.io/spring-security/">spring-security</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-monitoring.asciidoc">monitoring</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://www.oracle.com/technetwork/java/javase/tech/javamanagement-140525.html">JMX</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://spring.io/">spring</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-monitoring.asciidoc">monitoring</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">HTTP Bridge</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">HTTP &amp; JSON</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://www.jolokia.org">jolokia</a></p></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="guide-aop.asciidoc">AOP</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock">framework</p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://docs.oracle.com/javase/7/docs/api/java/lang/reflect/Proxy.html">dynamic proxies</a></p></td>\n' +
        '<td class="tableblock halign-left valign-top"><p class="tableblock"><a href="http://docs.spring.io/autorepo/docs/spring/3.0.6.RELEASE/spring-framework-reference/html/aop.html">spring AOP</a></p></td>\n' +
        '</tr>\n' +
        '</tbody>\n' +
        '</table>\n' +
        '</div>\n' +
        '</div>\n' +
        '</div>  '
}));

fs.writeFileSync(path.join(journeyDir,"dummy","21.json"), JSON.stringify({
    title: "21",
    htmlContent: '  <div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>For the architecture of an application we distinguish the following views:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p>The <a href="#business-architecture">Business Architecture</a> describes an application from the business perspective. It divides the application into business components and with full abstraction of technical aspects.</p>\n' +
        '</div> '


}))

fs.writeFileSync(path.join(journeyDir,"dummy","211.json"), JSON.stringify({
    title: "211",
    htmlContent: '  <div class="sectionbody">\n' +
        '<div class="paragraph">\n' +
        '<p>For the architecture of an application we distinguish the following views:</p>\n' +
        '</div>\n' +
        '<div class="ulist">\n' +
        '<ul>\n' +
        '<li>\n' +
        '<p>The <a href="#business-architecture">Business Architecture</a> describes an application from the business perspective. It divides the application into business components and with full abstraction of technical aspects.</p>\n' +
    '</div> '


}))