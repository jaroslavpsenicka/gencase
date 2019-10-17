package gencase.parser;

import com.intellij.testFramework.ParsingTestCase;
import gencase.GenCaseParserDefinition;

public class ParserTest extends ParsingTestCase {

  public ParserTest() {
    super("", "gcl", new GenCaseParserDefinition());
  }

  public void testEmpty() {
    doTest(true);
  }

  public void testComment() {
    doTest(true);
  }

  public void testCase() {
    doTest(true);
  }

  public void testPhase() {
    doTest(true);
  }

  public void testEntity() {
    doTest(true);
  }

  public void testEntityExtends() {
    doTest(true);
  }

  public void testEntityExtendsAnnotatedAttribute() {
    doTest(true);
  }

  public void testEntityAttribute() {
    doTest(true);
  }

  public void testEntityAttributeMultiple() {
    doTest(true);
  }

  public void testEntityAttributeAnnotated() {
    doTest(true);
  }

  public void testEntityAttributeAnnotatedMultiple() {
    doTest(true);
  }

  public void testPhaseAnnotated() {
    doTest(true);
  }

  public void testPhaseAnnotatedNamed() {
    doTest(true);
  }

  public void testPhaseAnnotatedMultiple() {
    doTest(true);
  }

  public void testComplex() {
    doTest(true);
  }

  @Override
  protected String getTestDataPath() {
    return "test/resources/parser";
  }

  @Override
  protected boolean skipSpaces() {
    return false;
  }

  @Override
  protected boolean includeRanges() {
    return true;
  }
}
