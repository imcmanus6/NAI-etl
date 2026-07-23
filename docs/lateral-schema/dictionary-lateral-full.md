# Lateral (full) — Schema Data Dictionary

Source: Lateral tenant DB — all tables. **398 tables, 4920 columns, 628 inferred joins.**

> Relationships are INFERRED from column-naming conventions; these schemas have no foreign-key constraints. Treat inferred joins as a starting map to verify, not a contract.


## Activity & Contact


### `call_conversations`  — ~26 rows
_Joins:_ `user_id`→`rdebt_users`, `case_id`→`rdebt_cases`, `debtor_id`→`rdebt_debtor`, `document_id`→`rdebt_documents`, `call_conversation_type_id`→`call_conversation_types`

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
| document_id | int | Y | MUL | `rdebt_documents` |
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
| call_conversation_type_id | int |  | MUL | `call_conversation_types` |
| call_type | varchar(255) |  |  |  |
| recording_link | text |  |  |  |
| call_script | text | Y |  |  |
| note | text |  |  |  |
| gateway_call_duration | decimal(27,9) | Y |  |  |
| general_disposition | varchar(255) | Y |  |  |

### `call_history`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `action_id`→`rdebt_actions`, `user_id`→`rdebt_users`, `debtor_id`→`rdebt_debtor`, `payment_id`→`rdebt_payment`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| external_id | int |  | MUL |  |
| case_id | int |  | MUL | `rdebt_cases` |
| action_id | int |  | MUL | `rdebt_actions` |
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

## Case & People


### `case_participants`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `participant_id`→`participants`, `participant_type_id`→`participant_types`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

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
| participant_type_id | int |  | MUL | `participant_types` |
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
_Joins:_ `user_id`→`rdebt_users`, `email_type_id`→`email_types`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| account | varchar(255) | Y | MUL |  |
| note | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| user_id | varchar(255) | Y |  | `rdebt_users` |
| created | datetime | Y |  |  |
| updated | datetime | Y |  |  |
| email_type_id | int | Y | MUL | `email_types` |
| owner_type | varchar(255) | Y |  |  |
| owner_id | int | Y | MUL |  |
| source | varchar(255) |  |  |  |
| isAuthorizedEmail | tinyint(1) |  | MUL |  |
| doNotSendEmail | tinyint(1) |  |  |  |

### `participants`  — ~0 rows
_Joins:_ `participant_type_id`→`participant_types`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(1000) |  |  |  |
| name_custom_alias | varchar(1000) |  |  |  |
| salutation | varchar(20) |  |  |  |
| ref | varchar(255) |  |  |  |
| ext_ref | varchar(255) |  |  |  |
| participant_type_id | int |  | MUL | `participant_types` |
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
_Joins:_ `case_id`→`rdebt_cases`, `action_id`→`rdebt_actions`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| link_id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| group_id | int |  | MUL |  |
| error | tinyint |  | MUL |  |
| error_msg | varchar(255) |  |  |  |
| ordering | int | Y | MUL |  |
| action_id | int | Y |  | `rdebt_actions` |
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
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `operatorid`→`rdebt_users`, `bailiffid`→`rdebt_users`, `debtorid`→`rdebt_debtor`, `current_stage_id`→`rdebt_stages`, `court_id`→`rdebt_courts`, `batch_id`→`batch`, `branch_id`→`rdebt_branches`

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
| batch_id | varchar(255) |  |  | `batch` |
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

## Case & People — other


### `case_actions_logging`  — ~69 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| previous_stage_id | int |  | MUL |  |
| previous_stage_name | varchar(255) |  |  |  |
| new_stage_id | int |  | MUL |  |
| new_stage_name | varchar(255) |  |  |  |
| previous_status_id | int | Y | MUL |  |
| previous_status_name | varchar(255) | Y |  |  |
| previous_status_type | int | Y | MUL |  |
| new_status_id | int |  | MUL |  |
| new_status_name | varchar(255) |  |  |  |
| new_status_type | int |  | MUL |  |
| user_id | int |  | MUL | `rdebt_users` |
| date | datetime |  |  |  |
| previous_scheme_id | int |  | MUL |  |
| previous_scheme_name | varchar(255) |  |  |  |
| new_scheme_id | int |  | MUL |  |
| new_scheme_name | varchar(255) |  |  |  |

### `case_data_definition_scheme_manager_link_settings`  — ~0 rows
_Joins:_ `case_data_definition_scheme_manager_link_id`→`case_data_definition_scheme_manager_links`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| case_data_definition_scheme_manager_link_id | int |  | MUL | `case_data_definition_scheme_manager_links` |
| scope | varchar(255) |  |  |  |
| settings | text |  |  |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `case_data_definition_scheme_manager_links`  — ~0 rows
_Joins:_ `scheme_manager_id`→`rdebt_scheme_manager`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_data_definition_id | int |  | MUL |  |
| scheme_manager_id | int |  | MUL | `rdebt_scheme_manager` |

### `case_debtor_links`  — ~53,800 rows
_Joins:_ `case_id`→`rdebt_cases`, `debtor_id`→`rdebt_debtor`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| default | tinyint(1) |  | MUL |  |
| position | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `case_mask_scheme_manager_links`  — ~0 rows
_Joins:_ `custom_mask_id`→`custom_masks`, `scheme_manager_id`→`rdebt_scheme_manager`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| custom_mask_id | int |  | MUL | `custom_masks` |
| scheme_manager_id | int |  | MUL | `rdebt_scheme_manager` |
| role | varchar(255) |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| ordering | int |  | MUL |  |
| default | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `case_payment_terms`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `payment_term_id`→`payment_terms`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| payment_term_id | int |  | MUL | `payment_terms` |
| active | tinyint(1) |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `case_popup_rule`  — ~0 rows
_Joins:_ `scheme_id`→`rdebt_schemes`, `dynamic_asset_id`→`dynamic_assets`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| type | int |  |  |  |
| priority | int |  |  |  |
| query | text |  |  |  |
| visible_to | int |  |  |  |
| group | text |  |  |  |
| scheme_id | int |  |  | `rdebt_schemes` |
| dynamic_asset_id | int |  | MUL | `dynamic_assets` |
| deleted | tinyint(1) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  |  | `rdebt_users` |

### `case_timers`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `timer_id`→`timers`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| timer_id | int |  | MUL | `timers` |
| start_date | datetime |  |  |  |
| expiry_date | datetime |  |  |  |
| expiry_date_override | datetime |  |  |  |
| notes | text |  |  |  |
| status | varchar(255) |  |  |  |
| completed_at | datetime |  |  |  |
| completed_by | int |  | MUL |  |
| completion_status | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `debtor_expenditure`  — ~0 rows
_Joins:_ `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| description | varchar(255) |  |  |  |
| amount | decimal(9,2) |  |  |  |
| type | int |  |  |  |
| date | date |  |  |  |
| frequency | int |  | MUL |  |

### `participant_types`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |

### `rdebt_address`  — ~57,108 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| address_id | int |  | PRI |  |
| address_label | varchar(255) |  |  |  |
| address_addressee | varchar(255) |  |  |  |
| address_entered_date | timestamp |  |  |  |
| address_entered_userid | int | Y | MUL |  |
| address_updated_date | datetime |  |  |  |
| address_debtorid | int |  | MUL |  |
| address_ln1 | text |  |  |  |
| address_ln2 | varchar(255) |  |  |  |
| address_ln3 | varchar(244) |  |  |  |
| address_town | varchar(255) |  |  |  |
| address_country | varchar(255) |  |  |  |
| address_postcode | varchar(255) |  | MUL |  |
| address_cords | varchar(255) | Y |  |  |
| address_main | tinyint |  | MUL |  |
| address_enforce | tinyint |  | MUL |  |
| address_repossession | tinyint |  | MUL |  |
| address_notes | varchar(255) |  |  |  |
| LONG | float(12,9) |  |  |  |
| LAT | float(12,9) |  |  |  |
| address_cleaned | tinyint(1) |  | MUL |  |
| address_confirmed | int |  | MUL |  |
| address_type | int | Y | MUL |  |
| address_area | varchar(255) | Y |  |  |
| is_cleansed | varchar(255) |  |  |  |
| score | varchar(255) |  |  |  |
| address_returned | tinyint(1) |  | MUL |  |
| address_returned_date | date |  |  |  |
| address_non_physical | tinyint(1) |  | MUL |  |
| address_bad | tinyint(1) |  | MUL |  |
| address_bad_date | datetime | Y |  |  |

### `rdebt_address_type`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) | Y |  |  |
| role | varchar(255) | Y |  |  |
| ordering | int | Y | MUL |  |

### `rdebt_case_contact_attempts`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  |  | `rdebt_cases` |
| contact_method | text | Y |  |  |
| attempted_at | datetime |  |  |  |
| status | tinyint(1) |  |  |  |
| reason_code | varchar(50) | Y |  |  |
| contact_timezone | varchar(255) | Y |  |  |

### `rdebt_case_cost_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) | Y |  |  |
| description | varchar(255) | Y |  |  |
| ordering | int | Y | MUL |  |

### `rdebt_case_fees_bu`  — ~0 rows
_Joins:_ `userid`→`rdebt_users`, `bailiffid`→`rdebt_users`, `caseid`→`rdebt_cases`, `feeid`→`rdebt_fees`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| cf_id | int |  | PRI |  |
| dateentered | datetime |  |  |  |
| userid | mediumint |  | MUL | `rdebt_users` |
| bailiffid | int | Y | MUL | `rdebt_users` |
| caseid | int |  | MUL | `rdebt_cases` |
| feeid | int |  | MUL | `rdebt_fees` |
| fixed_amount | decimal(10,2) |  |  |  |
| invoiced | tinyint |  | MUL |  |

### `rdebt_case_links`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_1_id | int |  | MUL |  |
| case_2_id | int |  | MUL |  |
| approved | tinyint(1) |  | MUL |  |
| modified_at | timestamp |  |  |  |

### `rdebt_case_management_relationships`  — ~1,211 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_type | enum('User','Team') |  | MUL |  |
| parent_id | int |  | MUL |  |
| child_type | enum('Client','Case') |  | MUL |  |
| child_id | int |  | MUL |  |

### `rdebt_case_notes`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| user_id | int |  | MUL | `rdebt_users` |
| note | text |  |  |  |
| added_date | datetime |  |  |  |

### `rdebt_case_potential_matches`  — ~0 rows
_Joins:_ `debtor_id`→`rdebt_debtor`, `batch_id`→`batch`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| batch_id | int | Y | MUL | `batch` |
| potential_debtor_id | int |  | MUL |  |
| action_taken_on_cases | text |  |  |  |
| is_visible | int |  | MUL |  |
| is_potential | int | Y | MUL |  |
| created_date | datetime |  |  |  |
| modified_date | datetime |  |  |  |
| modified_by | int | Y | MUL |  |
| potential_merge_method | varchar(255) | Y |  |  |

### `rdebt_case_remittance_payee`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `address_id`→`rdebt_address`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| address_id | int |  | MUL | `rdebt_address` |
| name | varchar(255) |  |  |  |

### `rdebt_case_stages`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `stage_id`→`rdebt_stages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| stage_id | int |  | MUL | `rdebt_stages` |
| completed | tinyint |  | MUL |  |
| duedate | date |  |  |  |
| last_modified | datetime |  |  |  |
| last_modified_by | int |  | MUL |  |

### `rdebt_case_starting_split`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| split_debt | decimal(10,2) | Y |  |  |
| split_fees | decimal(10,2) | Y |  |  |
| label | varchar(255) |  |  |  |

### `rdebt_case_status`  — ~49 rows
_Joins:_ `returncode_id`→`rdebt_returncodes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| status_name | varchar(255) |  |  |  |
| status_type | int |  | MUL |  |
| default | tinyint |  | MUL |  |
| slug | varchar(50) |  |  |  |
| hexcolor | varchar(8) |  |  |  |
| returncode_id | int | Y | MUL | `rdebt_returncodes` |
| successful | tinyint(1) |  | MUL |  |
| status_desc | varchar(255) |  |  |  |
| short_name | varchar(255) | Y |  |  |
| no_of_days | int | Y | MUL |  |
| sort_order | int |  | MUL |  |
| credit_reporting_code | varchar(255) |  |  |  |
| compliance_code | varchar(24) | Y |  |  |

### `rdebt_case_status_type`  — ~4 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| status | varchar(255) |  |  |  |
| short_name | varchar(255) | Y |  |  |

### `rdebt_cases_visited`  — ~139 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| visit_id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| user_id | int |  | MUL | `rdebt_users` |
| timestamp | timestamp |  |  |  |
| slug | varchar(255) |  |  |  |

### `rdebt_debtor_merge_log`  — ~2,411 rows
_Joins:_ `user_id`→`rdebt_users`, `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| master_case_id | int |  | MUL |  |
| old_data | text |  |  |  |
| merge_type | varchar(255) |  |  |  |
| merge_method | varchar(50) |  |  |  |
| merge_type_ref_id | int |  | MUL |  |
| merge_date | datetime |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| is_reverted | tinyint(1) | Y | MUL |  |
| master_debtor_id | int |  | MUL |  |
| debtor_id | int | Y | MUL | `rdebt_debtor` |
| debtor_merged_to_id | int | Y | MUL |  |

### `rdebt_debtor_telephone`  — ~268,011 rows
_Joins:_ `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| number | varchar(255) |  | MUL |  |
| type | enum('Home','Work','Mobile','Fax','Do not Call','Other','Bad','Pager','VoIP','International') |  |  |  |
| date | datetime |  |  |  |
| isTelephonePreferenceService | tinyint(1) |  | MUL |  |
| isExDirectory | tinyint(1) |  | MUL |  |
| isDefault | tinyint(1) |  | MUL |  |
| isActive | tinyint(1) |  | MUL |  |
| source | varchar(255) |  |  |  |
| isAuthorizedCell | tinyint(1) |  | MUL |  |
| isPutOnNotice | tinyint(1) |  | MUL |  |
| information_date | datetime |  |  |  |
| authorization_date | datetime |  |  |  |
| revocation_date | datetime |  |  |  |
| isUnverifiedNumber | tinyint(1) |  | MUL |  |
| isAuthorizedText | tinyint(1) |  | MUL |  |
| isWrongNumber | tinyint(1) |  |  |  |
| invalid_count | int |  |  |  |
| total_count | int |  |  |  |
| number_digits | varchar(32) | Y | MUL |  |

### `rdebt_debtor_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) | Y |  |  |
| description | varchar(255) | Y |  |  |
| ordering | int | Y | MUL |  |

### `relationship_type_links`  — ~0 rows
_Joins:_ `relationship_type_id`→`relationship_types`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_type | varchar(255) |  | MUL |  |
| data_id | varchar(255) |  | MUL |  |
| relationship_type_id | int |  | MUL | `relationship_types` |

### `relationship_types`  — ~2 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| left_type | varchar(255) |  | MUL |  |
| right_type | varchar(255) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `relationships`  — ~0 rows
_Joins:_ `relationship_type_id`→`relationship_types`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| left_type | varchar(255) |  | MUL |  |
| left_id | int |  | MUL |  |
| right_type | varchar(255) |  | MUL |  |
| right_id | int |  | MUL |  |
| relationship_type_id | int |  | MUL | `relationship_types` |
| primary | tinyint(1) |  | MUL |  |
| ordering | int |  | MUL |  |
| user_id | int |  | MUL | `rdebt_users` |
| date | datetime |  |  |  |

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
_Joins:_ `client_type_id`→`rdebt_client_types`, `branch_id`→`rdebt_branches`

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
| client_type_id | int | Y | MUL | `rdebt_client_types` |
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
_Joins:_ `officer_type_id`→`rdebt_officer_types`, `clientID`→`rdebt_clients`, `branch_id`→`rdebt_branches`, `operator_agent_type_id`→`rdebt_operator_agent_type`

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
| officer_type_id | int | Y | MUL | `rdebt_officer_types` |
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
| operator_agent_type_id | int |  | MUL | `rdebt_operator_agent_type` |
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

## Clients, schemes & orgs


### `client_fees`  — ~86 rows
_Joins:_ `client_id`→`rdebt_clients`, `fee_id`→`rdebt_fees`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| client_fees_id | int |  | PRI |  |
| client_id | int |  | MUL | `rdebt_clients` |
| fee_id | int |  | MUL | `rdebt_fees` |
| amount | decimal(8,2) |  |  |  |
| configuration | text | Y |  |  |

### `client_interest_rates`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `interest_rate_id`→`interest_rates`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| interest_rate_id | int |  | MUL | `interest_rates` |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `client_scheme_method_payoutdays`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| client_m_id | int |  | PRI |  |
| client_m_clientid | int |  | MUL |  |
| client_m_schemeid | int |  | MUL |  |
| client_m_method | int |  | MUL |  |
| client_m_days | int |  | MUL |  |

### `client_scheme_payment_codes`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| payment_code | varchar(255) |  |  |  |
| type | tinyint |  | MUL |  |

### `client_specific_fees_details`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| client_id | int |  |  | `rdebt_clients` |
| outcome_id | int |  |  |  |
| outcome_fee | float(11,2) | Y |  |  |
| agent_fee | float(11,2) | Y |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  |  | `rdebt_users` |
| agent_points | int |  |  |  |
| new_outcome_rates_apply_from | date |  |  |  |
| new_agent_points_and_fee_apply_from | date |  |  |  |

### `client_specific_statuses`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| client_id | int |  |  | `rdebt_clients` |
| status_id | int |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |

### `rdebt_client_contacts`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| contact_id | int |  | PRI |  |
| contact_company | int |  | MUL |  |
| contact_first | varchar(100) |  |  |  |
| contact_last | varchar(100) |  |  |  |
| contact_title | varchar(100) |  |  |  |
| contact_email | varchar(100) |  |  |  |
| contact_phone1 | varchar(15) |  |  |  |
| contact_phone2 | varchar(15) |  |  |  |
| contact_current | tinyint |  | MUL |  |
| contact_passwd | varchar(50) |  |  |  |
| contact_primary | tinyint |  | MUL |  |
| contact_billingperson | tinyint |  | MUL |  |
| contact_fullname | varchar(120) |  |  |  |
| modified | timestamp |  |  |  |

### `rdebt_client_event_action_mapping`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| client_id | int |  | MUL | `rdebt_clients` |
| event_code | int |  |  |  |
| action_code | varchar(255) |  |  |  |
| action_name | varchar(255) |  |  |  |

### `rdebt_client_form_data`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| form_id | int |  | MUL |  |
| case_id | int |  | MUL | `rdebt_cases` |
| user_id | int |  | MUL | `rdebt_users` |
| form_values | longtext | Y |  |  |
| created_at | datetime |  |  |  |
| status | tinyint(1) |  | MUL |  |
| is_calculation_remain | tinyint(1) |  | MUL |  |
| form_type | text | Y |  |  |
| qc_comment_review | tinyint(1) |  |  |  |
| score_challenged | int | Y |  |  |

### `rdebt_client_forms`  — ~17 rows
_Joins:_ `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| form_name | varchar(255) |  |  |  |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_cat_id | int |  | MUL |  |
| content | mediumtext | Y |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| form_slug | varchar(255) |  |  |  |
| dpa_check | text | Y |  |  |
| qc_verification_required | tinyint(1) |  |  |  |

### `rdebt_client_return_code`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| client_id | varchar(255) |  |  | `rdebt_clients` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| return_code_id | int |  | MUL |  |
| override_return_code_id | int | Y | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| code | int |  |  |  |
| return_name | varchar(255) |  |  |  |
| status_id | varchar(255) |  |  |  |

### `rdebt_client_types`  — ~15 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(50) | Y |  |  |
| description | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| slug | varchar(50) |  |  |  |
| credit_code | varchar(24) | Y |  |  |

### `rdebt_contractor_case_links`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `contractor_id`→`rdebt_contractors`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| created_at | datetime | Y |  |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| contractor_id | int | Y | MUL | `rdebt_contractors` |
| cost | decimal(9,2) | Y |  |  |
| vat | decimal(9,2) | Y |  |  |
| start_datetime | datetime | Y |  |  |
| end_datetime | datetime | Y |  |  |

### `rdebt_contractors`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| ordering | int | Y | MUL |  |

### `rdebt_court_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) | Y |  |  |
| description | varchar(255) | Y |  |  |
| ordering | int | Y | MUL |  |

