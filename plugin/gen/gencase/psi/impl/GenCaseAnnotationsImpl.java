// This is a generated file. Not intended for manual editing.
package gencase.psi.impl;

import java.util.List;
import org.jetbrains.annotations.*;
import com.intellij.lang.ASTNode;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiElementVisitor;
import com.intellij.psi.util.PsiTreeUtil;
import static gencase.psi.Types.*;
import com.intellij.extapi.psi.ASTWrapperPsiElement;
import gencase.psi.*;

public class GenCaseAnnotationsImpl extends ASTWrapperPsiElement implements GenCaseAnnotations {

  public GenCaseAnnotationsImpl(@NotNull ASTNode node) {
    super(node);
  }

  public void accept(@NotNull GenCaseVisitor visitor) {
    visitor.visitAnnotations(this);
  }

  public void accept(@NotNull PsiElementVisitor visitor) {
    if (visitor instanceof GenCaseVisitor) accept((GenCaseVisitor)visitor);
    else super.accept(visitor);
  }

  @Override
  @NotNull
  public List<GenCaseAnnotation> getAnnotationList() {
    return PsiTreeUtil.getChildrenOfTypeAsList(this, GenCaseAnnotation.class);
  }

}
