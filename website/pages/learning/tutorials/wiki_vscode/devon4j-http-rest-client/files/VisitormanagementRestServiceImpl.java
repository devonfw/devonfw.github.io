package com.example.application.httprestserver.visitormanagement.service.impl.rest;

import javax.inject.Named;

import com.example.application.httprestserver.visitormanagement.service.api.rest.VisitormanagementRestService;

@Named("VisitormanagementRestService")
public class VisitormanagementRestServiceImpl implements VisitormanagementRestService {

  @Override
  public String returnResponseToClient() {

    return "Welcome to REST API world";
  }

}
