//* DIALOGUES
export type DialogueSentence = {
  key: string | number; // crypto random uuid, assigned when created during runtime — shared across languages
  translations: Record<string, string>; // languageCode -> raw markup content for that language
};

export type DialogueNode = {
  id: string;
  description: string;
  sentences: DialogueSentence[];
} | undefined;

//* STORY
export type Story = {
  id: string, // created by player, must be unique
  description: string, // internal editor description
  entryNodeId: string | null,
  nodes: string[] // array of all uuids of the nodes in a story
} | undefined;
//* STORY NODE TYPES

export type AnyStoryNode = StoryNode | BranchNode | ConditionNode | RandomNode | OperationNode | EventNode; // unison of all node types

export type StoryNodeBase = {
  id: string, // random uuid of the node
  type: string,
  position: NodePosition,
}

// default story node, contains a dialogue node
export type StoryNode = StoryNodeBase & {
  type: "story",
  dialogueId: string, // id of the dialogue node to reference
  targetId: string | null // references another node in the story
}

// node where players get prompted choices. contains a list of branches reflecting the available choices of the player
export type BranchNode = StoryNodeBase & {
  type: "branch",
  branches: Branch[] // list of answer possibilities
}

export type RandomNode = StoryNodeBase & {
  type: "random",
  branches: RandomBranch[] // list of random possibilities
}

export type OperationNode = StoryNodeBase & {
  type: "operation",
  operation: Operation | null,
  targetId: string | null // references another node in the story
}

export type EventNode = StoryNodeBase & {
  type: "event",
  targetId: string | null // references another node in the story
}

// a node that contains a condition and has two paths that can emerge from it - a true and false path. The node itself does not contain any dialogue information
export type ConditionNode = StoryNodeBase & {
  type: "condition"
  condition: Condition | null, // condition of the node
  targetIdTrue: string | null, // references another node in the story for the "true" path
  targetIdFalse: string | null // references another node in the story for the "false" path
}
//* STORY UTILS
export type NodePosition = {
  x: number,
  y: number
}
// reflects a choice of the player in a Branch node
export type Branch = {
  id: string | number, // random uuid of the branch
  labels: Record<string, string>, // labels for the different languages for the choice
  targetId: string | null, // the dialogue target
  condition: Condition | null // condition that this branch will be rendered
}

export type RandomBranch = {
  id: string | number, // random uuid of the branch
  chance: number, // chance of this branch activating
  targetId: string | null, // the dialogue target
}

export type StoryVariable = {
  name: string, // unique identifier
  type: StoryVariableType,
  defaultValue: number | string | boolean
}
export type StoryVariableType = 'Integer' | 'String' | 'Boolean'

//* CONDITION UTILS
export type ComparisonOperator = '==' | '!=' | '<' | '>' | '<=' | '>='
export type LogicalOperator = 'AND' | 'OR'

// An operand is either a literal value or a reference to another StoryVariable
export type Operand =
  | { kind: 'literal' | 'variable'; value: number | string | boolean }

export type Comparison = {
  left: Operand
  operator: ComparisonOperator
  right: Operand
}

// Each clause pairs a comparison with the operator that links it to the NEXT clause.
// The last clause in the array has no connector.
export type ConditionClause = {
  comparison: Comparison
  connector?: LogicalOperator
}

export type Condition = ConditionClause[]

//* OPERATION UTILS

export type Operation = {
  variableName: string, // variable to be mutated
  action: 'set' | 'add' | 'subtract', // should only work on fitting data types (add and subtract only for Integer)
  target: OperatonTarget
}
export type OperatonTarget = {
  type: 'literal' | 'variable',
  value: string | number | boolean // if type is variable, this holds the variable name
}

export type FormMode = 'Create' | 'Read' | 'Update'; // how a dialogue or story node is opened

//* DATA  MODEL
export type Language = {
  code: string,
  display: string,
  isDefault: boolean
}
export type TemplatingVariable = {
  name: string, // variable name
  csharpExpression: string, // when exported, this will be inserted into a generated csharp file
  placeholder: string // this will be displayed in the dialogue editor as a reference
}
export type TextColor = {
  name: string, // color variable name identifier
  hex: string // hex of the color
}