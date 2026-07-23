# Lateral (uscollect) — Schema Data Dictionary

Source: Lateral tenant DB — reportable core. **37 tables, 1265 columns, 65 inferred joins.**

> Relationships are INFERRED from column-naming conventions; these schemas have no foreign-key constraints. Treat inferred joins as a starting map to verify, not a contract.


## Case & People


### `case_participants`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `participant_id`→`participants`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| participant_id | int |  | MUL | `participants` |
| ordering | int |  | MUL |  |
| default | tinyint(1) |  | MUL |  |
| override | tinyint(1) |  | MUL |  |
| name | varchar(1000) |  |  |  |
| name_custom_alias | varchar(1000) |  |  |  |
| salutation | varchar(20) |  |  |  |
| ref | varchar(255) |  |  |  |
| ext_ref | varchar(255) |  |  |  |
| participant_type_id | int |  | MUL |  |
| notes | text |  |  |  |
| trading_as | varchar(255) |  |  |  |
| company_name | varchar(255) |  |  |  |
| company_reg_no | varchar(255) |  |  |  |
| vat_reg_no | varchar(255) |  |  |  |
| business_activity | varchar(255) |  |  |  |
| date_of_incorporation | date |  |  |  |
| fiscal_year_end | date |  |  |  |
| dx_0_no | varchar(255) |  |  |  |
| dx_1_no | varchar(255) |  |  |  |
| dx_2_no | varchar(255) |  |  |  |
| bank_payee | varchar(255) |  |  |  |
| bank_name | varchar(255) |  |  |  |
| bank_branch | varchar(255) |  |  |  |
| bank_account_name | varchar(255) |  |  |  |
| bank_account_number | varchar(255) |  |  |  |
| bank_account_sort_code | varchar(255) |  |  |  |
| contact_0_fullname | varchar(255) |  |  |  |
| contact_0_title | varchar(4) |  |  |  |
| contact_0_first_name | varchar(255) |  |  |  |
| contact_0_middle_names | varchar(255) |  |  |  |
| contact_0_surnames | varchar(255) |  |  |  |
| contact_0_ssn | varchar(255) |  |  |  |
| contact_0_dob | varchar(255) |  |  |  |
| contact_0_document_0_id | varchar(255) |  |  |  |
| contact_0_document_0_type | varchar(255) |  |  |  |
| contact_0_document_1_id | varchar(255) |  |  |  |
| contact_0_document_1_type | varchar(255) |  |  |  |
| contact_0_document_2_id | varchar(255) |  |  |  |
| contact_0_document_2_type | varchar(255) |  |  |  |
| contact_0_confirmed | tinyint(1) |  | MUL |  |
| contact_1_fullname | varchar(255) |  |  |  |
| contact_1_title | varchar(4) |  |  |  |
| contact_1_first_name | varchar(255) |  |  |  |
| contact_1_middle_names | varchar(255) |  |  |  |
| contact_1_surnames | varchar(255) |  |  |  |
| contact_1_ssn | varchar(255) |  |  |  |
| contact_1_dob | varchar(255) |  |  |  |
| contact_1_document_0_id | varchar(255) |  |  |  |
| contact_1_document_0_type | varchar(255) |  |  |  |
| contact_1_document_1_id | varchar(255) |  |  |  |
| contact_1_document_1_type | varchar(255) |  |  |  |
| contact_1_document_2_id | varchar(255) |  |  |  |
| contact_1_document_2_type | varchar(255) |  |  |  |
| contact_1_confirmed | tinyint(1) |  | MUL |  |
| contact_2_fullname | varchar(255) |  |  |  |
| contact_2_title | varchar(4) |  |  |  |
| contact_2_first_name | varchar(255) |  |  |  |
| contact_2_middle_names | varchar(255) |  |  |  |
| contact_2_surnames | varchar(255) |  |  |  |
| contact_2_ssn | varchar(255) |  |  |  |
| contact_2_dob | varchar(255) |  |  |  |
| contact_2_document_0_id | varchar(255) |  |  |  |
| contact_2_document_0_type | varchar(255) |  |  |  |
| contact_2_document_1_id | varchar(255) |  |  |  |
| contact_2_document_1_type | varchar(255) |  |  |  |
| contact_2_document_2_id | varchar(255) |  |  |  |
| contact_2_document_2_type | varchar(255) |  |  |  |
| contact_2_confirmed | tinyint(1) |  | MUL |  |
| add_0_ln_1 | varchar(50) |  |  |  |
| add_0_ln_2 | varchar(50) |  |  |  |
| add_0_ln_3 | varchar(50) |  |  |  |
| add_0_ln_4 | varchar(50) |  |  |  |
| add_0_town | varchar(50) |  |  |  |
| add_0_county | varchar(50) |  |  |  |
| add_0_state | varchar(50) |  |  |  |
| add_0_country | varchar(50) |  |  |  |
| add_0_post_code | varchar(50) |  |  |  |
| add_0_priority | varchar(50) |  |  |  |
| add_0_label | varchar(50) |  |  |  |
| add_0_active | varchar(50) |  |  |  |
| add_1_ln_1 | varchar(50) |  |  |  |
| add_1_ln_2 | varchar(50) |  |  |  |
| add_1_ln_3 | varchar(50) |  |  |  |
| add_1_ln_4 | varchar(50) |  |  |  |
| add_1_town | varchar(50) |  |  |  |
| add_1_county | varchar(50) |  |  |  |
| add_1_state | varchar(50) |  |  |  |
| add_1_country | varchar(50) |  |  |  |
| add_1_post_code | varchar(50) |  |  |  |
| add_1_priority | varchar(50) |  |  |  |
| add_1_label | varchar(50) |  |  |  |
| add_1_active | varchar(50) |  |  |  |
| add_2_ln_1 | varchar(50) |  |  |  |
| add_2_ln_2 | varchar(50) |  |  |  |
| add_2_ln_3 | varchar(50) |  |  |  |
| add_2_ln_4 | varchar(50) |  |  |  |
| add_2_town | varchar(50) |  |  |  |
| add_2_county | varchar(50) |  |  |  |
| add_2_state | varchar(50) |  |  |  |
| add_2_country | varchar(50) |  |  |  |
| add_2_post_code | varchar(50) |  |  |  |
| add_2_priority | varchar(50) |  |  |  |
| add_2_label | varchar(50) |  |  |  |
| add_2_active | varchar(50) |  |  |  |
| phone_landline_0 | varchar(255) |  |  |  |
| phone_landline_1 | varchar(255) |  |  |  |
| phone_landline_2 | varchar(255) |  |  |  |
| phone_mobile_0 | varchar(255) |  |  |  |
| phone_mobile_1 | varchar(255) |  |  |  |
| phone_mobile_2 | varchar(255) |  |  |  |
| phone_work_0 | varchar(255) |  |  |  |
| phone_work_1 | varchar(255) |  |  |  |
| phone_work_2 | varchar(255) |  |  |  |
| fax_number_0 | varchar(255) |  |  |  |
| fax_number_1 | varchar(255) |  |  |  |
| fax_number_2 | varchar(255) |  |  |  |
| email_address_0 | varchar(255) |  |  |  |
| email_address_1 | varchar(255) |  |  |  |
| email_address_2 | varchar(255) |  |  |  |
| security_question | varchar(255) |  |  |  |
| security_answer | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `custom_fields`  — ~50,542 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_type | varchar(255) |  | MUL |  |
| data_id | int |  | MUL |  |
| scope | varchar(255) |  | MUL |  |
| custom_data | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `emails`  — ~57,150 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| account | varchar(255) | Y | MUL |  |
| note | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| user_id | varchar(255) | Y |  | `rdebt_users` |
| created | datetime | Y |  |  |
| updated | datetime | Y |  |  |
| email_type_id | int | Y | MUL |  |
| owner_type | varchar(255) | Y |  |  |
| owner_id | int | Y | MUL |  |
| source | varchar(255) |  |  |  |
| isAuthorizedEmail | tinyint(1) |  | MUL |  |
| doNotSendEmail | tinyint(1) |  |  |  |

