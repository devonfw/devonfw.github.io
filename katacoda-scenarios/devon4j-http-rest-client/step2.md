Now, You have to modify BaseWebSecurityConfig file to allow application for basic authentication.


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

