package gencase;

import com.intellij.lexer.FlexAdapter;

import java.io.Reader;

public class GenCaseLexerAdapter extends FlexAdapter {
  public GenCaseLexerAdapter() {
    super(new GenCaseLexer((Reader) null));
  }
}