### `participants`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(1000) |  |  |  |
| name_custom_alias | varchar(1000) |  |  |  |
| salutation | varchar(20) |  |  |  |
| ref | varchar(255) |  |  |  |
| ext_ref | varchar(255) |  |  |  |
| participant_type_id | int |  | MUL |  |
| notes | text |  |  |  |
| trading_as | varchar(255) |  |  |  |
| company_name | varchar(255) |  |  |  |
| company_reg_no | varchar(255) |  |  |  |
| vat_reg_no | varchar(255) |  |  |  |
| business_activity | varchar(255) |  |  |  |
| date_of_incorporation | date |  |  |  |
| fiscal_year_end | date |  |  |  |
| dx_0_no | varchar(255) |  |  |  |
| dx_1_no | varchar(255) |  |  |  |
| dx_2_no | varchar(255) |  |  |  |
| bank_payee | varchar(255) |  |  |  |
| bank_name | varchar(255) |  |  |  |
| bank_branch | varchar(255) |  |  |  |
| bank_account_name | varchar(255) |  |  |  |
| bank_account_number | varchar(255) |  |  |  |
| bank_account_sort_code | varchar(255) |  |  |  |
| contact_0_fullname | varchar(255) |  |  |  |
| contact_0_title | varchar(4) |  |  |  |
| contact_0_first_name | varchar(255) |  |  |  |
| contact_0_middle_names | varchar(255) |  |  |  |
| contact_0_surnames | varchar(255) |  |  |  |
| contact_0_ssn | varchar(255) |  |  |  |
| contact_0_dob | varchar(255) |  |  |  |
| contact_0_document_0_id | varchar(255) |  |  |  |
| contact_0_document_0_type | varchar(255) |  |  |  |
| contact_0_document_1_id | varchar(255) |  |  |  |
| contact_0_document_1_type | varchar(255) |  |  |  |
| contact_0_document_2_id | varchar(255) |  |  |  |
| contact_0_document_2_type | varchar(255) |  |  |  |
| contact_0_confirmed | tinyint(1) |  | MUL |  |
| contact_1_fullname | varchar(255) |  |  |  |
| contact_1_title | varchar(4) |  |  |  |
| contact_1_first_name | varchar(255) |  |  |  |
| contact_1_middle_names | varchar(255) |  |  |  |
| contact_1_surnames | varchar(255) |  |  |  |
| contact_1_ssn | varchar(255) |  |  |  |
| contact_1_dob | varchar(255) |  |  |  |
| contact_1_document_0_id | varchar(255) |  |  |  |
| contact_1_document_0_type | varchar(255) |  |  |  |
| contact_1_document_1_id | varchar(255) |  |  |  |
| contact_1_document_1_type | varchar(255) |  |  |  |
| contact_1_document_2_id | varchar(255) |  |  |  |
| contact_1_document_2_type | varchar(255) |  |  |  |
| contact_1_confirmed | tinyint(1) |  | MUL |  |
| contact_2_fullname | varchar(255) |  |  |  |
| contact_2_title | varchar(4) |  |  |  |
| contact_2_first_name | varchar(255) |  |  |  |
| contact_2_middle_names | varchar(255) |  |  |  |
| contact_2_surnames | varchar(255) |  |  |  |
| contact_2_ssn | varchar(255) |  |  |  |
| contact_2_dob | varchar(255) |  |  |  |
| contact_2_document_0_id | varchar(255) |  |  |  |
| contact_2_document_0_type | varchar(255) |  |  |  |
| contact_2_document_1_id | varchar(255) |  |  |  |
| contact_2_document_1_type | varchar(255) |  |  |  |
| contact_2_document_2_id | varchar(255) |  |  |  |
| contact_2_document_2_type | varchar(255) |  |  |  |
| contact_2_confirmed | tinyint(1) |  | MUL |  |
| add_0_ln_1 | varchar(50) |  |  |  |
| add_0_ln_2 | varchar(50) |  |  |  |
| add_0_ln_3 | varchar(50) |  |  |  |
| add_0_ln_4 | varchar(50) |  |  |  |
| add_0_town | varchar(50) |  |  |  |
| add_0_county | varchar(50) |  |  |  |
| add_0_state | varchar(50) |  |  |  |
| add_0_country | varchar(50) |  |  |  |
| add_0_post_code | varchar(50) |  |  |  |
| add_0_priority | varchar(50) |  |  |  |
| add_0_label | varchar(50) |  |  |  |
| add_0_active | varchar(50) |  |  |  |
| add_1_ln_1 | varchar(50) |  |  |  |
| add_1_ln_2 | varchar(50) |  |  |  |
| add_1_ln_3 | varchar(50) |  |  |  |
| add_1_ln_4 | varchar(50) |  |  |  |
| add_1_town | varchar(50) |  |  |  |
| add_1_county | varchar(50) |  |  |  |
| add_1_state | varchar(50) |  |  |  |
| add_1_country | varchar(50) |  |  |  |
| add_1_post_code | varchar(50) |  |  |  |
| add_1_priority | varchar(50) |  |  |  |
| add_1_label | varchar(50) |  |  |  |
| add_1_active | varchar(50) |  |  |  |
| add_2_ln_1 | varchar(50) |  |  |  |
| add_2_ln_2 | varchar(50) |  |  |  |
| add_2_ln_3 | varchar(50) |  |  |  |
| add_2_ln_4 | varchar(50) |  |  |  |
| add_2_town | varchar(50) |  |  |  |
| add_2_county | varchar(50) |  |  |  |
| add_2_state | varchar(50) |  |  |  |
| add_2_country | varchar(50) |  |  |  |
| add_2_post_code | varchar(50) |  |  |  |
| add_2_priority | varchar(50) |  |  |  |
| add_2_label | varchar(50) |  |  |  |
| add_2_active | varchar(50) |  |  |  |
| phone_landline_0 | varchar(255) |  |  |  |
| phone_landline_1 | varchar(255) |  |  |  |
| phone_landline_2 | varchar(255) |  |  |  |
| phone_mobile_0 | varchar(255) |  |  |  |
| phone_mobile_1 | varchar(255) |  |  |  |
| phone_mobile_2 | varchar(255) |  |  |  |
| phone_work_0 | varchar(255) |  |  |  |
| phone_work_1 | varchar(255) |  |  |  |
| phone_work_2 | varchar(255) |  |  |  |
| fax_number_0 | varchar(255) |  |  |  |
| fax_number_1 | varchar(255) |  |  |  |
| fax_number_2 | varchar(255) |  |  |  |
| email_address_0 | varchar(255) |  |  |  |
| email_address_1 | varchar(255) |  |  |  |
| email_address_2 | varchar(255) |  |  |  |
| security_question | varchar(255) |  |  |  |
| security_answer | varchar(255) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `rdebt_case_group_links`  — ~39,180 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| link_id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| group_id | int |  | MUL |  |
| error | tinyint |  | MUL |  |
| error_msg | varchar(255) |  |  |  |
| ordering | int | Y | MUL |  |
| action_id | int | Y |  |  |
| action_table | varchar(255) | Y |  |  |

### `rdebt_case_groups`  — ~320 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| timestamp | timestamp |  |  |  |
| global | tinyint |  | MUL |  |
| system | tinyint |  | MUL |  |
| error | tinyint |  | MUL |  |
| slug | varchar(50) |  |  |  |
| batch_task | varchar(255) |  |  |  |
| batch_task_comfirmed | tinyint(1) |  | MUL |  |
| batch_task_params | longtext | Y |  |  |
| batch_task_completed | tinyint(1) |  | MUL |  |
| batch_task_completed_at | datetime |  |  |  |
| batch_task_successful | tinyint(1) |  | MUL |  |
| batch_task_results | longtext |  |  |  |
| batch_task_priority | varchar(255) |  |  |  |
| batch_task_message | varchar(255) |  |  |  |
| batch_task_datetime | datetime | Y |  |  |
| batch_task_pid | int | Y |  |  |
| batch_cancelled_at | datetime | Y |  |  |

### `rdebt_case_variables`  — ~37 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| variables | longtext |  |  |  |
| create_at | timestamp |  |  |  |

