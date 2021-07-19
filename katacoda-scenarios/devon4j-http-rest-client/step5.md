Now, you will configure port in application properties.


Switch to the editor and open the file 'devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties'.

`devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties" data-target="replace" data-marker="">
# This is the configuration file shipped with the application that contains reasonable defaults.
# Environment specific configurations are configured in config/application.properties.
# If you are running in a servlet container you may add this to lib/config/application.properties in case you do not
# want to touch the WAR file.

server.port=8081
server.servlet.context-path=/httprestserver
spring.application.name=httprestserver

security.expose.error.details=false

spring.jpa.hibernate.ddl-auto=validate

# Datasource for accessing the database
# https://github.com/spring-projects/spring-boot/blob/d3c34ee3d1bfd3db4a98678c524e145ef9bca51c/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/jdbc/DatabaseDriver.java
spring.jpa.database=h2
# spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
# spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa

# Hibernate NamingStrategy has been deprecated and then removed in favor of two step naming strategy ImplicitNamingStrategy and PhysicalNamingStrategy
spring.jpa.hibernate.naming.implicit-strategy=org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

# https://github.com/devonfw/devon4j/issues/65
# https://vladmihalcea.com/the-open-session-in-view-anti-pattern/
spring.jpa.open-in-view=false

# to prevent that Spring Boot launches batch jobs on startup
# might otherwise lead to errors if job parameters are needed (or lead to unwanted modifications and longer startup times)
# see http://stackoverflow.com/questions/22318907/how-to-stop-spring-batch-scheduled-jobs-from-running-at-first-time-when-executin
spring.batch.job.enabled=false

# Flyway for Database Setup and Migrations
spring.flyway.locations=classpath:db/migration

</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/httprestserver/core/src/main/resources/config/application.properties'.

`devonfw/workspaces/main/httprestserver/core/src/main/resources/config/application.properties`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/resources/config/application.properties" data-target="replace" data-marker="">
# This is the spring boot configuration file for development. It will not be included into the application.
# In order to set specific configurations in a regular installed environment create an according file
# config/application.properties in the server. If you are deploying the application to a servlet container as untouched
# WAR file you can locate this config folder in ${symbol_dollar}{CATALINA_BASE}/lib. If you want to deploy multiple applications to
# the same container (not recommended by default) you need to ensure the WARs are extracted in webapps folder and locate
# the config folder inside the WEB-INF/classes folder of the webapplication.

server.port=8081
server.servlet.context-path=/httprestserver

# Datasource for accessing the database
# See https://github.com/devonfw/devon4j/blob/develop/documentation/guide-configuration.asciidoc#security-configuration
#jasypt.encryptor.password=none
#spring.datasource.password=ENC(7CnHiadYc0Wh2FnWADNjJg==)
spring.datasource.password=
spring.datasource.url=jdbc:h2:./.httprestserver;

# print SQL to console for debugging (e.g. detect N+1 issues)
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Enable JSON pretty printing
spring.jackson.serialization.INDENT_OUTPUT=true

# Flyway for Database Setup and Migrations
spring.flyway.enabled=true
spring.flyway.clean-on-validation-error=true
</pre>

