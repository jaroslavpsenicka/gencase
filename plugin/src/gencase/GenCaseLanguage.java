package gencase;

import com.intellij.lang.Language;

public class GenCaseLanguage extends Language {

    public static final GenCaseLanguage INSTANCE = new GenCaseLanguage();

    private GenCaseLanguage() {
        super("GenCase");
    }
}

