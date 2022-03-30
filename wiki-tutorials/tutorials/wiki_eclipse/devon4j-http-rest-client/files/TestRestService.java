package com.example.application.httprestclient.general.service.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/testrest/v1")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface TestRestService {

  @GET
  @Path("/response/")
  public String showResponse();

  @GET
  @Path("/verify/")
  public String verifyServiceWork();
}
