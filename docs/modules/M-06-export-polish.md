# Module M-06: Export & Polish

## Overview

Adds CSV export functionality and overall UX polish: advanced filtering, improved empty states, loading skeletons, error handling, accessibility improvements, and general UI refinements based on user feedback.

## Dependencies

### Required (must complete first)
- M-02: Action CRUD - Provides: actions API, actions table
- M-04: PM Features - Provides: filtering, PM role (recommended but not strictly required)

### Optional (nice to have)
- M-03: Delay Management - For including delay data in exports
- M-05: AI & Insights - For including category in exports

## Scope

### Files to Create
- `src/app/api/actions/export/route.ts` - CSV export API
- `src/lib/export/csv.ts` - CSV generation utilities
- `src/components/actions/ExportButton.tsx` - Export trigger button
- `src/components/ui/Skeleton.tsx` - Loading skeleton component
- `src/components/ui/EmptyState.tsx` - Configurable empty state
- `src/components/ui/ErrorBoundary.tsx` - Error boundary wrapper
- `src/components/ui/Toast.tsx` - Toast notification system
- `src/components/ui/LoadingSpinner.tsx` - Consistent loading indicator
- `src/components/a11y/SkipLink.tsx` - Skip to main content
- `src/components/a11y/FocusTrap.tsx` - Modal focus management

### Files to Modify
- `src/components/actions/ActionsTable.tsx` - Add export button, improve loading/empty states
- `src/components/actions/ActionForm.tsx` - Improve validation UX
- `src/app/actions/page.tsx` - Add export button to header
- `src/app/layout.tsx` - Add Toast provider, ErrorBoundary
- Various components - Accessibility improvements

### Out of Scope for This Module
- New features beyond PRD scope
- Mobile responsive design (deferred)
- Dark mode (future)

## Inputs

This module receives:
- Actions data from M-02
- Filter state from M-04
- User role from M-01

## Outputs

This module produces:
- CSV export of actions (respecting filters and permissions)
- Improved loading states throughout app
- Better error handling and user feedback
- Accessibility compliance (WCAG 2.1 AA)
- Polished UI interactions

## Functional Requirements

From PRD, this module implements:
- FR-008: CSV Export
- US-012: User Exports Actions to CSV
- NFR-003: Accessibility requirements

## Technical Specifications

### CSV Export API

```typescript
// GET /api/actions/export - Export actions to CSV
Query params:
  - (same as GET /api/actions - all filters apply)
Response:
  - 200: text/csv file download
  - Content-Disposition: attachment; filename="misekai-actions-YYYY-MM-DD.csv"

// CSV Columns:
// ID, Created Date, Description, Owner, Due Date, Status, Delay Reason, Delay Category, Completed Date, Client Visible, Notes

// Business Rules:
// - Team member: exports own actions only
// - PM: exports all (or filtered subset)
// - Dates formatted: YYYY-MM-DD
// - Empty fields: empty string (not "null")
// - UTF-8 encoding with BOM for Excel compatibility
```

### CSV Generation

```typescript
import { stringify } from 'csv-stringify/sync';

const CSV_COLUMNS = [
  { key: 'id', header: 'ID' },
  { key: 'created_at', header: 'Created Date' },
  { key: 'description', header: 'Description' },
  { key: 'owner_name', header: 'Owner' },
  { key: 'due_date', header: 'Due Date' },
  { key: 'status', header: 'Status' },
  { key: 'delay_reason', header: 'Delay Reason' },
  { key: 'delay_category', header: 'Delay Category' },
  { key: 'completed_at', header: 'Completed Date' },
  { key: 'client_visible', header: 'Client Visible' },
  { key: 'notes', header: 'Notes' },
];

function generateCSV(actions: ActionWithDetails[]): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const data = actions.map(action => ({
    id: action.id,
    created_at: formatDate(action.created_at),
    description: action.description,
    owner_name: action.owner?.full_name || '',
    due_date: formatDate(action.due_date),
    status: action.status,
    delay_reason: action.current_delay_reason?.reason || '',
    delay_category: action.current_delay_reason?.category || '',
    completed_at: action.completed_at ? formatDate(action.completed_at) : '',
    client_visible: action.client_visible ? 'Yes' : 'No',
    notes: action.notes || '',
  }));

  return BOM + stringify(data, {
    header: true,
    columns: CSV_COLUMNS,
  });
}
```

### Loading States