### `rdebt_cases`  — ~55,111 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `operatorid`→`rdebt_users`, `bailiffid`→`rdebt_users`, `debtorid`→`rdebt_debtor`, `current_stage_id`→`rdebt_stages`, `court_id`→`rdebt_courts`, `branch_id`→`rdebt_branches`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| date | date |  |  |  |
| ref | text |  | MUL |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| cl_ref | text |  | MUL |  |
| operatorid | int |  | MUL | `rdebt_users` |
| bailiffid | int |  | MUL | `rdebt_users` |
| salesmanid | int |  | MUL |  |
| introducerid | int |  | MUL |  |
| holdcount | tinyint |  | MUL |  |
| visitcount | tinyint |  | MUL |  |
| visitcount_total | smallint |  | MUL |  |
| debtorid | int |  | MUL | `rdebt_debtor` |
| offense_date | date |  |  |  |
| highcourt_date | date |  |  |  |
| credit1 | decimal(10,2) |  |  |  |
| interest_date | date |  |  |  |
| current_stage_date | date |  |  |  |
| current_stage_id | int |  | MUL | `rdebt_stages` |
| current_status_id | int |  | MUL |  |
| current_status_date | date |  |  |  |
| current_status_datetime | datetime |  |  |  |
| amount1 | decimal(9,2) |  |  |  |
| amount2 | decimal(9,2) |  |  |  |
| execution_cost | decimal(5,2) |  |  |  |
| offense | text |  |  |  |
| interest_perc | float | Y |  |  |
| vat_perc | float |  |  |  |
| claimant | varchar(255) |  | MUL |  |
| claimant_add1 | varchar(100) |  |  |  |
| claimant_add2 | varchar(100) |  |  |  |
| claimant_add3 | varchar(100) |  |  |  |
| claimant_add4 | varchar(100) |  |  |  |
| claimant_postcode | varchar(30) |  |  |  |
| freeze_interest | tinyint |  | MUL |  |
| freeze_interest_date | date |  |  |  |
| fixed_interest | decimal(9,2) |  |  |  |
| court_id | int |  | MUL | `rdebt_courts` |
| claimnum | varchar(255) |  |  |  |
| court_id2 | int |  | MUL |  |
| courtref | varchar(255) |  |  |  |
| highcourt_ref | varchar(255) |  |  |  |
| award_date | date |  |  |  |
| award_int_date | date | Y |  |  |
| awardref | varchar(255) |  |  |  |
| cert_date | date |  |  |  |
| lettercategory | smallint |  | MUL |  |
| d_client_paid | decimal(10,2) |  | MUL |  |
| d_client_cleared | decimal(10,2) |  |  |  |
| d_client_received | decimal(10,2) |  |  |  |
| d_fees_paid | decimal(7,2) |  |  |  |
| d_fees_cleared | decimal(7,2) |  |  |  |
| d_fees_received | decimal(7,2) |  |  |  |
| d_total_fees_owed | decimal(11,2) |  |  |  |
| d_outstanding | decimal(11,2) |  | MUL |  |
| d_total_client_owed | decimal(11,2) |  |  |  |
| d_clientbalance | decimal(11,2) |  |  |  |
| d_totalinterest | decimal(9,2) |  |  |  |
| batch_id | varchar(255) |  |  |  |
| offense_add1 | varchar(100) | Y |  |  |
| offense_add2 | varchar(100) | Y |  |  |
| offense_add3 | varchar(100) | Y |  |  |
| offense_add4 | varchar(100) | Y |  |  |
| offense_postcode | varchar(30) | Y |  |  |
| offense_date_from | date | Y |  |  |
| offense_date_to | date | Y |  |  |
| case_bool_1 | tinyint | Y | MUL |  |
| case_bool_2 | tinyint | Y | MUL |  |
| case_bool_3 | tinyint | Y | MUL |  |
| case_bool_4 | tinyint | Y | MUL |  |
| case_bool_5 | tinyint | Y | MUL |  |
| case_bool_6 | tinyint | Y | MUL |  |
| case_bool_7 | tinyint | Y | MUL |  |
| case_bool_8 | tinyint | Y | MUL |  |
| case_bool_9 | tinyint | Y | MUL |  |
| case_bool_10 | tinyint | Y | MUL |  |
| case_bool_11 | tinyint | Y | MUL |  |
| case_bool_12 | tinyint | Y | MUL |  |
| case_bool_13 | tinyint | Y | MUL |  |
| case_bool_14 | tinyint | Y | MUL |  |
| case_bool_15 | tinyint | Y | MUL |  |
| case_bool_16 | tinyint | Y | MUL |  |
| interest_override_date | date | Y |  |  |
| case_bool_17 | tinyint(1) | Y | MUL |  |
| case_bool_18 | tinyint(1) | Y | MUL |  |
| case_bool_19 | tinyint(1) | Y | MUL |  |
| case_bool_20 | tinyint(1) | Y | MUL |  |
| case_bool_21 | tinyint(1) | Y | MUL |  |
| custom1 | varchar(255) |  |  |  |
| custom2 | varchar(255) |  |  |  |
| custom3 | varchar(255) |  |  |  |
| custom4 | varchar(255) |  |  |  |
| custom5 | varchar(255) |  |  |  |
| custom6 | varchar(255) |  |  |  |
| custom7 | varchar(255) |  |  |  |
| custom8 | varchar(255) |  |  |  |
| custom9 | varchar(255) |  |  |  |
| custom10 | varchar(255) |  |  |  |
| custom11 | varchar(255) |  |  |  |
| custom12 | varchar(255) |  |  |  |
| custom13 | varchar(255) | Y |  |  |
| custom_date1 | datetime |  |  |  |
| custom_date2 | datetime |  |  |  |
| custom_date3 | datetime |  |  |  |
| custom_date4 | datetime |  |  |  |
| custom_date5 | date |  |  |  |
| custom_date6 | date |  |  |  |
| custom_amount1 | float(10,4) |  |  |  |
| custom_amount2 | float(10,4) |  |  |  |
| custom_currency1 | float(10,2) |  |  |  |
| custom_currency2 | float(10,2) |  |  |  |
| return_remit_id | int |  | MUL |  |
| return_date | datetime |  |  |  |
| last_remit_id | int |  | MUL |  |
| last_allocated_date | datetime |  |  |  |
| last_visit_date | datetime |  |  |  |
| bail_allocated | tinyint |  | MUL |  |
| custom_amount3 | decimal(9,2) | Y |  |  |
| custom_amount4 | decimal(9,2) | Y |  |  |
| custom_amount5 | decimal(9,2) | Y |  |  |
| custom_amount6 | decimal(9,2) | Y |  |  |
| manual_link_id | int | Y | MUL |  |
| on_hold_for | int | Y | MUL |  |
| hold_client_request | varchar(10) | Y |  |  |
| hold_until | datetime | Y |  |  |
| last_hold_note | text | Y |  |  |
| d_last_timestamp | datetime | Y |  |  |
| d_paid_direct | decimal(10,2) | Y |  |  |
| d_add_costs | decimal(10,2) | Y |  |  |
| d_add_debts | decimal(10,2) | Y |  |  |
| d_total_fees_owed_nett | decimal(10,2) | Y |  |  |
| d_total_fees_owed_vat | decimal(10,2) | Y |  |  |
| d_feesbalance | decimal(10,2) | Y |  |  |
| client_login_id | int | Y | MUL |  |
| last_allocation_operation_date | datetime | Y |  |  |
| last_activity_date | datetime | Y |  |  |
| expiry_date | datetime |  |  |  |
| last_closed_date | datetime |  |  |  |
| previous_status_id | int |  | MUL |  |
| branch_id | int |  | MUL | `rdebt_branches` |
| broken_arrangement_count | int |  | MUL |  |
| first_broken_arrangement_date | date |  |  |  |
| next_arrangement_payment_date | date |  |  |  |
| next_action_date | date |  |  |  |
| d_overpayment | decimal(10,2) | Y |  |  |
| last_broken_arrangement_date | date |  |  |  |
| last_note | text | Y |  |  |
| last_note_date | date |  |  |  |
| last_payment_amount | decimal(9,2) |  |  |  |
| last_payment_date | date |  |  |  |
| last_dvla_status | tinyint(1) | Y | MUL |  |
| due_date | date |  |  |  |
| previous_stage_id | int |  | MUL |  |
| d_debt_paid | decimal(10,2) | Y |  |  |
| last_call_result | text | Y |  |  |
| last_call_result_date | date | Y |  |  |
| last_bailiffid | text | Y |  |  |
| last_credit_report_date | date | Y |  |  |
| last_credit_report_flag | varchar(255) | Y |  |  |
| tag1 | varchar(255) |  |  |  |
| tag2 | varchar(255) |  |  |  |
| tag3 | varchar(255) |  |  |  |
| tag4 | varchar(255) |  |  |  |
| is_updating_derived | tinyint(1) |  |  |  |
| last_email_date | datetime | Y |  |  |
| last_sms_date | datetime | Y |  |  |
| last_letter_date | datetime | Y |  |  |
| linked_case_count | int |  |  |  |
| linked_outstanding_total | decimal(11,2) | Y |  |  |
| last_voice_contact_date | datetime | Y |  |  |
| ptp_first_created_date | datetime | Y |  |  |
| next_arrangement_payment_amount | decimal(10,2) | Y |  |  |
| d_outstanding_assigned_amount | decimal(10,2) |  |  |  |
| is_manual_linking_required | tinyint(1) | Y |  |  |