### `rdebt_scheme_manager`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text | Y |  |  |
| vatrate | text | Y |  |  |
| invoice | text | Y |  |  |
| returnreport | text | Y |  |  |
| ordering | char(1) |  |  |  |
| claimant_field | varchar(255) |  |  |  |
| debtor_field | varchar(50) |  |  |  |
| offense_date_field | varchar(255) |  |  |  |
| second_date_field | varchar(255) |  |  |  |
| extra_interest_days | int |  | MUL |  |
| amount1_field | varchar(255) |  |  |  |
| amount2_field | varchar(255) |  |  |  |
| letter_category_field | varchar(255) |  |  |  |
| execution_default1 | decimal(7,2) |  |  |  |
| execution_default2 | decimal(7,2) |  |  |  |
| court_field | varchar(150) |  |  |  |
| slug | varchar(255) |  |  |  |
| case_page_custom_fields | text |  |  |  |
| financial_scheme_master | int |  | MUL |  |
| case_details_columns | varchar(10) |  |  |  |
| case_details_panels_open | varchar(10) |  |  |  |
| duplicate_case_validate_on | text | Y |  |  |
| link_across_client | tinyint |  | MUL |  |
| link_across_workflow | tinyint |  | MUL |  |
| copy_link_case_data | tinyint(1) |  | MUL |  |
| custom_field_priority | tinyint(1) |  | MUL |  |
| searchable_fields | text | Y |  |  |
| record_side_modal_on_case_page | tinyint(1) | Y | MUL |  |
| type | varchar(255) | Y |  |  |
| breathing_space_config | text | Y |  |  |
| payment_split_default | varchar(255) |  |  |  |

### `rdebt_scheme_manager_fields`  — ~55 rows
_Joins:_ `scheme_manager_id`→`rdebt_scheme_manager`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| scheme_manager_id | int |  | MUL | `rdebt_scheme_manager` |
| record_type | varchar(255) | Y |  |  |
| label | varchar(255) | Y |  |  |
| variable_def | varchar(255) | Y |  |  |
| field_target | varchar(255) | Y |  |  |
| field_type | varchar(255) | Y |  |  |
| field_label | varchar(255) | Y |  |  |
| field_validation_1 | varchar(255) | Y |  |  |
| field_validation_2 | varchar(255) | Y |  |  |
| field_validation_3 | varchar(255) | Y |  |  |
| permission_to_read | varchar(255) | Y |  |  |
| permission_to_write | varchar(255) | Y |  |  |
| position | varchar(255) | Y |  |  |
| html_id | varchar(255) | Y |  |  |
| html_class | varchar(255) | Y |  |  |
| html_css_style | varchar(255) | Y |  |  |
| prefix_global | varchar(255) | Y |  |  |
| suffix_global | varchar(255) | Y |  |  |
| prefix_field_label | varchar(255) | Y |  |  |
| suffix_field_label | varchar(255) | Y |  |  |
| prefix_field_value | varchar(255) | Y |  |  |
| suffix_field_value | varchar(255) | Y |  |  |
| context | varchar(255) | Y |  |  |
| long_text | text | Y |  |  |
| simple_target | varchar(255) | Y |  |  |
| parent_id | int |  | MUL |  |
| priority | int |  | MUL |  |

### `rdebt_scheme_stage_link`  — ~175 rows
_Joins:_ `schemeid`→`rdebt_schemes`, `stageid`→`rdebt_stages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| schemeid | int |  | MUL | `rdebt_schemes` |
| stageid | int |  | MUL | `rdebt_stages` |
| ordering | int |  | MUL |  |

## Communication & documents


### `call_conversation_groups`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| conversation_id | int | Y | MUL |  |
| group_id | int | Y | MUL |  |

### `call_conversation_status`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| gateway_code | varchar(50) | Y |  |  |
| gateway_title | varchar(255) | Y |  |  |
| gateway_short_title | varchar(50) | Y |  |  |
| gateway_type | varchar(50) | Y |  |  |
| title | varchar(255) | Y |  |  |
| short_title | varchar(50) | Y |  |  |
| ordering | smallint | Y | MUL |  |

### `call_conversation_types`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| active | tinyint(1) |  | MUL |  |
| priority | int |  | MUL |  |
| options | varchar(255) |  |  |  |
| gateway_options | varchar(255) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `call_groups`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| status | varchar(255) | Y | MUL |  |
| user_id | int | Y | MUL | `rdebt_users` |
| description | varchar(255) | Y |  |  |
| created | datetime | Y |  |  |
| updated | datetime | Y |  |  |
| send_after | datetime | Y |  |  |
| attempted | tinyint | Y | MUL |  |
| attempted_at | datetime | Y |  |  |
| sent | tinyint | Y | MUL |  |
| sent_at | datetime | Y |  |  |
| gateway_configuration | varchar(255) | Y |  |  |
| gateway_options | text | Y |  |  |
| gateway_name | varchar(255) | Y |  |  |
| gateway_response | text | Y |  |  |
| gateway_id | varchar(255) | Y |  |  |
| gateway_cost | decimal(27,9) | Y |  |  |
| gateway_status | varchar(255) | Y |  |  |
| call_type | varchar(255) |  |  |  |

### `call_result_outcomes`  — ~6 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(255) |  |  |  |

### `communication_distribution_lists`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| definition | text |  |  |  |
| communication_type | varchar(255) |  |  |  |
| communication_id | int |  | MUL |  |
| target_type | varchar(255) |  |  |  |
| target_id | int |  | MUL |  |
| role | text |  |  |  |
| description | text |  |  |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `communication_instances`  — ~277 rows
_Joins:_ `case_id`→`rdebt_cases`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| definition | text |  |  |  |
| description | text |  |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| communication_label | varchar(255) |  |  |  |
| communication_type | varchar(255) |  | MUL |  |
| communication_id | int |  | MUL |  |
| communication_details | text |  |  |  |
| target_label | varchar(255) |  |  |  |
| target_type | varchar(255) |  |  |  |
| target_id | int |  | MUL |  |
| target_details | text |  |  |  |
| output_label | varchar(255) |  |  |  |
| output_type | varchar(255) |  |  |  |
| output_id | int |  | MUL |  |
| output_details | text |  |  |  |
| role | text |  |  |  |
| template | text |  |  |  |
| variables | text |  |  |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| completed_by | int |  | MUL |  |
| completed_at | datetime |  |  |  |

### `document_category`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| slug | varchar(255) |  |  |  |

### `email_types`  — ~7 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| icon | varchar(255) | Y |  |  |

### `letter_grouped_layouts`  — ~0 rows
_Joins:_ `letter_layout_group_id`→`letter_layout_groups`, `letter_id`→`rdebt_letter`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| letter_layout_group_id | int |  | MUL | `letter_layout_groups` |
| letter_id | int |  | MUL | `rdebt_letter` |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `letter_groups`  — ~0 rows
_Joins:_ `letter_id`→`rdebt_letter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| letter_id | int |  | MUL | `rdebt_letter` |
| default_letter_id | int |  | MUL |  |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |

### `letter_header_footer_sets`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| header_id | int |  | MUL |  |
| header_scope | varchar(255) |  |  |  |
| footer_id | int |  | MUL |  |
| footer_scope | varchar(255) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `letter_layout_group_members`  — ~0 rows
_Joins:_ `letter_layout_group_id`→`letter_layout_groups`, `letter_layout_id`→`letter_layouts`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| page_selector | varchar(255) |  |  |  |
| letter_layout_group_id | int |  | MUL | `letter_layout_groups` |
| letter_layout_id | int |  | MUL | `letter_layouts` |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `letter_layout_groups`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `letter_layouts`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| template | text |  |  |  |
| margin | varchar(255) |  |  |  |
| header_footer_set_id | int |  | MUL |  |
| header_override_id | int |  | MUL |  |
| header_override_scope | varchar(255) |  |  |  |
| footer_override_id | int |  | MUL |  |
| footer_override_scope | varchar(255) |  |  |  |
| description | text |  |  |  |
| slug | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `letter_set_conditions`  — ~8 rows
_Joins:_ `letter_set_id`→`letter_sets`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| letter_set_id | int |  | MUL | `letter_sets` |
| field_1 | varchar(255) |  |  |  |
| operation | varchar(255) |  |  |  |
| field_2 | varchar(255) |  |  |  |
| field_2_plain | tinyint(1) |  | MUL |  |
| link_previous | tinyint(1) |  | MUL |  |
| condition | varchar(255) |  |  |  |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |

### `letter_set_results`  — ~4 rows
_Joins:_ `letter_set_id`→`letter_sets`, `letter_id`→`rdebt_letter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| letter_set_id | int |  | MUL | `letter_sets` |
| letter_id | int |  | MUL | `rdebt_letter` |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |

### `letter_sets`  — ~4 rows
_Joins:_ `letter_group_id`→`letter_groups`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| letter_group_id | int |  | MUL | `letter_groups` |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |

### `rdebt_documents`  — ~57 rows
_Joins:_ `user_id`→`rdebt_users`, `case_id`→`rdebt_cases`, `letter_id`→`rdebt_letter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| amazon_file | varchar(500) | Y |  |  |
| title | varchar(255) | Y |  |  |
| word_link | varchar(500) | Y |  |  |
| label | varchar(255) |  |  |  |
| doc_type | varchar(255) | Y |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| case_id | int |  | MUL | `rdebt_cases` |
| letter_id | int | Y | MUL | `rdebt_letter` |
| is_merged | tinyint(1) |  | MUL |  |
| order | int |  | MUL |  |
| expiry_date | date | Y |  |  |
| date_1 | date | Y |  |  |
| merge_applied | tinyint(1) |  |  |  |

### `rdebt_email_gateways`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(255) |  |  |  |
| adapter | varchar(255) |  |  |  |
| description | text |  |  |  |
| api_details | text |  |  |  |
| default_from_address | varchar(255) |  |  |  |
| default_from_name | varchar(255) |  |  |  |
| default_reply_to_address | varchar(255) |  |  |  |
| default_reply_to_name | varchar(255) |  |  |  |
| status | tinyint(1) |  | MUL |  |

### `rdebt_email_gateways_info`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| from_email | varchar(255) |  |  |  |
| from_name | varchar(255) |  |  |  |
| reply_to_email | varchar(255) |  |  |  |
| reply_to_name | varchar(255) |  |  |  |
| is_global | tinyint(1) |  | MUL |  |
| status | tinyint(1) |  | MUL |  |

### `rdebt_letter`  — ~3 rows
_Joins:_ `stage_id`→`rdebt_stages`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| letter_id | int |  | PRI |  |
| path_to_template | varchar(255) |  |  |  |
| letter_name | varchar(60) |  |  |  |
| stage_id | int |  | MUL | `rdebt_stages` |
| category_id | int |  | MUL |  |
| client_cheque | tinyint |  | MUL |  |
| letter_extra_variables | tinyint |  | MUL |  |
| final_payment | tinyint |  | MUL |  |
| slug | varchar(255) |  |  |  |
| letter_margin_override | varchar(50) |  |  |  |
| letter_font_family_override | varchar(50) | Y |  |  |
| letter_font_size_override | varchar(10) | Y |  |  |
| deliver_letter_electronically | varchar(50) | Y |  |  |
| deliver_letter_address | varchar(30) | Y |  |  |
| is_letter_pack | tinyint(1) | Y | MUL |  |
| orientation | varchar(20) | Y |  |  |
| letter_legacy | tinyint(1) | Y | MUL |  |
| letter_template | longtext | Y |  |  |
| header_footer_set_id | int |  | MUL |  |
| header_override_id | int |  | MUL |  |
| header_override_scope | varchar(255) |  |  |  |
| footer_override_id | int |  | MUL |  |
| footer_override_scope | varchar(255) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| sending_limit | int | Y | MUL |  |
| multiple_targets | tinyint(1) | Y | MUL |  |
| all_debtors | tinyint(1) | Y | MUL |  |
| all_participants | tinyint(1) | Y | MUL |  |
| client | tinyint(1) | Y | MUL |  |
| skip_editing | tinyint(1) | Y | MUL |  |
| send_to_all_debtor_addresses | tinyint(1) | Y | MUL |  |
| local_template_path | varchar(255) | Y |  |  |
| remote_template_path | varchar(255) | Y |  |  |
| apply_sending_limit_by_address | tinyint(1) | Y | MUL |  |
| execute_option | varchar(255) | Y |  |  |
| apply_sending_limit_by_address_case | tinyint(1) | Y |  |  |
| version | int |  |  |  |
| isActive | int |  |  |  |
| client_id | int |  |  | `rdebt_clients` |
| send_to_closed_cases | tinyint(1) |  |  |  |
| send_to_external_printers | tinyint(1) |  |  |  |

### `rdebt_letter_category`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| letter_category_id | int |  | PRI |  |
| category_name | varchar(60) |  |  |  |
| short_name | varchar(255) |  |  |  |
| description | text |  |  |  |
| writ | tinyint |  | MUL |  |
| scheme_id_default | int |  | MUL |  |
| writ_letter_id | int |  | MUL |  |

### `rdebt_letter_category_scheme_link`  — ~0 rows
_Joins:_ `schemeid`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| schemeid | int |  | MUL | `rdebt_schemes` |
| letter_cat_id | int |  | MUL |  |
| ordering | int |  | MUL |  |

### `rdebt_letter_extra_vars`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| extra_var_id | int |  | PRI |  |
| e_letter_id | int |  | MUL |  |
| e_variable | varchar(255) |  |  |  |
| e_variable_nice | varchar(255) |  |  |  |

### `rdebt_letter_grouping`  — ~0 rows
_Joins:_ `letter_id`→`rdebt_letter`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| letter_pack_id | varchar(255) | Y |  |  |
| name | varchar(255) | Y |  |  |
| letter_id | int | Y | MUL | `rdebt_letter` |
| client_id | int | Y | MUL | `rdebt_clients` |
| param1 | varchar(255) | Y |  |  |
| param2 | varchar(255) | Y |  |  |
| param3 | varchar(255) | Y |  |  |
| param4 | varchar(255) | Y |  |  |
| param5 | varchar(255) | Y |  |  |

### `rdebt_letter_pack_members`  — ~36 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| source_letter_id | int | Y | MUL |  |
| target_letter_id | int | Y | MUL |  |
| target_map_to_case_defined_document | tinyint(1) | Y | MUL |  |
| ordering | tinyint unsigned | Y | MUL |  |
| timestamp_created_at | datetime | Y |  |  |

### `rdebt_letter_scheme_link`  — ~75 rows
_Joins:_ `schemeid`→`rdebt_schemes`, `letterid`→`rdebt_letter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| schemeid | int |  | MUL | `rdebt_schemes` |
| letterid | int |  | MUL | `rdebt_letter` |
| ordering | int |  | MUL |  |

### `rdebt_sms`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| from_label | varchar(50) | Y |  |  |
| to_mobile | varchar(50) | Y |  |  |
| body | varchar(170) | Y |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| from_id | int |  | MUL |  |
| from_type | varchar(10) | Y |  |  |
| from_mobile | varchar(50) | Y |  |  |
| to_id | int |  | MUL |  |
| to_type | varchar(10) | Y |  |  |
| to_label | varchar(50) | Y |  |  |
| created_at | timestamp |  |  |  |

### `rdebt_template_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | tinytext | Y |  |  |

### `rdebt_templates`  — ~17 rows
_Joins:_ `user_id`→`rdebt_users`, `branch_id`→`rdebt_branches`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| template_name | varchar(255) |  |  |  |
| subject | varchar(255) |  |  |  |
| body | text |  |  |  |
| private | tinyint |  | MUL |  |
| user_id | int |  | MUL | `rdebt_users` |
| last_modified | timestamp |  |  |  |
| valid_for | varchar(255) | Y |  |  |
| valid_for_user_gid | varchar(255) | Y |  |  |
| is_letter | tinyint(1) | Y | MUL |  |
| is_email | tinyint(1) | Y | MUL |  |
| is_history_item | tinyint(1) | Y | MUL |  |
| is_sms | tinyint(1) | Y | MUL |  |
| is_alert | tinyint(1) | Y | MUL |  |
| settings | varchar(255) | Y |  |  |
| slug | varchar(255) | Y |  |  |
| target | varchar(255) | Y |  |  |
| is_note | tinyint(1) |  | MUL |  |
| display_to_client | tinyint(1) |  | MUL |  |
| custom_attributes | varchar(255) | Y |  |  |
| letter | int |  | MUL |  |
| send_to_all_debtors | tinyint(1) |  | MUL |  |
| branch_id | int | Y | MUL | `rdebt_branches` |
| cc | varchar(255) | Y |  |  |
| bcc | varchar(255) | Y |  |  |
| client_id | int |  |  | `rdebt_clients` |
| send_to_closed_cases | tinyint(1) |  |  |  |
| mms_image | varchar(255) | Y |  |  |

### `sms`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| created_at | datetime |  |  |  |
| send_after | datetime |  |  |  |
| to | varchar(255) |  |  |  |
| to_alias | varchar(255) | Y |  |  |
| from | varchar(255) | Y |  |  |
| body | text |  |  |  |
| attempted | tinyint | Y | MUL |  |
| attempted_at | datetime | Y |  |  |
| sent | tinyint(1) |  | MUL |  |
| sent_at | datetime | Y |  |  |
| delivered | tinyint(1) |  | MUL |  |
| delivered_at | datetime | Y |  |  |
| gateway_configuration | varchar(255) |  |  |  |
| gateway_options | text | Y |  |  |
| gateway_name | varchar(255) |  |  |  |
| gateway_response | text | Y |  |  |
| gateway_id | varchar(255) | Y |  |  |
| gateway_cost | decimal(27,9) |  |  |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| write_history | tinyint(1) |  | MUL |  |
| devliered_response | text | Y |  |  |
| status | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| sms_template_id | int | Y |  |  |

### `template`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| template_name | varchar(255) |  |  |  |
| template_entity_type | varchar(255) |  |  |  |
| template_entity_id | int |  |  |  |
| template_type | varchar(255) |  |  |  |
| template_params | text | Y |  |  |

### `template_parameter`  — ~0 rows
_Joins:_ `template_id`→`template`, `parameter_id`→`parameter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| template_id | int |  |  | `template` |
| parameter_id | int |  |  | `parameter` |

### `template_parameter_group`  — ~0 rows
_Joins:_ `template_id`→`template`, `parameter_group_id`→`parameter_group`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| template_id | int |  |  | `template` |
| parameter_group_id | int |  |  | `parameter_group` |

## Compliance


### `complaint_status`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| default | tinyint(1) |  | MUL |  |
| status_type_id | int |  | MUL |  |

### `complaint_status_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |

### `complaint_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |

### `rdebt_compliance_decision_logs`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `compliance_rule_id`→`rdebt_compliance_rules`, `contact_method_id`→`rdebt_contact_methods`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  |  | `rdebt_cases` |
| compliance_rule_id | int |  |  | `rdebt_compliance_rules` |
| contact_method_id | text | Y |  | `rdebt_contact_methods` |
| compliance_decision | text | Y |  |  |
| compliance_result | tinyint(1) |  |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `rdebt_compliance_links`  — ~0 rows
_Joins:_ `timezone_id`→`rdebt_timezones`, `export_id`→`exports`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| timezone_id | int |  |  | `rdebt_timezones` |
| blackout_dates_ids | text | Y |  |  |
| export_id | int | Y |  | `exports` |

### `rdebt_compliance_rules`  — ~0 rows
_Joins:_ `contact_method_id`→`rdebt_contact_methods`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_id | int | Y |  |  |
| data_scope | varchar(225) | Y |  |  |
| contact_method_id | varchar(225) | Y |  | `rdebt_contact_methods` |
| contact_frequency_time | int | Y |  |  |
| contact_frequency_period | int | Y |  |  |
| contact_hours_start | time | Y |  |  |
| contact_hours_end | time | Y |  |  |
| blackout_dates | longtext | Y |  |  |
| default_timezone_id | int | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |
| created_by | int | Y |  | `rdebt_users` |
| updated_by | int | Y |  | `rdebt_users` |

### `rdebt_compliance_rules_override`  — ~0 rows
_Joins:_ `compliance_link_id`→`rdebt_compliance_links`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| compliance_link_id | int |  |  | `rdebt_compliance_links` |
| rules | longtext | Y |  |  |
| override_scope | text | Y |  |  |
| override_id | int | Y |  |  |

## Config, lookups & system


### `activities`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| activity_type | varchar(255) |  |  |  |
| activity_id | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `audits`  — ~359 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_type | varchar(255) |  |  |  |
| data_id | int |  | MUL |  |
| data_from | text |  |  |  |
| data_to | text |  |  |  |
| message | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| date | datetime |  |  |  |

### `broken_arrangement_count`
_Joins:_ `caseid`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| caseid | int | Y |  | `rdebt_cases` |
| broken_arrangement_count | bigint |  |  |  |

### `config`  — ~15 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| key | varchar(255) |  |  |  |
| value | longtext |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `credit_report_case_table`  — ~0 rows
_Joins:_ `caseid`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| caseid | int |  | MUL | `rdebt_cases` |
| credit_report_date | date |  | MUL |  |
| credit_report_balance | float(11,2) |  |  |  |
| credit_report_flag | varchar(255) |  | MUL |  |
| custom1 | varchar(255) |  | MUL |  |
| custom2 | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `crontab`  — ~10 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| period | varchar(255) |  |  |  |
| cronjob | varchar(255) |  |  |  |
| params | varchar(255) | Y |  |  |
| custom_time_option | varchar(100) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| running | tinyint(1) |  | MUL |  |
| last_start_date | datetime |  |  |  |
| last_end_date | datetime |  |  |  |
| last_output | text | Y |  |  |
| last_error | text | Y |  |  |
| last_successful | tinyint(1) |  | MUL |  |
| active | tinyint(1) |  | MUL |  |
| next_execution_date | datetime | Y |  |  |
| priority | int |  |  |  |

