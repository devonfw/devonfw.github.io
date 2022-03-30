package com.example.application.httprestclient.general.service.impl.rest;

import javax.inject.Inject;
import javax.inject.Named;

import com.devonfw.module.service.common.api.client.ServiceClientFactory;
import com.devonfw.module.service.common.api.client.config.ServiceClientConfigBuilder;
import com.example.application.httprestclient.general.service.api.rest.TestRestService;
import com.example.application.httprestclient.general.service.api.rest.VisitormanagementRestService;

@Named("TestRestService")
public class TestRestServiceImpl implements TestRestService {

  @Inject
  private ServiceClientFactory serviceClientFactory;

  @Override
  public String showResponse() {

    String result = callSynchronous();
    System.out.println("**********inside client method***********");
    System.out.println(result);
    System.out.println("************Thank you for choosing devon4j ****************");
    return result;

  }

  private String callSynchronous() {

    System.out.println("***********inside synchronous call************");
    VisitormanagementRestService visitormanagementRestService = this.serviceClientFactory.create(
        VisitormanagementRestService.class,
        new ServiceClientConfigBuilder().authBasic().userLogin("admin").userPassword("admin").buildMap());
    // call of service over the wire, synchronously blocking until result is received or error occurred
    String resultFromAPICall = visitormanagementRestService.returnResponseToClient();
    System.out.println("************************got result from api" + resultFromAPICall + "***************");
    return resultFromAPICall;
  }

  @Override
  public String verifyServiceWork() {

    return "Verified... service is working";
  }

}
