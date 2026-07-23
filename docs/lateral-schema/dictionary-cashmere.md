# Cashmere — Schema Data Dictionary

Source: Cashmere DB — all tables. **57 tables, 572 columns, 71 inferred joins.**

> Relationships are INFERRED from column-naming conventions; these schemas have no foreign-key constraints. Treat inferred joins as a starting map to verify, not a contract.


## All tables


### `address`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| address_ln1 | varchar(100) |  |  |  |
| address_ln2 | varchar(100) | Y |  |  |
| address_ln3 | varchar(100) | Y |  |  |
| prefix | varchar(100) | Y |  |  |
| postcode | varchar(10) |  |  |  |
| plus4_code | varchar(5) | Y |  |  |
| city | varchar(127) | Y |  |  |
| state | varchar(45) | Y |  |  |
| country | varchar(10) | Y |  |  |
| address_type | varchar(45) | Y |  |  |
| lat | float | Y |  |  |
| lng | float | Y |  |  |
| unique_identifier | varchar(50) | Y |  |  |
| validation_status | varchar(50) | Y |  |  |
| validation_code | varchar(10) | Y |  |  |
| delivery_directions | varchar(255) | Y |  |  |
| phone_number | varchar(255) | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `address_organization`  — ~3 rows
_Joins:_ `address_id`→`address`, `organization_id`→`organization`, `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| address_id | int |  |  | `address` |
| organization_id | int |  |  | `organization` |
| user_id | int |  |  | `user` |
| customer_id | int | Y |  |  |
| address_type | varchar(45) | Y |  |  |
| model_type | varchar(255) |  |  |  |
| update_time | datetime | Y |  |  |

### `auth_assignment`  — ~3 rows
_Joins:_ `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| item_name | varchar(64) |  | PRI |  |
| user_id | varchar(64) |  | PRI | `user` |
| created_at | int | Y |  |  |

### `auth_item`  — ~56 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| name | varchar(64) |  | PRI |  |
| type | int |  |  |  |
| description | text | Y |  |  |
| rule_name | varchar(64) | Y |  |  |
| data | text | Y |  |  |
| created_at | int | Y |  |  |
| updated_at | int | Y |  |  |

### `auth_item_child`  — ~41 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| parent | varchar(64) |  | PRI |  |
| child | varchar(64) |  | PRI |  |

### `category`  — ~7 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_id | int | Y |  |  |
| category_name | varchar(50) |  |  |  |
| cat_type | enum('Items','Suppliers','Organization') | Y |  |  |
| description | varchar(250) | Y |  |  |

### `cx_activity`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| owner_type | varchar(16) |  | MUL |  |
| owner_id | int |  |  |  |
| kind | enum('note','call','email','meeting') |  |  |  |
| body | text |  |  |  |
| actor | varchar(64) | Y |  |  |
| created_at | datetime | Y |  |  |

### `cx_contact`  — ~5 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| first_name | varchar(64) | Y |  |  |
| last_name | varchar(64) | Y |  |  |
| email | varchar(255) | Y |  |  |
| mobile_phone | varchar(25) | Y |  |  |
| title | varchar(64) | Y |  |  |
| status | tinyint | Y |  |  |
| notes | text | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_contact_link`  — ~8 rows
_Joins:_ `contact_id`→`cx_contact`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| contact_id | int |  | MUL | `cx_contact` |
| owner_type | enum('customer','vendor','lead') |  |  |  |
| owner_id | int |  |  |  |
| role | varchar(64) | Y |  |  |
| created_at | datetime | Y |  |  |

### `cx_dashboard_widget`  — ~11 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| role | varchar(64) |  | MUL |  |
| widget | varchar(32) |  |  |  |
| title | varchar(128) | Y |  |  |
| config | json | Y |  |  |
| position | int |  |  |  |
| enabled | tinyint |  |  |  |

### `cx_document`  — ~4 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| filename | varchar(255) | Y |  |  |
| mime_type | varchar(127) | Y |  |  |
| size_bytes | int | Y |  |  |
| storage_ref | varchar(512) | Y |  |  |
| category | varchar(64) | Y |  |  |
| owner_type | varchar(32) |  | MUL |  |
| owner_id | int | Y |  |  |
| template_id | int | Y |  |  |
| notes | text | Y |  |  |
| uploaded_by | varchar(64) | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_document_template`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| category | varchar(64) | Y |  |  |
| description | varchar(512) | Y |  |  |
| body | text | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_email_outbox`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| instance_id | int | Y | MUL |  |
| template_id | int | Y |  |  |
| owner_type | varchar(32) | Y | MUL |  |
| owner_id | int | Y |  |  |
| to_email | varchar(255) | Y |  |  |
| to_name | varchar(255) | Y |  |  |
| subject | varchar(255) | Y |  |  |
| body | text | Y |  |  |
| status | enum('sent','failed') |  |  |  |
| delivery | varchar(16) |  |  |  |
| note | varchar(255) | Y |  |  |
| sent_at | datetime | Y |  |  |

### `cx_email_template`  — ~6 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| subject | varchar(255) |  |  |  |
| body | text |  |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_external_mapping`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| provider | varchar(32) |  | MUL |  |
| type | varchar(32) |  |  |  |
| internal_id | int | Y |  |  |
| external_id | varchar(128) | Y |  |  |
| name | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |

### `cx_integration`  — ~1 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| provider | varchar(32) |  | UNI |  |
| enabled | tinyint |  |  |  |
| sandbox | tinyint |  |  |  |
| config | json | Y |  |  |
| status | varchar(24) |  |  |  |
| last_sync_at | datetime | Y |  |  |
| last_sync_result | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_lead`  — ~4 rows
_Joins:_ `merchant_id`→`merchant`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| company | varchar(255) | Y |  |  |
| stage | enum('new','contacted','qualified','proposal','won','lost') |  |  |  |
| source | varchar(64) | Y |  |  |
| est_value | decimal(12,2) | Y |  |  |
| owner | varchar(64) | Y |  |  |
| merchant_id | int | Y |  | `merchant` |
| notes | text | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_notification`  — ~5 rows
_Joins:_ `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | int |  | MUL | `user` |
| type | varchar(32) |  |  |  |
| title | varchar(255) |  |  |  |
| body | varchar(512) | Y |  |  |
| link | varchar(255) | Y |  |  |
| is_read | tinyint |  |  |  |
| created_at | datetime | Y |  |  |
| read_at | datetime | Y |  |  |

### `cx_onboarding`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| company_name | varchar(255) | Y |  |  |
| email | varchar(255) | Y |  |  |
| industry_key | varchar(64) |  |  |  |
| referrer | varchar(128) | Y | MUL |  |
| selected_modules | json | Y |  |  |
| created_at | datetime | Y |  |  |

### `cx_report`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(128) |  | UNI |  |
| description | varchar(512) | Y |  |  |
| sql_text | text |  |  |  |
| params | json | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_task`  — ~4 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| owner_type | varchar(16) |  | MUL |  |
| owner_id | int |  |  |  |
| type | varchar(16) |  |  |  |
| title | varchar(255) |  |  |  |
| notes | text | Y |  |  |
| assignee | varchar(64) | Y |  |  |
| assignee_user_id | int | Y |  |  |
| status | enum('open','done','cancelled') |  | MUL |  |
| due_at | datetime | Y |  |  |
| instance_id | int | Y |  |  |
| step_id | int | Y |  |  |
| created_at | datetime | Y |  |  |
| completed_at | datetime | Y |  |  |

### `cx_workflow`  — ~1 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| owner_type | enum('lead','contact','production') |  |  |  |
| status | enum('active','inactive') |  |  |  |
| description | varchar(512) | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `cx_workflow_event`  — ~6 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| instance_id | int |  | MUL |  |
| step_id | int | Y |  |  |
| kind | varchar(32) |  |  |  |
| detail | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |

### `cx_workflow_instance`  — ~2 rows
_Joins:_ `workflow_id`→`cx_workflow`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| workflow_id | int |  |  | `cx_workflow` |
| owner_type | enum('lead','contact','production') |  |  |  |
| owner_id | int |  |  |  |
| status | enum('active','completed','cancelled') |  | MUL |  |
| current_seq | int |  |  |  |
| next_run_at | datetime | Y |  |  |
| awaiting_task_id | int | Y |  |  |
| enrolled_at | datetime | Y |  |  |
| completed_at | datetime | Y |  |  |

### `cx_workflow_step`  — ~9 rows
_Joins:_ `workflow_id`→`cx_workflow`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| workflow_id | int |  | MUL | `cx_workflow` |
| seq | int |  |  |  |
| kind | enum('send_email','wait','task') |  |  |  |
| label | varchar(255) | Y |  |  |
| config | json | Y |  |  |