### `crontab_results`  — ~0 rows
_Joins:_ `crontab_id`→`crontab`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| crontab_id | int |  | MUL | `crontab` |
| start_date | datetime |  |  |  |
| end_date | datetime |  |  |  |
| output | longtext | Y |  |  |
| error | text | Y |  |  |
| successful | tinyint(1) |  | MUL |  |

### `custom_data_definitions`  — ~72 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_type | varchar(255) |  |  |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| data_type | varchar(255) |  |  |  |
| definition | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `custom_mask_members`  — ~7 rows
_Joins:_ `custom_mask_id`→`custom_masks`, `custom_member_id`→`custom_members`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| custom_mask_id | int |  | MUL | `custom_masks` |
| custom_member_id | int |  | MUL | `custom_members` |
| scope | varchar(255) |  |  |  |
| settings | text |  |  |  |
| options | text |  |  |  |
| ordering | int |  | MUL |  |
| description | text |  |  |  |
| show_in_case_creation_page | tinyint(1) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `custom_masks`  — ~3 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| entity_type | varchar(255) |  |  |  |
| scope | varchar(255) |  |  |  |
| definition | text |  |  |  |
| description | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `custom_members`  — ~7 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| validation_logic | varchar(255) |  |  |  |
| validation_settings | varchar(255) |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| default_value | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |
| description | text |  |  |  |
| custom_member_id | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `customer_payment_cards`  — ~0 rows
_Joins:_ `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| card_identifier | varchar(255) |  |  |  |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| nickname | varchar(255) |  |  |  |
| payment_gateway | varchar(255) |  |  |  |
| card_type | varchar(255) | Y |  |  |
| last_digits | varchar(255) | Y |  |  |
| expiry_date | varchar(255) | Y |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `customisable_field_boolean_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | tinyint(1) | Y | MUL |  |

### `customisable_field_date_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | date | Y |  |  |

### `customisable_field_datetime_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | datetime | Y |  |  |

### `customisable_field_decimal_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | decimal(27,9) | Y |  |  |

### `customisable_field_definition`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| uid | varchar(45) |  | UNI |  |
| name | varchar(255) |  | UNI |  |
| owner_type | varchar(255) |  | MUL |  |
| data_type | enum('STRING','TEXT','INTEGER','DECIMAL','BOOLEAN','DATE','TIME','DATE_TIME','SET','RELATIONSHIP') |  |  |  |
| field_type | varchar(255) |  |  |  |
| required | tinyint(1) |  | MUL |  |
| validate | tinyint(1) |  | MUL |  |
| config | text | Y |  |  |

### `customisable_field_integer_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | int | Y | MUL |  |

### `customisable_field_set_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | text | Y |  |  |

### `customisable_field_string_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | varchar(255) | Y |  |  |

### `customisable_field_text_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | text | Y |  |  |

### `customisable_field_time_data`  — ~0 rows
_Joins:_ `customisable_field_definition_id`→`customisable_field_definition`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| customisable_field_definition_id | int |  | MUL | `customisable_field_definition` |
| owner_id | int |  | MUL |  |
| value | time | Y |  |  |

### `dan_arrangements_bu`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | MUL |  |
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

### `dan_payment_bu`  — ~0 rows
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| date | date |  |  |  |
| payout_date | date | Y |  |  |
| inputdate | datetime | Y |  |  |
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

### `dynamic_assets`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| content | text |  |  |  |
| scope | varchar(255) |  |  |  |
| method | varchar(255) |  |  |  |
| options | text |  |  |  |
| slug | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `entity_user_group_link`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_id | int |  |  |  |
| user_gid | int |  |  |  |
| entity_type | varchar(255) |  |  |  |

### `exchange_configurations`  — ~0 rows
_Joins:_ `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| key | varchar(255) |  |  |  |
| value | varchar(255) |  |  |  |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_gateways`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| adaptor | varchar(255) |  |  |  |
| active | tinyint(1) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_object_maps`  — ~0 rows
_Joins:_ `exchange_object_id`→`exchange_objects`, `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| virtual_internal_type | varchar(255) |  |  |  |
| virtual_internal_id | varchar(255) |  |  |  |
| virtual_external_type | varchar(255) |  |  |  |
| virtual_external_id | varchar(255) |  |  |  |
| internal_type | varchar(255) |  |  |  |
| internal_id | int |  | MUL |  |
| exchange_object_id | int |  | MUL | `exchange_objects` |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_object_transactions`  — ~0 rows
_Joins:_ `exchange_object_id`→`exchange_objects`, `exchange_transaction_id`→`exchange_transactions`, `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| exchange_object_id | int |  | MUL | `exchange_objects` |
| exchange_transaction_id | int |  | MUL | `exchange_transactions` |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_objects`  — ~0 rows
_Joins:_ `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| role | varchar(255) |  |  |  |
| internal_data | text |  |  |  |
| external_data | text |  |  |  |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_resource_transactions`  — ~0 rows
_Joins:_ `exchange_resource_id`→`exchange_resources`, `exchange_transaction_id`→`exchange_transactions`, `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| exchange_resource_id | int |  | MUL | `exchange_resources` |
| exchange_transaction_id | int |  | MUL | `exchange_transactions` |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_resources`  — ~0 rows
_Joins:_ `exchange_gateway_id`→`exchange_gateways`, `document_id`→`rdebt_documents`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| internal_name | int |  | MUL |  |
| external_name | int |  | MUL |  |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| document_id | int |  | MUL | `rdebt_documents` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exchange_transactions`  — ~0 rows
_Joins:_ `exchange_gateway_id`→`exchange_gateways`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| direction | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| internal_label | varchar(255) |  |  |  |
| external_label | varchar(255) |  |  |  |
| internal_ref | varchar(255) |  |  |  |
| external_ref | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| exchange_gateway_id | int |  | MUL | `exchange_gateways` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `failed_payment_splits`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `financial_split_override_id`→`financial_split_overrides`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| amount | double(10,2) | Y |  |  |
| date | datetime |  |  |  |
| method | varchar(255) |  |  |  |
| financial_split_override_id | int |  | MUL | `financial_split_overrides` |

### `fee_payments`  — ~0 rows
_Joins:_ `case_fee_id`→`rdebt_case_fees`, `payment_id`→`rdebt_payment`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_fee_id | int |  | MUL | `rdebt_case_fees` |
| payment_id | int |  | MUL | `rdebt_payment` |
| created_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |

### `field_letter`  — ~0 rows
_Joins:_ `letter_id`→`rdebt_letter`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| agent_id | int |  |  |  |
| letter_id | int |  |  | `rdebt_letter` |
| letter_quantity | int |  |  |  |
| letter_version | int |  |  |  |
| delivered_quantity | int |  |  |  |
| return_destroy | tinyint(1) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  |  | `rdebt_users` |
| spoilt_letter | tinyint(1) |  |  |  |
| spoilt_letter_quantity | int |  |  |  |
| qr_code_scan_failure_count | int |  |  |  |

### `field_pages`  — ~0 rows
_Joins:_ `page_id`→`pages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| page_id | int |  | PRI | `pages` |
| page_slug | varchar(25) |  | UNI |  |
| page_nice_name | varchar(50) |  |  |  |

### `field_pagesets`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| field_pagesets | int |  | PRI |  |
| link_pageid | int |  | MUL |  |
| link_setid | int |  | MUL |  |
| get_param | varchar(50) |  |  |  |
| page_set_ordering | int |  | MUL |  |

### `field_search_filters`  — ~46 rows
_Joins:_ `field_id`→`fields`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| search_id | int |  | MUL |  |
| condition_type | varchar(50) | Y |  |  |
| table_id | int | Y | MUL |  |
| field_id | int | Y | MUL | `fields` |
| operator | varchar(20) | Y |  |  |
| threshold | varchar(100) | Y |  |  |

### `field_searches`  — ~12 rows
_Joins:_ `user_id`→`rdebt_users`, `branch_id`→`rdebt_branches`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| user_id | int | Y | MUL | `rdebt_users` |
| name | varchar(255) | Y |  |  |
| target_table | int | Y | MUL |  |
| search_query | mediumtext | Y |  |  |
| search_dsd | text | Y |  |  |
| search_condition | text | Y |  |  |
| is_system_alert | tinyint | Y | MUL |  |
| is_case_related | int |  | MUL |  |
| branch_id | int |  | MUL | `rdebt_branches` |
| scheme_category_id | int | Y | MUL |  |

### `field_sets`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| sets_id | int |  | PRI |  |
| context | varchar(100) |  |  |  |
| pre_html | text |  |  |  |
| after_html | text |  |  |  |
| pre_label_html | varchar(100) |  |  |  |
| after_label_html | varchar(100) |  |  |  |
| pre_field_html | varchar(100) |  |  |  |
| after_field_html | varchar(100) |  |  |  |
| type | varchar(8) |  |  |  |
| slug | varchar(20) |  |  |  |
| get_data | varchar(150) |  |  |  |

### `fields`  — ~4,208 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| field_id | int |  | PRI |  |
| label | varchar(200) |  |  |  |
| table_id | int |  | MUL |  |
| table_col | varchar(100) |  |  |  |
| field_type | varchar(255) |  |  |  |
| field_validation | varchar(255) |  |  |  |
| perform_magic | varchar(255) |  |  |  |
| link_table_id | int |  | MUL |  |
| link_table_key | varchar(50) |  |  |  |
| link_table_value | varchar(50) |  |  |  |
| client_field_marker | tinyint |  | MUL |  |
| client_shortcode | varchar(50) |  |  |  |
| link_table_filter | varchar(35) |  |  |  |
| link_table_filter_value | varchar(35) |  |  |  |
| magic_key | varchar(35) | Y |  |  |

### `fields_controller`  — ~13 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| fc_id | int |  | PRI |  |
| fc_set_id | int |  | MUL |  |
| fc_field_id | int |  | MUL |  |
| types | varchar(20) |  |  |  |
| parent_id | int |  | MUL |  |
| priority | int |  | MUL |  |
| long_text | varchar(255) |  |  |  |
| permission_to_read | varchar(255) |  |  |  |
| permission_to_write | varchar(255) |  |  |  |
| validation_overwrite | varchar(255) |  |  |  |
| js_long_text | varchar(255) |  |  |  |
| label_overwrite | varchar(255) |  |  |  |
| container_start | varchar(150) |  |  |  |
| container_end | varchar(255) |  |  |  |
| show_label | tinyint |  | MUL |  |
| field_start | varchar(255) |  |  |  |
| field_end | varchar(255) |  |  |  |

### `fields_tables`  — ~349 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| ft_id | int |  | PRI |  |
| table_name | varchar(100) |  |  |  |
| table_label | varchar(255) |  |  |  |

### `form_block_forms`  — ~3 rows
_Joins:_ `form_block_id`→`form_blocks`, `form_form_id`→`form_forms`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| form_block_id | int |  | MUL | `form_blocks` |
| form_form_id | int |  | MUL | `form_forms` |
| position | int |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `form_block_items`  — ~37 rows
_Joins:_ `form_block_id`→`form_blocks`, `form_item_id`→`form_items`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| form_block_id | int |  | MUL | `form_blocks` |
| form_item_id | int |  | MUL | `form_items` |
| position | int |  | MUL |  |
| mandatory | tinyint(1) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| composition_logic | text |  |  |  |

### `form_blocks`  — ~4 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| content | varchar(1000) |  |  |  |
| slug | varchar(50) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `form_forms`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| content | varchar(1000) |  |  |  |
| slug | varchar(50) |  |  |  |
| options | varchar(1000) |  |  |  |
| settings | varchar(255) |  |  |  |
| output_resource_type | varchar(255) |  |  |  |
| output_resource_internal_type | varchar(255) |  |  |  |
| active | tinyint(1) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `form_instance_results`  — ~3 rows
_Joins:_ `form_instance_id`→`form_instances`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| content | mediumtext | Y |  |  |
| form_instance_id | int |  | MUL | `form_instances` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| submitted_by | int |  | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| submitted_at | datetime |  |  |  |

### `form_instances`  — ~45 rows
_Joins:_ `form_form_id`→`form_forms`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| content | mediumtext | Y |  |  |
| output_resource_id | int |  | MUL |  |
| output_resource_type | varchar(255) |  |  |  |
| output_resource_internal_type | varchar(255) |  |  |  |
| form_form_id | int |  | MUL | `form_forms` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| submitted_by | int |  | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| submitted_at | datetime |  |  |  |

### `form_item_custom_field_connections`  — ~0 rows
_Joins:_ `form_item_id`→`form_items`, `scheme_manager_id`→`rdebt_scheme_manager`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| form_item_id | int |  | MUL | `form_items` |
| scheme_manager_id | int |  | MUL | `rdebt_scheme_manager` |
| custom_field_data_type | varchar(255) |  |  |  |
| custom_field_data_scope | varchar(255) |  |  |  |
| custom_field_field_key | varchar(255) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `form_items`  — ~39 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| content | varchar(1000) |  |  |  |
| type | varchar(255) |  |  |  |
| validation_logic | varchar(255) |  |  |  |
| validation_settings | varchar(255) |  |  |  |
| options | varchar(1000) |  |  |  |
| settings | varchar(255) |  |  |  |
| default_value | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `ftp_config`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| scheme | varchar(255) | Y |  |  |
| host | varchar(255) | Y |  |  |
| slug | varchar(255) | Y |  |  |
| username | varchar(255) | Y |  |  |
| password | varchar(255) | Y |  |  |
| port | varchar(255) | Y |  |  |
| base_path | varchar(255) | Y |  |  |

### `history_audit`  — ~0 rows
_Joins:_ `history_id`→`rdebt_history`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| history_id | int |  | MUL | `rdebt_history` |
| is_reported | tinyint(1) |  | MUL |  |
| reported_date | date |  |  |  |
| created_at | datetime |  |  |  |

### `history_tags`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `history_id`→`rdebt_history`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| history_id | int |  | MUL | `rdebt_history` |
| description | text |  |  |  |
| severity | varchar(255) |  |  |  |
| colour | varchar(255) |  |  |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `holidays`  — ~216 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| type | varchar(255) |  |  |  |
| date | date |  |  |  |

### `interest_rate_items`  — ~0 rows
_Joins:_ `interest_rate_id`→`interest_rates`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| interest_rate_id | int |  | MUL | `interest_rates` |
| name | varchar(255) |  |  |  |
| description | varchar(255) |  |  |  |
| value | decimal(10,2) |  |  |  |
| type | varchar(255) |  |  |  |
| charge_period | varchar(255) |  |  |  |
| calculation_period | varchar(255) |  |  |  |
| start_date | date |  |  |  |
| end_date | date |  |  |  |
| active | tinyint(1) |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `interest_rates`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | varchar(255) |  |  |  |
| from_target_date_offset | int |  | MUL |  |
| from_target_date_offset_type | varchar(255) |  |  |  |
| to_target_date_offset | int |  | MUL |  |
| to_target_date_offset_type | varchar(255) |  |  |  |
| active | tinyint(1) |  | MUL |  |
| slug | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `invoice_invoiced_items`  — ~0 rows
_Joins:_ `invoice_id`→`invoices`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| item_type_id | int | Y | MUL |  |
| description | varchar(255) | Y |  |  |
| quantity | float | Y |  |  |
| unit_price | decimal(27,9) | Y |  |  |
| vat_rate | float | Y |  |  |
| total | decimal(27,9) | Y |  |  |
| invoice_id | int | Y | MUL | `invoices` |

### `invoice_item_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |

### `invoices`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `document_id`→`rdebt_documents`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| internal_ref | varchar(255) | Y |  |  |
| date_created | timestamp |  |  |  |
| date_issued | datetime | Y |  |  |
| date_due | date | Y |  |  |
| subject | varchar(255) | Y |  |  |
| client_id | int | Y | MUL | `rdebt_clients` |
| subtotal | decimal(27,9) | Y |  |  |
| vat | decimal(27,9) | Y |  |  |
| total | decimal(27,9) | Y |  |  |
| document_id | int | Y | MUL | `rdebt_documents` |

### `ip_address_ranges`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| begin_ip | varchar(45) |  | MUL |  |
| end_ip | varchar(45) |  |  |  |
| country_code | varchar(2) |  |  |  |
| country_name | varchar(100) |  |  |  |
| description | text | Y |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `label_for_message`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| title | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |

### `logging`  — ~293 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| priority | varchar(255) |  |  |  |
| message | text |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| date | datetime |  |  |  |
| data | mediumtext | Y |  |  |
| scope | varchar(255) | Y |  |  |

### `message_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| m_type_id | int |  | PRI |  |
| m_type_name | varchar(100) |  |  |  |

### `my_posts`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| title | varchar(255) |  |  |  |
| body | text | Y |  |  |

### `opened_case_details`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| user_id | int |  | MUL | `rdebt_users` |
| date | datetime | Y |  |  |

### `page_panels`  — ~79 rows
_Joins:_ `page_id`→`pages`, `panel_id`→`panels`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| page_id | int | Y | MUL | `pages` |
| panel_id | int |  | MUL | `panels` |
| slug | varchar(50) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| is_custom_panel | tinyint(1) | Y | MUL |  |

### `page_scopes`  — ~0 rows
_Joins:_ `page_id`→`pages`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| page_id | int |  | MUL | `pages` |
| slug | varchar(50) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `pages`  — ~14 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `panels`  — ~88 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |
| options | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `parameter`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parameter_type | varchar(255) |  |  |  |
| parameter_name | varchar(255) |  |  |  |
| parameter_label | varchar(255) |  |  |  |
| parameter_settings | text | Y |  |  |
| options | text | Y |  |  |
| descrition | varchar(255) |  |  |  |

### `parameter_group`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parameter_type | varchar(255) |  |  |  |
| parameter_name | varchar(255) |  |  |  |

### `parameter_parameter_group`  — ~0 rows
_Joins:_ `parameter_id`→`parameter`, `parameter_group_id`→`parameter_group`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parameter_id | int |  |  | `parameter` |
| parameter_group_id | int |  |  | `parameter_group` |

### `payment_gateway`  — ~11 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`, `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| created_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| sent | tinyint(1) |  | MUL |  |
| sent_at | datetime |  |  |  |
| delivered | tinyint(1) |  | MUL |  |
| delivered_at | datetime |  |  |  |
| billing_first_name | varchar(255) |  |  |  |
| billing_surname | varchar(255) |  |  |  |
| billing_address_1 | varchar(255) |  |  |  |
| billing_address_2 | varchar(255) |  |  |  |
| billing_city | varchar(255) |  |  |  |
| billing_country | varchar(255) |  |  |  |
| billing_state | varchar(255) |  |  |  |
| billing_postcode | varchar(255) |  |  |  |
| billing_phone_number | varchar(255) |  |  |  |
| billing_email | varchar(255) |  |  |  |
| transaction_ref | varchar(255) |  |  |  |
| transaction_type | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| net_amount | decimal(27,9) |  |  |  |
| surcharge_amount | decimal(27,9) |  |  |  |
| is_card | tinyint(1) |  | MUL |  |
| card_no | varchar(255) |  |  |  |
| card_type | varchar(255) |  |  |  |
| card_auth_no | varchar(255) |  |  |  |
| gateway_configuration | varchar(255) |  |  |  |
| gateway_options | text | Y |  |  |
| gateway_name | varchar(255) |  |  |  |
| gateway_response | text | Y |  |  |
| gateway_id | varchar(255) |  |  |  |
| gateway_status | varchar(255) |  |  |  |
| gateway_status_details | text | Y |  |  |
| gateway_cost | decimal(27,9) |  |  |  |

