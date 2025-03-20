import { Diagnostic } from "./diagnostics";
import { EditorState } from "@codemirror/state";
import { parse } from "@babel/parser";

const types = [
  "String",
  "Number",
  "Boolean",
  "Any",
  "Void",
  "Object",
  "Array",
  "Tuple",
  "Unknown",
  "Never",
  "Null",
  "Undefined",
];

export function myLanguageLinter(view: EditorState): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc.toString();

  try {
    const ast = parseCodeToAST(doc, diagnostics);
    analyzeAST(ast, diagnostics);
  } catch (error) {
    diagnostics.push({
      from: 0,
      to: doc.length,
      severity: "error",
      message: "Failed to parse the code.",
    });
  }
  return diagnostics;
}

function parseCodeToAST(code: string, diagnostics: Diagnostic[]): any {
  try {
    return parse(code, {
      sourceType: "module",
      plugins: ["typescript"],
    });
  } catch (error) {
    diagnostics.push({
      from: 0,
      to: code.length,
      severity: "error",
      message: error.message,
    });
    return null;
  }
}

const normalizeType = (type: string) => {
  const arrayMatch = type.match(/^Array<(.*)>$/);
  if (arrayMatch) {
    const elementType = normalizeType(arrayMatch[1]);
    return `Array<${elementType}>`;
  }

  const bracketMatch = type.match(/^(.*)\[\]$/);
  if (bracketMatch) {
    const elementType = normalizeType(bracketMatch[1]);
    return `Array<${elementType}>`;
  }

  return types.includes(type) ? type : "unknown";
};

