package gencase;

import com.intellij.extapi.psi.PsiFileBase;
import com.intellij.openapi.fileTypes.FileType;
import com.intellij.psi.FileViewProvider;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;

public class GenCaseFile extends PsiFileBase {

  public GenCaseFile(@NotNull FileViewProvider viewProvider) {
    super(viewProvider, GenCaseLanguage.INSTANCE);
  }

  @NotNull
  @Override
  public FileType getFileType() {
    return GenCaseFileType.INSTANCE;
  }

  @Override
  public String toString() {
    return "GenCase File";
  }

  @Override
  public Icon getIcon(int flags) {
    return super.getIcon(flags);
  }
}