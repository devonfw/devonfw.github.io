Now, you will create TestRestServiceImpl, the implementation class of TestRestService using JAX-RS standard.



If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p /root/devonfw/workspaces/main/httprestclient/core/src/main/java/com/example/application/httprestclient/general/service/impl/rest`{{execute T1}}

Switch to the editor and click 'Copy to Editor'. 

'TestRestServiceImpl.java' will be created automatically inside the newly created folder.

<pre class="file" data-filename="devonfw/workspaces/main/httprestclient/core/src/main/java/com/example/application/httprestclient/general/service/impl/rest/TestRestServiceImpl.java">
package com.example.application.httprestclient.general.service.impl.rest;

import javax.inject.Inject;
import javax.inject.Named;

import com.devonfw.module.service.common.api.client.ServiceClientFactory;
import com.devonfw.module.service.common.api.client.config.ServiceClientConfigBuilder;
import com.example.application.httprestclient.general.service.api.rest.TestRestService;
import com.example.application.httprestclient.general.service.api.rest.VisitormanagementRestService;

@Named(&#34;TestRestService&#34;)
public class TestRestServiceImpl implements TestRestService {

  @Inject
  private ServiceClientFactory serviceClientFactory;

  @Override
  public String showResponse() {

    String result = callSynchronous();
    System.out.println(&#34;**********inside client method***********&#34;);
    System.out.println(result);
    System.out.println(&#34;************Thank you for choosing devon4j ****************&#34;);
    return result;

  }

  private String callSynchronous() {

    System.out.println(&#34;***********inside synchronous call************&#34;);
    VisitormanagementRestService visitormanagementRestService = this.serviceClientFactory.create(
        VisitormanagementRestService.class,
        new ServiceClientConfigBuilder().authBasic().userLogin(&#34;admin&#34;).userPassword(&#34;admin&#34;).buildMap());
    // call of service over the wire, synchronously blocking until result is received or error occurred
    String resultFromAPICall = visitormanagementRestService.returnResponseToClient();
    System.out.println(&#34;************************got result from api&#34; + resultFromAPICall + &#34;***************&#34;);
    return resultFromAPICall;
  }

  @Override
  public String verifyServiceWork() {

    return &#34;Verified... service is working&#34;;
  }

}

</pre>

As you can see synchronous invocation of a service is very simple and type-safe. The actual call of showResponse will technically call the remote service(i.e. VisitormanagementRestService) over the wire ( via HTTP) including marshaling the arguments (converting String to JSON) and un-marshalling the result (e.g. converting the received JSON to String).
Here in TestRestServiceImpl, there is a method &#34;callSynchronous&#34; which will call the VisitormanagementRestService and return the object of VisitormanagementRestService to visitormanagementRestService.
With visitormanagementRestService, it is calling the method &#34;returnResponseToClient()&#34; of server.
The response from server will be stored in &#34;resultFromAPICall&#34; as the return type of result is String.
After getting response, you can handle the response further in your implementation. Here, you can see that response is getting handled in &#34;showResponse&#34; method.
