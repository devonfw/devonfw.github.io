## Start cobigen cli

Start cobigen cli and pass the entity file as the parameter.
`devon cobigen generate core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java`{{execute}}

Cobigen cli will ask you which files should be generated. You can type the numbers seperated by comma.
`1,3,5,6,8`{{execute}}


Switch to the IDE. CobiGen generated some new java classes and interfaces. Some of them are located in the api module of the project.

(1) CRUD UD logic: Generates the logic layer and implementations for some use cases.
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/logic/base/usecase/AbstractCustomerUc.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/logic/impl/CustomermanagementImpl.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/logic/impl/usecase/UcManageCustomerImpl.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/logic/impl/usecase/UcFindCustomerImpl.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/Customermanagement.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/usecase/UcFindCustomer.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/usecase/UcManageCustomer.java`{{open}}

(3) CRUD REST services: Generates the service layer with CRUD operations for using in REST services.
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/service/api/rest/CustomermanagementRestService.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/service/impl/rest/CustomermanagementRestServiceImpl.java`{{open}}

(5) TO's: Generates the related Transfer Objects.
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/to/CustomerEto.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/logic/api/to/CustomerSearchCriteriaTo.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/general/common/api/to/AbstractSearchCriteriaTo.java`{{open}}

(6) Entity infrastructure: Creates the entity main interface and edits (by a merge) the current entity to extend the newly generated classes.
- `devonfw/workspaces/main/cobigenexample/api/src/main/java/com/example/application/cobigenexample/customermanagement/common/api/Customer.java`{{open}}
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java`{{open}} (changed)

(8) CRUD SpringData Repository: Generates the entity repository (that contains the CRUD operations) in the data access layer.
- `devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/repo/CustomerRepository.java`{{open}}