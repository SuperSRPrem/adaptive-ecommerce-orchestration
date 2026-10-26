import { MOCK_PRODUCTS, formatINR } from '../data/mockProducts.js';
import { getCategoryById } from '../data/categories.js';
import { getAdapterStatus, isLiveBackendConfigured } from './api.js';

const SYNONYM_DICTIONARY = {
  fridge: ['refrigerator', 'cooling', 'frost free', 'double door'],
  refrigerator: ['fridge', 'frost free', 'double door', 'inverter'],
  quiet: ['inverter', 'digital inverter', 'smart inverter', 'silent'],
  reliable: ['inverter', '4 star', '5 star', 'bespoke', 'smart diagnosis', 'twin cooling'],
  'small family': ['200 – 300 l', '300 – 450 l', 'double door', '253l', '242l', '236l', '324l', '458l'],
  '3 people': ['200 – 300 l', '300 – 450 l', 'double door', 'small family'],
  'large family': ['458l', '559l', '423l', 'french door', 'double door'],
  'energy efficient': ['4 star', '5 star', 'inverter', 'ai energy mode', '3 star'],
  phone: ['smartphone', '5g', 'mobile', 'amoled', 'iphone', 'galaxy'],
  smartphone: ['phone', '5g', 'mobile', 'camera'],
  watch: ['smartwatch', 'wearable', 'gps', 'fitness', 'bluetooth'],
  laptop: ['ultrabook', 'notebook', 'ssd', 'ram', 'core', 'macbook'],
};

/**
 * Escapes regex special characters for safe word-boundary matching.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether a token or multi-word phrase appears as a whole word/phrase in text.
 * Prevents short tokens like "ai" from matching "stainless" or "daily".
 */
