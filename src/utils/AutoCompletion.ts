import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

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
  "yield",
  "return",
  "true",
  "false",
];

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

const builtInFunctions = [
  "console.log",
  "Math.abs",
  "Math.floor",
  "Math.random",
  "JSON.stringify",
  "JSON.parse",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
];

function customCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;

  let options = [
    ...keywords.map((kw) => ({ label: kw, type: "keyword" })),
    ...types.map((tp) => ({ label: tp, type: "type" })),
    ...builtInFunctions.map((fn) => ({ label: fn, type: "function" })),
  ];

  return {
    from: word.from,
    options,
  };
}

export const customAutocomplete = autocompletion({
  override: [customCompletions],
});
