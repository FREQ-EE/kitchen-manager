# Kitchen data contracts and authoring

Only pantry, recipes and their shopping/storage projections are included. There are no philosophy, health, plants, equipment or other personal modules.

| File | Purpose | Schema |
| --- | --- | --- |
| manifest-index.json | Authoritative pantry collection IDs and paths | manifest-index.schema.json |
| inventory/pantry/ingredients.json | Initial empty pantry collection | pantry.schema.json |
| inventory/pantry/*.json | Optional additional user-created collections | pantry.schema.json |
| recipes/index.json | Ordered recipes and category labels | recipe-index.schema.json |
| recipes/records/*.json | Individual recipes | recipe.schema.json |
| recipes/annotations.json | User favourites and ratings | annotations.schema.json |
| config/storage.json | User-defined storage locations | storage.schema.json |
| config/shopping.json | User-defined aisle route order | shopping.schema.json |

## Pantry inventory

The initial collection is pantry.ingredients. To add a collection, create an inventory/pantry/<slug>.json file and register its unique collection ID/path in manifest-index.json in the same commit. Collection files require schema_version: 1, title, description and items. Each ingredient requires a stable lowercase hyphenated id, name, stock_status and restock_status.

stock_status is in_stock, low, out_of_stock or unknown. restock_status is not_needed, wanted, ordered or unspecified. replenishment_policy is manual or always. These are independent: low stock does not prove someone has ordered a replacement. quantity is a non-negative number or null; unit is a string or null. Use metric units. Optional aliases, category, notes and the other documented schema fields preserve useful detail without requiring it for a simple record.

storage_location and storage_location_alternate are readable names, not an inherited cabinet ID. The settings editor can fill config/storage.json: each store has id, name and places, and each place has id and label. The app displays these as “store name / place label”. Users can also type a freeform location on an ingredient.

## Add a recipe

Create recipes/records/<stable-id>.json, then add {id, path} to recipes/index.json in one commit. Required fields are schema_version (positive integer), id, title, category, status, ingredients and steps. Optional subtitle, summary, yield_text, techniques, tags, equipment, timing, sections, related and provenance are preserved. Categories are open strings; the index can map category IDs to display labels and optional descriptions. No category/recipe is pre-populated.

An ingredient has ref or name. A pantry reference is collection-id:item-id, for example the actual ID in pantry.ingredients followed by the actual ingredient ID; do not invent that ID before reading the pantry. A prepared ingredient can reference another recipe using recipe. quantity is a number, a two-number range or null; unit is explicit. optional marks an ingredient that availability checking can omit. A named ingredient without a pantry reference has unknown availability.

Steps have id and text, with optional title, duration_seconds and temperature_c (a number or a two-number range). Sections can carry text, lists, tables or references; unknown metadata is rendered as structured text rather than executable HTML.

Variants have id, title and overrides, with optional family and description. Base ingredients can use slot names; each override selects that slot and supplies a replacement name/ref/quantity/unit/note, or omit: true. Variants change the selected preparation/export without rewriting the original recipe.

related contains actual recipe IDs. User feedback goes in annotations.json under recipes[recipe-id], with rating (1–5 or null) and favourite (boolean). Keep editorial development status separate from personal feedback. A proposal must not be marked tested/perfected without reported evidence.

Images are optional. Only add user-authorised assets or URLs; the distribution contains no personal recipe imagery.

## Shopping

An item appears when restock_status is wanted, or when replenishment_policy is always and stock_status is low/out_of_stock. Marking it gathered sets in_stock and not_needed. Gathered checkmarks are device-local. Removing an automatically included low-stock item switches its replenishment policy to manual instead of falsifying its stock level.

shopping_zone follows the pantry schema. config/shopping.json contains routes; each has id, name and zones in the desired order. With no personal route supplied, a generic aisle order is used. Include every zone relevant to your inventory to show all items. The application appends missing zones to avoid hiding an item accidentally.

## Editing workflow

Use the Settings JSON editor for existing files, an authorised local repository editor, or ChatGPT with actual GitHub write tools to add/index new files. The frontend handles stock, restocking, location, rating and favourite changes automatically. It is not a full graphical recipe-authoring editor. New recipes and collections are authored as structured records; their schemas and this guide are the portable contract.

Read existing files first, preserve stable IDs and unrelated fields, commit related file/index changes together, and run npm run validate. The validator checks ingredient, related-recipe, preparation and annotation references. A content commit appears in the app on synchronisation without rebuilding the Site.
