package gencase.compiler;

import com.intellij.lang.annotation.HighlightSeverity;
import com.intellij.openapi.compiler.CompilerMessageCategory;
import com.intellij.openapi.util.TextRange;
import com.intellij.psi.PsiElement;

public class CompilationMessage {

    private String message;
    private PsiElement element;
    private HighlightSeverity severity;

    public CompilationMessage(String message, PsiElement element, HighlightSeverity severity) {
        this.message = message;
        this.element = element;
        this.severity = severity;
    }

    public HighlightSeverity getSeverity() {
        return severity;
    }

    public PsiElement getElement() {
        return element;
    }

    public TextRange getRange() {
        return element.getTextRange();
    }

    public String getText() {
        return message;
    }
}
