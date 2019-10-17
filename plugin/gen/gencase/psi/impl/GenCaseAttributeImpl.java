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

public class GenCaseAttributeImpl extends ASTWrapperPsiElement implements GenCaseAttribute {

  public GenCaseAttributeImpl(@NotNull ASTNode node) {
    super(node);
  }

  public void accept(@NotNull GenCaseVisitor visitor) {
    visitor.visitAttribute(this);
  }

  public void accept(@NotNull PsiElementVisitor visitor) {
    if (visitor instanceof GenCaseVisitor) accept((GenCaseVisitor)visitor);
    else super.accept(visitor);
  }

  @Override
  @Nullable
  public GenCaseAnnotations getAnnotations() {
    return findChildByClass(GenCaseAnnotations.class);
  }

  @Override
  @NotNull
  public GenCaseAttributeDefinition getAttributeDefinition() {
    return findNotNullChildByClass(GenCaseAttributeDefinition.class);
  }

}
