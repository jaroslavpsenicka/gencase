// This is a generated file. Not intended for manual editing.
package gencase.parser;

import com.intellij.lang.PsiBuilder;
import com.intellij.lang.PsiBuilder.Marker;
import static gencase.psi.Types.*;
import static com.intellij.lang.parser.GeneratedParserUtilBase.*;
import com.intellij.psi.tree.IElementType;
import com.intellij.psi.tree.IFileElementType;
import com.intellij.lang.ASTNode;
import com.intellij.psi.tree.TokenSet;
import com.intellij.lang.PsiParser;
import com.intellij.lang.LightPsiParser;

@SuppressWarnings({"SimplifiableIfStatement", "UnusedAssignment"})
public class GenCaseParser implements PsiParser, LightPsiParser {

  public ASTNode parse(IElementType t, PsiBuilder b) {
    parseLight(t, b);
    return b.getTreeBuilt();
  }

  public void parseLight(IElementType t, PsiBuilder b) {
    boolean r;
    b = adapt_builder_(t, b, this, null);
    Marker m = enter_section_(b, 0, _COLLAPSE_, null);
    if (t instanceof IFileElementType) {
      r = parse_root_(t, b, 0);
    }
    else {
      r = false;
    }
    exit_section_(b, 0, m, t, r, true, TRUE_CONDITION);
  }

  protected boolean parse_root_(IElementType t, PsiBuilder b, int l) {
    return file(b, l + 1);
  }

  /* ********************************************************** */
  // ATSIGN IDENTIFIER annotationParams?
  public static boolean annotation(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotation")) return false;
    if (!nextTokenIs(b, ATSIGN)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeTokens(b, 0, ATSIGN, IDENTIFIER);
    r = r && annotation_2(b, l + 1);
    exit_section_(b, m, ANNOTATION, r);
    return r;
  }

  // annotationParams?
  private static boolean annotation_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotation_2")) return false;
    annotationParams(b, l + 1);
    return true;
  }

