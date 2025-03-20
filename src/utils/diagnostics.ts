export type Severity = "hint" | "info" | "warning" | "error";

export interface Diagnostic {
  from: number;
  to: number;
  severity: Severity;
  message: string;
}
