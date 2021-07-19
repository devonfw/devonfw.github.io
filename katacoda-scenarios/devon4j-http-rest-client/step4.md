Now, you will create VisitormanagementRestServiceImpl, the implementation class of VisitormanagementRestService using JAX-RS standard.


If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/visitormanagement/service/impl/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'VisitormanagementRestServiceImpl.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestserver/core/src/main/java/com/example/application/httprestserver/visitormanagement/service/impl/rest/VisitormanagementRestServiceImpl.java">
package com.example.application.httprestserver.visitormanagement.service.impl.rest;

import javax.inject.Named;

import com.example.application.httprestserver.visitormanagement.service.api.rest.VisitormanagementRestService;

@Named(&#34;VisitormanagementRestService&#34;)
public class VisitormanagementRestServiceImpl implements VisitormanagementRestService {

  @Override
  public String returnResponseToClient() {

    return &#34;Welcome to REST API world&#34;;
  }

}

</pre>

Here , you can see &#34;VisitormanagementRestServiceImpl.java&#34; is annotated with @Named to make it a spring-bean. To get return response to client &#34;returnResponseToClient()&#34; can be accessed via HTTP GET under the URL path &#34;/visitormanagement/v1/clientrequest&#34;. It will return its result (String) as JSON (see @Produces in VisitormanagementRestService).