  /* ********************************************************** */
  // STRING_VALUE | (IDENTIFIER WHITESPACE? EQUALS WHITESPACE? STRING_VALUE)
  public static boolean annotationParam(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParam")) return false;
    if (!nextTokenIs(b, "<annotation param>", IDENTIFIER, STRING_VALUE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, ANNOTATION_PARAM, "<annotation param>");
    r = consumeToken(b, STRING_VALUE);
    if (!r) r = annotationParam_1(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // IDENTIFIER WHITESPACE? EQUALS WHITESPACE? STRING_VALUE
  private static boolean annotationParam_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParam_1")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, IDENTIFIER);
    r = r && annotationParam_1_1(b, l + 1);
    r = r && consumeToken(b, EQUALS);
    r = r && annotationParam_1_3(b, l + 1);
    r = r && consumeToken(b, STRING_VALUE);
    exit_section_(b, m, null, r);
    return r;
  }

  // WHITESPACE?
  private static boolean annotationParam_1_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParam_1_1")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean annotationParam_1_3(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParam_1_3")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // LEFT_BRACKET (annotationParam COMMA?)* RIGHT_BRACKET
  public static boolean annotationParams(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParams")) return false;
    if (!nextTokenIs(b, LEFT_BRACKET)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, LEFT_BRACKET);
    r = r && annotationParams_1(b, l + 1);
    r = r && consumeToken(b, RIGHT_BRACKET);
    exit_section_(b, m, ANNOTATION_PARAMS, r);
    return r;
  }

  // (annotationParam COMMA?)*
  private static boolean annotationParams_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParams_1")) return false;
    while (true) {
      int c = current_position_(b);
      if (!annotationParams_1_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "annotationParams_1", c)) break;
    }
    return true;
  }

  // annotationParam COMMA?
  private static boolean annotationParams_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParams_1_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = annotationParam(b, l + 1);
    r = r && annotationParams_1_0_1(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  // COMMA?
  private static boolean annotationParams_1_0_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotationParams_1_0_1")) return false;
    consumeToken(b, COMMA);
    return true;
  }

  /* ********************************************************** */
  // (WHITESPACE? annotation)*
  public static boolean annotations(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotations")) return false;
    Marker m = enter_section_(b, l, _NONE_, ANNOTATIONS, "<annotations>");
    while (true) {
      int c = current_position_(b);
      if (!annotations_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "annotations", c)) break;
    }
    exit_section_(b, l, m, true, false, null);
    return true;
  }

  // WHITESPACE? annotation
  private static boolean annotations_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotations_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = annotations_0_0(b, l + 1);
    r = r && annotation(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  // WHITESPACE?
  private static boolean annotations_0_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "annotations_0_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // attributeDefinition | (annotations WHITESPACE? attributeDefinition)
  public static boolean attribute(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attribute")) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, ATTRIBUTE, "<attribute>");
    r = attributeDefinition(b, l + 1);
    if (!r) r = attribute_1(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // annotations WHITESPACE? attributeDefinition
  private static boolean attribute_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attribute_1")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = annotations(b, l + 1);
    r = r && attribute_1_1(b, l + 1);
    r = r && attributeDefinition(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  // WHITESPACE?
  private static boolean attribute_1_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attribute_1_1")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE? IDENTIFIER WHITESPACE? IDENTIFIER SEMICOLON
  public static boolean attributeDefinition(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attributeDefinition")) return false;
    if (!nextTokenIs(b, "<attribute definition>", IDENTIFIER, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, ATTRIBUTE_DEFINITION, "<attribute definition>");
    r = attributeDefinition_0(b, l + 1);
    r = r && consumeToken(b, IDENTIFIER);
    r = r && attributeDefinition_2(b, l + 1);
    r = r && consumeTokens(b, 0, IDENTIFIER, SEMICOLON);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean attributeDefinition_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attributeDefinition_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean attributeDefinition_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "attributeDefinition_2")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE? CASE_KEYWORD WHITESPACE? IDENTIFIER caseDefinition
  public static boolean case_$(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "case_$")) return false;
    if (!nextTokenIs(b, "<case $>", CASE_KEYWORD, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, CASE, "<case $>");
    r = case_0(b, l + 1);
    r = r && consumeToken(b, CASE_KEYWORD);
    r = r && case_2(b, l + 1);
    r = r && consumeToken(b, IDENTIFIER);
    r = r && caseDefinition(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean case_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "case_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean case_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "case_2")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE?
  public static boolean caseBody(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "caseBody")) return false;
    Marker m = enter_section_(b, l, _NONE_, CASE_BODY, "<case body>");
    consumeToken(b, WHITESPACE);
    exit_section_(b, l, m, true, false, null);
    return true;
  }

  /* ********************************************************** */
  // LEFT_CURLY caseBody RIGHT_CURLY
  public static boolean caseDefinition(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "caseDefinition")) return false;
    if (!nextTokenIs(b, LEFT_CURLY)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, LEFT_CURLY);
    r = r && caseBody(b, l + 1);
    r = r && consumeToken(b, RIGHT_CURLY);
    exit_section_(b, m, CASE_DEFINITION, r);
    return r;
  }

  /* ********************************************************** */
  // WHITESPACE? SINGLE_LINE_COMMENT (TEXT | WHITESPACE)* CRLF?
  public static boolean comment(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "comment")) return false;
    if (!nextTokenIs(b, "<comment>", SINGLE_LINE_COMMENT, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, COMMENT, "<comment>");
    r = comment_0(b, l + 1);
    r = r && consumeToken(b, SINGLE_LINE_COMMENT);
    r = r && comment_2(b, l + 1);
    r = r && comment_3(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean comment_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "comment_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // (TEXT | WHITESPACE)*
  private static boolean comment_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "comment_2")) return false;
    while (true) {
      int c = current_position_(b);
      if (!comment_2_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "comment_2", c)) break;
    }
    return true;
  }

  // TEXT | WHITESPACE
  private static boolean comment_2_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "comment_2_0")) return false;
    boolean r;
    r = consumeToken(b, TEXT);
    if (!r) r = consumeToken(b, WHITESPACE);
    return r;
  }

  // CRLF?
  private static boolean comment_3(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "comment_3")) return false;
    consumeToken(b, CRLF);
    return true;
  }

  /* ********************************************************** */
  // entityDefinition | (annotations entityDefinition)
  public static boolean entity(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entity")) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, ENTITY, "<entity>");
    r = entityDefinition(b, l + 1);
    if (!r) r = entity_1(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // annotations entityDefinition
  private static boolean entity_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entity_1")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = annotations(b, l + 1);
    r = r && entityDefinition(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // attribute*
  public static boolean entityBody(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entityBody")) return false;
    Marker m = enter_section_(b, l, _NONE_, ENTITY_BODY, "<entity body>");
    while (true) {
      int c = current_position_(b);
      if (!attribute(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "entityBody", c)) break;
    }
    exit_section_(b, l, m, true, false, null);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE? ENTITY_KEYWORD WHITESPACE? IDENTIFIER extends? LEFT_CURLY entityBody RIGHT_CURLY
  public static boolean entityDefinition(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entityDefinition")) return false;
    if (!nextTokenIs(b, "<entity definition>", ENTITY_KEYWORD, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, ENTITY_DEFINITION, "<entity definition>");
    r = entityDefinition_0(b, l + 1);
    r = r && consumeToken(b, ENTITY_KEYWORD);
    r = r && entityDefinition_2(b, l + 1);
    r = r && consumeToken(b, IDENTIFIER);
    r = r && entityDefinition_4(b, l + 1);
    r = r && consumeToken(b, LEFT_CURLY);
    r = r && entityBody(b, l + 1);
    r = r && consumeToken(b, RIGHT_CURLY);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean entityDefinition_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entityDefinition_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean entityDefinition_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entityDefinition_2")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // extends?
  private static boolean entityDefinition_4(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "entityDefinition_4")) return false;
    extends_$(b, l + 1);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE? EXTENDS_KEYWORD WHITESPACE? IDENTIFIER
  public static boolean extends_$(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "extends_$")) return false;
    if (!nextTokenIs(b, "<extends $>", EXTENDS_KEYWORD, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, EXTENDS, "<extends $>");
    r = extends_0(b, l + 1);
    r = r && consumeToken(b, EXTENDS_KEYWORD);
    r = r && extends_2(b, l + 1);
    r = r && consumeToken(b, IDENTIFIER);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean extends_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "extends_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean extends_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "extends_2")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  /* ********************************************************** */
  // item*
  static boolean file(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "file")) return false;
    while (true) {
      int c = current_position_(b);
      if (!item(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "file", c)) break;
    }
    return true;
  }

  /* ********************************************************** */
  // case|phase|entity|comment|CRLF
  static boolean item(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "item")) return false;
    boolean r;
    r = case_$(b, l + 1);
    if (!r) r = phase(b, l + 1);
    if (!r) r = entity(b, l + 1);
    if (!r) r = comment(b, l + 1);
    if (!r) r = consumeToken(b, CRLF);
    return r;
  }

  /* ********************************************************** */
  // phaseDefinition | (annotations phaseDefinition)
  public static boolean phase(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phase")) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, PHASE, "<phase>");
    r = phaseDefinition(b, l + 1);
    if (!r) r = phase_1(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // annotations phaseDefinition
  private static boolean phase_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phase_1")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = annotations(b, l + 1);
    r = r && phaseDefinition(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // WHITESPACE?
  public static boolean phaseBody(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phaseBody")) return false;
    Marker m = enter_section_(b, l, _NONE_, PHASE_BODY, "<phase body>");
    consumeToken(b, WHITESPACE);
    exit_section_(b, l, m, true, false, null);
    return true;
  }

  /* ********************************************************** */
  // WHITESPACE? PHASE_KEYWORD WHITESPACE? IDENTIFIER WHITESPACE? LEFT_CURLY phaseBody RIGHT_CURLY
  public static boolean phaseDefinition(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phaseDefinition")) return false;
    if (!nextTokenIs(b, "<phase definition>", PHASE_KEYWORD, WHITESPACE)) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NONE_, PHASE_DEFINITION, "<phase definition>");
    r = phaseDefinition_0(b, l + 1);
    r = r && consumeToken(b, PHASE_KEYWORD);
    r = r && phaseDefinition_2(b, l + 1);
    r = r && consumeToken(b, IDENTIFIER);
    r = r && phaseDefinition_4(b, l + 1);
    r = r && consumeToken(b, LEFT_CURLY);
    r = r && phaseBody(b, l + 1);
    r = r && consumeToken(b, RIGHT_CURLY);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // WHITESPACE?
  private static boolean phaseDefinition_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phaseDefinition_0")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean phaseDefinition_2(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phaseDefinition_2")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

  // WHITESPACE?
  private static boolean phaseDefinition_4(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "phaseDefinition_4")) return false;
    consumeToken(b, WHITESPACE);
    return true;
  }

}