### `rdebt_debtor`  — ~57,060 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| debtor_id | int |  | PRI |  |
| debtor_name | varchar(255) |  | MUL |  |
| debtor_phone | varchar(255) |  | MUL |  |
| debtor_mobile | varchar(255) |  | MUL |  |
| debtor_fax | varchar(255) |  |  |  |
| debtor_email | varchar(255) |  | MUL |  |
| debtor_dob | varchar(255) |  |  |  |
| debtor_ssn | varchar(255) |  |  |  |
| debtor_score | varchar(255) |  |  |  |
| debtor_phone_work | varchar(50) |  |  |  |
| debtor_2_fullname | varchar(100) | Y |  |  |
| debtor_1_title | varchar(5) | Y | MUL |  |
| debtor_1_name | varchar(50) | Y |  |  |
| debtor_1_surname | varchar(50) | Y |  |  |
| debtor_2_title | varchar(5) | Y |  |  |
| debtor_2_name | varchar(50) | Y |  |  |
| debtor_2_surname | varchar(50) | Y |  |  |
| debtor_trading_as | varchar(50) | Y |  |  |
| debtor2_name | varchar(255) |  |  |  |
| debtor_type | int | Y | MUL |  |
| debtor_ref | varchar(255) |  |  |  |
| debtor_ext_ref | varchar(255) |  |  |  |
| debtor_language | varchar(255) |  |  |  |
| debtor2_ssn | varchar(255) |  |  |  |
| debtor2_dob | varchar(255) |  |  |  |
| debtor2_ext_ref | varchar(255) |  |  |  |
| debtor_employer_name | varchar(255) | Y |  |  |
| debtor_employer_address | varchar(255) | Y |  |  |
| debtor_employer_number | varchar(255) | Y |  |  |
| debtor_employer_roll_number | varchar(255) | Y |  |  |
| debtor_employer_occupation | text | Y |  |  |
| debtor_employer_address_2 | varchar(255) | Y |  |  |
| debtor_employer_city | varchar(255) | Y |  |  |
| debtor_employer_state | varchar(255) | Y |  |  |
| debtor_employer_postcode | varchar(255) | Y |  |  |
| debtor_employer_fax_number | varchar(255) | Y |  |  |
| dialler_id | int |  | MUL |  |
| is_business | tinyint(1) | Y | MUL |  |
| payment_ref_suffix | int | Y | MUL |  |
| active | tinyint(1) |  | MUL |  |
| merged_date | datetime |  |  |  |
| num_cases | int |  | MUL |  |
| note | varchar(255) | Y |  |  |
| plea | int | Y | MUL |  |
| merged_to | int | Y | MUL |  |
| remote_token | text |  |  |  |
| previous_merged_to | int | Y |  |  |
| has_valid_email | tinyint(1) | Y |  |  |
| has_valid_phone | tinyint(1) | Y |  |  |
| is_email_updated | tinyint(1) | Y |  |  |
| is_phone_updated | tinyint(1) | Y |  |  |

### `rdebt_debtor_employers`  — ~229 rows
_Joins:_ `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| debtor_employer_name | varchar(255) |  |  |  |
| debtor_employer_address_line_1 | varchar(255) | Y |  |  |
| debtor_employer_address_line_2 | varchar(255) | Y |  |  |
| debtor_employer_address_line_3 | varchar(255) | Y |  |  |
| debtor_employer_address_line_4 | varchar(255) | Y |  |  |
| debtor_employer_city | varchar(100) | Y |  |  |
| debtor_employer_state | varchar(100) | Y |  |  |
| debtor_employer_postcode | varchar(20) | Y |  |  |
| debtor_employer_number | varchar(30) | Y |  |  |
| debtor_employer_roll_number | varchar(50) | Y |  |  |
| debtor_employer_occupation | varchar(255) | Y |  |  |
| debtor_employer_fax_number | varchar(20) | Y |  |  |
| is_previous_employer | tinyint(1) |  |  |  |
| employment_start_date | date | Y |  |  |
| employment_end_date | date | Y |  |  |
| is_primary_employer | tinyint(1) |  |  |  |
| incorrect_employer | tinyint(1) |  |  |  |
| authorised_to_contact | tinyint(1) |  |  |  |
| last_contacted_date | date | Y |  |  |
| notes | text | Y |  |  |
| custom_data | text | Y |  |  |
| created_at | timestamp |  |  |  |
| updated_at | timestamp |  |  |  |
| date_verified | date | Y |  |  |

## Financial — Payments


### `financial_bucket_instance`  — ~1,862,685 rows
_Joins:_ `financial_scheme_instance_id`→`financial_scheme_instance`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_scheme_instance_id | int |  | PRI | `financial_scheme_instance` |
| financial_bucket_prototype_id | int |  | PRI |  |
| uid | varchar(45) |  | UNI |  |
| balance | decimal(27,9) |  |  |  |
| size | decimal(27,9) |  |  |  |

### `financial_scheme_instance`  — ~51,215 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | PRI | `rdebt_cases` |
| financial_scheme_prototype_id | int |  | PRI |  |
| uid | varchar(45) |  | UNI |  |

### `financial_transaction`  — ~971,702 rows
_Joins:_ `financial_scheme_instance_id`→`financial_scheme_instance`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_transaction_type_id | int |  | PRI |  |
| financial_scheme_instance_id | int |  | PRI | `financial_scheme_instance` |
| uid | varchar(45) |  | UNI |  |
| amount | decimal(27,9) |  |  |  |
| created | datetime |  |  |  |
| label | varchar(100) | Y |  |  |

### `financial_transaction_split`  — ~296,803 rows
_Joins:_ `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_transaction_id | int |  | PRI | `financial_transaction` |
| uid | varchar(45) |  | UNI |  |
| created | datetime |  |  |  |

### `rdebt_payment`  — ~3,232 rows
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`, `bailiffID`→`rdebt_users`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| date | date |  |  |  |
| payout_date | date | Y |  |  |
| inputdate | datetime | Y |  |  |
| last_updated_date | date |  |  |  |
| userid | text |  |  | `rdebt_users` |
| caseid | int |  | MUL | `rdebt_cases` |
| amount | decimal(9,2) |  |  |  |
| method | int |  | MUL |  |
| status | int |  | MUL |  |
| batchnum | varchar(255) | Y |  |  |
| arr_id | int |  | MUL |  |
| processed | int |  | MUL |  |
| applyid | int |  | MUL |  |
| split_perc | int |  | MUL |  |
| split_amount | decimal(8,2) |  |  |  |
| link_to_cheque | varchar(255) |  |  |  |
| payout_id | mediumint |  | MUL |  |
| arr_date_received | date | Y |  |  |
| reference | varchar(50) |  |  |  |
| source | tinyint |  | MUL |  |
| arr_balance | decimal(6,2) | Y |  |  |
| gateway_infos | text | Y |  |  |
| receipt_issued | tinyint |  | MUL |  |
| bailiffID | int |  | MUL | `rdebt_users` |
| os_stage_id | int |  | MUL |  |
| import_id | int | Y | MUL |  |
| comm_accounted_for | tinyint |  | MUL |  |
| os_status_remitID | int | Y | MUL |  |
| os_split_debt | decimal(8,2) |  |  |  |
| os_split_costs | decimal(6,2) |  |  |  |
| os_split_fees | decimal(8,2) |  |  |  |
| os_split_other | decimal(6,2) |  |  |  |
| os_split_van | decimal(6,2) |  |  |  |
| os_split_vat | decimal(6,2) |  |  |  |
| os_amount_writeoff | decimal(6,2) |  |  |  |
| os_payment_code | varchar(10) |  |  |  |
| os_commission | decimal(8,2) |  |  |  |
| os_card_payment | int | Y | MUL |  |
| os_handling_fee | decimal(6,2) |  |  |  |
| os_chargeback_payment_id | int | Y | MUL |  |
| os_status | varchar(2) |  |  |  |
| payment_payer | varchar(255) | Y |  |  |
| payment_notes | varchar(255) | Y |  |  |
| financial_transaction_id | int | Y | MUL | `financial_transaction` |
| financial_split_override_id | int |  | MUL |  |
| is_group | tinyint(1) |  | MUL |  |
| is_special_clear | varchar(255) |  |  |  |
| affected_splits | text | Y |  |  |
| refund_splits | varchar(255) | Y |  |  |
| check_number | varchar(255) |  |  |  |
| accounting_number | varchar(255) |  |  |  |
| routing_number | varchar(255) |  |  |  |
| is_sent_to_accounting | tinyint(1) |  | MUL |  |
| trust_month | date |  |  |  |
| options | text | Y |  |  |

### `rdebt_payment_actions`  — ~25 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text |  |  |  |
| ordering | char(1) |  |  |  |

### `rdebt_payment_source`  — ~7 rows
_Joins:_ `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text |  |  |  |
| ordering | char(1) |  |  |  |
| slug | varchar(50) |  |  |  |
| created_by | tinyint |  | MUL | `rdebt_users` |
| create_date | timestamp |  |  |  |
| inform_agent | tinyint(1) |  | MUL |  |