function analyzeAST(ast: any, diagnostics: Diagnostic[]) {
  if (!ast) return;

  const declaredFunctions = new Map<
    string,
    { params: { name: string; type: string }[]; returnType?: string }
  >();
  const declaredVariables = new Map<string, string>();

  ast.program.body.forEach((node: any) => {
    if (node.type === "VariableDeclaration") {
      node.declarations.forEach((declaration: any) => {
        if (declaration.id) {
          const varName = declaration.id.name;
          let varType = "unknown";

          if (declaration.id.typeAnnotation) {
            const typeNode = declaration.id.typeAnnotation.typeAnnotation;

            // دعم Array<T> و T[]
            if (typeNode.type === "TSTypeReference" && typeNode.typeName) {
              varType = normalizeType(typeNode.typeName.name);
            } else if (typeNode.type === "TSArrayType") {
              const elementType = normalizeType(
                typeNode.elementType.typeName.name
              );
              varType = `Array<${elementType}>`;
            }
          }
          if (declaration.init) {
            let assignedType = inferType(declaration.init);

            if (varType === "unknown") {
              varType = assignedType;
            } else if (varType !== assignedType) {
              addDiagnostic(
                diagnostics,
                declaration.start,
                declaration.end,
                varName,
                `Type '${assignedType}' is not assignable to type '${varType}'.`
              );
            }
          } else {
            addDiagnostic(
              diagnostics,
              declaration.start,
              declaration.end,
              varName,
              `Variable '${varName}' has an implicit 'any' type. Consider specifying its type explicitly.`
            );
          }

          declaredVariables.set(varName, varType);
        }
      });
    }

    // تحليل الدوال
    if (node.type === "FunctionDeclaration") {
      const returnType = normalizeType(
        node.returnType?.typeAnnotation?.typeName?.name || "void"
      );

      declaredFunctions.set(node.id.name, {
        params: node.params.map((param: any) => {
          let paramType = declaredVariables.get(param.name) || "unknown";
          if (param.typeAnnotation) {
            const typeNode = param.typeAnnotation.typeAnnotation;

            if (typeNode.type === "TSTypeReference" && typeNode.typeName) {
              paramType = normalizeType(typeNode.typeName.name);
            } else if (typeNode.type === "TSArrayType") {
              const elementType = normalizeType(
                typeNode.elementType.typeName?.name || "unknown"
              );
              paramType = `Array<${elementType}>`;
            }
          }

          return { name: param.name, type: paramType };
        }),
        returnType,
      });

      node.body.body.forEach((stmt: any) => {
        if (stmt.type === "ReturnStatement") {
          const returnExpr = stmt.argument;
          if (returnExpr) {
            const returnTypeActual = inferType(returnExpr);
            if (returnType === "void") {
              addDiagnostic(
                diagnostics,
                stmt.start,
                stmt.end,
                returnTypeActual,
                `Function with return type 'void' should not return a value.`
              );
            } else if (returnTypeActual !== returnType) {
              addDiagnostic(
                diagnostics,
                stmt.start,
                stmt.end,
                returnTypeActual,
                `Return type '${returnTypeActual}' is not assignable to function return type '${returnType}'.`
              );
            }
          }
        }
      });
    }

    // التحقق من استدعاء الدوال
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression"
    ) {
      const funcName = node.expression.callee.name;
      const functionInfo = declaredFunctions.get(funcName);

      if (!functionInfo) {
        addDiagnostic(
          diagnostics,
          node.start,
          node.end,
          funcName,
          `Cannot find name '${funcName}'.(2304)`
        );
      } else {
        const expectedParams = functionInfo.params.length;
        const passedArgs = node.expression.arguments.length;

        if (passedArgs < expectedParams) {
          addDiagnostic(
            diagnostics,
            node.start,
            node.end,
            funcName,
            `Expected ${expectedParams} arguments, but got ${passedArgs}.(2554)`
          );
        } else if (passedArgs > expectedParams) {
          addDiagnostic(
            diagnostics,
            node.start,
            node.end,
            funcName,
            `Expected ${expectedParams} arguments, but got ${passedArgs}. Extra arguments are not allowed.(2554)`
          );
        }

        node.expression.arguments.forEach((arg: any, index: number) => {
          if (index >= functionInfo.params.length) return;

          const expectedType = functionInfo.params[index]?.type || "unknown";
          let argType = inferType(arg);

          if (arg.type === "Identifier" && declaredVariables.has(arg.name)) {
            argType = declaredVariables.get(arg.name) || argType;
          }

          if (
            expectedType.startsWith("Array<") &&
            argType.startsWith("Array<")
          ) {
            const expectedElementType =
              expectedType.match(/^Array<(.*)>$/)?.[1];
            const actualElementType = argType.match(/^Array<(.*)>$/)?.[1];

            if (
              expectedElementType &&
              actualElementType &&
              expectedElementType !== actualElementType
            ) {
              addDiagnostic(
                diagnostics,
                arg.start,
                arg.end,
                argType,
                `Array elements should be of type '${expectedElementType}', but got '${actualElementType}'.`
              );
            }
          } else if (argType !== expectedType) {
            addDiagnostic(
              diagnostics,
              arg.start,
              arg.end,
              argType,
              `Argument of type '${argType}' is not assignable to parameter of type '${expectedType}'.`
            );
          }
        });
      }
    }
  });
}

function inferType(node: any): string {
  if (!node) return "unknown";
  if (node.type === "NumericLiteral") return "Number";
  if (node.type === "StringLiteral") return "String";
  if (node.type === "BooleanLiteral") return "Boolean";
  if (node.type === "ArrayExpression") {
    if (node.elements.length === 0) return "Array<unknown>";

    const inferredTypes = new Set(node.elements.map(inferType));
    if (inferredTypes.size > 1) {
      return "Array<mixed>";
    }
    return `Array<${[...inferredTypes][0]}>`;
  }

  if (node.type === "ObjectExpression") return "Object";
  if (node.type === "Identifier") return "Unknown";
  return "unknown";
}

function addDiagnostic(
  diagnostics: Diagnostic[],
  from: number,
  to: number,
  target: string,
  message: string
) {
  diagnostics.push({ from, to, severity: "error", message });
}

//-----------------------------------------------------------------------------