### `payment_gateway_link`  — ~0 rows
_Joins:_ `payment_id`→`rdebt_payment`, `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| gateway_id | int |  | MUL |  |
| payment_id | int |  | MUL | `rdebt_payment` |
| created_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `payment_term_client_interest_rate_items`  — ~0 rows
_Joins:_ `payment_term_id`→`payment_terms`, `client_interest_rate_id`→`client_interest_rates`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| payment_term_id | int |  | MUL | `payment_terms` |
| client_interest_rate_id | int |  | MUL | `client_interest_rates` |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `payment_terms`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| client_id | int |  | MUL | `rdebt_clients` |
| default | tinyint(1) |  | MUL |  |
| position | int |  | MUL |  |
| active | tinyint(1) |  | MUL |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `phinxlog`  — ~858 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| version | bigint |  | MUL |  |
| start_time | timestamp |  |  |  |
| end_time | timestamp |  |  |  |

### `plugins`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| tag | varchar(255) |  |  |  |
| plugin | varchar(255) |  |  |  |
| plugin_order | int |  |  |  |
| type | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `rdebt_actions`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| slug | varchar(40) |  |  |  |
| function_name | varchar(255) | Y |  |  |
| param1 | varchar(255) | Y |  |  |
| param2 | varchar(255) | Y |  |  |
| param3 | varchar(255) | Y |  |  |
| param4 | varchar(255) | Y |  |  |
| param5 | varchar(255) | Y |  |  |
| description | varchar(255) | Y |  |  |
| updated_at | timestamp |  |  |  |
| freq | tinyint | Y | MUL |  |
| max_exec | int | Y | MUL |  |

### `rdebt_agent_skill_sets`  — ~0 rows
_Joins:_ `skill_set_id`→`skill_sets`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_type | varchar(255) |  |  |  |
| skill_set_id | varchar(255) |  |  | `skill_sets` |
| entity_id | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_by | int |  |  | `rdebt_users` |

### `rdebt_agent_visits`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| agent_id | int |  |  |  |
| submitted_on | date |  |  |  |
| visit_count_on_app | int |  |  |  |
| visit_count_submitted | int |  |  |  |
| audio_file_submitted | int |  |  |  |
| files_uploaded | int |  |  |  |
| total_files | int |  |  |  |

### `rdebt_area_timezone`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| zip_code | varchar(50) |  | MUL |  |
| zip_city | varchar(50) |  |  |  |
| zip_state | varchar(5) |  |  |  |
| zip_country | varchar(20) |  |  |  |
| zip_county | varchar(20) |  |  |  |
| zip_province | varchar(20) |  |  |  |
| zip_timezone | int |  |  |  |
| zip_timezone_text | varchar(50) |  | MUL |  |
| zip_dist | tinyint(1) |  |  |  |
| zip_utc | int |  |  |  |
| zip_postal_type | varchar(1) |  |  |  |
| zip_city_type | varchar(1) |  |  |  |

### `rdebt_assign_page_to_role`  — ~12 rows
_Joins:_ `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| ps_ug_id | int |  | MUL |  |
| ps_up_id | int |  | MUL |  |
| ps_type | varchar(255) |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |

### `rdebt_attendance`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_type | varchar(255) |  |  |  |
| entity_id | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| date | date |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_by | int |  |  | `rdebt_users` |
| date_to | date |  |  |  |

### `rdebt_audit_log`
_Joins:_ `caseid`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | varchar(36) |  |  |  |
| caseid | int | Y |  | `rdebt_cases` |
| action | mediumtext |  |  |  |
| time | datetime |  |  |  |
| data_from | mediumtext | Y |  |  |
| data_to | mediumtext | Y |  |  |
| user_id | int | Y |  | `rdebt_users` |
| name | varchar(255) | Y |  |  |
| from_history | bigint |  |  |  |

### `rdebt_bank`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_type | varchar(255) |  |  |  |
| entity_id | varchar(255) |  |  |  |
| bank_payee | varchar(255) |  |  |  |
| bank_name | varchar(255) |  |  |  |
| bank_branch | varchar(255) |  |  |  |
| bank_account_name | varchar(255) |  |  |  |
| bank_account_number | varchar(255) |  |  |  |
| bank_account_sort_code | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_by | int |  |  | `rdebt_users` |

### `rdebt_bg_tasks`  — ~118 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | bigint |  | PRI |  |
| description | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |
| started_at | datetime | Y |  |  |
| completed_at | datetime | Y |  |  |
| perform_now | tinyint(1) | Y | MUL |  |
| automatic | tinyint(1) | Y | MUL |  |
| status | tinyint(1) | Y | MUL |  |
| locked | tinyint(1) | Y | MUL |  |
| exec_count | tinyint | Y | MUL |  |
| function_name | text |  | MUL |  |
| param1 | text |  |  |  |
| param2 | text |  |  |  |
| param3 | text |  |  |  |
| param4 | text |  |  |  |
| param5 | text |  |  |  |
| user_id | int | Y | MUL | `rdebt_users` |
| error_string | varchar(255) | Y |  |  |
| error_code | varchar(10) | Y |  |  |
| notice_string | text | Y |  |  |
| notice_code | varchar(10) | Y |  |  |
| alert_cal_id | int | Y | MUL |  |

### `rdebt_blackout_dates`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| scope | varchar(255) | Y |  |  |
| timing | longtext | Y |  |  |

### `rdebt_colours`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(45) |  |  |  |
| hexadecimal | varchar(45) |  |  |  |

### `rdebt_commission`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `payment_id`→`rdebt_payment`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | varchar(255) |  |  | `rdebt_cases` |
| payment_id | int |  | MUL | `rdebt_payment` |
| user_id | int |  | MUL | `rdebt_users` |
| commission_amount | decimal(10,2) |  |  |  |
| create_date | datetime |  |  |  |
| status | int |  | MUL |  |

### `rdebt_config`  — ~1 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| company_name | varchar(255) |  |  |  |
| address1 | varchar(255) |  |  |  |
| address2 | varchar(255) |  |  |  |
| address3 | varchar(255) |  |  |  |
| town | varchar(255) |  |  |  |
| county | varchar(255) |  |  |  |
| postcode | varchar(255) |  |  |  |
| phone | varchar(255) |  |  |  |
| email | varchar(255) |  |  |  |
| fax | varchar(255) |  |  |  |
| web | varchar(255) |  |  |  |
| taxid | varchar(255) |  |  |  |
| work_week | varchar(255) |  |  |  |
| headerbg | varchar(255) |  |  |  |
| textcolor | varchar(255) |  |  |  |
| headerlogo | varchar(255) |  |  |  |
| barcolor | varchar(255) |  |  |  |
| subdomain | varchar(255) |  |  |  |
| theme | varchar(255) |  |  |  |
| numHeldBeforeAlert | int |  |  |  |
| currency | varchar(255) |  |  |  |
| configDaysOpen | int |  |  |  |
| bailiff_comm_perc | decimal(5,2) |  |  |  |
| introducer_comm_perc | decimal(5,2) |  |  |  |
| salesman_comm_perc | decimal(5,2) |  |  |  |
| vat | decimal(6,2) |  |  |  |
| interest | decimal(6,2) |  |  |  |
| num_days_show_broken_arr | tinyint |  |  |  |
| num_days_first_arranged_payment_pre_buffer | tinyint |  |  |  |
| sm_group_vs_user | tinyint |  |  |  |
| domain | varchar(255) |  |  |  |
| cd_debtor_footer | text |  |  |  |
| cd_debtor_header | text |  |  |  |
| cd_client_header | text |  |  |  |
| cd_client_footer | text |  |  |  |
| cd_ref_prefix | varchar(255) |  |  |  |
| default_client_notes | int |  |  |  |
| default_enforcer_notes | int |  |  |  |
| default_email_header | varchar(5000) | Y |  |  |
| default_email_footer | varchar(5000) | Y |  |  |
| default_email_greeting | varchar(255) | Y |  |  |
| default_email_signature | varchar(255) | Y |  |  |
| cd_company | varchar(255) | Y |  |  |
| cd_company_ltd | varchar(255) | Y |  |  |
| cd_address1 | varchar(255) | Y |  |  |
| cd_address2 | varchar(255) | Y |  |  |
| cd_address3 | varchar(255) | Y |  |  |
| cd_postcode | varchar(255) | Y |  |  |
| cd_company_tel | varchar(255) | Y |  |  |
| cd_email | varchar(255) | Y |  |  |
| cd_company_fax | varchar(255) | Y |  |  |
| cd_bank | varchar(255) | Y |  |  |
| cd_bank_name | varchar(255) | Y |  |  |
| cd_bank_sort | varchar(255) | Y |  |  |
| cd_bank_branch | varchar(255) | Y |  |  |
| cd_bank_no | varchar(255) | Y |  |  |
| default_split_perc | decimal(4,2) | Y |  |  |
| margin_left_0 | int |  |  |  |
| margin_right_1 | int |  |  |  |
| margin_top_2 | int |  |  |  |
| margin_bottom_3 | int |  |  |  |
| header_size_4 | int |  |  |  |
| footer_size_5 | int |  |  |  |
| cd_login_message | varchar(255) |  |  |  |
| ct_fee_names | tinyint(1) |  |  |  |
| powersearch_guess | tinyint(1) |  |  |  |
| search_allocated | tinyint(1) |  |  |  |
| payment_sources | tinyint(1) |  |  |  |
| display_history_icons | tinyint(1) |  |  |  |
| batch_search | tinyint(1) |  |  |  |
| auto_select_type_1 | tinyint(1) |  |  |  |
| history_item_case | varchar(20) |  |  |  |
| history_item_finance | varchar(20) |  |  |  |
| history_item_document | varchar(20) |  |  |  |
| client_claimant_quicksearch | tinyint(1) |  |  |  |
| default_cursor_location | tinyint(1) |  |  |  |
| client_balance_0 | tinyint(1) |  |  |  |
| hide_debtor_casepage | tinyint(1) |  |  |  |
| send_sms | tinyint(1) |  |  |  |
| batch_assign_cases | tinyint(1) |  |  |  |
| calc_payout | tinyint(1) |  |  |  |
| calc_levy_fee | tinyint(1) |  |  |  |
| remittance_list | tinyint(1) |  |  |  |
| select_stage_by_slug | tinyint(1) |  |  |  |
| ignore_letter_cat | tinyint(1) |  |  |  |
| fees_first_for_bailiff | tinyint(1) |  |  |  |
| remittance_payments | tinyint(1) |  |  |  |
| other_payments_table | tinyint(1) |  |  |  |
| use_case_management | tinyint(1) |  |  |  |
| visit_report_notification_email | varchar(255) | Y |  |  |
| default_ahceo | varchar(255) | Y |  |  |
| default_timezone | varchar(255) |  |  |  |
| system_date_format | varchar(255) |  |  |  |
| system_time_format | varchar(255) |  |  |  |
| datepicker_date_format | varchar(255) |  |  |  |
| datepicker_time_format | varchar(255) |  |  |  |
| is_timezone_included | varchar(255) |  |  |  |
| app_company_code | varchar(50) | Y |  |  |
| use_pdf_viewer | tinyint(1) |  |  |  |
| batch_receipts__load_status | varchar(255) |  |  |  |
| batch_receipts__default_status | int | Y |  |  |
| batch_receipts__default_source | int | Y |  |  |
| batch_receipts__default_method | int | Y |  |  |
| batch_receipts__default_date_diff | varchar(45) |  |  |  |
| editable_scheme | tinyint(1) | Y |  |  |
| bank_rec__payment_type | varchar(255) |  |  |  |
| bank_rec__payment_action | varchar(255) |  |  |  |
| imported_from_onestep | int | Y |  |  |
| use_client_management | int | Y |  |  |
| officer_commission_rate | decimal(27,9) | Y |  |  |
| officer_max_commission | decimal(27,9) | Y |  |  |
| officer_min_commission | decimal(27,9) | Y |  |  |
| maximum_commission | decimal(27,9) | Y |  |  |
| repay_convenience_fee | tinyint(1) | Y |  |  |
| commission_type_percentage | tinyint(1) | Y |  |  |
| maximum_months_commission | int | Y |  |  |
| case_linking | varchar(255) | Y |  |  |
| letter_css | text | Y |  |  |
| font_family | varchar(50) | Y |  |  |
| font_size | varchar(10) | Y |  |  |
| officer_override | varchar(50) | Y |  |  |
| email_settings | varchar(255) | Y |  |  |
| margin_header_6 | int | Y |  |  |
| margin_footer_7 | int | Y |  |  |
| display_scheme_manager | tinyint(1) | Y |  |  |
| redirect_single_case_result_to_case_view | tinyint(1) | Y |  |  |
| use_case_operator | int | Y |  |  |
| use_electronic_delivery_via | varchar(50) | Y |  |  |
| new_system_case_colour | varchar(7) | Y |  |  |
| case_grouping | tinyint(1) | Y |  |  |
| display_case_ref_as | tinyint unsigned | Y |  |  |
| send_sms_as | varchar(50) | Y |  |  |
| dpa_timeout | int | Y |  |  |
| realex_development_merchant_id | varchar(255) |  |  |  |
| realex_development_account | varchar(255) |  |  |  |
| realex_development_secret | varchar(255) |  |  |  |
| realex_production_merchant_id | varchar(255) |  |  |  |
| realex_production_account | varchar(255) |  |  |  |
| realex_production_secret | varchar(255) |  |  |  |
| sms_delivery_via | varchar(255) | Y |  |  |
| ssl_enforced | varchar(255) |  |  |  |
| app_sos_emails | varchar(255) |  |  |  |
| app_sos_mobile_numbers | varchar(255) |  |  |  |
| app_sos_play_sound | tinyint(1) |  |  |  |
| days | int | Y |  |  |
| offset_calculation_mode | varchar(255) | Y |  |  |
| manual_from_email | varchar(255) |  |  |  |
| arrangement_reminder_slug | varchar(255) |  |  |  |
| debtor_name_split | tinyint(1) | Y |  |  |
| multi_email_gateway | varchar(255) |  |  |  |
| sagepay_merchant_number | varchar(255) |  |  |  |
| visit_alert_slug | varchar(255) | Y |  |  |
| case_create_page_title | varchar(255) | Y |  |  |
| cloudmailin_config | varchar(255) | Y |  |  |
| skyfox_digital_config | varchar(255) | Y |  |  |
| remittance_start_date_end | tinyint(1) |  |  |  |
| http_strategy | varchar(255) | Y |  |  |
| show_only_sso_login | tinyint(1) | Y |  |  |
| merge_document_max_pages_to_merge | varchar(255) |  |  |  |
| merge_document_include_index | tinyint(1) |  |  |  |
| merge_document_page_count_to_include_index | tinyint(1) |  |  |  |
| allow_scheme_category_interchange | tinyint(1) |  |  |  |
| arrangement_settlement_transaction | tinyint(1) |  |  |  |
| email_validated | tinyint(1) |  |  |  |
| mobipaid_config | text | Y |  |  |
| app_config | text | Y |  |  |
| client_industry_type | varchar(255) |  |  |  |
| min_case_for_bulk_action | int |  |  |  |
| pagination_limit | int |  |  |  |
| suspense_case_id | int |  |  |  |
| arrangement_scheme | int | Y |  |  |
| arrangement_status | int | Y |  |  |
| max_limit_alert_cron | int | Y |  |  |
| max_limit_remittance_cron | int | Y |  |  |
| letter_cron_timing | varchar(255) | Y |  |  |
| mobipaid_currency_type | varchar(255) | Y |  |  |
| breathing_space_config | text | Y |  |  |
| multi_currency | tinyint(1) |  |  |  |
| multi_timezone | tinyint(1) |  |  |  |
| allow_read_only | tinyint(1) |  |  |  |
| ea_app_arrangement_status | int | Y |  |  |
| use_encryption_standard | varchar(255) | Y |  |  |
| xero_credentials | text | Y |  |  |
| broken_arrangement_scheme | int | Y |  |  |
| broken_arrangement_stage | int | Y |  |  |
| broken_arrangement_status | int | Y |  |  |
| note_config | varchar(255) |  |  |  |
| arrangement_stage | int | Y |  |  |
| auto_archive_arrangement | tinyint(1) |  |  |  |
| auto_from_email | varchar(255) |  |  |  |
| unsubscribe_email_link | tinyint(1) |  |  |  |
| queue_email | tinyint(1) |  |  |  |
| bulk_email | tinyint(1) |  |  |  |
| bulk_email_count | int |  |  |  |
| cron_host | varchar(255) | Y |  |  |
| split_optimize_import | text |  |  |  |
| show_linked_debtors | tinyint(1) |  |  |  |
| login_bg_color | varchar(255) | Y |  |  |
| login_modal_color | varchar(255) | Y |  |  |
| login_message_color | varchar(255) | Y |  |  |

### `rdebt_contact_methods`  — ~3 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| slug | varchar(50) | Y |  |  |

### `rdebt_country`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| country_id | tinyint |  | PRI |  |
| country_name | varchar(100) |  |  |  |
| currency | varchar(15) |  |  |  |

### `rdebt_currencies`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| short_code | varchar(255) | Y |  |  |
| create_date | timestamp |  |  |  |

### `rdebt_custom_fields`  — ~897 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_id | int |  | MUL |  |
| data_type | varchar(255) |  | MUL |  |
| field_name | varchar(255) |  | MUL |  |
| field_value | text | Y |  |  |
| is_field_value_json | tinyint(1) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  |  | `rdebt_users` |
| scope | enum('case_data','client_data','debtor_data','invoice_financials','payment_financials','case_participant_data','participant_data','relationship_data','address_data','user_data') | Y | MUL |  |

### `rdebt_custom_panel`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| slug | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| layout | varchar(255) | Y |  |  |
| fields | text | Y |  |  |
| components | text | Y |  |  |
| query_options | text |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| query_rel_id | text |  |  |  |

### `rdebt_custom_report_fields`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| field_name | varchar(255) | Y |  |  |
| custom_report_id | int |  | MUL |  |
| scheme_definition_id | int |  | MUL |  |
| position | smallint | Y | MUL |  |

### `rdebt_custom_select`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| field_value | varchar(255) |  |  |  |
| group_code | varchar(255) |  |  |  |
| group_name | varchar(255) |  |  |  |
| ordering | tinyint |  | MUL |  |

### `rdebt_doc_delivery_service`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| doc_id | int |  | MUL |  |
| user_id | int |  | MUL | `rdebt_users` |
| address_fullname | varchar(255) |  |  |  |
| address_line1 | varchar(255) |  |  |  |
| address_line2 | varchar(255) |  |  |  |
| address_line3 | varchar(255) |  |  |  |
| address_line4 | varchar(255) |  |  |  |
| address_line5 | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| send_after | datetime |  |  |  |
| attempted | tinyint(1) |  | MUL |  |
| attempted_at | datetime | Y |  |  |
| sent | tinyint(1) |  | MUL |  |
| sent_at | datetime | Y |  |  |
| gateway_configuration | varchar(255) |  |  |  |
| gateway_options | text | Y |  |  |
| gateway_name | varchar(255) |  |  |  |
| gateway_response | text | Y |  |  |
| gateway_id | varchar(255) | Y |  |  |
| gateway_cost | decimal(27,9) |  |  |  |
| status | varchar(255) | Y |  |  |
| is_reported | tinyint(1) |  | MUL |  |

### `rdebt_dvla`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `rdebt_requested_checks_id`→`rdebt_requested_checks`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | varchar(255) | Y | MUL | `rdebt_cases` |
| vehicle_reg | varchar(255) | Y |  |  |
| enquiry_ref | varchar(255) | Y |  |  |
| dvla_owner_name | varchar(255) | Y |  |  |
| dvla_address_1 | varchar(255) | Y |  |  |
| dvla_address_2 | varchar(255) | Y |  |  |
| dvla_address_3 | varchar(255) | Y |  |  |
| dvla_postcode | varchar(255) | Y |  |  |
| make | varchar(255) | Y |  |  |
| model | varchar(255) | Y |  |  |
| type | varchar(255) | Y |  |  |
| colour | varchar(255) | Y |  |  |
| previous_colour | varchar(255) | Y |  |  |
| year_manufactured | int | Y | MUL |  |
| number_previous_owners | int | Y | MUL |  |
| start_date_of_current_owner | varchar(255) | Y |  |  |
| confirmed_owner | tinyint(1) | Y | MUL |  |
| timestamp_created_at | datetime | Y |  |  |
| timestamp_expiry_at | datetime | Y |  |  |
| chassis_number | varchar(255) | Y |  |  |
| completed_dvla_check | tinyint(1) |  | MUL |  |
| is_positive | tinyint(1) | Y | MUL |  |
| timestamp_updated_at | datetime |  |  |  |
| supplier_enquiry_ref | varchar(255) |  |  |  |
| result_date | date |  |  |  |
| enquiry_date | date |  |  |  |
| notes | text |  |  |  |
| created_at | date |  |  |  |
| deleted_at | date |  |  |  |
| is_partial_match | tinyint(1) |  | MUL |  |
| class | varchar(255) | Y |  |  |
| error_code | varchar(255) | Y |  |  |
| error_description | varchar(255) | Y |  |  |
| hardcopyindicator | varchar(255) | Y |  |  |
| rdebt_requested_checks_id | int | Y | MUL | `rdebt_requested_checks` |

### `rdebt_entity_skill_sets`  — ~0 rows
_Joins:_ `skill_set_id`→`skill_sets`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| entity_type | varchar(255) |  |  |  |
| skill_set_id | varchar(255) |  |  | `skill_sets` |
| entity_id | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_by | int |  |  | `rdebt_users` |

### `rdebt_favourites`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| fav_id | int |  | PRI |  |
| fav_user_id | int |  | MUL |  |
| fav_name | varchar(255) |  |  |  |
| fav_link | text |  |  |  |

