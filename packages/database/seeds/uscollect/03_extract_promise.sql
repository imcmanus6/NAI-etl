SET sql_mode='';
SELECT id, case_id, amount, IF(active=1,'t','f'), IF(is_settlement=1,'t','f'), IFNULL(NULLIF(first_date,'0000-00-00'),'NULL'), IFNULL(NULLIF(last_due_date,'0000-00-00'),'NULL') FROM rdebt_arrangements;
