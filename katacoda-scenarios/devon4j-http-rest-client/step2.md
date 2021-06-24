As explained in REST document, With JAX-RS it is important to make sure that each service method is annotated with the proper HTTP annotation(@GET, @POST, etc).
Let&#39;s create devon4j server. You have to modify BaseWebSecurityConfig file to allow application for basic authentication.
In below example you will create VisitormanagementRestService and it&#39;s implementation i.e. VisitormanagementRestServiceImpl using JAX-RS standard.


## Setting up your Java project

Please change the folder to &#39;devonfw/workspaces/main&#39;.

`cd devonfw/workspaces/main`{{execute T1}}

Now you can use devonfw to setup a Java project for you by executing the following 'devon' command.

`devon java create com.example.application.httprestserver`{{execute T1}}



Switch to the editor and open the file 'devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/general/service/impl/config/BaseWebSecurityConfig.java'.

`devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/general/service/impl/config/BaseWebSecurityConfig.java`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/general/service/impl/config/BaseWebSecurityConfig.java" data-target="replace" data-marker="">
package com.example.application.httprestserver.general.service.impl.config;

import javax.inject.Inject;
import javax.servlet.Filter;

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.devonfw.module.security.common.api.config.WebSecurityConfigurer;
import com.devonfw.module.security.common.impl.rest.AuthenticationSuccessHandlerSendingOkHttpStatusCode;
import com.devonfw.module.security.common.impl.rest.JsonUsernamePasswordAuthenticationFilter;
import com.devonfw.module.security.common.impl.rest.LogoutSuccessHandlerReturningOkHttpStatusCode;

/**
 * This type serves as a base class for extensions of the {@code WebSecurityConfigurerAdapter} and provides a default
 * configuration. &lt;br/&gt;
 * Security configuration is based on {@link WebSecurityConfigurerAdapter}. This configuration is by purpose designed
 * most simple for two channels of authentication: simple login form and rest-url.
 */
public abstract class BaseWebSecurityConfig extends WebSecurityConfigurerAdapter {

  @Inject
  private UserDetailsService userDetailsService;

  @Inject
  private PasswordEncoder passwordEncoder;

  @Inject
  private WebSecurityConfigurer webSecurityConfigurer;

