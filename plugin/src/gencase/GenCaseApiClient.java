package gencase;

import com.google.gson.Gson;
import com.intellij.openapi.vfs.VirtualFile;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.ByteArrayPartSource;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;

import java.io.IOException;
import java.util.Base64;

public class GenCaseApiClient {

    private final HttpClient client;

    private static final GenCaseApiClient INSTANCE = new GenCaseApiClient();
    private static final String UPLOAD_URL = "/api/admin/upload";

    public static GenCaseApiClient getInstance() {
        return INSTANCE;
    }

    private GenCaseApiClient() {
        client = new HttpClient();
        client.getHttpConnectionManager().getParams().setConnectionTimeout(5000);
        client.getHttpConnectionManager().getParams().setSoTimeout(5000);
    }

    public void upload(VirtualFile file) throws IOException {
        Configuration config = Configuration.getInstance();
        PostMethod method = new PostMethod(config.getUrl() + UPLOAD_URL);
        method.setRequestHeader("Authorization", createAuthorization(config));
        ByteArrayPartSource source = new ByteArrayPartSource(file.getName(), file.contentsToByteArray());
        Part part = new FilePart("file", source, "application/json", "UTF-8");
        method.setRequestEntity(new MultipartRequestEntity(new Part[] { part }, method.getParams()));
        client.executeMethod(method);
    }

    void reset() {
    }

    private String createAuthorization(Configuration config) {
        String key = config.getUsername()+ ":" + config.getPassword();
        return new String(Base64.getEncoder().encode(key.getBytes()));
    }
}
