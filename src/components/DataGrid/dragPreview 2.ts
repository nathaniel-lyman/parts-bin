export interface ColumnDragProjection {
  projectedOrder: string[]
  offsets: Record<string, number>
}

export interface ColumnDragPreviewState extends ColumnDragProjection {
  activeId: string
  overId: string
}

export interface ProjectColumnDragInput {
  orderedIds: string[]
  widths: Record<string, number>
  activeId: string
  overId: string
}

export function projectColumnDrag({
  orderedIds,
  widths,
  activeId,
  overId,
}: ProjectColumnDragInput): ColumnDragProjection {
  const activeIndex = orderedIds.indexOf(activeId)
  const overIndex = orderedIds.indexOf(overId)
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return { projectedOrder: [...orderedIds], offsets: {} }
  }

  const projectedOrder = [...orderedIds]
  const [active] = projectedOrder.splice(activeIndex, 1)
  projectedOrder.splice(overIndex, 0, active)

  const activeWidth = widths[activeId] ?? 0
  const offsets: Record<string, number> = {}
  if (activeWidth <= 0) return { projectedOrder, offsets }

  if (activeIndex < overIndex) {
    for (let index = activeIndex + 1; index <= overIndex; index += 1) {
      offsets[orderedIds[index]] = -activeWidth
    }
  } else {
    for (let index = overIndex; index < activeIndex; index += 1) {
      offsets[orderedIds[index]] = activeWidth
    }
  }

  return { projectedOrder, offsets }
}
