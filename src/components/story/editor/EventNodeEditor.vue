<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit event node</p>
        <div class="flex flex-row gap-2">
          <UButton
            color="neutral"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="close">
            <UIcon class="size-12" name="material-symbols:close" />
          </UButton>
          <UButton
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="save">
            <UIcon class="size-12" name="material-symbols:check" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="h-full flex flex-col justify-start items-start gap-4">
        <UFormField
          class="w-full"
          label="Event"
          help="The event that will be invoked by this node.">
          <div class="flex flex-row gap-2 w-full">
            <USelectMenu
              class="w-full flex-1"
              :model-value="eventName"
              @update:model-value="onEventSelect"
              :items="eventOptions"
              value-key="value"
              label-key="label"
              placeholder="Select an event" />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-plus"
              @click="createEventModalOpen = true">
              New
            </UButton>
          </div>
        </UFormField>

        <template v-if="selectedEvent">
          <div
            v-if="selectedEvent.params.length > 0"
            class="flex flex-col gap-3 w-full">
            <span class="text-sm font-medium">Parameters</span>

            <div
              v-for="arg in args"
              :key="arg.name"
              class="bg-elevated p-3 rounded-xl flex flex-col gap-2 w-full">
              <div class="flex flex-row justify-between items-center w-full">
                <span class="font-bold">{{ arg.name }}</span>
                <div>
                  <UButton
                    :color="arg.kind === 'literal' ? 'primary' : 'neutral'"
                    :variant="arg.kind === 'literal' ? 'solid' : 'outline'"
                    @click="setArgKind(arg, 'literal')">
                    Literal
                  </UButton>
                  <UButton
                    :color="arg.kind === 'variable' ? 'primary' : 'neutral'"
                    :variant="arg.kind === 'variable' ? 'solid' : 'outline'"
                    @click="setArgKind(arg, 'variable')">
                    Variable
                  </UButton>
                </div>
              </div>

              <template v-if="arg.kind === 'literal'">
                <USelect
                  v-if="paramType(arg.name) === 'Boolean'"
                  class="w-full"
                  v-model="arg.value"
                  :items="[
                    { label: 'true', value: true },
                    { label: 'false', value: false },
                  ]"
                  value-key="value"
                  label-key="label" />
                <UInput
                  v-else
                  class="w-full"
                  v-model="arg.value"
                  :type="paramType(arg.name) === 'Integer' ? 'number' : 'text'"
                  :icon="typeMeta[paramType(arg.name)!].icon" />
              </template>

              <template v-else>
                <USelectMenu
                  v-if="variableOptionsFor(paramType(arg.name)!).length > 0"
                  class="w-full"
                  v-model="arg.value"
                  :items="variableOptionsFor(paramType(arg.name)!)"
                  value-key="value"
                  label-key="label"
                  placeholder="Select a variable" />
                <span v-else class="text-sm text-error italic">
                  No variables of type "{{
                    typeMeta[paramType(arg.name)!].label
                  }}" available
                </span>
              </template>
            </div>
          </div>
          <span v-else class="text-sm text-muted italic">
            This event does not take any parameters.
          </span>
        </template>
        <span v-else class="text-sm text-muted italic">
          Select an event to configure its parameters.
        </span>
      </div>
    </template>
  </USlideover>
  <EventInput
    v-model:open="createEventModalOpen"
    mode="Create"
    :event="undefined"
    @submit="onEventCreated" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  AnyStoryNode,
  EventNode,
  EventArg,
  Event,
  DataType,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";
import EventInput from "../../forms/EventInput.vue";

const { displayError } = useWidget();
const { storyNodes, storyVariables, events } = useContentStore();
const { typeMeta } = useConditionUtils();

interface Props {
  eventNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });

const node = ref<EventNode>();
const eventName = ref<string | null>(null);
const args = ref<EventArg[]>([]);
const targetId = ref<string | null>(null);

const createEventModalOpen = ref<boolean>(false);

const eventOptions = computed(() =>
  events.map((e) => ({ label: e.name, value: e.name })),
);

const selectedEvent = computed<Event | null>(
  () => events.find((e) => e.name === eventName.value) ?? null,
);

function paramType(argName: string): DataType | undefined {
  return selectedEvent.value?.params.find((p) => p.name === argName)?.type;
}

function variableOptionsFor(type: DataType) {
  return storyVariables
    .filter((v) => v.type === type)
    .map((v) => ({ label: v.name, value: v.name }));
}

function defaultForType(type: DataType): number | string | boolean {
  if (type === "Integer") return 0;
  if (type === "Boolean") return false;
  return "";
}

function buildArgs(
  def: Event | null | undefined,
  existing?: EventArg[],
): EventArg[] {
  if (!def) return [];
  return def.params.map((param) => {
    const found = existing?.find((a) => a.name === param.name);
    if (
      found &&
      (found.kind === "literal" ||
        (found.kind === "variable" &&
          storyVariables.some(
            (v) => v.name === found.value && v.type === param.type,
          )))
    ) {
      return { ...found };
    }
    return {
      name: param.name,
      kind: "literal",
      value: defaultForType(param.type),
    };
  });
}

function onEventSelect(name: string | null) {
  eventName.value = name;
  const def = events.find((e) => e.name === name) ?? null;
  args.value = buildArgs(def);
}

function onEventCreated(newEvent: Event) {
  events.push(newEvent);
  eventName.value = newEvent.name;
  args.value = buildArgs(newEvent);
}

function setArgKind(arg: EventArg, kind: "literal" | "variable") {
  if (arg.kind === kind) return;
  arg.kind = kind;
  const type = paramType(arg.name);
  if (kind === "variable") {
    const opts = type ? variableOptionsFor(type) : [];
    arg.value = opts[0]?.value ?? "";
  } else {
    arg.value = type ? defaultForType(type) : "";
  }
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.eventNodeId];
  if (n?.type === "event") {
    node.value = n;

    eventName.value = n.event ?? null;
    const def = events.find((e) => e.name === n.event) ?? null;
    args.value = buildArgs(def, n.args);
    targetId.value = n.targetId ?? null;
  }
});

function save(): void {
  const targetNode: AnyStoryNode = storyNodes[props.eventNodeId];
  if (!targetNode) {
    displayError(
      `An error occurred: Node "${props.eventNodeId}" does not exist (anymore)`,
    );
    return;
  }

  if (!eventName.value) {
    displayError("No event selected");
    return;
  }

  for (const arg of args.value) {
    const type = paramType(arg.name);
    if (arg.kind === "literal") {
      if (
        type === "Integer" &&
        (arg.value === "" || isNaN(Number(arg.value)))
      ) {
        displayError(`Parameter "${arg.name}" must be a valid number`);
        return;
      }
    } else {
      if (!arg.value || arg.value === "") {
        displayError(`No variable selected for parameter "${arg.name}"`);
        return;
      }
    }
  }

  updateEventNode();
  emit("onsave", props.eventNodeId);
  isOpen.value = false;
}

function close(): void {
  isOpen.value = false;
}

function updateEventNode() {
  const n = storyNodes[props.eventNodeId] as EventNode;
  n.event = eventName.value!;
  n.args = args.value.map((arg) => {
    const type = paramType(arg.name);
    if (arg.kind === "literal" && type === "Integer") {
      return { ...arg, value: Number(arg.value) };
    }
    return { ...arg };
  });
  n.targetId = targetId.value;
}
</script>