```typescript
// Skeleton patterns for different components
const SkeletonTable = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
    ))}
  </div>
);

// Use React Suspense with fallbacks where possible
<Suspense fallback={<SkeletonTable />}>
  <ActionsTable />
</Suspense>
```

### Error Handling

```typescript
// Toast notification types
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Global error boundary
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// API error handling
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.code, error.message, error.fields);
  }
}
```

### Accessibility Requirements

```typescript
// WCAG 2.1 AA Checklist:
// - Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
// - Focus indicators: visible on all interactive elements
// - Keyboard navigation: all interactions accessible via keyboard
// - Screen reader support: ARIA labels on all controls
// - Skip link: "Skip to main content" at top of page
// - Form labels: all inputs have associated labels
// - Error announcements: errors announced to screen readers

// Example: Skip link
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-2"
  >
    Skip to main content
  </a>
);

// Example: Focus trap for modals
const FocusTrap = ({ children, isOpen }) => {
  // Trap focus within modal when open
  // Return focus to trigger when closed
};
```

### UI Polish Items

```typescript
// Polish checklist:
// 1. Loading skeletons for all data-loading components
// 2. Empty states with illustrations and CTAs
// 3. Error states with retry buttons
// 4. Toast notifications for success/error feedback
// 5. Form validation with inline errors
// 6. Consistent spacing and typography
// 7. Hover and active states on all interactive elements
// 8. Transitions and animations (subtle, 150-300ms)
// 9. Responsive padding/margins
// 10. Consistent date formatting throughout
```

## Acceptance Criteria

All must pass for module completion:

- [ ] "Export CSV" button visible on actions list
- [ ] Team member export contains only their actions
- [ ] PM export contains all actions (or filtered set)
- [ ] Export respects current filters
- [ ] CSV filename includes current date
- [ ] CSV opens correctly in Excel (UTF-8 BOM)
- [ ] All data columns present and correctly formatted
- [ ] Empty fields show as empty (not "null")
- [ ] Loading skeletons show during data fetch
- [ ] Empty state shows when no actions
- [ ] Filtered empty state shows "No matches" with clear filters option
- [ ] Error states show with retry button
- [ ] Toast notifications work for success/error
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on all form controls
- [ ] Skip link present and functional
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] All unit tests pass
- [ ] Accessibility audit passes (axe-core)

## Verification

### Unit Tests Required
- [ ] CSV generation produces valid format
- [ ] BOM prepended for Excel compatibility
- [ ] Date formatting consistent
- [ ] Empty values handled correctly
- [ ] Export respects user role permissions

### Integration Tests Required
- [ ] Export API returns CSV with correct headers
- [ ] Filters applied to export correctly
- [ ] Team member cannot export others' actions
- [ ] Large export (1000+ rows) completes within 5s

### Manual Verification
- [ ] Export button triggers download
- [ ] CSV opens in Excel without encoding issues
- [ ] Filtered export matches UI filter state
- [ ] Loading states appear during fetch
- [ ] Error states show on network failure
- [ ] Toast appears on successful operations
- [ ] Tab navigation works through all interactive elements
- [ ] Screen reader announces form errors

### Accessibility Testing
- [ ] Run axe-core on all pages
- [ ] Test with keyboard only
- [ ] Test with VoiceOver/NVDA
- [ ] Verify color contrast with tool
- [ ] Check focus management in modals

## Estimated Effort

- **Complexity**: S (Small)
- **Estimated Effort**: 1 day
- **Risk Level**: Low

## Implementation Notes

1. **CSV Library**: Use `csv-stringify` for reliable CSV generation. Include in dependencies.

2. **BOM for Excel**: Critical for Excel to recognize UTF-8. Always prepend `\uFEFF`.

3. **Streaming for Large Exports**: For very large exports, consider streaming the response. For <1000 rows, in-memory is fine.

4. **Download Trigger**: Use `Content-Disposition: attachment` header. Browser handles download.

5. **Toast Library**: Consider react-hot-toast or sonner for toast notifications.

6. **Accessibility Testing**: Use axe-core in tests, eslint-plugin-jsx-a11y in development.

7. **Focus Management**: Use react-focus-lock or similar for modal focus trapping.

8. **Animation Library**: Consider Framer Motion for consistent, accessible animations.

## Open Questions

- [ ] Include delay history in export or just current? (Recommendation: Just current for simplicity)
- [ ] Max export size limit? (Recommendation: 1000 rows, with pagination for larger)
- [ ] Toast library preference? (Recommendation: sonner for simplicity)