### `rdebt_payment_type`  — ~4 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(50) |  |  |  |
| ordering | char(1) |  |  |  |
| desc_long | varchar(40) |  |  |  |
| clearance_days | tinyint |  | MUL |  |
| clearance_days_type | varchar(255) |  |  |  |
| clearance_days_direct | tinyint |  | MUL |  |
| bounce_warning | tinyint |  | MUL |  |
| special_allowed | tinyint |  | MUL |  |
| notify_amount | decimal(9,2) |  |  |  |
| bounce_valid | mediumint |  | MUL |  |
| hidden | tinyint(1) |  | MUL |  |
| slug | varchar(50) |  |  |  |
| display_in_case_page | tinyint(1) |  | MUL |  |
| broken_arrangement_tolerance | int | Y |  |  |

### `rdebt_payments_out`  — ~3 rows
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`, `remittance_id`→`rdebt_remittances`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| payment_out_date | date |  |  |  |
| inputdate | datetime | Y |  |  |
| userid | text |  |  | `rdebt_users` |
| amount | float |  |  |  |
| to_user_id | int |  | MUL |  |
| to_client_id | int |  | MUL |  |
| link_to_cheque | varchar(255) |  |  |  |
| caseid | int |  | MUL | `rdebt_cases` |
| error | tinyint(1) | Y | MUL |  |
| cheque_number | varchar(50) | Y |  |  |
| payment_ref | varchar(50) | Y |  |  |
| approved | tinyint(1) | Y | MUL |  |
| document_id | int |  | MUL |  |
| remittance_id | int | Y | MUL | `rdebt_remittances` |
| financial_transaction_id | int | Y | MUL | `financial_transaction` |

### `transaction_adjustment`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| role_id | int |  |  |  |
| financial_transaction_type_id | int |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

## Financial — Fees & Arrangements


### `rdebt_arrangements`  — ~30 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| freq | tinyint | Y | MUL |  |
| start | date | Y |  |  |
| case_id | int unsigned |  | MUL | `rdebt_cases` |
| creator_id | int unsigned |  | MUL |  |
| created | datetime | Y |  |  |
| amount | decimal(8,2) |  |  |  |
| last_due_date | date |  |  |  |
| active | tinyint(1) | Y | MUL |  |
| days_interval_overwrite | tinyint |  | MUL |  |
| balance | decimal(6,2) | Y |  |  |
| is_group | tinyint(1) |  | MUL |  |
| repeat_payment_ref_code | varchar(100) |  |  |  |
| payment_method | varchar(255) | Y |  |  |
| payment_card_id | int | Y | MUL |  |
| note | text | Y |  |  |
| first_amount | decimal(8,2) | Y |  |  |
| first_date | date | Y |  |  |
| last_stage_id | int |  | MUL |  |
| caseids | text | Y |  |  |
| is_manually_archived | tinyint(1) | Y | MUL |  |
| is_settlement | tinyint(1) |  |  |  |
| is_pending | tinyint(1) |  |  |  |

### `rdebt_case_costs`  — ~655 rows
_Joins:_ `caseid`→`rdebt_cases`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| date | date |  |  |  |
| name | varchar(255) |  |  |  |
| internal_reference | varchar(255) |  |  |  |
| external_reference | varchar(255) |  |  |  |
| caseid | int |  | MUL | `rdebt_cases` |
| amount | decimal(9,2) |  |  |  |
| accounting_code | varchar(10) | Y |  |  |
| vat | tinyint |  | MUL |  |
| payer | text |  |  |  |
| interest | tinyint |  | MUL |  |
| type | tinyint |  | MUL |  |
| interest_type | varchar(20) |  |  |  |
| interestperc | decimal(4,2) |  |  |  |
| foreign_amount | decimal(9,2) | Y |  |  |
| debt_type | varchar(10) |  |  |  |
| interest_start_timestamp | timestamp |  |  |  |
| interest_end_timestamp | timestamp |  |  |  |
| d_value | decimal(10,2) |  |  |  |
| charged_on | varchar(10) |  |  |  |
| calculated_by | varchar(10) |  |  |  |
| next_calculation | timestamp |  |  |  |
| last_calculated | timestamp |  |  |  |
| case_cost_type | int | Y | MUL |  |
| parent_id | int |  | MUL |  |
| interest_rate_id | int |  | MUL |  |
| client_interest_rate_id | int |  | MUL |  |
| financial_transaction_id | int |  | MUL | `financial_transaction` |
| custom1 | varchar(255) | Y |  |  |
| custom2 | varchar(255) | Y |  |  |
| custom3 | text |  |  |  |
| custom4 | varchar(255) | Y |  |  |

### `rdebt_case_fees`  — ~56,829 rows
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`, `feeid`→`rdebt_fees`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| cf_id | int |  | PRI |  |
| dateentered | datetime |  |  |  |
| userid | mediumint |  | MUL | `rdebt_users` |
| caseid | int |  | MUL | `rdebt_cases` |
| feeid | int |  | MUL | `rdebt_fees` |
| fixed_amount | decimal(10,2) |  |  |  |
| fixed_amount_vat | decimal(10,2) |  |  |  |
| fixed_amount_total | decimal(10,2) |  |  |  |
| invoiced | tinyint |  | MUL |  |
| fixed_cost_amount | decimal(6,2) |  |  |  |
| fc_hide_in_letters | tinyint |  | MUL |  |
| fc_hide_from_casepage | tinyint |  | MUL |  |
| fc_hide_for_payout | tinyint |  | MUL |  |
| single_amount | decimal(7,2) |  |  |  |
| quantity | tinyint |  | MUL |  |
| financial_transaction_id | int | Y | MUL | `financial_transaction` |
| name | varchar(255) |  |  |  |
| background_task_id | int | Y | MUL |  |
| note | varchar(255) |  |  |  |