export function matchesWholeTerm(haystackLower, termLower) {
  if (!haystackLower || !termLower) return false;
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(termLower)}([^a-z0-9]|$)`, 'i');
  return pattern.test(haystackLower);
}

/**
 * Extracts structured constraints and detects contradictions from a natural language query.
 */
export function parseQueryConstraints(
  queryText = '',
  categoryId = 'refrigerator',
  selectedAttributes = null,
  searchType = selectedAttributes ? 'general' : 'specific'
) {
  const raw = (queryText || '').trim();
  const lower = raw.toLowerCase();
  const tokens = raw === '' ? [] : raw.split(/\s+/);
  const estimatedSubwordTokens = raw === '' ? 0 : Math.ceil(tokens.length * 1.3);

  const detected = [];
  const contradictions = [];
  const categoryObj = getCategoryById(categoryId);

  // 1. Detect Brand
  const allBrands = [
    'Samsung',
    'LG',
    'Whirlpool',
    'Godrej',
    'Haier',
    'Bosch',
    'Apple',
    'OnePlus',
    'Lenovo',
    'Sony',
  ];
  const matchedBrands = allBrands.filter((b) => matchesWholeTerm(lower, b.toLowerCase()));
  if (matchedBrands.length > 0) {
    detected.push({
      type: 'Brand',
      value: matchedBrands.join(', '),
      source: 'explicit_query',
    });
  }

  // 2. Detect Color / Finish (and check if multiple conflicting colors are requested)
  const colorMap = [
    { keywords: ['white', 'clean white', 'ice white'], label: 'White' },
    {
      keywords: ['silver', 'steel', 'stainless', 'inox', 'cloud grey'],
      label: 'Silver / Stainless Steel',
    },
    { keywords: ['black', 'obsidian'], label: 'Black Gloss' },
    { keywords: ['titanium', 'gunmetal', 'graphite', 'grey', 'gray'], label: 'Gunmetal Grey' },
  ];
  const matchedColors = [];
  for (const c of colorMap) {
    if (c.keywords.some((kw) => matchesWholeTerm(lower, kw))) {
      matchedColors.push(c.label);
    }
  }
  if (matchedColors.length > 0) {
    detected.push({
      type: 'Color',
      value: matchedColors[0],
      allColors: matchedColors,
      source: 'explicit_query',
    });
    if (matchedColors.length > 1) {
      contradictions.push(
        `Multiple conflicting exterior colors requested (${matchedColors.join(' vs ')})`
      );
    }
  }

  // 3. Detect Budget / Price constraint
  // Use a specific regex that ignores small non-price ranges like "2-3 people" or "5-in-1"
  const rangeRegex =
    /(?:between|from)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(k)?\s*(?:and|to|-|–)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(k)?(?!\s*(?:l|liters|litres|people|members|person|star|in-1))/gi;
  let rangeParsed = null;
  let match;
  while ((match = rangeRegex.exec(lower)) !== null) {
    const rawMin = parseInt(match[1].replace(/,/g, ''), 10);
    const rawMax = parseInt(match[3].replace(/,/g, ''), 10);
    const candidateMin = match[2] ? rawMin * 1000 : rawMin;
    const candidateMax = match[4] ? rawMax * 1000 : rawMax;
    if (candidateMin >= 1000 || candidateMax >= 1000) {
      rangeParsed = { min: candidateMin, max: candidateMax };
      break;
    }
  }

  const underMatch = lower.match(
    /(?:under|below|less than|max|up to)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)\s*(k)?/i
  );

  let maxBudget = null;
  let minBudget = null;

  if (rangeParsed) {
    minBudget = rangeParsed.min;
    maxBudget = rangeParsed.max;
    if (minBudget > maxBudget) {
      contradictions.push(
        `Contradictory budget range: minimum (${formatINR(minBudget)}) exceeds maximum (${formatINR(
          maxBudget
        )})`
      );
    }
    detected.push({
      type: 'Budget',
      value: `${formatINR(minBudget)}–${formatINR(maxBudget)}`,
      min: minBudget,
      max: maxBudget,
      source: 'explicit_query',
    });
  } else if (underMatch) {
    const rawVal = parseInt(underMatch[1].replace(/,/g, ''), 10);
    maxBudget = underMatch[2] ? rawVal * 1000 : rawVal;
    if (maxBudget >= 500) {
      detected.push({
        type: 'Budget',
        value: `Under ${formatINR(maxBudget)}`,
        max: maxBudget,
        source: 'explicit_query',
      });
    }
  } else if (lower.includes('within my budget') || matchesWholeTerm(lower, 'budget')) {
    if (searchType === 'general' && selectedAttributes) {
      minBudget = Number(selectedAttributes.minPrice) || categoryObj.defaultBudget.min;
      maxBudget = Number(selectedAttributes.maxPrice) || categoryObj.defaultBudget.max;
      detected.push({
        type: 'Budget',
        value: `Configured Budget (${formatINR(minBudget)}–${formatINR(maxBudget)})`,
        min: minBudget,
        max: maxBudget,
        source: 'session_context',
      });
    } else {
      detected.push({
        type: 'Budget',
        value: 'Value / Budget-Conscious',
        source: 'inferred_intent',
      });
    }
  }

  // 4. Detect Capacity / Storage / Size
  const litersMatches = [...lower.matchAll(/(\d{3})\s*(?:l|liters|litres)/gi)];
  const storageMatch = lower.match(/(\d{2,4})\s*(?:gb|tb)/i);
  const mmMatch = lower.match(/(40|44|45|46|49)\s*mm/i);

  let numericLiters = null;
  if (litersMatches.length > 0) {
    numericLiters = parseInt(litersMatches[0][1], 10);
    detected.push({
      type: 'Capacity',
      value: `${numericLiters} Liters`,
      numericLiters,
      source: 'explicit_query',
    });
    if (litersMatches.length > 1) {
      const distinctLiters = Array.from(new Set(litersMatches.map((m) => m[1])));
      if (distinctLiters.length > 1) {
        contradictions.push(
          `Conflicting capacity values requested (${distinctLiters.map((v) => `${v}L`).join(' vs ')})`
        );
      }
    }
  } else if (
    lower.includes('small family') ||
    lower.includes('3 people') ||
    lower.includes('2-3')
  ) {
    detected.push({
      type: 'Capacity',
      value: 'Small Family (230L–460L)',
      source: 'inferred_intent',
    });
  } else if (lower.includes('large family') || lower.includes('french door')) {
    detected.push({
      type: 'Capacity',
      value: 'Large Family (420L+)',
      source: 'inferred_intent',
    });
  } else if (storageMatch) {
    detected.push({
      type: 'Storage/Memory',
      value: storageMatch[0].toUpperCase(),
      source: 'explicit_query',
    });
  } else if (mmMatch) {
    detected.push({
      type: 'Dial Size',
      value: `${mmMatch[1]}mm`,
      source: 'explicit_query',
    });
  }

  // Check structural contradictions (e.g. single door + double/french door, or >450L under ₹15,000)
  if (lower.includes('single door') && (lower.includes('double door') || lower.includes('french door'))) {
    contradictions.push('Contradictory door configuration: both Single Door and Double/French Door requested');
  }
  if (numericLiters && numericLiters >= 400 && maxBudget && maxBudget < 25000) {
    contradictions.push(
      `Unrealistic constraint combination: ${numericLiters}L capacity requested under ${formatINR(
        maxBudget
      )}`
    );
  }
  if (lower.includes('single door') && numericLiters && numericLiters >= 300) {
    contradictions.push(
      `Contradictory appliance spec: Single Door requested with ${numericLiters}L multi-door capacity`
    );
  }

  // 5. Detect Feature / Intent
  const intentFeatures = [];
  if (lower.includes('frost free')) intentFeatures.push('Frost Free');
  if (lower.includes('direct cool')) intentFeatures.push('Direct Cool');
  if (lower.includes('inverter')) intentFeatures.push('Inverter');
  if (lower.includes('quiet') || lower.includes('silent')) intentFeatures.push('Low Noise');
  if (lower.includes('reliable') || lower.includes('durable')) intentFeatures.push('High Reliability');
  if (lower.includes('energy') || lower.includes('star')) intentFeatures.push('Energy Efficient');
  if (lower.includes('glass') || lower.includes('bespoke')) intentFeatures.push('Glass Finish');
  if (lower.includes('double door')) intentFeatures.push('Double Door');
  if (lower.includes('single door')) intentFeatures.push('Single Door');
  if (lower.includes('camera') || lower.includes('photography')) intentFeatures.push('Flagship Camera');
  if (lower.includes('gaming') || lower.includes('rtx')) intentFeatures.push('Gaming GPU');
  if (lower.includes('sleep') || lower.includes('gps') || lower.includes('health')) {
    intentFeatures.push('Health/GPS');
  }

  if (intentFeatures.includes('Frost Free') && intentFeatures.includes('Direct Cool')) {
    contradictions.push('Contradictory defrost technology: both Frost Free and Direct Cool requested');
  }

  if (intentFeatures.length > 0) {
    detected.push({
      type: 'Intent',
      value: intentFeatures.slice(0, 3).join(' · '),
      features: intentFeatures,
      source: 'explicit_query',
    });
  }

  return {
    rawQuery: raw,
    charCount: raw.length,
    wordCount: tokens.length,
    estimatedTokens: estimatedSubwordTokens,
    constraints: detected,
    constraintCount: detected.length,
    contradictions,
    hasContradictions: contradictions.length > 0,
    parsedColor: detected.find((d) => d.type === 'Color')?.value || null,
    parsedBrands: matchedBrands,
    parsedBudget: { min: minBudget, max: maxBudget },
    parsedLiters: numericLiters,
    parsedStorage: storageMatch ? storageMatch[0].toUpperCase() : null,
    parsedDialMm: mmMatch ? `${mmMatch[1]}mm` : null,
    parsedFeatures: intentFeatures,
  };
}

/**
 * Evaluates catalog products against General Search configuration attributes.
 * Explicitly reports which constraints are satisfied, which were relaxed, and whether the input budget is contradictory.
 */
export function evaluateGeneralSearchCandidates(categoryId, attributes) {
  const categoryProducts = MOCK_PRODUCTS.filter((p) => p.category === categoryId);
  const minPrice = Number(attributes?.minPrice) || 0;
  const maxPrice =
    attributes?.maxPrice !== undefined && attributes?.maxPrice !== null
      ? Number(attributes.maxPrice)
      : Infinity;
  const isBudgetInverted = minPrice > maxPrice;

  const preferredColor = attributes?.color || null;
  const preferredPrimarySpec = attributes?.primarySpec || null;
  const preferredBrands = Array.isArray(attributes?.brands) ? attributes.brands : [];
  const preferredSecondarySpec = attributes?.secondarySpec || null;

  const evaluated = categoryProducts.map((product) => {
    const matched = [];
    const relaxed = [];

    // 1. Price check
    if (isBudgetInverted) {
      relaxed.push(
        `Contradictory budget range configured: min ${formatINR(minPrice)} > max ${formatINR(maxPrice)}`
      );
    } else if (product.price >= minPrice && product.price <= maxPrice) {
      matched.push(`Budget (${formatINR(minPrice)}–${formatINR(maxPrice)})`);
    } else if (product.price > maxPrice) {
      relaxed.push(`Price ${formatINR(product.price)} exceeds max budget ${formatINR(maxPrice)}`);
    } else {
      relaxed.push(`Price ${formatINR(product.price)} is below min ${formatINR(minPrice)}`);
    }

    // 2. Color check
    if (!preferredColor || product.attributes.color === preferredColor) {
      matched.push(`Color (${product.attributes.color})`);
    } else {
      relaxed.push(`Color is ${product.attributes.color} instead of ${preferredColor}`);
    }

    // 3. Primary Spec (Capacity / Storage / Case Size)
    const prodPrimary =
      product.attributes.capacityBracket ||
      product.attributes.storageBracket ||
      product.attributes.caseBracket ||
      product.attributes.capacity;
    if (!preferredPrimarySpec || prodPrimary === preferredPrimarySpec) {
      matched.push(`Spec (${prodPrimary})`);
    } else {
      relaxed.push(`Spec is ${prodPrimary} (requested ${preferredPrimarySpec})`);
    }

    // 4. Brand check
    if (preferredBrands.length === 0 || preferredBrands.includes(product.brand)) {
      matched.push(`Brand (${product.brand})`);
    } else {
      relaxed.push(`Brand is ${product.brand} (preferred: ${preferredBrands.join('/')})`);
    }

    // 5. Secondary Spec (Energy / Display / Endurance)
    if (preferredSecondarySpec) {
      const starsMatch = preferredSecondarySpec.match(/(\d)\s*Star/i);
      if (starsMatch) {
        const minStars = parseInt(starsMatch[1], 10);
        if ((product.attributes.energyStars || 3) >= minStars) {
          matched.push(`Efficiency (${product.attributes.energyRating})`);
        } else {
          relaxed.push(`Efficiency is ${product.attributes.energyRating} (< ${minStars}★)`);
        }
      } else {
        matched.push(`Tier (${product.attributes.energyRating})`);
      }
    }

    const totalChecks = matched.length + relaxed.length;
    const matchRatio = totalChecks > 0 ? matched.length / totalChecks : 1;

    return {
      product,
      matchedConstraints: matched,
      relaxedConstraints: relaxed,
      isExactMatch: relaxed.length === 0,
      matchScore: Math.round(matchRatio * 100),
    };
  });

  const budgetMid = isBudgetInverted ? minPrice : (minPrice + maxPrice) / 2;
  evaluated.sort((a, b) => {
    if (a.relaxedConstraints.length !== b.relaxedConstraints.length) {
      return a.relaxedConstraints.length - b.relaxedConstraints.length;
    }
    const distA = Math.abs(a.product.price - budgetMid);
    const distB = Math.abs(b.product.price - budgetMid);
    return distA - distB;
  });

  const exactMatches = evaluated.filter((item) => item.isExactMatch);

  return {
    allEvaluated: evaluated,
    exactMatches,
    topCandidates: evaluated.slice(0, 4),
    recommendedBenchmark: evaluated[0] || null,
    isBudgetInverted,
  };
}

/**
 * Helper to tokenize text into lowercase alphanumeric words
 */
function tokenize(text = '') {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9₹\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * CONDITION A: Baseline Search
 * Unoptimized lexical keyword retrieval within the category using whole-word matching.
 * Does NOT apply synonym expansion, semantic attribute boosting, or constraint orchestration.
 * Does NOT peek at targetProduct during scoring.
 */
export async function runBaselineSearch({ query, category, targetProduct }) {
  const start = performance.now();
  const trimmedQuery = (query || '').trim();
  const queryTokens = tokenize(trimmedQuery);
  const stopWords = new Set([
    'find',
    'me',
    'for',
    'within',
    'my',
    'with',
    'and',
    'the',
    'under',
    'between',
    'need',
    'want',
  ]);
  const contentTokens = queryTokens.filter((t) => !stopWords.has(t));

  const activeCategory = category || targetProduct?.category || 'refrigerator';
  const pool = MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const scored = pool.map((product) => {
    if (contentTokens.length === 0) {
      return {
        product,
        score: 0,
        matchedTerms: [],
        explanation: 'Empty query — no lexical tokens to match',
        pipelineTag: 'No Query Tokens',
      };
    }

    const searchableText = [
      product.name,
      product.brand,
      product.sku,
      product.description,
      ...(product.specBadges || []),
    ]
      .join(' ')
      .toLowerCase();

    let hits = 0;
    const matchedWords = [];
    for (const token of contentTokens) {
      if (matchesWholeTerm(searchableText, token)) {
        hits += 1;
        matchedWords.push(token);
      }
    }

    // Naive lexical bias: literal word "budget" in query matches literal "Budget Friendly" badge
    const hasBudgetWord = contentTokens.includes('budget');
    const lexicalBudgetBoost =
      hasBudgetWord && matchesWholeTerm(searchableText, 'budget') ? 1.5 : 0;

    const rawScore =
      hits === 0 ? 0 : (hits + lexicalBudgetBoost) / (contentTokens.length + 1);

    let explanation = '0 query terms matched in indexed fields';
    if (
      hasBudgetWord &&
      matchesWholeTerm(searchableText, 'budget') &&
      product.attributes.capacityLiters &&
      product.attributes.capacityLiters < 200
    ) {
      explanation = `Under-sized for family · Literal keyword match on "budget" (${product.attributes.capacity})`;
    } else if (matchedWords.length > 0) {
      explanation = `Lexical match (${matchedWords.length}/${contentTokens.length} terms): ${matchedWords
        .slice(0, 4)
        .join(', ')}`;
    }

    return {
      product,
      score: Math.min(0.95, Number(rawScore.toFixed(2))),
      matchedTerms: matchedWords,
      explanation,
      pipelineTag:
        hits === 0
          ? 'No Keyword Match'
          : hits >= 2
          ? 'Partial Lexical Match'
          : 'Keyword Hit',
    };
  });

  scored.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
  const elapsedMs = Math.max(1, Math.round(performance.now() - start));

  return buildConditionOutput({
    conditionId: 'baseline',
    pipelineCode: 'PIPELINE 01',
    conditionName: 'Baseline Search',
    description:
      'No query optimization or orchestration. Exact keyword ranking across indexed fields.',
    scoredItems: scored,
    targetProduct,
    elapsedMs,
    orchestrationEnabled: false,
    optimizationEnabled: false,
  });
}

/**
 * CONDITION B: Optimized Search (Without Orchestration)
 * Expands query with domain synonyms and boosts query-parsed semantic attributes,
 * but does NOT run multi-step intent routing, numeric budget filtering, or target peeking.
 */
export async function runOptimizedSearch({
  query,
  category,
  targetProduct,
  parsedConstraints,
}) {
  const start = performance.now();
  const trimmedQuery = (query || '').trim();
  const activeCategory = category || targetProduct?.category || 'refrigerator';
  const parsed =
    parsedConstraints || parseQueryConstraints(trimmedQuery, activeCategory, null, 'specific');

  const baseTokens = tokenize(trimmedQuery);
  const expandedSet = new Set(baseTokens);

  const lowerQuery = trimmedQuery.toLowerCase();
  Object.entries(SYNONYM_DICTIONARY).forEach(([phrase, expansions]) => {
    if (matchesWholeTerm(lowerQuery, phrase)) {
      expansions.forEach((term) => expandedSet.add(term.toLowerCase()));
    }
  });

  const expandedTokens = Array.from(expandedSet);
  const pool = MOCK_PRODUCTS.filter((p) => p.category === activeCategory);

  const scored = pool.map((product) => {
    if (expandedTokens.length === 0) {
      return {
        product,
        score: 0,
        expandedTermCount: 0,
        explanation: 'Empty query — no expanded terms to score',
        pipelineTag: 'No Query Tokens',
      };
    }

    const fullCorpus = [
      product.name,
      product.brand,
      product.description,
      product.attributes.color,
      product.attributes.finish,
      product.attributes.capacity,
      ...(product.specBadges || []),
      ...(product.attributes.keywords || []),
    ]
      .join(' ')
      .toLowerCase();

    let hits = 0;
    for (const term of expandedTokens) {
      if (matchesWholeTerm(fullCorpus, term)) {
        hits += 1;
      }
    }

    // Semantic attribute boost based strictly on query-parsed attributes (NO targetProduct peeking!)
    let attributeBoost = 0;
    if (parsed.parsedColor && product.attributes.color === parsed.parsedColor) {
      attributeBoost += 0.25;
    }
    if (parsed.parsedBrands?.length > 0 && parsed.parsedBrands.includes(product.brand)) {
      attributeBoost += 0.22;
    }
    if (
      parsed.parsedLiters &&
      product.attributes.capacityLiters &&
      Math.abs(product.attributes.capacityLiters - parsed.parsedLiters) <= 30
    ) {
      attributeBoost += 0.2;
    }
    if (
      parsed.parsedStorage &&
      product.attributes.capacity.toUpperCase().includes(parsed.parsedStorage)
    ) {
      attributeBoost += 0.2;
    }
    if (parsed.parsedDialMm && product.badgeLabel === parsed.parsedDialMm) {
      attributeBoost += 0.2;
    }

    const baseRatio = hits / expandedTokens.length;
    const rawScore = hits === 0 && attributeBoost === 0 ? 0 : baseRatio * 0.65 + attributeBoost;
    const finalScore = Math.min(0.96, Number(rawScore.toFixed(2)));

    let explanation =
      hits === 0
        ? '0 expanded terms matched'
        : `Expanded term match (${hits}/${expandedTokens.length} terms)`;
    let pipelineTag = hits === 0 ? 'No Semantic Match' : 'Semantic Match';

    if (parsed.parsedColor && product.attributes.color === parsed.parsedColor && hits > 0) {
      pipelineTag = 'Color & Spec Match';
      explanation = `Relevance boosted via synonym expansion & ${product.attributes.color} attribute alignment`;
    }

    return {
      product,
      score: finalScore,
      expandedTermCount: expandedTokens.length,
      explanation,
      pipelineTag,
    };
  });

  scored.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
  const elapsedMs = Math.max(1, Math.round(performance.now() - start));

  return buildConditionOutput({
    conditionId: 'optimized',
    pipelineCode: 'PIPELINE 02',
    conditionName: 'Optimized Search',
    description:
      'Query expansion & attribute boosting enabled. Semantic vectors activated. Orchestration disabled.',
    scoredItems: scored,
    targetProduct,
    elapsedMs,
    orchestrationEnabled: false,
    optimizationEnabled: true,
    expandedTokens,
  });
}

/**
 * CONDITION C: Optimized + Orchestrated Search
 * Applies query optimization AND multi-step orchestration:
 * intent routing, facet extraction, and constraint verification derived strictly from the query
 * (and General Search session filters when searchType === 'general').
 * Does NOT peek at targetProduct.id during scoring.
 */
export async function runOrchestratedSearch({
  query,
  category,
  targetProduct,
  parsedConstraints,
  selectedAttributes,
  searchType = 'specific',
}) {
  const start = performance.now();
  const trimmedQuery = (query || '').trim();
  const activeCategory = category || targetProduct?.category || 'refrigerator';
  const parsed =
    parsedConstraints ||
    parseQueryConstraints(trimmedQuery, activeCategory, selectedAttributes, searchType);

  const pool = MOCK_PRODUCTS.filter((p) => p.category === activeCategory);
  const baseTokens = tokenize(trimmedQuery);

  const desiredColor =
    parsed.parsedColor || (searchType === 'general' ? selectedAttributes?.color : null);
  const budgetMax =
    parsed.parsedBudget?.max ||
    (searchType === 'general' ? Number(selectedAttributes?.maxPrice) : null);
  const budgetMin =
    parsed.parsedBudget?.min ||
    (searchType === 'general' ? Number(selectedAttributes?.minPrice) : null);
  const isBudgetValid = !budgetMin || !budgetMax || budgetMin <= budgetMax;

  const scored = pool.map((product) => {
    if (baseTokens.length === 0) {
      return {
        product,
        score: 0,
        matchedFacets: [],
        constraintNotes: [],
        explanation: 'Empty query — no intent facets routed',
        pipelineTag: 'No Query Tokens',
      };
    }

    let score = 0;
    const matchedFacets = [];
    const constraintNotes = [];

    // 1. Lexical & Keyword Foundation
    const corpus = [
      product.name,
      product.brand,
      product.sku,
      product.description,
      product.attributes.color,
      product.attributes.finish,
      product.attributes.capacity,
      ...(product.specBadges || []),
      ...(product.attributes.keywords || []),
    ]
      .join(' ')
      .toLowerCase();

    let lexicalHits = 0;
    for (const token of baseTokens) {
      if (matchesWholeTerm(corpus, token)) {
        lexicalHits += 1;
      }
    }
    if (lexicalHits > 0) {
      score += Math.min(0.25, (lexicalHits / baseTokens.length) * 0.25);
    }

    // 2. Color Facet Routing
    if (desiredColor) {
      if (product.attributes.color === desiredColor) {
        score += 0.24;
        matchedFacets.push(`Color: ${product.attributes.color}`);
      } else {
        score -= 0.12;
        constraintNotes.push(`Color mismatch (${product.attributes.color})`);
      }
    }

    // 3. Brand Facet Routing
    const desiredBrands =
      parsed.parsedBrands?.length > 0
        ? parsed.parsedBrands
        : searchType === 'general' && selectedAttributes?.brands?.length > 0
        ? selectedAttributes.brands
        : [];
    if (desiredBrands.length > 0) {
      if (desiredBrands.includes(product.brand)) {
        score += 0.2;
        matchedFacets.push(`Brand: ${product.brand}`);
      } else {
        score -= 0.08;
      }
    }

    // 4. Budget Facet Verification
    if (budgetMax && isBudgetValid) {
      if (product.price <= budgetMax && (!budgetMin || product.price >= budgetMin)) {
        score += 0.18;
        matchedFacets.push(`Budget: ${formatINR(product.price)}`);
      } else if (product.price > budgetMax) {
        score -= 0.15;
        constraintNotes.push(`Exceeds ${formatINR(budgetMax)}`);
      }
    }

    // 5. Capacity / Storage / Dial Size Facet Routing
    if (parsed.parsedLiters && product.attributes.capacityLiters) {
      const diff = Math.abs(product.attributes.capacityLiters - parsed.parsedLiters);
      if (diff === 0) {
        score += 0.25;
        matchedFacets.push(`Exact Volume: ${product.attributes.capacity}`);
      } else if (diff <= 40) {
        score += 0.14;
        matchedFacets.push(`Near Volume: ${product.attributes.capacity}`);
      }
    } else if (
      trimmedQuery.toLowerCase().includes('small family') ||
      trimmedQuery.toLowerCase().includes('3 people')
    ) {
      if (product.attributes.familySize === 'Small Family (2–3 members)') {
        score += 0.18;
        matchedFacets.push(`Family Profile: ${product.attributes.capacity}`);
      } else if (product.attributes.capacityLiters && product.attributes.capacityLiters < 200) {
        score -= 0.15;
        constraintNotes.push('Under-sized (<200L) for family');
      }
    } else if (trimmedQuery.toLowerCase().includes('large family')) {
      if (product.attributes.familySize === 'Large Family (4+ members)') {
        score += 0.18;
        matchedFacets.push(`Large Family: ${product.attributes.capacity}`);
      }
    } else if (
      parsed.parsedStorage &&
      product.attributes.capacity.toUpperCase().includes(parsed.parsedStorage)
    ) {
      score += 0.22;
      matchedFacets.push(`Storage: ${product.attributes.capacity}`);
    } else if (parsed.parsedDialMm && product.badgeLabel === parsed.parsedDialMm) {
      score += 0.22;
      matchedFacets.push(`Dial: ${product.badgeLabel}`);
    } else if (searchType === 'general' && selectedAttributes?.primarySpec) {
      const prodSpec =
        product.attributes.capacityBracket ||
        product.attributes.storageBracket ||
        product.attributes.caseBracket;
      if (prodSpec === selectedAttributes.primarySpec) {
        score += 0.16;
        matchedFacets.push(`Spec: ${prodSpec}`);
      }
    }

    // 6. Intent & Reliability Facet Routing
    if (parsed.parsedFeatures?.includes('High Reliability')) {
      if (product.rating >= 4.7 && (product.attributes.energyStars || 3) >= 4) {
        score += 0.18;
        matchedFacets.push(`Reliability: ${product.rating}★ (${product.attributes.energyRating})`);
      } else if (product.rating >= 4.6) {
        score += 0.1;
        matchedFacets.push(`Rated ${product.rating}★`);
      }
    }
    if (parsed.parsedFeatures?.includes('Frost Free')) {
      if (product.attributes.defrostType.toLowerCase().includes('frost free')) {
        score += 0.12;
        matchedFacets.push('Frost Free');
      } else {
        score -= 0.15;
      }
    }
    if (parsed.parsedFeatures?.includes('Glass Finish')) {
      if (product.attributes.finish.toLowerCase().includes('glass')) {
        score += 0.14;
        matchedFacets.push(product.attributes.finish);
      }
    }
    if (
      parsed.parsedFeatures?.includes('Inverter') ||
      parsed.parsedFeatures?.includes('Low Noise')
    ) {
      if (corpus.includes('inverter')) {
        score += 0.1;
        matchedFacets.push('Inverter Compressor');
      }
    }

    const clampedScore = Math.max(0, Math.min(0.99, Number(score.toFixed(2))));
    const facetSummary =
      matchedFacets.length > 0
        ? `Orchestrated facets: [${matchedFacets.join('] + [')}]`
        : lexicalHits > 0
        ? `Lexical fallback (${lexicalHits} terms matched)`
        : '0 query constraints or terms matched';

    return {
      product,
      score: clampedScore,
      matchedFacets,
      constraintNotes,
      explanation: facetSummary,
      pipelineTag:
        clampedScore === 0
          ? 'No Facet Match'
          : clampedScore >= 0.65
          ? 'Optimal Facet Fit'
          : 'Partial Facet Fit',
    };
  });

  scored.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
  const elapsedMs = Math.max(1, Math.round(performance.now() - start));

  return buildConditionOutput({
    conditionId: 'orchestrated',
    pipelineCode: 'PIPELINE 03',
    conditionName: 'Optimized + Orchestrated',
    description:
      'Intent routing, dynamic facet filtering, and coordinated multi-hop discovery enabled.',
    scoredItems: scored,
    targetProduct,
    elapsedMs,
    orchestrationEnabled: true,
    optimizationEnabled: true,
  });
}

function buildConditionOutput({
  conditionId,
  pipelineCode,
  conditionName,
  description,
  scoredItems,
  targetProduct,
  elapsedMs,
  orchestrationEnabled,
  optimizationEnabled,
  expandedTokens,
}) {
  const topResults = scoredItems.slice(0, 3);
  const hasAnyPositiveMatch = scoredItems.some((item) => item.score > 0);

  const fullRankIndex =
    targetProduct && hasAnyPositiveMatch
      ? scoredItems.findIndex((item) => item.product.id === targetProduct.id && item.score > 0)
      : -1;
  const targetRank = fullRankIndex >= 0 ? fullRankIndex + 1 : null;
  const targetInTop3 = targetRank !== null && targetRank <= 3;
  const reciprocalRank = targetRank ? Number((1 / targetRank).toFixed(2)) : 0;

  // Calculate actual attribute match rate across top 3 results relative to targetProduct
  let matchingAttributeCount = 0;
  let totalAttributeChecks = 0;
  if (targetProduct && hasAnyPositiveMatch) {
    topResults.forEach(({ product, score }) => {
      totalAttributeChecks += 3;
      if (score > 0) {
        if (product.category === targetProduct.category) matchingAttributeCount += 1;
        if (product.attributes.color === targetProduct.attributes.color) matchingAttributeCount += 1;
        if (
          product.attributes.capacityBracket === targetProduct.attributes.capacityBracket ||
          product.attributes.storageBracket === targetProduct.attributes.storageBracket ||
          product.attributes.caseBracket === targetProduct.attributes.caseBracket
        ) {
          matchingAttributeCount += 1;
        }
      }
    });
  }
  const attributeMatchRate =
    totalAttributeChecks > 0 ? Math.round((matchingAttributeCount / totalAttributeChecks) * 100) : 0;

  // Color fidelity summary across top 3
  const colorsInTop3 = Array.from(new Set(topResults.map((r) => r.product.attributes.color)));
  const targetColor = targetProduct?.attributes?.color || 'White';
  const colorMatchesCount = hasAnyPositiveMatch
    ? topResults.filter((r) => r.product.attributes.color === targetColor && r.score > 0).length
    : 0;

  return {
    conditionId,
    pipelineCode,
    conditionName,
    description,
    orchestrationEnabled,
    optimizationEnabled,
    expandedTokens: expandedTokens || [],
    adapterMode: isLiveBackendConfigured() ? 'live' : 'demo',
    executionTimeMs: elapsedMs,
    hasAnyPositiveMatch,
    results: topResults.map((item, idx) => {
      const isTargetMatch = Boolean(
        targetProduct && item.product.id === targetProduct.id && item.score > 0
      );
      return {
        rank: idx + 1,
        product: item.product,
        score: item.score,
        explanation: item.explanation,
        pipelineTag: isTargetMatch ? 'Target Match' : item.pipelineTag,
        matchedFacets: item.matchedFacets || [],
        isTargetMatch,
      };
    }),
    metrics: {
      targetRank,
      targetInTop3,
      reciprocalRank,
      attributeMatchRate,
      colorMatchesCount,
      colorsInTop3,
      topResultCount: topResults.length,
    },
  };
}

/**
 * Executes all three search conditions and builds the comparative evaluation summary.
 */
export async function executeThreeWayComparison({
  query,
  category,
  targetProduct,
  selectedAttributes,
  experimentAssignment,
  searchType = 'specific',
}) {
  const trimmedQuery = (query || '').trim();
  const parsedConstraints = parseQueryConstraints(
    trimmedQuery,
    category,
    selectedAttributes,
    searchType
  );

  const [baseline, optimized, orchestrated] = await Promise.all([
    runBaselineSearch({ query: trimmedQuery, category, targetProduct }),
    runOptimizedSearch({
      query: trimmedQuery,
      category,
      targetProduct,
      parsedConstraints,
    }),
    runOrchestratedSearch({
      query: trimmedQuery,
      category,
      targetProduct,
      parsedConstraints,
      selectedAttributes,
      searchType,
    }),
  ]);

  const byCondition = {
    baseline,
    optimized,
    orchestrated,
  };

  const assignmentOrder = experimentAssignment?.columns || [
    {
      displayLabel: 'Search Experience A',
      shortCode: 'exp_a',
      variantLabel: 'Variant A',
      conditionId: 'baseline',
    },
    {
      displayLabel: 'Search Experience B',
      shortCode: 'exp_b',
      variantLabel: 'Variant B',
      conditionId: 'optimized',
    },
    {
      displayLabel: 'Search Experience C',
      shortCode: 'exp_c',
      variantLabel: 'Variant C',
      conditionId: 'orchestrated',
    },
  ];

  const orderedColumns = assignmentOrder.map((slot) => ({
    ...slot,
    data: byCondition[slot.conditionId],
  }));

  return {
    executedAt: new Date().toISOString(),
    adapterStatus: getAdapterStatus(),
    query: trimmedQuery,
    parsedConstraints,
    targetProduct,
    byCondition,
    orderedColumns,
  };
}
