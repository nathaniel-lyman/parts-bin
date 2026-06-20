import { CommandPalette } from 'parts-bin'

export function Open() {
  return (
    <CommandPalette
      defaultOpen
      trigger={null}
      placeholder="Search accounts and commands"
      groups={[
        {
          id: 'accounts',
          label: 'Accounts',
          items: [
            { id: 'northwind', label: 'Northwind Logistics', description: 'Mid-Market · $1,840 MRR' },
            { id: 'acme', label: 'Acme Robotics', description: 'Enterprise · $9,200 MRR' },
            { id: 'lumen', label: 'Lumen Studio', description: 'SMB · $420 MRR' },
          ],
        },
        {
          id: 'actions',
          label: 'Actions',
          items: [
            { id: 'new', label: 'New account', shortcut: 'N' },
            { id: 'export', label: 'Export current view', shortcut: 'Mod E' },
            { id: 'theme', label: 'Toggle dark mode', shortcut: 'Mod J' },
          ],
        },
      ]}
    />
  )
}