### `rdebt_fees`  — ~13 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text | Y |  |  |
| amount | decimal(5,2) | Y |  |  |
| feetype | varchar(200) |  |  |  |
| commissionable | tinyint |  | MUL |  |
| vat | tinyint |  | MUL |  |
| feepayer | varchar(200) |  |  |  |
| saved | tinyint(1) |  | MUL |  |
| ordering | char(1) |  |  |  |
| perc1 | decimal(8,2) | Y |  |  |
| val1 | decimal(8,2) | Y |  |  |
| perc2 | decimal(8,2) | Y |  |  |
| val2 | decimal(8,2) | Y |  |  |
| perc3 | decimal(8,2) | Y |  |  |
| val3 | decimal(8,2) | Y |  |  |
| perc4 | decimal(8,2) | Y |  |  |
| val4 | decimal(8,2) | Y |  |  |
| perc5 | decimal(8,2) | Y |  |  |
| val5 | decimal(8,2) | Y |  |  |
| perc6 | decimal(8,2) | Y |  |  |
| val6 | decimal(8,2) | Y |  |  |
| perc7 | decimal(8,2) | Y |  |  |
| round_up | tinyint |  | MUL |  |
| autoadd_atstage | int |  | MUL |  |
| perc_of_total | tinyint |  | MUL |  |
| perc_of_collected | tinyint(1) |  | MUL |  |
| fixed_when_entered | tinyint |  | MUL |  |
| bailiff_can_add | tinyint |  | MUL |  |
| per_label | varchar(150) |  |  |  |
| multiple_label | varchar(255) |  |  |  |
| attilla_fee_description | varchar(355) |  |  |  |
| fee_cost | decimal(6,2) |  |  |  |
| on_collected | tinyint(1) |  | MUL |  |
| f_hide_in_letters | tinyint |  | MUL |  |
| f_hide_from_casepage | tinyint |  | MUL |  |
| f_hide_for_payout | tinyint |  | MUL |  |
| slug | varchar(50) |  |  |  |
| f_is_multiple | tinyint(1) |  | MUL |  |
| os_fee_basis | varchar(255) |  |  |  |
| val7 | decimal(8,2) |  |  |  |
| val8 | decimal(8,2) |  |  |  |
| val9 | decimal(8,2) |  |  |  |
| val10 | decimal(8,2) |  |  |  |
| val11 | decimal(8,2) |  |  |  |
| val12 | decimal(8,2) |  |  |  |
| val13 | decimal(8,2) |  |  |  |
| val14 | decimal(8,2) |  |  |  |
| val15 | decimal(8,2) |  |  |  |
| val16 | decimal(8,2) |  |  |  |
| perc8 | decimal(8,2) |  |  |  |
| perc9 | decimal(8,2) |  |  |  |
| perc10 | decimal(8,2) |  |  |  |
| perc11 | decimal(8,2) |  |  |  |
| perc12 | decimal(8,2) |  |  |  |
| perc13 | decimal(8,2) |  |  |  |
| perc14 | decimal(8,2) |  |  |  |
| perc15 | decimal(8,2) |  |  |  |
| perc16 | decimal(8,2) |  |  |  |
| visit_num | tinyint |  | MUL |  |
| levels_num | tinyint |  | MUL |  |
| monthly_date_field | varchar(50) |  |  |  |
| apply_at_maximum | int | Y | MUL |  |
| connect_to_case_marker | int | Y | MUL |  |
| replaces_fee_id | int | Y | MUL |  |
| is_receipt_fee | tinyint(1) |  | MUL |  |
| payable_commission | decimal(27,9) | Y |  |  |
| commission_type_percentage | tinyint(1) | Y | MUL |  |
| max_payable_commission | decimal(27,9) | Y |  |  |
| financial_fee_prototype_id | int | Y | MUL |  |
| financial_vat_percentage | decimal(4,2) | Y |  |  |
| financial_fee_strategy | varchar(255) | Y |  |  |
| reference_amount | varchar(255) | Y |  |  |
| rounding_mode | varchar(255) | Y |  |  |
| rounding_reference | decimal(6,2) | Y |  |  |
| type1 | varchar(50) | Y |  |  |
| type2 | varchar(50) | Y |  |  |
| type3 | varchar(50) | Y |  |  |
| type4 | varchar(50) | Y |  |  |
| type5 | varchar(50) | Y |  |  |
| type6 | varchar(50) | Y |  |  |
| type7 | varchar(50) | Y |  |  |
| type8 | varchar(50) | Y |  |  |
| type9 | varchar(50) | Y |  |  |
| type10 | varchar(50) | Y |  |  |
| type11 | varchar(50) | Y |  |  |
| type12 | varchar(50) | Y |  |  |
| type13 | varchar(50) | Y |  |  |
| type14 | varchar(50) | Y |  |  |
| type15 | varchar(50) | Y |  |  |
| type16 | varchar(50) | Y |  |  |
| financial_bucket_net_id | int | Y | MUL |  |
| financial_bucket_vat_id | int | Y | MUL |  |
| consider_linked_cases | tinyint(1) |  | MUL |  |
| consider_assigned_ea | tinyint(1) |  | MUL |  |

### `rdebt_remittances`  — ~0 rows
_Joins:_ `client_scheme_id`→`client_schemes`, `scheme_id`→`rdebt_schemes`, `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| run_date | datetime | Y |  |  |
| client_scheme_id | int | Y | MUL | `client_schemes` |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| scheme_ids | text | Y |  |  |
| case_id | text | Y |  | `rdebt_cases` |
| os_branch_id | int | Y | MUL |  |
| invoice_id | int | Y | MUL |  |
| user_id | int | Y | MUL | `rdebt_users` |
| client_id | int | Y | MUL | `rdebt_clients` |
| cases_count_successful | int | Y | MUL |  |
| cases_count_unsuccessful | int | Y | MUL |  |
| cases_count_other | int | Y | MUL |  |
| amount_direct | decimal(12,2) | Y |  |  |
| amount_collected | decimal(12,2) | Y |  |  |
| amount_paid | decimal(12,2) | Y |  |  |
| amount_to_client | decimal(12,2) | Y |  |  |
| amount_to_fees | decimal(12,2) | Y |  |  |
| split_debt | decimal(12,2) | Y |  |  |
| split_costs | decimal(12,2) | Y |  |  |
| split_fees | decimal(12,2) | Y |  |  |
| split_other | decimal(12,2) | Y |  |  |
| split_van | decimal(12,2) | Y |  |  |
| split_vat | decimal(12,2) | Y |  |  |
| split_net | decimal(12,2) | Y |  |  |
| os_remitSequenceNumber | varchar(50) | Y |  |  |

### `remittance_schedule`  — ~585 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `user_id`→`rdebt_users`, `remittance_id`→`rdebt_remittances`, `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| scheme_ids | text | Y |  |  |
| remittance_start_date | date | Y |  |  |
| remittance_end_date | date | Y |  |  |
| simulate | tinyint(1) |  | MUL |  |
| reports | tinyint(1) |  | MUL |  |
| user_id | int | Y | MUL | `rdebt_users` |
| options | varchar(255) | Y |  |  |
| adapter | varchar(255) |  |  |  |
| batch_id | int |  | MUL |  |
| os_po_number | varchar(200) | Y |  |  |
| created_at | datetime |  |  |  |
| process_started | tinyint(1) |  | MUL |  |
| process_started_at | datetime | Y |  |  |
| process_completed_at | datetime | Y |  |  |
| process_successful | tinyint(1) |  | MUL |  |
| process_results | mediumtext | Y |  |  |
| remittance_id | int | Y | MUL | `rdebt_remittances` |
| case_id | varchar(255) | Y |  | `rdebt_cases` |

## Clients, Schemes & Officers


### `client_schemes`  — ~3 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| client_scheme_id | int |  | PRI |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| perc_split | decimal(6,2) |  |  |  |
| holdfirst_amount | decimal(7,2) |  |  |  |
| apply_id | int |  | MUL |  |
| execution_overwrite | decimal(7,2) |  |  |  |
| abortive_fee | decimal(7,2) |  |  |  |
| scheme_cat_id | int |  | MUL |  |
| remittance_frequency | int |  | MUL |  |
| perc_remittance | decimal(6,2) |  |  |  |
| config_vars | text |  |  |  |

### `rdebt_branches`  — ~9 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_id | int | Y | MUL |  |
| name | varchar(255) |  |  |  |
| language | varchar(255) | Y |  |  |
| currency | varchar(255) | Y |  |  |
| create_date | timestamp |  |  |  |
| leader | int |  | MUL |  |
| email_gateway | int |  | MUL |  |
| organization_id | varchar(255) | Y |  |  |
| status | tinyint(1) |  | MUL |  |
| arrangement_scheme | int | Y | MUL |  |
| arrangement_status | int | Y | MUL |  |
| arrangement_stage | int | Y |  |  |
| default_timezone | varchar(255) | Y |  |  |

