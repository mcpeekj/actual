BEGIN TRANSACTION;

-- Per-category "Roll over" toggle. When off (the default), a category starts
-- fresh each month: positive leftover returns to "To Budget" and overspending
-- is forgiven. When on, the category accumulates month to month the way Actual
-- always has. Stored per category-month (like `carryover`) so it rides the
-- existing undo/redo and spreadsheet-cell machinery.
ALTER TABLE zero_budgets ADD COLUMN rollover INTEGER DEFAULT 0;
ALTER TABLE reflect_budgets ADD COLUMN rollover INTEGER DEFAULT 0;

COMMIT;