### `rdebt_frequency_periods`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| period | varchar(255) | Y |  |  |
| period_condition | varchar(255) | Y |  |  |
| created_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |

### `rdebt_hearing`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| debtor_id | int |  | MUL | `rdebt_debtor` |
| hearing_date | date |  |  |  |
| note | varchar(255) | Y |  |  |

### `rdebt_history`  — ~747,962 rows
_Joins:_ `user_id`→`rdebt_users`, `caseid`→`rdebt_cases`, `stageid`→`rdebt_stages`, `document_id`→`rdebt_documents`, `action_id`→`rdebt_actions`, `result_id`→`rdebt_results`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | text |  | MUL | `rdebt_users` |
| time | datetime |  |  |  |
| caseid | int | Y | MUL | `rdebt_cases` |
| action | text |  | MUL |  |
| client | tinyint |  | MUL |  |
| type | text | Y | MUL |  |
| bailiff | tinyint | Y | MUL |  |
| report | int | Y | MUL |  |
| note | text |  |  |  |
| stageid | int |  | MUL | `rdebt_stages` |
| attachment | varchar(255) |  |  |  |
| document_id | int |  | MUL | `rdebt_documents` |
| action_id | int |  | MUL | `rdebt_actions` |
| result_id | int |  |  | `rdebt_results` |
| param_1 | varchar(40) |  |  |  |
| param_2 | varchar(40) |  |  |  |
| groups | varchar(50) |  |  |  |
| active | tinyint(1) |  | MUL |  |

### `rdebt_history_final`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`, `result_id`→`rdebt_results`, `event_id`→`rdebt_events`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | mediumint |  | MUL | `rdebt_users` |
| time | datetime |  |  |  |
| result_id | smallint | Y | MUL | `rdebt_results` |
| event_id | int | Y | MUL | `rdebt_events` |
| item_id | int | Y | MUL |  |
| description | varchar(75) |  |  |  |
| o_perm | varchar(35) |  |  |  |
| connected_to | int | Y | MUL |  |

### `rdebt_languages`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| short_code | varchar(255) | Y |  |  |
| create_date | timestamp |  |  |  |

### `rdebt_license_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| license_id | smallint |  | PRI |  |
| license_name | varchar(255) |  |  |  |
| license_cost | decimal(7,2) |  |  |  |
| current_bought | smallint |  | MUL |  |
| email_when_add | tinyint |  | MUL |  |

### `rdebt_message_attachments`  — ~0 rows
_Joins:_ `message_id`→`rdebt_messages`, `document_id`→`rdebt_documents`, `static_upload_id`→`rdebt_static_uploads`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| message_id | int |  | MUL | `rdebt_messages` |
| document_id | int |  | MUL | `rdebt_documents` |
| static_upload_id | int |  | MUL | `rdebt_static_uploads` |

### `rdebt_message_label`  — ~0 rows
_Joins:_ `message_id`→`rdebt_messages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| message_id | int |  | MUL | `rdebt_messages` |
| label_id | int |  |  |  |
| created_at | datetime |  |  |  |

### `rdebt_message_recipients`  — ~56 rows
_Joins:_ `message_id`→`rdebt_messages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| message_id | int |  | MUL | `rdebt_messages` |
| to_id | int | Y | MUL |  |
| to_name | varchar(255) |  |  |  |
| to_type | varchar(10) | Y | MUL |  |
| to_email | varchar(255) | Y |  |  |
| to_status | int |  | MUL |  |
| to_delivered | tinyint(1) | Y | MUL |  |
| recipient_type | int |  | MUL |  |
| created_at | datetime | Y |  |  |
| updated_at | timestamp |  |  |  |

### `rdebt_message_status`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| slug | varchar(50) | Y |  |  |
| label | varchar(50) | Y |  |  |

### `rdebt_messages`  — ~29 rows
_Joins:_ `case_id`→`rdebt_cases`, `batch_id`→`batch`, `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| partition_id | int |  | PRI |  |
| from_id | int | Y | MUL |  |
| from_name | varchar(255) | Y |  |  |
| from_type | varchar(10) | Y | MUL |  |
| from_email | varchar(255) | Y |  |  |
| from_status | int |  | MUL |  |
| reply_to | int |  | MUL |  |
| thread_id | varchar(266) | Y | MUL |  |
| subject | tinytext | Y |  |  |
| body | text | Y |  |  |
| from_delivered | tinyint(1) | Y | MUL |  |
| case_id | int |  | MUL | `rdebt_cases` |
| batch_id | int |  | MUL | `batch` |
| audit_type | varchar(200) | Y |  |  |
| client_id | int | Y | MUL | `rdebt_clients` |
| client_portfolio_id | int | Y |  |  |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| created_at | datetime |  | PRI |  |
| updated_at | timestamp |  |  |  |
| data_id | int |  | MUL |  |
| gateway | varchar(50) | Y |  |  |
| external_message_id | varchar(100) | Y | MUL |  |
| is_delivered | tinyint(1) |  | MUL |  |
| is_opened | tinyint(1) |  | MUL |  |
| is_clicked | tinyint(1) |  | MUL |  |
| is_bounced | tinyint(1) |  | MUL |  |
| delivered_at | datetime | Y |  |  |
| openned_at | datetime | Y |  |  |
| clicked_at | datetime | Y |  |  |
| bounced_at | datetime | Y |  |  |
| is_processed | tinyint(1) |  | MUL |  |
| is_deferred | tinyint(1) |  | MUL |  |
| is_dropped | tinyint(1) |  | MUL |  |
| is_spamreport | tinyint(1) |  | MUL |  |
| is_unsubscribe | tinyint(1) |  | MUL |  |
| is_group_unsubscribe | tinyint(1) |  | MUL |  |
| is_group_resubscribe | tinyint(1) |  | MUL |  |
| processed_at | datetime | Y |  |  |
| deferred_at | datetime | Y |  |  |
| dropped_at | datetime | Y |  |  |
| spamreport_at | datetime | Y |  |  |
| unsubscribe_at | datetime | Y |  |  |
| group_unsubscribe_at | datetime | Y |  |  |
| group_resubscribe_at | datetime | Y |  |  |
| status | varchar(50) | Y | MUL |  |
| send_after | datetime |  |  |  |

### `rdebt_nav`  — ~54 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| name | varchar(255) |  |  |  |
| link | varchar(255) |  |  |  |
| priority | int |  | MUL |  |
| isVisible | tinyint(1) |  | MUL |  |
| sectionID | int unsigned |  | MUL |  |
| li_class | varchar(255) |  |  |  |
| ian_notes | varchar(255) |  |  |  |
| li_special_id | varchar(255) |  |  |  |
| priviledge | varchar(255) |  |  |  |
| a_class | varchar(255) |  |  |  |
| variable_name | varchar(255) | Y |  |  |
| only_for_client_id | int |  | MUL |  |
| only_for_user_id | int |  | MUL |  |
| hide_from_clients | varchar(100) |  |  |  |

### `rdebt_notes`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| note_id | int |  | PRI |  |
| string1 | text |  |  |  |
| string2 | text |  |  |  |
| string3 | varchar(255) |  |  |  |
| string4 | varchar(255) |  |  |  |
| number1 | decimal(9,2) |  |  |  |
| number2 | decimal(9,2) |  |  |  |
| number3 | decimal(9,2) |  |  |  |
| added_time | timestamp |  |  |  |
| time1 | datetime |  |  |  |
| time2 | datetime |  |  |  |
| time3 | datetime |  |  |  |
| item_id | int | Y | MUL |  |
| item_type | varchar(75) |  |  |  |
| string5 | varchar(255) | Y |  |  |
| time4 | datetime | Y |  |  |

### `rdebt_operator_agent_type`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |

### `rdebt_overview_settings`  — ~4 rows
_Joins:_ `user_group_id`→`rdebt_user_group`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| scheme_category_id | int |  | MUL |  |
| user_group_id | int |  | MUL | `rdebt_user_group` |
| panels | text |  |  |  |
| category | tinyint(1) |  |  |  |

### `rdebt_page_nav_link`  — ~0 rows
_Joins:_ `page_id`→`pages`, `nav_id`→`rdebt_nav`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| page_nav_id | int |  | PRI |  |
| page_id | int |  | MUL | `pages` |
| nav_id | int |  | MUL | `rdebt_nav` |
| name_override | varchar(255) |  |  |  |
| link_override | varchar(255) |  |  |  |
| ordering | int |  | MUL |  |
| permissions_override | varchar(255) |  |  |  |

### `rdebt_paragraph_category_link`  — ~0 rows
_Joins:_ `paragraphid`→`rdebt_paragraphs`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| categoryid | int |  | MUL |  |
| paragraphid | int |  | MUL | `rdebt_paragraphs` |

### `rdebt_paragraph_letter_link`  — ~0 rows
_Joins:_ `letterid`→`rdebt_letter`, `paragraphid`→`rdebt_paragraphs`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| letterid | int |  | MUL | `rdebt_letter` |
| paragraphid | int |  | MUL | `rdebt_paragraphs` |

### `rdebt_paragraph_scheme_link`  — ~0 rows
_Joins:_ `schemeid`→`rdebt_schemes`, `paragraphid`→`rdebt_paragraphs`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| schemeid | int |  | MUL | `rdebt_schemes` |
| paragraphid | int |  | MUL | `rdebt_paragraphs` |
| ordering | int |  | MUL |  |

### `rdebt_paragraphs`  — ~0 rows
_Joins:_ `stage_id`→`rdebt_stages`, `letter_id`→`rdebt_letter`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text | Y |  |  |
| paragraph | text | Y |  |  |
| paragraph_order | int |  | MUL |  |
| all_categories | tinyint |  | MUL |  |
| all_schemes | tinyint |  | MUL |  |
| stage_id | int |  | MUL | `rdebt_stages` |
| letter_id | int |  | MUL | `rdebt_letter` |
| add_tick_box | tinyint |  | MUL |  |

### `rdebt_postcode_groups`  — ~0 rows
_Joins:_ `court_id`→`rdebt_courts`, `branch_id`→`rdebt_branches`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text |  |  |  |
| enforce_user_id | int | Y | MUL |  |
| court_id | int | Y | MUL | `rdebt_courts` |
| branch_id | int | Y | MUL | `rdebt_branches` |

### `rdebt_postcode_links`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| prefix_id | int |  | MUL |  |
| group_id | int |  | MUL |  |

### `rdebt_postcode_prefixes`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | text |  |  |  |

### `rdebt_report_builder`  — ~6 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(200) |  |  |  |
| fields | longtext |  |  |  |
| report_for | int |  | MUL |  |
| export_file_type | varchar(255) |  |  |  |
| is_for_client | int |  | MUL |  |
| query_rel_id | varchar(20) |  |  |  |
| is_for_remittance | int |  | MUL |  |
| is_available_for_all_client | int |  | MUL |  |
| xml_sample | text |  |  |  |
| file_format_name | text |  |  |  |
| slug | varchar(255) |  |  |  |
| is_system_alert | int |  | MUL |  |
| export_file_extension | varchar(255) |  |  |  |
| export_file_seperator | varchar(255) |  |  |  |
| aggregate | text |  |  |  |
| email_settings | text | Y |  |  |
| quote_strings | tinyint(1) |  |  |  |

### `rdebt_report_clients`  — ~0 rows
_Joins:_ `report_id`→`rdebt_reports`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| report_id | int |  | MUL | `rdebt_reports` |
| client_id | int |  | MUL | `rdebt_clients` |

### `rdebt_report_search_link`  — ~8 rows
_Joins:_ `report_id`→`rdebt_reports`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| report_id | int | Y | MUL | `rdebt_reports` |
| search_id | int | Y | MUL |  |
| permissions_override | varchar(255) | Y |  |  |
| updated_at | timestamp |  |  |  |

### `rdebt_reports`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| user_creator_id | int | Y | MUL |  |
| user_target_id | int | Y | MUL |  |
| label | varchar(255) | Y |  |  |
| permissions | varchar(255) | Y |  |  |
| private | tinyint(1) | Y | MUL |  |

### `rdebt_requested_checks`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| data_id | int |  | MUL |  |
| type | varchar(255) |  |  |  |
| status | int |  | MUL |  |
| requested_date | date |  |  |  |
| received_date | date |  |  |  |
| cancelled_date | date |  |  |  |
| requested_by | int |  | MUL |  |
| cancelled_by | int |  | MUL |  |
| dvla_data | text |  |  |  |
| transaction_id | varchar(255) | Y |  |  |
| data | text | Y |  |  |
| resent_request | int |  |  |  |

### `rdebt_result_view`  — ~7 rows
_Joins:_ `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| result_name | varchar(255) |  |  |  |
| fields | text |  |  |  |
| filters | text | Y |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| scheme_category_id | int | Y | MUL |  |
| is_payment_viewer_filter | tinyint(1) |  |  |  |

### `rdebt_result_view_groups`  — ~80 rows
_Joins:_ `result_id`→`rdebt_results`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| result_id | int |  | MUL | `rdebt_results` |
| group_id | int |  | MUL |  |
| is_default | tinyint(1) |  | MUL |  |
| scheme_category_id | int | Y | MUL |  |

### `rdebt_results`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| result_id | int |  | PRI |  |
| result_code | varchar(10) |  |  |  |
| result_name | varchar(155) |  |  |  |
| ordering | int |  | MUL |  |
| effectiveness_mult | float(5,2) |  |  |  |

### `rdebt_returncodes`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| code | varchar(50) |  | MUL |  |
| code_2 | varchar(50) | Y |  |  |
| code_3 | varchar(50) | Y |  |  |
| code_4 | varchar(50) | Y |  |  |
| return_name | varchar(255) | Y |  |  |
| return_description | text |  |  |  |
| slug | varchar(15) |  |  |  |
| valid_for | int |  | MUL |  |
| is_link_to_return_doc | int |  | MUL |  |
| is_return_shown_in_agent_app | int |  | MUL |  |
| is_return_shown_in_client_portal | int |  | MUL |  |
| is_return_shown_in_main_system | int |  | MUL |  |
| basis | varchar(255) |  |  |  |
| category | varchar(255) |  |  |  |
| case_outcome | int |  | MUL |  |
| sort_order | int |  | MUL |  |

### `rdebt_scheduled_jobs`  — ~5 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| frequency | float |  | MUL |  |
| ref_id | int |  | MUL |  |
| created_at | datetime |  |  |  |
| next_execution_date | datetime |  |  |  |
| active | tinyint(1) |  | MUL |  |
| function_name | varchar(50) |  |  |  |
| params | text |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| is_executing | tinyint(1) |  | MUL |  |
| name | varchar(255) |  |  |  |
| is_deleted | int | Y |  |  |

### `rdebt_scripts_form_data`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| form_id | int |  | MUL |  |
| case_id | int |  | MUL | `rdebt_cases` |
| user_id | int |  | MUL | `rdebt_users` |
| form_data | text |  |  |  |
| create_date | datetime |  |  |  |
| status | int |  | MUL |  |

### `rdebt_search_filter_settings`  — ~0 rows
_Joins:_ `branch_id`→`rdebt_branches`, `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| scheme_category_id | int |  | MUL |  |
| name | text |  |  |  |
| fields | text |  |  |  |
| branch_id | int |  | MUL | `rdebt_branches` |
| created_by | int |  | MUL | `rdebt_users` |

### `rdebt_search_visible_to`  — ~32 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| visible_to | int |  | MUL |  |
| rel_id | int |  | MUL |  |
| record_for | int | Y | MUL |  |
| search_id | int |  | MUL |  |

### `rdebt_sessions`  — ~0 rows
_Joins:_ `UserID`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| UserID | int unsigned |  | PRI | `rdebt_users` |
| browser | varchar(255) | Y |  |  |
| ip | varchar(50) | Y |  |  |
| arrived | datetime | Y |  |  |
| active | datetime | Y | MUL |  |
| loginID | int unsigned | Y | MUL |  |
| referrer_id | varchar(255) |  |  |  |
| affiliate_id | varchar(255) |  |  |  |

### `rdebt_sidebar_configuration`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| rug_id | int |  | MUL |  |
| search_data | text |  |  |  |
| refine_data | text |  |  |  |
| panel_position | text |  |  |  |

### `rdebt_sm_group_link`  — ~4 rows
_Joins:_ `sm_id`→`sms`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | mediumint |  | PRI |  |
| group_id | smallint |  | MUL |  |
| sm_id | smallint |  | MUL | `sms` |

### `rdebt_sm_role_link`  — ~0 rows
_Joins:_ `role_id`→`roles`, `sm_id`→`sms`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| role_id | int |  | MUL | `roles` |
| sm_id | int |  | MUL | `sms` |

### `rdebt_static_uploads`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| variable_name | varchar(255) | Y |  |  |
| file_name | varchar(255) |  |  |  |
| file_path | varchar(255) |  |  |  |
| file_type | varchar(255) |  |  |  |
| file_size | int |  | MUL |  |
| file_usage | varchar(255) |  | MUL |  |
| actual_h_size | int | Y | MUL |  |
| actual_v_size | int | Y | MUL |  |
| required_h_size | int | Y | MUL |  |
| required_v_size | int | Y | MUL |  |
| client_id | int | Y | MUL | `rdebt_clients` |
| slug | varchar(255) | Y |  |  |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| remote_url | varchar(255) |  |  |  |
| vertical_align | varchar(255) | Y |  |  |

### `rdebt_stats_agents`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| agent | varchar(255) |  |  |  |
| type | tinyint unsigned |  | MUL |  |
| hits | int unsigned |  | MUL |  |

### `rdebt_system_help_links`  — ~0 rows
_Joins:_ `system_link_id`→`system_links`, `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| system_link_id | int |  | MUL | `system_links` |
| label | varchar(255) |  |  |  |
| link | varchar(255) |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| create_at | timestamp |  |  |  |

### `rdebt_system_messages`  — ~2 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | mediumint |  | PRI |  |
| link | varchar(255) |  |  |  |
| message | varchar(100) |  |  |  |
| highlight_class | varchar(100) |  |  |  |
| variable | varchar(100) |  |  |  |
| priority | smallint |  | MUL |  |
| param_1 | varchar(100) | Y |  |  |
| show_live | tinyint(1) | Y | MUL |  |
| default_param_value | int | Y | MUL |  |
| type_id | tinyint |  | MUL |  |
| slug | varchar(12) |  |  |  |

### `rdebt_temp_payout_splits`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| to_debt | decimal(10,5) | Y |  |  |
| to_fees | decimal(10,5) | Y |  |  |
| to_vat | decimal(10,5) | Y |  |  |
| to_cf | decimal(10,5) | Y |  |  |
| to_ncf | decimal(10,5) | Y |  |  |
| to_officer | decimal(10,5) | Y |  |  |
| to_officer_id | int | Y | MUL |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| payout_id | int | Y | MUL |  |

### `rdebt_time_tracker`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| alert_cal_id | int | Y | MUL |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| client_id | int |  | MUL | `rdebt_clients` |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| user_id | int |  | MUL | `rdebt_users` |
| start_time | datetime |  |  |  |
| stop_time | datetime | Y |  |  |
| worked_time | int |  | MUL |  |
| type | varchar(50) |  |  |  |
| timer_stop_action | varchar(255) |  |  |  |
| alert_type | int |  | MUL |  |
| unit | varchar(255) |  |  |  |
| custom_code | varchar(255) | Y |  |  |

### `rdebt_time_tracker_log`  — ~0 rows
_Joins:_ `timer_id`→`timers`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| timer_id | int |  | MUL | `timers` |
| old_time | varchar(50) |  |  |  |
| new_time | varchar(50) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |

### `rdebt_timezone_compliance_rules`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| timezone | text | Y |  |  |
| timing | longtext | Y |  |  |

### `rdebt_timezones`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| timezone | varchar(225) | Y |  |  |
| safe_hours_start | time | Y |  |  |
| safe_hours_end | time | Y |  |  |
| contact_hours_start | time | Y |  |  |
| contact_hours_end | time | Y |  |  |
| created_at | datetime | Y |  |  |
| created_by | int | Y |  | `rdebt_users` |

### `rdebt_top_nav`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| name | varchar(255) |  |  |  |
| link | varchar(255) |  |  |  |
| priority | int |  | MUL |  |
| isVisible | tinyint(1) |  | MUL |  |
| sectionID | int unsigned |  | MUL |  |
| class | varchar(255) |  |  |  |
| ian_notes | varchar(255) |  |  |  |
| special_id | varchar(255) |  |  |  |
| priviledge | varchar(255) |  |  |  |

### `rdebt_trust_accounting`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int | Y | MUL | `rdebt_cases` |
| financial_transaction_id | int | Y | MUL | `financial_transaction` |
| debt_cost | float(10,4) | Y |  |  |
| fees | float(10,4) | Y |  |  |
| overpayment | float | Y |  |  |
| commission | float | Y |  |  |
| commission_user_id | int | Y | MUL |  |
| is_reported | tinyint | Y | MUL |  |
| reported_date | datetime | Y |  |  |
| created_at | datetime |  |  |  |
| balance_after_payment | float(11,2) |  |  |  |
| trust_province | varchar(255) |  | MUL |  |
| trust_id | varchar(255) |  |  |  |
| transaction_type | varchar(255) |  | MUL |  |
| transaction_amount | float(11,2) |  |  |  |

