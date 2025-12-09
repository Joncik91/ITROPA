# ITROPA Feature Reference

**Complete Feature Documentation**

---

## Table of Contents

1. [Search & Exploration](#search--exploration)
2. [Need Management](#need-management)
3. [Prior Art Analysis](#prior-art-analysis)
4. [Timeline & Predictions](#timeline--predictions)
5. [Mechanism Extraction](#mechanism-extraction)
6. [Deep Dive Analysis](#deep-dive-analysis)
7. [Branching](#branching)
8. [Cross-Pollination](#cross-pollination)
9. [AI Assistant](#ai-assistant)
10. [Library System](#library-system)
11. [Pattern Discovery](#pattern-discovery)
12. [Data Export](#data-export)
13. [History & Undo](#history--undo)
14. [UI Customization](#ui-customization)

---

## Search & Exploration

### Search for Needs

**Purpose:** Find and research any human need to explore innovation opportunities.

**Location:** Top of home screen

**How to Use:**
1. Click the search input field
2. Enter a human need (single word or short phrase)
3. Press Enter or click search icon
4. Wait for AI to complete research (10-30 seconds)

**Input Examples:**
- Fundamental needs: "belonging", "status", "security"
- Abstract concepts: "creativity", "freedom", "purpose"  
- Specific domains: "healthcare", "education", "transportation"

**What Gets Generated:**
- Need description and context
- Comprehensive prior art (4 categories)
- Future industry predictions (multiple eras)
- Related needs suggestions

**Technical Details:**
- Uses Google Gemini AI (2.0-flash-exp model)
- Results are cached in IndexedDB
- Searches queue if multiple are in progress
- Each need opens as a new tab

**Limitations:**
- Requires internet connection
- Very specific or niche needs may return limited results
- AI generation can take 30-60 seconds for complex needs

### Suggested Needs

**Purpose:** Quick-start explorations with pre-selected fundamental human needs.

**Location:** Home screen when no needs are active

**Available Suggestions:**
- **Belonging** (Users icon) - Social connection
- **Status** (Zap icon) - Recognition  
- **Mastery** (Brain icon) - Skill development
- **Security** (Shield icon) - Safety
- **Love** (Heart icon) - Intimacy
- **Sustainability** (Leaf icon) - Environmental care

**How to Use:**
Click any suggestion card to immediately search for that need.

---

## Need Management

### Need Tabs

**Purpose:** Work with multiple needs simultaneously, each in its own tab.

**Location:** Below search bar (when needs are active)

**Features:**
- **Active Tab** - Highlighted with blue accent
- **Tab Label** - Shows need name and icon
- **Close Button** (×) - Remove need from workspace
- **Tab Count** - Multiple tabs visible simultaneously

**Navigation:**
- Click tab to switch views
- Use ← → arrow keys to navigate
- Tabs persist across browser sessions

**Actions:**
- **Close Tab** - Click × button (data stays in library)
- **Reopen Closed** - Access from Library view
- **Export Tab** - Use export dropdown for active tab

### Context Menu (Right-Click)

**Purpose:** Quick access to all actions for any industry/prediction.

**Location:** Right-click any industry card in the timeline

**Available Actions:**
- **Add Prediction** - Create a sibling industry
- **Branch** - Create sub-category (not available for past eras)
- **Extract Mechanism** - Analyze how it works
- **Deep Dive** - Market analysis
- **Cross-Pollinate** - Add to cross-pollination queue
- **Delete** - Remove user-added predictions (only)

**Keyboard Alternative:**
Click the three-dot menu icon on any card.

---

## Prior Art Analysis

### Overview

**Purpose:** Understand how this need has been addressed before—your innovation goldmine.

**Location:** Collapsible panel in need view

**Toggle:** Click "View Prior Art" to expand/collapse

### Four Categories

#### 1. Current Leaders

**What it is:** Modern solutions dominating the market today.

**Structure:**
- **Name** - Company, product, or solution
- **Domain** - Industry or market segment
- **Mechanism** - How it addresses the need
- **Limitation** - Known weaknesses or constraints

**Example (Belonging):**
```
Name: Social Media Platforms
Domain: Digital Communication
Mechanism: Algorithmic content feeds creating shared experiences
Limitation: Surface-level connections, privacy concerns
```

**How to Use:**
- Identify current market leaders
- Understand their core mechanisms
- Look for limitations to address
- Find gaps and opportunities

#### 2. Historical Precedents

**What it is:** Solutions from the past that addressed the same need.

**Structure:**
- **Name** - Historical solution or institution
- **Era** - Time period when it was prominent
- **Mechanism** - How it worked
- **Lesson** - What we can learn today

**Example (Belonging):**
```
Name: Town Squares
Era: Ancient to 19th century
Mechanism: Central gathering place for commerce and social interaction
Lesson: Physical proximity enables serendipitous connection
```

**How to Use:**
- Learn from time-tested patterns
- Identify enduring mechanisms
- Adapt old solutions with new technology
- Understand what humans truly value

#### 3. Adjacent Domains

**What it is:** Solutions from different industries addressing similar challenges.

**Structure:**
- **Name** - Solution from another domain
- **Original Domain** - Where it comes from
- **Mechanism** - How it solves the problem
- **Transfer Potential** - How it might apply elsewhere

**Example (Belonging):**
```
Name: Team Rituals in Sports
Original Domain: Athletics
Mechanism: Shared routines and symbols creating group identity
Transfer Potential: Apply to remote work teams, online communities
```

**How to Use:**
- Find transferable mechanisms
- Look for cross-industry patterns
- Identify non-obvious applications
- Prepare for cross-pollination

#### 4. Nature Solutions

**What it is:** Biological systems that solve analogous problems.

**Structure:**
- **Name** - Natural system or organism
- **Mechanism** - How nature solves it
- **Biomimicry Potential** - Applications to human systems

**Example (Belonging):**
```
Name: Mycorrhizal Networks
Mechanism: Underground fungal networks connecting trees to share resources
Biomimicry Potential: Decentralized resource-sharing platforms
```

**How to Use:**
- Discover optimized natural solutions
- Apply biomimicry principles
- Find resilient, sustainable patterns
- Inspire radical innovations

### Visual Indicators

- **Expandable Sections** - Click to collapse/expand
- **Item Count** - Shows number of examples per category
- **Icons** - Visual category identification
- **Hover Effects** - Better readability

---

## Timeline & Predictions

### Timeline View

**Purpose:** Visualize the evolution of industries addressing a need from past to future.

**Layout:** Horizontal scrolling timeline with era columns

**Eras:**
1. **Pre-Industrial** - Solutions before mechanization
2. **Industrial** - Mechanized and mass production era
3. **Digital (2000s-2020)** - Modern digital solutions
4. **Post-AI Era (2025+)** - Future predictions spanning near-term through long-term innovations

### Industry Cards

**Purpose:** Display individual industries/predictions with key information.

**Card Structure:**

```
┌─────────────────────────────┐
│ [Industry Name]        [⋮]  │
│                              │
│ Mutation: How it evolved    │
│                              │
│ Insight: Why it matters     │
│                              │
│ Inspirations:               │
│ • Source 1 → Mechanism     │
│ • Source 2 → Mechanism     │
│                              │
│ [Branch Icon] [+] children  │
└─────────────────────────────┘
```

**Visual States:**
- **Default** - Standard card appearance
- **Hover** - Subtle highlight effect
- **User-Added** - Special badge indicator
- **Cross-Pollinated** - Sparkle icon indicator
- **Has Children** - Shows branch count
- **Analyzed** - Blue dot for extracted mechanism
- **Deep Dived** - Green dot for market analysis

### Inspirations

**Purpose:** Show which prior art solutions influenced this prediction.

**Format:**
```
Source Name → Specific Mechanism
```

**Example:**
```
Inspirations:
• Town Squares → Central gathering spaces
• Social Media → Algorithmic connection
• Bee Colonies → Distributed coordination
```

**How to Read:**
- **Source** - The prior art solution
- **→** - "contributed the mechanism"
- **Mechanism** - The specific pattern transferred

### Branching Trees

**Purpose:** Show hierarchical relationships between industries and sub-industries.

**Visual Structure:**
```
Parent Industry
├─ Sub-Industry 1
│  ├─ Niche 1a
│  └─ Niche 1b
└─ Sub-Industry 2
   └─ Niche 2a
```

**Interactions:**
- **Expand/Collapse** - Click chevron icon
- **Hover** - Highlight parent-child relationships
- **Depth Indication** - Visual indentation
- **Branch Count** - Shows number of children

---

## Mechanism Extraction

### Overview

**Purpose:** Identify the core pattern that makes a solution work, abstracted from its specific implementation.

**Use Cases:**
- Understanding WHY something succeeds
- Finding transferable patterns
- Building pattern library
- Preparing for cross-pollination
- Learning from successful solutions

### How to Extract

**Method 1: Context Menu**
1. Right-click any industry card
2. Select "Extract Mechanism"
3. Wait for analysis (15-30 seconds)
4. Review in modal dialog

**Method 2: Three-Dot Menu**
1. Click ⋮ on industry card
2. Select "Extract Mechanism"
3. Wait for AI analysis
4. Review results

### Analysis Output

#### Core Mechanism

**What it is:** The fundamental pattern in plain language.

**Example:**
```
"Creating artificial scarcity to drive demand and status signaling"
```

**How to Use:**
- This is your transferable insight
- Can be applied to completely different domains
- The "what" without the "how"

#### Abstract Pattern

**What it is:** Universal principle behind the mechanism.

**Example:**
```
"Limited supply + social visibility = desire amplification"
```

**How to Use:**
- Most abstract level
- Applies across all domains
- Foundation for pattern matching

#### Historical Applications

**What it is:** Where this pattern has appeared before.

**Structure:**
```
Domain: Industry or context
Example: Specific implementation
Era: Time period
```

**Example:**
```
Domain: Fashion
Example: Limited edition sneaker drops
Era: 2010s-Present
```

**How to Use:**
- Validate the pattern's reliability
- Learn from different implementations
- Identify evolution over time

#### Untapped Domains

**What it is:** New opportunities to apply this mechanism.

**Structure:**
```
Domain: Potential industry
Opportunity: How to apply it
Novelty: Why it's innovative
```

**Example:**
```
Domain: Education
Opportunity: Limited-enrollment cohort courses with social proof
Novelty: Applies scarcity to learning experiences
```

**How to Use:**
- Identify innovation opportunities
- Evaluate market gaps
- Generate new business ideas

#### Combination Potential

**What it is:** Other mechanisms this could combine with.

**Format:** List of related mechanism names

**How to Use:**
- Prepare for cross-pollination
- Find synergistic patterns
- Build complex innovations

### AI Assistant Integration

After extraction, the AI Assistant provides suggestions:

**Common Suggestions:**
- Find similar mechanisms in your library
- Apply pattern to specific domains
- Compare with related mechanisms
- Explore combination opportunities
- Extract variations of the pattern

**Executing Suggestions:**
- Click ▶ on individual suggestions
- Use "Run All Actions" for batch execution
- Review reasoning before executing

### Storage & Retrieval

**Saved in Library:**
- All extracted mechanisms
- Linked to their source industry
- Linked to parent need
- Full analysis preserved

**Accessed via:**
- Library view (mechanism filter)
- Pattern view (grouped by abstract pattern)
- Search functionality

---

## Deep Dive Analysis

### Overview

**Purpose:** Comprehensive market analysis evaluating viability and opportunity of a predicted industry.

**Use Cases:**
- Business opportunity evaluation
- Market sizing and validation
- Strategic planning
- Investment assessment
- Competitive analysis
- Go-to-market strategy

### How to Deep Dive

**Method 1: Context Menu**
1. Right-click any future prediction
2. Select "Deep Dive"
3. Wait for analysis (20-45 seconds)
4. Review in modal dialog

**Method 2: Three-Dot Menu**
1. Click ⋮ on prediction card
2. Select "Deep Dive"
3. Wait for comprehensive analysis
4. Review market insights

**Note:** Deep dive is most relevant for Post-AI Era (2025+) predictions.

### Analysis Output

#### Market Opportunity

**What it is:** Size, scope, and potential of the market.

**Includes:**
- Market size estimates
- Growth projections
- Target demographics
- Geographic considerations
- Revenue potential

**Example:**
```
"$50B+ global market by 2030, targeting 500M+ remote workers
seeking authentic connection. Strongest initial traction in tech
hubs and knowledge worker segments."
```

**How to Use:**
- Validate market size
- Identify target segments
- Assess revenue potential
- Prioritize opportunities

#### Key Enablers

**What it is:** Technologies, trends, or conditions that make this possible now.

**Format:** Bulleted list of enabling factors

**Example:**
```
• Ubiquitous high-speed internet (5G+)
• Maturation of VR/AR hardware  
• Post-pandemic distributed work norms
• Declining cost of spatial computing
```

**How to Use:**
- Understand timing and feasibility
- Identify required capabilities
- Assess technological readiness
- Plan technology roadmap

#### Challenges & Solutions

**What it is:** Barriers to success and strategies to overcome them.

**Structure:**
```
Challenge: The obstacle
Potential Solution: How to address it
```

**Example:**
```
Challenge: High user acquisition costs in crowded market
Potential Solution: Vertical-specific go-to-market starting with
underserved professional communities
```

**How to Use:**
- Anticipate obstacles
- Plan mitigation strategies
- Identify competitive advantages
- Develop realistic roadmap

#### Timeline

**What it is:** When this industry will likely emerge and mature.

**Format:** Narrative description of phases

**Example:**
```
"Early pilots 2025-2027, mainstream adoption 2028-2032, market
maturity 2033+. Expect rapid acceleration once critical mass
achieved in key verticals."
```

**How to Use:**
- Plan entry timing
- Set realistic milestones
- Understand market phases
- Coordinate with technology cycles

#### First Mover Advantage

**What it is:** Benefits of being early to market.

**Includes:**
- Network effects
- Brand positioning
- Standard-setting opportunities
- Partnership advantages

**How to Use:**
- Evaluate urgency
- Assess competitive dynamics
- Plan market entry strategy
- Identify sustainable advantages

#### Prior Art Leverage

**What it is:** Existing solutions and patterns to build upon.

**Format:** List of relevant prior art with applications

**How to Use:**
- Avoid reinventing the wheel
- Identify partnership opportunities
- Understand competitive landscape
- Build on proven foundations

#### Key Players

**What it is:** Companies/organizations positioned to succeed.

**Includes:**
- Incumbents with advantages
- Startups to watch
- Potential acquirers
- Strategic partners

**How to Use:**
- Map competitive landscape
- Identify partners or acquisition targets
- Understand competitive positioning
- Track market development

#### Risks

**What it is:** What could go wrong or prevent success.

**Format:** Bulleted list of risk factors

**Example:**
```
• Privacy regulations limiting data use
• User fatigue with new platforms
• High capital requirements
• Winner-take-all dynamics
```

**How to Use:**
- Risk assessment and mitigation
- Scenario planning
- Investment decision-making
- Strategic hedging

### AI Assistant Integration

After deep dive, AI provides suggestions:

**Common Suggestions:**
- Compare with adjacent markets
- Find related opportunities in other needs
- Identify strategic partnerships
- Extract competitive advantages
- Analyze similar market patterns

### Storage & Retrieval

**Saved in Library:**
- All deep dive analyses
- Linked to source prediction
- Linked to parent need
- Full market analysis preserved

**Accessed via:**
- Library view (deep dive filter)
- Search functionality
- Original prediction card (green dot indicator)

---

## Branching

### Overview

**Purpose:** Create specialized variations or niche markets within a broader industry.

**Use Cases:**
- Exploring market segments
- Drilling down into niches
- Mapping specializations
- Adding custom predictions
- Building detailed market maps

### How to Branch

**Prerequisites:**
- Can only branch from Post-AI Era (2025+) predictions
- Cannot branch from past/historical items
- Parent industry must be in active need

**Method 1: Context Menu**
1. Right-click a future prediction
2. Select "Branch"
3. Fill in the form
4. Click "Add Prediction"

**Method 2: Three-Dot Menu**
1. Click ⋮ on prediction card
2. Select "Branch"
3. Complete form
4. Submit

### Branch Form

#### Name Field

**What it is:** The name of your sub-industry or niche.

**Guidelines:**
- Be specific and descriptive
- Indicate specialization clearly
- Use industry-standard terminology

**Examples:**
- "Healthcare Professional Networks" (from "Professional Networking")
- "Sustainable Fast Fashion" (from "Fashion Industry")
- "AI-Powered Tutoring Platforms" (from "Online Education")

#### Mutation Field

**What it is:** How this differs from or evolves the parent industry.

**Guidelines:**
- Describe the key differentiation
- Explain the specialization
- Highlight the innovation

**Example:**
```
"Focuses specifically on nurses with shift-based networking
features and HIPAA-compliant communication"
```

#### Insight Field

**What it is:** Why this niche matters or will succeed.

**Guidelines:**
- Explain the value proposition
- Justify the specialization
- Highlight market opportunity

**Example:**
```
"Nurses are highly mobile and networked but underserved by
generic professional platforms"
```

### Branch Hierarchy

**Visual Representation:**
```
Parent Industry
├─ Child 1 (your first branch)
│  └─ Grandchild 1a (branch from child)
└─ Child 2 (another branch)
```

**Limitations:**
- No depth limit (can branch infinitely)
- Each branch can have multiple children
- Collapsible tree structure

**Best Practices:**
- Start broad, branch into specifics
- Each level should be meaningful segmentation
- Don't over-branch early
- Use consistent granularity per level

### User-Added Indicator

**Visual Marker:**
- User-added branches have special badge
- Distinguishes from AI-generated predictions
- Enables delete functionality

**Permissions:**
- User-added items can be deleted
- AI-generated items are permanent
- Delete removes entire sub-tree

---

## Cross-Pollination

### Overview

**Purpose:** Combine mechanisms from different industries to generate novel hybrid innovations.

**Philosophy:** Best innovations come from non-obvious combinations of existing solutions.

**Use Cases:**
- Breakthrough innovation
- Convergence opportunities
- Unique value propositions
- Blue ocean strategy
- Disruptive innovation

### How to Cross-Pollinate

**Method 1: Checkbox Selection**
1. Check boxes on 2+ industries (from any needs)
2. Click "Cross-Pollinate" button (appears when 2+ selected)
3. Wait for AI generation (20-40 seconds)
4. Review hybrid innovations in modal

**Method 2: Drag & Drop**
1. Drag one industry card
2. Drop it onto another industry card
3. Both automatically added to cross-pollination queue
4. Click "Cross-Pollinate" to generate

**Method 3: Context Menu**
1. Right-click an industry
2. Select "Cross-Pollinate"
3. It's added to the queue (select more)
4. Click button to generate

### Cross-Pollination Modal

#### Source Items Display

**Shows your selections:**
- Industry names
- Parent needs
- Remove button (×) for each

**Edit Queue:**
- Add more items before generating
- Remove unwanted items
- Requires minimum 2 items

#### Generate Button

**Triggers AI:**
- Click "Cross-Pollinate These"
- Wait for generation
- Loading indicator appears

**What Happens:**
- AI analyzes both mechanisms
- Identifies synergies
- Generates 3-5 hybrid concepts

#### Results Display

**For each hybrid:**
- **Name** - The hybrid industry
- **Mutation** - How it combines parents
- **Insight** - Why it's valuable
- **Source Expressions** - Parent industries
- **Special Indicator** - Sparkle icon (✨)

#### Actions

**Add to Need:**
1. Review each hybrid
2. Click "Add to Need" on promising ones
3. Select target need from dropdown
4. Hybrid added as user-created prediction

**Benefits:**
- Saves innovative ideas
- Enables further branching
- Preserves combination lineage
- Builds innovation library

### Effective Cross-Pollination

**Choose Complementary Sources:**
✓ Different needs (not same need)
✓ Different eras (mix present + future)
✓ Different domains (maximize novelty)
✗ Too similar (low innovation potential)

**Example Good Combinations:**
```
Gamification (Mastery need)
+ Social Validation (Status need)
= Social Learning Platforms
```

```
Subscription Services (Convenience)
+ Community Building (Belonging)  
= Membership Communities with Recurring Benefits
```

**Example Poor Combinations:**
```
Social Media (Belonging)
+ Professional Networks (Belonging)
= Minimal innovation (too similar)
```

### Cross-Pollination Lineage

**Tracking:**
- Hybrids marked with sparkle icon
- `sourceExpressions` field stores parents
- Preserves innovation genealogy

**Benefits:**
- Understand combination origins
- Track successful patterns
- Enable meta-analysis
- Document innovation process

---

## AI Assistant

### Overview

**Purpose:** Provide intelligent, context-aware recommendations based on your current analysis.

**Appears After:**
- Extracting a mechanism
- Running a deep dive
- Completing cross-pollination
- Viewing patterns

**Philosophy:** AI learns from your work and suggests next best actions.

### AI Suggestion Card

#### Components

**1. AI Analysis Section**
- Sparkle icon indicator
- "AI Analysis" header
- Reasoning text explaining the context

**Example:**
```
"This mechanism shows strong pattern-matching with several
historical approaches to status signaling. Recommend exploring
transfer to digital domains."
```

**2. Suggested Actions List**
Each suggestion includes:
- **Action title** - What it will do
- **Reasoning** - Why it's recommended
- **Play button** (▶) - Execute this action
- **Checkmark** (✓) - Action completed

**3. Batch Actions**
- "Run All Actions" button
- Executes all remaining suggestions
- Progress indicator during execution

### Action Types

#### create_need

**What it does:** Opens a new need for exploration.

**When suggested:**
- Related needs identified
- Complementary domains found
- Gap in your research detected

**Example:**
```
Action: Explore "Achievement" need
Reasoning: Closely related to Status with different mechanisms
```

#### compare

**What it does:** Side-by-side comparison of mechanisms or industries.

**When suggested:**
- Similar patterns detected
- Competitive analysis needed
- Differentiation unclear

**Example:**
```
Action: Compare with "Social Proof" mechanism
Reasoning: Both use validation but different sources
```

#### branch

**What it does:** Suggests specific niche to explore.

**When suggested:**
- Underserved segment identified
- Specialization opportunity found
- Market gap detected

**Example:**
```
Action: Branch into "Enterprise Social Recognition"
Reasoning: B2B market underserved vs consumer focus
```

#### analyze

**What it does:** Requests deep dive or mechanism extraction.

**When suggested:**
- Important industry not yet analyzed
- Key competitor identified
- Strategic opportunity spotted

**Example:**
```
Action: Deep dive on "Micro-Communities Platform"
Reasoning: Fastest growing segment in this need
```

#### find_similar

**What it does:** Searches library for related patterns.

**When suggested:**
- Pattern matches in other needs
- Cross-pollination opportunities
- Learning from analogies

**Example:**
```
Action: Find similar "Network Effects" patterns
Reasoning: This mechanism appears in 5 other needs
```

#### extract

**What it does:** Pulls out a specific sub-mechanism.

**When suggested:**
- Complex mechanism with multiple parts
- Transferable sub-pattern identified
- Deeper analysis needed

**Example:**
```
Action: Extract "Algorithmic Matching" sub-mechanism
Reasoning: This component is highly transferable
```

#### apply_pattern

**What it does:** Suggests applying a pattern to new domain.

**When suggested:**
- Proven pattern underutilized
- Novel application identified
- Innovation opportunity found

**Example:**
```
Action: Apply "Gamification" to Healthcare Compliance
Reasoning: Proven engagement pattern, untapped domain
```

### Using AI Suggestions

#### Review Before Executing

**Always read the reasoning:**
- Understand why it's suggested
- Evaluate relevance to your goals
- Check if it aligns with your research

**Consider:**
- Do I need this information now?
- Will this help my current objective?
- Is this a tangent or core to my work?

#### Execute Individual Actions

**Single execution:**
1. Click ▶ play button
2. Watch for loading indicator
3. Wait for completion
4. Review results
5. Checkmark appears when done

**Benefits:**
- Controlled exploration
- Understand each action's impact
- Learn AI reasoning patterns

#### Execute All Actions

**Batch execution:**
1. Review all suggestions first
2. Click "Run All Actions"
3. Confirmation dialog appears
4. Confirm to proceed
5. Watch progress indicator
6. All actions execute sequentially

**Progress Display:**
```
Executing 3/7 actions...
Current: Comparing mechanisms...
```

**Benefits:**
- Time efficient for trusted suggestions
- Comprehensive exploration
- Builds complete analysis

**Cautions:**
- Cannot undo batch execution
- May generate lots of data
- Some actions may fail

#### Handling Failures

**If action fails:**
- Error toast notification
- Batch execution stops
- Previous actions remain completed
- Can retry failed action individually

### AI Models Used

**Mechanism Extraction:**
- Model: Gemini 2.0-flash-exp
- Focuses on pattern recognition
- Deep analysis capabilities

**Deep Dive Analysis:**
- Model: Gemini 2.5-flash-lite
- Market research optimized
- Fast generation

**Cross-Pollination:**
- Model: Gemini 2.5-flash-lite
- Creative combination
- Rapid ideation

**AI Suggestions:**
- Model: Gemini 2.5-flash-lite
- Context-aware recommendations
- Tool-calling capabilities

---

## Library System

### Overview

**Purpose:** Personal knowledge repository of all your explorations, analyses, and discoveries.

**Access:** Click Library icon (book) in header

**Data Storage:** All saved locally in IndexedDB (browser storage)

### Library Dashboard

#### Statistics Panel

**Displays:**
- **Total Needs** - How many needs explored
- **Mechanisms Extracted** - Count of analyses
- **Deep Dives** - Market analyses performed
- **Cross-Pollinations** - Hybrid experiments
- **Search Cache** - Cached searches
- **Total Items** - Everything in library

**Example:**
```
📊 Library Statistics
Needs: 12
Mechanisms: 45
Deep Dives: 18
Cross-Pollinations: 7
Total: 82 items
```

**Use Cases:**
- Track your research progress
- Understand exploration patterns
- Measure library growth

#### Recent Activity

**What it shows:** Chronological list of recent actions.

**Activity Types:**
- **Need Explored** - When you searched
- **Mechanism Extracted** - Analysis performed
- **Deep Dive Completed** - Market research done
- **Cross-Pollination** - Hybrid created

**For Each Activity:**
- Timestamp (relative: "2 hours ago")
- Action type icon
- Description of action
- Related need/item name

**Interaction:**
- Click to reload that item
- See context of past work
- Resume previous explorations

### Search Library

**Purpose:** Find specific items in your research history.

**Location:** Search bar at top of library view

**What it searches:**
- Need names and descriptions
- Industry/prediction names
- Mechanism details
- Deep dive content
- Cross-pollination results

**Search Behavior:**
- Real-time results
- Fuzzy matching
- Relevance ranked
- No search if empty

**Results Grouped By:**
- Needs
- Expressions (industries)
- Mechanisms
- Deep Dives

### Filter by Type

**Purpose:** Focus on specific category of saved items.

**Filter Options:**
- **All** - Show all recent activity
- **Needs** - Only need explorations
- **Mechanisms** - Only extracted mechanisms
- **Deep Dives** - Only market analyses
- **Cross-Pollinates** - Only hybrids

**Visual Indicator:**
Active filter highlighted with accent color.

### Library Items

#### Need Items

**Display:**
- Need name
- Icon
- Timestamp saved
- Delete button

**Actions:**
- **Click** - Load need into home workspace
- **Delete** - Remove from library (confirmation required)

**What loads:**
- Complete need data
- All predictions and branches
- Linked mechanisms
- Linked deep dives

#### Mechanism Items

**Display:**
- Mechanism name (from expression)
- Parent need name
- Core mechanism preview
- Timestamp

**Actions:**
- **Click** - Open mechanism modal
- **Load Need** - Opens parent need

#### Deep Dive Items

**Display:**
- Industry name
- Parent need
- Market opportunity preview
- Timestamp

**Actions:**
- **Click** - Open deep dive modal
- **Load Need** - Opens parent need

#### Cross-Pollination Items

**Display:**
- Hybrid name
- Source industries
- Timestamp

**Actions:**
- **Click** - View details
- **Add to Need** - Save to workspace

### Data Management

#### Delete Individual Items

**Need Deletion:**
1. Click delete icon on need
2. Confirmation dialog appears
3. Confirm to delete permanently
4. Also deletes associated analyses

**Cascade Effect:**
Deleting a need removes:
- The need record
- All mechanisms extracted from it
- All deep dives performed on it
- Cross-pollinations involving it

#### Clear All Data

**Purpose:** Fresh start or cleanup.

**How to:**
1. Click "Clear All Data" button
2. Confirmation dialog (double-check)
3. Confirm to delete everything
4. Library reset to empty

**What gets deleted:**
- All needs
- All mechanisms
- All deep dives
- All cross-pollinations
- Search cache
- History/undo data

**What survives:**
- User preferences (theme)
- Authentication state
- App configuration

**Irreversible:** 
Cannot be undone. Export important data first.

### Library Performance

**Optimization:**
- Indexed searches for speed
- Lazy loading for large datasets
- Paginated recent activity
- Cached queries

**Limitations:**
- Browser storage limits (~50-100MB typical)
- Large libraries may slow down
- Consider exporting and clearing old data
- No cloud sync (local only)

---

## Pattern Discovery

### Overview

**Purpose:** Identify recurring mechanisms and abstract patterns across all your explorations.

**Access:** Click Pattern icon (shapes) in header

**Philosophy:** Patterns reveal universal principles that transcend specific industries.

**Value:** Find reliable innovation strategies that work across domains.

### Pattern View

#### Pattern Cards

**Structure:**
```
┌────────────────────────────────┐
│ Abstract Pattern               │
│ [Badge: X instances]           │
│                                │
│ Pattern description in         │
│ universal language             │
│                                │
│ Found in:                      │
│ • Instance 1 (Need A)         │
│ • Instance 2 (Need B)         │
│ • Instance 3 (Need C)         │
└────────────────────────────────┘
```

**Components:**
- **Abstract Pattern** - Universal principle
- **Instance Count** - How many times found
- **Pattern Description** - Explanation
- **Instance List** - Where it appears

#### Pattern Instances

**For each instance:**
- **Industry Name** - Specific implementation
- **Parent Need** - Which need it's from
- **Core Mechanism** - How it's applied
- **Click to Load** - Opens parent need

**Example:**
```
Pattern: "Scarcity + Social Visibility = Desire Amplification"

Found in:
• Limited Edition Sneakers (Status Need)
• Exclusive Clubs (Belonging Need)
• Beta Access Programs (Mastery Need)
```

### How Patterns are Generated

**Source:**
- Extracted mechanisms from library
- AI-analyzed abstract patterns
- Grouped by similarity

**Algorithm:**
1. AI extracts abstract pattern from each mechanism
2. Similar patterns grouped together
3. Instances linked to source industries
4. Sorted by frequency

**Requirements:**
- Must have extracted mechanisms
- Minimum 2+ instances to form pattern
- Different needs preferred (not required)

### Using Patterns

#### Find Recurring Strategies

**Benefit:** Identify proven approaches that work reliably.

**How:**
- Look for high instance counts
- Read pattern descriptions
- Review diverse applications

**Example Use:**
```
If "Network Effects" appears 8 times across needs,
it's a highly reliable growth mechanism.
```

#### Transfer Patterns to New Domains

**Benefit:** Apply successful patterns where they haven't been used.

**How:**
1. Identify pattern with multiple instances
2. Check which needs have used it
3. Apply to needs that haven't
4. Create cross-pollination or branch

**Example:**
```
"Gamification" found in Mastery and Status needs
→ Could apply to Sustainability need
→ Gamified recycling/conservation platforms
```

#### Build Mental Models

**Benefit:** Develop intuition for innovation.

**How:**
- Study patterns regularly
- Note which combinations work
- Understand why patterns succeed
- Internalize principles

#### Identify Your Biases

**Benefit:** Recognize gaps in your thinking.

**How:**
- See which patterns you over-use
- Notice patterns you've never tried
- Diversify your approaches

#### Find Combination Opportunities

**Benefit:** Generate novel hybrids.

**How:**
1. Select two patterns
2. Find instances from each
3. Cross-pollinate them
4. Create combination innovations

**Example:**
```
"Community Building" pattern
+ "Subscription Revenue" pattern
= Membership-based community platforms
```

### Pattern Limitations

**Not Automatic:**
- Requires you to extract mechanisms
- Empty if no extractions performed
- Grows with library

**Quality Depends On:**
- Diversity of needs explored
- Quality of mechanism extractions
- AI pattern recognition

**Not Exhaustive:**
- Only shows your explorations
- May miss universal patterns
- Reflects your research focus

---

## Data Export

### Overview

**Purpose:** Save your research for backup, sharing, or external analysis.

**Access:** Export dropdown on home screen (active need required)

**Formats:** JSON, Markdown, CSV

**Scope:** Exports currently active need tab.

### Export Formats

#### JSON Export

**What it includes:**
```json
{
  "need": {
    "id": "...",
    "name": "...",
    "description": "...",
    "priorArt": {...},
    "eras": [...]
  },
  "analyzedExpressions": {
    "mechanisms": ["id1", "id2"],
    "deepDives": ["id3", "id4"]
  }
}
```

**Complete data structure:**
- Full need object
- All predictions with children
- All inspirations and insights
- Analyzed expression IDs
- All metadata preserved

**Best For:**
- Complete backup
- Data processing/analysis
- Re-importing data
- Programmatic use
- Preserving full fidelity

**File Name:**
`{need-name}-export.json`

#### Markdown Export

**What it includes:**
- Human-readable formatting
- Hierarchical structure
- All predictions with details
- Prior art sections
- Visual indicators for analyzed items

**Structure:**
```markdown
# Need Name

## Description
...

## Prior Art

### Current Leaders
- Item 1: Description
- Item 2: Description

### Historical Precedents
...

## Timeline

### Era Name
#### Industry 1
- **Mutation:** ...
- **Insight:** ...
- **Inspirations:**
  - Source → Mechanism

##### Sub-Industry 1.1
...
```

**Best For:**
- Documentation
- Presentations
- Sharing with non-technical users
- Note-taking apps (Notion, Obsidian, etc.)
- Reading and review

**File Name:**
`{need-name}-export.md`

#### CSV Export

**What it includes:**
Flat table with columns:
- Era
- Name
- Mutation
- Insight
- Depth (hierarchy level)
- Parent Name

**Structure:**
```csv
Era,Name,Mutation,Insight,Depth,Parent
Present,Industry 1,How it evolved,Why it matters,0,
Near Future,Sub-Industry,Specialization,Value prop,1,Industry 1
```

**Best For:**
- Spreadsheet analysis
- Excel/Google Sheets
- Filtering and sorting
- Quantitative analysis
- Simple backups

**File Name:**
`{need-name}-export.csv`

**Limitations:**
- Loses hierarchical structure (flattened)
- No prior art included
- Inspirations not included
- Simplified data

### Export Process

**How to Export:**
1. Make sure you have a need tab active
2. Click "Export" dropdown in header
3. Select format (JSON/Markdown/CSV)
4. Loading toast appears briefly
5. File downloads to default folder
6. Success toast confirms

**What if No Active Need:**
- Export button disabled
- No dropdown visible
- Must select/load a need first

### Export Use Cases

#### Backup Strategy
```
Weekly: Export all needs as JSON
Store in cloud storage
Preserves work if browser data cleared
```

#### Sharing Research
```
Export as Markdown
Share with team members
Easy to read and discuss
No technical knowledge required
```

#### Analysis & Reporting
```
Export as CSV
Import to Excel/Sheets
Create charts and graphs
Quantify predictions
```

#### Documentation
```
Export as Markdown
Add to project documentation
Include in strategic plans
Present to stakeholders
```

#### Data Processing
```
Export as JSON
Parse with custom scripts
Integrate with other tools
Build custom visualizations
```

---

## History & Undo

### Overview

**Purpose:** Track actions and enable reverting mistakes.

**Scope:** Actions on current needs in workspace.

**Limitations:** Does not track library deletions or exports.

### Tracked Actions

**What's Recorded:**
- Add need
- Delete need  
- Close need tab
- Add prediction (branch)
- Add child prediction
- Delete expression
- Cross-pollinate
- Fetch mechanism
- Fetch deep dive

**For Each Action:**
- Unique ID
- Action type
- Timestamp
- Description
- Before/after state

### Using Undo

**Keyboard Shortcut:** Ctrl+Z

**What it does:**
- Reverts last action
- Restores previous state
- Moves action to redo stack

**Limitations:**
- Only works when no modal open
- Cannot undo library deletions
- Cannot undo exports
- Limited to workspace actions

**Example:**
```
Action: Added prediction "AI-Powered Learning"
Undo: Removes the prediction
State: Back to before addition
```

### Using Redo

**Keyboard Shortcut:** Ctrl+Y

**What it does:**
- Re-applies undone action
- Moves forward in history
- Restores undone changes

**Limitations:**
- Only available after undo
- New actions clear redo stack
- Same restrictions as undo

### History Panel

**Purpose:** Visual representation of action history.

**Access:** Hamburger menu → History (when implemented)

**Displays:**
- Chronological action list
- Current position indicator
- Descriptions of each action
- Undo/redo buttons

**Features:**
- Click any action to jump there
- See full action descriptions
- Understand your workflow
- Review what you've explored

### History Persistence

**Saved:**
- History persists in browser session
- Survives page refresh
- Stored with workspace state

**Cleared:**
- Closing all need tabs
- Clearing browser data
- Logging out (if authenticated)
- Manual history clear

### Best Practices

**Strategic Undo Points:**
- Before major actions
- Before batch operations
- Before cross-pollination
- Before branching extensively

**When to Undo:**
- Accidentally deleted prediction
- Wrong branch added
- Exploring "what-if" scenarios
- Testing different structures

**Limitations to Know:**
- Cannot undo analysis (mechanism/deep dive)
- Cannot undo AI suggestions execution
- Cannot undo library operations
- Cannot undo theme changes

---

## UI Customization

### Theme Switching

**Purpose:** Personalize visual appearance and reduce eye strain.

**Access:** Sun/Moon icon in header

**Options:**
- **Dark Mode** - Dark backgrounds, light text
- **Light Mode** - Light backgrounds, dark text

**Behavior:**
- Click to toggle
- Smooth transition animation
- Preference saved in browser
- Persists across sessions

**Dark Mode Colors:**
- Background: Dark slate
- Text: Light gray
- Accents: Indigo/purple
- Cards: Subtle gray

**Light Mode Colors:**
- Background: White/light gray
- Text: Dark slate
- Accents: Indigo/blue
- Cards: White with borders

### View Density (Coming Soon)

**Purpose:** Control information density and card spacing.

**Options:**
- **Compact** - Tighter spacing, more cards visible
- **Comfortable** - Standard spacing, balanced

**Use Cases:**
- Compact: Overview, many predictions
- Comfortable: Detailed reading, fewer items

### Sidebar Toggles (Coming Soon)

**Purpose:** Show/hide side panels for focused work.

**Controls:**
- **Left Sidebar** - Prior art, suggested needs
- **Right Sidebar** - AI assistant, mini-map

**Benefits:**
- More screen space for timeline
- Reduce visual clutter
- Focus on specific tasks

### Mini-Map (Coming Soon)

**Purpose:** Visual overview and navigation for large trees.

**Features:**
- Bird's-eye view of entire need
- Current viewport indicator
- Click to navigate
- Zoom levels

### Breadcrumb Navigation

**Purpose:** Show current location in branched hierarchy.

**Location:** Above timeline view (when deep in tree)

**Format:**
```
Need Name > Parent > Current Industry
```

**Interaction:**
- Click any level to jump there
- Quickly navigate up hierarchy
- Understand current context

---

## Additional Topics

### Authentication

**Production Only:**
- Password-protected in deployed version
- No authentication in local development
- Password stored as environment variable

**First Visit:**
1. Enter app password
2. Authenticated session stored
3. No re-prompt until logout

### Browser Compatibility

**Supported:**
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

**Requirements:**
- JavaScript enabled
- IndexedDB support
- Modern CSS support

### Performance

**Optimization:**
- Lazy loading for large trees
- Virtualized lists
- Memoized components
- Debounced search

**Large Datasets:**
- 100+ predictions: Smooth
- 1000+ predictions: May slow down
- Consider splitting needs
- Export and clear old data

### Privacy & Security

**Data Location:**
- All local in browser
- IndexedDB storage
- No external database

**API Calls:**
- Only to Google Gemini AI
- For need searches and analysis
- API key secured server-side
- No user data stored remotely

### Troubleshooting

**Search not working:**
- Check internet connection
- Verify API key (deployment)
- Try simpler search terms
- Check browser console

**Data not saving:**
- Check browser storage permissions
- Storage quota may be full
- Try different browser
- Export data first

**Slow performance:**
- Too many open tabs/predictions
- Close unused need tabs
- Clear browser cache
- Restart browser

---

## API Reference (For Developers)

### DBService

**Purpose:** IndexedDB wrapper for data persistence.

**Key Methods:**
- `saveNeed(need)` - Save/update need
- `getNeed(id)` - Retrieve need
- `searchNeeds(query)` - Full-text search
- `saveMechanism(mechanism)` - Store analysis
- `saveDeepDive(deepDive)` - Store analysis
- `getDatabaseStats()` - Get counts
- `clearAllData()` - Wipe database

### GeminiService

**Purpose:** AI interaction layer.

**Key Methods:**
- `searchNeed(needName)` - Generate need data
- `extractMechanism(expression)` - Analyze mechanism
- `analyzeDeepDive(expression)` - Market analysis
- `crossPollinate(items)` - Generate hybrids
- `requestAIAssist(context)` - Get suggestions

### API Client

**Purpose:** Server communication (production).

**Endpoints:**
- `/api/gemini` - AI generation requests
- `/api/auth` - Authentication
- `/api/ai-assistant` - AI suggestions

---

This reference guide covers all features in ITROPA. For tutorials and workflows, see the main User Guide. For quick reference, see the Quick Start Guide.
