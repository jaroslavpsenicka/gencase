package gencase;

import com.intellij.openapi.editor.colors.TextAttributesKey;
import com.intellij.openapi.fileTypes.SyntaxHighlighter;
import com.intellij.openapi.options.colors.*;
import org.jetbrains.annotations.*;

import javax.swing.*;
import java.util.Map;

public class GenCaseColorSettingsPage implements ColorSettingsPage {
  private static final AttributesDescriptor[] DESCRIPTORS = new AttributesDescriptor[]{
      new AttributesDescriptor("Keyword", GenCaseSyntaxHighlighter.KEYWORD),
      new AttributesDescriptor("Annotation", GenCaseSyntaxHighlighter.ANNOTATION),
      new AttributesDescriptor("Identifier", GenCaseSyntaxHighlighter.IDENTIFIER),
  };

  @Nullable
  @Override
  public Icon getIcon() {
    return Icons.FILE;
  }

  @NotNull
  @Override
  public SyntaxHighlighter getHighlighter() {
    return new GenCaseSyntaxHighlighter();
  }

  @NotNull
  @Override
  public String getDemoText() {
    return "case Mortgage {\n" +
            "}\n" +
            "\n" +
            "@Model(name = \"ModelingModel\")\n" +
            "phase Modeling {\n" +
            "}\n" +
            "// basic model" +
            "entity CaseModel {\n" +
            "\n" +
            "  @Id\n" +
            "  @Generated(\"UUID\")\n" +
            "  String caseId;\n" +
            "\n" +
            "}\n" +
            "\n" +
            "entity ModelingModel extends CaseModel {\n" +
            "\n" +
            "  @NotEmpty(\"input not given\")\n" +
            "  MortgageInput input;\n" +
            "\n" +
            "}";
  }

  @Nullable
  @Override
  public Map<String, TextAttributesKey> getAdditionalHighlightingTagToDescriptorMap() {
    return null;
  }

  @NotNull
  @Override
  public AttributesDescriptor[] getAttributeDescriptors() {
    return DESCRIPTORS;
  }

  @NotNull
  @Override
  public ColorDescriptor[] getColorDescriptors() {
    return ColorDescriptor.EMPTY_ARRAY;
  }

  @NotNull
  @Override
  public String getDisplayName() {
    return "GenCase";
  }
}