package gencase.compiler;

import com.intellij.lang.annotation.HighlightSeverity;
import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.compiler.CompilerMessageCategory;
import com.intellij.psi.PsiElement;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CompileException extends RuntimeException {

    private final Collection<CompilationMessage> messages;

    public CompileException(String message, PsiElement element) {
        this.messages = Collections.singletonList(
            new CompilationMessage(message, element, HighlightSeverity.ERROR));
    }

    public CompileException(String message, PsiElement element, HighlightSeverity severity) {
        this.messages = Collections.singletonList(
            new CompilationMessage(message, element, severity));
    }

    public Collection<CompilationMessage> getMessages() {
        return messages;
    }

    @Override
    public String toString() {
        return messages.stream()
            .map(m -> m.getText())
            .collect(Collectors.toList())
            .toString();
    }
}
