import type {ReactNode} from "react";

import {
    type Active,
    closestCenter,
    DndContext,
    type DragOverEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Icon} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

export function SortableElements({
    ids,
    onMove,
    children,
}: {
    ids: string[];
    onMove: (from: number, to: number) => void;
    children: ReactNode;
}) {
    const {t} = useTranslate("form_editor");
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 4}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const labelOf = ({data}: Active) =>
        typeof data.current?.label === "string" ? data.current.label : "";
    const announcePosition = ({active, over}: Pick<DragOverEvent, "active" | "over">) => {
        const position = over ? ids.indexOf(String(over.id)) + 1 : 0;
        return position
            ? t("drag_position", {label: labelOf(active), position, total: ids.length})
            : undefined;
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            accessibility={{
                announcements: {
                    onDragStart: ({active}) => t("drag_start", {label: labelOf(active)}),
                    onDragOver: announcePosition,
                    onDragEnd: (event) => announcePosition(event) ?? t("drag_cancel"),
                    onDragCancel: () => t("drag_cancel"),
                },
            }}
            onDragEnd={({active, over}) => {
                if (!over || over.id === active.id) return;
                const from = ids.indexOf(String(active.id));
                const to = ids.indexOf(String(over.id));
                if (from >= 0 && to >= 0) onMove(from, to);
            }}
        >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </DndContext>
    );
}

export function SortableElement({
    id,
    label,
    disabled,
    children,
}: {
    id: string;
    label: string;
    disabled?: boolean;
    children: (handle: ReactNode) => ReactNode;
}) {
    const {t} = useTranslate("form_editor");
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id, disabled, data: {label}});

    return (
        <div
            ref={setNodeRef}
            style={{transform: CSS.Translate.toString(transform), transition}}
            className={isDragging ? "opacity-60" : undefined}
        >
            {children(
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    className="cursor-grab touch-none rounded-xs p-1 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none disabled:cursor-default disabled:opacity-40"
                    {...attributes}
                    {...listeners}
                    disabled={disabled}
                    aria-label={t("drag_handle", {label})}
                >
                    <Icon name="chevron-grabber-vertical-line" decorative />
                </button>,
            )}
        </div>
    );
}
