# Data Models - Frontend

**Part:** Frontend (React + Vite)
**Generated:** 2025-12-10
**Scan Level:** Deep
**Database:** Dexie (IndexedDB wrapper)

## Database Schema

**File:** `src/services/db/db-client.ts`
**Database Name:** `IndustryFamilyTreeDB`
**Schema Version:** 4

---

## Tables

### 1. `needs`
Stores complete Need objects with all nested data (eras, expressions, predictions).

**Schema:**
```typescript
interface DBNeed extends Need {
  id: string;           // Primary key
  name: string;         // Indexed
  createdAt: number;    // Indexed
  updatedAt: number;    // Indexed
  // ... all Need fields
}
```

**Indexes:**
- `id` (primary key)
- `name`
- `createdAt`
- `updatedAt`

---

### 2. `mechanisms`
Cache for mechanism analysis results from AI.

**Schema:**
```typescript
interface DBMechanism {
  id: string;           // Primary key (IndustryExpression.id)
  expressionName: string; // Indexed
  needId: string;       // Indexed (foreign key to needs)
  details: {
    coreMechanism?: string;
    abstractPattern?: string;
    historicalApplications?: Array<{
      domain: string;
      era: string;
      implementation: string;
    }>;
    futureApplications?: Array<{
      domain: string;
      potential: string;
    }>;
  };
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `needId`
- `expressionName`
- `createdAt`

---

### 3. `deepDives`
Cache for business analysis (deep dive) results.

**Schema:**
```typescript
interface DBDeepDive {
  id: string;           // Primary key (IndustryExpression.id)
  expressionName: string; // Indexed
  needId: string;       // Indexed (foreign key to needs)
  details: {
    marketOpportunity?: string;
    keyEnablers?: string[];
    challenges?: Array<{
      challenge: string;
      potentialSolution: string;
    }>;
    timeline?: string;
  };
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `needId`
- `expressionName`
- `createdAt`

---

### 4. `crossPollinates`
Stores cross-pollination results (combinations of two industries).

**Schema:**
```typescript
interface DBCrossPollinate {
  id: string;           // Primary key (composite of two expression IDs)
  expression1Id: string; // Indexed
  expression2Id: string; // Indexed
  expression1Name: string;
  expression2Name: string;
  result: IndustryExpression[]; // Array of generated combinations
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `expression1Id`
- `expression2Id`
- `createdAt`

---

### 5. `searchCache`
Cache for prior art research results.

**Schema:**
```typescript
interface DBSearchCache {
  key: string;          // Primary key (normalized need name)
  needName: string;     // Indexed
  priorArt: any;        // Prior art analysis data
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `key` (primary key)
- `needName`
- `createdAt`

---

### 6. `patternAnalyses`
Pattern recognition analysis results (5 frameworks).

**Schema:**
```typescript
interface DBPatternAnalysis {
  id: string;           // Primary key (pattern name normalized)
  patternName: string;  // Indexed
  analyses: any[];      // Array of PatternAnalysis objects (5 frameworks)
  mechanismCount: number; // Indexed
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `patternName`
- `mechanismCount`
- `createdAt`

**Added in:** Version 2

---

### 7. `priorArtAnalyses`
Enhanced prior art competitive analysis (5 frameworks).

**Schema:**
```typescript
interface DBPriorArtAnalysis {
  id: string;           // Primary key (need name normalized)
  needName: string;     // Indexed
  analyses: any[];      // Array of PriorArtAnalysis objects (5 frameworks)
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `needName`
- `createdAt`

**Added in:** Version 3

---

### 8. `chainAnalyses`
Inspiration chain visualization and genealogy analysis (5 frameworks).

**Schema:**
```typescript
interface DBChainAnalysis {
  id: string;           // Primary key (expression ID)
  expressionId: string; // Indexed
  expressionName: string;
  needId: string;       // Indexed
  analyses: any[];      // Array of ChainAnalysis objects (5 frameworks)
  createdAt: number;    // Indexed
}
```

**Indexes:**
- `id` (primary key)
- `expressionId`
- `needId`
- `createdAt`

**Added in:** Version 4

---

## Schema Migration Strategy

The database uses Dexie's version migration system:

```typescript
this.version(1).stores({ ... }); // Initial schema
this.version(2).stores({ ... }); // + patternAnalyses
this.version(3).stores({ ... }); // + priorArtAnalyses
this.version(4).stores({ ... }); // + chainAnalyses
```

**Migration Approach:**
- Additive only (no data loss)
- Each version includes all previous tables
- IndexedDB handles data migration automatically

---

## Data Relationships

```
needs (1) ──< (N) mechanisms
needs (1) ──< (N) deepDives
needs (1) ──< (N) chainAnalyses

mechanisms (N) >──< (N) crossPollinates
```

**Relationship Details:**
- **needs → mechanisms:** One need can have many mechanism analyses
- **needs → deepDives:** One need can have many deep dive analyses
- **mechanisms → crossPollinates:** Cross-pollinations link two mechanisms/expressions
- **chainAnalyses:** References back to parent need and expression

---

## Storage Location

- **Browser:** IndexedDB (client-side only)
- **Persistence:** Data persists across sessions
- **No Server Sync:** All data is local to the browser

---

## Repository Pattern

**File:** `src/services/db/base.repository.ts`

**Base Repository Methods:**
- `getAll()` - Fetch all records
- `getById(id)` - Fetch single record by ID
- `create(data)` - Insert new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record

**Specialized Repositories:**
- Located in `src/services/db/repositories/`
- Extend base repository with domain-specific methods

---

## Related Files

- `src/services/db/db-client.ts` - Dexie database definition
- `src/services/db/db.service.ts` - Database service layer
- `src/services/db/base.repository.ts` - Base repository pattern
- `src/services/db/repositories/` - Specialized repositories
- `src/types/manager-interfaces.ts` - Type definitions
- `src/types.ts` - Core type definitions
