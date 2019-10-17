package gencase.psi;

import com.intellij.psi.tree.IElementType;
import gencase.GenCaseLanguage;
import org.jetbrains.annotations.NonNls;
import org.jetbrains.annotations.NotNull;

public class GenCaseTokenType extends IElementType {

    public GenCaseTokenType(@NotNull @NonNls String debugName) {
        super(debugName, GenCaseLanguage.INSTANCE);
    }

    @Override
    public String toString() {
        return "GenCaseTokenType." + super.toString();
    }
}

