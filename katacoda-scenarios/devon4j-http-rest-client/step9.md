Now, you will create service for client i.e. Devon4jRestClient.java to provide functionality using JAX-RS standard.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestclient/api/src/main/java/com/sample/application/httprestclient/general/service/api/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'Devon4jRestClient.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestclient/api/src/main/java/com/sample/application/httprestclient/general/service/api/rest/Devon4jRestClient.java">
package com.sample.application.httprestclient.general.service.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path(&#34;/devon4jrestclient&#34;)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface Devon4jRestClient {

  @GET
  @Path(&#34;/response&#34;)
  public String showResponse();

  @GET
  @Path(&#34;/clientService&#34;)
  public String returnServiceDetail();
}

</pre>

