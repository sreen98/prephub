import type { QueryQuestion } from './types';

/**
 * MongoDB questions. Answers are an aggregation pipeline — a JSON array of
 * stages — which is how these are asked in interviews and how you would paste
 * them into a driver.
 *
 * The explanations lean on the places Mongo differs from SQL, because that is
 * where candidates who "know SQL" come unstuck: $unwind has no SQL equivalent,
 * $lookup is not a join engine, and $match placement is the whole performance
 * story.
 */
export const MONGO_QUESTIONS: QueryQuestion[] = [
  {
    id: 'mongo-match-project',
    engine: 'mongo',
    title: 'Filter and project',
    prompt: 'Return the `_id` and `customer` of every order with status "shipped".',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Easy',
    topics: ['$match', '$project'],
    orderMatters: false,
    starter: '[\n  { "$match": {  } }\n]',
    solution: `[
  { "$match": { "status": "shipped" } },
  { "$project": { "_id": 1, "customer": 1 } }
]`,
    explanation: `The two stages you will use most.

**\`$match\` first, always.** It is the only stage that can use an index, and every later stage processes fewer documents because of it. A pipeline that filters at the end does the same work as one with no filter at all.

**\`$project\` picks fields.** \`1\` includes, \`0\` excludes, and you cannot mix the two in one stage — except for \`_id\`, which is included by default and is the only field you may exclude alongside inclusions (\`{ name: 1, _id: 0 }\`).

The SQL equivalent is \`SELECT _id, customer FROM orders WHERE status = 'shipped'\`, with the stages in the order they actually execute rather than SQL's declarative order.`,
  },
  {
    id: 'mongo-group-sum',
    engine: 'mongo',
    title: 'Total per customer',
    prompt: 'Group shipped orders by customer. Return `_id` (the customer) and `orders` — the number of shipped orders each placed.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Easy',
    topics: ['$group', '$sum'],
    orderMatters: false,
    solution: `[
  { "$match": { "status": "shipped" } },
  { "$group": { "_id": "$customer", "orders": { "$sum": 1 } } }
]`,
    explanation: `**\`$group\` is \`GROUP BY\`,** and \`_id\` is the grouping key — that naming surprises everyone once. Set \`_id: null\` to aggregate the whole collection into a single row.

**\`{ $sum: 1 }\` is \`COUNT(*)\`.** You add 1 per document. \`{ $sum: "$total" }\` would sum a field instead — the \`$\` prefix is what makes it a field reference rather than a literal.

**Group by several fields** with an object key: \`_id: { customer: "$customer", status: "$status" }\`. The result \`_id\` is then that object, which is worth remembering when you consume the output.`,
  },
  {
    id: 'mongo-unwind',
    engine: 'mongo',
    title: 'Flatten an array with $unwind',
    prompt: 'Across all orders, total the quantity sold per product. Return `_id` (the product name) and `qty`, sorted by product name ascending.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Medium',
    topics: ['$unwind', '$group', '$sort'],
    orderMatters: true,
    solution: `[
  { "$unwind": "$items" },
  { "$group": { "_id": "$items.name", "qty": { "$sum": "$items.qty" } } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `**\`$unwind\` has no SQL equivalent**, and it is the stage that defines MongoDB aggregation.

It turns one document containing an array of *n* elements into *n* documents, each with that field set to a single element. An order with two items becomes two documents. Only then can you group across items from different orders.

**The trap: \`$unwind\` drops documents whose array is empty or missing.** If an order had no items, it would vanish from the results entirely — which is a silent data loss bug. When that matters:

\`\`\`json
{ "$unwind": { "path": "$items", "preserveNullAndEmptyArrays": true } }
\`\`\`

**Performance:** unwinding multiplies your working set, so \`$match\` before it whenever you can. Unwinding a million documents with ten items each and *then* filtering is ten million documents of avoidable work.`,
    followUp: 'How would you get the total revenue per product rather than quantity? (`{ $sum: { $multiply: ["$items.qty", "$items.price"] } }`.)',
  },
  {
    id: 'mongo-sort-limit',
    engine: 'mongo',
    title: 'Top spenders',
    prompt: 'Find the two customers with the highest total order value across all their orders (any status). Return `_id` (customer) and `spend`, highest first.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Medium',
    topics: ['$unwind', '$group', '$sort', '$limit'],
    orderMatters: true,
    solution: `[
  { "$unwind": "$items" },
  { "$group": { "_id": "$customer", "spend": { "$sum": { "$multiply": ["$items.qty", "$items.price"] } } } },
  { "$sort": { "spend": -1 } },
  { "$limit": 2 }
]`,
    explanation: `The **top-N** shape: group, sort, limit.

**\`$multiply\` inside \`$sum\`** shows the difference between an accumulator and an expression. \`$sum\` accumulates across documents in a group; \`$multiply\` computes within one document. Expressions nest inside accumulators, not the other way round.

**\`$sort\` then \`$limit\` is special-cased.** MongoDB's planner recognises the pair and keeps only the top N in memory rather than sorting the entire set — the "top-k sort" optimisation. Putting other stages between them defeats it.

**The 100 MB limit applies to \`$sort\` and \`$group\`.** Beyond that a pipeline fails unless you pass \`allowDiskUse: true\`. Sorting on an indexed field *before* any transforming stage avoids the problem entirely, because the index provides the order.`,
  },
  {
    id: 'mongo-lookup',
    engine: 'mongo',
    title: '$lookup — the join',
    prompt: 'Return the `_id` and `customer` of every shipped order placed by a customer whose tier is "gold". Join `orders` to the `customers` collection.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Hard',
    topics: ['$lookup', '$match', 'joins'],
    orderMatters: false,
    solution: `[
  { "$match": { "status": "shipped" } },
  { "$lookup": { "from": "customers", "localField": "customer", "foreignField": "_id", "as": "cust" } },
  { "$match": { "cust.tier": "gold" } },
  { "$project": { "_id": 1, "customer": 1 } }
]`,
    explanation: `**\`$lookup\` is a LEFT OUTER JOIN**, and the mental model differs from SQL in one important way: the matched documents arrive as an **array** in the field you name with \`as\`. An order with no matching customer gets \`cust: []\` rather than disappearing.

Because it is an array, \`{ "cust.tier": "gold" }\` works — Mongo matches if *any* element matches. People expect to need \`$unwind\` first; often you do not.

**The performance warning is the real content of this question.** \`$lookup\` runs a query against the foreign collection **for every input document**. Without an index on \`customers._id\` (there always is one) or on whatever \`foreignField\` you pick, it is O(n·m). The standard advice is to \`$match\` aggressively *before* the \`$lookup\` so it runs over as few documents as possible — which is why the filter is the first stage here.

**And the design point:** needing \`$lookup\` frequently is a signal the schema may be wrong for the access pattern. MongoDB rewards embedding data you read together — which is exactly why \`items\` is embedded in each order here rather than being its own collection.`,
  },
  {
    id: 'mongo-facet',
    engine: 'mongo',
    title: 'Two aggregations in one pass',
    prompt: 'In a single pipeline, return an object with `byStatus` — the count per status, sorted by status ascending as `{_id, n}` — and `totalOrders`, the overall count as `[{n}]`.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Hard',
    topics: ['$facet', '$count'],
    orderMatters: false,
    solution: `[
  { "$facet": {
      "byStatus": [
        { "$group": { "_id": "$status", "n": { "$sum": 1 } } },
        { "$sort": { "_id": 1 } }
      ],
      "totalOrders": [ { "$count": "n" } ]
  } }
]`,
    explanation: `**\`$facet\` runs several sub-pipelines over the same input** and returns all their results in one document. The classic use is a search results page: the matching rows, the total count for pagination, and the filter counts for the sidebar — all from one round trip instead of three.

Each sub-pipeline sees the same input documents and is otherwise independent.

**The constraints worth knowing:** sub-pipelines cannot contain \`$facet\`, \`$out\` or \`$merge\`, and — importantly — **\`$facet\` cannot use an index**, because the input is materialised before the branches run. So put a \`$match\` *before* the \`$facet\`, never inside the branches, or you lose index access for all of them.

The output is a single document whose fields are arrays, which is why \`totalOrders\` comes back as \`[{ n: 7 }]\` rather than a bare number.`,
  },
  {
    id: 'mongo-addfields',
    engine: 'mongo',
    title: 'Computed field with $addFields',
    prompt: 'For each order, return `_id` and `total` — the sum of qty × price across its items. Do not unwind. Sort by `_id` ascending.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Hard',
    topics: ['$addFields', '$reduce', 'array expressions'],
    orderMatters: true,
    solution: `[
  { "$addFields": { "total": {
      "$reduce": {
        "input": "$items",
        "initialValue": 0,
        "in": { "$add": ["$$value", { "$multiply": ["$$this.qty", "$$this.price"] }] }
      }
  } } },
  { "$project": { "_id": 1, "total": 1 } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `The point of this one is that **you do not always need \`$unwind\`**.

\`$unwind\` + \`$group\` would work, but it explodes the document count and then has to put it back together. Array *expressions* compute within a single document and are dramatically cheaper.

**\`$reduce\`** folds an array to one value. The two variables are the ones to memorise: \`$$value\` is the accumulator so far, \`$$this\` is the current element. The \`$$\` prefix marks a system variable, as opposed to \`$\` for a field path.

**The shorter form for exactly this case:**

\`\`\`json
{ "$sum": { "$map": { "input": "$items", "in": { "$multiply": ["$$this.qty", "$$this.price"] } } } }
\`\`\`

\`$sum\` over an array expression is not the same \`$sum\` as the group accumulator — the operator is overloaded by context, which is a genuine wart.

**\`$addFields\` vs \`$project\`:** \`$addFields\` keeps every existing field and adds yours; \`$project\` keeps only what you list. Use \`$addFields\` when you want to augment rather than reshape. \`$set\` is an alias for it.`,
  },
  {
    id: 'mongo-array-query',
    engine: 'mongo',
    title: 'Querying inside arrays',
    prompt: 'Return the `_id` of every order containing an item with sku "CB" **and** a quantity of 5 or more on that same item.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Hard',
    topics: ['$elemMatch', 'array queries'],
    orderMatters: false,
    solution: `[
  { "$match": { "items": { "$elemMatch": { "sku": "CB", "qty": { "$gte": 5 } } } } },
  { "$project": { "_id": 1 } }
]`,
    explanation: `**\`$elemMatch\` is the whole question**, and it catches almost everyone.

This looks equivalent but is **wrong**:

\`\`\`json
{ "items.sku": "CB", "items.qty": { "$gte": 5 } }
\`\`\`

Without \`$elemMatch\`, the two conditions are evaluated **independently across the array**. That query matches an order where *one* item has sku CB and a *different* item has qty ≥ 5 — the conditions never have to hold for the same element. Order 3 here has a Keyboard with qty 3 and a Cable with qty 5, so it matches the naive query and should not.

\`$elemMatch\` requires a **single element** to satisfy every condition.

**When you do not need it:** a single condition on an array field already means "any element matches", so \`{ "items.sku": "CB" }\` alone is fine. \`$elemMatch\` only earns its keep with two or more conditions that must apply together.`,
  },
  {
    id: 'mongo-sortbycount',
    engine: 'mongo',
    title: 'Count by value with $sortByCount',
    prompt: 'Return the number of orders per status as `_id` and `count`, most common first.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Easy',
    topics: ['$sortByCount'],
    orderMatters: true,
    solution: `[
  { "$sortByCount": "$status" }
]`,
    explanation: `\`$sortByCount\` is shorthand for the single most common aggregation there is:

\`\`\`json
{ "$group": { "_id": "$status", "count": { "$sum": 1 } } },
{ "$sort": { "count": -1 } }
\`\`\`

Two stages become one, and the output field is always named \`count\` — you do not get to choose, which is the one thing to remember.

It takes an **expression**, not just a field path, so you can bucket on something computed: \`{ "$sortByCount": { "$size": "$items" } }\` counts orders by how many line items they have.

Worth knowing mostly because reviewers notice it — writing the long form is not wrong, but reaching for the shorthand shows familiarity with the pipeline beyond the basics.`,
  },
  {
    id: 'mongo-push-addtoset',
    engine: 'mongo',
    title: 'Collect values into an array',
    prompt: 'For each customer, return `_id` (the customer) and `skus` — the distinct item SKUs they have ever ordered, sorted alphabetically within each customer. Sort the result by `_id`.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Medium',
    topics: ['$unwind', '$addToSet', '$group'],
    orderMatters: true,
    solution: `[
  { "$unwind": "$items" },
  { "$group": { "_id": "$customer", "skus": { "$addToSet": "$items.sku" } } },
  { "$project": { "_id": 1, "skus": { "$sortArray": { "input": "$skus", "sortBy": 1 } } } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `**\`$push\` keeps every value; \`$addToSet\` keeps distinct ones.** That is the whole distinction, and picking the wrong one is a common bug — \`$push\` on a customer who ordered the same SKU twice gives you a duplicate.

**\`$addToSet\` does not guarantee order.** It is a set, so the elements can come back in any sequence. That is why the \`$sortArray\` stage is here — without it the result is unstable between runs, which breaks tests and diffs. (\`$sortArray\` needs MongoDB 5.2+; before that you would \`$unwind\`, \`$sort\`, then \`$group\` with \`$push\`.)

**The SQL analogue** is \`ARRAY_AGG(DISTINCT sku ORDER BY sku)\` — and notice the same trap exists there: the ordering has to be stated explicitly or it is undefined.

**The size limit matters at scale.** A single document cannot exceed 16 MB, and \`$push\`/\`$addToSet\` accumulate into one document per group. Grouping a million events by a low-cardinality key and pushing the full documents will hit that ceiling. Push an id and look the rest up, or aggregate rather than collect.`,
  },
  {
    id: 'mongo-date-group',
    engine: 'mongo',
    title: 'Group by month',
    prompt: 'Return `_id` as the `YYYY-MM` month and `orders`, the number of orders placed in each month. Sort by `_id` ascending.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Medium',
    topics: ['$dateToString', '$toDate', 'dates'],
    orderMatters: true,
    solution: `[
  { "$group": {
      "_id": { "$dateToString": { "format": "%Y-%m", "date": { "$toDate": "$placedAt" } } },
      "orders": { "$sum": 1 }
  } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `Time-bucketing, the MongoDB way.

**\`$toDate\` is needed because \`placedAt\` is stored as a string.** That is worth pausing on: storing dates as strings is a schema smell. It costs you every date operator, range queries become string comparisons that only work because ISO-8601 happens to sort correctly, and time zones are unrepresentable. **Store a real \`Date\`** — the conversion here is a workaround, not a pattern to copy.

**\`$dateToString\`** formats it. \`%Y-%m\` gives a sortable label; the format codes mirror \`strftime\`.

**The alternative is \`$dateTrunc\`** (MongoDB 5.0+), which returns a real Date rather than a string:

\`\`\`json
{ "$group": { "_id": { "$dateTrunc": { "date": "$placedAt", "unit": "month" } }, "orders": { "$sum": 1 } } }
\`\`\`

Prefer it when the result feeds further date maths; use \`$dateToString\` when you want a label.

**Time zones:** every date operator takes an optional \`timezone\`. Without it you get UTC, so "orders per day" silently means "per UTC day" — which is wrong for most reporting and is the kind of bug that only shows up near midnight.`,
  },
  {
    id: 'mongo-cond',
    engine: 'mongo',
    title: 'Conditional fields with $cond',
    prompt: 'For each order return `_id` and `size` — "large" when the order has more than one item, otherwise "small". Sort by `_id`.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Medium',
    topics: ['$cond', '$project', '$size'],
    orderMatters: true,
    solution: `[
  { "$project": {
      "_id": 1,
      "size": { "$cond": [{ "$gt": [{ "$size": "$items" }, 1] }, "large", "small"] }
  } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `\`$cond\` is the pipeline's ternary. Two equivalent forms:

\`\`\`json
{ "$cond": [ <if>, <then>, <else> ] }
{ "$cond": { "if": …, "then": …, "else": … } }
\`\`\`

The object form is worth using once the branches are non-trivial — the array form becomes unreadable when nested.

**For more than two branches, use \`$switch\`** rather than nesting \`$cond\`:

\`\`\`json
{ "$switch": {
    "branches": [
      { "case": { "$gte": ["$total", 500] }, "then": "big" },
      { "case": { "$gte": ["$total", 100] }, "then": "medium" }
    ],
    "default": "small"
} }
\`\`\`

**The distinction that matters:** \`$cond\` is an *aggregation expression*, evaluated per document inside a stage. It is not a query operator — you cannot use it in a \`$match\` filter directly, only inside \`$expr\`.

**And the trap:** \`$size\` throws if the field is missing or is not an array. Guard with \`{ "$size": { "$ifNull": ["$items", []] } }\` when the field is optional, or one malformed document fails the whole pipeline.`,
  },
  {
    id: 'mongo-bucket',
    engine: 'mongo',
    title: 'Histogram with $bucket',
    prompt: 'Bucket orders by their number of items into boundaries [1, 2, 3] with a default bucket "3+". Return `_id` and `n`, the count in each bucket.',
    datasetId: 'mongo-shop',
    collection: 'orders',
    difficulty: 'Hard',
    topics: ['$bucket', '$size', 'histogram'],
    orderMatters: false,
    solution: `[
  { "$bucket": {
      "groupBy": { "$size": "$items" },
      "boundaries": [1, 2, 3],
      "default": "3+",
      "output": { "n": { "$sum": 1 } }
  } }
]`,
    explanation: `\`$bucket\` is a histogram in one stage.

**Boundaries are lower-inclusive, upper-exclusive** — \`[1, 2, 3]\` creates \`[1,2)\` and \`[2,3)\`, and the bucket's \`_id\` is its lower bound. Anything outside every range goes to \`default\`, and **without a \`default\` an out-of-range value is an error, not a silently dropped document** — which is a deliberate design choice and catches people out.

Boundaries must be sorted and all of the same type.

**\`$bucketAuto\`** is the sibling: you give it a bucket *count* and it picks the boundaries to distribute documents evenly. Use it when you do not know the distribution in advance; use \`$bucket\` when the boundaries are meaningful to the business (price bands, age brackets, SLA tiers).

**The \`output\` field replaces the default.** Omit it and you get just a \`count\` per bucket; naming it yourself lets you accumulate anything, e.g. a count and a revenue sum together.`,
  },
  {
    id: 'mongo-graphlookup',
    engine: 'mongo',
    title: 'Hierarchies with $graphLookup',
    prompt: 'From the `employees` collection, return `name` and `reports` — the number of people anywhere below each person in the reporting tree. Sort by `_id`.',
    datasetId: 'mongo-shop',
    collection: 'employees',
    difficulty: 'Hard',
    topics: ['$graphLookup', 'recursion', 'hierarchy'],
    orderMatters: true,
    solution: `[
  { "$graphLookup": {
      "from": "employees",
      "startWith": "$_id",
      "connectFromField": "_id",
      "connectToField": "managerId",
      "as": "tree"
  } },
  { "$project": { "_id": 1, "name": 1, "reports": { "$size": "$tree" } } },
  { "$sort": { "_id": 1 } }
]`,
    explanation: `\`$graphLookup\` is MongoDB's recursive traversal — the counterpart to SQL's \`WITH RECURSIVE\`.

**Reading the four fields is the whole skill:**
- \`startWith\` — the value to begin from, for each input document.
- \`connectToField\` — the field on the *target* documents to match against.
- \`connectFromField\` — the field on a *matched* document whose value feeds the next round.
- \`as\` — the array of everything reached, **flattened**, not nested by level.

Here it walks *downwards*: start from my \`_id\`, find everyone whose \`managerId\` is that, then take *their* \`_id\` and repeat. Swap \`startWith\` to \`$managerId\` and the connect fields around, and the same stage walks *upwards* to the CEO.

**\`maxDepth\` bounds it** (0 means one hop only), and \`depthField\` adds the level to each result — which you need if you want the tree shape rather than a flat set.

**The performance caveat is real.** It runs entirely on the server, holds intermediate results in memory, and is subject to the 100 MB limit. On deep or wide graphs it is slow, and the standard advice is that if graph traversal is a core access pattern, MongoDB may be the wrong store for it — that is what graph databases exist for.`,
    followUp: 'How would you get each person\'s depth in the tree rather than a count? (Add `depthField: "level"` and read it from the entries in `tree`.)',
  },
];