### `cx_workspace_settings`  — ~1 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| industry_key | varchar(64) | Y |  |  |
| enabled_modules | json | Y |  |  |
| updated_at | datetime | Y |  |  |

### `dynamic_field`  — ~9 rows
_Joins:_ `category_id`→`category`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(200) |  |  |  |
| key | varchar(100) |  |  |  |
| type | smallint |  |  |  |
| values | text |  |  |  |
| validation | text |  |  |  |
| defaultValue | text |  |  |  |
| enable | tinyint(1) |  |  |  |
| category_id | int | Y |  | `category` |
| position | float |  |  |  |
| section | smallint | Y | MUL |  |
| unit | varchar(255) | Y |  |  |
| withoutLabel | tinyint(1) |  |  |  |

### `dynamic_value`  — ~117 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| object_id | int |  | MUL |  |
| field_id | int |  | MUL |  |
| value | text |  |  |  |
| connected_type | int |  |  |  |
| connected_id | int |  |  |  |

### `ingredient`  — ~10 rows
_Joins:_ `item_id`→`item`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_id | int |  |  | `item` |
| parent_id | int | Y | MUL |  |
| multi_item_recipe_id | int | Y |  |  |
| amount | float |  |  |  |
| unit_id | int |  |  |  |
| yield | int | Y |  |  |
| yield_amount | decimal(10,4) | Y |  |  |
| include_labor | tinyint(1) | Y |  |  |
| include_packing | tinyint(1) | Y |  |  |
| update_time | datetime | Y |  |  |

### `inventory_log`  — ~6 rows
_Joins:_ `item_id`→`item`, `user_id`→`user`, `item_location_id`→`item_location`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| type_id | int | Y | MUL |  |
| item_id | int | Y |  | `item` |
| from_id | int | Y |  |  |
| to_id | int | Y |  |  |
| user_id | int | Y |  | `user` |
| item_location_id | int | Y | MUL | `item_location` |
| reason_id | int | Y |  |  |
| record_id | int | Y |  |  |
| uom_id | int |  |  |  |
| info | varchar(200) | Y |  |  |
| lot_id | varchar(200) | Y |  |  |
| table_id | varchar(200) | Y |  |  |
| change_qty | float(10,3) | Y |  |  |
| qty_on_hand | float(10,3) | Y |  |  |
| qty_before | float(10,3) |  |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `inventory_log_type`  — ~9 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(40) | Y |  |  |

### `inventory_sheet`  — ~4 rows
_Joins:_ `user_id`→`user`, `location_id`→`location`, `category_id`→`category`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| user_id | int | Y |  | `user` |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |
| status | smallint | Y |  |  |
| location_id | int | Y |  | `location` |
| sub_location_id | int | Y |  |  |
| category_id | int | Y |  | `category` |

### `item`  — ~8 rows
_Joins:_ `merchant_id`→`merchant`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_name | varchar(125) |  |  |  |
| item_type | enum('product','packing_material','processed_material','raw_material','spec','inventory_only','distributed','copack_sub_assembly','copack_product') | Y |  |  |
| sku | varchar(50) | Y |  |  |
| customer_sku | varchar(50) | Y |  |  |
| gtin | varchar(20) | Y |  |  |
| item_description | varchar(255) | Y |  |  |
| image_url | varchar(255) | Y |  |  |
| master_unit | varchar(255) | Y |  |  |
| published | tinyint | Y |  |  |
| purchasable | tinyint | Y |  |  |
| has_ingredients | tinyint | Y |  |  |
| uom_id | int | Y |  |  |
| merchant_id | int | Y |  | `merchant` |
| inner_pack | float | Y |  |  |
| outer_pack | float | Y |  |  |
| size | float | Y |  |  |
| size_unit | varchar(255) | Y |  |  |
| density | float | Y |  |  |
| weight | double(10,2) | Y |  |  |
| yield | smallint | Y |  |  |
| unit_weight | varchar(10) | Y |  |  |
| total_amount | float | Y |  |  |
| minimum_amount | float | Y |  |  |
| maximum_amount | float | Y |  |  |
| package_type | varchar(255) | Y |  |  |
| generic_item_code | varchar(125) | Y |  |  |
| item_price | double(12,2) | Y |  |  |
| status | tinyint |  |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `item_category`  — ~11 rows
_Joins:_ `item_id`→`item`, `product_id`→`product`, `category_id`→`category`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_id | int | Y |  | `item` |
| product_id | int | Y | MUL | `product` |
| category_id | int | Y |  | `category` |
| priority | int | Y |  |  |
| is_deleted | tinyint | Y |  |  |

