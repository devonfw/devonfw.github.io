Now you have to create the entity class which will be passed to the cobigen cli generator later.

Create a new package in the core module of your project. The entity class is called 'CustomerEntity' so the name of the package has to be 'customermanagement/dataaccess/api/'. This is a naming convention of devon4j. You can find more about the coding conventions on https://devonfw.com/website/pages/docs/devon4j.asciidoc_coding-conventions.html.

`mkdir -p core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/`{{execute}}

Switch to the IDE and click 'Copy to Editor' in the following java class. The java file will be created automatically inside the newly created package.

<pre class="file" data-filename="devonfw/workspaces/main/cobigenexample/core/src/main/java/com/example/application/cobigenexample/customermanagement/dataaccess/api/CustomerEntity.java">
package com.example.application.cobigenexample.customermanagement.dataaccess.api;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "Customer")
public class CustomerEntity {

  private String firstname;

  private String lastname;
  
  private int age;

  /**
   * @return the firstname
   */
  public String getFirstname() {
    return firstname;
  }

  /**
   * @param firstname the firstname to set
   */
  public void setFirstname(String firstname) {
    this.firstname = firstname;
  }
  
  /**
   * @return the lastname
   */
  public String getLastname() {
    return lastname;
  }

  /**
   * @param lastname the lastname to set
   */
  public void setLastname(String lastname) {
    this.lastname = lastname;
  }

  /**
   * @return the age
   */
  public int getAge() {
    return age;
  }

  /**
   * @param age the age to set
   */
  public void setAge(int age) {
    this.age = age;
  }

}
</pre>