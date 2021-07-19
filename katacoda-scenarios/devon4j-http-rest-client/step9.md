Now, You will create a Java interface VisitormanagementRestService to invoke inside client.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestclient/api/src/main/java/com/example/application/httprestclient/general/service/api/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'VisitormanagementRestService.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestclient/api/src/main/java/com/example/application/httprestclient/general/service/api/rest/VisitormanagementRestService.java">
package com.example.application.httprestclient.general.service.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path(&#34;/visitormanagement/v1&#34;)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface VisitormanagementRestService {

  @GET
  @Path(&#34;/clientrequest/&#34;)
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public String returnResponseToClient();

}
</pre>

