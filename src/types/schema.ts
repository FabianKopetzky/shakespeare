//* DIALOGUES
export type DialogueSentence = {
  key: string | number, // crypto random uuid, assigned when created during runtime — shared across languages
  translations: Record<string, string>, // languageCode -> raw markup content for that language

  fields: CustomFields
};

export type DialogueNode = {
  id: string,
  description: string,
  sentences: DialogueSentence[],

  fields: CustomFields
} | undefined;

//* STORY
export type Story = {
  id: string, // created by player, must be unique
  description: string, // internal editor description
  entryNodeId: string | null,
  nodes: string[], // array of all uuids of the nodes in a story

  fields: CustomFields
} | undefined;
//* STORY NODE TYPES

export type AnyStoryNode = StoryNode | BranchNode | ConditionNode | RandomNode | OperationNode | EventNode | SwitchNode; // unison of all node types

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
  event: string | null,
  args: Argument[]
  targetId: string | null // references another node in the story
}

export type SwitchNode = StoryNodeBase & {
    type: "switch";
    switchValue?: string; // name of variable or computed property to switch
    switchArgs?: Argument[];
    cases: SwitchCase[];
  }
export type SwitchCase = {
  id: string | number,
  isDefault: boolean,
  value: string | number | boolean,
  targetId: string | null // refernces another node in the story
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
  condition: Condition | null, // condition that this branch will be rendered

  fields: CustomFields
}

export type RandomBranch = {
  id: string | number, // random uuid of the branch
  weight: number, // weight of this branch
  targetId: string | null, // the dialogue target
}

export type StoryVariable = {
  name: string, // unique identifier
  type: DataType,
  defaultValue: number | string | boolean
}
export type DataType = 'Integer' | 'String' | 'Boolean'

//* CONDITION UTILS
export type ComparisonOperator = '==' | '!=' | '<' | '>' | '<=' | '>='
export type LogicalOperator = 'AND' | 'OR'

// An operand is either a literal value or a reference to another StoryVariable
export type Operand =
  | { kind: 'literal' | 'variable'; value: number | string | boolean }
  | { kind: 'computed'; value: string; args: Argument[] } // value = computed property name

export type Comparison = {
  left: Operand,
  operator: ComparisonOperator,
  right: Operand
}

// Each clause pairs a comparison with the operator that links it to the NEXT clause.
// The last clause in the array has no connector.
export type ConditionClause = {
  comparison: Comparison,
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

export type CustomFieldModel = 'dialogue' | 'dialogue_sentence' | 'branch' | 'story';

export type CustomFieldSchema = {
  name: string,
  label: string,
  type: DataType,
  defaultValue: number | string | boolean,
  model: CustomFieldModel
}
export type CustomFields = {
  data: { name: string, value: number | string | boolean }[]
}

//* EVENTS

export type Parameter = {
  name: string,
  type: DataType
}
export type Event = {
  name: string,
  params: Parameter[]
}
export type Argument = {
  name: string,
  value: number | boolean | string
  kind: 'literal' | 'variable'
}

//* COMPUTED PROPERTIES

// reuse parameters and arguments from events
export type ComputedProperty = {
  name: string,
  params: Parameter[],
  returnType: DataType
}

export type FormMode = 'Create' | 'Read' | 'Update'; // how a dialogue or story node is opened

//* DATA  MODEL
export type Language = {
  code: string,
  display: string,
  icon?: string,
  isDefault: boolean
}
export type TextColor = {
  name: string, // color variable name identifier
  hex: string // hex of the color
}

//* SETTINGS

export type Preferences = {
  unityStreamingAssetsPath: string,
  compileTextColors: boolean,
  warnBeforeDiscarding: boolean,
  warnBeforeClosing: boolean,
  autoSaveProject: boolean,
  showAutoSaveMessages: boolean,
  showMissingTranslations: boolean,
  
  storyGraphPattern: string,
  storyGraphPatternSize: number,
  storyGraphPatternGap: number,
}

//* META
export type MetaData = {
  createdAt: string,
  lastEdited: string,
  version: string
}