# Lessons Learned

## 2026-02-01: Folder Structure Must Match CLAUDE.md

### Issue
During M-01 implementation, the Next.js Supabase template was used which created files at the root level (`/app`, `/components`, `/lib`) instead of under `/src` as specified in CLAUDE.md. The API versioning (`/api/v1`) was also missing.

### Root Cause
- Used `create-next-app` template without verifying its output structure against project conventions
- Did not cross-reference CLAUDE.md project structure before starting implementation
- Assumed template defaults would match project requirements

### Impact
- Required restructuring after implementation was complete
- Had to update multiple config files (tsconfig.json, tailwind.config.ts, vitest.config.ts, components.json)
- Risk of merge conflicts if other work had started in parallel

### Correction
Before starting any implementation phase:

1. **Read CLAUDE.md first** - Verify the expected project structure before writing any code
2. **Validate template output** - When using scaffolding tools (create-next-app, etc.), immediately verify the generated structure matches expectations
3. **Create structure first** - Before writing code, create the folder structure explicitly:
   ```bash
   mkdir -p src/app/api/v1
   mkdir -p src/components/{layout,providers,ui}
   mkdir -p src/hooks
   mkdir -p src/lib
   mkdir -p src/types
   ```
4. **Update configs early** - If using a template, update path aliases in config files immediately after scaffolding

### Checklist for Future Implementations

Before starting implementation:
- [ ] Read CLAUDE.md project structure section
- [ ] Verify folder structure matches conventions
- [ ] Check path aliases in tsconfig.json (`@/*` → `./src/*`)
- [ ] Check content paths in tailwind.config.ts
- [ ] Verify API routes use versioning (`/api/v1/`)
- [ ] Confirm test config aliases match

### Prevention
Add this check to the implementation workflow:

```markdown
## Pre-Implementation Checklist
- [ ] Folder structure matches CLAUDE.md
- [ ] API routes versioned as /api/v1
- [ ] Path aliases configured correctly
```
