package gencase;

import com.intellij.openapi.fileTypes.FileTypeConsumer;
import com.intellij.openapi.fileTypes.FileTypeFactory;
import com.intellij.openapi.fileTypes.LanguageFileType;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;

public class GenCaseFileType extends LanguageFileType {

    public static final GenCaseFileType INSTANCE = new GenCaseFileType();

    private GenCaseFileType() {
        super(GenCaseLanguage.INSTANCE);
    }

    @NotNull
    @Override
    public String getName() {
        return "GenCase file";
    }

    @NotNull
    @Override
    public String getDescription() {
        return "Generic Case definition file";
    }

    @NotNull
    @Override
    public String getDefaultExtension() {
        return "gcl";
    }

    @Nullable
    @Override
    public Icon getIcon() {
        return Icons.FILE;
    }

    public static class Factory extends FileTypeFactory {

        @Override
        public void createFileTypes(@NotNull FileTypeConsumer fileTypeConsumer) {
            fileTypeConsumer.consume(GenCaseFileType.INSTANCE);
        }
    }

}