  /**
   * Configure spring security to enable a simple webform-login + a simple rest login.
   */
  @Override
  public void configure(HttpSecurity http) throws Exception {

    String[] unsecuredResources = new String[] { &#34;/login&#34;, &#34;/security/**&#34;, &#34;/services/rest/login&#34;,
    &#34;/services/rest/logout&#34; };

    // disable CSRF protection by default, use csrf starter to override.
    http = http.csrf().disable();
    // load starters as pluggins.
    http = this.webSecurityConfigurer.configure(http);

    http.httpBasic().and()
        //
        .userDetailsService(this.userDetailsService)
        // define all urls that are not to be secured
        .authorizeRequests().antMatchers(unsecuredResources).permitAll().anyRequest().authenticated().and()
        // configure parameters for simple form login (and logout)
        .formLogin().successHandler(new SimpleUrlAuthenticationSuccessHandler()).defaultSuccessUrl(&#34;/&#34;)
        .failureUrl(&#34;/login.html?error&#34;).loginProcessingUrl(&#34;/j_spring_security_login&#34;).usernameParameter(&#34;username&#34;)
        .passwordParameter(&#34;password&#34;).and()
        // logout via POST is possible
        .logout().logoutSuccessUrl(&#34;/login.html&#34;).and()
        // register login and logout filter that handles rest logins
        .addFilterAfter(getSimpleRestAuthenticationFilter(), BasicAuthenticationFilter.class)
        .addFilterAfter(getSimpleRestLogoutFilter(), LogoutFilter.class);
  }

  /**
   * Create a simple filter that allows logout on a REST Url /services/rest/logout and returns a simple HTTP status 200
   * ok.
   *
   * @return the filter.
   */
  protected Filter getSimpleRestLogoutFilter() {

    LogoutFilter logoutFilter = new LogoutFilter(new LogoutSuccessHandlerReturningOkHttpStatusCode(),
        new SecurityContextLogoutHandler());

    // configure logout for rest logouts
    logoutFilter.setLogoutRequestMatcher(new AntPathRequestMatcher(&#34;/services/rest/logout&#34;));

    return logoutFilter;
  }

  /**
   * Create a simple authentication filter for REST logins that reads user-credentials from a json-parameter and returns
   * status 200 instead of redirect after login.
   *
   * @return the {@link JsonUsernamePasswordAuthenticationFilter}.
   * @throws Exception if something goes wrong.
   */
  protected JsonUsernamePasswordAuthenticationFilter getSimpleRestAuthenticationFilter() throws Exception {

    JsonUsernamePasswordAuthenticationFilter jsonFilter = new JsonUsernamePasswordAuthenticationFilter(
        new AntPathRequestMatcher(&#34;/services/rest/login&#34;));
    jsonFilter.setPasswordParameter(&#34;j_password&#34;);
    jsonFilter.setUsernameParameter(&#34;j_username&#34;);
    jsonFilter.setAuthenticationManager(authenticationManager());
    // set failurehandler that uses no redirect in case of login failure; just HTTP-status: 401
    jsonFilter.setAuthenticationManager(authenticationManagerBean());
    jsonFilter.setAuthenticationFailureHandler(new SimpleUrlAuthenticationFailureHandler());
    // set successhandler that uses no redirect in case of login success; just HTTP-status: 200
    jsonFilter.setAuthenticationSuccessHandler(new AuthenticationSuccessHandlerSendingOkHttpStatusCode());
    return jsonFilter;
  }

  @SuppressWarnings(&#34;javadoc&#34;)
  @Inject
  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {

    auth.inMemoryAuthentication().withUser(&#34;admin&#34;).password(this.passwordEncoder.encode(&#34;admin&#34;)).roles(&#34;Admin&#34;);
  }

}
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestserver/api/src/main/java/com/example/application/httprestserver/visitormanagement/service/api/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'VisitormanagementRestService.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/api/src/main/java/com/example/application/httprestserver/visitormanagement/service/api/rest/VisitormanagementRestService.java">
package com.example.application.httprestserver.visitormanagement.service.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;


@Path(&#34;/visitormanagement&#34;)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface VisitormanagementRestService {

  @GET
  @Path(&#34;/clientrequest&#34;)
  public String returnResponseToClient();

}
</pre>



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/visitormanagement/service/impl/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'VisitormanagementRestServiceImpl.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/visitormanagement/service/impl/rest/VisitormanagementRestServiceImpl.java">
package com.example.application.httprestserver.visitormanagement.service.impl.rest;

import javax.inject.Inject;
import javax.inject.Named;

import com.example.application.httprestserver.visitormanagement.service.api.rest.VisitormanagementRestService;

@Named(&#34;VisitormanagementRestService&#34;)
public class VisitormanagementRestServiceImpl implements VisitormanagementRestService {

  @Override
  public String returnResponseToClient() {
   String args = &#34;welcome to rest api&#34;;
   return args;
  }
}
</pre>



Switch to the editor and open the file 'devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties'.

`devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/resources/application.properties" data-target="replace" data-marker="">
# This is the configuration file shipped with the application that contains reasonable defaults.
# Environment specific configurations are configured in config/application.properties.
# If you are running in a servlet container you may add this to lib/config/application.properties in case you do not
# want to touch the WAR file.

server.port=8080
spring.application.name=httprestserver
server.servlet.context-path=/httprestserver

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

server.port=8080
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

Here , you can see &#34;VisitormanagementRestServiceImpl.java&#34; is annotated with @Named to make it a spring-bean. To get return response to client &#34;returnResponseToClient()&#34; can be accessed via HTTP GET under the URL path &#34;/visitormanagement/v1/clientrequest&#34;. It will return its result (String) as JSON (see @Produces in VisitormanagementRestService).