### `rdebt_clients`  — ~0 rows
_Joins:_ `branch_id`→`rdebt_branches`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) |  | MUL |  |
| client_title | varchar(255) |  |  |  |
| first_name | varchar(255) |  |  |  |
| middle_name | varchar(255) |  |  |  |
| surname | varchar(255) |  |  |  |
| address1 | varchar(255) |  |  |  |
| address2 | varchar(255) |  |  |  |
| address3 | varchar(255) |  |  |  |
| town | varchar(255) |  |  |  |
| address5 | varchar(255) |  |  |  |
| postcode | varchar(25) |  |  |  |
| region | varchar(255) |  |  |  |
| country | varchar(255) |  |  |  |
| phone | varchar(25) |  |  |  |
| email | varchar(155) |  |  |  |
| fax | varchar(55) |  |  |  |
| interest | double |  |  |  |
| default_scheme | int |  | MUL |  |
| dx_number | varchar(255) |  |  |  |
| dx_ln2 | varchar(255) |  |  |  |
| code | varchar(200) |  |  |  |
| contact_name | varchar(255) |  |  |  |
| potential_cases_per_month | smallint |  | MUL |  |
| salesmanid | int |  | MUL |  |
| introducerid | int |  | MUL |  |
| preferred_payment | enum('BACS','CHEQUE') |  |  |  |
| pay_under_100 | tinyint |  | MUL |  |
| email_reports | tinyint |  | MUL |  |
| multiple_instruction | varchar(6) |  |  |  |
| phone2 | varchar(50) |  |  |  |
| email2 | varchar(100) |  |  |  |
| notes | varchar(255) |  |  |  |
| active | tinyint |  | MUL |  |
| greeting_header | varchar(255) | Y |  |  |
| greeting_signature | varchar(255) | Y |  |  |
| d_live | int |  | MUL |  |
| d_opened_month | int |  | MUL |  |
| d_opened_year | int |  | MUL |  |
| d_per_visit_one | decimal(5,2) |  |  |  |
| d_per_visit_two | decimal(5,2) |  |  |  |
| d_per_visit_three | decimal(5,2) |  |  |  |
| remittance_frequency | int |  | MUL |  |
| operator_id | int |  | MUL |  |
| bank_name | varchar(255) | Y |  |  |
| bank_branch | varchar(255) | Y |  |  |
| bank_account_name | varchar(255) | Y |  |  |
| bank_account_number | varchar(255) | Y |  |  |
| bank_account_sort_code | varchar(255) | Y |  |  |
| company_status | varchar(255) | Y |  |  |
| company_no | varchar(255) | Y |  |  |
| company_name | varchar(255) | Y |  |  |
| trading_name | varchar(255) | Y |  |  |
| vat_registered | varchar(255) | Y |  |  |
| web_address | varchar(255) | Y |  |  |
| partner_name | varchar(255) | Y |  |  |
| partner_dob | varchar(255) | Y |  |  |
| contact_name_1 | varchar(255) | Y |  |  |
| contact_job_1 | varchar(255) | Y |  |  |
| contact_email_1 | varchar(255) | Y |  |  |
| contact_name_2 | varchar(255) | Y |  |  |
| contact_job_2 | varchar(255) | Y |  |  |
| contact_email_2 | varchar(255) | Y |  |  |
| credit_terms | varchar(255) | Y |  |  |
| client_ref | varchar(20) |  |  |  |
| short_name | varchar(255) | Y |  |  |
| client_type_id | int | Y | MUL |  |
| billing_email | varchar(255) | Y |  |  |
| cc_ccm_from_client | tinyint(1) |  | MUL |  |
| cc_client_from_ccm | tinyint(1) |  | MUL |  |
| client_parent_id | int |  | MUL |  |
| ftp_details | text | Y |  |  |
| same_remittance_for_negative_payments | tinyint |  | MUL |  |
| branch_id | int |  | MUL | `rdebt_branches` |
| is_merge_return_document_required | tinyint(1) |  | MUL |  |
| is_merge_successfully_return_document_required | tinyint(1) |  | MUL |  |
| credit_report_hold_days | varchar(255) |  |  |  |
| credit_report | varchar(255) |  |  |  |
| sales_join_date | date | Y |  |  |
| client_request_emails | varchar(255) |  |  |  |
| custom1 | varchar(255) | Y |  |  |
| custom2 | varchar(255) | Y |  |  |
| custom3 | varchar(255) | Y |  |  |
| custom4 | varchar(255) | Y |  |  |
| custom5 | varchar(255) | Y |  |  |

### `rdebt_courts`  — ~2,541 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| court_name | varchar(255) |  | MUL |  |
| court_code | varchar(255) |  | MUL |  |
| dx_code | varchar(25) |  |  |  |
| dx_code2 | varchar(255) |  |  |  |
| default | tinyint |  | MUL |  |
| address1 | varchar(255) |  |  |  |
| address2 | varchar(255) |  |  |  |
| address3 | varchar(255) |  |  |  |
| address4 | varchar(255) |  |  |  |
| address5 | varchar(255) |  |  |  |
| postcode | varchar(255) |  | MUL |  |
| high_court | tinyint |  | MUL |  |
| magistrates | tinyint |  | MUL |  |
| email_address | varchar(255) | Y |  |  |
| telephone_number | varchar(255) | Y |  |  |
| fax_number | varchar(255) | Y |  |  |
| notes | text | Y |  |  |
| court_type | int | Y | MUL |  |
| json_data | text |  |  |  |

### `rdebt_schemes`  — ~17 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) |  |  |  |
| ordering | int |  | MUL |  |
| filter | text | Y |  |  |
| category | int | Y | MUL |  |
| execution_default | decimal(5,2) |  |  |  |
| charge_interest | tinyint |  | MUL |  |
| days_interest_add | tinyint |  | MUL |  |
| split_default | tinyint |  | MUL |  |
| split_percent_default | decimal(6,2) |  |  |  |
| ref_suffix | varchar(55) |  |  |  |
| who_pays_vat | varchar(10) |  |  |  |
| charge_vat | tinyint(1) |  | MUL |  |
| specific_clients_only | tinyint |  | MUL |  |
| letter_id_ack | int | Y | MUL |  |
| letter_id_arrangement | int | Y | MUL |  |
| letter_id_new_payment | int | Y | MUL |  |
| letter_id_partial | int | Y | MUL |  |
| letter_id_bounce | int | Y | MUL |  |
| letter_id_broken | int | Y | MUL |  |
| letter_id_visit | int | Y | MUL |  |
| letter_id_remittance | int | Y | MUL |  |
| letter_id_returns | int | Y | MUL |  |
| letter_id_returns_nb | int | Y | MUL |  |
| letter_id_invoice | int | Y | MUL |  |
| remittance_percentage | decimal(6,2) | Y |  |  |
| payout_system | varchar(50) | Y |  |  |
| hold_amount | decimal(6,2) |  |  |  |
| short_name | varchar(255) | Y |  |  |
| financial_scheme | int | Y | MUL |  |
| calculate_working_days | tinyint(1) | Y | MUL |  |
| active | tinyint(1) | Y | MUL |  |
| parent_id | int |  | MUL |  |
| relationships_behaviour | varchar(255) |  |  |  |
| config_vars | text |  |  |  |
| important_data_panel_fields | text |  |  |  |
| case_preview_data | text | Y |  |  |

### `rdebt_stages`  — ~178 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text |  |  |  |
| type | tinyint | Y | MUL |  |
| days | text | Y |  |  |
| auto_change | tinyint |  | MUL |  |
| hide | int |  | MUL |  |
| perform_magic | varchar(255) |  |  |  |
| slug | varchar(50) |  | MUL |  |
| hexcolor | varchar(15) |  |  |  |
| is_stage_blockable_by_alerts | tinyint(1) | Y | MUL |  |
| offset_calculation_mode | varchar(50) | Y |  |  |
| reporting_name | varchar(255) |  |  |  |
| description | text |  |  |  |
| stage_process_type | int | Y | MUL |  |
| hide_history | tinyint(1) |  | MUL |  |
| dpd | varchar(255) | Y |  |  |

