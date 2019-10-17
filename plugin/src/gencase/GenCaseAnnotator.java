package gencase;

import com.intellij.lang.annotation.AnnotationHolder;
import com.intellij.lang.annotation.Annotator;
import com.intellij.lang.annotation.HighlightSeverity;
import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.compiler.CompilerMessageCategory;
import com.intellij.openapi.util.TextRange;
import com.intellij.psi.PsiElement;
import gencase.compiler.Compiler;
import gencase.compiler.Violation;
import org.jetbrains.annotations.NotNull;

import java.util.List;

public class GenCaseAnnotator implements Annotator {

    @Override
    public void annotate(@NotNull final PsiElement element, @NotNull AnnotationHolder holder) {
        Compiler.getInstance().getMesages(element).forEach(m -> {
            holder.createAnnotation(m.getSeverity(), m.getRange(), m.getText());
        });
    }

}