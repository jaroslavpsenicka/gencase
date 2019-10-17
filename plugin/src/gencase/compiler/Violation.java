package gencase.compiler;

import com.intellij.lang.annotation.HighlightSeverity;
import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.compiler.CompilerMessageCategory;
import org.jetbrains.annotations.NotNull;
import org.junit.Assert;

public class Violation {

    private CompilationException.Message message;

    public Violation(CompilationException.Message message) {
        Assert.assertNotNull("no message given", message);
        this.message = message;
    }

    @NotNull
    public HighlightSeverity getSeverity() {
        CompilerMessageCategory category = message.getCategory();
        switch (category) {
            case ERROR:
                return HighlightSeverity.ERROR;
            case WARNING:
                return HighlightSeverity.WARNING;
            default:
                return HighlightSeverity.INFORMATION;
        }
    }

    @NotNull
    public CompilationException.Message getMessage() {
        return this.message;
    }

}