### `rdebt_variable_definitions`  — ~0 rows
_Joins:_ `variable_id`→`rdebt_variables`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| variable_id | int |  | MUL | `rdebt_variables` |
| query | tinytext | Y |  |  |
| link | tinytext | Y |  |  |
| php_code_eval | tinytext | Y |  |  |
| custom_php_code_eval | tinytext | Y |  |  |
| use_query | tinyint(1) | Y | MUL |  |
| use_link | tinyint(1) | Y | MUL |  |
| use_php_code_eval | tinyint(1) | Y | MUL |  |
| use_custom_php_code_eval | tinyint(1) | Y | MUL |  |
| modified_at | timestamp |  |  |  |

### `rdebt_variables`  — ~25 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| variable_name | varchar(100) | Y | MUL |  |
| php_name | varchar(100) | Y |  |  |
| description | text | Y |  |  |
| use_in_case_details | tinyint(1) | Y | MUL |  |
| use_in_cheques | tinyint(1) | Y | MUL |  |
| use_in_letters | tinyint(1) | Y | MUL |  |
| use_in_system_alerts | tinyint(1) | Y | MUL |  |
| use_in_emails | tinyint(1) | Y | MUL |  |
| use_in_others | tinyint(1) | Y | MUL |  |
| modified_at | timestamp |  |  |  |
| link | varchar(255) |  |  |  |
| php_code_eval | mediumtext |  |  |  |
| custom_php_code_eval | mediumtext |  |  |  |
| variable_params | varchar(255) | Y |  |  |

### `rdebt_vat`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |

### `rdebt_vehicle`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| vehicle_id | int |  | PRI |  |
| vehicle_entered_date | datetime |  |  |  |
| vehicle_entered_user_id | text |  |  |  |
| vehicle_debtor_id | int |  | MUL |  |
| vehicle_reg | varchar(250) |  | MUL |  |
| vehicle_make | varchar(255) |  |  |  |
| vehicle_model | varchar(255) |  |  |  |
| vehicle_colour | varchar(255) |  |  |  |
| vehicle_year | varchar(255) |  |  |  |
| vehicle_status | varchar(255) |  |  |  |

### `rdebt_witnesses`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| witnes_name | varchar(255) | Y |  |  |
| note | varchar(255) | Y |  |  |
| is_statement | tinyint(1) |  | MUL |  |

### `rdebt_zipcode_rank_score_scoring_model`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | bigint unsigned |  | PRI |  |
| zip_norm | varchar(16) |  | UNI |  |
| rank_score | smallint unsigned |  |  |  |
| median_household_income | decimal(12,2) | Y |  |  |
| median_house_value | decimal(12,2) | Y |  |  |
| population | int unsigned | Y |  |  |
| group_score | enum('A','B','C','D','E','F') | Y | MUL |  |
| created_at | timestamp | Y |  |  |
| updated_at | timestamp | Y |  |  |

### `search_cases`  — ~55,045 rows
_Joins:_ `case_id`→`rdebt_cases`, `debtor_id`→`rdebt_debtor`, `operatorid`→`rdebt_users`, `bailiffid`→`rdebt_users`, `batch_id`→`batch`, `client_id`→`rdebt_clients`, `scheme_manager_id`→`rdebt_scheme_manager`, `stage_id`→`rdebt_stages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| ref | varchar(255) | Y | MUL |  |
| cl_ref | varchar(255) | Y |  |  |
| debtor_id | int | Y | MUL | `rdebt_debtor` |
| debtor_name | varchar(255) | Y | MUL |  |
| num_cases | int | Y | MUL |  |
| status_name | varchar(255) | Y |  |  |
| linked_case_count | int |  |  |  |
| operatorid | int | Y |  | `rdebt_users` |
| operator_name | varchar(255) | Y |  |  |
| bailiffid | int | Y |  | `rdebt_users` |
| bailiff_name | varchar(255) | Y |  |  |
| date | date | Y |  |  |
| d_outstanding | float(11,2) | Y |  |  |
| offense_date | date | Y |  |  |
| highcourt_ref | varchar(255) | Y |  |  |
| courtref | varchar(255) | Y |  |  |
| awardref | varchar(255) | Y |  |  |
| batch_id | varchar(255) | Y |  | `batch` |
| due_date | date | Y |  |  |
| client_id | int | Y |  | `rdebt_clients` |
| client_title | varchar(255) | Y |  |  |
| client_type | varchar(50) | Y |  |  |
| scheme_manager_id | int | Y |  | `rdebt_scheme_manager` |
| scheme_manager_name | varchar(255) | Y |  |  |
| next_task_due_date | date | Y |  |  |
| debtor_ssn | varchar(255) | Y |  |  |
| debtor_dob | varchar(255) | Y |  |  |
| debtor_trading_as | varchar(50) | Y |  |  |
| debtor_debtor_score | varchar(255) | Y |  |  |
| address_ln1 | text | Y |  |  |
| address_ln2 | varchar(255) | Y |  |  |
| address_ln3 | varchar(255) | Y |  |  |
| address_town | varchar(255) | Y |  |  |
| address_country | varchar(255) | Y |  |  |
| address_postcode | varchar(255) | Y |  |  |
| debtor_phone1 | varchar(255) | Y |  |  |
| debtor_phone2 | varchar(255) | Y |  |  |
| debtor_phone3 | varchar(255) | Y |  |  |
| debtor_phone4 | varchar(255) | Y |  |  |
| debtor_phone5 | varchar(255) | Y |  |  |
| debtor_phone6 | varchar(255) | Y |  |  |
| debtor_phone7 | varchar(255) | Y |  |  |
| debtor_phone8 | varchar(255) | Y |  |  |
| debtor_phone9 | varchar(255) | Y |  |  |
| debtor_phone10 | varchar(255) | Y |  |  |
| debtor_email1 | varchar(255) | Y |  |  |
| debtor_email2 | varchar(255) | Y |  |  |
| debtor_email3 | varchar(255) | Y |  |  |
| has_valid_phone | tinyint(1) | Y |  |  |
| has_valid_email | tinyint(1) | Y |  |  |
| status_id | int | Y |  |  |
| status_type_id | int | Y |  |  |
| status_type | varchar(255) | Y |  |  |
| custom1 | varchar(255) | Y |  |  |
| custom2 | varchar(255) | Y |  |  |
| custom3 | varchar(255) | Y |  |  |
| custom4 | varchar(255) | Y |  |  |
| custom5 | varchar(255) | Y |  |  |
| custom6 | varchar(255) | Y |  |  |
| custom7 | varchar(255) | Y |  |  |
| custom8 | varchar(255) | Y |  |  |
| custom9 | varchar(255) | Y |  |  |
| custom10 | varchar(255) | Y |  |  |
| custom_date1 | date | Y |  |  |
| custom_date2 | date | Y |  |  |
| case_bool1 | tinyint(1) | Y |  |  |
| case_bool2 | tinyint(1) | Y |  |  |
| case_bool3 | tinyint(1) | Y |  |  |
| case_bool4 | tinyint(1) | Y |  |  |
| case_bool5 | tinyint(1) | Y |  |  |
| case_bool6 | tinyint(1) | Y |  |  |
| case_bool7 | tinyint(1) | Y |  |  |
| case_bool8 | tinyint(1) | Y |  |  |
| case_bool9 | tinyint(1) | Y |  |  |
| case_bool10 | tinyint(1) | Y |  |  |
| stage_name | varchar(255) | Y |  |  |
| stage_id | int | Y |  | `rdebt_stages` |
| last_outbound_call_date | date | Y |  |  |
| last_outbound_call_result | text | Y |  |  |
| last_inbound_call_date | date | Y |  |  |
| last_inbound_call_result | text | Y |  |  |
| last_email_date | date | Y |  |  |
| last_email_result | text | Y |  |  |
| last_payment_date | date | Y |  |  |
| next_payment_date | date | Y |  |  |
| total_paid | float(11,2) | Y |  |  |
| arrangement_amount | float(11,2) | Y |  |  |
| on_arrangement | tinyint(1) | Y |  |  |

### `search_results`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| search_id | varchar(45) |  | UNI |  |
| results | text |  |  |  |
| date_created | datetime |  |  |  |

### `search_searches`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| uid | varchar(45) |  | UNI |  |
| user_id | int |  | MUL | `rdebt_users` |
| parameters | text |  |  |  |
| date_created | datetime |  |  |  |

### `secret_token_types`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| type | varchar(255) |  |  |  |
| description | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `secret_tokens`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| value | varchar(255) |  |  |  |
| description | text |  |  |  |
| type_id | int |  | MUL |  |
| entity_id | int |  | MUL |  |
| entity_type | varchar(255) |  |  |  |
| case_id | int |  | MUL | `rdebt_cases` |
| valid_until | datetime |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `settlement_offers`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  |  | `rdebt_cases` |
| user_id | int |  |  | `rdebt_users` |
| settlement_amount | float(11,2) | Y |  |  |
| settlement_discount_perc | float(11,2) | Y |  |  |
| reason | text |  |  |  |
| payment_plan_id | int | Y |  |  |
| offered_date | datetime |  |  |  |
| agreed_date | datetime | Y |  |  |
| paid_date | datetime | Y |  |  |
| expired_date | datetime | Y |  |  |
| created_date | datetime |  |  |  |
| payment_type | varchar(255) | Y |  |  |
| settlement_status | enum('requested','agreed','paid','offered','expired','archive') | Y |  |  |
| communication_type | enum('sms','email','verbal','letter','portal_chat','voice_ai','whatapp','sms-rms','voicemail') | Y |  |  |

### `settlement_parameters`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| settlement_type | enum('outstanding_amount') | Y |  |  |
| settlement_definition | text | Y |  |  |
| default_settlement_percentage | float(11,2) | Y |  |  |
| max_settlement_percentage | float(11,2) | Y |  |  |
| name | varchar(255) |  |  |  |
| priority | int | Y |  |  |

### `skill_sets`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_by | int |  |  | `rdebt_users` |

### `social_media_account_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| internal_type | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| icon | varchar(255) | Y |  |  |

### `social_media_accounts`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`, `social_media_account_type_id`→`social_media_account_types`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| account | varchar(255) | Y |  |  |
| note | varchar(255) | Y |  |  |
| resource_url | varchar(255) | Y |  |  |
| ordering | smallint | Y | MUL |  |
| user_id | varchar(255) | Y |  | `rdebt_users` |
| created | datetime | Y |  |  |
| updated | datetime | Y |  |  |
| social_media_account_type_id | int | Y | MUL | `social_media_account_types` |
| owner_type | varchar(255) | Y |  |  |
| owner_id | int | Y | MUL |  |

### `statute_of_limitations`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| state_code | varchar(255) |  |  |  |
| state_name | varchar(255) |  |  |  |
| oral | int |  | MUL |  |
| written | int |  | MUL |  |
| promissory | int |  | MUL |  |
| open | int |  | MUL |  |

### `system_links`  — ~343 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| scope | varchar(255) |  |  |  |
| url | varchar(255) |  |  |  |
| library | varchar(255) |  |  |  |
| controller | varchar(255) |  |  |  |
| action | varchar(255) |  |  |  |
| args | varchar(255) |  |  |  |
| is_authenticate | tinyint |  | MUL |  |
| icon_class | varchar(60) | Y |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| help_document_link | varchar(255) |  |  |  |
| svg_icon_name | text | Y |  |  |

### `system_scope_links`  — ~622 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| scope_id | int |  | MUL |  |
| link_id | int |  | MUL |  |
| ordering | int |  | MUL |  |
| parent_id | int |  | MUL |  |
| label | varchar(255) |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `system_scopes`  — ~4 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| scope_type | varchar(255) |  |  |  |
| scope_id | int |  | MUL |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| status | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `task_types`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `temp_case_data_log`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| description | varchar(255) | Y |  |  |
| old_data | text | Y |  |  |
| new_data | text | Y |  |  |
| created_at | datetime |  |  |  |

### `third_party_access_details`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| type | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| token_data | text |  |  |  |
| last_sync_at | datetime | Y |  |  |
| is_expired | tinyint(1) |  | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| email | varchar(255) | Y |  |  |

### `transaction_statement`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| transaction_id | int |  |  |  |
| case_id | int |  |  | `rdebt_cases` |
| amount | decimal(10,2) | Y |  |  |
| balance | decimal(10,2) | Y |  |  |
| created_at | datetime | Y |  |  |
| info | text |  |  |  |

### `v6_admin_audit`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | bigint unsigned |  | PRI |  |
| actor_user_id | int unsigned |  |  |  |
| actor_role | varchar(64) | Y |  |  |
| action | varchar(32) |  |  |  |
| resource | varchar(64) |  |  |  |
| resource_id | varchar(64) | Y |  |  |
| before | json | Y |  |  |
| after | json | Y |  |  |
| request_id | varchar(64) |  |  |  |
| tenant_db | varchar(64) |  |  |  |
| created_at | timestamp |  |  |  |

### `v6_example_notes`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| note | varchar(255) |  |  |  |
| created_at | timestamp |  |  |  |

### `v6_installed_plugins`  — ~0 rows
_Joins:_ `plugin_id`→`plugins`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| plugin_id | varchar(190) |  | UNI | `plugins` |
| enabled | tinyint |  |  |  |
| settings | text | Y |  |  |
| installed_at | datetime | Y |  |  |
| updated_at | datetime | Y |  |  |
| updated_by | int | Y |  | `rdebt_users` |

### `v6_interest_failures`  — ~0 rows
_Joins:_ `case_id`→`rdebt_cases`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  |  | `rdebt_cases` |
| failed_at | datetime |  |  |  |
| reason | text | Y |  |  |
| attempt_count | int |  |  |  |

### `visit_transactions`  — ~0 rows
_Joins:_ `debtor_id`→`rdebt_debtor`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| visit_id | int |  |  |  |
| remit_id | int |  |  |  |
| status_id | int |  |  |  |
| is_pdf_generated | tinyint(1) |  |  |  |
| debtor_id | int |  |  | `rdebt_debtor` |
| visit_no | int |  |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

## Financial engine


### `financial_bucket_prototype`  — ~34 rows
_Joins:_ `financial_scheme_prototype_id`→`financial_scheme_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| parent_id | int | Y | MUL |  |
| uid | varchar(45) |  | UNI |  |
| financial_scheme_prototype_id | int |  | MUL | `financial_scheme_prototype` |
| lft | int |  | MUL |  |
| rght | int |  | MUL |  |
| name | varchar(45) |  |  |  |
| starting_balance | decimal(27,9) |  |  |  |
| starting_size | decimal(27,9) |  |  |  |
| split_amount | decimal(27,9) |  |  |  |
| split_type | enum('FIXED','PERCENTAGE') |  |  |  |
| child_zero_percent_split_strategy | enum('EQUALLY_BY_CHILDREN','DISCRIMINATE_BY_GREEDINESS','RELATIVE_BY_BALANCE','RELATIVE_BY_SIZE') |  |  |  |
| child_pour_cycle_limit | int |  | MUL |  |
| allow_positive_balance | tinyint(1) |  | MUL |  |
| allow_negative_balance | tinyint(1) |  | MUL |  |
| stops_balance_effect_propagation | tinyint(1) |  | MUL |  |
| stops_size_effect_propagation | tinyint(1) |  | MUL |  |
| slug | varchar(200) | Y |  |  |

### `financial_bucket_prototype_override`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| uid | varchar(255) |  |  |  |
| lft | int |  | MUL |  |
| rht | int |  | MUL |  |
| lvl | int |  | MUL |  |
| parent_id | int |  | MUL |  |
| type | varchar(255) |  |  |  |

### `financial_bucket_rule`  — ~0 rows
_Joins:_ `financial_bucket_rule_node_id`→`financial_bucket_rule_node`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_bucket_rule_node_id | int |  | PRI | `financial_bucket_rule_node` |
| uid | varchar(45) |  |  |  |
| repeatable | tinyint(1) |  | MUL |  |
| satisfiable | tinyint(1) |  | MUL |  |
| left_type | enum('FIXED','PERCENTAGE') |  |  |  |
| left_argument | enum('LEFT_CUSTOM','SPLIT_AVAILABLE','SPLIT_REQUESTED','TRANSACTION_AMOUNT','EXISTING_BUCKET_BALANCE','PROJECTED_BUCKET_BALANCE','EXISTING_TOTAL_BALANCE','PROJECTED_TOTAL_BALANCE') |  |  |  |
| left_custom | decimal(27,9) | Y |  |  |
| left_function | enum('ABS','CEIL','EXP','FLOOR','ROUND','SQRT') | Y |  |  |
| operator | enum('EQUALS','LESS_THAN','GREATER_THAN','LESS_OR_EQUAL','GREATER_OR_EQUAL') |  |  |  |
| right_type | enum('FIXED','PERCENTAGE') |  |  |  |
| right_argument | enum('RIGHT_CUSTOM','SPLIT_AVAILABLE','SPLIT_REQUESTED','TRANSACTION_AMOUNT','EXISTING_BUCKET_BALANCE','PROJECTED_BUCKET_BALANCE','EXISTING_TOTAL_BALANCE','PROJECTED_TOTAL_BALANCE') |  |  |  |
| right_custom | decimal(27,9) | Y |  |  |
| right_function | enum('ABS','CEIL','EXP','FLOOR','ROUND','SQRT') | Y |  |  |

### `financial_bucket_rule_node`  — ~0 rows
_Joins:_ `financial_bucket_prototype_id`→`financial_bucket_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_bucket_prototype_id | int |  | PRI | `financial_bucket_prototype` |
| parent_id | int | Y | MUL |  |
| uid | varchar(45) |  | UNI |  |
| lft | int |  | MUL |  |
| rght | int |  | MUL |  |
| logic_operator | enum('AND','OR') |  |  |  |

### `financial_bucket_rule_satisfaction`  — ~0 rows
_Joins:_ `financial_bucket_rule_id`→`financial_bucket_rule`, `financial_bucket_instance_id`→`financial_bucket_instance`, `financial_split_id`→`financial_split`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_bucket_rule_id | int |  | PRI | `financial_bucket_rule` |
| financial_bucket_instance_id | int |  | PRI | `financial_bucket_instance` |
| financial_split_id | int |  | PRI | `financial_split` |

### `financial_fee_prototype`  — ~12 rows
_Joins:_ `financial_scheme_prototype_id`→`financial_scheme_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_scheme_prototype_id | int |  | PRI | `financial_scheme_prototype` |
| uid | varchar(45) |  | UNI |  |
| name | varchar(45) |  |  |  |
| merge_fee_targets | tinyint(1) |  | MUL |  |

### `financial_fee_target`  — ~13 rows
_Joins:_ `financial_fee_prototype_id`→`financial_fee_prototype`, `financial_bucket_prototype_id`→`financial_bucket_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_prototype_id | int |  | PRI | `financial_fee_prototype` |
| financial_bucket_prototype_id | int |  | PRI | `financial_bucket_prototype` |
| round | tinyint(1) |  | MUL |  |
| round_to | decimal(27,9) |  |  |  |
| round_mode | enum('ROUND_TO_NEAREST','ROUND_TO_PREVIOUS','ROUND_TO_NEXT') |  |  |  |

### `financial_fee_target_rate`  — ~13 rows
_Joins:_ `financial_fee_target_id`→`financial_fee_target`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_target_id | int |  | PRI | `financial_fee_target` |
| type | enum('FIXED','PERCENTAGE') |  |  |  |
| rate | decimal(27,9) |  |  |  |
| lower_boundary | decimal(27,9) |  |  |  |
| upper_boundary | decimal(27,9) |  |  |  |

### `financial_fee_target_reference`  — ~8 rows
_Joins:_ `financial_fee_target_id`→`financial_fee_target`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_target_id | int |  | PRI | `financial_fee_target` |
| round | tinyint(1) |  | MUL |  |
| round_to | decimal(27,9) |  |  |  |
| round_mode | enum('ROUND_TO_NEAREST','ROUND_TO_PREVIOUS','ROUND_TO_NEXT') |  |  |  |

