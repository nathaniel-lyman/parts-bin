import { createElement, type ReactNode } from 'react'
import {
  BubbleMapDemo,
  CheckboxDemo,
  ComboboxDemo,
  CommandPaletteDemo,
  DateRangePickerDemo,
  DrawerDemo,
  DropzoneDemo,
  FacetedFilterDemo,
  FlowMapDemo,
  InlineAlertDemo,
  PaginationDemo,
  RadioGroupDemo,
  SegmentedControlDemo,
  SpinnerDemo,
  StepperDemo,
  SwitchDemo,
  TableDemo,
  AccordionDemo,
  ProgressDemo,
  TagDemo,
  MultiSelectDemo,
  BannerDemo,
  ContextMenuDemo,
  SliderDemo,
  KbdDemo,
} from './demos'

/**
 * Live interactive demos keyed by the EXACT CATALOG component name. Each value is a
 * self-contained element whose component owns its own state. Plain .ts (no JSX) so the
 * file defines no components — it only maps names to `createElement(...)` — which keeps
 * react-refresh/only-export-components happy on the components-only `demos.tsx`.
 */
export const demos: Partial<Record<string, ReactNode>> = {
  CommandPalette: createElement(CommandPaletteDemo),
  DateRangePicker: createElement(DateRangePickerDemo),
  FacetedFilter: createElement(FacetedFilterDemo),
  Combobox: createElement(ComboboxDemo),
  RadioGroup: createElement(RadioGroupDemo),
  Checkbox: createElement(CheckboxDemo),
  Switch: createElement(SwitchDemo),
  SegmentedControl: createElement(SegmentedControlDemo),
  InlineAlert: createElement(InlineAlertDemo),
  Drawer: createElement(DrawerDemo),
  Spinner: createElement(SpinnerDemo),
  Pagination: createElement(PaginationDemo),
  Stepper: createElement(StepperDemo),
  Dropzone: createElement(DropzoneDemo),
  BubbleMap: createElement(BubbleMapDemo),
  FlowMap: createElement(FlowMapDemo),
  Table: createElement(TableDemo),
  Accordion: createElement(AccordionDemo),
  Progress: createElement(ProgressDemo),
  Tag: createElement(TagDemo),
  MultiSelect: createElement(MultiSelectDemo),
  Banner: createElement(BannerDemo),
  ContextMenu: createElement(ContextMenuDemo),
  Slider: createElement(SliderDemo),
  Kbd: createElement(KbdDemo),
}
