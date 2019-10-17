package gencase.psi;


import com.intellij.psi.tree.IElementType;
import gencase.GenCaseLanguage;
import org.jetbrains.annotations.*;

public class GenCaseElementType extends IElementType {

    public GenCaseElementType(@NotNull @NonNls String debugName) {
        super(debugName, GenCaseLanguage.INSTANCE);
    }

}