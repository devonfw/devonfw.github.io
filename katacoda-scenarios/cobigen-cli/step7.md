Now let us change some code in the entity class.

Add a new property in the CustomerEntity.java file.
<pre class="file">
private String company;
</pre>

Add also the new getter and setter methods for the new property.
<pre class="file">
/** @return the company */
public String getCompany() {
  return firstname;
}

/** @param company the company to set */
public void setCompany(String company) {
  this.company = company;
}
</pre>

Go back to the terminal an navigate to the root folder of the project.
`cd /root/devonfw/workspaces/main/cobigenexample/`{{execute}}

Compile the project.
`devon mvn compile`{{execute}}

And start cobigen cli again.
`devon cobigen generate core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java`{{execute}}

`1,3,5,6,8`{{execute}}


Switch back to the IDE. You can see that cobigen added code in some of the generated files. Open the Customer.java file which is located in the api module of the project in the package 'customermanagement/common/api/'. You can see cobigen added the new getter and setter methods for the new 'company' property.

The following files should have changed:
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/to/CustomerEto.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/to/CustomerSearchCriteriaTo.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/common/api/Customer.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/repo/CustomerRepository.java`{{open}}