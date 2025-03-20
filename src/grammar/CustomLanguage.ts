import { StreamLanguage } from "@codemirror/language";
import { styleTags, tags } from "@codemirror/highlight";

export const CustomLanguage = StreamLanguage.define({
  name: "CustomLanguage",
  startState: () => {
    return {
      inComment: false,
      inString: null, // يمكن أن تكون "single" أو "double" أو "template" أو false
      inObjectLiteral: false,
      inArrayLiteral: false,
      inBlock: false,
      inFunction: false,
      inClass: false,
      inImport: false,
      inExport: false,
      inOperator: false,
      inExpression: false,
      inTypeAnnotation: false, //
      inArrowFunction: false, //
      inAsyncFunction: false, //
      parenthesesStack: [],
      indentLevel: 0,
      inMultiLineComment: false,
    };
  },

  token(stream, state) {
    if (state.inMultiLineComment) {
      if (stream.match("*/")) {
        state.inMultiLineComment = false;
        return "comment";
      }
      stream.skipToEnd();
      return "comment";
    }

    if (state.inComment) {
      if (stream.match(/\r?\n/)) {
        state.inComment = false;
        return "comment";
      }
      stream.skipToEnd();
      return "comment";
    }

    if (state.inString) {
      if (state.inString === "template" && stream.match(/`/)) {
        state.inString = null;
        return "stringLiteral";
      } else if (state.inString === "double" && stream.match(/"/)) {
        state.inString = null;
        return "stringLiteral";
      } else if (state.inString === "single" && stream.match(/'/)) {
        state.inString = null;
        return "stringLiteral";
      }
      stream.next();
      return "stringLiteral";
    }

    if (state.inObjectLiteral) {
      if (stream.match("}")) {
        state.inObjectLiteral = false;
        return "brace";
      }
      stream.next();
      return "objectLiteral";
    }

    if (state.inArrayLiteral) {
      if (stream.match("]")) {
        state.inArrayLiteral = false;
        return "squareBracket";
      }
      stream.next();
      return "arrayLiteral";
    }

    if (stream.eatSpace()) return null;

    if (stream.match("//")) {
      state.inComment = true;
      stream.skipToEnd();
      return "comment";
    }

    if (stream.match("/*")) {
      state.inMultiLineComment = true;
      return "comment";
    }

    // التعامل مع القوالب النصية (Template Literals)
    if (stream.match(/`/)) {
      state.inString = "template";
      return "stringLiteral";
    }

    // التعامل مع النصوص (علامات الاقتباس المفردة والمزدوجة)
    if (stream.match(/"/)) {
      state.inString = "double";
      return "stringLiteral";
    }
    if (stream.match(/'/)) {
      state.inString = "single";
      return "stringLiteral";
    }

    // التعامل مع الكلمات المفتاحية
    const keywords = [
      "function",
      "class",
      "interface",
      "enum",
      "namespace",
      "module",
      "type",
      "import",
      "export",
      "let",
      "const",
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "default",
      "try",
      "catch",
      "finally",
      "public",
      "private",
      "protected",
      "readonly",
      "extends",
      "implements",
      "static",
      "async",
      "await",
      "declare",
      "namespace",
      "module",
      "yield", // دعم للدوال المولدة
    ];

    if (stream.match(keywords)) {
      if (stream.current() === "function") state.inFunction = true;
      if (stream.current() === "class") state.inClass = true;
      if (stream.current() === "import") state.inImport = true;
      if (stream.current() === "export") state.inExport = true;
      if (stream.current() === "async") state.inAsyncFunction = true;
      return "keyword";
    }

    // التعامل مع الأنواع البسيطة
    const simpleTypes = [
      "string",
      "number",
      "boolean",
      "any",
      "void",
      "object",
      "array",
      "tuple",
      "unknown",
      "never",
      "null",
      "undefined",
    ];
    if (stream.match(simpleTypes)) {
      return "type";
    }

    // التعامل مع الأنواع العامة (Generics)
    if (stream.match(/[A-Z][\w$]*\s*<[^>]+>/)) {
      return "type";
    }

    // التعامل مع التعليقات التوضيحية للأنواع
    if (stream.match(/:\s*[A-Z][\w$]*/)) {
      state.inTypeAnnotation = true;
      return "typeAnnotation";
    }

    // التعامل مع المعرفات والقيم الحرفية
    if (stream.match(/[\w$]+/)) {
      return "variableName";
    }

    // التعامل مع القيم الحرفية (أرقام ونصوص)
    if (stream.match(/"(?:[^\\"]|\\.)*"/)) {
      return "stringLiteral";
    }
    if (stream.match(/\d+/)) {
      return "number";
    }

    // التعامل مع الرموز الخاصة
    if (stream.match(/[+\-*/=<>!&|]/)) {
      state.inOperator = true;
      return "operator";
    }

    // التعامل مع الأقواس والترميزات
    if (stream.match(/[{}()\[\]]/)) {
      const char = stream.current();
      if (char === "{" || char === "(" || char === "[") {
        state.parenthesesStack.push(char);
        state.indentLevel++;
      } else if (char === "}" || char === ")" || char === "]") {
        state.parenthesesStack.pop();
        state.indentLevel--;
      }
      return "punctuation";
    }

    if (
      stream.match(/function\s+[\w$]+\s*(<[^>]+>)?\s*\([^)]*\)\s*:[^;]+\s*\{/)
    ) {
      state.inFunction = true;
      return "functionDefinition";
    }

    if (stream.match(/\([^)]*\)\s*=>\s*\{/)) {
      state.inArrowFunction = true;
      return "arrowFunction";
    }

    if (stream.match(/async\s+function\s+[\w$]+\s*\([^)]*\)\s*\{/)) {
      state.inAsyncFunction = true;
      return "asyncFunction";
    }

    if (stream.match(/function\s*\([^)]*\)\s*\{/)) {
      return "anonymousFunction";
    }

    if (stream.match(/function\s*\*\s*[\w$]+\s*\([^)]*\)\s*\{/)) {
      return "generatorFunction";
    }

    // التعامل مع ClassDefinition
    if (
      stream.match(
        /class\s+[\w$]+\s*(extends\s+[\w$]+)?\s*(implements\s+([\w$]+,?\s*)+)?\s*\{/
      )
    ) {
      state.inClass = true;
      return "classDefinition";
    }

    // التعامل مع InterfaceDefinition
    if (stream.match(/interface\s+[\w$]+\s*\{[^}]+\}/)) {
      return "interfaceDefinition";
    }

    // التعامل مع EnumDefinition
    if (stream.match(/enum\s+[\w$]+\s*\{[^}]+\}/)) {
      return "enumDefinition";
    }

    // التعامل مع NamespaceDefinition
    if (stream.match(/namespace\s+[\w$]+\s*\{[^}]*\}/)) {
      return "namespaceDefinition";
    }

    // التعامل مع ModuleDefinition
    if (stream.match(/module\s+[\w$]+\s*\{[^}]*\}/)) {
      return "moduleDefinition";
    }

    // التعامل مع TypeAlias
    if (stream.match(/type\s+[\w$]+\s*=[^;]+\s*;/)) {
      return "typeAlias";
    }

    // التعامل مع ImportStatement
    if (stream.match(/import\s+({[^}]+}|[\w$]+)\s+from\s+"[^"]+"/)) {
      state.inImport = true;
      return "importStatement";
    }

    // التعامل مع ExportStatement
    if (stream.match(/export\s+(default\s+)?({[^}]+}|[\w$]+)/)) {
      state.inExport = true;
      return "exportStatement";
    }

    // التعامل مع VariableDeclaration
    if (
      stream.match(/(let|const)?\s*readonly?\s*[\w$]+\s*:[^;]+\s*=[^;]+\s*;/)
    ) {
      return "variableDeclaration";
    }

    // التعامل مع ObjectLiteral
    if (stream.match(/{[^}]*}/)) {
      state.inObjectLiteral = true;
      return "objectLiteral";
    }

    // التعامل مع ArrayLiteral
    if (stream.match(/\[[^\]]*\]/)) {
      state.inArrayLiteral = true;
      return "arrayLiteral";
    }

    // إذا لم يتم التعرف على أي شيء، استمر في القراءة
    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case\b|default\b|\{|\})$/,
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    styleTags: styleTags({
      "function class interface enum namespace module type import export let const if else for while switch case default try catch finally public private protected readonly extends implements static async await declare yield":
        tags.keyword,
      "string number boolean any void object array tuple unknown never null undefined":
        tags.typeName,
      Identifier: tags.variableName,
      Literal: tags.literal,
      Operator: tags.operator,
      Comment: tags.comment,
      "( )": tags.paren,
      "{ }": tags.brace,
      "[ ]": tags.squareBracket,
      ObjectLiteral: tags.propertyName,
      ArrayLiteral: tags.propertyName,
      typeAnnotation: tags.typeName,
      arrowFunction: tags.function(tags.variableName),
      asyncFunction: tags.function(tags.variableName),
      anonymousFunction: tags.function(tags.variableName),
      generatorFunction: tags.function(tags.variableName),
      variableDeclaration: tags.variableName,
      variableName: tags.variableName,
      classDefinition: tags.className,
      namespaceDefinition: tags.namespace,
      importStatement: tags.moduleKeyword,
      exportStatement: tags.moduleKeyword,
      stringLiteral: tags.string,
      number: tags.number,
      operator: tags.operator,
      punctuation: tags.punctuation,
    }),
  },
});
