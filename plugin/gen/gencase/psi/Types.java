// This is a generated file. Not intended for manual editing.
package gencase.psi;

import com.intellij.psi.tree.IElementType;
import com.intellij.psi.PsiElement;
import com.intellij.lang.ASTNode;
import gencase.psi.impl.*;

public interface Types {

  IElementType ANNOTATION = new GenCaseElementType("ANNOTATION");
  IElementType ANNOTATIONS = new GenCaseElementType("ANNOTATIONS");
  IElementType ANNOTATION_PARAM = new GenCaseElementType("ANNOTATION_PARAM");
  IElementType ANNOTATION_PARAMS = new GenCaseElementType("ANNOTATION_PARAMS");
  IElementType ATTRIBUTE = new GenCaseElementType("ATTRIBUTE");
  IElementType ATTRIBUTE_DEFINITION = new GenCaseElementType("ATTRIBUTE_DEFINITION");
  IElementType CASE = new GenCaseElementType("CASE");
  IElementType CASE_BODY = new GenCaseElementType("CASE_BODY");
  IElementType CASE_DEFINITION = new GenCaseElementType("CASE_DEFINITION");
  IElementType COMMENT = new GenCaseElementType("COMMENT");
  IElementType ENTITY = new GenCaseElementType("ENTITY");
  IElementType ENTITY_BODY = new GenCaseElementType("ENTITY_BODY");
  IElementType ENTITY_DEFINITION = new GenCaseElementType("ENTITY_DEFINITION");
  IElementType EXTENDS = new GenCaseElementType("EXTENDS");
  IElementType PHASE = new GenCaseElementType("PHASE");
  IElementType PHASE_BODY = new GenCaseElementType("PHASE_BODY");
  IElementType PHASE_DEFINITION = new GenCaseElementType("PHASE_DEFINITION");

  IElementType ATSIGN = new GenCaseTokenType("ATSIGN");
  IElementType CASE_KEYWORD = new GenCaseTokenType("CASE_KEYWORD");
  IElementType COMMA = new GenCaseTokenType("COMMA");
  IElementType CRLF = new GenCaseTokenType("CRLF");
  IElementType ENTITY_KEYWORD = new GenCaseTokenType("ENTITY_KEYWORD");
  IElementType EQUALS = new GenCaseTokenType("EQUALS");
  IElementType EXTENDS_KEYWORD = new GenCaseTokenType("EXTENDS_KEYWORD");
  IElementType IDENTIFIER = new GenCaseTokenType("IDENTIFIER");
  IElementType LEFT_BRACKET = new GenCaseTokenType("LEFT_BRACKET");
  IElementType LEFT_CURLY = new GenCaseTokenType("LEFT_CURLY");
  IElementType PHASE_KEYWORD = new GenCaseTokenType("PHASE_KEYWORD");
  IElementType RIGHT_BRACKET = new GenCaseTokenType("RIGHT_BRACKET");
  IElementType RIGHT_CURLY = new GenCaseTokenType("RIGHT_CURLY");
  IElementType SEMICOLON = new GenCaseTokenType("SEMICOLON");
  IElementType SINGLE_LINE_COMMENT = new GenCaseTokenType("SINGLE_LINE_COMMENT");
  IElementType STRING_VALUE = new GenCaseTokenType("STRING_VALUE");
  IElementType TEXT = new GenCaseTokenType("TEXT");
  IElementType WHITESPACE = new GenCaseTokenType("WHITESPACE");

  class Factory {
    public static PsiElement createElement(ASTNode node) {
      IElementType type = node.getElementType();
      if (type == ANNOTATION) {
        return new GenCaseAnnotationImpl(node);
      }
      else if (type == ANNOTATIONS) {
        return new GenCaseAnnotationsImpl(node);
      }
      else if (type == ANNOTATION_PARAM) {
        return new GenCaseAnnotationParamImpl(node);
      }
      else if (type == ANNOTATION_PARAMS) {
        return new GenCaseAnnotationParamsImpl(node);
      }
      else if (type == ATTRIBUTE) {
        return new GenCaseAttributeImpl(node);
      }
      else if (type == ATTRIBUTE_DEFINITION) {
        return new GenCaseAttributeDefinitionImpl(node);
      }
      else if (type == CASE) {
        return new GenCaseCaseImpl(node);
      }
      else if (type == CASE_BODY) {
        return new GenCaseCaseBodyImpl(node);
      }
      else if (type == CASE_DEFINITION) {
        return new GenCaseCaseDefinitionImpl(node);
      }
      else if (type == COMMENT) {
        return new GenCaseCommentImpl(node);
      }
      else if (type == ENTITY) {
        return new GenCaseEntityImpl(node);
      }
      else if (type == ENTITY_BODY) {
        return new GenCaseEntityBodyImpl(node);
      }
      else if (type == ENTITY_DEFINITION) {
        return new GenCaseEntityDefinitionImpl(node);
      }
      else if (type == EXTENDS) {
        return new GenCaseExtendsImpl(node);
      }
      else if (type == PHASE) {
        return new GenCasePhaseImpl(node);
      }
      else if (type == PHASE_BODY) {
        return new GenCasePhaseBodyImpl(node);
      }
      else if (type == PHASE_DEFINITION) {
        return new GenCasePhaseDefinitionImpl(node);
      }
      throw new AssertionError("Unknown element type: " + type);
    }
  }
}