### `item_location`  — ~17 rows
_Joins:_ `item_id`→`item`, `location_id`→`location`, `po_item_id`→`po_item`, `production_id`→`production`, `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_id | int |  |  | `item` |
| location_id | int |  |  | `location` |
| lot_id | varchar(45) | Y |  |  |
| po_item_id | int | Y |  | `po_item` |
| production_id | int | Y |  | `production` |
| user_id | int | Y |  | `user` |
| created_at | varchar(20) | Y |  |  |
| create_time | varchar(20) | Y |  |  |
| update_time | varchar(20) | Y |  |  |
| item_description | text | Y |  |  |
| on_hand | double(10,2) | Y |  |  |
| initial_on_hand | int | Y |  |  |
| status | smallint | Y |  |  |
| vendor_lot_id | int | Y |  |  |
| building_id | int | Y |  |  |
| best_by_date | date | Y |  |  |
| uom_id | int | Y |  |  |

### `kit`  — ~1 rows
_Joins:_ `category_id`→`category`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(75) |  |  |  |
| kit_type | int | Y |  |  |
| total_qty | int | Y |  |  |
| category_id | int | Y |  | `category` |

### `kit_item`  — ~3 rows
_Joins:_ `kit_id`→`kit`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| kit_id | int |  | MUL | `kit` |
| part_item_id | int |  |  |  |
| default_quantity | float | Y |  |  |
| allow_item_change | int | Y |  |  |

### `location`  — ~6 rows
_Joins:_ `organization_id`→`organization`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| organization_id | int | Y |  | `organization` |
| nickname | varchar(50) |  |  |  |
| region_name | varchar(45) | Y |  |  |
| enabled | tinyint | Y |  |  |
| parent_id | int | Y |  |  |
| is_building | tinyint | Y |  |  |
| needs_put_away | tinyint(1) | Y |  |  |

### `measurement`  — ~15 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| short_name | varchar(255) |  |  |  |
| coefficient | float |  |  |  |
| type | enum('Weight','Volume','Other') |  |  |  |

### `merchant`  — ~10 rows
_Joins:_ `organization_id`→`organization`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| organization_id | int |  |  | `organization` |
| nickname | varchar(255) |  |  |  |
| enabled | tinyint | Y |  |  |
| email_shipment | tinyint(1) | Y |  |  |
| email_delivery | tinyint(1) | Y |  |  |
| is_auto_allocation | tinyint(1) | Y |  |  |
| is_cart_user | tinyint(1) | Y |  |  |
| parent_id | int | Y |  |  |
| default_shipper_id | int | Y |  |  |
| shipping_terms | text | Y |  |  |
| payment_terms | text | Y |  |  |
| customer_buyer | text | Y |  |  |
| url | varchar(255) | Y |  |  |

### `merchant_item_rule_priority`  — ~2 rows
_Joins:_ `merchant_id`→`merchant`, `rule_id`→`rule`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| merchant_id | int | Y | MUL | `merchant` |
| rule_id | int | Y |  | `rule` |
| priority | int | Y |  |  |
| active | int | Y |  |  |

### `move`  — ~6 rows
_Joins:_ `user_id`→`user`, `status_id`→`status`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| shipper_id | int | Y |  |  |
| from_building_id | int | Y |  |  |
| to_building_id | int | Y |  |  |
| date_scheduled | datetime | Y |  |  |
| date_issued | datetime | Y |  |  |
| date_completed | datetime | Y |  |  |
| create_time | datetime | Y |  |  |
| user_id | int | Y |  | `user` |
| type_id | int | Y |  |  |
| status_id | int | Y |  | `status` |
| notes | varchar(512) | Y |  |  |

### `move_item`  — ~2 rows
_Joins:_ `move_id`→`move`, `item_id`→`item`, `status_id`→`status`, `item_location_id`→`item_location`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| move_id | int |  | MUL | `move` |
| item_id | int | Y |  | `item` |
| uom_id | int | Y |  |  |
| item_name | varchar(255) | Y |  |  |
| qty_to_fulfill | decimal(13,4) | Y |  |  |
| qty_fulfilled | decimal(13,4) | Y |  |  |
| status_id | int | Y |  | `status` |
| item_location_id | int |  |  | `item_location` |

### `order`  — ~2 rows
_Joins:_ `merchant_id`→`merchant`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| order_code | varchar(45) | Y |  |  |
| merchant_id | int | Y | MUL | `merchant` |
| customer_id | int | Y |  |  |
| ship_from_location_id | int | Y |  |  |
| requested_delivery_date | datetime | Y |  |  |
| status | int | Y |  |  |
| is_allocated | int | Y |  |  |
| is_paid | int | Y |  |  |
| is_packed | int | Y |  |  |
| is_shipped | int | Y |  |  |
| is_billed | int | Y |  |  |
| total_price | decimal(12,3) | Y |  |  |
| special_instructions | varchar(511) | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `order_allocation`  — ~1 rows
_Joins:_ `order_item_id`→`order_item`, `item_location_id`→`item_location`, `order_id`→`order`, `product_id`→`product`, `item_id`→`item`, `location_id`→`location`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| order_item_id | int |  |  | `order_item` |
| item_location_id | int |  |  | `item_location` |
| qty | float |  |  |  |
| order_id | int | Y | MUL | `order` |
| product_id | int | Y |  | `product` |
| item_id | int | Y |  | `item` |
| location_id | int | Y |  | `location` |
| cost | float | Y |  |  |
| currency | varchar(5) | Y |  |  |
| create_time | datetime | Y |  |  |

### `order_item`  — ~3 rows
_Joins:_ `order_id`→`order`, `item_id`→`item`, `product_id`→`product`, `item_location_id`→`item_location`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| order_id | int | Y | MUL | `order` |
| item_id | int | Y |  | `item` |
| product_id | int | Y |  | `product` |
| quantity | decimal(12,3) | Y |  |  |
| merchant_price | float | Y |  |  |
| supplier_price | float | Y |  |  |
| unit | int | Y |  |  |
| item_location_id | int | Y |  | `item_location` |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `order_status`  — ~4 rows
_Joins:_ `order_id`→`order`, `status_id`→`status`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| order_id | int | Y | MUL | `order` |
| status_id | int | Y |  | `status` |
| create_time | datetime | Y |  |  |

### `organization`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_id | int | Y |  |  |
| organization_name | varchar(255) |  |  |  |
| url | text | Y |  |  |
| phone_number | varchar(63) | Y |  |  |
| currency | int | Y |  |  |
| slug | varchar(127) | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `po_item`  — ~2 rows
_Joins:_ `item_id`→`item`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| po_id | int | Y | MUL |  |
| item_id | int | Y |  | `item` |
| item_source_id | int | Y |  |  |
| vendor_id | int | Y |  |  |
| uom_id | int | Y |  |  |
| quantity | decimal(14,5) | Y |  |  |
| exp_cost | decimal(14,5) | Y |  |  |
| act_cost | decimal(14,5) | Y |  |  |
| shipping_cost_est | decimal(14,5) | Y |  |  |
| status | varchar(20) | Y |  |  |
| reason | text | Y |  |  |
| vendor_lot | varchar(125) | Y |  |  |
| expire_date | datetime | Y |  |  |
| manufacture_date | datetime | Y |  |  |
| receive_time | datetime | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `product`  — ~8 rows
_Joins:_ `item_id`→`item`, `kit_id`→`kit`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_id | int | Y |  | `item` |
| kit_id | int | Y |  | `kit` |
| uom_id | int | Y |  |  |
| weight_uom_id | int | Y |  |  |
| size_uom_id | int | Y |  |  |
| width_uom_id | int | Y |  |  |
| active_flag | tinyint | Y |  |  |
| taxable_flag | tinyint | Y |  |  |
| use_price_flag | tinyint | Y |  |  |
| sku | varchar(255) | Y |  |  |
| upc | varchar(255) | Y |  |  |
| description | text | Y |  |  |
| details | text | Y |  |  |
| price | double(11,2) | Y |  |  |
| weight | double(10,2) | Y |  |  |
| height | double(10,2) | Y |  |  |
| len | double(10,2) | Y |  |  |
| width | double(10,2) | Y |  |  |
| accounting_hash | varchar(255) | Y |  |  |
| accounting_id | varchar(255) | Y |  |  |
| qb_class_id | varchar(255) | Y |  |  |
| url | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `production`  — ~3 rows
_Joins:_ `item_id`→`item`, `location_id`→`location`, `purchase_order_id`→`purchase_order`, `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_id | int | Y | MUL | `item` |
| recipe_id | int | Y |  |  |
| factor | float | Y |  |  |
| uom_id | int | Y |  |  |
| quantity | float | Y |  |  |
| amount_made | float | Y |  |  |
| amount_lost | float | Y |  |  |
| cost | float | Y |  |  |
| location_id | int | Y |  | `location` |
| date_made | datetime | Y |  |  |
| end_date | datetime | Y |  |  |
| production_batch | varchar(255) | Y |  |  |
| fulfilled | tinyint(1) | Y |  |  |
| po_from | enum('manual','inv_adj','planning') | Y |  |  |
| purchase_order_id | int | Y |  | `purchase_order` |
| team_id | int | Y |  |  |
| user_id | int | Y |  | `user` |
| notes | longtext | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `production_details`  — ~1 rows
_Joins:_ `production_id`→`production`, `item_id`→`item`, `ingredient_id`→`ingredient`, `po_item_id`→`po_item`, `location_id`→`location`, `user_id`→`user`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| production_id | int |  | MUL | `production` |
| item_id | int |  |  | `item` |
| ingredient_id | int | Y |  | `ingredient` |
| amount_used | float | Y |  |  |
| units_used | int | Y |  |  |
| po_item_id | int | Y |  | `po_item` |
| sub_assembly_id | int | Y |  |  |
| location_id | int | Y |  | `location` |
| create_time | datetime | Y |  |  |
| user_id | int | Y |  | `user` |

