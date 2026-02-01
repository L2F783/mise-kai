# Module M-05: AI & Insights

## Overview

Adds intelligent features: automatic categorization of delay reasons using AI or rules-based matching, the 5 Whys analysis flow for root cause investigation, and the coaching insights dashboard showing patterns in team delays.

## Dependencies

### Required (must complete first)
- M-01: Foundation & Auth - Provides: five_whys tables, profiles
- M-02: Action CRUD - Provides: actions API
- M-03: Delay Management - Provides: delay_reasons table and flow
- M-04: PM Features - Provides: weekly review mode, PM role checks

### Optional (nice to have)
- None

## Scope

### Files to Create
- `src/app/insights/page.tsx` - Coaching insights dashboard
- `src/app/api/insights/route.ts` - Insights aggregation API
- `src/app/api/actions/[id]/five-whys/route.ts` - 5 Whys API
- `src/app/api/delay-reasons/[id]/category/route.ts` - Category override API
- `src/components/fiveWhys/FiveWhysModal.tsx` - 5 Whys guided flow
- `src/components/fiveWhys/WhyStep.tsx` - Individual why step
- `src/components/fiveWhys/AnalysisHistory.tsx` - Previous analyses
- `src/components/insights/TopCategories.tsx` - Category breakdown chart
- `src/components/insights/TrendIndicator.tsx` - Up/down trend display
- `src/components/insights/RecurringIssues.tsx` - Pattern detection
- `src/components/insights/TeamHealthScore.tsx` - Health gauge
- `src/components/insights/DrillDown.tsx` - Category drill-down view
- `src/lib/ai/categorize.ts` - Categorization logic (AI or rules)
- `src/lib/ai/rules.ts` - Rules-based categorization fallback
- `src/lib/insights/aggregation.ts` - Insights calculation functions
- `src/hooks/useInsights.ts` - Insights data hook

### Files to Modify
- `src/components/review/ReviewCard.tsx` - Add "Start 5 Whys" button
- `src/components/actions/ActionRow.tsx` - Show category badge
- `src/app/api/actions/[id]/status/route.ts` - Trigger categorization on delay

### Out of Scope for This Module
- CSV export (M-06)
- Email notifications on insights (Future)
- Slack integration (Phase 2)

## Inputs

This module receives:
- Delay reasons from M-03
- Actions data from M-02
- PM user context from M-04

## Outputs

This module produces:
- Auto-categorized delay reasons
- Category confidence scores
- Low-confidence review queue for PM
- 5 Whys analysis storage and retrieval
- Coaching insights with trends
- Recurring issue detection

## Functional Requirements

From PRD, this module implements:
- FR-005: 5 Whys Analysis Storage
- FR-006: AI Delay Categorization
- FR-007: Coaching Insights Aggregation
- US-009: PM Conducts 5 Whys Analysis
- US-010: System Categorizes Delay Reasons
- US-011: PM Views Coaching Insights

## Technical Specifications

### API Endpoints

```typescript
// POST /api/actions/:id/five-whys - Create 5 Whys analysis (PM only)
Request:
  - whys: [{ level: 1-5, response: string (20-500 chars) }]
  - root_cause_identified: boolean
Response:
  - 201: { data: FiveWhysAnalysis }
  - 400: { error: "At least one why is required" }
  - 403: { error: "Only PM can conduct 5 Whys analysis" }
  - 404: { error: "Action not found" }

// GET /api/actions/:id/five-whys - Get 5 Whys history
Response:
  - 200: { data: FiveWhysAnalysis[] }

// PATCH /api/delay-reasons/:id/category - Override category (PM only)
Request:
  - category: 'people' | 'process' | 'technical' | 'capacity' | 'external' | 'other'
Response:
  - 200: { data: DelayReason }
  - 403: { error: "Only PM can override categories" }

// GET /api/insights - Get coaching insights
Query params:
  - date_from?: string (ISO date, default: 30 days ago)
  - date_to?: string (ISO date, default: today)
  - owner_id?: string (optional, for per-person insights)
Response:
  - 200: {
      data: {
        top_categories: [{ category, count, percentage, trend }],
        recurring_root_causes: [{ pattern, count, action_ids }],
        team_health_score: number (0-100),
        low_confidence_count: number
      }
    }

// GET /api/insights/drill-down - Get actions by category
Query params:
  - category: string (required)
  - date_from?: string
  - date_to?: string
Response:
  - 200: { data: Action[] }
```

### Delay Categories

```typescript
type DelayCategory =
  | 'people'      // waiting_on_others, handoff_delay, availability
  | 'process'     // unclear_requirements, approval_blocked, dependencies
  | 'technical'   // bug_found, complexity_underestimated, technical_debt
  | 'capacity'    // competing_priorities, time_constraint, resource_shortage
  | 'external'    // vendor_delay, customer_dependency, third_party
  | 'other';      // uncategorized
```

### Categorization Logic

