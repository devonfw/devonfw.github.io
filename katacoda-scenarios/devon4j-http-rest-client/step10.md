Now, you will create service for client i.e. TestRestService.java to provide functionality using JAX-RS standard.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestclient/api/src/main/java/com/example/application/httprestclient/general/service/api/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'TestRestService.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestclient/api/src/main/java/com/example/application/httprestclient/general/service/api/rest/TestRestService.java">
package com.example.application.httprestclient.general.service.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path(&#34;/testrest/v1&#34;)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface TestRestService {

  @GET
  @Path(&#34;/response/&#34;)
  public String showResponse();

  @GET
  @Path(&#34;/verify/&#34;)
  public String verifyServiceWork();
}

</pre>