### `purchase_order`  — ~3 rows
_Joins:_ `user_id`→`user`, `supplier_id`→`supplier`, `location_id`→`location`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_id | int | Y |  |  |
| user_id | int | Y |  | `user` |
| supplier_id | int | Y | MUL | `supplier` |
| location_id | int | Y |  | `location` |
| shipping_address_id | int | Y |  |  |
| purchase_order_number | varchar(50) | Y |  |  |
| status | enum('draft','sent','confirmed','onway','delivered','onhold','paid','closed','canceled','partially_received','produced') | Y | MUL |  |
| sent_date | varchar(20) | Y |  |  |
| requested_delivery_date | datetime | Y |  |  |
| requested_delivery_time | varchar(12) | Y |  |  |
| estimated_delivery_date | datetime | Y |  |  |
| receive_time | datetime | Y |  |  |
| total_price | decimal(14,5) | Y |  |  |
| sales_tax | decimal(14,5) | Y |  |  |
| total_weight | decimal(14,5) | Y |  |  |
| total_volume | decimal(14,5) | Y |  |  |
| shipping_cost_est | decimal(14,5) | Y |  |  |
| shipping_cost_act | decimal(14,5) | Y |  |  |
| item_ordered | decimal(14,5) | Y |  |  |
| item_received | decimal(14,5) | Y |  |  |
| special_instructions | varchar(511) | Y |  |  |
| notes | text | Y |  |  |
| create_time | datetime | Y |  |  |
| update_time | datetime | Y |  |  |