### `financial_fee_target_reference_bucket_prototype`  — ~7 rows
_Joins:_ `financial_fee_target_reference_id`→`financial_fee_target_reference`, `financial_bucket_prototype_id`→`financial_bucket_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_target_reference_id | int |  | PRI | `financial_fee_target_reference` |
| financial_bucket_prototype_id | int |  | PRI | `financial_bucket_prototype` |
| round | tinyint(1) |  | MUL |  |
| round_to | decimal(27,9) |  |  |  |
| round_mode | enum('ROUND_TO_NEAREST','ROUND_TO_PREVIOUS','ROUND_TO_NEXT') |  |  |  |

### `financial_fee_target_reference_fee_target`  — ~0 rows
_Joins:_ `financial_fee_target_reference_id`→`financial_fee_target_reference`, `financial_fee_target_id`→`financial_fee_target`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_target_reference_id | int |  | PRI | `financial_fee_target_reference` |
| financial_fee_target_id | int |  | PRI | `financial_fee_target` |
| round | tinyint(1) |  | MUL |  |
| round_to | decimal(27,9) |  |  |  |
| round_mode | enum('ROUND_TO_NEAREST','ROUND_TO_PREVIOUS','ROUND_TO_NEXT') |  |  |  |

### `financial_fee_target_reference_transaction_type`  — ~0 rows
_Joins:_ `financial_fee_target_reference_id`→`financial_fee_target_reference`, `financial_transaction_type_id`→`financial_transaction_type`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_fee_target_reference_id | int |  | PRI | `financial_fee_target_reference` |
| financial_transaction_type_id | int |  | PRI | `financial_transaction_type` |

### `financial_payment_transaction`  — ~0 rows
_Joins:_ `payment_id`→`rdebt_payment`, `financial_transaction_id`→`financial_transaction`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| payment_id | int |  | MUL | `rdebt_payment` |
| financial_transaction_id | int |  | MUL | `financial_transaction` |

### `financial_scheme_prototype`  — ~0 rows
_Joins:_ `financial_bucket_prototype_id`→`financial_bucket_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_bucket_prototype_id | int |  | PRI | `financial_bucket_prototype` |
| uid | varchar(45) |  | UNI |  |
| name | varchar(45) |  |  |  |

### `financial_split`  — ~322,560 rows
_Joins:_ `financial_transaction_split_id`→`financial_transaction_split`, `financial_bucket_instance_id`→`financial_bucket_instance`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_transaction_split_id | int |  | PRI | `financial_transaction_split` |
| financial_bucket_instance_id | int |  | PRI | `financial_bucket_instance` |
| uid | varchar(45) |  | UNI |  |
| amount | decimal(27,9) |  |  |  |
| size_effect | decimal(27,9) |  |  |  |
| balance_effect | decimal(27,9) |  |  |  |
| available_negative_amount | float | Y |  |  |

### `financial_split_override_settings`  — ~252 rows
_Joins:_ `financial_split_override_id`→`financial_split_overrides`, `scheme_id`→`rdebt_schemes`, `scheme_manager_id`→`rdebt_scheme_manager`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| financial_split_override_id | int |  | MUL | `financial_split_overrides` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| scheme_manager_id | int | Y |  | `rdebt_scheme_manager` |
| client_id | int |  | MUL | `rdebt_clients` |
| client_commission | text | Y |  |  |
| default | tinyint(1) |  | MUL |  |
| priority | int |  | MUL |  |
| case_branch_id | int |  |  |  |
| client_branch_id | int |  |  |  |

### `financial_split_overrides`  — ~6 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| config | text |  |  |  |
| financial_scheme_id | int |  | MUL |  |

### `financial_transaction_type`  — ~12 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| uid | varchar(45) |  | UNI |  |
| name | varchar(45) |  |  |  |
| calculator | enum('adjustment','cost','debt','fee','receipt','undo','writeOff','custom','custom_receipt','custom_fee','balance_adjustment') |  |  |  |
| has_source_bucket_size_effect | tinyint(1) |  | MUL |  |
| has_source_bucket_balance_effect | tinyint(1) |  | MUL |  |
| has_target_bucket_size_effect | tinyint(1) |  | MUL |  |
| has_target_bucket_balance_effect | tinyint(1) |  | MUL |  |

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
_Joins:_ `caseid`→`rdebt_cases`, `interest_rate_id`→`interest_rates`, `client_interest_rate_id`→`client_interest_rates`, `financial_transaction_id`→`financial_transaction`

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
| interest_rate_id | int |  | MUL | `interest_rates` |
| client_interest_rate_id | int |  | MUL | `client_interest_rates` |
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
_Joins:_ `financial_fee_prototype_id`→`financial_fee_prototype`

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
| financial_fee_prototype_id | int | Y | MUL | `financial_fee_prototype` |
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
_Joins:_ `client_scheme_id`→`client_schemes`, `scheme_id`→`rdebt_schemes`, `case_id`→`rdebt_cases`, `invoice_id`→`invoices`, `user_id`→`rdebt_users`, `client_id`→`rdebt_clients`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| run_date | datetime | Y |  |  |
| client_scheme_id | int | Y | MUL | `client_schemes` |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| scheme_ids | text | Y |  |  |
| case_id | text | Y |  | `rdebt_cases` |
| os_branch_id | int | Y | MUL |  |
| invoice_id | int | Y | MUL | `invoices` |
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
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`, `user_id`→`rdebt_users`, `batch_id`→`batch`, `remittance_id`→`rdebt_remittance`, `case_id`→`rdebt_cases`

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
| batch_id | int |  | MUL | `batch` |
| os_po_number | varchar(200) | Y |  |  |
| created_at | datetime |  |  |  |
| process_started | tinyint(1) |  | MUL |  |
| process_started_at | datetime | Y |  |  |
| process_completed_at | datetime | Y |  |  |
| process_successful | tinyint(1) |  | MUL |  |
| process_results | mediumtext | Y |  |  |
| remittance_id | int | Y | MUL | `rdebt_remittance` |
| case_id | varchar(255) | Y |  | `rdebt_cases` |

## Financial — Payments


### `financial_bucket_instance`  — ~1,862,685 rows
_Joins:_ `financial_scheme_instance_id`→`financial_scheme_instance`, `financial_bucket_prototype_id`→`financial_bucket_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_scheme_instance_id | int |  | PRI | `financial_scheme_instance` |
| financial_bucket_prototype_id | int |  | PRI | `financial_bucket_prototype` |
| uid | varchar(45) |  | UNI |  |
| balance | decimal(27,9) |  |  |  |
| size | decimal(27,9) |  |  |  |

### `financial_scheme_instance`  — ~51,215 rows
_Joins:_ `case_id`→`rdebt_cases`, `financial_scheme_prototype_id`→`financial_scheme_prototype`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | PRI | `rdebt_cases` |
| financial_scheme_prototype_id | int |  | PRI | `financial_scheme_prototype` |
| uid | varchar(45) |  | UNI |  |

### `financial_transaction`  — ~971,702 rows
_Joins:_ `financial_transaction_type_id`→`financial_transaction_type`, `financial_scheme_instance_id`→`financial_scheme_instance`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| financial_transaction_type_id | int |  | PRI | `financial_transaction_type` |
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
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`, `bailiffID`→`rdebt_users`, `import_id`→`imports`, `financial_transaction_id`→`financial_transaction`, `financial_split_override_id`→`financial_split_overrides`

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
| import_id | int | Y | MUL | `imports` |
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
| financial_split_override_id | int |  | MUL | `financial_split_overrides` |
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
_Joins:_ `userid`→`rdebt_users`, `caseid`→`rdebt_cases`, `document_id`→`rdebt_documents`, `remittance_id`→`rdebt_remittance`, `financial_transaction_id`→`financial_transaction`

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
| document_id | int |  | MUL | `rdebt_documents` |
| remittance_id | int | Y | MUL | `rdebt_remittance` |
| financial_transaction_id | int | Y | MUL | `financial_transaction` |

### `transaction_adjustment`  — ~0 rows
_Joins:_ `role_id`→`roles`, `financial_transaction_type_id`→`financial_transaction_type`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| role_id | int |  |  | `roles` |
| financial_transaction_type_id | int |  |  | `financial_transaction_type` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

## Financial — other


### `rdebt_fee_payment_method_link`  — ~0 rows
_Joins:_ `fee_id`→`rdebt_fees`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| fee_id | int |  | MUL | `rdebt_fees` |
| payment_method_id | int |  | MUL |  |
| adapter | varchar(255) |  |  |  |

### `rdebt_fee_sm_link`  — ~8 rows
_Joins:_ `fee_id`→`rdebt_fees`, `sm_id`→`sms`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| fee_sm_link_id | int |  | PRI |  |
| fee_id | int |  | MUL | `rdebt_fees` |
| sm_id | int |  | MUL | `sms` |

### `rdebt_invoices`  — ~0 rows
_Joins:_ `invoice_id`→`invoices`, `client_id`→`rdebt_clients`, `remittance_id`→`rdebt_remittance`, `remittance_schedule_id`→`remittance_schedule`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| invoice_id | varchar(255) |  |  | `invoices` |
| client_id | int |  | MUL | `rdebt_clients` |
| remittance_id | int |  | MUL | `rdebt_remittance` |
| letter_link | varchar(255) |  |  |  |
| remittance_schedule_id | int |  | MUL | `remittance_schedule` |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `rdebt_payment_transfer_log`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| to_payment_id | int |  | MUL |  |
| from_payment_id | int |  | MUL |  |
| from_case_id | int |  | MUL |  |
| to_case_id | int |  | MUL |  |
| note | text |  |  |  |
| amount | decimal(9,2) |  |  |  |

### `rdebt_remittance`  — ~0 rows
_Joins:_ `caseid`→`rdebt_cases`, `userid`→`rdebt_users`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| rundate | text |  |  |  |
| caseid | text |  |  | `rdebt_cases` |
| userid | text |  |  | `rdebt_users` |
| startdate | text |  |  |  |
| enddate | text |  |  |  |
| client | text |  |  |  |
| fees | text |  |  |  |
| collected | text |  |  |  |
| scheme_id | int |  | MUL | `rdebt_schemes` |

## Import, export & batch


### `allocation_operation_items`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| operation_id | int |  | MUL |  |
| left_item_id | int |  | MUL |  |
| right_item_id | int |  | MUL |  |
| ordering | int |  | MUL |  |
| status | varchar(255) |  |  |  |
| processed | tinyint(1) |  | MUL |  |
| result | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| process_started_at | datetime |  |  |  |
| process_finished_at | datetime |  |  |  |
| processed_by | int |  | MUL |  |

### `allocation_operations`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| type_id | int |  | MUL |  |
| left_item_type | varchar(255) |  |  |  |
| right_item_type | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| processed | tinyint(1) |  | MUL |  |
| result | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| process_started_at | datetime |  |  |  |
| process_finished_at | datetime |  |  |  |
| processed_by | int |  | MUL |  |

### `allocation_rules`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| allocation_type | varchar(255) |  |  |  |
| primary_goal | varchar(255) |  |  |  |
| primary_goal_options | text |  |  |  |
| secondary_goal | varchar(255) |  |  |  |
| secondary_goal_options | text |  |  |  |
| tertiary_goal | varchar(255) |  |  |  |
| tertiary_goal_options | text |  |  |  |
| extra_options | text |  |  |  |
| max_live_allocate | int |  |  |  |
| linked_account | tinyint(1) |  |  |  |
| unique_agent | tinyint(1) |  |  |  |
| deleted | tinyint(1) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  |  | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  |  | `rdebt_users` |

### `allocation_types`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| allocator_name | varchar(255) |  |  |  |
| adapter_name | varchar(255) |  |  |  |
| left_label | varchar(255) |  |  |  |
| right_label | varchar(255) |  |  |  |
| left_export_id | int |  | MUL |  |
| right_export_id | int |  | MUL |  |
| description | text |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| deleted | tinyint(1) |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `batch`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| _rowid | int |  | PRI |  |
| _createdBy | varchar(30) | Y |  |  |
| _createdDate | datetime | Y |  |  |
| _lockowner | varchar(50) | Y | MUL |  |
| date | datetime |  | MUL |  |
| date_period | int |  | MUL |  |
| date_year | int |  | MUL |  |
| total | decimal(12,2) |  |  |  |
| status | char(1) |  | MUL |  |
| postedBy | varchar(30) | Y |  |  |
| postedDate | datetime | Y |  |  |
| accountedFor | char(1) | Y |  |  |
| currency | char(3) | Y |  |  |
| date_week | int | Y | MUL |  |
| bankReference | char(20) | Y |  |  |
| bankReconciled | char(1) | Y |  |  |

### `data_warehouse_catalog`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| label | varchar(255) |  |  |  |
| scope | varchar(255) |  |  |  |
| adapter | varchar(255) |  |  |  |
| adapter_settings | text |  |  |  |
| expiry | varchar(255) |  |  |  |
| expiry_type | varchar(255) |  |  |  |
| retention | int |  | MUL |  |
| last_run | datetime |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| status | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `data_warehouse_catalog_objects`  — ~0 rows
_Joins:_ `data_warehouse_catalog_id`→`data_warehouse_catalog`, `data_warehouse_object_id`→`data_warehouse_objects`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_warehouse_catalog_id | int |  | MUL | `data_warehouse_catalog` |
| data_warehouse_object_id | int |  | MUL | `data_warehouse_objects` |
| position | int |  | MUL |  |
| mandatory | tinyint(1) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `data_warehouse_instance_items`  — ~0 rows
_Joins:_ `data_warehouse_instance_id`→`data_warehouse_instances`, `data_warehouse_object_id`→`data_warehouse_objects`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_warehouse_instance_id | int |  | MUL | `data_warehouse_instances` |
| data_warehouse_object_id | int |  | MUL | `data_warehouse_objects` |
| data | text |  |  |  |
| position | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `data_warehouse_instances`  — ~0 rows
_Joins:_ `data_warehouse_catalog_id`→`data_warehouse_catalog`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| data_warehouse_catalog_id | int |  | MUL | `data_warehouse_catalog` |
| query_time | int |  | MUL |  |
| expiry_date | datetime |  |  |  |
| status | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `data_warehouse_objects`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| adapter | varchar(255) |  |  |  |
| adapter_settings | text |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| status | varchar(255) |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `data_warehouse_resources`  — ~0 rows
_Joins:_ `data_warehouse_instance_id`→`data_warehouse_instances`, `document_id`→`rdebt_documents`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| data_warehouse_instance_id | int |  | MUL | `data_warehouse_instances` |
| document_id | int |  | MUL | `rdebt_documents` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `exports`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| definition | longtext | Y |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| is_for_report_builder | int | Y | MUL |  |
| is_system_alert | tinyint | Y | MUL |  |
| slug | varchar(255) | Y |  |  |
| output | longtext | Y |  |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `imported_files`  — ~318 rows
_Joins:_ `batch_id`→`batch`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| file_name | varchar(255) |  |  |  |
| file_link | varchar(255) |  |  |  |
| import_method | varchar(255) |  |  |  |
| batch_id | varchar(255) |  |  | `batch` |
| user_id | int |  | MUL | `rdebt_users` |
| import_result | mediumtext | Y |  |  |
| custom_data | text | Y |  |  |
| date_imported | datetime |  |  |  |
| status | int | Y | MUL |  |

### `imports`  — ~5 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| label | varchar(255) |  |  |  |
| slug | varchar(50) |  |  |  |
| driver | varchar(255) |  |  |  |
| adaptor | varchar(255) |  |  |  |
| file_settings | text |  |  |  |
| definition | longtext |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `rdebt_import_cases_temp`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| col1 | varchar(255) |  |  |  |
| col2 | varchar(255) |  |  |  |
| col3 | varchar(255) |  |  |  |
| col4 | varchar(255) |  |  |  |
| col5 | varchar(255) |  |  |  |
| col6 | varchar(255) |  |  |  |
| col7 | varchar(255) |  |  |  |
| col8 | varchar(255) |  |  |  |
| col9 | varchar(255) |  |  |  |
| col10 | varchar(255) |  |  |  |
| col11 | varchar(255) |  |  |  |
| col12 | varchar(255) |  |  |  |
| col13 | varchar(255) |  |  |  |
| col14 | varchar(255) |  |  |  |
| col15 | varchar(255) |  |  |  |
| col16 | varchar(255) |  |  |  |
| col17 | varchar(255) |  |  |  |
| col18 | varchar(255) |  |  |  |
| col19 | varchar(255) |  |  |  |
| col20 | varchar(255) |  |  |  |
| col21 | varchar(255) |  |  |  |
| col22 | varchar(255) |  |  |  |
| col23 | varchar(255) |  |  |  |
| col24 | varchar(255) |  |  |  |
| col25 | varchar(255) |  |  |  |

### `rdebt_import_transaction`  — ~615,978 rows
_Joins:_ `import_id`→`imports`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| import_id | int |  | MUL | `imports` |
| external_data | longtext | Y |  |  |
| function_name | varchar(255) |  |  |  |
| internal_data | longtext | Y |  |  |
| status | int |  | MUL |  |
| error_data | varchar(255) |  |  |  |
| created_at | datetime |  | MUL |  |
| updated_at | datetime |  |  |  |
| params | text | Y |  |  |

### `rdebt_imported_cases`  — ~0 rows
_Joins:_ `batch_id`→`batch`, `case_id`→`rdebt_cases`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| batch_id | varchar(255) | Y |  | `batch` |
| case_id | int | Y | MUL | `rdebt_cases` |
| user_id | int | Y | MUL | `rdebt_users` |
| imported | tinyint(1) | Y | MUL |  |
| is_header | tinyint(1) | Y | MUL |  |
| var_0 | varchar(255) | Y |  |  |
| var_1 | varchar(255) | Y |  |  |
| var_2 | varchar(255) | Y |  |  |
| var_3 | varchar(255) | Y |  |  |
| var_4 | varchar(255) | Y |  |  |
| var_5 | varchar(255) | Y |  |  |
| var_6 | varchar(255) | Y |  |  |
| var_7 | varchar(255) | Y |  |  |
| var_8 | varchar(255) | Y |  |  |
| var_9 | varchar(255) | Y |  |  |
| var_10 | varchar(255) | Y |  |  |
| var_11 | varchar(255) | Y |  |  |
| var_12 | varchar(255) | Y |  |  |
| var_13 | varchar(255) | Y |  |  |
| var_14 | varchar(255) | Y |  |  |
| var_15 | varchar(255) | Y |  |  |
| var_16 | varchar(255) | Y |  |  |
| var_17 | varchar(255) | Y |  |  |
| var_18 | varchar(255) | Y |  |  |
| var_19 | varchar(255) | Y |  |  |
| var_20 | varchar(255) | Y |  |  |
| var_21 | varchar(255) | Y |  |  |
| var_22 | varchar(255) | Y |  |  |
| var_23 | varchar(255) | Y |  |  |
| var_24 | varchar(255) | Y |  |  |
| var_25 | varchar(255) | Y |  |  |
| var_26 | varchar(255) | Y |  |  |
| var_27 | varchar(255) | Y |  |  |
| var_28 | varchar(255) | Y |  |  |
| var_29 | varchar(255) | Y |  |  |
| var_30 | varchar(255) | Y |  |  |
| var_31 | varchar(255) | Y |  |  |
| var_32 | varchar(255) | Y |  |  |
| var_33 | varchar(255) | Y |  |  |
| var_34 | varchar(255) | Y |  |  |
| var_35 | varchar(255) | Y |  |  |
| long_var_1 | mediumtext | Y |  |  |
| long_var_2 | mediumtext | Y |  |  |
| long_var_3 | mediumtext | Y |  |  |
| long_var_4 | mediumtext | Y |  |  |
| long_var_5 | mediumtext | Y |  |  |

### `rdebt_imported_cases_settings`  — ~0 rows
_Joins:_ `client_id`→`rdebt_clients`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| updated_at | timestamp |  |  |  |
| client_id | int | Y | MUL | `rdebt_clients` |
| scheme_id | int | Y | MUL | `rdebt_schemes` |
| settings | mediumtext | Y |  |  |

### `rdebt_migration_backlinks`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| itemid | int |  | PRI |  |
| name | varchar(100) |  |  |  |
| url | text |  |  |  |
| sefurl | text |  |  |  |
| newurl | text |  |  |  |

## Users, roles & access


### `access_control_controller`  — ~7 rows
_Joins:_ `action_id`→`rdebt_actions`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| library | varchar(255) |  |  |  |
| controller | varchar(255) |  |  |  |
| action | varchar(255) |  |  |  |
| args | varchar(255) |  |  |  |
| action_id | int |  | MUL | `rdebt_actions` |
| users_allow | varchar(255) |  |  |  |
| users_deny | varchar(255) |  |  |  |
| groups_allow | varchar(255) |  |  |  |
| groups_deny | varchar(255) |  |  |  |
| roles_allow | varchar(255) |  |  |  |
| roles_deny | varchar(255) |  |  |  |
| scope_id | int |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |

### `access_control_scopes`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| users_allow | text |  |  |  |
| users_deny | text |  |  |  |
| groups_allow | text |  |  |  |
| groups_deny | text |  |  |  |
| roles_allow | text |  |  |  |
| roles_deny | text |  |  |  |
| description | text |  |  |  |
| options | text |  |  |  |
| settings | text |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `rdebt_bailiffreport`  — ~0 rows
_Joins:_ `caseid`→`rdebt_cases`, `bailiffid`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| caseid | int |  | MUL | `rdebt_cases` |
| visitnum | smallint |  | MUL |  |
| status | text |  |  |  |
| photo | text |  |  |  |
| address_ln1 | varchar(100) |  |  |  |
| address_ln2 | varchar(100) |  |  |  |
| address_ln3 | varchar(100) |  |  |  |
| address_town | varchar(100) |  |  |  |
| address_postcode | varchar(100) |  |  |  |
| prop_status | varchar(100) |  |  |  |
| property_type | varchar(255) |  |  |  |
| residential_type | varchar(255) |  |  |  |
| other_buildings | varchar(255) |  |  |  |
| confirmed_res | varchar(45) |  |  |  |
| prop_condition | varchar(100) |  |  |  |
| sale | varchar(150) |  |  |  |
| access | varchar(155) |  |  |  |
| admitted | varchar(100) |  |  |  |
| pending | varchar(100) |  |  |  |
| order | varchar(35) |  |  |  |
| order_type | varchar(45) |  |  |  |
| spoketo | text |  |  |  |
| debtor_status | varchar(100) |  |  |  |
| benefit_type | varchar(100) |  |  |  |
| police | varchar(50) |  |  |  |
| policecalled | varchar(45) |  |  |  |
| policeno | varchar(45) |  |  |  |
| employer | varchar(45) |  |  |  |
| d_att | varchar(45) |  |  |  |
| third_att | varchar(45) |  |  |  |
| goods | varchar(45) |  |  |  |
| goodsval | varchar(150) |  |  |  |
| disputes | text |  |  |  |
| notes | text |  |  |  |
| client | tinyint |  | MUL |  |
| date | date | Y |  |  |
| bailiffid | mediumint | Y | MUL | `rdebt_users` |
| time | varchar(50) |  |  |  |
| veh1make | varchar(100) |  |  |  |
| veh1reg | varchar(100) |  |  |  |
| veh2make | varchar(100) |  |  |  |
| veh2reg | varchar(100) |  |  |  |
| veh3make | varchar(100) |  |  |  |
| veh3reg | varchar(100) |  |  |  |
| veh4make | varchar(100) |  |  |  |
| veh4reg | varchar(100) |  |  |  |
| veh5make | varchar(100) |  |  |  |
| veh5reg | varchar(100) |  |  |  |
| paymentreceived | varchar(100) |  |  |  |
| paymentamount | varchar(100) |  |  |  |
| method | varchar(100) |  |  |  |
| paymentamount2 | varchar(100) |  |  |  |
| method2 | varchar(100) |  |  |  |
| paymentamount3 | varchar(100) |  |  |  |
| method3 | varchar(100) |  |  |  |
| paymentamount4 | varchar(100) |  |  |  |
| method4 | varchar(100) |  |  |  |
| paymentamount5 | varchar(100) |  |  |  |
| method5 | varchar(100) |  |  |  |
| paymentproposal | varchar(100) |  |  |  |
| proposalamount | varchar(100) |  |  |  |
| proposalstartdate | varchar(100) | Y |  |  |
| freq | varchar(100) |  |  |  |
| officerrec | varchar(100) |  |  |  |
| interpleaderclaim | varchar(100) |  |  |  |
| interpleadertype | varchar(100) |  |  |  |
| interpleaderby | varchar(100) |  |  |  |
| outcome | varchar(100) |  |  |  |
| approved | tinyint |  | MUL |  |
| officerec | text |  |  |  |
| created | timestamp |  |  |  |
| fee_amount | decimal(9,2) | Y |  |  |
| fee_notes | varchar(255) | Y |  |  |
| goods_seized_note | varchar(255) | Y |  |  |
| fee_0 | varchar(100) | Y |  |  |
| fee_amount_0 | varchar(100) | Y |  |  |
| fee_1 | varchar(100) | Y |  |  |
| fee_amount_1 | varchar(100) | Y |  |  |
| fee_2 | varchar(100) | Y |  |  |
| fee_amount_2 | varchar(100) | Y |  |  |
| fee_3 | varchar(100) | Y |  |  |
| fee_amount_3 | varchar(100) | Y |  |  |
| fee_4 | varchar(100) | Y |  |  |
| fee_amount_4 | varchar(100) | Y |  |  |
| paymentamount_receipt | varchar(255) |  |  |  |
| paymentamount2_receipt | varchar(255) |  |  |  |
| paymentamount3_receipt | varchar(255) |  |  |  |
| paymentamount4_receipt | varchar(255) |  |  |  |
| paymentamount5_receipt | varchar(255) |  |  |  |
| debtor_phone | varchar(50) | Y |  |  |
| debtor_email | varchar(50) | Y |  |  |
| prop_door_colour | varchar(50) | Y |  |  |
| prop_door_lock | varchar(50) | Y |  |  |
| sha1_sum_check | varchar(255) | Y |  |  |
| signed_levy | tinyint |  | MUL |  |
| signed_wp | tinyint |  | MUL |  |
| signed_arrangement | tinyint |  | MUL |  |
| signed_cga | varchar(255) |  |  |  |
| custom1 | varchar(100) |  | MUL |  |
| custom2 | varchar(100) |  |  |  |
| custom3 | varchar(100) |  |  |  |
| custom4 | varchar(100) |  |  |  |
| custom5 | varchar(100) |  |  |  |
| custom6 | varchar(100) |  |  |  |
| custom7 | varchar(100) |  |  |  |
| custom8 | varchar(100) |  |  |  |
| custom9 | varchar(100) |  |  |  |
| custom10 | varchar(100) |  |  |  |
| custom11 | varchar(100) |  |  |  |
| custom12 | varchar(100) |  |  |  |
| custom13 | varchar(100) |  |  |  |
| custom14 | varchar(100) |  |  |  |
| custom15 | varchar(100) |  |  |  |

### `rdebt_bailiffreport_images`  — ~0 rows
_Joins:_ `reportid`→`rdebt_reports`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| image_id | int |  | PRI |  |
| reportid | int |  | MUL | `rdebt_reports` |
| image_url | varchar(200) |  |  |  |
| title | varchar(200) |  |  |  |
| approved | tinyint |  | MUL |  |
| filename | varchar(255) | Y |  |  |
| latitude | decimal(10,6) | Y |  |  |
| longitude | decimal(10,6) | Y |  |  |
| is_amazon | tinyint(1) | Y | MUL |  |

### `rdebt_officer_types`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| order | smallint |  | UNI |  |
| abbreviation | varchar(8) | Y |  |  |

### `rdebt_teams`  — ~0 rows
_Joins:_ `colour_id`→`rdebt_colours`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| colour_id | int |  | MUL | `rdebt_colours` |
| name | varchar(45) |  |  |  |

### `rdebt_teams_users`  — ~0 rows
_Joins:_ `team_id`→`rdebt_teams`, `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| team_id | int |  | MUL | `rdebt_teams` |
| user_id | int |  | MUL | `rdebt_users` |
| role | enum('Member','Leader') |  |  |  |

