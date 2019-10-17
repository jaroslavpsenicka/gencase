package gencase;

import com.intellij.lexer.Lexer;
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors;
import com.intellij.openapi.editor.colors.TextAttributesKey;
import com.intellij.openapi.fileTypes.SyntaxHighlighterBase;
import com.intellij.psi.tree.IElementType;
import gencase.psi.Types;
import org.jetbrains.annotations.NotNull;

import static com.intellij.openapi.editor.colors.TextAttributesKey.createTextAttributesKey;

public class GenCaseSyntaxHighlighter extends SyntaxHighlighterBase {
  static TextAttributesKey IDENTIFIER = createTextAttributesKey("IDENTIFIER", DefaultLanguageHighlighterColors.IDENTIFIER);
  static TextAttributesKey KEYWORD = createTextAttributesKey("KEYWORD", DefaultLanguageHighlighterColors.KEYWORD);
  static TextAttributesKey ANNOTATION = createTextAttributesKey("ANNOTATION", DefaultLanguageHighlighterColors.METADATA);
  static TextAttributesKey COMMENT = createTextAttributesKey("COMMENT", DefaultLanguageHighlighterColors.LINE_COMMENT);

  private static final TextAttributesKey[] IDENTIFIER_KEYS = new TextAttributesKey[] {IDENTIFIER};
  private static final TextAttributesKey[] KEYWORD_KEYS = new TextAttributesKey[] {KEYWORD};
  private static final TextAttributesKey[] ANNOTATION_KEYS = new TextAttributesKey[] {ANNOTATION};
  private static final TextAttributesKey[] COMMENT_KEYS = new TextAttributesKey[] {COMMENT};
  private static final TextAttributesKey[] EMPTY_KEYS = new TextAttributesKey[0];

  @NotNull
  @Override
  public Lexer getHighlightingLexer() {
    return new GenCaseLexerAdapter();
  }

  @NotNull
  @Override
  public TextAttributesKey[] getTokenHighlights(IElementType tokenType) {
    if (tokenType.equals(Types.IDENTIFIER)) {
      return IDENTIFIER_KEYS;
    } else if (tokenType.equals(Types.CASE_KEYWORD) ||
      tokenType.equals(Types.PHASE_KEYWORD) ||
      tokenType.equals(Types.ENTITY_KEYWORD)) {
      return KEYWORD_KEYS;
    } else if (tokenType.equals(Types.ANNOTATION)) {
      return ANNOTATION_KEYS;
    } else if (tokenType.equals(Types.EXTENDS_KEYWORD)) {
      return KEYWORD_KEYS;
    } else if (tokenType.equals(Types.COMMENT)) {
      return COMMENT_KEYS;
    } else {
      return EMPTY_KEYS;
    }
  }
}