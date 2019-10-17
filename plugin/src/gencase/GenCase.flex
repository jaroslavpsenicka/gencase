package gencase;

import com.intellij.lexer.FlexLexer;
import com.intellij.psi.tree.IElementType;
import gencase.psi.Types;
import com.intellij.psi.TokenType;

%%

%class GenCaseLexer
%implements FlexLexer
%unicode
%function advance
%type IElementType
%eof{  return;
%eof}

CRLF=\R
WHITE_SPACE=[\ \n\t\f]
ATSIGN="@"
LEFT_BRACKET="("
RIGHT_BRACKET=")"
LEFT_CURLY="{"
RIGHT_CURLY="}"
EQUALS="="
COMMA=","
SEMICOLON=";"

SINGLE_LINE_COMMENT="//"
CHAR=[^\n\f\\]
CASE_KEYWORD="case"
PHASE_KEYWORD="phase"
ENTITY_KEYWORD="entity"
EXTENDS_KEYWORD="extends"
IDENTIFIER=[:jletter:][:jletterdigit:]*
STRING_VALUE=\"[\w ]*\"

%state ANNOTATION
%state COMMENT
%state CASE
%state PHASE
%state ENTITY

%%

<YYINITIAL> {SINGLE_LINE_COMMENT}           { yybegin(COMMENT); return Types.SINGLE_LINE_COMMENT; }
<COMMENT> {CHAR}+                           { yybegin(YYINITIAL); return Types.TEXT; }

<YYINITIAL> {CASE_KEYWORD}                  { yybegin(CASE); return Types.CASE_KEYWORD; }
<YYINITIAL> {PHASE_KEYWORD}                 { yybegin(PHASE); return Types.PHASE_KEYWORD; }
<YYINITIAL> {ENTITY_KEYWORD}                { yybegin(ENTITY); return Types.ENTITY_KEYWORD; }
<ENTITY> {EXTENDS_KEYWORD}                  { yybegin(ENTITY); return Types.EXTENDS_KEYWORD; }

{EQUALS}                                    { return Types.EQUALS; }
{COMMA}                                     { return Types.COMMA; }
{SEMICOLON}                                 { return Types.SEMICOLON; }
{STRING_VALUE}                              { return Types.STRING_VALUE; }
{IDENTIFIER}                                { return Types.IDENTIFIER; }
{ATSIGN}                                    { return Types.ATSIGN; }
{LEFT_BRACKET}                              { return Types.LEFT_BRACKET; }
{RIGHT_BRACKET}                             { return Types.RIGHT_BRACKET; }
{LEFT_CURLY}                                { return Types.LEFT_CURLY; }
{RIGHT_CURLY}                               { yybegin(YYINITIAL); return Types.RIGHT_CURLY; }
({CRLF}|{WHITE_SPACE})+                     { return TokenType.WHITE_SPACE; }

[^]                                         { return TokenType.BAD_CHARACTER; }
