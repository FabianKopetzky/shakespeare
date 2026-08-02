import { useContentStore } from "../stores/content";
import type { StoryVariable } from "../types/schema";

export type ContentNode =
  | { type: "text"; value: string }
  | { type: "variable"; name: string }
  | { type: "bold"; children: ContentNode[] }
  | { type: "italic"; children: ContentNode[] }
  | { type: "color"; value: string; children: ContentNode[] };

const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

const { textColors } = useContentStore();

type Token =
  | { kind: "text"; value: string }
  | { kind: "open-b" }
  | { kind: "close-b" }
  | { kind: "open-i" }
  | { kind: "close-i" }
  | { kind: "open-color"; hex: string }
  | { kind: "close-color" }
  | { kind: "variable"; name: string };

const TOKEN_REGEX =
  /(<b>)|(<\/b>)|(<i>)|(<\/i>)|(<color=(#[0-9A-Fa-f]{3,6}|[A-Za-z0-9_]+)>)|(<\/color>)|(\{\{\s*([A-Za-z0-9]*)\s*\}\})/g;

function tokenize(raw: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: "text", value: raw.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ kind: "open-b" });
    else if (match[2]) tokens.push({ kind: "close-b" });
    else if (match[3]) tokens.push({ kind: "open-i" });
    else if (match[4]) tokens.push({ kind: "close-i" });
    else if (match[5]) tokens.push({ kind: "open-color", hex: match[6] });
    else if (match[7]) tokens.push({ kind: "close-color" });
    else if (match[8]) tokens.push({ kind: "variable", name: match[9] });

    lastIndex = TOKEN_REGEX.lastIndex;
  }
  if (lastIndex < raw.length) {
    tokens.push({ kind: "text", value: raw.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Parses raw dialogue markup into a tree. Tolerant of malformed markup —
 * unmatched closing tags are dropped rather than throwing, so rendering
 * never crashes on bad data. Use `validateContent` to surface problems
 * to the user before saving.
 */
export function parseContent(raw: string): ContentNode[] {
  const tokens = tokenize(raw ?? "");
  const root: ContentNode[] = [];
  const stack: { node: Extract<ContentNode, { children: ContentNode[] }>; closeKind: string }[] =
    [];

  function currentChildren(): ContentNode[] {
    return stack.length > 0 ? stack[stack.length - 1].node.children : root;
  }

  for (const token of tokens) {
    switch (token.kind) {
      case "text":
        if (token.value.length > 0) currentChildren().push({ type: "text", value: token.value });
        break;
      case "open-b": {
        const node: ContentNode = { type: "bold", children: [] };
        currentChildren().push(node);
        stack.push({ node: node as any, closeKind: "close-b" });
        break;
      }
      case "open-i": {
        const node: ContentNode = { type: "italic", children: [] };
        currentChildren().push(node);
        stack.push({ node: node as any, closeKind: "close-i" });
        break;
      }
      case "open-color": {
        const node: ContentNode = { type: "color", value: token.hex, children: [] };
        currentChildren().push(node);
        stack.push({ node: node as any, closeKind: "close-color" });
        break;
      }
      case "close-b":
      case "close-i":
      case "close-color": {
        const top = stack[stack.length - 1];
        if (top && top.closeKind === token.kind) stack.pop();
        // Unmatched close tags are silently dropped here; validateContent
        // reports them as errors separately.
        break;
      }
      case "variable":
        currentChildren().push({ type: "variable", name: token.name });
        break;
    }
  }

  return root;
}

export function serializeContent(nodes: ContentNode[]): string {
  return nodes.map(serializeNode).join("");
}

function serializeNode(node: ContentNode): string {
  switch (node.type) {
    case "text":
      return node.value;
    case "variable":
      return `{{ ${node.name} }}`;
    case "bold":
      return `<b>${serializeContent(node.children)}</b>`;
    case "italic":
      return `<i>${serializeContent(node.children)}</i>`;
    case "color":
      return `<color=${node.value}>${serializeContent(node.children)}</color>`;
  }
}

/**
 * Structural + semantic validation. Returns human-readable error messages;
 * an empty array means the content is safe to save.
 */
export function validateContent(raw: string, variables: StoryVariable[]): string[] {
  const errors: string[] = [];
  const knownNames = new Set(variables.map((v) => v.name));
  const tokens = tokenize(raw ?? "");
  const stack: string[] = [];

  for (const token of tokens) {
    switch (token.kind) {
      case "open-b":
        stack.push("b");
        break;
      case "open-i":
        stack.push("i");
        break;
      case "open-color":
        if (!HEX_PATTERN.test(token.hex) && !textColors.find(c => c.name === token.hex)) errors.push(`Invalid color value "${token.hex}".`);
        stack.push("color");
        break;
      case "close-b":
        if (stack.pop() !== "b") errors.push("Found a </b> without a matching <b>.");
        break;
      case "close-i":
        if (stack.pop() !== "i") errors.push("Found a </i> without a matching <i>.");
        break;
      case "close-color":
        if (stack.pop() !== "color")
          errors.push("Found a </color> without a matching <color=...>.");
        break;
      case "variable":
        if (!token.name) errors.push("Found an empty variable reference {{ }}.");
        else if (!knownNames.has(token.name))
          errors.push(`Unknown templating variable "${token.name}".`);
        break;
    }
  }

  if (stack.length > 0) errors.push(`Unclosed tag(s): ${stack.join(", ")}.`);

  // The tokenizer only matches a *complete* {{ name }} pair — a dangling,
  // never-closed "{{" silently becomes plain text and needs its own check.
  if (/\{\{(?!\s*[A-Za-z0-9]*\s*\}\})/.test(raw ?? "")) {
    errors.push('Found an unclosed "{{" variable reference.');
  }

  return errors;
}

export function placeholderForVariable(name: string, variables: StoryVariable[]): string {
  const variable = variables.find((v) => v.name === name);
  return variable ? variable.name : `{{ ${name} }}`;
}

/** Strips all markup down to plain text (previews, search indexing, etc). */
export function contentToPlainText(raw: string, variables: StoryVariable[]): string {
  function walk(nodes: ContentNode[]): string {
    return nodes
      .map((n) => {
        if (n.type === "text") return n.value;
        if (n.type === "variable") return placeholderForVariable(n.name, variables);
        return walk(n.children);
      })
      .join("");
  }
  return walk(parseContent(raw));
}