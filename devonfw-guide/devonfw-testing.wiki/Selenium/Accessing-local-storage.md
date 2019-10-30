Local storage:
-----
The local storage of a website can be used to store global information, the front-end of the website needs.

Test application:
-----

The information saved in local storage can provide the tester with whitebox information of the behavior of the site. If access tokens (or equivalent) have been saved here, accessing local storage may also provide useful for security testing.

Manual access:
-----
The local storage can be accessed for manual debugging from the debugger in the browser. For FireFox:

    * Open the debugger (Right mouse click, Inspect element)
    * Open the toolbox options (1)
    * Enable the storage tab (2)
    * A new tab will appear (3)
    
Automation:
-----
The local storage can be accessed through the SeleniumJS driver. The basic information can be accessed through the following helper class:

```java
package dummy.test.selenium;
 
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class LocalStorageHelper {
    private JavascriptExecutor js;
  
    public LocalStorageHelper(WebDriver webDriver) {
        this.js = (JavascriptExecutor) webDriver;
    }
  
    public void removeItemFromLocalStorage(String item) {
        js.executeScript(String.format(
                "window.localStorage.removeItem('%s');", item));
    }
  
    public boolean isItemPresentInLocalStorage(String item) {
        return !(js.executeScript(String.format(
                "return window.localStorage.getItem('%s');", item)) == null);
    }
  
    public String getItemFromLocalStorage(String key) {
        return (String) js.executeScript(String.format(
                "return window.localStorage.getItem('%s');", key));
    }
 
    public String getKeyFromLocalStorage(int key) {
        return (String) js.executeScript(String.format(
                "return window.localStorage.key('%s');", key));
    }
  
    public Long getLocalStorageLength() {
        return (Long) js.executeScript("return window.localStorage.length;");
    }
  
    public void setItemInLocalStorage(String item, String value) {
        js.executeScript(String.format(
                "window.localStorage.setItem('%s','%s');", item, value));
    }
  
    public void clearLocalStorage() {
        js.executeScript(String.format("window.localStorage.clear();"));
    }
}
```