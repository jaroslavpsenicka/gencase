package gencase.compiler;

import com.intellij.psi.PsiElement;
import com.intellij.psi.tree.IElementType;
import com.intellij.psi.util.PsiTreeUtil;
import gencase.psi.*;
import org.junit.Assert;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.intellij.ui.LoadingNode.getText;

public class PsiUtils {

    public static String getElementOfType(PsiElement el, IElementType type) {
        PsiElement element = PsiTreeUtil.findChildrenOfType(el, PsiElement.class).stream()
            .filter(e -> e.getNode().getElementType() == type)
            .findFirst().orElse(null);
        return element != null ? element.getText() : null;
    }

    public static String getElementOfType(PsiElement el, IElementType type, int idx) {
        List<PsiElement> elements = PsiTreeUtil.findChildrenOfType(el, PsiElement.class).stream()
            .filter(e -> e.getNode().getElementType() == type)
            .collect(Collectors.toList());
        if (idx < elements.size()) return elements.get(idx).getText();
        throw new IllegalArgumentException("Index " + idx + " does not exist in " + elements);
    }

    public static GenCaseAnnotation getAnnotation(GenCasePhase phase, String name) {
        Assert.assertNotNull("phase not given", phase);
        Assert.assertNotNull("annotation name not given", name);
        if (phase.getAnnotations() == null) {
            return null;
        }

        return phase.getAnnotations().getAnnotationList().stream()
            .filter(a -> name.equals(PsiUtils.getElementOfType(a, Types.IDENTIFIER)))
            .findFirst().orElseThrow(() -> new IllegalStateException("annotation " + name + " not found"));
    }

    public static GenCaseAnnotation getAnnotation(GenCaseAttribute attr, String name) {
        Assert.assertNotNull("phase not given", attr);
        Assert.assertNotNull("annotation name not given", name);
        if (attr.getAnnotations() == null) {
            return null;
        }

        return attr.getAnnotations().getAnnotationList().stream()
            .filter(a -> name.equals(PsiUtils.getElementOfType(a, Types.IDENTIFIER)))
            .findFirst().orElseThrow(() -> new IllegalStateException("annotation " + name + " not found"));
    }

    public static String getAnnotationValue(GenCaseAnnotation annotation, String name, boolean isDefault) {
        Assert.assertNotNull("no name given", name);
        Assert.assertNotNull("no annotation given", annotation);
        Pattern qPattern = Pattern.compile("\"(\\w*)\"");
        if (annotation.getAnnotationParams() == null) return null;
        return annotation.getAnnotationParams().getAnnotationParamList().stream()
            .filter(p -> name.equals(PsiUtils.getElementOfType(p, Types.IDENTIFIER)) || isDefault)
            .map(p -> PsiUtils.getElementOfType(p, Types.STRING_VALUE))
            .map(v -> qPattern.matcher(v).matches() ? v.substring(1, v.length() - 1) : null)
            .findFirst().orElse(null);
    }
}
