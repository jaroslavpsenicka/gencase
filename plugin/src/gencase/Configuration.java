package gencase;

import com.intellij.ide.util.PropertiesComponent;
import org.jetbrains.annotations.NotNull;

public class Configuration {

    private static final String URL = "gencase.url";
    private static final String USERNAME = "gencase.username";
    private static final String PASSWORD = "gencase.password";

    private static final Configuration INSTANCE = new Configuration();

    public static Configuration getInstance() {
        return INSTANCE;
    }

    public String getUrl() {
        String value = PropertiesComponent.getInstance().getValue(URL);
        return (value != null) ? value : "https://gencase.herokuapp.com";
    }

    public void setUrl(@NotNull String url) {
        String value = PropertiesComponent.getInstance().getValue(URL);
        if (!url.equals(value)) {
            PropertiesComponent.getInstance().setValue(URL, url);
            GenCaseApiClient.getInstance().reset();
        }
    }

    public String getUsername() {
        String value = PropertiesComponent.getInstance().getValue(USERNAME);
        return (value != null) ? value : "test";
    }

    public void setUsername(String username) {
        String value = PropertiesComponent.getInstance().getValue(URL);
        if (!username.equals(value)) {
            PropertiesComponent.getInstance().setValue(USERNAME, username);
            GenCaseApiClient.getInstance().reset();
        }
    }

    public String getPassword() {
        String value = PropertiesComponent.getInstance().getValue(PASSWORD);
        return (value != null) ? value : "password";
    }

    public void setPassword(@NotNull String password) {
        String value = PropertiesComponent.getInstance().getValue(URL);
        if (!password.equals(value)) {
            PropertiesComponent.getInstance().setValue(PASSWORD, password);
            GenCaseApiClient.getInstance().reset();
        }
    }

}