### `rdebt_users`  — ~136 rows
_Joins:_ `clientID`→`rdebt_clients`, `branch_id`→`rdebt_branches`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  | MUL |  |
| username | varchar(150) |  | MUL |  |
| email | varchar(100) |  | MUL |  |
| email_inbox | text | Y |  |  |
| password | varchar(100) |  |  |  |
| usertype | varchar(25) |  | MUL |  |
| block | tinyint |  |  |  |
| sendEmail | tinyint | Y | MUL |  |
| gid | tinyint unsigned |  | MUL |  |
| registerDate | datetime |  |  |  |
| lastvisitDate | datetime |  |  |  |
| activation_email_sent | tinyint |  | MUL |  |
| params | text |  |  |  |
| type_id | int |  | MUL |  |
| officer_type_id | int | Y | MUL |  |
| report_to_user | int |  | MUL |  |
| signature | text | Y |  |  |
| photo | text | Y |  |  |
| default_stage | int | Y | MUL |  |
| commission | decimal(5,2) |  |  |  |
| clientID | int |  | MUL | `rdebt_clients` |
| edit_cases | tinyint |  | MUL |  |
| license_type | mediumint |  | MUL |  |
| phone | varchar(100) |  |  |  |
| contact_primary | tinyint |  | MUL |  |
| isActive | tinyint |  | MUL |  |
| mobile_number | varchar(20) |  |  |  |
| address_user1 | varchar(255) |  |  |  |
| address_user2 | varchar(255) |  |  |  |
| address_user3 | varchar(255) |  |  |  |
| postcode_user | varchar(255) |  |  |  |
| company_user | varchar(255) |  |  |  |
| login_count | int | Y | MUL |  |
| officer_commission_rate | decimal(27,9) | Y |  |  |
| officer_max_commission | decimal(27,9) | Y |  |  |
| officer_min_commission | decimal(27,9) | Y |  |  |
| short_name | varchar(255) | Y |  |  |
| user_ddi | varchar(255) | Y |  |  |
| freshdesk_user_id | varchar(255) |  |  |  |
| password_encrypted | tinyint(1) |  | MUL |  |
| password_last_changed | datetime |  |  |  |
| mfa_otp | varchar(255) | Y |  |  |
| mfa_otp_expires_at | datetime | Y |  |  |
| mfa_otp_resend_count | int |  |  |  |
| remote_token | varchar(255) |  |  |  |
| remote_token_last_changed | datetime |  |  |  |
| remote_token_last_accessed | datetime |  |  |  |
| remote_token_access_count | int |  | MUL |  |
| email_signature | text |  |  |  |
| branch_id | int |  | MUL | `rdebt_branches` |
| operator_agent_type_id | int |  | MUL |  |
| address_town | varchar(255) | Y |  |  |
| address_country | varchar(255) | Y |  |  |
| user_info_caseid | int |  |  |  |
| regions | text | Y |  |  |
| dob | date | Y |  |  |
| nationality | varchar(255) | Y |  |  |
| phone2 | varchar(255) | Y |  |  |
| phone3 | varchar(255) | Y |  |  |
| insurance_number | varchar(255) | Y |  |  |
| vat_number | varchar(255) | Y |  |  |
| manager_id | int | Y |  |  |
| emergency_contact_name | varchar(255) | Y |  |  |
| emergency_contact_relationship | varchar(255) | Y |  |  |
| access_token | text | Y |  |  |
| access_token_expiry | datetime | Y |  |  |
| extra_params | text | Y |  |  |
| vat_registered | tinyint(1) |  |  |  |
| is_regenerate_password | tinyint(1) |  |  |  |
| f2hy_device_number | varchar(255) | Y |  |  |
| blue_card | tinyint(1) |  |  |  |
| blue_card_expiry_date | date | Y |  |  |
| blue_card_number | varchar(255) | Y |  |  |
| scottish_eusr_card | tinyint(1) |  |  |  |
| scottish_eusr_expiry_date | date | Y |  |  |
| scottish_eusr_card_number | varchar(255) | Y |  |  |
| visa_expiry_date | date | Y |  |  |
| id_badge_expiry | date | Y |  |  |
| agent_confirmed_shredder | tinyint(1) | Y |  |  |
| shredder_date_confirmed | date | Y |  |  |
| inactivation_reason | enum('conduct','capability','leaver_resigned','4_weeks','long_term_sick') | Y |  |  |
| eligibility_for_regulated_account | int |  |  |  |
| ic_agent_id | varchar(255) | Y |  |  |
| ic_campaign_id | varchar(255) | Y |  |  |
| audit_rating | int | Y |  |  |
| last_audit_date | datetime | Y |  |  |

## Activity & Contact


### `call_conversations`  — ~26 rows
_Joins:_ `user_id`→`rdebt_users`, `case_id`→`rdebt_cases`, `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| status | varchar(255) | Y | MUL |  |
| phone_1 | varchar(255) | Y |  |  |
| phone_2 | varchar(255) | Y |  |  |
| phone_3 | varchar(255) | Y |  |  |
| phone_4 | varchar(255) | Y |  |  |
| phone_5 | varchar(255) | Y |  |  |
| callee | varchar(255) | Y |  |  |
| user_id | int | Y | MUL | `rdebt_users` |
| created | datetime | Y |  |  |
| updated | datetime | Y |  |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| debtor_id | int | Y | MUL | `rdebt_debtor` |
| telephone_id | int | Y | MUL |  |
| document_id | int | Y | MUL |  |
| send_after | datetime | Y |  |  |
| attempted | tinyint | Y | MUL |  |
| attempted_at | datetime | Y |  |  |
| sent | tinyint | Y | MUL |  |
| sent_at | datetime | Y |  |  |
| gateway_response | text | Y |  |  |
| gateway_id | varchar(255) | Y |  |  |
| gateway_cost | decimal(27,9) | Y |  |  |
| gateway_status | varchar(255) | Y |  |  |
| gateway_resource | varchar(500) | Y |  |  |
| gateway_agent | varchar(50) | Y |  |  |
| gateway_dialled_number | varchar(255) | Y |  |  |
| gateway_start_time | datetime | Y |  |  |
| call_conversation_type_id | int |  | MUL |  |
| call_type | varchar(255) |  |  |  |
| recording_link | text |  |  |  |
| call_script | text | Y |  |  |
| note | text |  |  |  |
| gateway_call_duration | decimal(27,9) | Y |  |  |
| general_disposition | varchar(255) | Y |  |  |

### `call_history`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`, `debtor_id`→`rdebt_debtor`, `payment_id`→`rdebt_payment`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| external_id | int |  | MUL |  |
| case_id | int |  | MUL | `rdebt_cases` |
| action_id | int |  | MUL |  |
| consumer_id | int |  | MUL |  |
| target_participant | varchar(255) |  |  |  |
| participant_name | varchar(255) |  |  |  |
| direction | varchar(255) |  |  |  |
| result_code | varchar(255) |  |  |  |
| comments | text |  |  |  |
| date | datetime |  |  |  |
| contact_date | datetime |  |  |  |
| internal_type | varchar(255) |  |  |  |
| user_entered_date | datetime |  |  |  |
| link_to_recording | varchar(255) |  |  |  |
| recording_expiry | datetime |  |  |  |
| duration | int |  | MUL |  |
| dialler_agent_id | int |  | MUL |  |
| user_id | int |  | MUL | `rdebt_users` |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| contact_type | varchar(255) |  |  |  |
| is_active | tinyint |  | MUL |  |
| payment_id | int | Y | MUL | `rdebt_payment` |

### `complaints`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_id | int | Y | MUL |  |
| data_type | varchar(255) | Y |  |  |
| complainant_name | varchar(255) |  |  |  |
| complaint_details | text |  |  |  |
| complaint_date | date |  |  |  |
| resolution_actions | text |  |  |  |
| resolution_date | date |  |  |  |
| status_id | int |  | MUL |  |
| type_id | int |  | MUL |  |
| custom_1 | varchar(255) |  |  |  |
| custom_2 | varchar(255) |  |  |  |
| custom_3 | varchar(255) |  |  |  |
| custom_4 | varchar(255) |  |  |  |
| custom_5 | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |

### `rdebt_alerts_calendar`  — ~617 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| alert_cal_id | int |  | PRI |  |
| alert_cal_day | datetime | Y | MUL |  |
| alert_cal_case_id | int |  | MUL |  |
| alert_cal_alertid | int |  | MUL |  |
| when_sent | datetime |  |  |  |
| custom | varchar(255) |  |  |  |
| letter_html_path | varchar(200) |  |  |  |
| letter_pdf_path | varchar(200) |  |  |  |
| mark_as_done | tinyint | Y | MUL |  |
| alert_complete_date | datetime | Y |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| output_resource_id | int |  | MUL |  |
| output_resource_type | varchar(255) |  |  |  |
| output_resource_internal_type | varchar(255) |  |  |  |
| output_raw_resource | text |  |  |  |
| output_note | text |  |  |  |
| exit_code_id | int |  | MUL |  |
| target_date | datetime |  |  |  |
| floating_target_date | datetime |  |  |  |
| estimate_handling_time | int |  | MUL |  |
| actual_handling_time | int |  | MUL |  |
| assigned_by_user_id | int |  | MUL |  |
| assigned_to_user_id | int |  | MUL |  |
| completed_by_user_id | int |  | MUL |  |
| sticky | int |  | MUL |  |