```typescript
// Option A: Rules-based (MVP)
const categoryRules: Record<string, string[]> = {
  people: ['waiting on', 'blocked by', 'need from', 'handoff', 'pto', 'vacation', 'out of office'],
  process: ['unclear', 'requirements', 'approval', 'depends on', 'blocked', 'waiting for sign-off'],
  technical: ['bug', 'regression', 'complex', 'refactor', 'technical debt', 'unexpected'],
  capacity: ['priority', 'urgent', 'time', 'bandwidth', 'competing', 'overloaded'],
  external: ['vendor', 'customer', 'third party', 'api', 'external', 'contractor'],
};

function categorize(reason: string): { category: DelayCategory; confidence: number } {
  const lowerReason = reason.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryRules)) {
    const matches = keywords.filter(kw => lowerReason.includes(kw));
    if (matches.length > 0) {
      const confidence = Math.min(0.5 + (matches.length * 0.15), 0.95);
      return { category: category as DelayCategory, confidence };
    }
  }
  return { category: 'other', confidence: 0.3 };
}

// Option B: AI-based (if configured)
async function categorizeWithAI(reason: string, context: ActionContext): Promise<CategoryResult> {
  // Call Claude API or similar
  // Return category, subcategory, confidence
}
```

### 5 Whys Flow

```typescript
interface FiveWhysAnalysis {
  id: string;
  action_id: string;
  conducted_by: string;
  root_cause_identified: boolean;
  created_at: string;
  responses: FiveWhysResponse[];
}

interface FiveWhysResponse {
  id: string;
  analysis_id: string;
  level: 1 | 2 | 3 | 4 | 5;
  response: string; // 20-500 chars
  created_at: string;
}

// UI Flow:
// 1. Modal opens with action summary + current delay reason
// 2. "Why did this happen?" prompt (Why #1)
// 3. User types response (validated: 20-500 chars)
// 4. Continue button shows Why #2 with Why #1 visible
// 5. Repeat up to Why #5
// 6. "Root Cause Found" button available at any level
// 7. Save all responses, mark root_cause_identified
```

### Insights Aggregation

```typescript
interface InsightsPayload {
  top_categories: CategoryInsight[];
  recurring_root_causes: RecurringIssue[];
  team_health_score: number;
  low_confidence_count: number;
}

interface CategoryInsight {
  category: DelayCategory;
  count: number;
  percentage: number; // of total delays
  trend: 'up' | 'down' | 'stable'; // vs previous period
  trend_percentage: number; // change amount
}

interface RecurringIssue {
  pattern: string; // Summarized pattern
  count: number;
  action_ids: string[];
  suggested_action?: string;
}

// Team Health Score formula:
// 100 - (delayed_percentage * 0.5) - (recurring_issues * 10)
// Clamped to 0-100
```

## Acceptance Criteria

All must pass for module completion:

- [ ] Delay reason saved triggers categorization (async)
- [ ] Category appears within 5 seconds
- [ ] Confidence score stored with category
- [ ] Low confidence (<0.7) flagged for PM review
- [ ] PM can override AI category
- [ ] Override marked as ai_overridden = true
- [ ] 5 Whys modal shows action summary
- [ ] 5 Whys prompts "Why?" for each level
- [ ] Response validation: 20-500 characters
- [ ] User can stop at any level (root cause found)
- [ ] All responses saved to database
- [ ] Previous analyses viewable in modal
- [ ] Insights panel shows top 3-5 categories
- [ ] Each category shows count and percentage
- [ ] Trend indicator shows up/down vs previous period
- [ ] Drill-down shows specific actions in category
- [ ] Recurring issues detected (>2 similar patterns)
- [ ] Team health score calculated correctly
- [ ] All unit tests pass
- [ ] Integration tests pass

## Verification

### Unit Tests Required
- [ ] Rules-based categorization matches expected categories
- [ ] Confidence calculation works correctly
- [ ] 5 Whys response validation (20-500 chars)
- [ ] Health score calculation clamped to 0-100
- [ ] Trend calculation is accurate

### Integration Tests Required
- [ ] Categorization triggered on delay reason save
- [ ] Category stored in database correctly
- [ ] 5 Whys creates analysis and responses
- [ ] PM override updates category and flag
- [ ] Insights aggregation returns correct data
- [ ] Drill-down returns correct actions

### Manual Verification
- [ ] Category badge appears on delayed actions
- [ ] Low confidence items appear in review queue
- [ ] 5 Whys flow completes end-to-end
- [ ] Previous analyses collapsible in modal
- [ ] Insights charts render correctly
- [ ] Clicking category bar shows drill-down
- [ ] Trend arrows point correct direction

## Estimated Effort

- **Complexity**: L (Large)
- **Estimated Effort**: 3-4 days
- **Risk Level**: Medium (AI integration, pattern detection)

## Implementation Notes

1. **Async Categorization**: Use Vercel Edge Functions or background jobs. Don't block the UI on categorization.

2. **AI Provider Choice**: Start with rules-based. Add AI later with feature flag. PRD allows rules-based for MVP.

3. **Categorization Retry**: If categorization fails, mark as 'other' with low confidence. Retry on cron.

4. **5 Whys UX**: Show all previous whys as you progress. Allow editing previous responses before final save.

5. **Pattern Detection**: Start simple - same category + similar keywords in 5 Whys. Can enhance with AI later.

6. **Chart Library**: Use Recharts, Chart.js, or similar for insights visualizations.

7. **Caching**: Cache insights aggregation. Invalidate on new delay reason or 5 Whys analysis.

8. **Date Range**: Default 30 days. Allow custom range selection.

## Open Questions

- [ ] Use rules-based or AI categorization for MVP? (Recommendation: Rules-based with AI as enhancement)
- [ ] Chart library preference? (Recommendation: Recharts for React compatibility)
- [ ] Should pattern detection use AI? (Recommendation: Start with simple keyword matching)
