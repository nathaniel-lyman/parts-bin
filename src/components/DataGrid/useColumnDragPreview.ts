import { useState } from 'react'
import type { DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { isMovableColumnId } from './normalize'
import { projectColumnDrag, type ColumnDragPreviewState } from './dragPreview'
import type { GridAction } from './types'

export interface ColumnDragHandlers {
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragMove: (event: DragMoveEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onDragCancel: () => void
}

export interface UseColumnDragPreviewArgs {
  /** Reorderable column ids in visible order — the drag-projection domain. */
  orderedMovableIds: string[]
  /** Rendered column widths by id, used to project sibling offsets during a drag. */
  columnWidths: Record<string, number>
  dispatch: (action: GridAction) => void
}

export interface UseColumnDragPreviewResult extends ColumnDragHandlers {
  dragPreview: ColumnDragPreviewState | null
}

/**
 * Owns the live column-reorder preview: as a header is dragged, it projects where the
 * neighbouring columns slide to (via {@link projectColumnDrag}) and commits a REORDER_COLUMN
 * on drop. Extracted from the DataGrid orchestrator; behaviour is identical.
 */
export function useColumnDragPreview({
  orderedMovableIds,
  columnWidths,
  dispatch,
}: UseColumnDragPreviewArgs): UseColumnDragPreviewResult {
  const [dragPreview, setDragPreview] = useState<ColumnDragPreviewState | null>(null)

  const updateDragPreview = (activeId: string, overId: string) => {
    if (!isMovableColumnId(activeId)) {
      setDragPreview(null)
      return
    }
    const effectiveOverId = isMovableColumnId(overId) ? overId : activeId
    const projection = projectColumnDrag({
      orderedIds: orderedMovableIds,
      widths: columnWidths,
      activeId,
      overId: effectiveOverId,
    })
    setDragPreview({ activeId, overId: effectiveOverId, ...projection })
  }

  return {
    dragPreview,
    onDragStart: (event: DragStartEvent) => {
      const activeId = String(event.active.id)
      updateDragPreview(activeId, activeId)
    },
    onDragOver: (event: DragOverEvent) => {
      updateDragPreview(String(event.active.id), event.over ? String(event.over.id) : String(event.active.id))
    },
    onDragMove: (event: DragMoveEvent) => {
      if (!dragPreview) updateDragPreview(String(event.active.id), String(event.active.id))
    },
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event
      setDragPreview(null)
      if (over) dispatch({ type: 'REORDER_COLUMN', activeId: String(active.id), overId: String(over.id) })
    },
    onDragCancel: () => setDragPreview(null),
  }
}
