-- database/init/103-clean-ref-tags-and-interaction-index.sql
-- Cleans up polluted ref_tag values written while the tracker still read
-- UI-state query parameters (?tab=, ?cuisine=) as attribution, and adds a
-- partial GIN index on page_views.interactions for fast site-wide interaction
-- tallying and ?interaction= filtering.
--
-- Non-destructive cleanup: clears polluted ref_tag labels rather than deleting
-- rows; /admin* rows are additionally excluded by every public reader.
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

UPDATE page_views
   SET ref_tag = NULL
 WHERE ref_tag IS NOT NULL
   AND (
     ref_tag IN (
       'vessel', 'prep', 'cosmic', 'taste', 'budget', 'guests', 'formula',
       'italian', 'mexican', 'japanese', 'mediterranean', 'chinese', 'indian',
       'french', 'thai', 'korean', 'greek', 'spanish', 'american', 'vietnamese',
       'middle-eastern', 'balanced', 'vegetarian', 'vegan', 'pescatarian',
       'high-protein', 'all', 'live', 'engaged', 'stuck', 'error', 'ref', 'returning'
     )
     OR ref_tag ~* '^(tab|cuisine|sort|page|filter|preset|q|session|view|meal|element)[:=]'
     OR path = '/admin'
     OR path LIKE '/admin/%'
   );

CREATE INDEX IF NOT EXISTS idx_page_views_interactions_gin
    ON page_views USING GIN (interactions)
    WHERE is_bot = false;
