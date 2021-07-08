Now, you will create Devon4jRestClientImpl, the implementation class of Devon4jRestClient using JAX-RS standard.



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestclient/core/src/main/java/com/sample/application/httprestclient/general/service/impl/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'Devon4jRestClientImpl.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestclient/core/src/main/java/com/sample/application/httprestclient/general/service/impl/rest/Devon4jRestClientImpl.java">
package com.sample.application.httprestclient.general.service.impl.rest;

import javax.inject.Inject;
import javax.inject.Named;
import com.sample.application.httprestclient.general.service.api.rest.Devon4jRestClient;
import com.sample.application.httprestclient.general.service.api.rest.VisitormanagementRestService;
import com.devonfw.module.service.common.api.client.ServiceClientFactory;

@Named(&#34;Devon4jRestClient&#34;)
public class Devon4jRestClientImpl implements Devon4jRestClient {

  @Inject
  private ServiceClientFactory serviceClientFactory;

  @Override
  public String showResponse() {

    String result = callSynchronous();
    System.out.println(result);
    return result;
  }

  private String callSynchronous() {

    VisitormanagementRestService visitormanagementRestService = this.serviceClientFactory
        .create(VisitormanagementRestService.class);
    String resultFromAPICall = visitormanagementRestService.returnResponseToClient();
    return resultFromAPICall;
  }

  @Override
  public String returnServiceDetail() {

    String result = &#34;This is devon4j rest service client&#34;;
    return result;
  }
}

</pre>

As you can see synchronous invocation of a service is very simple and type-safe. The actual call of showResponse will technically call the remote service(i.e. VisitormanagementRestService) over the wire ( via HTTP) including marshaling the arguments (converting String to JSON) and un-marshalling the result (e.g. converting the received JSON to String).
Here in Devon4jRestClientImpl, there is a method &#34;callSynchronous&#34; which will call the VisitormanagementRestService and return the object of VisitormanagementRestService to visitormanagementRestService.
With visitormanagementRestService, it is calling the method &#34;returnResponseToClient(String)&#34; of server.
The response from server will be stored in &#34;resultFromAPICall&#34; as the return type of result is String.
After getting response, you can handle the response further in your implementation. Here, you can see that response is getting handled in &#34;showResponse&#34; method.