### `rdebt_user_group`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| created_at | datetime |  |  |  |

### `rdebt_user_group_links`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | int |  | MUL | `rdebt_users` |
| group_id | int |  | MUL |  |
| ordering | int | Y | MUL |  |

### `rdebt_user_groups`  — ~12 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| rug_id | tinyint unsigned |  | PRI |  |
| rug_name | varchar(50) |  |  |  |
| slug | varchar(50) |  |  |  |

### `rdebt_user_scheme_link`  — ~0 rows
_Joins:_ `userid`→`rdebt_users`, `schemeid`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| userid | int |  | MUL | `rdebt_users` |
| schemeid | int |  | MUL | `rdebt_schemes` |

### `rdebt_user_sm_link`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`, `sm_id`→`sms`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | int |  | MUL | `rdebt_users` |
| sm_id | int |  | MUL | `sms` |
| ordering | int |  | MUL |  |

### `rdebt_user_stage_link`  — ~0 rows
_Joins:_ `userid`→`rdebt_users`, `stageid`→`rdebt_stages`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| userid | int |  | MUL | `rdebt_users` |
| stageid | int |  | MUL | `rdebt_stages` |
| ordering | int |  | MUL |  |

### `roles`  — ~6 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| permissions | text |  |  |  |
| settings | text |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `user_roles`  — ~3 rows
_Joins:_ `role_id`→`roles`, `user_id`→`rdebt_users`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| role_id | int |  | MUL | `roles` |
| user_id | int |  | MUL | `rdebt_users` |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `user_session_tab_event_actions`  — ~0 rows
_Joins:_ `user_session_tab_events_id`→`user_session_tab_events`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| unique_id | varchar(255) |  |  |  |
| user_session_tab_events_id | int |  | MUL | `user_session_tab_events` |
| time_started | datetime |  |  |  |
| time_finished | datetime |  |  |  |
| action_time | int |  | MUL |  |
| scope | varchar(255) |  | MUL |  |
| params | text |  |  |  |

### `user_session_tab_events`  — ~0 rows
_Joins:_ `user_session_tab_id`→`user_session_tabs`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| unique_id | varchar(255) |  |  |  |
| user_session_tab_id | int |  | MUL | `user_session_tabs` |
| time_started | datetime |  |  |  |
| time_polled | datetime |  |  |  |
| time_finished | datetime |  |  |  |
| event_time | int |  | MUL |  |
| scope | varchar(255) |  | MUL |  |
| params | text |  |  |  |

### `user_session_tabs`  — ~0 rows
_Joins:_ `user_session_id`→`user_sessions`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| unique_id | varchar(255) |  |  |  |
| user_session_id | int |  | MUL | `user_sessions` |
| time_started | datetime |  |  |  |
| time_polled | datetime |  |  |  |
| time_finished | datetime |  |  |  |
| tab_time | int |  | MUL |  |
| active | tinyint(1) |  | MUL |  |
| in_focus | tinyint(1) |  | MUL |  |

### `user_sessions`  — ~0 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| unique_id | varchar(255) |  |  |  |
| user_id | int |  | MUL | `rdebt_users` |
| successful | tinyint(1) |  | MUL |  |
| login_ip_address | varchar(255) |  |  |  |
| login_user_agent | varchar(255) |  |  |  |
| time_started | datetime |  |  |  |
| time_polled | datetime |  |  |  |
| time_finished | datetime |  |  |  |
| session_time | int |  | MUL |  |
| active | tinyint(1) |  | MUL |  |

### `user_tasks`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| status | varchar(255) |  |  |  |
| type_id | int |  | MUL |  |
| target_date | date |  |  |  |
| target_date_override | date |  |  |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| assigned_to | int |  | MUL |  |
| completed | tinyint(1) |  | MUL |  |
| completed_successfully | tinyint(1) |  | MUL |  |
| completed_at | datetime |  |  |  |
| completed_by | int |  | MUL |  |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `user_token_access`  — ~2,880 rows
_Joins:_ `user_id`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| user_id | int |  | MUL | `rdebt_users` |
| remote_token | varchar(255) |  |  |  |
| authorised | tinyint(1) |  | MUL |  |
| ip_address | varchar(255) |  |  |  |
| user_agent | varchar(255) |  |  |  |
| api_request | text |  |  |  |
| date_accessed | datetime |  |  |  |

## Workflow & alerts


### `activity_signals`  — ~0 rows
_Joins:_ `signal_id`→`signals`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| activity_id | int |  | MUL |  |
| signal_id | int |  | MUL | `signals` |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `alert_activities`  — ~18 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| status | varchar(255) |  |  |  |
| alert_calendar_id | int |  | MUL |  |
| activity_entity_type | varchar(255) |  |  |  |
| activity_entity_id | int |  | MUL |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |
| completed_by | int |  | MUL |  |
| completed_at | datetime |  |  |  |

### `alert_exit_codes`  — ~77 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| successful | tinyint(1) |  | MUL |  |
| is_default | tinyint(1) |  | MUL |  |
| point | int |  |  |  |
| fee | int |  |  |  |

### `alert_exit_codes_items`  — ~81 rows
_Joins:_ `alert_exit_code_id`→`alert_exit_codes`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| alert_exit_code_id | int |  | MUL | `alert_exit_codes` |
| alert_alert_id | int |  | MUL |  |
| position | int |  | MUL |  |
| primary | tinyint(1) |  | MUL |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |

### `rdebt_alert_types`  — ~5 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) | Y |  |  |
| short_name | varchar(255) | Y |  |  |
| image_url | varchar(255) | Y |  |  |
| slug | varchar(255) | Y |  |  |
| currency_code | varchar(10) | Y |  |  |
| hourly_rate | float(5,2) | Y |  |  |

### `rdebt_alerts`  — ~150 rows
_Joins:_ `letter_category_id`→`rdebt_letter_category`, `letter_id`→`rdebt_letter`, `template_id`→`template`, `alert_type_id`→`rdebt_alert_types`, `sms_id`→`sms`, `email_id`→`emails`, `timer_id`→`timers`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| alert_id | int |  | PRI |  |
| alert_stage_id | int |  | MUL |  |
| alert_status_id | int |  | MUL |  |
| days_from_stage_set | smallint |  | MUL |  |
| days_from_status_set | tinyint |  | MUL |  |
| alert_message | varchar(255) |  |  |  |
| letter_link | tinyint |  | MUL |  |
| letter_category_id | int |  | MUL | `rdebt_letter_category` |
| letter_id | int |  | MUL | `rdebt_letter` |
| send_email | tinyint |  | MUL |  |
| whotoemail | tinyint |  | MUL |  |
| alert_del_message | varchar(255) |  |  |  |
| link_to_bailiff_form | tinyint |  | MUL |  |
| link_to_visit_report | varchar(50) |  |  |  |
| slug | varchar(255) | Y | MUL |  |
| auto_create_letter | tinyint(1) | Y | MUL |  |
| perform_magic | varchar(255) | Y |  |  |
| move_to_stage | int | Y | MUL |  |
| search_id | int | Y | MUL |  |
| template_id | int | Y | MUL | `template` |
| delay_action | int | Y | MUL |  |
| before_insert_action_id | int | Y | MUL |  |
| default_action_id | int | Y | MUL |  |
| after_remove_action_id | int | Y | MUL |  |
| after_complete_action_id | int | Y | MUL |  |
| auto_remove_alert_letter | tinyint(1) | Y | MUL |  |
| alert_type_id | int | Y | MUL | `rdebt_alert_types` |
| sms_id | int | Y | MUL | `sms` |
| email_id | int | Y | MUL | `emails` |
| ignore_auto_complete | tinyint(1) |  | MUL |  |
| automatic_processing | tinyint(1) |  | MUL |  |
| prevent_duplicate | tinyint(1) | Y |  |  |
| maximum_instances | int |  | MUL |  |
| maximum_successful_instances | int |  | MUL |  |
| maximum_unsuccessful_instances | int |  | MUL |  |
| capping_strategy | varchar(255) |  |  |  |
| target_date_offset | int |  | MUL |  |
| target_date_offset_type | varchar(255) |  |  |  |
| target_date_offset_case_driven | varchar(255) |  |  |  |
| estimated_handling_time | int |  | MUL |  |
| form_id | int |  | MUL |  |
| factory_sticky | int |  | MUL |  |
| timer_id | int |  | MUL | `timers` |
| timer_minutes | int |  | MUL |  |
| timer_notes | varchar(255) |  |  |  |
| sort_order | int |  | MUL |  |
| active | tinyint(1) |  | MUL |  |
| alert_priority | int |  |  |  |
| options | text |  |  |  |

### `rdebt_alerts_roles`  — ~5 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| ar_alert_id | int |  | MUL |  |
| ar_role_id | int |  | MUL |  |

### `rdebt_alerts_users`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| au_user_id | int |  | MUL |  |
| au_alert_id | int |  | MUL |  |

### `rdebt_event_action_mapping`  — ~45 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int unsigned |  | PRI |  |
| event_code | int |  | UNI |  |
| event_name | varchar(255) |  |  |  |
| action_code | varchar(255) |  |  |  |
| action_name | varchar(255) |  |  |  |

### `rdebt_events`  — ~0 rows
_Joins:_ `template_id`→`template`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| event_id | int |  | PRI |  |
| event_name | varchar(50) |  |  |  |
| slug | varchar(25) |  |  |  |
| event_action_id | int |  | MUL |  |
| score_effectiveness | float |  |  |  |
| score_effort | float |  |  |  |
| score_profit | float |  |  |  |
| template_id | int |  | MUL | `template` |
| permissions | varchar(255) |  |  |  |
| priority | varchar(255) |  |  |  |
| item_col | varchar(50) |  |  |  |
| item_table | varchar(50) |  |  |  |
| set_id | int | Y | MUL |  |
| icon | varchar(75) | Y |  |  |
| event_type | varchar(75) | Y |  |  |
| connected_type | varchar(75) | Y |  |  |

### `rdebt_stage_process_type`  — ~0 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |

### `rdebt_stage_results`  — ~0 rows
_Joins:_ `result_id`→`rdebt_results`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| sr_id | int |  | PRI |  |
| stage_id_start | int |  | MUL |  |
| status_id_start | int |  | MUL |  |
| result_id | int |  | MUL | `rdebt_results` |
| new_stage | int |  | MUL |  |
| perform_magic | varchar(100) |  |  |  |

### `rdebt_stage_type`  — ~5 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| stage_type | varchar(255) |  |  |  |

### `signals`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| signal_type | varchar(255) |  |  |  |
| signal_id | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `timers`  — ~0 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| description | text |  |  |  |
| start_offset_type | varchar(255) |  |  |  |
| start_offset_period | int |  | MUL |  |
| end_offset_type | varchar(255) |  |  |  |
| end_offset_period | int |  | MUL |  |
| created_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_at | datetime |  |  |  |
| updated_by | int |  | MUL | `rdebt_users` |

### `workflow_decision_conditions`  — ~167 rows
_Joins:_ `workflow_decision_id`→`workflow_decisions`, `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| workflow_decision_id | int |  | MUL | `workflow_decisions` |
| field_1 | varchar(255) |  |  |  |
| operation | varchar(255) |  |  |  |
| field_2 | varchar(255) |  |  |  |
| field_2_plain | smallint |  | MUL |  |
| link_previous | tinyint(1) |  | MUL |  |
| condition | varchar(255) |  |  |  |
| ordering | int |  | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |

### `workflow_decisions`  — ~93 rows
_Joins:_ `created_by`→`rdebt_users`, `updated_by`→`rdebt_users`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| data_type | varchar(255) |  |  |  |
| data_id | int |  | MUL |  |
| created_at | datetime |  |  |  |
| updated_at | datetime |  |  |  |
| created_by | int |  | MUL | `rdebt_users` |
| updated_by | int |  | MUL | `rdebt_users` |

### `workflow_result_action_links`  — ~105 rows
_Joins:_ `workflow_result_id`→`workflow_results`, `workflow_result_action_id`→`workflow_result_actions`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| workflow_result_id | int |  | MUL | `workflow_results` |
| workflow_result_action_id | int |  | MUL | `workflow_result_actions` |
| result | tinyint(1) |  | MUL |  |

### `workflow_result_actions`  — ~105 rows

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| action_name | varchar(255) |  |  |  |
| action_value | text |  |  |  |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |

### `workflow_result_decision_links`  — ~110 rows
_Joins:_ `workflow_result_id`→`workflow_results`, `workflow_decision_id`→`workflow_decisions`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| workflow_result_id | int |  | MUL | `workflow_results` |
| workflow_decision_id | int |  | MUL | `workflow_decisions` |
| ordering | int |  | MUL |  |

### `workflow_result_logs`  — ~43 rows
_Joins:_ `case_id`→`rdebt_cases`, `stage_id`→`rdebt_stages`, `scheme_id`→`rdebt_schemes`, `workflow_decision_condition_id`→`workflow_decision_conditions`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| case_id | int |  | MUL | `rdebt_cases` |
| stage_id | int |  | MUL | `rdebt_stages` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| workflow_decision_condition_id | int |  | MUL | `workflow_decision_conditions` |
| field_1 | varchar(255) |  |  |  |
| operation | varchar(255) |  |  |  |
| field_2 | varchar(255) |  |  |  |
| operation_result | varchar(255) |  |  |  |
| condition | varchar(255) | Y |  |  |
| calculation_result | varchar(255) | Y |  |  |
| result | varchar(255) |  |  |  |
| created | datetime |  |  |  |

### `workflow_results`  — ~82 rows
_Joins:_ `stage_id`→`rdebt_stages`, `scheme_id`→`rdebt_schemes`

| Column | Type | Null | Key | → |
|---|---|---|---|---|
| id | int |  | PRI |  |
| name | varchar(255) |  |  |  |
| stage_id | int |  | MUL | `rdebt_stages` |
| scheme_id | int |  | MUL | `rdebt_schemes` |
| created | datetime |  |  |  |
| updated | datetime |  |  |  |
| is_event | tinyint(1) |  | MUL |  |
| event_name | varchar(255) |  |  |  |
| scheme_manager | varchar(255) | Y |  |  |