### `rule`  — ~2 rows
_Joins:_ `item_id`→`item`, `category_id`→`category`, `product_id`→`product`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| rule_name | varchar(255) |  |  |  |
| item_id | int | Y |  | `item` |
| category_id | int | Y |  | `category` |
| product_id | int | Y |  | `product` |
| parent_id | int | Y |  |  |
| margin | enum('margin_percent','markup_percent','margin_amount','item_price') | Y |  |  |
| value | decimal(14,5) | Y |  |  |
| start_date | datetime | Y |  |  |
| end_date | datetime | Y |  |  |

### `status`  — ~13 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(45) | Y |  |  |

### `supplier`  — ~5 rows
_Joins:_ `organization_id`→`organization`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| organization_id | int |  |  | `organization` |
| nickname | varchar(45) | Y |  |  |
| status | enum('Active','Text','Not Active') | Y |  |  |
| type | varchar(60) | Y |  |  |
| promised_lead_time | int | Y |  |  |

### `user`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| username | varchar(44) |  | UNI |  |
| email | varchar(255) | Y |  |  |
| first_name | varchar(64) | Y |  |  |
| last_name | varchar(64) | Y |  |  |
| password_hash | varchar(255) | Y |  |  |
| auth_key | varchar(255) | Y |  |  |
| status | tinyint | Y |  |  |
| active_location_id | int | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |